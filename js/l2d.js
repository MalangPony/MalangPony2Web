import * as Config  from "./config.js";
import * as PerformanceManager from "./perfmanager.js";
import {FPS_Counter} from "./utils.js";
import { Vector2, Vector3 } from "./vectors.js";
import { AnimatedValue } from "./animator.js";

const l2d_container = document.getElementById("l2d-container");
const l2d_canvas = document.getElementById("l2d-canvas");

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
		//"L2D-model/Hanmari-IZuchi-r006d/Hanmari-L2D_Half.model3.json",
		{autoInteract:false});
}

// Stop/Start main draw loop on feature disable/enable.
PerformanceManager.register_feature_disable_callback(
	PerformanceManager.Feature.HANMARI_L2D, ()=>{
		//PIXI.Ticker.shared.stop();
		l2d_container.style.display="none";
	}
);
PerformanceManager.register_feature_enable_callback(
	PerformanceManager.Feature.HANMARI_L2D, ()=>{
		//PIXI.Ticker.shared.start();
		l2d_container.style.display="block";
	}
);


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

let is_loaded=false;
model?.once("load", ()=>{
	app.stage.addChild(model);
	is_loaded=true;
	load_internals();
	//model.filters=[new PIXI.filters.BlurFilter(3)];
	if (Config.OPTION_ENABLE_L2D_FILTERS && PerformanceManager.check_feature_enabled(PerformanceManager.Feature.L2D_FILTERS))
		model.filters=[cf];
	auto_resize_model();
	apply_ground_sky(true);
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

export function set_hanmari_size(fac){
	hanmari_size_multiplier_AV.animate_to(fac);
}
export function set_hanmari_size_instant(fac){
	hanmari_size_multiplier_AV.jump_to(fac);
}

// Automatically try to fit the model in the canvas.
function auto_resize_model(){
	if (!is_loaded) return;
	let w=l2d_container.clientWidth;
	let h=l2d_container.clientHeight;
	let min=w<h?w:h;
	let scale=min/1700*resolution_multiplier*hanmari_size_multiplier;
	//let offset=(1-hanmari_size_multiplier)*resolution_multiplier*100;
	let pivot_point=new Vector2(1700,1700);
	let pivot_target=new Vector2(w,h);
	let current_pivot=pivot_point.multiply(scale);
	let offset=pivot_target.multiply(resolution_multiplier).subtract(current_pivot)
	model.scale.set(scale);
	model.position.x=offset.x;
	model.position.y=offset.y;
}
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
// Yes, I know this is not a good idea.
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
/*
export function stopMotion(){
	if (!is_loaded) return;
	return internal_model.motionManager.stopAllMotions();
}
export function playMotion(motion_name){
	if (!is_loaded) return;
	return internal_model.motionManager.startRandomMotion(motion_name);
}
export function playMotionImmediate(motion_name){
	if (!is_loaded) return;
	stopMotion();
	return playMotion(motion_name);
}*/

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
// Play motion, overriding everything.
// The priority will be reset. 
export function playMotionNow(motion_name){
	playing_motion_priority=0;
	queued_motion_group_name="";
	requeue_available_after=-1;
	motion_manager.stopAllMotions();
	motion_manager.startRandomMotion(motion_name);
}
/*
// Override the idle motion group. Defaults to "Idle".
// A random motion from the group will be queued in after the current motion is done.
export function set_idle_motion(group_name){
	if (!is_loaded) return;
	if (!Config.OPTION_ENABLE_L2D_HANMARI) return;
	if (!PerformanceManager.check_feature_enabled(
		PerformanceManager.Feature.HANMARI_L2D)) return;
	motion_manager.groups.idle=group_name;
}*/

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
		if (currently_on_ground){
			// TODO maybe add click anim for sky state as well?
			hanmari_clicked(hit_areas[0]);
		}
		return true;
	}
	return false;
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

let mouse_movement_accumulator=0;
let mousePositionLast=Vector2.ZERO;
let mouseEventLastTime=performance.now();
let last_significant_mouse_movement=performance.now();
window.addEventListener("mousemove",(e)=>{
	// Calculate time delta
	let t=performance.now();
	let dt=(t-mouseEventLastTime)/1000;
	mouseEventLastTime=t;
	
	// Calculate mouse delta
	let mouse=new Vector2(e.clientX,e.clientY)
	let delta = mouse.subtract(mousePositionLast);
	mousePositionLast=mouse;
	
	// Calculate distance
	let screen_dimension_ballpark=Math.min(window.innerHeight,window.innerWidth);
	if (!screen_dimension_ballpark) {
		console.log("Window size invalid");
		screen_dimension_ballpark=1000;
	}
	let distance=delta.length();
	let distance_normalized=distance/screen_dimension_ballpark;
	
	// Add movement to accumulator
	mouse_movement_accumulator+=distance_normalized*MOUSE_DISTANCE_MULTIPLIER;
	
	// Subtract decay to accumulator
	let decay_factor=DECAY_PER_SECOND*Math.min(dt,1.0);
	mouse_movement_accumulator-=decay_factor;
	if (mouse_movement_accumulator<0) mouse_movement_accumulator=0;
	
	//console.log("EMA "+mouse_movement_accumulator.toFixed(5));
	// Fire activity report when above threshold
	if (mouse_movement_accumulator>ACCUMULATOR_THRESHOLD) {
		//console.log("Mouse activity!")
		postpone_random_motion();
		last_significant_mouse_movement=t;
		mouse_movement_accumulator=0;
	}
});
// A click is always significant.
window.addEventListener("click",(e)=>{
	let t=performance.now();
	postpone_random_motion();
	last_significant_mouse_movement=t;
});
// Used for timing out eye tracking.
function seconds_since_last_significant_mouse_movement(){
	return (performance.now()-last_significant_mouse_movement)/1000;
}


// Check and play random motion.
function hanmari_random_action_check(){
	let t=performance.now();
	if (t>last_action+random_action_interval){
		if (!currently_on_ground) return;
		let r=Math.random();
		
		if (r<0.33) playMotion("Random",1,100);
		else if (r<0.66) playMotion("Surprised",1,100);
		else playMotion("Tilt",1,100);
		
		postpone_random_motion();
		rand_interval_roll();
	}
}

let click_counter=0;
// Play special animation if clicked more than 5 times.
function hanmari_clicked(region){
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
window.addEventListener("click",(e)=>{
	if (!Config.OPTION_ENABLE_L2D_HANMARI) return;
	if (!PerformanceManager.check_feature_enabled(
		PerformanceManager.Feature.HANMARI_L2D)) return;
	let bbox=l2d_canvas.getBoundingClientRect();
	let localX=e.clientX-bbox.left;
	let localY=e.clientY-bbox.top;
	let w=bbox.width;
	let h=bbox.height;
	let relativeX=localX/w;
	let relativeY=localY/h;
	if ((localX>0) && (localX<w) && (localY>0) && (localY<h)) {
		let valid_hit=canvas_clicked(relativeX,relativeY);
		if (valid_hit) e.stopPropagation();
	}
});


// We use the FocusController::focus() instead of Live2DModel::focus()
// Because the Live2DModel's focus() always goes full tilt in the mouse direction
// And thus we can't look gently or reset the eye position.
// Read the pixi-live2d-display source for more information.
export function look_at(x,y){
	if (!is_loaded) return;
	get_model_focus_controller().focus(x,y);
}

// Staring at the mouse.
let eye_position_mouse=[0,0];
// Staring at the sky
let eye_position_sky=[-0.5,0.5];

function is_mouse_tracking_timed_out(){
	return seconds_since_last_significant_mouse_movement()>3.0;
}
if (Config.OPTION_ENABLE_L2D_HANMARI){
	window.addEventListener("mousemove",(e)=>{
		if (is_mouse_tracking_timed_out()) return;
		// All coordinates are in viewport coords.
		let t=performance.now();
		
		// Bounding box of the canvas.
		let bcr=l2d_canvas.getBoundingClientRect();
		
		// Mouse location.
		let mouseX=e.clientX;
		let mouseY=e.clientY;
		
		// Center coordinates of the canvas.
		let centerX=bcr.x+bcr.width/2;
		let centerY=bcr.y+bcr.height/2;
		
		// Relative coords of the mouse with respect to the canvas center.
		let relX=mouseX-centerX;
		let relY=mouseY-centerY;
		
		// Conform the relative coordinates into a -1 ~ +1 range.
		let x=relX/500;
		x*=Config.OPTION_L2D_EYE_FOLLOW_SENSITIVITY;
		if (x<-1) x=-1;
		if (x>1) x=1;
		
		let y=relY/500;
		y*=-1; // We gotta flip the Y
		y*=Config.OPTION_L2D_EYE_FOLLOW_SENSITIVITY;
		if (y<-1) y=-1;
		if (y>1) y=1;
		eye_position_mouse=[x,y];
		//console.log("MouseMove "+x+","+y);
	});
}
if (Config.OPTION_ENABLE_L2D_HANMARI){
	// .body is needed for Firefox apperently
	document.body.addEventListener("mouseleave",(e)=>{
		//Reset eye if mouse left the window
		eye_position_mouse=[0,0];
		//console.log("MouseLeave");
	});
}
// Should be called by the main JS.
let stare_strength=0;
export function set_staring_strength(f){
	if (!Config.OPTION_ENABLE_L2D_HANMARI) return;
	if (!PerformanceManager.check_feature_enabled(
		PerformanceManager.Feature.HANMARI_L2D)) return;
	stare_strength=f;
}

// We do this in two parts, so this won't break even if 
// transition_*() functions are called before the model is loaded.
let currently_on_ground=false;
export function transition_ground(){
	currently_on_ground=true;
	apply_ground_sky();
}
export function transition_sky(){
	currently_on_ground=false;
	apply_ground_sky();
}
function apply_ground_sky(instant=false){
	if (!is_loaded) return;
	if (!Config.OPTION_ENABLE_L2D_HANMARI) return;
	if (currently_on_ground){
		if (!instant) playMotionNow("SkyToGround");
		else playMotionNow("IdleGround");
		motion_manager.groups.idle="IdleGround";
	}
	else{
		if (!instant) playMotionNow("GroundToSky");
		else playMotionNow("IdleSky");
		motion_manager.groups.idle="IdleSky";
	}
	postpone_random_motion();
}

// Pause rendering without any cleanup.
// Intended to be used when hanmari is hidden by the parent.
// (main.js > hide_hanmari() and the like)
let render_paused=false;
export function pause_render(){
	render_paused=true;
}
export function unpause_render(){
	render_paused=false;
}
// X,Y is in -1 to +1
export function set_sky_eye_position(x,y){
	eye_position_sky=[x,y];
}
export function animationTick(dt){
	if (!Config.OPTION_ENABLE_L2D_HANMARI) return;
	if (!PerformanceManager.check_feature_enabled(
		PerformanceManager.Feature.HANMARI_L2D)) return;
	if (render_paused) return;
	
	hanmari_size_multiplier_AV.tick(dt);
	let newsize=hanmari_size_multiplier_AV.calculate_value();
	let oldsize=hanmari_size_multiplier;
	hanmari_size_multiplier=newsize;
	if (Math.abs(newsize-oldsize)>0.00000001){
		auto_resize_model();
	}
	
	
	
	if (is_mouse_tracking_timed_out()) eye_position_mouse=[0,0];
	look_at(
		eye_position_mouse[0]*stare_strength+eye_position_sky[0]*(1-stare_strength),
		eye_position_mouse[1]*stare_strength+eye_position_sky[1]*(1-stare_strength)
	)
	hanmari_random_action_check();
	pixi_manual_update();
}
