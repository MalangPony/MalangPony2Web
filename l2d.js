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

let is_loaded=false;
model.once("load", ()=>{
	app.stage.addChild(model);
	model.scale.set(0.25);
	is_loaded=true;
	tweak_internals();
});

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
