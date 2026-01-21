import * as TierData from "./tier_data.js";

// Parse all the data above
const tier_entry_template=document.getElementById("register-tier-entry-template");
const tier_perk_template=document.getElementById("register-tier-perk-template");
const tier_list_container=document.getElementById("register-tiers-list");
const tier_table_container = document.getElementById("register-tiers-table");

const tierid_list=Object.keys(TierData.tiers_data);
const perkid_list=Object.keys(TierData.perks_data);
const len_tiers=Object.keys(TierData.tiers_data).length;
const len_perks=Object.keys(TierData.perks_data).length;

// Pre-calculate inheritance
let tier_inheritance_chains={};
let perk_overwrite_maps={};

// Tier <=> Perk mapping, after inheritance and overwrites
let tier_to_all_perks={}; // K:tierid V: list of perkids
let perk_to_all_tiers={}; // K:perkid V: list of tierids
for (const tierid in TierData.tiers_data) tier_to_all_perks[tierid]=[];
for (const perkid in TierData.perks_data) perk_to_all_tiers[perkid]=[];

for (const tier_id in TierData.tiers_data){
	// OOP programmer try not to use inheritance relationship in their code challenge (IMPOSSIBLE)
	let tier_inheritance_chain=[]; //[0] is the root. [-1] is the current tier.
	let perk_overwrite_map={}; // k gets overwritten by v
	let tier_ptr=tier_id;
	while (tier_ptr){
		tier_inheritance_chain.unshift(tier_ptr);
		for( const perk_id of TierData.tiers_data[tier_ptr].perks_list ){
			
			tier_to_all_perks[tier_id].push(perk_id);
			perk_to_all_tiers[perk_id].push(tier_id);
			
			if (TierData.perks_data[perk_id].overwrites === undefined) continue;
			
			for (const ow of TierData.perks_data[perk_id].overwrites){
				if (perk_overwrite_map[ow] !== undefined) continue;
				perk_overwrite_map[ow]=perk_id;
			}
		}
		
		// Walk up the inheritance chain
		tier_ptr=TierData.tiers_data[tier_ptr].inherits;
	}
	tier_inheritance_chains[tier_id]=tier_inheritance_chain;
	perk_overwrite_maps[tier_id]=perk_overwrite_map;
	
	// Remove any perks that were overwritten
	for (const k in perk_overwrite_map){
		tier_to_all_perks[tier_id]=tier_to_all_perks[tier_id].filter((e)=>{return e!==k});
		perk_to_all_tiers[k]=perk_to_all_tiers[k].filter((e)=>{return e!==tier_id});
	}
}

