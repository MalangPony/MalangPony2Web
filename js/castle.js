/* Castle Background */
import { Vector2, Vector3 } from "./vectors.js";
import * as Config from "./config.js";

const wsd = document.getElementById("whole-screen-div");

// #castle-container is a .fullsize, so it exactly fills the screen.
let castle_container = document.getElementById("castle-container");


// Original image size [5375, 6248]
// Scaled image size [1075, 1250]
const castle_layers={
	far:{
		filename:"P01-FarBackdrop.png",
		layer_order:1,
		parallax_multiplier:0.5,
		x:   0, y: 710,
		w:2202, h:5538,
	},
	waterfall:{
		filename:"P02-Waterfall.png",
		layer_order:2,
		parallax_multiplier:0.9,
		x: 817, y:   0,
		w:4558, h:6248,
	},
	ground_base:{
		filename:"P03-GroundBase.png",
		layer_order:3,
		parallax_multiplier:0.95,
		x:1287, y:4426,
		w:3132, h: 963,
	},
	door_backdrop:{
		filename:"P11-DoorBackdrop.png",
		layer_order:11,
		parallax_multiplier:1.0,
		x:2464, y:4460,
		w: 454, h: 819,
	},
	door_right:{
		filename:"P12-DoorR.png",
		layer_order:12,
		parallax_multiplier:1.0,
		x:2675, y:4462,
		w: 243, h: 702,
	},
	door_left:{
		filename:"P13-DoorL.png",
		layer_order:13,
		parallax_multiplier:1.0,
		x:2464, y:4464,
		w: 231, h: 817,
	},
	door_bars:{
		filename:"P14-Bars.png",
		layer_order:14,
		parallax_multiplier:1.0,
		x:2441, y:3994,
		w: 538, h: 726,
	},
	castle:{
		filename:"P20-Castle.png",
		layer_order:20,
		parallax_multiplier:1.0,
		x:1360, y:1234,
		w:2959, h:3990,
	},
	foreground:{
		filename:"P30-Foreground.png",
		layer_order:30,
		parallax_multiplier:1.0,
		x: 596, y:4580,
		w:4779, h:1668,
	},
	door_glow:{
		filename:"P91-DoorGlow.png",
		layer_order:91,
		parallax_multiplier:1.0,
		x:2230, y:4245,
		w: 917, h:1175,
	},
};


let original_image_dimensions=new Vector2(5375,6248);
let original_zoom_center=new Vector2(2700,4800);
let original_width_to_height=(1/original_image_dimensions.x*original_image_dimensions.y);

// Units: % of the width of original image
let door_left_slide = 3.5;
let door_right_slide = 3.5;

// Units: % of the height of original image
let door_bars_slide = 6.5;

let layers_parent = document.createElement("div");
layers_parent.style.position="absolute";
layers_parent.style.bottom=0;
layers_parent.style.height="auto";
castle_container.appendChild(layers_parent);

let whiteout=document.createElement("div");
whiteout.style.position="absolute";
whiteout.style.zIndex=99;
whiteout.style.top=0;
whiteout.style.bottom=0;
whiteout.style.left=0;
whiteout.style.right=0;
whiteout.style.display="none";
whiteout.style.backgroundColor="#FFF";
castle_container.appendChild(whiteout);


for (const layer_name in castle_layers){
	let layer=castle_layers[layer_name];
	
	// Calculate size/coords in percentages
	let orig_bottom=original_image_dimensions.y-(layer.y+layer.h);
	let orig_left=layer.x;
	layer.leftPercentage=orig_left/original_image_dimensions.x*100;
	layer.bottomPercentage=orig_bottom/original_image_dimensions.y*100;
	layer.widthPercentage=layer.w/original_image_dimensions.x*100;
	layer.heightPercentage=layer.h/original_image_dimensions.y*100;
	
	let img=document.createElement("img");
	img.src="/backgrounds/castle/"+layer.filename;
	img.style.position="absolute";
	img.style.zIndex=layer.layer_order;
	//img.style.top=0;
	img.style.bottom=layer.bottomPercentage+"%";
	img.style.left=layer.leftPercentage+"%";
	img.style.width=layer.widthPercentage+"%";
	img.style.height=layer.heightPercentage+"%";

	layer.dom=img;
	layers_parent.appendChild(img);
}

castle_layers.door_glow.dom.style.opacity=0.0;
castle_layers.door_bars.dom.style.bottom=(castle_layers.door_bars.bottomPercentage-door_bars_slide)+"%";


