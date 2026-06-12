/* Generates credits list */
import * as CreditsData from "./credits_data.js";
import * as Config  from "./config.js";
import * as Utils from "./utils.js";

// Pre-process CreditsData.categories
let expected_primary_roles=[];
let sorted_primaries={};


for (const c in CreditsData.categories){
	let sortarr=[];
	for (const i of CreditsData.categories[c]){
		let s = i.split("/")
		let sortval = parseInt(s[0])+Math.random();
		let role = s[1];
		//console.log(sortval,role);
		sortarr.push([sortval,role]);
		
		expected_primary_roles.push(role);
	}
	
	sortarr.sort((a, b) => a[0] - b[0]);
	
	//console.log(sortarr);
	
	sorted_primaries[c] = sortarr.map((e) => e[1]);
	
	//console.log(sorted_primaries[c]);
}

for (const ce of CreditsData.credits_list){
	if (!expected_primary_roles.includes(ce.primary)){
		throw new Error("Unexpected primary role! "+ce.primary);
	}
}

let entries_shuffled=Utils.shuffle_array(CreditsData.credits_list);


const core_container = document.getElementById("credits-core-container");
const sponsor_container = document.getElementById("credits-sponsor-container");
//const site_container = document.getElementById("credits-site-container");
const guest_container = document.getElementById("credits-guest-container");

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


for (const group_id of sorted_primaries.core_staff){
	core_container.appendChild(generate_group(group_id,true));
}
/*
for (const group_id of sorted_primaries.site_staff){
	site_container.appendChild(generate_group(group_id,true));
}*/
for (const group_id of sorted_primaries.guests){
	guest_container.appendChild(generate_group(group_id,true));
}
for (const group_id of sorted_primaries.sponsors){
	sponsor_container.appendChild(generate_group(group_id,false));
}
