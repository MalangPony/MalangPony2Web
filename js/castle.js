/* Castle Background */
import { Vector2, Vector3 } from "./vectors.js";
import * as Config from "./config.js";

const wsd = document.getElementById("whole-screen-div");

// #castle-container is a .fullsize, so it exactly fills the screen.
let castle_container = document.getElementById("castle-container");
/*
// Version: FullSplit
const castle_layers={
	p01:{
		filename:"P01.png",
		layer_order:18,
		parallax_multiplier:1.19,
	},
	p02:{
		filename:"P02.png",
		layer_order:17,
		parallax_multiplier:1.13,
	},
	p03:{
		filename:"P03.png",
		layer_order:16,
		parallax_multiplier:1.13,
	},
	p04:{
		filename:"P04.png",
		layer_order:15,
		parallax_multiplier:1.15,
	},
	p05:{
		filename:"P05.png",
		layer_order:14,
		parallax_multiplier:1.0,
	},
	p06:{
		filename:"P06.png",
		layer_order:13,
		parallax_multiplier:1.10,
	},
	p07:{
		filename:"P07.png",
		layer_order:12,
		parallax_multiplier:1.06,
	},
	p08:{
		filename:"P08.png",
		layer_order:11,
		parallax_multiplier:1.03,
	},
	p09:{
		filename:"P09.png",
		layer_order:10,
		parallax_multiplier:0.90,
	},
	p010:{
		filename:"P10.png",
		layer_order:9,
		parallax_multiplier:1.0,
	},
	p11:{
		filename:"P11.png",
		layer_order:8,
		parallax_multiplier:0.97,
	},
	door_bars:{
		filename:"P12.png",
		layer_order:7,
		parallax_multiplier:1.0,
	},
	door_left:{
		filename:"P13.png",
		layer_order:6,
		parallax_multiplier:1.0,
	},
	door_right:{
		filename:"P14.png",
		layer_order:5,
		parallax_multiplier:1.0,
	},
	p15:{
		filename:"P15.png",
		layer_order:4,
		parallax_multiplier:1.0,
	},
	p16:{
		filename:"P16.png",
		layer_order:3,
		parallax_multiplier:0.95,
	},
	p17:{
		filename:"P17.png",
		layer_order:2,
		parallax_multiplier:0.90,
	},
	p18:{
		filename:"P18.png",
		layer_order:1,
		parallax_multiplier:0.50,
	},
	door_glow:{
		filename:"P91.png",
		layer_order:91,
		parallax_multiplier:0.95,
	},
};
*/

/*
// Version: SemiSplit
const castle_layers={
	far:{
		filename:"P01-FarBackdrop.png",
		layer_order:1,
		parallax_multiplier:0.5,
	},
	waterfall:{
		filename:"P02-Waterfall.png",
		layer_order:2,
		parallax_multiplier:0.9,
	},
	ground_base:{
		filename:"P03-GroundBase.png",
		layer_order:3,
		parallax_multiplier:0.95,
	},
	door_backdrop:{
		filename:"P11-DoorBackdrop.png",
		layer_order:11,
		parallax_multiplier:1.0,
	},
	door_right:{
		filename:"P12-DoorR.png",
		layer_order:12,
		parallax_multiplier:1.0,
	},
	door_left:{
		filename:"P13-DoorL.png",
		layer_order:13,
		parallax_multiplier:1.0,
	},
	door_bars:{
		filename:"P14-Bars.png",
		layer_order:14,
		parallax_multiplier:1.0,
	},	
	castle_back:{
		filename:"P21-CastleBack.png",
		layer_order:21,
		parallax_multiplier:0.9,
	},
	castle_mid:{
		filename:"P22-CastleMid.png",
		layer_order:22,
		parallax_multiplier:0.95,
	},
	castle_front:{
		filename:"P23-CastleFront.png",
		layer_order:23,
		parallax_multiplier:1.0,
	},
	ground_front:{
		filename:"P31-GroundFront.png",
		layer_order:31,
		parallax_multiplier:1.2,
	},
	bridge_chains:{
		filename:"P32-Bridge.png",
		layer_order:32,
		parallax_multiplier:1.1,
	},
	door_glow:{
		filename:"P91-DoorGlow.png",
		layer_order:91,
		parallax_multiplier:1.0,
	}
};*/

