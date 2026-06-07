import * as Global from "./global.js";
import * as Utils from "./utils.js";

const image_popup_dom = document.getElementById("image-popup");
const loading_indicator = document.getElementById("image-popup-loading-indicator");
const close_btn = document.getElementById("image-popup-close-button");
const img = document.getElementById("image-popup-img");

let close_svg=Utils.generate_svg_cross("#FFFFFF");
close_btn.appendChild(close_svg);

let anim=null;

function popup_hide(){
	
	if (anim != null) anim.finish();
	
	anim = image_popup_dom.animate(
		[{opacity:"1.0"},{opacity:"0.0"}],
		{duration:200,easing:"linear"}
	)
	
	anim.onfinish=(e)=>{
		image_popup_dom.style.opacity="0.0";
		image_popup_dom.style.display="none";
	};
	
	if (!Global.animated) anim.finish();
	
}

function load_done(){
	loading_indicator.style.display="none";
}

export function popup_image(url){
	
	img.src="";
	image_popup_dom.style.display="flex";
	loading_indicator.style.display="block";
	img.src=url;
	
	if (anim != null) anim.finish();
	
	anim = image_popup_dom.animate(
		[{opacity:"0.0"},{opacity:"1.0"}],
		{duration:200,easing:"linear"}
	)
	
	anim.onfinish=(e)=>{
		image_popup_dom.style.opacity="1.0";
	};
	
	if (!Global.animated) anim.finish();
}


image_popup_dom.addEventListener("click",popup_hide);
img.addEventListener('load',load_done);