for (const tier_id in TierData.tiers_data){
	let tier_data=TierData.tiers_data[tier_id];
	let tier_dom = tier_entry_template.content.cloneNode(true);
	let tier_dom_inner=tier_dom.querySelector(".register-tier-entry");
	let tier_inheritance_chain = tier_inheritance_chains[tier_id];
	let perk_overwrite_map = perk_overwrite_maps[tier_id];
	
	tier_dom_inner.classList.add(tier_data.css_class);
	
	tier_dom.querySelector(".register-tier-name.lang-ko").innerHTML=tier_data.name_ko;
	tier_dom.querySelector(".register-tier-name.lang-en").innerHTML=tier_data.name_en;
	
	tier_dom.querySelector(".register-tier-description.lang-ko").innerHTML=tier_data.desc_ko;
	tier_dom.querySelector(".register-tier-description.lang-en").innerHTML=tier_data.desc_en;
	
	tier_dom.querySelector(".register-tier-price.lang-ko").innerHTML=
		tier_data.price+",000원";
	tier_dom.querySelector(".register-tier-price.lang-en").innerHTML=
		tier_data.price+",000 KRW";
		
	tier_dom.querySelector(".register-tier-icon").src=tier_data.icon_dark;
	
	if (Number.isFinite(tier_data.limit)){
		tier_dom.querySelector(".register-tier-limit.lang-ko").innerHTML=
			tier_data.limit+"명 한정";
		tier_dom.querySelector(".register-tier-limit.lang-en").innerHTML=
			"Limited to "+tier_data.limit+" persons";
	}else{
		tier_dom.querySelector(".register-tier-limit.lang-ko").style.disply="none";
		tier_dom.querySelector(".register-tier-limit.lang-en").style.disply="none";
	}
	
	// Setup registration link
	let reg_button_div = tier_dom.querySelector(".register-tier-button");
	for (const dom of reg_button_div.children){
		if (dom.classList.contains("reg-button-"+tier_data.reg_button_class)){
			
		}else{
			dom.style.display="none";
		}
	}
	
	let tier_margin_top = tier_data.margin_top;
	let insert_divider = tier_data.insert_divider;
	
	if (insert_divider){
		let divider=document.createElement("div");
		divider.classList.add("register-tier-divider");
		if (tier_margin_top){
			divider.style.marginTop=(tier_margin_top/2)+"px";
			divider.style.marginBottom=(tier_margin_top/2)+"px";
		}
		tier_list_container.appendChild(divider);
	}else if (tier_margin_top){
		tier_dom.querySelector(".register-tier-entry").style.marginTop=tier_margin_top+"px";
	}
	
	
	let perks_list_dom=tier_dom.querySelector(".register-tier-perks-list");
	// Walk down the inheritance chain.
	for (const inherited_tid of tier_inheritance_chain){
		let inherited_tdata = TierData.tiers_data[inherited_tid];
		
		
		if ((tier_inheritance_chain.length>1) && (inherited_tid === tier_id)){
			// This is the original tier, not inherited.
			/*
			let perk_inherit_divider = document.createElement("div");
			perk_inherit_divider.classList.add(inherited_tdata.css_class);
			perk_inherit_divider.classList.add("register-tier-perks-inherit-divider");
			perk_inherit_divider.innerHTML="+";
			perks_list_dom.appendChild(perk_inherit_divider);*/
			let perk_inherit_marker = document.createElement("div");
			perk_inherit_marker.classList.add(inherited_tdata.css_class);
			perk_inherit_marker.classList.add("register-tier-perks-inherit-marker");
			perk_inherit_marker.innerHTML="+";
			perks_list_dom.appendChild(perk_inherit_marker);
		}
		/*
		let perks_row_dom=document.createElement("div");
		perks_row_dom.classList.add("register-tier-perks-row");
		*/
		
		for( const perk_id of inherited_tdata.perks_list ){
			let perk_dom = tier_perk_template.content.cloneNode(true);
			
			perk_dom.querySelector(".perk-name .lang-ko").innerHTML=
				TierData.perks_data[perk_id].name_ko;
			perk_dom.querySelector(".perk-name .lang-en").innerHTML=
				TierData.perks_data[perk_id].name_en;
			
			let exr = TierData.perks_data[perk_id].explanation_required
				
			let desc_ko=TierData.perks_data[perk_id].desc_ko;
			let desc_en=TierData.perks_data[perk_id].desc_en;
			if (!desc_ko) desc_ko="설명 설명 설명...";
			if (!desc_en) desc_en="Explanation goes here...";
			
			/*
			if (!exr) {
				desc_ko="";
				desc_en="";
			}*/
			
			
			let overwritten_by=perk_overwrite_map[perk_id];
			if (overwritten_by){
				perk_dom.querySelector(".register-tier-perk").classList.add("perk-overwritten");
				desc_ko="아래 <strong>"+TierData.perks_data[overwritten_by].name_ko+"</strong>으로 대체됩니다."
				desc_en="Replaced by <strong>"+TierData.perks_data[overwritten_by].name_en+"</strong> below."
			}
			
			perk_dom.querySelector(".perk-detail .lang-ko").innerHTML=
				desc_ko;
			perk_dom.querySelector(".perk-detail .lang-en").innerHTML=
				desc_en;
			
			
			if (inherited_tid !== tier_id){
				perk_dom.querySelector(".register-tier-perk").classList.add("perk-inherited");
			}
			
			perk_dom.querySelector(".register-tier-perk").classList.add(
				inherited_tdata.css_class);
			
			//perks_row_dom.appendChild(perk_dom);
			perks_list_dom.appendChild(perk_dom);
		}
		//perks_list_dom.appendChild(perks_row_dom);
	}
	
	
	perks_list_dom.addEventListener("click",()=>{
		tier_dom_inner.classList.toggle("tier-detail-mode");
	});
	
	tier_list_container.appendChild(tier_dom);
}