// Version: MinimalSplit
const castle_layers={
	far:{
		filename:"P01-FarBackdrop.png",
		layer_order:1,
		parallax_multiplier:0.5,
	},
	waterfall:{
		filename:"P02-Waterfall.png",
		layer_order:2,
		parallax_multiplier:0.9,
	},
	ground_base:{
		filename:"P03-GroundBase.png",
		layer_order:3,
		parallax_multiplier:0.95,
	},
	door_backdrop:{
		filename:"P11-DoorBackdrop.png",
		layer_order:11,
		parallax_multiplier:1.0,
	},
	door_right:{
		filename:"P12-DoorR.png",
		layer_order:12,
		parallax_multiplier:1.0,
	},
	door_left:{
		filename:"P13-DoorL.png",
		layer_order:13,
		parallax_multiplier:1.0,
	},
	door_bars:{
		filename:"P14-Bars.png",
		layer_order:14,
		parallax_multiplier:1.0,
	},
	castle:{
		filename:"P20-Castle.png",
		layer_order:20,
		parallax_multiplier:1.0,
	},
	foreground:{
		filename:"P30-Foreground.png",
		layer_order:30,
		parallax_multiplier:1.0,
	},
	door_glow:{
		filename:"P91-DoorGlow.png",
		layer_order:91,
		parallax_multiplier:1.0,
	}
};

let original_image_dimensions=new Vector2(5375,6248);
let original_zoom_center=new Vector2(2700,4800);

// Units: % of the width of original image
let door_left_slide = 3.5;
let door_right_slide = 3.5;

// Units: % of the height of original image
let door_bars_slide = 6.5;

let layers_parent = document.createElement("div");
layers_parent.style.position="absolute";
layers_parent.style.bottom=0;
layers_parent.style.height="auto";
layers_parent.style.aspectRatio=original_image_dimensions.x/original_image_dimensions.y;
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

let layer_doms={};

for (const layer_name in castle_layers){
	let layer=castle_layers[layer_name];
	let img=document.createElement("img");
	img.src="/backgrounds/castle/"+layer.filename;
	img.style.position="absolute";
	img.style.zIndex=layer.layer_order;
	//img.style.top=0;
	img.style.bottom=0;
	img.style.left=0;
	img.style.width="100%";
	img.style.height="100%";
	
	layer_doms[layer_name]=img;
	layers_parent.appendChild(img);
}

layer_doms.door_glow.style.opacity=0.0;
layer_doms.door_bars.style.bottom=(-door_bars_slide)+"%";
layer_doms.door_left.style.left=0;
layer_doms.door_right.style.left=0;
//layer_doms.door_left.style.left=(-door_left_slide)+"%";
//layer_doms.door_right.style.left=door_right_slide+"%";

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
	if (containerW>Config.OPTION_CASTLEBG_MAX_WIDTH_PIXELS) 
		targetW=Config.OPTION_CASTLEBG_MAX_WIDTH_PIXELS;
	if (targetW<Config.OPTION_CASTLEBG_MIN_WIDTH_PIXELS)
		targetW=Config.OPTION_CASTLEBG_MIN_WIDTH_PIXELS;
	
	
	let layer_parent_width=targetW;
	let layer_parent_left=(containerW-targetW)/2;
	layers_parent.style.width=layer_parent_width+"px";
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
	if (yHeightMax<0) yHeightMax=0;
	let yHeight=(1-ratio)*yHeightMax;
	
	for (const layer_name in castle_layers){
		let img=layer_doms[layer_name];
		let layer_def=castle_layers[layer_name];
		let parallax_factor=(layer_def.parallax_multiplier-1);
		// There's some inset CSS animations in the layers with 
		// parallax multiplier of 1.0 (notably the castle doors)
		// so we don't touch the inset if parallax_multiplier==1
		if (Math.abs(parallax_factor)>0.001)
			img.style.bottom=(-yHeight)*parallax_factor+"px";
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
				width: layers_parent.style.width
			},{ 
				left: toP.left+"px",
				bottom: toP.bottom+"px",
				width: toP.width+"px"
			}],{
		duration: duration,
		delay:delay,
		easing:ease
	});
	anim_zoom.onfinish= () => {
		layers_parent.style.left=toP.left+"px";
		layers_parent.style.bottom=toP.bottom+"px";
		layers_parent.style.width=toP.width+"px";
		callback();
	};
}

