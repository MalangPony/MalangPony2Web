import * as Config  from "./config.js";

const l2d_container = document.getElementById("l2d-container");
const l2d_canvas = document.getElementById("l2d-canvas");


const app = new PIXI.Application({
	view:l2d_canvas,
	autoStart: true,
	backgroundAlpha: 0, 
	resizeTo:l2d_container
});

export const model = PIXI.live2d.Live2DModel.fromSync(
	"L2D-model/Hanmari-IZuchi-r001-Cubism42/Hanmari-L2d.model3.json",
	{autoInteract:false});

/*
const VERTEX_SHADER=`
attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;

vec4 filterVertexPosition( void )
{
	vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

	return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
	return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void)
{
	gl_Position = filterVertexPosition();
	vTextureCoord = filterTextureCoord();
}
`
const FRAGMENT_SHADER=`
varying vec2 vTextureCoord;

uniform sampler2D uSampler;

uniform float darken_factor;

void main(void){
	vec4 currentColor = texture2D(uSampler, vTextureCoord);
	gl_FragColor = vec4(mix(currentColor.rgb, vec3(0,0,0), darken_factor), currentColor.a);
}
`
class EdgeGlowFilter extends PIXI.Filter{
	innerBlur=null;
	constructor(){
		super(VERTEX_SHADER,FRAGMENT_SHADER,{darken_factor:0,glow_factor:0,edge_px:0});
		this.uniforms.darken_factor=0;
		this.uniforms.glow_factor=0;
		this.uniforms.edge_px=0;
		this.innerBlur = new PIXI.filters.BlurFilter(2);
	}
	set darken_amount(f){
		this.uniforms.darken_factor=f;
	}
	set glow_amount(f){
		this.uniforms.glow_factor=f;
	}
	set edge_pixels(n){
		this.uniforms.edge_px=n;
	}
	
	apply(filterManager, input, output, clearMode, _currentState){
		let texDarkened=filterManager.getFilterTexture(input);
		super.apply(
			filterManager, 
			input, texDarkened, 
			PIXI.CLEAR_MODES.CLEAR, _currentState);
		//filterManager.applyFilter(this.innerBlur,texDarkened,output,clearMode);
		this.innerBlur.apply(
			filterManager, 
			texDarkened, output, 
			PIXI.CLEAR_MODES.CLEAR, _currentState)
	}
}
*/
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
	}
}

let cf=new CompositeFilter();
let is_loaded=false;
model.once("load", ()=>{
	app.stage.addChild(model);
	model.scale.set(0.25);
	is_loaded=true;
	tweak_internals();
	//model.filters=[new PIXI.filters.BlurFilter(3)];
	
	model.filters=[cf];
});

export function set_lighten_strength(f){
	cf.lighten_strength=f;
}
export function set_darken_strength(f){
	cf.darken_strength=f;
}

/*
export function look_at(x,y){
	if (!is_loaded) return;
	model.focus(x,y);
}*/

// We are going into the library internals.
// Yes, I know this is not a good idea.
// Source: https://github.com/guansss/pixi-live2d-display/blob/master/src/cubism-common/FocusController.ts
export let focus_controller=null;
// Called once the model is loaded
function tweak_internals(){
	focus_controller=model.internalModel.focusController;
}
function get_model_focus_controller(){
	return focus_controller
}

// We use the FocusController::focus() instead of Live2DModel::focus()
// Because the Live2DModel's focus() always goes full tilt in the mouse direction
// And thus we can't look gently or reset the eye position.
// Read the pixi-live2d-display source for more information.
export function look_at(x,y){
	if (!is_loaded) return;
	get_model_focus_controller().focus(x,y);
}


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
	
	look_at(x,y);
});
// .body is needed for Firefox apperently
document.body.addEventListener("mouseleave",(e)=>{
	//Reset eye if mouse left the window
	look_at(0,0);
});