let rsl=new ResizeObserver(()=>{
	if (tier_list_container.clientWidth<500) tier_list_container.classList.add("narrow");
	else tier_list_container.classList.remove("narrow");
	
});
rsl.observe(tier_list_container);

export function close_all_tierboxes(){
	let entries=document.querySelectorAll(".register-tier-entry");
	for (const dom of entries){
		dom.classList.remove("tier-detail-mode");
	}
}


// List of cell DOMs, indexed by row and cols
let cell_dom_list_by_tier={};
let cell_dom_list_by_perk={};
let all_cell_doms=[];
for (const tier_id in TierData.tiers_data) cell_dom_list_by_tier[tier_id]=[];
for (const perk_id in TierData.perks_data) cell_dom_list_by_perk[perk_id]=[];
let tier_header_doms={};
let perk_header_doms={};
let desc_containers_by_perk={};

function set_focus(tier_id=null,perk_id=null){
	if (tier_id==null && perk_id==null){
		// Clear all focuses
		for (const dom of all_cell_doms) dom.classList.remove("unfocused");
		
		for (const p in desc_containers_by_perk) 
			desc_containers_by_perk[p].classList.remove("unfocused");
		
	}else if(tier_id==null){
		// Selected a perk
		for (const dom of all_cell_doms) dom.classList.add("unfocused");
		// focus on current perk
		for (const dom of cell_dom_list_by_perk[perk_id])
			dom.classList.remove("unfocused");
		// focus on all tier headers selected by current perk
		for (const tier_id of perk_to_all_tiers[perk_id])
			tier_header_doms[tier_id].classList.remove("unfocused");
		
		for (const p in desc_containers_by_perk) {
			if (p!=perk_id)
				desc_containers_by_perk[p].classList.add("unfocused");
			else
				desc_containers_by_perk[p].classList.remove("unfocused");
		}
		
	}else if(perk_id==null){
		// Selected a tier
		for (const dom of all_cell_doms) dom.classList.add("unfocused");
		// focus on current tier
		for (const dom of cell_dom_list_by_tier[tier_id])
			dom.classList.remove("unfocused");
		
		for (const p in desc_containers_by_perk) 
			desc_containers_by_perk[p].classList.add("unfocused");
		
		// focus on all perk headers selected by current tier
		for (const p of tier_to_all_perks[tier_id]){
			perk_header_doms[p].classList.remove("unfocused");
			console.log("Perk",p);
			let dc=desc_containers_by_perk[p];
			console.log(dc);
			if (dc!==undefined){
				dc.classList.remove("unfocused");
				console.log(dc.classList);
			}
			
		}
		
	}else{
		// Focus on a cell
		for (const dom of all_cell_doms) dom.classList.add("unfocused");
		for (const dom of cell_dom_list_by_tier[tier_id])
			dom.classList.remove("unfocused");
		for (const dom of cell_dom_list_by_perk[perk_id])
			dom.classList.remove("unfocused");
		
		for (const p in desc_containers_by_perk) {
			if (p!=perk_id)
				desc_containers_by_perk[p].classList.add("unfocused");
			else
				desc_containers_by_perk[p].classList.remove("unfocused");
		}
	}
	
	/*
	for (const p in desc_containers_by_perk) 
		desc_containers_by_perk[p].classList.remove("expanded");
	if (perk_id !== null){
		desc_containers_by_perk[perk_id].classList.add("expanded");
	}*/	
}


let table=document.createElement("table");
table.classList.add("tier-table");

let header_row = document.createElement("tr");
header_row.classList.add("tier-table-header-row");

let corner_cell = document.createElement("th");
table.classList.add("tier-table-corner-cell");
header_row.appendChild(corner_cell);
all_cell_doms.push(corner_cell);

