/*
 * Generates the timetable page.
 * 
 * Pulls data from timetable_data.js
 * 
 */

import * as Config  from "./config.js";
import * as Utils from "./utils.js";
import * as TimetableData from "./timetable_data.js";
import * as Global from "./global.js";

// Grab DOM
const wsd = document.getElementById("whole-screen-div");

const timetable_container = document.getElementById("ttable-container");
const timetable_positoner = document.getElementById("ttable-positioner");

const ttmmbL=document.getElementById("ttmmb-left");
const ttmmbR=document.getElementById("ttmmb-right");
const buttons_container = document.getElementById("timetable-mobile-move-button");


let in_timetable_page=false;

// Parse H:M timestamp into total minutes
function parse_time(s){
	var sp=s.split(":");
	var res=0;
	if (sp.length==1) {
		return parseInt(sp[0]);
	}else if (sp.length==2) {
		return parseInt(sp[0])*60+parseInt(sp[1]);
	}else{
		console.log("Invalid time...? "+s);
		return -1;
	}
}


// Timetable UI constants. In px units.
const tt_start_t=parse_time("8:20");
const tt_block_gap_x=2;
const tt_block_gap_y=-1;
const tt_block_border_width=2.5;
const tt_px_per_minute=0.8;
const tt_tick_px=1.5;
const tt_cg_top_extension=48;
const tt_cg_bottom_extension=6;
const tt_cg_side_extension=4;
const tt_block_expanded_height=120;
const tt_block_expanded_width=260;
const tt_block_padding_lr=8;
const tt_block_y_offset=-2;

// In the actual CSS, all units are in em.
// This makes it so the timetable can be freely scaled up and down,
//   which is essential for making the table fit the page.

// Converts px values to em.
function px2em(p){
	return (p/16)+"em";
}


let domroot=document.createElement("div");
domroot.classList.add("timetable-dom-root");

// Make every child use its rel.coords when in absolute positioning.
domroot.style.position="relative";

// get data
let blocks=TimetableData.blocks;
let columns=TimetableData.columns;
let cpresets=TimetableData.color_presets;
let cgroups=TimetableData.column_groups;

// parse results
let column_x_coords={};
let column_textsizes_en={};
let column_textsizes_ko={};
let column_vertical={};
let column_widths={};
let column_expand_direction={};

let columns_to_cgroups={};
let cgroup_centers=[];

let cgroup_left={};
let cgroup_right={};

// coordinate counters
let x=0;
let max_x=0;
let max_y=0;

// Pre-parse data
// The X-coordinates for each column are accumulated and calculated here.
for (const cg of cgroups){
	cgroup_left[cg.name] =+1000000;
	cgroup_right[cg.name]=-1000000;
}
for (const col of columns){
	if (col.type=="spacer") x+=col.width;
	else if (col.type=="location"){
		column_x_coords[col.name]=x;
		column_widths[col.name]=col.width;
		column_textsizes_en[col.name]=col.text_size;
		if (col.text_size_en) column_textsizes_en[col.name]=col.text_size_en;
		column_textsizes_ko[col.name]=col.text_size;
		if (col.text_size_ko) column_textsizes_ko[col.name]=col.text_size_ko;
		column_vertical[col.name]=col.text_vertical;
		column_expand_direction[col.name]=col.expand_direction;
		
		columns_to_cgroups[col.name]=col.group;
		
		let left=x;
		let right=x+col.width;
		x+=col.width;
		
		if (left<cgroup_left[col.group])
			cgroup_left[col.group]=left;
		if (right>cgroup_right[col.group])
			cgroup_right[col.group]=right;
		
	}else{
		console.log("Invalid column"+JSON.stringify(col));
	}
	if (x>max_x) max_x=x;
}

// Column-group centers. Used in mobile mode.
let cgs_to_cgroup_name={};
for (const cg of cgroups){
	let cgc=(cgroup_left[cg.name]+cgroup_right[cg.name])/2;
	cgroup_centers.push(cgc);
	cgs_to_cgroup_name[cgc]=cg.name;
}
cgroup_centers.sort((a, b) => a - b);

let color_presets={};
for(const cp of cpresets){
	color_presets[cp.name]=cp;
}

/* Z-Index allocation
	* 
	* 5 Time tick line
	* 6 Time tick text
	* 
	* 50 Column Groups outline
	* 51 Column groups text
	* 
	* 70 Blocks
	* 81 Popup
	*/

