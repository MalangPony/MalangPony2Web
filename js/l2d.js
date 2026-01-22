/*
 * Handles all Live2D logic.
 * 
 * Makes extensive use of PIXI v6 framework
 * and pixi-live2d-display library.
 */

import * as Config  from "./config.js";
import * as PerformanceManager from "./perfmanager.js";
import {FPS_Counter} from "./utils.js";
import { Vector2, Vector3 } from "./vectors.js";
import { AnimatedValue } from "./animator.js";

// Grab DOM
const master_hanmari_container = document.getElementById("master-hanmari-container");
const l2d_container = document.getElementById("l2d-container");
const l2d_canvas = document.getElementById("l2d-canvas");
const wsd = document.getElementById("whole-screen-div");
const l2d_load_overlay = document.getElementById("l2d-load-overlay");
const button_hide = document.getElementById("l2d-button-hide");
const button_hide_symbol_off = document.getElementById("l2d-button-hide-off");
const button_hide_symbol_on = document.getElementById("l2d-button-hide-on");

const debug_vmp = document.getElementById("debug-print-virtual-mouse-pos");
const debug_gyro_raw = document.getElementById("debug-print-gyro-raw");
const debug_gyro_corrected = document.getElementById("debug-print-gyro-corrected");
const debug_mix_ratio = document.getElementById("debug-print-vm-mix-ratio");
const debug_inactive_timer = document.getElementById("debug-print-mouse-inactive-timer");

// PIXI Setup.
PIXI.Ticker.shared.autoStart=false;
export let app = null;
if (Config.OPTION_ENABLE_L2D_HANMARI){
	app = new PIXI.Application({
		view:l2d_canvas,
		autoStart: true,
		backgroundAlpha: 0, 
		sharedTicker:true
	});
}

// Disable internal ticker. We will update fully manually.
PIXI.Ticker.shared.stop();
// This function should be called every frame.
function pixi_manual_update(){
	if (PerformanceManager.check_feature_enabled(
			PerformanceManager.Feature.HANMARI_L2D))
		PIXI.Ticker.shared.update();
}

// Load model. Disable default eye tracking.
export let model = null;
if (Config.OPTION_ENABLE_L2D_HANMARI){
	model=PIXI.live2d.Live2DModel.fromSync(
		"L2D-model/Hanmari-IZuchi/마리live2d.model3.json",
		{autoInteract:false});
}

// Stop/Start main draw loop on feature disable/enable.
PerformanceManager.register_feature_disable_callback(
	PerformanceManager.Feature.HANMARI_L2D, ()=>{
		l2d_container.style.display="none";
	}
);
PerformanceManager.register_feature_enable_callback(
	PerformanceManager.Feature.HANMARI_L2D, ()=>{
		l2d_container.style.display="block";
	}
);

// FPS counter.
export let fpsc = new FPS_Counter();
if (Config.OPTION_ENABLE_L2D_HANMARI){
	PIXI.Ticker.shared.add(()=>{
		fpsc.frame();
	});
}