let scroll_offset = Config.OPTION_INTRO_CASTLE_SCROLL_AMOUNT;

let active=true;
export function set_active(b){
	active=b;
	if (active) castle_container.style.display="block";
	else castle_container.style.display="none";
}

function recalculate_size(){
	let containerW=castle_container.clientWidth;
	let containerH=castle_container.clientHeight;
	
	let targetW=containerW;
	
	console.log("CastleBG recalculating size: W"+containerW+" H "+containerH);
	// Be at least 150% of screen height so scrolling effects are visible
	// If less than that, scale up targetW.
	let minimumH=containerH*1.5;
	if (targetW*original_width_to_height<minimumH){
		targetW=minimumH/original_width_to_height;
		console.log("Force-growing target width to "+targetW);
	}
	
	// Apply limits. Don't get too crazy.
	if (targetW>Config.OPTION_CASTLEBG_MAX_WIDTH_PIXELS) 
		targetW=Config.OPTION_CASTLEBG_MAX_WIDTH_PIXELS;
	if (targetW<Config.OPTION_CASTLEBG_MIN_WIDTH_PIXELS)
		targetW=Config.OPTION_CASTLEBG_MIN_WIDTH_PIXELS;
	
	
	let layer_parent_width=targetW;
	let layer_parent_left=(containerW-targetW)/2;
	layers_parent.style.width=layer_parent_width+"px";
	layers_parent.style.height=(layer_parent_width*original_width_to_height)+"px";
	layers_parent.style.left=layer_parent_left+"px";
}

let rso = new ResizeObserver(recalculate_size);
rso.observe(castle_container);

// This should be called from the main JS file.
export function report_scroll_progress(current,maximum){
	
	let ratio=1;
	if (maximum>0.1) ratio=current/maximum;
	
	const fade_start=0.2;
	const fade_end=0.5;
	if (ratio<fade_start) layers_parent.style.opacity=0.0;
	else if (ratio<fade_end) layers_parent.style.opacity=(ratio-fade_start)/(fade_end-fade_start)
	else layers_parent.style.opacity=1.0;
	
	//let yHeight=maximum-current;
	let yHeightMax=(layers_parent.clientHeight-castle_container.clientHeight)/(1-fade_start);
	
	// Don't scroll backwards
	if (yHeightMax<0) yHeightMax=0;
	
	// Don't scroll faster than foreground
	if (yHeightMax>maximum) yHeightMax=maximum;
	
	
	let yHeight=(1-ratio)*yHeightMax;
	
	for (const layer_name in castle_layers){
		let layer=castle_layers[layer_name];
		let img=layer.dom;
		let parallax_factor=(layer.parallax_multiplier-1);
		// There's some inset CSS animations in the layers with 
		// parallax multiplier of 1.0 (notably the castle doors)
		// so we don't touch the inset if parallax_multiplier==1
		if (Math.abs(parallax_factor)>0.001){
			let offset_px=(-yHeight)*parallax_factor;
			let orig_perc=layer.bottomPercentage;
			img.style.bottom="calc("+orig_perc+"% + "+offset_px+"px)";
		}
	}
	layers_parent.style.bottom=(-yHeight)+"px";
}

report_scroll_progress(0,100); // Just to hide the castle

function calculate_out_parameters(){
	let containerW=castle_container.clientWidth;
	let containerH=castle_container.clientHeight;
	
	let targetW=containerW;
	if (containerW>Config.OPTION_CASTLEBG_MAX_WIDTH_PIXELS) 
		targetW=Config.OPTION_CASTLEBG_MAX_WIDTH_PIXELS;
	if (targetW<Config.OPTION_CASTLEBG_MIN_WIDTH_PIXELS)
		targetW=Config.OPTION_CASTLEBG_MIN_WIDTH_PIXELS;

	return {
		left:(containerW-targetW)/2,
		bottom:0,
		width:targetW
	};
}
function calculate_zoom_parameters(){
	let containerW=castle_container.clientWidth;
	let containerH=castle_container.clientHeight;
	
	let targetW=containerW;
	if (containerW>Config.OPTION_CASTLEBG_MAX_WIDTH_PIXELS) 
		targetW=Config.OPTION_CASTLEBG_MAX_WIDTH_PIXELS;
	if (targetW<Config.OPTION_CASTLEBG_MIN_WIDTH_PIXELS)
		targetW=Config.OPTION_CASTLEBG_MIN_WIDTH_PIXELS;
	
	let zoom_factor=10;
	
	let image_scaling_factor=targetW/original_image_dimensions.x;
	// From here, all coordinates are bottom-left based and in pixel units.
	let center_from_bottomleft = new Vector2(
		original_zoom_center.x,
		original_image_dimensions.y-original_zoom_center.y
	).multiply(image_scaling_factor);
	let center_target = new Vector2(containerW/2,containerH/2);
	let center_to_origin = center_from_bottomleft.multiply(-1);
	let zoomed_c2o = center_to_origin.multiply(zoom_factor);
	let zoomed_origin = center_target.add(zoomed_c2o);
	let zoomed_left=zoomed_origin.x;
	let zoomed_bottom=zoomed_origin.y;
	let zoomed_width = targetW*zoom_factor;
	return {
		left:zoomed_left,
		bottom:zoomed_bottom,
		width:zoomed_width
	};
}

