/* Generates credits list */
import * as FAQData from "./faq_data.js";


const list_container = document.getElementById("faq-container");

const entry_template  = document.getElementById("faq-entry-template");


function generate_entry(data){
	let entry_dom = entry_template.content.cloneNode(true);

	let entry_root=entry_dom.querySelector(".faq-entry");
	let top=entry_dom.querySelector(".faq-top");
	
	let qtext_ko=entry_dom.querySelector(".faq-question-text.lang-ko");
	let qtext_en=entry_dom.querySelector(".faq-question-text.lang-en");
	let atext_ko=entry_dom.querySelector(".faq-answer-text.lang-ko");
	let atext_en=entry_dom.querySelector(".faq-answer-text.lang-en");
	
	let expander_icon=entry_dom.querySelector(".faq-expander-icon");
	
	qtext_ko.innerHTML=data.qtext_ko;
	qtext_en.innerHTML=data.qtext_en;
	atext_ko.innerHTML=data.atext_ko;
	atext_en.innerHTML=data.atext_en;
	
	function expand(){
		if (entry_root.classList.contains("faq-expanded")){
			entry_root.classList.remove("faq-expanded");
			expander_icon.innerHTML="unfold_more";
		}else{
			entry_root.classList.add("faq-expanded");
			expander_icon.innerHTML="chevron_line_up";
		}
	}
	top.addEventListener("click",expand);
	top.style.cursor="pointer";

	return entry_dom;
}

for(const question of FAQData.questions){
	list_container.appendChild(generate_entry(question));
}