// Setup PIXI Filters
if (Config.OPTION_ENABLE_L2D_HANMARI){
	// Just an empty filter.
	class CopyFilter extends PIXI.Filter{
	}

	const DARKENER_FRAGMENT_SHADER=`
	varying vec2 vTextureCoord;

	uniform sampler2D uSampler;

	uniform float muliplier;
	uniform float lift;

	void main(void){
		vec4 currentColor = texture2D(uSampler, vTextureCoord);
		float liftValue=lift*currentColor.a; //It's premultiplied or something
		gl_FragColor = vec4(
			clamp(currentColor.r*muliplier+liftValue,0.0,1.0), 
			clamp(currentColor.g*muliplier+liftValue,0.0,1.0), 
			clamp(currentColor.b*muliplier+liftValue,0.0,1.0), 
			currentColor.a);
	}
	`
	// Applies below formula to all pixels. RGB=0.0~1.0
	// outRGB = inRGB * multiplier + lift
	// Alpha is unaffected.
	class LinearFilter extends PIXI.Filter{
		constructor(){
			super(PIXI.Filter.defaultVertexSrc,
				DARKENER_FRAGMENT_SHADER,
				{muliplier:0,lift:0});
			this.uniforms.muliplier=0;
			this.uniforms.lift=0;
		}
		set multiplier(f){
			this.uniforms.muliplier=f;
		}
		set lift(f){
			this.uniforms.lift=f;
		}
		
		apply(filterManager, input, output, clearMode, _currentState){
			super.apply(
				filterManager, 
				input, output, 
				clearMode, _currentState);
		}
	}

	const MIX_BY_ALPHA_FRAGMENT_SHADER=`
	varying vec2 vTextureCoord;

	uniform sampler2D uSampler;
	uniform sampler2D imageA;
	uniform sampler2D imageB;

	uniform float alpha_ramp_exponent;
	uniform float override_factor;
	uniform float override_ratio;

	void main(void){
		vec4 colorMap = texture2D(uSampler, vTextureCoord);
		vec4 colorA = texture2D(imageA, vTextureCoord);
		vec4 colorB = texture2D(imageB, vTextureCoord);
		float mixRatio=pow(colorMap.a,alpha_ramp_exponent);
		mixRatio=mixRatio*(1.0-override_factor)+override_ratio*override_factor;
		gl_FragColor = mix(colorA, colorB, mixRatio);
	}
	`
	// Mix imageA and imageB, mix ratio determined by input's alpha channel.
	class MixByAlphaFilter extends PIXI.Filter{
		constructor(){
			super(PIXI.Filter.defaultVertexSrc,
				MIX_BY_ALPHA_FRAGMENT_SHADER,
				{imageA:null,imageB:null,
				alpha_ramp_exponent:1.0,
				override_ratio:0.0,override_factor:0.0
				});
		}
		set imageA(rtx){
			this.uniforms.imageA=rtx;
		}
		set imageB(rtx){
			this.uniforms.imageB=rtx;
		}
		set alpha_ramp_exponent(f){
			this.uniforms.alpha_ramp_exponent=f;
		}
		set override_ratio(f){
			this.uniforms.override_ratio=f;
		}
		set override_factor(f){
			this.uniforms.override_factor=f;
		}
		
		apply(filterManager, input, output, clearMode, _currentState){
			super.apply(
				filterManager, 
				input, output, 
				clearMode, _currentState);
		}
	}
	
	// Combines multiple filters together.
	class CompositeFilter extends PIXI.Filter{
		filterBlur=null;
		filterDarken=null;
		filterLighten=null;
		filterMBA=null;
		filterCopier=null;
		constructor(){
			super();
			
			this.filterBlur = new PIXI.filters.BlurFilter(8);
			this.filterDarken = new LinearFilter();
			this.filterLighten = new LinearFilter();
			this.filterMBA = new MixByAlphaFilter();
			this.filterCopier = new CopyFilter();
		}
		
		// How dark should the shadows get? 0.0~1.0
		darken_factor=0.5;
		// Apply exponent to alpha channel after blur.
		// Makes it easy to tweak how the edge looks
		// without having to up the blur radius.
		alpha_ramp_exponent=4.0;
		// Lit-up area RGB = original RGB * (1+factor) + lift
		lighten_factor=0.5;
		lighten_lift=0.3;
		
		master_darken_strength=1.0;
		master_lighten_strength=1.0
		set darken_factor(f){
			this.darken_factor=f;
		}
		set alpha_ramp_exponent(f){
			this.alpha_ramp_exponent=f;
		}
		set lighten_multiplier(f){
			this.lighten_factor=f;
		}
		set lighten_lift(f){
			this.lighten_lift=f;
		}
		
		set darken_strength(f){
			this.master_darken_strength=f;
		}
		set lighten_strength(f){
			this.master_lighten_strength=f;
		}
		
		apply(filterManager, original, final_out, clearMode, _currentState){
			this.filterDarken.multiplier=1-this.darken_factor*this.master_darken_strength;
			this.filterMBA.alpha_ramp_exponent=this.alpha_ramp_exponent;
			this.filterLighten.multiplier=this.lighten_factor;
			this.filterLighten.lift=this.lighten_lift;
			this.filterMBA.override_factor=1-this.master_lighten_strength;
			this.filterMBA.override_ratio=1.0;
			
			let texDarkened=filterManager.getFilterTexture(original);
			this.filterDarken.apply(
				filterManager, 
				original, texDarkened, 
				PIXI.CLEAR_MODES.CLEAR, _currentState);
			
			let texLightened=filterManager.getFilterTexture(original);
			this.filterLighten.apply(
				filterManager, 
				original, texLightened, 
				PIXI.CLEAR_MODES.CLEAR, _currentState);
			
			// Blur filter modifies the original texture!
			// So we gotta copy the texture.
			// There's probably a better way of doing this.
			let texBlurIntermediate=filterManager.getFilterTexture(original);
			this.filterCopier.apply(
				filterManager, 
				original, texBlurIntermediate, 
				PIXI.CLEAR_MODES.CLEAR, _currentState)
			
			let texBlurred=filterManager.getFilterTexture(original);
			this.filterBlur.apply(
				filterManager, 
				texBlurIntermediate, texBlurred, 
				PIXI.CLEAR_MODES.CLEAR, _currentState)
			
			this.filterMBA.imageA=texLightened;//original;
			this.filterMBA.imageB=texDarkened;
			this.filterMBA.apply(
				filterManager, 
				texBlurred, final_out, 
				PIXI.CLEAR_MODES.CLEAR, _currentState)
			
			// Clean up intermediate textures
			// Without these, we get memory leakage!
			// Such memory leaks result in weird performance degradation
			// that doesn't show up easily in process monitors.
			texDarkened.destroy(true);
			texLightened.destroy(true);
			texBlurIntermediate.destroy(true);
			texBlurred.destroy(true);
		}
	}
	if (Config.OPTION_ENABLE_L2D_FILTERS)
		var cf=new CompositeFilter();
}

// Run when loaded
let is_loaded=false;
model?.once("load", ()=>{
	app.stage.addChild(model);
	is_loaded=true;
	load_internals();
	if (Config.OPTION_ENABLE_L2D_FILTERS && PerformanceManager.check_feature_enabled(PerformanceManager.Feature.L2D_FILTERS))
		model.filters=[cf];
	auto_resize_model();
	apply_state(null,true);
	l2d_load_overlay.style.display="none";
});


