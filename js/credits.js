/* Generates credits list */
import * as CreditsData from "./credits_data.js";

// The primary roles. Populated automatically from data.
let primary_roles=[];
// These special roles are handled separately.
let special_roles=["head","princess","mane","sponsor"];
for (const entry of CreditsData.credits_list){
	if (primary_roles.includes(entry.primary)) continue;
	if (special_roles.includes(entry.primary)) continue;
	primary_roles.push(entry.primary);
}


// Shuffle groups
let primary_roles_shuffled=[];
while (primary_roles.length>0) {
	let random_index=Math.floor(Math.random()*primary_roles.length);
	let random_element=primary_roles.splice(random_index,1)[0];
	primary_roles_shuffled.push(random_element);
}
primary_roles=primary_roles_shuffled;


const staff_container = document.getElementById("credits-staff-container");
const sponsor_container = document.getElementById("credits-sponsor-container");

const template_section  = document.getElementById("credits-template-section");
const template_listing  = document.getElementById("credits-template-listing");

function generate_entry(entry,list_sns=true){
	let entry_dom = template_listing.content.cloneNode(true);
	
	entry_dom.querySelector(".credits-entry-name > .langspan-ko").innerHTML=entry.name_ko;
	entry_dom.querySelector(".credits-entry-name > .langspan-en").innerHTML=entry.name_en;
	

	let sns_list = entry_dom.querySelector(".credits-entry-sns-list");
	for (const sns_entry of entry.socials){
		let sns_dom = document.createElement("a");
		sns_dom.classList.add("credits-entry-sns");
		sns_dom.classList.add("sns-link-button");
		sns_dom.classList.add("inline");
		sns_dom.classList.add(sns_entry.site);
		sns_dom.href=sns_entry.link;
		sns_dom.target="_blank";
		/*
		let sns_ko=document.createElement("span");
		sns_ko.classList.add("langspan-ko");
		sns_ko.innerHTML=CreditsData.sns_definitions[sns_id].ko;
		sns_dom.appendChild(sns_ko);
		
		let sns_en=document.createElement("span");
		sns_en.classList.add("langspan-en");
		sns_en.innerHTML=CreditsData.sns_definitions[sns_id].en;
		sns_dom.appendChild(sns_en);
		*/
		sns_dom.innerHTML=sns_entry.handle;
		sns_list.appendChild(sns_dom);
	}
	if (!list_sns) sns_list.style.display="none";
	
	/*
	let sns_mode=false;
	entry_dom.querySelector(".credits-entry-name")
			 .addEventListener("click",()=>{
		sns_mode=!sns_mode;
		if (sns_mode){
			role_list.style.height="0em";
			sns_list.style.height="1.2em";
		}else{
			role_list.style.height="1.2em";
			sns_list.style.height="0em";
		}
	});*/
	
	return entry_dom;
}

// Generate a list of people with the given primary role
function generate_group(primary_role_id,list_roles=true){
	let group=CreditsData.role_definitions[primary_role_id];
	
	let group_dom = template_section.content.cloneNode(true);
	
	group_dom.querySelector(".credits-section-name > .langspan-ko").innerHTML=group.ko;
	group_dom.querySelector(".credits-section-name > .langspan-en").innerHTML=group.en;
	
	let group_content_container = group_dom.querySelector(".credits-section-content");
	for (const credits_entry of CreditsData.credits_list){
		if (credits_entry.primary !== primary_role_id) continue;
		group_content_container.appendChild(generate_entry(credits_entry,list_roles));
	}
	return group_dom;
}

// Head is always at the top
staff_container.appendChild(generate_group("head",true));
for (const group_id of primary_roles){
	staff_container.appendChild(generate_group(group_id,true));
}

// Tier order
sponsor_container.appendChild(generate_group("princess",false));
sponsor_container.appendChild(generate_group("mane",false));
sponsor_container.appendChild(generate_group("sponsor",false));