// Block close functions for currently open blocks
let exit_functions=[];
// All times where a block starts or ends
let time_ticks=new Set();

export function close_all_timetable_blocks(){
	while (exit_functions.length>0) exit_functions.pop()();
}
Global.add_mobile_listener(()=>{
	close_all_timetable_blocks();
});


// DOM Elements
let all_blocks=[];
let all_ticks={}; // K:Minutes V:DOM
let all_cgroups={}; // K:Name V:DOM

for (const block of blocks){
	
	if (!block.display) continue;
	
	// Calculate time
	let start_time=parse_time(block.start_time);
	let end_time=parse_time(block.end_time);
	let start_time_relative=start_time-tt_start_t;
	let end_time_relative=end_time-tt_start_t;
	time_ticks.add(start_time);
	time_ticks.add(end_time);
	let duration=end_time-start_time;
	
	// Get pre-parsed data
	let vertical=column_vertical[block.column];
	let base_x=column_x_coords[block.column];
	let base_width=column_widths[block.column];
	let text_size_en=column_textsizes_en[block.column];
	let text_size_ko=column_textsizes_ko[block.column];
	let color_preset_raw=color_presets[block.color_preset];
	let bg_color=color_preset_raw.color;
	let expand_direction=column_expand_direction[block.column];
	
	// Font size
	let font_size_multiplier_en=1.0;
	let font_size_multiplier_ko=1.0;
	if (block.font_size_multiplier){
		font_size_multiplier_en=block.font_size_multiplier;
		font_size_multiplier_ko=block.font_size_multiplier;
	}
	if (block.font_size_multiplier_en){
		font_size_multiplier_en=block.font_size_multiplier_en;
	}
	if (block.font_size_multiplier_ko){
		font_size_multiplier_ko=block.font_size_multiplier_ko;
	}
	
	let padding_override_px=null;
	if (block.padding_override_px){
		padding_override_px=block.padding_override_px;
	}
	
	let colgroup=columns_to_cgroups[block.column];
	let cg_left=cgroup_left[colgroup];
	let cg_right=cgroup_right[colgroup];
	
	// DOM Elements: Block
	let block_dom=document.createElement("div");
	block_dom.classList.add("timetable-block-body");
	
	let text_dom=document.createElement("div");
	text_dom.classList.add("timetable-block-text");
	
	domroot.appendChild(block_dom);
	block_dom.appendChild(text_dom);
	
	// DOM Elements: Popup
	let popup_rail = document.createElement("div");
	popup_rail.classList.add("timetable-popup-rail");
	domroot.appendChild(popup_rail);
	
	let popup_dom=document.createElement("div");
	popup_dom.classList.add("timetable-popup-body");
	popup_rail.appendChild(popup_dom);
	
	let closebtn_dom=document.createElement("div");
	closebtn_dom.classList.add("timetable-popup-close-button");
	closebtn_dom.classList.add("hidden");
	
	let close_svg=Utils.generate_svg_cross("#000000");
	close_svg.classList.add("timetable-popup-close-svg");
	closebtn_dom.appendChild(close_svg);
	popup_dom.appendChild(closebtn_dom);
	
	let popup_content_dom=document.createElement("div");
	popup_content_dom.classList.add("timetable-popup-content-container");
	popup_dom.appendChild(popup_content_dom);
	
	let popup_title_dom = document.createElement("div");
	popup_title_dom.classList.add("timetable-popup-title");
	popup_content_dom.appendChild(popup_title_dom);
	
	// Description
	let info_time_dom_ko=document.createElement("div");
	info_time_dom_ko.classList.add("timetable-desc-time");
	info_time_dom_ko.classList.add("lang-ko");
	
	let info_time_dom_en=document.createElement("div");
	info_time_dom_en.classList.add("timetable-desc-time");
	info_time_dom_en.classList.add("lang-en");
	
	if ("time_string_override_en" in block){
		info_time_dom_ko.innerHTML=block.time_string_override_kr;
		info_time_dom_en.innerHTML=block.time_string_override_en;
	}else{
		info_time_dom_ko.innerHTML=block.start_time+" ~ "+block.end_time;
		info_time_dom_en.innerHTML=block.start_time+" ~ "+block.end_time;
	}
	popup_content_dom.appendChild(info_time_dom_ko);
	popup_content_dom.appendChild(info_time_dom_en);
	
	let info_text_dom_ko=document.createElement("div");
	info_text_dom_ko.classList.add("timetable-desc-text");
	info_text_dom_ko.classList.add("lang-ko");
	info_text_dom_ko.innerHTML=block.description_kr;
	popup_content_dom.appendChild(info_text_dom_ko);
	
	let info_text_dom_en=document.createElement("div");
	info_text_dom_en.classList.add("timetable-desc-text");
	info_text_dom_en.classList.add("lang-en");
	info_text_dom_en.innerHTML=block.description_en;
	popup_content_dom.appendChild(info_text_dom_en);
	
	// Connecting to another block
	let connecting={"T":false,"B":false,"R":false,"L":false};
	if ("connecting" in block){
		for (const c of block["connecting"]){
			if (c=="T") connecting.T=true;
			if (c=="B") connecting.B=true;
			if (c=="R") connecting.R=true;
			if (c=="L") connecting.L=true;
		}
	}
	
	// Positioning and size
	let x=base_x;
	let y=start_time_relative*tt_px_per_minute+tt_cg_top_extension;
	let w=base_width;
	let h=duration*tt_px_per_minute;
	
	if (!connecting.T) {
		y+=tt_block_gap_y;
		h-=tt_block_gap_y;
	}
	if (!connecting.B){
		h-=tt_block_gap_y;
	}
	if (!connecting.R) {
		x+=tt_block_gap_x;
		w-=tt_block_gap_x;
	}
	if (!connecting.L) {
		w-=tt_block_gap_x;
	}
	
	// Position the block
	block_dom.style.position="absolute";
	block_dom.style.zIndex=+70;
	block_dom.style.top=px2em(y);
	block_dom.style.left=px2em(x);
	block_dom.style.height=px2em(h);
	block_dom.style.width=px2em(w);
	block_dom.style.borderWidth=px2em(tt_block_border_width);
	if (padding_override_px!=null){
		block_dom.style.paddingLeft=px2em(padding_override_px);
		block_dom.style.paddingRight=px2em(padding_override_px);
	}else{
		block_dom.style.paddingLeft=px2em(tt_block_padding_lr);
		block_dom.style.paddingRight=px2em(tt_block_padding_lr);
	}
	
	// The 'rail' where the popup can slide in.
	popup_rail.style.position="absolute";
	popup_rail.style.zIndex=+80;
	popup_rail.style.display="none";
	
	// Popup is sticky
	popup_dom.style.position="sticky";
	popup_dom.style.zIndex=+81;
	popup_dom.style.top=px2em(40);
	popup_dom.style.bottom=px2em(40);
	popup_dom.style.width=px2em(240);
	popup_dom.style.display="none";
	popup_dom.style.backgroundColor=bg_color;
	popup_dom.style.borderRadius = px2em(6);
	popup_dom.style.borderWidth=px2em(tt_block_border_width);
	
	max_y=Math.max(max_y,y+h);
	
	
	let rel_start_time_gapped=(y-tt_cg_top_extension)/tt_px_per_minute;
	let rel_end_time_gapped=(y+h-tt_cg_top_extension)/tt_px_per_minute;
	
	// Expansion/Close handlers
	let expanded=false;
	let transition_in_progress=false;
	function exit(){
		if (transition_in_progress) {
			console.log("Reject exit transition, TIP=true");
			return;
		}
		if (!expanded) return;
		
		expanded=false;
		
		transition_in_progress=true;
		let anim=popup_dom.animate(
			[{ opacity: "1.0" },{ opacity: "0.0" }],
			{duration: 200,delay:0});
		anim.onfinish= () => {
			popup_dom.style.display="none";
			popup_rail.style.display="none";
			transition_in_progress=false;
		};
		if (!Global.animated) anim.finish();
		

		closebtn_dom.classList.add("hidden");
		block_dom.style.cursor="pointer";
		for (const b of all_blocks){
			b.classList.remove("defocus");
		}
		
		// Restore on-hour ticks and hide all else
		for (const tt in all_ticks){
			if (tt%60!=0) all_ticks[tt].classList.add("hidden");
			else all_ticks[tt].classList.remove("hidden");
		}
		
		for (const cgn in all_cgroups){
			all_cgroups[cgn].classList.remove("defocus");
		}
	}
	function enter(){
		if (transition_in_progress) {
			console.log("Reject enter transition, TIP=true");
			return;
		}
		if (expanded) return;
		
		expanded=true;
		
		// Calculate where the popup should go
		let popup_width=null;
		let popup_center=null;
		let popup_yoffset=0;
		let popup_rail_height=null;
		if (Global.mobile){
			popup_yoffset=Math.min(h,200);
			
			let cg_width=cg_right-cg_left;
			
			popup_width=240;
			popup_center=(cg_right+cg_left)/2.0;
		}else{
			if (expand_direction=="L"){
				popup_center=x-120;
			}else{
				popup_center=x+w+120;
			}
			popup_rail_height=h;
			popup_width=240;
		}
		
		popup_rail.style.top=px2em(y+popup_yoffset);
		popup_rail.style.left=px2em(popup_center-(popup_width/2.0));
		popup_rail.style.width=px2em(popup_width);
		if (popup_rail_height){
			popup_rail.style.height=px2em(popup_rail_height);
		}else{
			popup_rail.style.height="fit-content";
		}
		popup_dom.style.width=px2em(popup_width);
	
		popup_dom.style.display="block";
		popup_rail.style.display="block";
		
		
		transition_in_progress=true;
		let anim=popup_dom.animate(
			[{ opacity: "0.0" },{ opacity: "1.0" }],
			{duration: 200,delay:0});
		anim.onfinish= () => {
			popup_dom.style.opacity="1.0";
			transition_in_progress=false;
		};
		if (!Global.animated) anim.finish();

		closebtn_dom.classList.remove("hidden");
		block_dom.style.cursor="unset";
		
		for (const b of all_blocks){
			if (b==block_dom) b.classList.remove("defocus");
			else b.classList.add("defocus");
		}
		
		// Show only ticks for start and end time of current block
		for (const tt in all_ticks){
			if ((tt==start_time) || (tt==end_time))
				all_ticks[tt].classList.remove("hidden");
			else all_ticks[tt].classList.add("hidden");
		}
		
		// defocus all other column groups
		for (const cgn in all_cgroups){
			if (cgn==colgroup)
				all_cgroups[cgn].classList.remove("defocus");
			else
				all_cgroups[cgn].classList.add("defocus");
		}
	}
	
	
	block_dom.style.cursor="pointer";
	// Close all other blocks before entering a block
	block_dom.addEventListener("click",()=>{
		while (exit_functions.length>0) exit_functions.pop()();
		exit_functions.push(exit);
		enter();
	});
	closebtn_dom.addEventListener("click",(e)=>{
		e.stopPropagation();
		exit();
	});
	
	
	
	// Text DOM
	if (vertical)
		text_dom.style.marginRight = px2em(tt_block_y_offset);
	else
		text_dom.style.marginTop = px2em(tt_block_y_offset);
	
	var text_kr = document.createElement("span");
	text_kr.classList.add("lang-ko");
	text_kr.innerHTML=block.name_kr;
	text_kr.style.fontSize=(text_size_ko*font_size_multiplier_ko)+"em";
	text_dom.appendChild(text_kr);
	
	var text_en = document.createElement("span");
	text_en.classList.add("lang-en");
	text_en.innerHTML=block.name_en;
	text_en.style.fontSize=(text_size_en*font_size_multiplier_en)+"em";
	text_dom.appendChild(text_en);
	
	popup_title_dom.appendChild(text_kr.cloneNode(true));
	popup_title_dom.appendChild(text_en.cloneNode(true));
	
	
	// Block BG
	let radius=px2em(6);
	if (!(connecting.T || connecting.L)){
		block_dom.style.borderTopLeftRadius = radius;
	}
	if (!(connecting.T || connecting.R)){
		block_dom.style.borderTopRightRadius = radius;
	}
	if (!(connecting.B || connecting.L)){
		block_dom.style.borderBottomLeftRadius = radius;
	}
	if (!(connecting.B || connecting.R)){
		block_dom.style.borderBottomRightRadius = radius;
	}
	
	// This is used in the vendor block only.
	// Fills the block with a sharp gradient.
	if ("color_list" in color_preset_raw){
		let visual_duration=rel_end_time_gapped-rel_start_time_gapped;
		let start_time_visual = rel_start_time_gapped
		let stops=[];
		for (const m of color_preset_raw.color_transition_minutes){
			stops.push((m+start_time_relative-rel_start_time_gapped)/visual_duration);
		}
		let gradient_def="linear-gradient(to bottom"
		for (let i=0;i<color_preset_raw.color_list.length;i++){
			gradient_def=gradient_def+",";
			
			let lowstop="";
			let highstop="";
			if (i>0) lowstop=(stops[i-1]*100).toFixed(3)+"%";
			if (i<stops.length) highstop=(stops[i]*100).toFixed(3)+"%";
			
			gradient_def=gradient_def+" "+color_preset_raw.color_list[i];
			gradient_def=gradient_def+" "+lowstop;
			gradient_def=gradient_def+" "+highstop;
		}
		gradient_def=gradient_def+")";
		block_dom.style.backgroundImage=gradient_def;
	}else{
		block_dom.style.backgroundColor=bg_color;
	}
	
	if (vertical){
		block_dom.classList.add("timetable-block-vertical");
	}
	
	all_blocks.push(block_dom);
}