// PerfManager L2D Filters
PerformanceManager.register_feature_disable_callback(
	PerformanceManager.Feature.L2D_FILTERS, ()=>{
		if (!is_loaded) return;
		model.filters=[];
	}
);
PerformanceManager.register_feature_enable_callback(
	PerformanceManager.Feature.L2D_FILTERS, ()=>{
		if (!is_loaded) return;
		if (Config.OPTION_ENABLE_L2D_FILTERS)
			model.filters=[cf];
	}
);



// Canvas Pixel Multiplier
let resolution_multiplier=1.0;
export function set_resolution_multiplier(f){
	resolution_multiplier=f;
	resize_canvas_to_fit();
	auto_resize_model();
}
function resize_canvas_to_fit(){
	let w=l2d_container.clientWidth;
	let h=l2d_container.clientHeight;
	app.renderer.resize(
		Math.round(w*resolution_multiplier),
		Math.round(h*resolution_multiplier))
};
PerformanceManager.register_feature_disable_callback(
	PerformanceManager.Feature.L2D_HIRES, ()=>{
		set_resolution_multiplier(0.5);});
PerformanceManager.register_feature_enable_callback(
	PerformanceManager.Feature.L2D_HIRES, ()=>{
		set_resolution_multiplier(1.0);});


// Size multiplier. Changed in animationTick() to match the AnimatedValue
let hanmari_size_multiplier = 1.0;

let hanmari_size_multiplier_AV = new AnimatedValue(hanmari_size_multiplier);
hanmari_size_multiplier_AV.duration=1.0;
hanmari_size_multiplier_AV.set_ease(3,true,true);

let hanmari_size_diminisher_AV = new AnimatedValue(1.0);



export function set_hanmari_size(fac){
	hanmari_size_multiplier_AV.animate_to(fac);
	l2d_load_overlay.style.setProperty("--l2d-scale",fac);
}
export function set_hanmari_size_instant(fac){
	hanmari_size_multiplier_AV.jump_to(fac);
	l2d_load_overlay.style.setProperty("--l2d-scale",fac);
}

// Automatically try to fit the model in the canvas.
function auto_resize_model(){
	if (!is_loaded) return;
	let w=l2d_container.clientWidth;
	let h=l2d_container.clientHeight;
	let min=w<h?w:h;
	let scale=min/1700*resolution_multiplier*hanmari_size_multiplier;
	let pivot_point=new Vector2(1700,1700);
	let pivot_target=new Vector2(w,h);
	let current_pivot=pivot_point.multiply(scale);
	let offset=pivot_target.multiply(resolution_multiplier).subtract(current_pivot);
	
	model.scale.set(scale);
	model.position.x=offset.x;
	model.position.y=offset.y;
}

// run auto_resize on canvas resize
let rso= new ResizeObserver(()=>{
	resize_canvas_to_fit();
	auto_resize_model();
});
rso.observe(l2d_container);
resize_canvas_to_fit();
auto_resize_model();

// Change filter parameters.
export function set_lighten_strength(f){
	if (!Config.OPTION_ENABLE_L2D_HANMARI) return;
	if (!PerformanceManager.check_feature_enabled(
		PerformanceManager.Feature.HANMARI_L2D)) return;
	if (!Config.OPTION_ENABLE_L2D_FILTERS) return;
	
	cf.lighten_strength=f;
}
export function set_darken_strength(f){
	if (!Config.OPTION_ENABLE_L2D_HANMARI) return;
	if (!PerformanceManager.check_feature_enabled(
		PerformanceManager.Feature.HANMARI_L2D)) return;
	if (!Config.OPTION_ENABLE_L2D_FILTERS) return;
	
	cf.darken_strength=f;
}

// We are going into the library internals.
// Probably not a good idea?
// Source: https://github.com/guansss/pixi-live2d-display/blob/master/src/cubism-common/FocusController.ts
export let focus_controller=null;
let core_model=null;
let internal_model=null;
let motion_manager=null;
// Called once the model is loaded
function load_internals(){
	internal_model=model.internalModel;
	focus_controller=internal_model.focusController;
	core_model=internal_model.coreModel;
	motion_manager=internal_model.motionManager;
}
function get_model_focus_controller(){
	return focus_controller;
}

// Change body angle
function setX(angle){
	if (!is_loaded) return;
	core_model.addParameterValueById(internal_model.idParamAngleZ,angle);
}
function setY(angle){
	if (!is_loaded) return;
	core_model.addParameterValueById(internal_model.idParamAngleZ,angle);
}
function setZ(angle){
	if (!is_loaded) return;
	core_model.addParameterValueById(internal_model.idParamAngleZ,angle);
}


