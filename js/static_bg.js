import { AnimatedValue } from "./animator.js";
import * as BackgroundData from "./background_data.js";
import * as Config  from "./config.js";


let bg_container=document.getElementById("staticbg-container");

let active=true;
export function set_active(b){
	active=b;
	if (!active) bg_container.style.display="none";
	else bg_container.style.display="block";
}

const LR_IMAGE_WIDTH_THRESHOLD=Config.SCREEN_MINWIDTH_FOR_STATICBG_LR_IMAGE;

let lr_image_active=(bg_container.clientWidth>LR_IMAGE_WIDTH_THRESHOLD);
let screen_resize_observer = new ResizeObserver(()=>{
	let w=bg_container.clientWidth;
	if (lr_image_active && (w<LR_IMAGE_WIDTH_THRESHOLD)){
		for (const bgid in BackgroundData.background_definitions){
			 if (bgid===currently_active_image){
				animations[bgid].anim_out(0,500);
			} else{
				animations[bgid].jump_out();
			}
		}
		lr_image_active=false;
	}
	if ((!lr_image_active) && (w>LR_IMAGE_WIDTH_THRESHOLD)){
		for (const bgid in BackgroundData.background_definitions){
			 if (bgid===currently_active_image){
				animations[bgid].anim_in(0,500);
			} else{
				animations[bgid].jump_in();
			}
		}
		lr_image_active=true;
	}
});
screen_resize_observer.observe(bg_container);

let currently_active_image="";

let image_doms={};
let animations={};
for (const bgid in BackgroundData.background_definitions){
	let bgdef=BackgroundData.background_definitions[bgid];
	
	let bg_scene = document.createElement("div");
	bg_scene.classList.add("staticbg-scene");
	bg_scene.style.display="none";
	bg_scene.style.position="absolute";
	bg_scene.style.top=0;
	bg_scene.style.left=0;
	bg_scene.style.width="100%";
	bg_scene.style.height="100%";
	
	let bg_base = null;
	if (bgdef.base_image){
		bg_base = document.createElement("div");
		bg_base.classList.add("staticbg-base-image");
		bg_base.style.backgroundImage="url("+bgdef.base_image+")";
		bg_base.style.backgroundSize="cover";
		bg_base.style.backgroundPosition="center";
		bg_base.style.backgroundRepeat="no-repeat";
		bg_base.style.position="absolute";
		bg_base.style.top=0;
		bg_base.style.right=0;
		bg_base.style.width="100%";
		bg_base.style.height="100%";
		bg_base.style.zIndex=2;
		bg_scene.appendChild(bg_base);
	}
	
	let bg_left = null;
	if (bgdef.left_image){
		bg_left = document.createElement("div");
		bg_left.classList.add("staticbg-left-image");
		bg_left.style.backgroundImage="url("+bgdef.left_image+")";
		bg_left.style.backgroundSize="auto 100%";
		bg_left.style.backgroundPosition="right";
		bg_left.style.backgroundRepeat="no-repeat";
		bg_left.style.position="absolute";
		if (bgdef.left_align==="bottom") bg_left.style.bottom=0;
		else if (bgdef.left_align==="top") bg_left.style.top=0;
		else bg_left.style.top="calc( 100svh - "+(bgdef.left_height_vh/2)+"svh)";
		bg_left.style.left=0;
		bg_left.style.width="calc(var(--mcd-margin-left) - "+bgdef.left_margin_px+"px)";
		bg_left.style.height=bgdef.left_height_vh+"svh";
		bg_left.style.zIndex=4;
		bg_scene.appendChild(bg_left);
	}
	
	let bg_right = null;
	if (bgdef.right_image){
		bg_right = document.createElement("div");
		bg_right.classList.add("staticbg-right-image");
		bg_right.style.backgroundImage="url("+bgdef.right_image+")";
		bg_right.style.backgroundSize="auto 100%";
		bg_right.style.backgroundPosition="left";
		bg_right.style.backgroundRepeat="no-repeat";
		bg_right.style.position="absolute";
		if (bgdef.right_align==="bottom") bg_right.style.bottom=0;
		else if (bgdef.right_align==="top") bg_right.style.top=0;
		else bg_right.style.top="calc( 100svh - "+(bgdef.right_height_vh/2)+"svh)";
		bg_right.style.right=0;
		bg_right.style.width="calc(var(--mcd-margin-right) - "+bgdef.right_margin_px+"px)";
		bg_right.style.height=bgdef.right_height_vh+"svh";
		bg_right.style.zIndex=4;
		bg_scene.appendChild(bg_right);
	}
	
	bg_container.appendChild(bg_scene);
	
	function animate_in(delay,duration){
		if (bg_left){
			let left=bg_left.animate(
				[{left:"-100px",opacity:0},{left:"0",opacity:1}],
				{duration: duration, delay:delay,
				easing:"ease-out"});
			left.onfinish=()=>{
				bg_left.style.left=0;
				bg_left.style.opacity=1;
			};
		}
		if (bg_right){
			let right=bg_right.animate(
				[{right:"-100px",opacity:0},{right:"0",opacity:1}],
				{duration: duration, delay:delay,
				easing:"ease-out"});
			right.onfinish=()=>{
				bg_right.style.right=0;
				bg_right.style.opacity=1;
			};
		}
	}
	function animate_out(delay,duration){
		if (bg_left){
			let left=bg_left.animate(
				[{left:"0",opacity:1},{left:"-100px",opacity:0}],
				{duration: duration, delay:delay,
				easing:"ease-in"});
			left.onfinish=()=>{bg_left.style.opacity=0;};
		}
		if (bg_right){
			let right=bg_right.animate(
				[{right:"0",opacity:1},{right:"-100px",opacity:0}],
				{duration: duration, delay:delay,
				easing:"ease-in"});
			right.onfinish=()=>{bg_right.style.opacity=0;};
		}
	}
	function jump_in(){
		if (bg_left){
			bg_left.style.left=0;
			bg_left.style.opacity=1;
		}
		if (bg_right){
			bg_right.style.right=0;
			bg_right.style.opacity=1;
		}
	}
	function jump_out(){
		if (bg_left){
			bg_left.style.opacity=0;
		}
		if (bg_right){
			bg_right.style.opacity=0;
		}
	}
	
	animations[bgid]={
		anim_in:animate_in,anim_out:animate_out,
		jump_in:jump_in,jump_out:jump_out};
	image_doms[bgid]=bg_scene;
}