// time_ticks are where the blocks line up,
// But putting lines only there looks kinda weird.
// So we just populate it manually at 1-hour intervals.
// It's a Set, so don't worry about duplicates.
for (let i=9;i<24;i++){
	time_ticks.add(60*i);
}

time_ticks=Array.from(time_ticks);
time_ticks.sort();

// Create time ticks
for (const tt of time_ticks){
	let tick_dom=document.createElement("div");
	tick_dom.classList.add("timetable-tick");
	
	tick_dom.style.top=px2em(
		(tt-tt_start_t)*tt_px_per_minute+tt_tick_px/2-30+tt_cg_top_extension);
	tick_dom.style.left=0;
	tick_dom.style.height=px2em(30);
	tick_dom.style.width=px2em(max_x);
	tick_dom.style.borderBottomWidth=px2em(tt_tick_px);
	domroot.appendChild(tick_dom);
	
	max_y=Math.max(max_y,(tt-tt_start_t)*tt_px_per_minute+tt_cg_top_extension);
	
	// Left-side time text display.
	// Right-side is cloned from this DOM object.
	let timedisp_dom_L = document.createElement("div");
	timedisp_dom_L.classList.add("timetable-tick-text");
	
	var m=tt%60
	var h=Math.floor(tt/60);
	if (m<10) m="0"+m;
	else m=""+m
	if (h<10) h="0"+h;
	else h=""+h
	timedisp_dom_L.innerHTML=h+":"+m;
	
	let timedisp_dom_R= timedisp_dom_L.cloneNode(true);
	timedisp_dom_L.style.left=0;
	timedisp_dom_R.style.right=0;
	
	tick_dom.appendChild(timedisp_dom_L);
	tick_dom.appendChild(timedisp_dom_R);
	
	if (tt%60!=0) tick_dom.classList.add("hidden");
	
	all_ticks[tt]=tick_dom;
}