let playing_motion_priority=-100;
let queued_motion_group_name="";
let requeue_available_after=-1;
// Play motion. Selects a random animation in the motion_name group.
// If the currently playing motion has lower OR EQUAL priority,
// the currently playing motion is immediately stopped.
// This makes it so that if playMotion is called with the same priority rapidly,
// We get rapidly playing motion. (It's funnier this way, I promise)
// If requeuable_after is set, this animation can only be overwritten
// BY AN ANIMATION WITH THE SAME PRIORITY (if priority differs, this limit is not applied)
// only after requeuable_after milliseconds.
// This is mostly done to make spam-clicking less jittery.
// Returns true if motion was actually played.
export function playMotion(motion_name,priority=0,requeuable_after=-1){
	if (!is_loaded) return false;
	let t=performance.now();
	// Are we playing ANYTHING?
	let playing_anything=motion_manager.playing ;
	// Are we plaing the animation we queued?
	// If not, we might be playing an idle animation.
	let same_anim=(motion_manager.state.currentGroup == queued_motion_group_name);
	// Are we playing the queued animation?
	let playing_queued=playing_anything && same_anim;
	// Are we trying to play a higher-priority animation?
	let higher_priority=(priority>playing_motion_priority);
	// Or an equal-priority animation?
	let equal_priority=(priority===playing_motion_priority);
	// If equal priority, can we overwrite?
	let overwritable=(t>=requeue_available_after);
	
	// Actually determine if we should play this animation.
	let queueing_success=false;
	if (!playing_queued) queueing_success=true;
	if (higher_priority) queueing_success=true;
	if (equal_priority && overwritable)queueing_success=true;
	
	if (queueing_success){ 
		motion_manager.stopAllMotions();
		playing_motion_priority=priority;
		queued_motion_group_name=motion_name;
		if (requeuable_after>0) requeue_available_after=t+requeuable_after;
		motion_manager.startRandomMotion(motion_name);
		return true;
	}
	return false;
}
function is_idling(){
	if (!is_loaded) return false;
	if (!motion_manager.playing) return true;
	if (motion_manager.state.currentGroup == motion_manager.groups.idle) return true;
	return false;
}


// Play motion, overriding everything.
// The priority will be reset. 
export function playMotionNow(motion_name){
	playing_motion_priority=0;
	queued_motion_group_name="";
	requeue_available_after=-1;
	motion_manager.stopAllMotions();
	motion_manager.startRandomMotion(motion_name);
}

// Call with the canvas-local coordinates of the click.
// Will return true if the collision check succeeded.
function canvas_clicked(relX,relY){
	let canvas_coord_X=l2d_canvas.width*relX;
	let canvas_coord_Y=l2d_canvas.height*relY;

	if (!is_loaded) return;
	if (!Config.OPTION_ENABLE_L2D_HANMARI) return;
	if (!PerformanceManager.check_feature_enabled(
		PerformanceManager.Feature.HANMARI_L2D)) return;
	
	let hit_areas=model.hitTest(canvas_coord_X,canvas_coord_Y);
	if (hit_areas.length>0){
		hanmari_clicked(hit_areas[0]);
		return true;
	}
	return false;
}
function canvas_test(relX,relY){
	let canvas_coord_X=l2d_canvas.width*relX;
	let canvas_coord_Y=l2d_canvas.height*relY;
	
	if (!is_loaded) return "";
	if (!Config.OPTION_ENABLE_L2D_HANMARI) return "";
	if (!PerformanceManager.check_feature_enabled(
		PerformanceManager.Feature.HANMARI_L2D)) return "";
	
	let hit_areas=model.hitTest(canvas_coord_X,canvas_coord_Y);
	if (hit_areas.length>0){
		return hit_areas[0];
	}
	return "";
}

let last_action;
let random_action_interval;
// Call this whenever there's an activity.
// This will delay the random motion.
function postpone_random_motion(){
	last_action=performance.now();
}

// Re-roll the random action timer.
function rand_interval_roll(){
	random_action_interval=(
		Config.OPTION_L2D_RANDOM_ACTION_MIN_INTERVAL_SECONDS+
		Config.OPTION_L2D_RANDOM_ACTION_RAND_ADD_SECONDS*Math.random()
		)*1000;
}

// A page load is an activity.
postpone_random_motion();
rand_interval_roll();

function calculate_seconds_since_last_activity(){
	return (performance.now()-last_action)/1000;
}


// Check and play random motion.
function hanmari_random_action_check(){
	let t=performance.now();
	if (t>last_action+random_action_interval){
		// Random actions can only be done at the GROUND state.
		if (current_state!=STATE_GROUND) return;
		let r=Math.random();
		
		if ((seconds_since_last_significant_mouse_movement()>Config.L2D_SLEEP_MINIMUM_TIME_SECONDS) && 
			(Math.random()<Config.L2D_RANDOM_ACTION_SLEEP_TRANSITION_PROBABILITY))
				apply_state(STATE_SLEEP);
		else if (r<0.33) playMotion("Random",1,100);
		else if (r<0.66) playMotion("Surprised",1,100);
		else playMotion("Tilt",1,100);
		
		postpone_random_motion();
		rand_interval_roll();
	}
}

export function wake_hanmari_if_possible(){
	if(current_state==STATE_SLEEP)
		apply_state(currently_on_ground?STATE_GROUND:STATE_SKY);
	postpone_random_motion();
}

let click_counter=0;
// Play special animation if clicked more than 5 times.
function hanmari_clicked(region){
	if (current_state==STATE_SKY){
		temporarily_stare_at_mouse();
		playMotion("SkyClick",5,500);
	}else if(current_state==STATE_SLEEP){
		apply_state(currently_on_ground?STATE_GROUND:STATE_SKY);
	}else if(current_state==STATE_PET){
		// ignore
	}else{
		if (click_counter>=5){
			playMotion("Annoyed",10,500);
			click_counter=0;
		}else if (region=="Body"){
			if (playMotion("ClickAlt",5,300)) click_counter++;;
		}else if (region=="Head"){
			if (playMotion("Clicked",5,300)) click_counter++;;
		}else{
			console.log("Invalid click region: "+region);
		}
	}
	postpone_random_motion();
}
// The click counter decays by 1 every 2 seconds.
window.setInterval(()=>{
	click_counter=Math.max(0,click_counter-1);},2000);


