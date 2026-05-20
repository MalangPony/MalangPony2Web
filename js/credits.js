/* Generates credits list */
import * as CreditsData from "./credits_data.js";
import * as Config  from "./config.js";

// The primary roles. Populated automatically from data.
let primary_roles=[];
// These special roles are handled separately.
let special_roles=["head","princess","mane","sponsor"];
for (const entry of CreditsData.credits_list){
	if (primary_roles.includes(entry.primary)) continue;
	if (special_roles.includes(entry.primary)) continue;
	primary_roles.push(entry.primary);
}


// Shuffle groups and entries
function toShuffled(a){
	let original=Array.from(a);
	let result=[];
	while (original.length>0) {
		let random_index=Math.floor(Math.random()*original.length);
		let random_element=original.splice(random_index,1)[0];
		result.push(random_element);
	}
	return result;
}

let primary_roles_shuffled=toShuffled(primary_roles);
let entries_shuffled=toShuffled(CreditsData.credits_list);


const staff_container = document.getElementById("credits-staff-container");
const sponsor_container = document.getElementById("credits-sponsor-container");

const template_section  = document.getElementById("credits-template-section");
const template_listing  = document.getElementById("credits-template-listing");

function generate_entry(entry,list_sns=true){
	let entry_dom = template_listing.content.cloneNode(true);
	
	let cec=entry_dom.querySelector(".credits-entry-container");
	let cen=entry_dom.querySelector(".credits-entry-name");
	
	entry_dom.querySelector(".credits-entry-name > .lang-ko").innerHTML=entry.name_ko;
	entry_dom.querySelector(".credits-entry-name > .lang-en").innerHTML=entry.name_en;
	
	let cerl = entry_dom.querySelector(".credits-entry-role-list");
	if (Config.CREDITS_EXPANDABLE_ROLE_LIST){
		for (const role of entry.roles){
			let lineK = document.createElement("div");
			lineK.classList.add("credits-entry-role");
			lineK.classList.add("lang-ko");
			lineK.innerHTML = CreditsData.role_definitions[role].ko;
			cerl.appendChild(lineK);
			
			let lineE = document.createElement("div");
			lineE.classList.add("credits-entry-role");
			lineE.classList.add("lang-en");
			lineE.innerHTML = CreditsData.role_definitions[role].en;
			cerl.appendChild(lineE);
		}
		
		cen.addEventListener("click",()=>{
			cec.classList.toggle("expanded");
		});
		cen.style.cursor="pointer";
		cerl.addEventListener("click",()=>{
			cec.classList.toggle("expanded");
		});
		cerl.style.cursor="pointer";
	}else{
		cerl.style.display="none";
		cerl.remove();
	}
	

	let sns_list = entry_dom.querySelector(".credits-entry-sns-list");
	for (const sns_entry of entry.socials){
		let sns_dom = document.createElement("a");
		sns_dom.classList.add("credits-entry-sns");
		sns_dom.classList.add("link-button");
		sns_dom.classList.add("inline");
		sns_dom.classList.add("generate-icon");
		if (sns_entry.site=="naver-blog"){
			sns_dom.classList.add("icon-naver-blog");
			sns_dom.classList.add("color-naver");
		}else{
			sns_dom.classList.add("icon-"+sns_entry.site);
			sns_dom.classList.add("color-"+sns_entry.site);
		}
		sns_dom.href=sns_entry.link;
		sns_dom.target="_blank";
		sns_dom.innerHTML=sns_entry.handle;
		sns_list.appendChild(sns_dom);
	}
	if (!list_sns) sns_list.style.display="none";
	
	return entry_dom;
}

// Generate a list of people with the given primary role
function generate_group(primary_role_id,list_sns=true){
	let group=CreditsData.role_definitions[primary_role_id];
	
	let group_dom = template_section.content.cloneNode(true);
	
	group_dom.querySelector(".credits-section-name > .lang-ko").innerHTML=group.ko;
	group_dom.querySelector(".credits-section-name > .lang-en").innerHTML=group.en;
	
	let group_content_container = group_dom.querySelector(".credits-section-content");
	for (const credits_entry of entries_shuffled){
		if (credits_entry.primary !== primary_role_id) continue;
		group_content_container.appendChild(generate_entry(credits_entry,list_sns));
	}
	return group_dom;
}

// Head is always at the top
staff_container.appendChild(generate_group("head",true));
for (const group_id of primary_roles_shuffled){
	staff_container.appendChild(generate_group(group_id,true));
}

// Tier order
sponsor_container.appendChild(generate_group("princess",false));
sponsor_container.appendChild(generate_group("mane",false));
sponsor_container.appendChild(generate_group("sponsor",false));