// Create category group display
for (const cg of cgroups){
	let left=cgroup_left[cg.name];
	let right=cgroup_right[cg.name];
	let line1EN=cg.fullname_en;
	let line1KR=cg.fullname_kr
	let line2EN=cg.line2_en;
	let line2KR=cg.line2_kr
	
	let cg_outline_dom = document.createElement("div");
	cg_outline_dom.classList.add("timetable-cgroup-outline");
	
	let cg_label_dom=document.createElement("div");
	cg_label_dom.classList.add("timetable-cgroup-label");
	
	let cg_label_text1_en=document.createElement("div");
	cg_label_text1_en.classList.add("lang-en");
	cg_label_text1_en.classList.add("timetable-cgroup-label-line1");
	
	let cg_label_text1_ko=document.createElement("div");
	cg_label_text1_ko.classList.add("lang-ko");
	cg_label_text1_ko.classList.add("timetable-cgroup-label-line1");
	
	let cg_label_text2_en=document.createElement("div");
	cg_label_text2_en.classList.add("lang-en");
	cg_label_text2_en.classList.add("timetable-cgroup-label-line2");
	
	let cg_label_text2_ko=document.createElement("div");
	cg_label_text2_ko.classList.add("lang-ko");
	cg_label_text2_ko.classList.add("timetable-cgroup-label-line2");
	
	
	cg_outline_dom.style.left=px2em(
		left-tt_cg_side_extension);
	cg_outline_dom.style.width=px2em(
		right-left+tt_cg_side_extension*2);
	cg_outline_dom.style.height=px2em(
		max_y+tt_cg_bottom_extension);
	
	cg_label_dom.style.height=px2em(tt_cg_top_extension);
	cg_outline_dom.appendChild(cg_label_dom);
	
	cg_label_text1_en.innerHTML=line1EN;
	cg_label_dom.appendChild(cg_label_text1_en);
	
	if (line2EN){
		cg_label_text2_en.innerHTML=line2EN;
		cg_label_dom.appendChild(cg_label_text2_en);
	}
	
	cg_label_text1_ko.innerHTML=line1KR;
	cg_label_dom.appendChild(cg_label_text1_ko);
	
	if (line2KR){
		cg_label_text2_ko.innerHTML=line2KR;
		cg_label_dom.appendChild(cg_label_text2_ko);
	}
	
	domroot.appendChild(cg_outline_dom);
	
	all_cgroups[cg.name]=cg_outline_dom
}