// The below code would be more straightforward...
/*
l2d_canvas.style.pointerEvents="auto";
l2d_canvas.addEventListener("click",hanmari_clicked);
*/
// BUT we use the code below to detect clicks instead
// because if we use the code above, all mouse events will be captured
// by the canvas if the pointer is over the canvas.
// This makes it so you can't scroll the page if you are hovering over the canvas.
// So we use the event listener on the window object 
// since that doesn't prevent any mouse events from reaching other elements.
window.addEventListener("click",(e)=>{mouse_events_handler(e,true);});


const PET_ACCUM_ADD_MULTIPLIER=3.0; // per canvas-relative UV coords
const PET_ACCUM_DECAY_SPEED=1.0; // per second
const PET_ACCUM_MAX=1.5;
const PET_ACCUM_ENTER_THRESH=1.4;
const PET_ACCUM_EXIT_THRESH=1.0;

let petting_accumulator=0.0;

let last_petting_mouse_position=null;
// For petting and cursor change
window.addEventListener("mousemove",(e)=>{mouse_events_handler(e,false);});
window.addEventListener("mousedown",(e)=>{mouse_events_handler(e,false);});
window.addEventListener("mouseup",(e)=>{mouse_events_handler(e,false);});
window.addEventListener("mouseleave",(e)=>{mouse_events_handler(e,false);});

function mouse_events_handler(e,was_click){
	wsd.style.cursor="unset";
	if (!Config.OPTION_ENABLE_L2D_HANMARI) return;
	if (!PerformanceManager.check_feature_enabled(
		PerformanceManager.Feature.HANMARI_L2D)) return;
	if (canvas_hidden) return;
	let bbox=l2d_canvas.getBoundingClientRect();
	let localX=e.clientX-bbox.left;
	let localY=e.clientY-bbox.top;
	let w=bbox.width;
	let h=bbox.height;
	let relativeX=localX/w;
	let relativeY=localY/h;
	if ((localX>0) && (localX<w) && (localY>0) && (localY<h)) {
		
		if (was_click){
			let valid_hit=canvas_clicked(relativeX,relativeY);
			if (valid_hit) e.stopPropagation();
		}
		
		// ANY mouse button is a-okay
		let mouse_button_any = (e.buttons != 0);
		
		let hit=canvas_test(relativeX,relativeY);
		
		if (hit=="Head"){
			if (current_state==STATE_SLEEP) wsd.style.cursor="help";
			else if (current_state==STATE_PET) wsd.style.cursor="grab";
			else if (mouse_button_any)  wsd.style.cursor="grab";
			else wsd.style.cursor="pointer";
		}else if (hit=="Body"){
			if (current_state==STATE_SLEEP) wsd.style.cursor="help";
			else if (current_state==STATE_PET) wsd.style.cursor="grab";
			else wsd.style.cursor="pointer";
		}else{
			wsd.style.cursor="unset";
		}
		
		
		
		if (mouse_button_any && (hit=="Head")){ 
			let mouse_pos_vec = new Vector2(relativeX,relativeY);
			
			if (last_petting_mouse_position==null) last_petting_mouse_position=mouse_pos_vec;
			else{
				let delta=mouse_pos_vec.subtract(last_petting_mouse_position).length();
				petting_accumulator+=delta*PET_ACCUM_ADD_MULTIPLIER;
				last_petting_mouse_position=mouse_pos_vec;
			}
		}else last_petting_mouse_position=null;
	}else{
		last_petting_mouse_position=null;
	}
}




// We lerp the look_at direction before applying.
let last_lookat_time=performance.now();
let last_lookat_pos=Vector2.ZERO;

// We use the FocusController::focus() instead of Live2DModel::focus()
// Because the Live2DModel's focus() always goes full tilt in the mouse direction
// And thus we can't look gently or reset the eye position.
// Read the pixi-live2d-display source for more information.
export function look_at(x,y){
	if (!is_loaded) return;
	
	let t=performance.now();
	let dt=(t-last_lookat_time)/1000.0;
	last_lookat_time=t;
	
	let lerp_fac=dt*Config.L2D_EYE_LERP_FACTOR;
	last_lookat_pos=Vector2.lerp(last_lookat_pos,new Vector2(x,y),lerp_fac);
	
	// The last parameter tells the controller to not apply smoothing.
	// The focus controller's internal smoothing is physics-based and it is
	//   prone to oscillations at low framerates.
	// This is why we smooth the motion ourselves.
	get_model_focus_controller().focus(last_lookat_pos.x,last_lookat_pos.y,true);
}

// Staring at the mouse.
let eye_position_mouse=[0,0];
// Staring at the sky
let eye_position_sky=[-0.5,0.5];

function reset_eye_position(){
	eye_position_mouse=[0,0];
}

// Mouse movement activity.
// In order to filter out small movements we use the following algorithm:
// Every time a mouse movement event is received, we add the normalized 
// movement distance to an accumulator.
// When an accumulator reaches a threshold value, an activity event is fired.
// The accumulator decays in a fixed speed, to reject small constant mouse jitters.

