import * as Config  from "./config.js";
import * as PerformanceManager from "./perfmanager.js";

const l2d_container = document.getElementById("l2d-container");
const l2d_canvas = document.getElementById("l2d-canvas");

let app = null;
if (Config.OPTION_ENABLE_L2D_HANMARI){
	app = new PIXI.Application({
		view:l2d_canvas,
		autoStart: true,
		backgroundAlpha: 0, 
		resizeTo:l2d_container,
		sharedTicker:true
	});
}

export let model = null;
if (Config.OPTION_ENABLE_L2D_HANMARI){
	model=PIXI.live2d.Live2DModel.fromSync(
		"L2D-model/Hanmari-IZuchi-r001-Cubism42/Hanmari-L2d.model3.json",
		{autoInteract:false});
}

// Stop/Start main draw loop on feature disable/enable.
PerformanceManager.register_feature_disable_callback(
	PerformanceManager.Feature.HANMARI_L2D, ()=>{
		PIXI.Ticker.shared.stop();
		l2d_container.style.display="none";
	}
);
PerformanceManager.register_feature_enable_callback(
	PerformanceManager.Feature.HANMARI_L2D, ()=>{
		PIXI.Ticker.shared.start();
		l2d_container.style.display="block";
	}
);

if (Config.OPTION_ENABLE_L2D_HANMARI){
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
		// 
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
});

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

function auto_resize_model(){
	if (!is_loaded) return;
	let w=l2d_container.clientWidth;
	let h=l2d_container.clientHeight;
	let min=w<h?w:h;
	model.scale.set(min/1700);
	model.position.x=0;
	model.position.y=0;
}
let rso= new ResizeObserver(()=>{
	auto_resize_model();
});
rso.observe(l2d_container);

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
// Called once the model is loaded
function load_internals(){
	internal_model=model.internalModel;
	focus_controller=internal_model.focusController;
	core_model=internal_model.coreModel;
}
function get_model_focus_controller(){
	return focus_controller;
}
function setX(angle){
	core_model.addParameterValueById(internal_model.idParamAngleZ,angle);
}
function setY(angle){
	core_model.addParameterValueById(internal_model.idParamAngleZ,angle);
}
function setZ(angle){
	core_model.addParameterValueById(internal_model.idParamAngleZ,angle);
}

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
if (Config.OPTION_ENABLE_L2D_HANMARI){
	window.addEventListener("mousemove",(e)=>{
		// All coordinates are in viewport coords.
		
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
export function animationTick(dt){
	if (!Config.OPTION_ENABLE_L2D_HANMARI) return;
	if (!PerformanceManager.check_feature_enabled(
		PerformanceManager.Feature.HANMARI_L2D)) return;
	look_at(
		eye_position_mouse[0]*stare_strength+eye_position_sky[0]*(1-stare_strength),
		eye_position_mouse[1]*stare_strength+eye_position_sky[1]*(1-stare_strength)
	)
}