function animate_transform(fromP,toP,delay,duration,ease,callback){
	let anim_zoom=layers_parent.animate([
			{ 
				left: fromP.left+"px",
				bottom: fromP.bottom+"px",
				width: fromP.width+"px"
			},{ 
				left: toP.left+"px",
				bottom: toP.bottom+"px",
				width: toP.width+"px"
			}],{
		duration: duration,
		delay:delay,
		easing:ease
	});
	anim_zoom.onfinish= () => {
		layers_parent.style.left=toP.left+"px";
		layers_parent.style.bottom=toP.bottom+"px";
		layers_parent.style.width=toP.width+"px";
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
	
	let anim_bars=layer_doms.door_bars.animate([
			{bottom:(-door_bars_slide)+"%"},{bottom:0}],{
		duration: 500,
		delay:delay+0,
		easing:better_ease_inout
	});
	anim_bars.onfinish=()=>{
		layer_doms.door_bars.style.bottom=0;
	};
	
	let anim_left=layer_doms.door_left.animate([
			{left:0},{left:(-door_left_slide)+"%"}],{
		duration: 500,
		delay:delay+300,
		easing:better_ease_in
	});
	anim_left.onfinish=()=>{
		layer_doms.door_left.style.left=(-door_left_slide)+"%";
	};
	
	let anim_right=layer_doms.door_right.animate([
			{left:0},{left:door_right_slide+"%"}],{
		duration: 500,
		delay:delay+300,
		easing:better_ease_in
	});
	anim_right.onfinish=()=>{
		layer_doms.door_right.style.left=door_right_slide+"%";
	};
	
	let anim_glow=layer_doms.door_glow.animate([
			{opacity:0},{opacity:1}],{
		duration: 500,
		delay:delay+500,
		easing:"linear"
	});
	anim_glow.onfinish=()=>{
		layer_doms.door_glow.style.opacity=1;
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
	
	layer_doms.door_glow.style.opacity=1;
	let anim_glow=layer_doms.door_glow.animate([
			{opacity:1},{opacity:0}],{
		duration: 500,
		delay:delay+500,
		easing:"linear"
	});
	anim_glow.onfinish=()=>{
		layer_doms.door_glow.style.opacity=0;
	};
	
	layer_doms.door_bars.style.bottom=0;
	let anim_bars=layer_doms.door_bars.animate([
			{bottom:0},{bottom:(-door_bars_slide)+"%"}],{
		duration: 500,
		delay:delay+700,
		easing:better_ease_inout
	});
	anim_bars.onfinish=()=>{
		layer_doms.door_bars.style.bottom=(-door_bars_slide)+"%";
	};
	
	layer_doms.door_left.style.left=(-door_left_slide)+"%";
	let anim_left=layer_doms.door_left.animate([
			{left:(-door_left_slide)+"%"},{left:0}],{
		duration: 500,
		delay:delay+500,
		easing:better_ease_out
	});
	anim_left.onfinish=()=>{
		layer_doms.door_left.style.left=0;
	};
	
	layer_doms.door_right.style.left=door_right_slide+"%";
	let anim_right=layer_doms.door_right.animate([
			{left:door_right_slide+"%"},{left:0}],{
		duration: 500,
		delay:delay+500,
		easing:better_ease_out
	});
	anim_right.onfinish=()=>{
		layer_doms.door_right.style.left=0;
	};
	
	
	let zp2=calculate_out_parameters();
	let zp1=calculate_zoom_parameters();
	animate_transform(zp1,zp2,delay,1000,better_ease_out,finished_callback);
	return 1200;
}