// Below three constants were chosen arbitrarily.
const MOUSE_DISTANCE_MULTIPLIER=50.0;
const DECAY_PER_SECOND=1.0;
const ACCUMULATOR_THRESHOLD=1.0;


let last_significant_mouse_movement=performance.now();

// Used for timing out eye tracking.
function seconds_since_last_significant_mouse_movement(){
	return (performance.now()-last_significant_mouse_movement)/1000;
}
// If more than 3 seconds since a significant move, don't do mouse tracking.
function is_mouse_tracking_timed_out(){
	return seconds_since_last_significant_mouse_movement()>3.0;
}

// A click is always significant.
window.addEventListener("click",(e)=>{
	let t=performance.now();
	postpone_random_motion();
	last_significant_mouse_movement=t;
});

let last_canvas_relative_mouse_coords=Vector2.ZERO;
function mouse_movement_handler(mouse_coords){
	if (!Config.OPTION_ENABLE_L2D_HANMARI) return;
	if (!PerformanceManager.check_feature_enabled(
		PerformanceManager.Feature.HANMARI_L2D)) return;
	if (canvas_hidden) return;
	
	// Bounding box of the canvas.
	let bcr=l2d_canvas.getBoundingClientRect();
	
	// Center coordinates of the canvas.
	let canvas_center=new Vector2(bcr.x+bcr.width/2,bcr.y+bcr.height/2);
	
	// Relative coords of the mouse with respect to the canvas center.
	let canvas_rel_mouse_coords=mouse_coords.subtract(canvas_center);
	
	last_canvas_relative_mouse_coords=canvas_rel_mouse_coords;
	unified_movement_handler();
}

// Format [N]umber, with fixed [D]ecimal places, 
//   and padded to be a specific number of [C]haracters.
function fmtN(n,d,c){
	let res=n.toFixed(d);
	if (n>0) res="+"+res;
	return res.padStart(c," ");
}

// We emulate a 'virtual' mouse from the gyro data.
let last_virtual_gyro_mouse_coords=Vector2.ZERO;
window.addEventListener("deviceorientation",(e) => {
	let alpha=e.alpha;
	let beta = e.beta;
	let gamma = e.gamma;
	
	const degtorad = Math.PI / 180; // Degree-to-Radian conversion
	let cX = Math.cos( beta  * degtorad );
	let cY = Math.cos( gamma * degtorad );
	let cZ = Math.cos( alpha * degtorad );
	let sX = Math.sin( beta  * degtorad );
	let sY = Math.sin( gamma * degtorad );
	let sZ = Math.sin( alpha * degtorad );

	let m13 = cY * sZ * sX + cZ * sY;
	let m23 = sZ * sY - cZ * cY * sX;
	
	// I think this value is the X,Y components of the normal vector of the screen.
	let raw=new Vector2(m23,m13);
	debug_gyro_raw.innerHTML="Gyro X:"+fmtN(raw.x,3,6)+" Y:"+fmtN(raw.y,3,6)
	
	// Correct raw data for axis and typical screen tilt
	let corrected=new Vector2(-raw.y,raw.x+0.5);
	
	debug_gyro_corrected.innerHTML="GYC X:"+fmtN(corrected.x,3,6)+" Y:"+fmtN(corrected.y,3,6)
	
	
	last_virtual_gyro_mouse_coords = new Vector2(
		corrected.x*Config.L2D_GYRO_SENSITIVITY_X,
		corrected.y*Config.L2D_GYRO_SENSITIVITY_Y
	);
	unified_movement_handler();
});

let unified_movement_accumulator=0;
let unifiedPositionLast=Vector2.ZERO;
let unifiedEventLastTime=performance.now();

