/* Generates credits list */

const credits_list=[
	{
		name_ko:"종이수술",
		name_en:"PaperSurgery",
		socials:{
			twitter:"https://x.com/PaperSurgery"
		},
		roles:["head","design"],
		primary:"head",
		profile_pic:null
	},
	{
		name_ko:"메가타로",
		name_en:"Megatarot",
		socials:{
		},
		roles:["accounting"],
		primary:"accounting",
		profile_pic:null
	},
	{
		name_ko:"쇼트케이크",
		name_en:"Shortcake Sweets",
		socials:{
		},
		roles:["accounting"],
		primary:"accounting",
		profile_pic:null
	},
	{
		name_ko:"디바인",
		name_en:"Nine the Divine",
		socials:{
		},
		roles:["pr"],
		primary:"pr",
		profile_pic:null
	},
	{
		name_ko:"양말",
		name_en:"SheepPony",
		socials:{
		},
		roles:["web","design"],
		primary:"web",
		profile_pic:null
	},
	{
		name_ko:"TruthOrMare",
		name_en:"TruthOrMare",
		socials:{
		},
		roles:["assistant"],
		primary:"assistant",
		profile_pic:null
	},
	{
		name_ko:"EightonEight",
		name_en:"EightonEight",
		socials:{
		},
		roles:["assistant"],
		primary:"assistant",
		profile_pic:null
	},
	{
		name_ko:"IZuchi",
		name_en:"IZuchi",
		socials:{
		},
		roles:["artist","design"],
		primary:"artist",
		profile_pic:null
	},
	{
		name_ko:"마렌",
		name_en:"Marenlicious",
		socials:{
		},
		roles:["artist","design"],
		primary:"artist",
		profile_pic:null
	},
	

	{
		name_ko:"김스폰",
		name_en:"Kim Spon",
		socials:{},
		roles:["sponsor"],
		primary:"sponsor",
		profile_pic:null
	},
	{
		name_ko:"박스폰",
		name_en:"Park Spon",
		socials:{},
		roles:["sponsor"],
		primary:"sponsor",
		profile_pic:null
	},
	{
		name_ko:"리스폰",
		name_en:"Lee Spon",
		socials:{},
		roles:["sponsor"],
		primary:"sponsor",
		profile_pic:null
	},
	{
		name_ko:"김식스",
		name_en:"Kim Six",
		socials:{},
		roles:["mane"],
		primary:"mane",
		profile_pic:null
	},
	{
		name_ko:"이식스",
		name_en:"Lee Six",
		socials:{},
		roles:["mane"],
		primary:"mane",
		profile_pic:null
	},
	{
		name_ko:"김공주",
		name_en:"Kim Prin",
		socials:{},
		roles:["princess"],
		primary:"princess",
		profile_pic:null
	},

/*
	{
		name_ko:"",
		name_en:"",
		socials:{
		},
		roles:[],
		group:"",
		profile_pic:null
	},*/
];

// Roles
const role_definitions={
	head:{en:"Con Head",ko:"행사 주최"},
	design:{en:"Design",ko:"디자인"},
	accounting:{en:"Accounting",ko:"재무"},
	pr:{en:"Public Relations",ko:"SNS 관리"},
	web:{en:"Web Programming",ko:"웹 개발"},
	assistant:{en:"Assistant",ko:"서무"},
	artist:{en:"Art",ko:"아티스트"},
	princess:{en:"Royal Princess",ko:"로얄 프린세스"},
	mane:{en:"Mane Six",ko:"메인식스"},
	sponsor:{en:"Sponsor",ko:"스폰서"}
};

// The primary roles. Populated automatically from data.
let primary_roles=[];
// These special roles are handled separately.
let special_roles=["head","princess","mane","sponsor"];
for (const entry of credits_list){
	if (primary_roles.includes(entry.primary)) continue;
	if (special_roles.includes(entry.primary)) continue;
	primary_roles.push(entry.primary);
}


// Shuffle groups
let primary_roles_shuffled=[];
while (primary_roles.length>0) {
	let random_index=Math.floor(Math.random()*primary_roles.length);
	let random_element=primary_roles.splice(random_index,1)[0];
	if (random_element=="head")
		primary_roles_shuffled.unshift(random_element);
	else
		primary_roles_shuffled.push(random_element);
}
primary_roles=primary_roles_shuffled;


const staff_container = document.getElementById("credits-staff-container");
const sponsor_container = document.getElementById("credits-sponsor-container");

const template_section  = document.getElementById("credits-template-section");
const template_listing  = document.getElementById("credits-template-listing");

// Generate a list of people with the given primary role
function generate_group(primary_role_id){
	let group=role_definitions[primary_role_id];
	
	let group_dom = template_section.content.cloneNode(true);
	
	group_dom.querySelector(".credits-section-name > .langspan-ko").innerHTML=group.ko;
	group_dom.querySelector(".credits-section-name > .langspan-en").innerHTML=group.en;
	
	let group_content_container = group_dom.querySelector(".credits-section-content");
	for (const entry of credits_list){
		if (entry.primary !== primary_role_id) continue;
		
		let entry_dom = template_listing.content.cloneNode(true);
		
		
		entry_dom.querySelector(".credits-entry-name > .langspan-ko").innerHTML=entry.name_ko;
		entry_dom.querySelector(".credits-entry-name > .langspan-en").innerHTML=entry.name_en;
		
		let role_list=entry_dom.querySelector(".credits-entry-role-list");
		for (const role_id of entry.roles){
			let role=role_definitions[role_id];
			console.log(role_id,role);
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