for (const tier_id in TierData.tiers_data){
	let cell = document.createElement("th");
	cell.classList.add("tier-table-header-cell");
	cell.classList.add(TierData.tiers_data[tier_id].css_class);
	
	let header_cell_inner = document.createElement("div");
	header_cell_inner.classList.add("tier-table-header-cell-inner");
	header_cell_inner.classList.add("cell-inner-div");
	header_cell_inner.classList.add("unfocus-able");
	
	let header_cell_bottom_bar = document.createElement("div");
	header_cell_bottom_bar.classList.add("tier-table-header-cell-bottom-bar");
	header_cell_inner.appendChild(header_cell_bottom_bar);
	
	let header_cell_rotator = document.createElement("div");
	header_cell_rotator.classList.add("tier-table-header-cell-rotator");
	header_cell_inner.appendChild(header_cell_rotator);
	
	let header_cell_icon = document.createElement("img");
	header_cell_icon.classList.add("tier-table-header-icon");
	header_cell_icon.src=TierData.tiers_data[tier_id].icon_orig;
	header_cell_rotator.appendChild(header_cell_icon);
	
	let header_cell_name = document.createElement("div");
	header_cell_name.classList.add("tier-table-header-name");
	header_cell_rotator.appendChild(header_cell_name);
	
	let name_ko = document.createElement("span");
	name_ko.innerHTML=TierData.tiers_data[tier_id].name_ko;
	name_ko.classList.add("lang-ko");
	header_cell_name.appendChild(name_ko);
	
	let name_en = document.createElement("span");
	name_en.innerHTML=TierData.tiers_data[tier_id].name_en;
	name_en.classList.add("lang-en");
	header_cell_name.appendChild(name_en);
	
	header_cell_rotator.addEventListener("mouseenter",()=>{
		set_focus(tier_id,null);
	});
	header_cell_rotator.addEventListener("mouseleave",()=>{
		set_focus();
	});
	
	cell.appendChild(header_cell_inner);
	cell_dom_list_by_tier[tier_id].push(cell);
	all_cell_doms.push(cell);
	tier_header_doms[tier_id]=cell;
	header_row.appendChild(cell);
}
table.appendChild(header_row);

