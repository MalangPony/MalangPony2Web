import { AnimatedValue } from "./animator.js";

let background_images={
	intro:     "", 
	
	news:      "sprites-prototype/MPN2-Prototype-Image-S1E26-SS06.jpg",
	
	about:     "sprites-prototype/MPN2-Prototype-Image-S1E26-SS02.jpg",
	previous:  "sprites-prototype/MPN2-Prototype-Image-S1E26-SS02.jpg",
	coc:       "sprites-prototype/MPN2-Prototype-Image-S1E26-SS02.jpg",
	mascot:    "sprites-prototype/MPN2-Prototype-Image-S1E26-SS02.jpg",
	
	timetable: "sprites-prototype/MPN2-Prototype-Image-S1E26-SS03.jpg",
	venue:     "sprites-prototype/MPN2-Prototype-Image-S1E26-SS03.jpg",
	conbook:   "sprites-prototype/MPN2-Prototype-Image-S1E26-SS03.jpg",
	
	involved:  "sprites-prototype/MPN2-Prototype-Image-S1E26-SS04.jpg",
	register:  "sprites-prototype/MPN2-Prototype-Image-S1E26-SS04.jpg",
	
	credits:   "sprites-prototype/MPN2-Prototype-Image-S1E26-SS05.jpg",
	inquiries: "sprites-prototype/MPN2-Prototype-Image-S1E26-SS05.jpg",
}

let bg_container=document.getElementById("staticbg-container");

let active=true;
export function set_active(b){
	active=b;
	if (!active) bg_container.style.display="none";
	else bg_container.style.display="block";
}

let currently_active_image="";
let images=[];
for (const page in background_images){
	let src=background_images[page];
	if (!src) continue;
	if (images.includes(src)) continue;
	images.push(src);
}

let image_doms={};
let image_opacity_av={};
for (const src of images){
	let img = document.createElement("img");
	img.src=src;
	img.style.display="none";
	img.style.position="absolute";
	img.style.top=0;
	img.style.left=0;
	img.style.width="100%";
	img.style.height="100%";
	img.style.objectFit="cover";
	bg_container.appendChild(img);
	let av=new AnimatedValue(0);
	av.set_ease(1,false,false);
	image_opacity_av[src]=av;
	image_doms[src]=img;
}

export function activate_page_bg(pageid,delay,duration){
	activate_img(background_images[pageid],delay,duration);
}
// Call with target_src="" to clear image.
function activate_img(target_src,delay,duration){
	if (target_src===currently_active_image) return;
	
	for (const src of images){
		let av=image_opacity_av[src];
		let img=image_doms[src];
		
		if ((src===target_src) && (!currently_active_image)){
			// Special case for fading in with no active image
			img.style.display="block";
			img.style.zIndex=2;
			img.style.opacity=0;
			let anim=img.animate(
				[{opacity:0},{opacity:1}],
				{duration: duration, delay:delay})
			anim.onfinish=()=>{img.style.opacity=1;}
		}else if (src===target_src){
			img.style.display="block";
			img.style.zIndex=1;
			img.style.opacity=1;
		}else if (src===currently_active_image){
			img.style.display="block";
			img.style.zIndex=2;
			let anim=img.animate(
				[{opacity:1},{opacity:0}],
				{duration: duration, delay:delay})
			anim.onfinish=()=>{img.style.display="none";}
		} else{
			img.style.display="none";
		}
	}
	currently_active_image=target_src;
}
export function activate_page_bg_instant(pageid){
	activate_img(background_images[pageid]);
}
// Call with target_src="" to clear image.
function activate_img_instant(target_src){
	if (target_src===currently_active_image) return;
	
	for (const src of images){
		let av=image_opacity_av[src];
		let img=image_doms[src];
		
		 if (src===target_src){
			img.style.display="block";
			img.style.zIndex=2;
			img.style.opacity=1;
		} else{
			img.style.display="none";
		}
	}
	currently_active_image=target_src;
}
/*
export function activate_page_bg(pageid){
	//console.log("APBG",pageid);
	let target_src=background_images[pageid];
	//console.log("TSRC",target_src);
	for (const src of images){
		let av=image_opacity_av[src];
		let img=image_doms[src];
		
		if (src===target_src) av.animate_to(1);
		else av.animate_to(0);
	}
}

export function animationTick(dt){
	let any_visible=false;
	for (const src of images){
		let av=image_opacity_av[src];
		let img=image_doms[src];
		av.tick(dt);
		
		let opacity=av.calculate_value();
		//console.log(src,opacity);
		if (opacity<0.0001){
			// Image is not visible. Hide if needed and move on.
			if ((img.style.display!=="none")){
				img.style.display="none";
			}
			continue;
		}
		
		any_visible=true;
		
		if ((opacity>0.0001) && (img.style.display!=="block"))
			img.style.display="block";
		
		if ((opacity>0.9999)){
			// Image is fully visible. Set 100% and move on.
			if (img.style.opacity!=="1"){
				img.style.opacity="1";
			}
			continue;
		}
		
		img.style.opacity=opacity;
		
		
		
	}
	
	if (!any_visible) bg_container.style.display="none";
	else bg_container.style.display="block";
}
*/