max_y=Math.max(max_y,max_y+tt_cg_bottom_extension);


// Need to do this in order for the root DOM to actually
// contain all the timetable.
domroot.style.width=px2em(max_x);
domroot.style.height=px2em(max_y);

timetable_container.appendChild(domroot);



export function enter_timetable_page(){
	in_timetable_page=true;
	update_styles();
}
export function exit_timetable_page(){
	in_timetable_page=false;
	update_styles();
	close_all_timetable_blocks();
}


// Mobile logic from here on
let cgroup_index=0;

Global.add_mobile_listener(()=>{
	update_styles();
});

// Update timetable size and position and buttons
function update_styles(){
	let active = in_timetable_page && Global.mobile;
	if (!active) buttons_container.style.display="none";
	else buttons_container.style.display="flex";
	
	if (in_timetable_page){
		if (Global.mobile){
			let cgroup_center_px = cgroup_centers[cgroup_index];
			let cgroup_center_em=px2em(cgroup_center_px);
			
			let positioner_width=timetable_positoner.clientWidth;
			let positioner_center_px=positioner_width/2;
			
			let margin=`calc(${positioner_center_px}px - ${cgroup_center_em})`;
			timetable_container.style.marginLeft=margin;
			
			if (cgroup_index===(cgroup_centers.length-1)) ttmmbR.classList.add("disabled");
			else ttmmbR.classList.remove("disabled");
			if (cgroup_index===0) ttmmbL.classList.add("disabled");
			else ttmmbL.classList.remove("disabled");

		}else{
			timetable_container.style.marginLeft="0";
		}
	}
}