let rel_mouse_last_position=Vector2.ZERO;
let virtual_gyro_mouse_last_position=Vector2.ZERO;
let mouse_gyro_mix_ratio=0.5; // 1 is full gyro. 0 is full mouse.
function unified_movement_handler(){
	let delta_mouse=last_canvas_relative_mouse_coords.subtract(rel_mouse_last_position).length();
	rel_mouse_last_position=last_canvas_relative_mouse_coords;
	
	let delta_vgm = last_virtual_gyro_mouse_coords.subtract(virtual_gyro_mouse_last_position).length();
	virtual_gyro_mouse_last_position=last_virtual_gyro_mouse_coords;
	
	// Determine mix ratio by adding/subtracting the delta values.
	// The one with more movement will win out.
	// For PC, the mouse will win, and for mobile, the gyro will win.
	mouse_gyro_mix_ratio-=delta_mouse/1000.0;
	mouse_gyro_mix_ratio+=delta_vgm/1000.0;
	if (mouse_gyro_mix_ratio<0.0) mouse_gyro_mix_ratio=0.0;
	if (mouse_gyro_mix_ratio>1.0) mouse_gyro_mix_ratio=1.0;
	debug_mix_ratio.innerHTML="0M-G1 Mix: "+mouse_gyro_mix_ratio.toFixed(5);
	
	// No, not THAT crc.
	// Canvas Relative Coordinates.
	// Calculated by mixing Actual mouse and Virtual gyro mouse
	let crc = Vector2.ZERO;
	crc=crc.add(last_canvas_relative_mouse_coords.multiply(1-mouse_gyro_mix_ratio));
	crc=crc.add(last_virtual_gyro_mouse_coords.multiply(mouse_gyro_mix_ratio));
	
	debug_vmp.innerHTML="VMP X:"+fmtN(crc.x,1,6)+" Y:"+fmtN(crc.y,1,6);
	
	// Calculate time delta
	let t=performance.now();
	let dt=(t-unifiedEventLastTime)/1000;
	unifiedEventLastTime=t;
	
	// Calculate mouse delta
	let delta = crc.subtract(unifiedPositionLast);
	unifiedPositionLast=crc;
	
	// Calculate distance
	let screen_dimension_ballpark=Math.min(window.innerHeight,window.innerWidth);
	if (!screen_dimension_ballpark) {
		console.log("Window size invalid");
		screen_dimension_ballpark=1000;
	}
	let distance=delta.length();
	let distance_normalized=distance/screen_dimension_ballpark;
	
	// Add movement to accumulator
	unified_movement_accumulator+=distance_normalized*MOUSE_DISTANCE_MULTIPLIER;
	
	// Subtract decay to accumulator
	let decay_factor=DECAY_PER_SECOND*Math.min(dt,1.0);
	unified_movement_accumulator-=decay_factor;
	if (unified_movement_accumulator<0) unified_movement_accumulator=0;
	
	// Fire activity report when above threshold
	if (unified_movement_accumulator>ACCUMULATOR_THRESHOLD) {
		postpone_random_motion();
		last_significant_mouse_movement=t;
		unified_movement_accumulator=0;
	}
	
	// Eye tracking code from here on
	if (is_mouse_tracking_timed_out()) return;
	
	// Conform the relative coordinates into a -1 ~ +1 range.
	let x=crc.x/500;
	x*=Config.OPTION_L2D_EYE_FOLLOW_SENSITIVITY;
	if (x<-1) x=-1;
	if (x>1) x=1;
	
	let y=crc.y/500;
	y*=-1; // We gotta flip the Y
	y*=Config.OPTION_L2D_EYE_FOLLOW_SENSITIVITY;
	if (y<-1) y=-1;
	if (y>1) y=1;
	eye_position_mouse=[x,y];
}

window.addEventListener("mousemove",(e)=>{
	mouse_movement_handler(new Vector2(e.clientX,e.clientY));
});

if (Config.OPTION_ENABLE_L2D_HANMARI){
	// .body is needed for Firefox apperently
	document.body.addEventListener("mouseleave",(e)=>{
		//Reset eye if mouse left the window
		reset_eye_position();
	});
}

// Should be called by the main JS.
// if stare_strength is 0, hanmari will look at the sky.
// if stare_strength is 1, hanmari will stare at the mouse.
// intermediate values are linearly interpolated.
let stare_strength=0;
export function set_staring_strength(f){
	if (!Config.OPTION_ENABLE_L2D_HANMARI) return;
	if (!PerformanceManager.check_feature_enabled(
		PerformanceManager.Feature.HANMARI_L2D)) return;
	stare_strength=f;
}

let stare_strength_offset = new AnimatedValue(0.0);
stare_strength_offset.delay=1.5;
stare_strength_offset.duration=1.0;
stare_strength_offset.ease_in=true;
stare_strength_offset.ease_out=true;
stare_strength_offset.exponent=3.0;
function temporarily_stare_at_mouse(){
	stare_strength_offset.jump_to(1.0);
	stare_strength_offset.animate_to(0.0);
}



const STATE_SKY=1;
const STATE_GROUND=2;
const STATE_PET=11;
const STATE_SLEEP=12;
const STATE_VOID=90;

let currently_on_ground=false;
export function transition_ground(){
	currently_on_ground=true;
	apply_state(STATE_GROUND);
}
export function transition_sky(){
	currently_on_ground=false;
	apply_state(STATE_SKY);
}

let current_state=STATE_SKY;
function apply_state(new_state=null,instant=false){
	
	let last_state=current_state;
	if (new_state==null) new_state=last_state;
	current_state=new_state;
	
	
	if (!is_loaded) return;
	if (!Config.OPTION_ENABLE_L2D_HANMARI) return;
	
	
	// This assumes at least one of last_state or new_state is STATE_GROUND.
	// This is not necessarily correct, but the L2D motion blending
	// will make things look more or less smooth even when 
	// this assumption is false.
	
	if (!instant){
		if (last_state==STATE_SKY) playMotionNow("SkyToGround");
		else if (new_state==STATE_SKY) playMotionNow("GroundToSky");
		else if (last_state==STATE_PET) playMotionNow("PetExit");
		else if (new_state==STATE_PET) playMotionNow("PetEnter");
		else if (last_state==STATE_SLEEP) playMotionNow("SleepExit");
		else if (new_state==STATE_SLEEP) playMotionNow("SleepEnter");
		else if (last_state==STATE_VOID) playMotionNow("VoidExit");
		else if (new_state==STATE_VOID) playMotionNow("VoidEnter");
	}
	
	let new_idle="";
	
	if (new_state==STATE_SKY) new_idle="IdleSky";
	else if (new_state==STATE_GROUND) new_idle="IdleGround";
	else if (new_state==STATE_PET) new_idle="PettingLoop";
	else if (new_state==STATE_SLEEP) new_idle="SleepingLoop";
	else if (new_state==STATE_VOID) new_idle="ZeroPoseLoop";
	
	motion_manager.groups.idle=new_idle;
	if (instant) playMotionNow(new_idle);
	
	
	postpone_random_motion();
}