let better_ease_out="cubic-bezier(0, 0.7, 0.3, 1)";
let better_ease_in="cubic-bezier(0.7, 0, 1, 0.3)";
let better_ease_inout="cubic-bezier(0.7, 0, 0.3, 1.0)";

function animate_transform_to(toP,delay,duration,ease,callback){
	let anim_zoom=layers_parent.animate([
			{ 
				left: layers_parent.style.left,
				bottom: layers_parent.style.bottom,
				width: layers_parent.style.width,
				height: layers_parent.style.height
			},{ 
				left: toP.left+"px",
				bottom: toP.bottom+"px",
				width: toP.width+"px",
				height: (toP.width*original_width_to_height)+"px",
			}],{
		duration: duration,
		delay:delay,
		easing:ease
	});
	anim_zoom.onfinish= () => {
		layers_parent.style.left=toP.left+"px";
		layers_parent.style.bottom=toP.bottom+"px";
		layers_parent.style.width=toP.width+"px";
		layers_parent.style.height=(toP.width*original_width_to_height)+"px";
		callback();
	};
}

function animate_transform(fromP,toP,delay,duration,ease,callback){
	let anim_zoom=layers_parent.animate([
			{ 
				left: fromP.left+"px",
				bottom: fromP.bottom+"px",
				width: fromP.width+"px",
				height:(fromP.width*original_width_to_height)+"px",
			},{ 
				left: toP.left+"px",
				bottom: toP.bottom+"px",
				width: toP.width+"px",
				height:(toP.width*original_width_to_height)+"px",
			}],{
		duration: duration,
		delay:delay,
		easing:ease
	});
	anim_zoom.onfinish= () => {
		layers_parent.style.left=toP.left+"px";
		layers_parent.style.bottom=toP.bottom+"px";
		layers_parent.style.width=toP.width+"px";
		layers_parent.style.height=(toP.width*original_width_to_height)+"px";
		callback();
	};
}
export function enter_instant(){
	whiteout.style.opacity=1;
	whiteout.style.display="block";
	layers_parent.style.display="none";
}
export function enter_animation(delay,finished_callback){
	let containerW=castle_container.clientWidth;
	
	
	let anim_bars=castle_layers.door_bars.dom.animate([
			{bottom:(castle_layers.door_bars.bottomPercentage-door_bars_slide)+"%"},
			{bottom:castle_layers.door_bars.bottomPercentage+"%"}],{
		duration: 500,
		delay:delay+0,
		easing:better_ease_inout
	});
	anim_bars.onfinish=()=>{
		castle_layers.door_bars.dom.style.bottom=castle_layers.door_bars.bottomPercentage+"%";
	};
	
	let anim_left=castle_layers.door_left.dom.animate([
			{left:castle_layers.door_left.leftPercentage+"%"},
			{left:(castle_layers.door_left.leftPercentage-door_left_slide)+"%"}],{
		duration: 500,
		delay:delay+300,
		easing:better_ease_in
	});
	anim_left.onfinish=()=>{
		castle_layers.door_left.dom.style.left=(castle_layers.door_left.leftPercentage-door_left_slide)+"%";
	};
	
	let anim_right=castle_layers.door_right.dom.animate([
			{left:castle_layers.door_right.leftPercentage+"%"},
			{left:(castle_layers.door_right.leftPercentage+door_right_slide)+"%"}],{
		duration: 500,
		delay:delay+300,
		easing:better_ease_in
	});
	anim_right.onfinish=()=>{
		castle_layers.door_right.dom.style.left=(castle_layers.door_right.leftPercentage+door_right_slide)+"%";
	};
	
	let anim_glow=castle_layers.door_glow.dom.animate([
			{opacity:0},{opacity:1}],{
		duration: 500,
		delay:delay+500,
		easing:"linear"
	});
	anim_glow.onfinish=()=>{
		castle_layers.door_glow.dom.style.opacity=1;
	};
	
	whiteout.style.opacity=0;
	whiteout.style.display="block";
	let anim_whiteout=whiteout.animate([
			{opacity:0},{opacity:1}],{
		duration: 300,
		delay:delay+1200,
		easing:"linear"
	});
	anim_whiteout.onfinish=()=>{
		whiteout.style.opacity=1;
		layers_parent.style.display="none";
	};
	
	//let zp1=calculate_out_parameters();
	//let zp2=calculate_zoom_parameters();
	//animate_transform(zp1,zp2,delay+500,1000,better_ease_in,finished_callback);
	let zp2=calculate_zoom_parameters();
	animate_transform_to(zp2,delay+500,1000,better_ease_in,finished_callback);
	
	return 1500;
}
export function exit_animation(delay,finished_callback){
	
	whiteout.style.opacity=1;
	whiteout.style.display="block";
	layers_parent.style.display="block";
	let anim_whiteout=whiteout.animate([
			{opacity:1},{opacity:0}],{
		duration: 300,
		delay:delay,
		easing:"linear"
	});
	anim_whiteout.onfinish=()=>{
		whiteout.style.display="none";
	};
	
	castle_layers.door_glow.dom.style.opacity=1;
	let anim_glow=castle_layers.door_glow.dom.animate([
			{opacity:1},{opacity:0}],{
		duration: 500,
		delay:delay+500,
		easing:"linear"
	});
	anim_glow.onfinish=()=>{
		castle_layers.door_glow.dom.style.opacity=0;
	};
	
	castle_layers.door_bars.dom.style.bottom=0;
	let anim_bars=castle_layers.door_bars.dom.animate([
			{bottom:castle_layers.door_bars.bottomPercentage+"%"},
			{bottom:(castle_layers.door_bars.bottomPercentage-door_bars_slide)+"%"}],{
		duration: 500,
		delay:delay+700,
		easing:better_ease_inout
	});
	anim_bars.onfinish=()=>{
		castle_layers.door_bars.dom.style.bottom=(castle_layers.door_bars.bottomPercentage-door_bars_slide)+"%";
	};
	
	castle_layers.door_left.dom.style.left=(-door_left_slide)+"%";
	let anim_left=castle_layers.door_left.dom.animate([
			{left:(castle_layers.door_left.leftPercentage-door_left_slide)+"%"},
			{left:castle_layers.door_left.leftPercentage+"%"}],{
		duration: 500,
		delay:delay+500,
		easing:better_ease_out
	});
	anim_left.onfinish=()=>{
		castle_layers.door_left.dom.style.left=castle_layers.door_left.leftPercentage+"%";
	};
	
	castle_layers.door_right.dom.style.left=door_right_slide+"%";
	let anim_right=castle_layers.door_right.dom.animate([
			{left:(castle_layers.door_right.leftPercentage+door_right_slide)+"%"},
			{left:castle_layers.door_right.leftPercentage+"%"}],{
		duration: 500,
		delay:delay+500,
		easing:better_ease_out
	});
	anim_right.onfinish=()=>{
		castle_layers.door_right.dom.style.left=castle_layers.door_right.leftPercentage+"%";
	};
	
	
	let zp2=calculate_out_parameters();
	let zp1=calculate_zoom_parameters();
	animate_transform(zp1,zp2,delay,1000,better_ease_out,finished_callback);
	return 1200;
}
export function exit_instant(){
	whiteout.style.display="none";
	layers_parent.style.display="block";
	castle_layers.door_glow.dom.style.opacity=0;
	castle_layers.door_bars.dom.style.bottom=(-door_bars_slide)+"%";
	castle_layers.door_left.dom.style.left=0;
	castle_layers.door_right.dom.style.left=0;
	let zp=calculate_out_parameters();
	layers_parent.style.left=zp.left+"px";
	layers_parent.style.bottom=zp.bottom+"px";
	layers_parent.style.width=zp.width+"px";
	layers_parent.style.height=(zp.width*original_width_to_height)+"px";
}
