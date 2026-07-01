
import * as VendorData from "./vendor_data.js"
import * as ImagePopup from "./image_popup.js";


const template = document.getElementById("vendor-list-entry-template");
const list_container = document.getElementById("vendor-list-container");

for (const v of VendorData.vendors){
	let template_dom = template.content.cloneNode(true);
	
	let entry_dom  = template_dom.querySelector(".vendor-list-entry");
	let image_container_dom  = template_dom.querySelector(".vle-image-container");
	let index_dom  = template_dom.querySelector(".vle-index");
	let title_dom  = template_dom.querySelector(".vle-title");
	let desc_dom   = template_dom.querySelector(".vle-desc");
	let social_dom = template_dom.querySelector(".vle-social");
	
	let img = document.createElement("img");
	img.src = "image/Vendors/"+v.image_thumb;
	img.classList.add("vle-image");
	image_container_dom.appendChild(img);
	
	image_container_dom.addEventListener(
		"click",()=>{
			ImagePopup.popup_image("image/Vendors/"+v.image_full);
	});
	image_container_dom.style.cursor="pointer";
	
	index_dom.innerHTML = ""+v.location;
	title_dom.innerHTML = v.name;
	desc_dom.innerHTML = v.desc;
	
	if (v.socials.length>0){
		for (const s of v.socials){
			let a=document.createElement("a");
			a.href=s.link;
			a.setAttribute("target","_blank");
			a.classList.add("link-button");
			a.classList.add("icon-"+s.site);
			a.classList.add("color-"+s.site);
			a.classList.add("generate-icon");
			a.innerHTML = s.handle;
			
			social_dom.appendChild(a);
		}
	}
	
	
	list_container.appendChild(template_dom);
}
