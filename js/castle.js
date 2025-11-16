/* Castle Background */

import * as Parallax from "./parallax.js";


let castle_container = document.getElementById("castle-container");
const wsd = document.getElementById("whole-screen-div");

const castle_layers=[
	{
		filename:"3700225E1-L1D.png",
		layer_order:1,
		parallax_multiplier:1.2
	},
	{
		filename:"3700225E1-L2D.png",
		layer_order:2,
		parallax_multiplier:0.8
	},
	{
		filename:"3700225E1-L3D.png",
		layer_order:3,
		parallax_multiplier:0.9
	},
	{
		filename:"3700225E1-L4D.png",
		layer_order:4,
		parallax_multiplier:1.1
	},
	{
		filename:"3700225E1-L5D.png",
		layer_order:5,
		parallax_multiplier:1.0
	},
	{
		filename:"3700225E1-L6D.png",
		layer_order:6,
		parallax_multiplier:1.0
	},
	{
		filename:"3700225E1-L7D.png",
		layer_order:7,
		parallax_multiplier:1.1
	},
];

let layer_doms=[];

for (const layer of castle_layers){
	let img=document.createElement("img");
	img.src="sprites-prototype/castle/"+layer.filename;
	img.style.position="absolute";
	img.style.zIndex=layer.layer_order;
	img.style.bottom=0;
	img.style.left="max(0px, calc(( 100% - 1500px ) /2 ))";
	//img.style.height=200+"px";
	img.style.maxWidth="min(100%,1500px)";
	layer_doms.push(img);
	castle_container.appendChild(img);
}

let scroll_offset = Math.round(Parallax.calculate_offset_from_sky_mode_to_ground_mode(
  0 //Castle is at Z=0
));

let active=true;
export function set_active(b){
	active=b;
	if (active) castle_container.style.display="block";
	else castle_container.style.display="none";
}

// This should be called from the main JS file.
export function report_scroll_progress(current,maximum){
	
	let ratio=1;
	if (maximum>0.1) ratio=current/maximum;
	
	const fade_start=0.2;
	const fade_end=0.5;
	if (ratio<fade_start) castle_container.style.opacity=0.0;
	else if (ratio<fade_end) castle_container.style.opacity=(ratio-fade_start)/(fade_end-fade_start)
	else castle_container.style.opacity=1.0;
	
	for (let i=0;i<castle_layers.length;i++){
		let img=layer_doms[i];
		let layer_def=castle_layers[i];
		//img.style.bottom=(current-maximum)*layer_def.parallax_multiplier+"px";
		img.style.bottom=(current-maximum)+"px";
	}

}
report_scroll_progress(0,100); // Just to hide the castle