// X,Y is in -1 to +1
export function set_sky_eye_position(x,y){
	eye_position_sky=[x,y];
}

const debug_print_pet=document.getElementById("debug-print-pet");
// Actual animation tick.
export function animationTick(dt){
	if (!Config.OPTION_ENABLE_L2D_HANMARI) return;
	if (!PerformanceManager.check_feature_enabled(
		PerformanceManager.Feature.HANMARI_L2D)) return;
	if (canvas_hidden) return;
	
	debug_inactive_timer.innerHTML="Last mvmt "+calculate_seconds_since_last_activity().toFixed(2)+"s ago";
	
	// Animate & apply size
	hanmari_size_multiplier_AV.tick(dt);
	hanmari_size_diminisher_AV.tick(dt);
	let newsize=1.0;
	newsize *= hanmari_size_multiplier_AV.calculate_value(); 
	newsize *= hanmari_size_diminisher_AV.calculate_value();
	let oldsize=hanmari_size_multiplier;
	hanmari_size_multiplier=newsize;
	if (Math.abs(newsize-oldsize)>0.00000001){
		auto_resize_model();
	}
	
	stare_strength_offset.tick(dt)
	let stare_strength_temp=stare_strength+stare_strength_offset.calculate_value();
	if (stare_strength_temp>1) stare_strength_temp=1.0;
	// Apply eye movement
	if (is_mouse_tracking_timed_out()) eye_position_mouse=[0,0];
	if (current_state==STATE_SLEEP) eye_position_mouse=[0,0];
	look_at(
		eye_position_mouse[0]*stare_strength_temp+eye_position_sky[0]*(1-stare_strength_temp),
		eye_position_mouse[1]*stare_strength_temp+eye_position_sky[1]*(1-stare_strength_temp)
	)
	
	petting_accumulator-=PET_ACCUM_DECAY_SPEED*dt;
	if (petting_accumulator>PET_ACCUM_MAX) petting_accumulator=PET_ACCUM_MAX;
	if (petting_accumulator<0) petting_accumulator=0;
	debug_print_pet.innerHTML="PetAcc: "+petting_accumulator.toFixed(3);
	if ((current_state==STATE_GROUND) && 
		(petting_accumulator > PET_ACCUM_ENTER_THRESH))
		apply_state(STATE_PET);
	else if ((current_state==STATE_PET) && 
		(petting_accumulator < PET_ACCUM_EXIT_THRESH))
		apply_state(currently_on_ground?STATE_GROUND:STATE_SKY);
	
	if (petting_accumulator>PET_ACCUM_ENTER_THRESH) postpone_random_motion();
	
	hanmari_random_action_check();
	
	pixi_manual_update();
}


let canvas_hidden=false;

// Hanmari hide/show
function hide_hanmari(){
	hanmari_size_diminisher_AV.stop();
	hanmari_size_diminisher_AV.duration=0.8;
	hanmari_size_diminisher_AV.set_ease(3,true,false);
	hanmari_size_diminisher_AV.animate_to(0.0);
	
	if (current_state !== STATE_SLEEP) apply_state(STATE_VOID);
	
	l2d_canvas.style.opacity=1.0;
	let anim3=l2d_canvas.animate(
		[{ opacity: "1.0" },{ opacity: "0.0" }],
		{duration: 300,delay:500});
	anim3.onfinish= () => {
		l2d_canvas.style.display="none";
		canvas_hidden=true;
	}
}
function hide_hanmari_instant(){
	l2d_canvas.style.display="none";
	hanmari_size_diminisher_AV.jump_to(0.0);
	canvas_hidden=true;
}
function show_hanmari(){
	l2d_canvas.style.display="block";
	canvas_hidden=false;
	
	hanmari_size_diminisher_AV.stop();
	hanmari_size_diminisher_AV.duration=0.8;
	hanmari_size_diminisher_AV.set_ease(3,false,true);
	hanmari_size_diminisher_AV.animate_to(1.0);
	
	current_state=STATE_VOID;
	apply_state(currently_on_ground?STATE_GROUND:STATE_SKY);
	
	l2d_canvas.style.opacity=0.0;
	let anim3=l2d_canvas.animate(
		[{ opacity: "0.0" },{ opacity: "1.0" }],
		{duration: 300,delay:0});
	anim3.onfinish= () => {
		l2d_canvas.style.opacity=1.0;
	}
	reset_eye_position();
}
function show_hanmari_instant(){
	l2d_canvas.style.display="block";
	l2d_canvas.style.opacity=1.0;
	hanmari_size_diminisher_AV.jump_to(1.0);
	canvas_hidden=false;
	apply_state(currently_on_ground?STATE_GROUND:STATE_SKY);
	reset_eye_position();
}

button_hide.addEventListener("click",()=>{
	button_hide.classList.add("hidden");
	if (canvas_hidden){
		show_hanmari();
	}else{
		hide_hanmari();
	}
	window.setTimeout(()=>{
		if (canvas_hidden) {
			button_hide_symbol_on.style.display="inline";
			button_hide_symbol_off.style.display="none";
		}else{
			button_hide_symbol_on.style.display="none";
			button_hide_symbol_off.style.display="inline";
		}
		button_hide.classList.remove("hidden");
	},1000);
	
});