for (const perk_id in TierData.perks_data){
	let row = document.createElement("tr");
	row.classList.add("tier-table-data-row");
	
	let has_explanation=TierData.perks_data[perk_id].explanation_required;
	
	if (has_explanation)
		row.classList.add("tier-table-data-row-with-explanation");
	
	let firstcell = document.createElement("td");
	firstcell.classList.add("tier-table-perk-name");
	cell_dom_list_by_perk[perk_id].push(firstcell);
	all_cell_doms.push(firstcell);
	perk_header_doms[perk_id]=firstcell;
	
	firstcell.addEventListener("mouseenter",()=>{
		set_focus(null,perk_id);
	});
	firstcell.addEventListener("mouseleave",()=>{
		set_focus();
	});
	
	let perk_name_inner = document.createElement("div");
	perk_name_inner.classList.add("tier-table-perk-name-inner");
	perk_name_inner.classList.add("unfocus-able");
	perk_name_inner.classList.add("cell-inner-div");
	firstcell.appendChild(perk_name_inner);
	
	let perk_name_inner_icon = document.createElement("div");
	perk_name_inner_icon.classList.add("tier-table-perk-name-inner-icon");
	perk_name_inner.appendChild(perk_name_inner_icon);
	
	if (!has_explanation) perk_name_inner_icon.innerHTML="";
	else perk_name_inner_icon.innerHTML="help";
	
	let perk_name_inner_text = document.createElement("div");
	perk_name_inner_text.classList.add("tier-table-perk-name-inner-text");
	perk_name_inner.appendChild(perk_name_inner_text);
	
	
	
	let perk_name_ko=document.createElement("span");
	perk_name_ko.classList.add("lang-ko");
	perk_name_ko.innerHTML=TierData.perks_data[perk_id].name_ko;
	perk_name_inner_text.appendChild(perk_name_ko);
	
	let perk_name_en=document.createElement("span");
	perk_name_en.classList.add("lang-en");
	perk_name_en.innerHTML=TierData.perks_data[perk_id].name_en;
	perk_name_inner_text.appendChild(perk_name_en);
	
	row.appendChild(firstcell);
	
	for (const tier_id in TierData.tiers_data){
		let cell = document.createElement("td");
		cell.classList.add("tier-table-boolean-cell");
		cell.classList.add(TierData.tiers_data[tier_id].css_class);
		if (has_explanation){
			cell.setAttribute("rowspan",2);
		}
		
		
		let cell_inner = document.createElement("div");
		cell_inner.classList.add("tier-table-boolean-cell-inner");
		cell_inner.classList.add("unfocus-able");
		cell_inner.classList.add("cell-inner-div");
		// O(n) operation inside a double for loop... ehh whatever
		let perk_included=tier_to_all_perks[tier_id].includes(perk_id)
		if (perk_included){
			cell_inner.innerHTML="check";
			cell_inner.classList.add("cell-true");
		}else{
			cell_inner.innerHTML="close";
			cell_inner.classList.add("cell-false");
		}
		
		cell.addEventListener("mouseenter",()=>{
			set_focus(tier_id,perk_id);
		});
		cell.addEventListener("mouseleave",()=>{
			set_focus();
		});
		
		cell.appendChild(cell_inner);
		cell_dom_list_by_tier[tier_id].push(cell);
		cell_dom_list_by_perk[perk_id].push(cell);
		all_cell_doms.push(cell);
		row.appendChild(cell);
	}
	
	table.appendChild(row);
	
	if (has_explanation){
		let row2 = document.createElement("tr");
		row2.classList.add("tier-table-explain-row");
		
		
		let desc_cell = document.createElement("td");
		desc_cell.classList.add("tier-table-explain-cell");
		//desc_cell.setAttribute("colspan",1+len_tiers);
		cell_dom_list_by_perk[perk_id].push(desc_cell);
		all_cell_doms.push(desc_cell);
		desc_containers_by_perk[perk_id]=desc_cell;
		
		let desc_inner = document.createElement("div");
		desc_inner.classList.add("tier-table-explain-cell-inner");
		desc_inner.classList.add("cell-inner-div");
		desc_inner.classList.add("unfocus-able");
		
		let desc_texts = document.createElement("div");
		desc_texts.classList.add("tier-table-explain-cell-inner-text");
		desc_inner.appendChild(desc_texts);
		
		let desc_en=document.createElement("span");
		desc_en.classList.add("lang-en");
		desc_en.innerHTML=TierData.perks_data[perk_id].desc_en;
		desc_texts.appendChild(desc_en);
		
		let desc_ko=document.createElement("span");
		desc_ko.classList.add("lang-ko");
		desc_ko.innerHTML=TierData.perks_data[perk_id].desc_ko;
		desc_texts.appendChild(desc_ko);
		
		desc_cell.appendChild(desc_inner);
		
		row2.addEventListener("mouseenter",()=>{
			set_focus(null,perk_id);
		});
		row2.addEventListener("mouseleave",()=>{
			set_focus();
		});
		
		row2.appendChild(desc_cell);
		table.appendChild(row2);
		
		let expanded=false;
		firstcell.addEventListener("click",()=>{
			expanded= !expanded;
			if (expanded) {
				row2.classList.add("expanded");
				perk_name_inner_icon.innerHTML="chevron_line_up";
			}
			else {
				row2.classList.remove("expanded");
				perk_name_inner_icon.innerHTML="help";
			}
		});
	}
	
	
	
}
tier_table_container.appendChild(table);


// Set up buttons
const button_dom_l2t = document.getElementById("register-switch-to-table");
const button_dom_t2l = document.getElementById("register-switch-to-list");
button_dom_l2t.addEventListener("click",()=>{
	button_dom_l2t.style.display="none";
	button_dom_t2l.style.display="flex";
	
	tier_list_container.style.display="none";
	tier_table_container.style.display="block";
});
button_dom_t2l.addEventListener("click",()=>{
	button_dom_l2t.style.display="flex";
	button_dom_t2l.style.display="none";
	
	tier_list_container.style.display="flex";
	tier_table_container.style.display="none";
});
