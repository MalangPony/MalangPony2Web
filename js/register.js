import * as TierData from "./tier_data.js";

// Parse all the data above

const tier_entry_template=document.getElementById("register-tier-entry-template");
const tier_perk_template=document.getElementById("register-tier-perk-template");
const tier_list=document.getElementById("register-tiers-list");


for (const tier_id in TierData.tiers_data){
	let tier_data=TierData.tiers_data[tier_id];
	let tier_dom = tier_entry_template.content.cloneNode(true);
	let tier_dom_inner=tier_dom.querySelector(".register-tier-entry");
	
	tier_dom_inner.classList.add(tier_data.css_class);
	
	tier_dom.querySelector(".register-tier-name.lang-ko").innerHTML=tier_data.name_ko;
	tier_dom.querySelector(".register-tier-name.lang-en").innerHTML=tier_data.name_en;
	
	tier_dom.querySelector(".register-tier-description.lang-ko").innerHTML=tier_data.desc_ko;
	tier_dom.querySelector(".register-tier-description.lang-en").innerHTML=tier_data.desc_en;
	
	tier_dom.querySelector(".register-tier-price.lang-ko").innerHTML=
		tier_data.price+",000원";
	tier_dom.querySelector(".register-tier-price.lang-en").innerHTML=
		tier_data.price+",000 KRW";
		
	tier_dom.querySelector(".register-tier-icon").src=tier_data.icon;
	
	if (Number.isFinite(tier_data.limit)){
		tier_dom.querySelector(".register-tier-limit.lang-ko").innerHTML=
			tier_data.limit+"명 한정";
		tier_dom.querySelector(".register-tier-limit.lang-en").innerHTML=
			"limited to "+tier_data.limit+" persons";
	}else{
		tier_dom.querySelector(".register-tier-limit.lang-ko").style.disply="none";
		tier_dom.querySelector(".register-tier-limit.lang-en").style.disply="none";
	}
	
	let tier_margin_top = tier_data.margin_top;
	if (tier_margin_top) 
		tier_dom.querySelector(".register-tier-entry").style.marginTop=tier_margin_top+"px";
	
	
	
	// OOP programmer try not to use inheritance relationship in their code challenge (IMPOSSIBLE)
	let tier_inheritance_chain=[]; //[0] is the root. [-1] is the current tier.
	let perk_overwrite_map={}; // k gets overwritten by v
	let tier_ptr=tier_id;
	while (tier_ptr){
		if (TierData.tiers_data[tier_ptr].perks_list.length>0){
			tier_inheritance_chain.unshift(tier_ptr);
			for( const perk_id of TierData.tiers_data[tier_ptr].perks_list ){
				if (TierData.perks_data[perk_id].overwrites){
					perk_overwrite_map[TierData.perks_data[perk_id].overwrites]=perk_id;
				}
			}
		}
		// Walk up the inheritance chain
		tier_ptr=TierData.tiers_data[tier_ptr].inherits;
	}
	
	let perks_list_dom=tier_dom.querySelector(".register-tier-perks-list");
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
			
			let desc_ko=TierData.perks_data[perk_id].desc_ko;
			let desc_en=TierData.perks_data[perk_id].desc_en;
			if (!desc_ko) desc_ko="설명 설명 설명...";
			if (!desc_en) desc_en="Explanation goes here...";
			
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
	
	
	tier_dom_inner.addEventListener("click",()=>{
		tier_dom_inner.classList.toggle("tier-detail-mode");
	});
	
	tier_list.appendChild(tier_dom);
}