// Preload base images
// This only works some of the time, but better than nothing, I guess
let preloaded_image_objects=[];
for (const bgid in BackgroundData.background_definitions){
	let bgdef=BackgroundData.background_definitions[bgid];
	if (bgdef.base_image){
		let img = new Image();
		img.src=bgdef.base_image;
		preloaded_image_objects.push(img);
	}
}

export function activate_page_bg(pageid,delay,duration){
	activate_img(BackgroundData.page_to_background_id[pageid],delay,duration);
}
// Call with target_src="" to clear image.
function activate_img(target_bgid,delay,duration){
	if (target_bgid===currently_active_image) return;
	
	for (const bgid in BackgroundData.background_definitions){
		let img=image_doms[bgid];
		
		if ((bgid===target_bgid) && (!currently_active_image)){
			// Special case for fading in with no active image
			img.style.display="block";
			img.style.zIndex=2;
			img.style.opacity=0;
			let anim=img.animate(
				[{opacity:0},{opacity:1}],
				{duration: duration, delay:delay});
			anim.onfinish=()=>{img.style.opacity=1;}
			
			if (lr_image_active)
				animations[bgid].anim_in(delay,duration);
			else
				animations[bgid].jump_out();
		}else if (bgid===target_bgid){
			// Image being faded in. 
			// The old image will be laid on top and be faded out.
			// So this doesn't really have to do much.
			img.style.display="block";
			img.style.zIndex=1;
			img.style.opacity=1;
			
			// Since we start the animation a little later,
			// the characters should be invisible at the start.
			// hence the .jump_out() call.
			animations[bgid].jump_out();
			if (lr_image_active)
				animations[bgid].anim_in(delay+duration/2,duration/2);
		}else if (bgid===currently_active_image){
			// Image being faded out.
			img.style.display="block";
			img.style.zIndex=2;
			let anim=img.animate(
				[{opacity:1},{opacity:0}],
				{duration: duration, delay:delay});
			anim.onfinish=()=>{img.style.display="none";}
			
			if (lr_image_active)
				animations[bgid].anim_out(delay,duration/2);
		} else{
			img.style.display="none";
		}
	}
	currently_active_image=target_bgid;
}

export function activate_page_bg_instant(pageid){
	activate_img_instant(BackgroundData.page_to_background_id[pageid]);
}
// Call with target_src="" to clear image.
function activate_img_instant(target_bgid){
	if (target_bgid===currently_active_image) return;
	
	for (const bgid in BackgroundData.background_definitions){
		let img=image_doms[bgid];
		
		if (bgid===target_bgid){
			img.style.display="block";
			img.style.zIndex=2;
			img.style.opacity=1;
			if (lr_image_active) animations[bgid].jump_in();
			else  animations[bgid].jump_out();
		} else{
			img.style.display="none";
		}
	}
	currently_active_image=target_bgid;
}

