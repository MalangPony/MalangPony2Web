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

// Generate a list of people with the given primary role
function generate_group(primary_role_id){
	let group=CreditsData.role_definitions[primary_role_id];
	
	let group_dom = template_section.content.cloneNode(true);
	
	group_dom.querySelector(".credits-section-name > .langspan-ko").innerHTML=group.ko;
	group_dom.querySelector(".credits-section-name > .langspan-en").innerHTML=group.en;
	
	let group_content_container = group_dom.querySelector(".credits-section-content");
	for (const entry of CreditsData.credits_list){
		if (entry.primary !== primary_role_id) continue;
		
		let entry_dom = template_listing.content.cloneNode(true);
		
		
		entry_dom.querySelector(".credits-entry-name > .langspan-ko").innerHTML=entry.name_ko;
		entry_dom.querySelector(".credits-entry-name > .langspan-en").innerHTML=entry.name_en;
		
		let role_list=entry_dom.querySelector(".credits-entry-role-list");
		for (const role_id of entry.roles){
			let role=CreditsData.role_definitions[role_id];
			let role_dom = document.createElement("div");
			role_dom.classList.add("credits-entry-role");
			
			let role_ko=document.createElement("span");
			role_ko.classList.add("langspan-ko");
			role_ko.innerHTML=role.ko;
			role_dom.appendChild(role_ko);
			
			let role_en=document.createElement("span");
			role_en.classList.add("langspan-en");
			role_en.innerHTML=role.en;
			role_dom.appendChild(role_en);
			
			role_list.appendChild(role_dom);
			
		}
		
		
		group_content_container.appendChild(entry_dom);
	}
	return group_dom;
}

// Head is always at the top
staff_container.appendChild(generate_group("head"));
for (const group_id of primary_roles){
	staff_container.appendChild(generate_group(group_id));
}

// Tier order
sponsor_container.appendChild(generate_group("princess"));
sponsor_container.appendChild(generate_group("mane"));
sponsor_container.appendChild(generate_group("sponsor"));