let last_known_positioner_width=-100000;
let positioner_resize_observer = new ResizeObserver(()=>{
	if (!Global.mobile) return;
	let w = timetable_positoner.clientWidth;
	if (Math.abs(last_known_positioner_width-w)>10){
		last_known_positioner_width=w;
		console.log("Detected TTable Positioner Width change - recenter");
		update_styles();
	}
});
positioner_resize_observer.observe(timetable_positoner);

export function mobile_next(){
	if (!Global.mobile) return;
	cgroup_index++;
	if (cgroup_index>=cgroup_centers.length) cgroup_index=cgroup_centers.length-1;
	//close_all_timetable_blocks();
	update_styles();
}
export function mobile_prev(){
	if (!Global.mobile) return;
	cgroup_index--;
	if (cgroup_index<0) cgroup_index=0;
	//close_all_timetable_blocks();
	update_styles();
}
ttmmbL.addEventListener("click",()=>{mobile_prev()});
ttmmbR.addEventListener("click",()=>{mobile_next()});


// Swipe detection
let touch_srx_start=0; // Screen Relative X
let touch_x_start=0;
let touch_y_start=0;
let touch_time_start=0;

wsd.addEventListener('touchstart', (e)=>{
	if (!Global.mobile) return;
	if (!in_timetable_page) return;
	
	touch_srx_start = e.changedTouches[0].clientX/wsd.clientWidth;
	touch_x_start = e.changedTouches[0].clientX;
	touch_y_start = e.changedTouches[0].clientY;
	touch_time_start=performance.now();
});
wsd.addEventListener('touchend', (e)=>{
	if (!Global.mobile) return;
	if (!in_timetable_page) return;
	
	let srx = e.changedTouches[0].clientX/wsd.clientWidth;
	let x = e.changedTouches[0].clientX;
	let y = e.changedTouches[0].clientY;
	// Delta Relative X
	let drx = srx - touch_srx_start;
	
	// Delta X,Y, Absolute
	let dya = Math.abs(touch_y_start-y);
	let dxa = Math.abs(touch_x_start-x);
	
	let dt = performance.now()-touch_time_start;
	
	if (dt<1000){ // Within 1 second
		if (dxa>dya){ // More horizontal movement than vertical
			// More than 20% of screen moved
			if (drx>0.2) mobile_prev();
			if (drx<-0.2) mobile_next();
		}
	}
});
