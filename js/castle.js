/* Castle Background */
import { Vector2, Vector3 } from "./vectors.js";
import * as Parallax from "./parallax.js";

const wsd = document.getElementById("whole-screen-div");
let castle_container = document.getElementById("castle-container");

const castle_layers={
	river:{
		filename:"D3700225E1-L1D-R50p.png",
		layer_order:1,
		parallax_multiplier:1.2,
	},
	trees:{
		filename:"D3700225E1-L2D-R50p.png",
		layer_order:2,
		parallax_multiplier:0.8
	},
	castle_back:{
		filename:"D3700225E1-L3D-R50p.png",
		layer_order:3,
		parallax_multiplier:0.9
	},
	ground:{
		filename:"D3700225E1-L4D-R50p.png",
		layer_order:4,
		parallax_multiplier:1.1
	},
	castle_front:{
		filename:"D3700225E1-L5D-R50p.png",
		layer_order:5,
		parallax_multiplier:1.0
	},
	door_closed:{
		filename:"D3700225E1-L6D-R50p.png",
		layer_order:6,
		parallax_multiplier:1.0
	},
	door_glow:{
		filename:"D3700225E1-L6O-R50p.png",
		layer_order:7,
		parallax_multiplier:1.0
	},
	bridge:{
		filename:"D3700225E1-L7D-R50p.png",
		layer_order:8,
		parallax_multiplier:1.1
	},
};

let image_dimensions=new Vector2(1870,2608);
let zoom_center=new Vector2(950,2250);

let layers_parent = document.createElement("div");
layers_parent.style.position="absolute";
layers_parent.style.bottom=0;
layers_parent.style.height="auto";
layers_parent.style.aspectRatio=image_dimensions.x/image_dimensions.y;
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
	img.src="sprites-prototype/castle/"+layer.filename;
	img.style.position="absolute";
	img.style.zIndex=layer.layer_order;
	img.style.top=0;
	img.style.bottom=0;
	img.style.left=0;
	img.style.right=0;
	img.style.width="100%";
	img.style.height="100%";
	
	
	layer_doms[layer_name]=img;
	layers_parent.appendChild(img);
}

layer_doms.door_glow.style.opacity=0.0;

let scroll_offset = Math.round(Parallax.calculate_offset_from_sky_mode_to_ground_mode(
  0 //Castle is at Z=0
));

let active=true;
export function set_active(b){
	active=b;
	if (active) castle_container.style.display="block";
	else castle_container.style.display="none";
}

let layer_parent_width=0;
let layer_parent_left=0;
let layer_parent_bottom=0;

function recalculate_size(){
	let containerW=castle_container.clientWidth;
	let containerH=castle_container.clientHeight;
	
	let targetW=containerW;
	if (containerW>1500) targetW=1500;
	
	layer_parent_width=targetW;
	layer_parent_left=(containerW-targetW)/2;
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
	
	for (const layer_name in castle_layers){
		let img=layer_doms[layer_name];
		let layer_def=castle_layers[layer_name];
		//img.style.bottom=(current-maximum)*layer_def.parallax_multiplier+"px";
		layer_parent_bottom=current-maximum;
		layers_parent.style.bottom=layer_parent_bottom+"px";
	}

}
report_scroll_progress(0,100); // Just to hide the castle

function calculate_out_parameters(){
	let containerW=castle_container.clientWidth;
	let containerH=castle_container.clientHeight;
	
	let targetW=containerW;
	if (containerW>1500) targetW=1500;

	return {
		left:(containerW-targetW)/2,
		bottom:0,
		width:targetW
	};
}
function calculate_zoom_parameters(){
	let containerW=castle_container.clientWidth;
	let containerH=castle_container.clientHeight;
	let zoom_factor=5;
	
	// From here, all coordinates are bottom-left based and in pixel units.
	let center_from_bottomleft = new Vector2(
		zoom_center.x,
		image_dimensions.y-zoom_center.y
	);
	let center_target = new Vector2(containerW/2,containerH/2);
	let center_to_origin = center_from_bottomleft.multiply(-1);
	let zoomed_c2o = center_to_origin.multiply(zoom_factor);
	let zoomed_origin = center_target.add(zoomed_c2o);
	let zoomed_left=zoomed_origin.x;
	let zoomed_bottom=zoomed_origin.y;
	let zoomed_width = image_dimensions.x*zoom_factor;
	return {
		left:zoomed_left,
		bottom:zoomed_bottom,
		width:zoomed_width
	};
}

function animate_transform(params,delay,duration,ease,callback){
	let anim_zoom=layers_parent.animate([
			{ 
				left: layer_parent_left+"px",
				bottom: layer_parent_bottom+"px",
				width: layer_parent_width+"px"
			},{ 
				left: params.left+"px",
				bottom: params.bottom+"px",
				width: params.width+"px"
			}],{
		duration: duration,
		delay:delay,
		easing:ease
	});
	anim_zoom.onfinish= () => {
		layer_parent_left=params.left;
		layer_parent_bottom=params.bottom;
		layer_parent_width=params.width;
		layers_parent.style.left=layer_parent_left+"px";
		layers_parent.style.bottom=layer_parent_bottom+"px";
		layers_parent.style.width=layer_parent_width+"px";
		callback();
	};
}

export function enter_animation(delay,finished_callback){
	let door_glow=layer_doms.door_glow;
	
	
	let anim_glow=layer_doms.door_glow.animate([
			{opacity:0},{opacity:1}],{
		duration: 500,
		delay:delay+0,
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
	
	let zp=calculate_zoom_parameters();
	animate_transform(zp,delay+500,1000,"cubic-bezier(0.7, 0, 1, 0.3)",finished_callback);
	
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
	
	let zp=calculate_out_parameters();
	animate_transform(zp,delay,1000,"cubic-bezier(0, 0.7, 0.3, 1)",finished_callback);
	return 1000;
}
