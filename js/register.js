import * as TierData from "./tier_data.js";

// Parse all the data above

const tier_entry_template=document.getElementById("register-tier-entry-template");
const tier_perk_template=document.getElementById("register-tier-perk-template");
const tier_list=document.getElementById("register-tiers-list");


for (const tier_id in TierData.tiers_data){
	let tier=TierData.tiers_data[tier_id];
	let tier_dom = tier_entry_template.content.cloneNode(true);
	let tier_dom_inner=tier_dom.querySelector(".register-tier-entry");
	
	tier_dom_inner.classList.add(tier.css_class);
	
	tier_dom.querySelector(".register-tier-name.langdiv-ko").innerHTML=tier.name_ko;
	tier_dom.querySelector(".register-tier-name.langdiv-en").innerHTML=tier.name_en;
	
	tier_dom.querySelector(".register-tier-description.langdiv-ko").innerHTML=tier.desc_ko;
	tier_dom.querySelector(".register-tier-description.langdiv-en").innerHTML=tier.desc_en;
	
	tier_dom.querySelector(".register-tier-price.langdiv-ko").innerHTML=
		tier.price+",000원";
	tier_dom.querySelector(".register-tier-price.langdiv-en").innerHTML=
		tier.price+",000 KRW";
	
	if (Number.isFinite(tier.limit)){
		tier_dom.querySelector(".register-tier-limit.langdiv-ko").innerHTML=
			tier.limit+"명 한정";
		tier_dom.querySelector(".register-tier-limit.langdiv-en").innerHTML=
			"limited to "+tier.limit+" persons";
	}else{
		tier_dom.querySelector(".register-tier-limit.langdiv-ko").style.disply="none";
		tier_dom.querySelector(".register-tier-limit.langdiv-en").style.disply="none";
	}
	
	let tier_margin_top = tier.margin_top;
	if (tier_margin_top) 
		tier_dom.querySelector(".register-tier-entry").style.marginTop=tier_margin_top+"px";
	
	
	let perks_id_list=[];
	let perks_original_tier={};
	let perk_overwritten_by={};
	let tier_ptr=tier_id;
	while (tier_ptr){
		// Concatenate the perks list
		perks_id_list=TierData.tiers_data[tier_ptr].perks_list.concat(perks_id_list);
		// Set the original-tier map
		for (const perk_id of TierData.tiers_data[tier_ptr].perks_list){
			perks_original_tier[perk_id]=tier_ptr;
		}
		// Walk up the inheritance chain
		tier_ptr=TierData.tiers_data[tier_ptr].inherits;
	}
	
	// Check if overwritten
	for( const perk_id of perks_id_list ){
		if (TierData.perks_data[perk_id].overwrites){
			if (TierData.perks_data[perk_id].overwrites in perks_original_tier){
				perk_overwritten_by[TierData.perks_data[perk_id].overwrites]=perk_id;
			}
		}
	}
	
	let perks_list_dom=tier_dom.querySelector(".register-tier-perks-list");
	for( const perk_id of perks_id_list ){
		let perk_dom = tier_perk_template.content.cloneNode(true);
		
		perk_dom.querySelector(".perk-name .langspan-ko").innerHTML=
			TierData.perks_data[perk_id].name_ko;
		perk_dom.querySelector(".perk-name .langspan-en").innerHTML=
			TierData.perks_data[perk_id].name_en;
		
		let desc_ko=TierData.perks_data[perk_id].desc_ko;
		let desc_en=TierData.perks_data[perk_id].desc_en;
		if (!desc_ko) desc_ko="설명 설명 설명...";
		if (!desc_en) desc_en="Explanation goes here...";
		
		if (perk_id in perk_overwritten_by){
			perk_dom.querySelector(".register-tier-perk").classList.add("perk-overwritten");
			desc_ko="아래 <strong>"+TierData.perks_data[perk_overwritten_by[perk_id]].name_ko+"</strong>으로 대체됩니다."
			desc_en="Replaced by <strong>"+TierData.perks_data[perk_overwritten_by[perk_id]].name_en+"</strong> below."
		}
		
		perk_dom.querySelector(".perk-detail .langspan-ko").innerHTML=
			desc_ko;
		perk_dom.querySelector(".perk-detail .langspan-en").innerHTML=
			desc_en;
		
		
		if (perks_original_tier[perk_id] !== tier_id){
			perk_dom.querySelector(".register-tier-perk").classList.add("perk-inherited");
		}
		
		perk_dom.querySelector(".register-tier-perk").classList.add(
			TierData.tiers_data[perks_original_tier[perk_id]].css_class);
		
		perks_list_dom.appendChild(perk_dom);
	}
	
	tier_dom_inner.addEventListener("click",()=>{
		tier_dom_inner.classList.toggle("tier-detail-mode");
	});
	
	tier_list.appendChild(tier_dom);
}
