/*
 * Generates timetable from the JSON data.
 * 
 */

import * as Config  from "./config.js";
import * as Utils from "./utils.js";
import * as TimetableData from "./timetable_data.js";


const timetable_container = document.getElementById("ttable-container");
const timetable_positoner = document.getElementById("ttable-positioner");

const ttmmbL=document.getElementById("ttmmb-left");
const ttmmbR=document.getElementById("ttmmb-right");
const buttons_container = document.getElementById("timetable-mobile-move-button");

let mobile_mode=false;
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


// Timetable UI constants.
const tt_start_t=parse_time("8:20");
const tt_block_gap=2;
const tt_px_per_minute=0.8;
const tt_tick_px=1.5;
const tt_cg_top_extension=48;
const tt_cg_bottom_extension=6;
const tt_cg_side_extension=4;
const tt_block_expanded_height=120;
const tt_block_expanded_width=260;

// For scalibilty, all units should be in em.
// Converts px values to em.
function px2em(p){
	return (p/16)+"em";
}

// This will keep increasing on each mouse over.
// Hopefully nopony will mouse-over the timetable 2 billion times...
let mouseover_zindex=+100;

let cgroup_centers=[];

function timetable_build(ttd){
	let domroot=document.createElement("div");
	domroot.classList.add("timetable-dom-root");
	
	// Make every child use its rel.coords when in absolute positioning.
	domroot.style.position="relative";
	
	// get data
	let blocks=ttd.blocks;
	let columns=ttd.columns;
	let cpresets=ttd.color_presets;
	let cgroups=ttd.column_groups;
	
	// parse results
	let column_x_coords={};
	let column_textsizes={};
	let column_vertical={};
	let column_widths={};
	let column_expand_direction={};
	
	let columns_to_cgroups={};
	
	let cgroup_left={};
	let cgroup_right={};
	
	// coordinate counters
	let x=0;
	let max_x=0;
	let max_y=0;
	
	// Pre-parse data
	for (const cg of cgroups){
		cgroup_left[cg.name] =+1000000;
		cgroup_right[cg.name]=-1000000;
	}
	
	for (const col of columns){
		if (col.type=="spacer") x+=col.width;
		else if (col.type=="location"){
			column_x_coords[col.name]=x;
			column_widths[col.name]=col.width;
			column_textsizes[col.name]=col.text_size;
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
	
	for (const cg of cgroups){
		cgroup_centers.push(
			(cgroup_left[cg.name]+cgroup_right[cg.name])/2);
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
	 * 80 Block outline
	 * 90 Blocks, initial
	 * 100+ Mouse-Overed Blocks
	 */
	
	// Block close functions for currently open blocks
	let exit_functions=[];
	// All times where a block starts or ends
	let time_ticks=new Set();
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
		let text_size=column_textsizes[block.column];
		let color_preset_raw=color_presets[block.color_preset];
		let bg_color=color_preset_raw.color;
		let expand_direction=column_expand_direction[block.column];
		
		let colgroup=columns_to_cgroups[block.column];
		let cg_left=cgroup_left[colgroup];
		let cg_right=cgroup_right[colgroup];
		//console.log(`BLK CL${block.column} CGL${colgroup} CL${cg_left} CR${cg_right}`);
		
		// Child DOM elements
		let block_dom=document.createElement("div");
		block_dom.classList.add("timetable-block-body");
		
		let outline_dom=document.createElement("div");
		outline_dom.classList.add("timetable-block-outline");
		
		let text_dom=document.createElement("div");
		text_dom.classList.add("timetable-block-text");
		
		let desc_dom=document.createElement("div");
		desc_dom.classList.add("timetable-block-description-container");
		
		let closebtn_dom=document.createElement("div");
		closebtn_dom.classList.add("timetable-block-close-button");
		
		domroot.appendChild(block_dom);
		domroot.appendChild(outline_dom);
		block_dom.appendChild(text_dom);
		block_dom.appendChild(desc_dom);
		
		
		
		// Close Button
		closebtn_dom.classList.add("hidden");
		
		let close_svg=Utils.generate_svg_cross("#000000");
		close_svg.classList.add("timetable-block-close-svg");
		closebtn_dom.appendChild(close_svg);
		if (Config.OPTION_TIMETABLE_REQUIRE_CLICK){
			block_dom.appendChild(closebtn_dom);
		}
		
		// Description
		let info_time_dom_ko=document.createElement("div");
		info_time_dom_ko.classList.add("timetable-desc-time");
		info_time_dom_ko.classList.add("langdiv-ko");
		
		let info_time_dom_en=document.createElement("div");
		info_time_dom_en.classList.add("timetable-desc-time");
		info_time_dom_en.classList.add("langdiv-en");
		
		if ("time_string_override_en" in block){
			info_time_dom_ko.innerHTML=block.time_string_override_kr;
			info_time_dom_en.innerHTML=block.time_string_override_en;
		}else{
			info_time_dom_ko.innerHTML=block.start_time+" ~ "+block.end_time;
			info_time_dom_en.innerHTML=block.start_time+" ~ "+block.end_time;
		}
		desc_dom.appendChild(info_time_dom_ko);
		desc_dom.appendChild(info_time_dom_en);
		
		let info_text_dom_ko=document.createElement("div");
		info_text_dom_ko.classList.add("timetable-desc-text");
		info_text_dom_ko.classList.add("langdiv-ko");
		info_text_dom_ko.innerHTML=block.description_kr;
		desc_dom.appendChild(info_text_dom_ko);
		
		let info_text_dom_en=document.createElement("div");
		info_text_dom_en.classList.add("timetable-desc-text");
		info_text_dom_en.classList.add("langdiv-en");
		info_text_dom_en.innerHTML=block.description_en;
		desc_dom.appendChild(info_text_dom_en);
		
		
		
		// Connecting
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
			y+=tt_block_gap;
			h-=tt_block_gap;
		}
		if (!connecting.B){
			h-=tt_block_gap;
		}
		if (!connecting.R) {
			x+=tt_block_gap;
			w-=tt_block_gap;
		}
		if (!connecting.L) {
			w-=tt_block_gap;
		}
		
		block_dom.style.zIndex=+90;
		block_dom.style.top=px2em(y);
		block_dom.style.left=px2em(x);
		block_dom.style.height=px2em(h);
		block_dom.style.width=px2em(w);
		
		outline_dom.style.zIndex=+80;
		outline_dom.style.top=px2em(y);
		outline_dom.style.left=px2em(x);
		outline_dom.style.height=px2em(h);
		outline_dom.style.width=px2em(w);
		outline_dom.style.opacity=0;
		
		max_y=Math.max(max_y,y+h);
		
		
		let rel_start_time_gapped=(y-tt_cg_top_extension)/tt_px_per_minute;
		let rel_end_time_gapped=(y+h-tt_cg_top_extension)/tt_px_per_minute;
		
		// Expand animation
		let expX=x;
		let expY=y;
		let expW=w;
		let expH=h;
		if (expand_direction==="L"){
			expX-=(tt_block_expanded_width-w);
			expW=tt_block_expanded_width;
		}else if (expand_direction==="R"){
			expW=tt_block_expanded_width;
		}
		if (expH<tt_block_expanded_height) expH=tt_block_expanded_height;
		if (expH>tt_block_expanded_height){
			let shrinkage=h-tt_block_expanded_height;
			expH=tt_block_expanded_height;
			expY+=shrinkage/2;
		}
		
		let expanded=false;
		function exit(){
			expanded=false;
			block_dom.style.top=px2em(y);
			block_dom.style.left=px2em(x);
			block_dom.style.height=px2em(h);
			block_dom.style.width=px2em(w);
			block_dom.classList.remove("timetable-block-mouseover");
			outline_dom.style.opacity=0.0;
			block_dom.style.filter="none";
			if (Config.OPTION_TIMETABLE_REQUIRE_CLICK){
				closebtn_dom.classList.add("hidden");
				block_dom.style.cursor="pointer";
			}
				
		}
		function enter(){
			expanded=true;
			block_dom.style.top=px2em(expY);
			block_dom.style.height=px2em(expH);
			if (mobile_mode){
				let center=(cg_right+cg_left)/2;
				//block_dom.style.left=px2em(cg_left);
				//block_dom.style.width=px2em(cg_right-cg_left);
				block_dom.style.left=px2em(center-(tt_block_expanded_width/2));
				block_dom.style.width=px2em(tt_block_expanded_width);
			}else{
				block_dom.style.left=px2em(expX);
				block_dom.style.width=px2em(expW);
			}
			//console.log(`BlockEnter Y${expY} H${expH} L${cg_left} R${cg_right} X${expX} W${expW}`);
			block_dom.classList.add("timetable-block-mouseover");
			mouseover_zindex++;
			block_dom.style.zIndex=mouseover_zindex;
			outline_dom.style.opacity=1.0;
			block_dom.style.filter="drop-shadow(0 0 8px #00000080)";
			if (Config.OPTION_TIMETABLE_REQUIRE_CLICK){
				closebtn_dom.classList.remove("hidden");
				block_dom.style.cursor="unset";
			}
				
		}
		
		// Testing if mouse inside block OR outline.
		let mouse_inside_block=false;
		let mouse_inside_outline=false;
		
		// We need to turn off the mouse detection for the block
		// if the block is being animated(transitioned).
		// Otherwise, the block can oscillate.
		let transition_in_progress=false;
		if (!Config.OPTION_TIMETABLE_REQUIRE_CLICK){
			block_dom.addEventListener("transitionend",(e)=>{
				// filter runs for a shorter time so we need to ignore that
				if (e.propertyName=="filter") return;
				transition_in_progress=false;
				update();
			});
		}
		
		// The below function is a bit convoluted,
		// but trust me, this is all necessary.
		function update(){
			let now_inside;
			
			if (transition_in_progress) now_inside= mouse_inside_outline;
			else now_inside=(mouse_inside_block || mouse_inside_outline);
			
			if (now_inside){
				if (!expanded) {
					transition_in_progress=true;
					enter();
				}
			}else{
				if (expanded){
					transition_in_progress=true;
					exit();
				}
			}
		}
		
		// Doing the update a little later 
		// will catch the case where the mouse leaves the outline
		// and enters the block in the same frame.
		// Without waiting, this will cause the block to be collapsed.
		let pending_update=null;
		function queue_update(){
			window.clearTimeout(pending_update);
			pending_update=window.setTimeout(update,10);
		}
		
		// Listen for mouse hover OR click. Depends on the Config option.
		if (!Config.OPTION_TIMETABLE_REQUIRE_CLICK){
			outline_dom.addEventListener("mouseleave",()=>{
				mouse_inside_outline=false;
				queue_update();
			});
			outline_dom.addEventListener("mouseenter",()=>{
				mouse_inside_outline=true;
				queue_update();
			});
			block_dom.addEventListener("mouseleave",()=>{
				mouse_inside_block=false;
				queue_update();
			});
			block_dom.addEventListener("mouseenter",()=>{
				mouse_inside_block=true;
				queue_update();
			});
		}else{
			block_dom.style.cursor="pointer";
			block_dom.addEventListener("mouseleave",()=>{
				if (!expanded)
					block_dom.style.filter="none";
			});
			block_dom.addEventListener("mouseenter",()=>{
				if (!expanded)
					block_dom.style.filter="drop-shadow(0 0 4px "+bg_color+")";
			});
			block_dom.addEventListener("click",()=>{
				while (exit_functions.length>0) exit_functions.pop()();
				exit_functions.push(exit);
				enter();
			});
			closebtn_dom.addEventListener("click",(e)=>{
				e.stopPropagation();
				exit();
			});
		}
		
		
		// Text DOM
		text_dom.style.fontSize=text_size+"em";
		
		var text_kr = document.createElement("span");
		text_kr.classList.add("langspan-ko");
		text_kr.innerHTML=block.name_kr;
		text_dom.appendChild(text_kr);
		
		var text_en = document.createElement("span");
		text_en.classList.add("langspan-en");
		text_en.innerHTML=block.name_en;
		text_dom.appendChild(text_en);
		
		
		// Block BG
		let radius=px2em(6);
		if (!(connecting.T || connecting.L)){
			block_dom.style.borderTopLeftRadius = radius;
			outline_dom.style.borderTopLeftRadius = radius;
		}
		if (!(connecting.T || connecting.R)){
			block_dom.style.borderTopRightRadius = radius;
			outline_dom.style.borderTopRightRadius = radius;
		}
		if (!(connecting.B || connecting.L)){
			block_dom.style.borderBottomLeftRadius = radius;
			outline_dom.style.borderBottomLeftRadius = radius;
		}
		if (!(connecting.B || connecting.R)){
			block_dom.style.borderBottomRightRadius = radius;
			outline_dom.style.borderBottomRightRadius = radius;
		}
		
		
		outline_dom.style.borderColor=bg_color;
		
		if ("color_list" in color_preset_raw){
			//console.log("CPR-CL",color_preset_raw.color_list)
			//console.log("CPR-CTM",color_preset_raw.color_transition_minutes)
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
			//console.log("GDEF",gradient_def);
			block_dom.style.backgroundImage=gradient_def;
		}else{
			block_dom.style.backgroundColor=bg_color;
			
		}
		//block_dom.style.backgroundColor={}[block.column];
		//block_dom.style.backgroundImage="none";
		/*
		block_dom.style.backgroundColor={
			"main-stage":"hsl(0deg 90% 80%)",
			"main-side":"hsl(90deg 90% 80%)",
			"sub-hall":"hsl(180deg 90% 80%)",
			"lobby":"hsl(270deg 90% 80%)"
		}[colgroup];*/
		//block_dom.style.backgroundColor="hsl("+(base_x/2)+"deg 60% 85%)";
		//let h_left=base_x/2;
		//let h_right=(base_width+base_x)/2;
		//block_dom.style.backgroundImage="linear-gradient(to right, hsl("+h_left+"deg 90% 80%) 0% , hsl("+h_right+"deg 90% 80%) 100%)";
		
		
		if (vertical){
			block_dom.classList.add("timetable-block-vertical");
		}
	}
	
	time_ticks=Array.from(time_ticks);
	time_ticks.sort();
	// time_ticks are where the blocks line up,
	// But putting lines only there looks kinda weird.
	// So we just populate it manually at 1-hour intervals.
	time_ticks=Array(15).fill().map((e, i) => (i + 9)*60);
	
	// Create time ticks
	for (const tt of time_ticks){
		let tick_dom=document.createElement("div");
		tick_dom.classList.add("timetable-tick-line");
		
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
		cg_label_text1_en.classList.add("langflex-en");
		cg_label_text1_en.classList.add("timetable-cgroup-label-line1");
		
		let cg_label_text1_ko=document.createElement("div");
		cg_label_text1_ko.classList.add("langflex-ko");
		cg_label_text1_ko.classList.add("timetable-cgroup-label-line1");
		
		let cg_label_text2_en=document.createElement("div");
		cg_label_text2_en.classList.add("langflex-en");
		cg_label_text2_en.classList.add("timetable-cgroup-label-line2");
		
		let cg_label_text2_ko=document.createElement("div");
		cg_label_text2_ko.classList.add("langflex-ko");
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
	}
	
	max_y=Math.max(max_y,max_y+tt_cg_bottom_extension);

	// Need to do this in order for the root DOM to actually
	// contain all the timetable.
	domroot.style.width=px2em(max_x);
	domroot.style.height=px2em(max_y);
	//domroot.style.border="1px solid #F0F";
	return domroot;
}


let cgroup_index=0;
export function enter_mobile(){
	mobile_mode=true;
	update_styles();
}
export function exit_mobile(){
	mobile_mode=false;
	update_styles();
}
export function enter_timetable_page(){
	in_timetable_page=true;
	update_styles();
}
export function exit_timetable_page(){
	in_timetable_page=false;
	update_styles();
}
function update_styles(){
	let active = in_timetable_page && mobile_mode;
	if (!active) buttons_container.style.display="none";
	else buttons_container.style.display="flex";
	
	if (in_timetable_page){
		if (mobile_mode){
			let cgroup_center_px = cgroup_centers[cgroup_index];
			let cgroup_center_em=px2em(cgroup_center_px);
			
			let positioner_width=timetable_positoner.clientWidth;
			let positioner_center_px=positioner_width/2;
			
			let margin=`calc(${positioner_center_px}px - ${cgroup_center_em})`;
			//console.log(margin);
			timetable_container.style.marginLeft=margin;
			
			if (cgroup_index===(cgroup_centers.length-1)) ttmmbR.style.opacity=0.2;
			else ttmmbR.style.opacity=1.0;
			if (cgroup_index===0) ttmmbL.style.opacity=0.2;
			else ttmmbL.style.opacity=1.0;
		}else{
			timetable_container.style.marginLeft="0";
		}
	}
}

let last_known_positioner_width=-100000;
let positioner_resize_observer = new ResizeObserver(()=>{
	if (!mobile_mode) return;
	let w = timetable_positoner.clientWidth;
	if (Math.abs(last_known_positioner_width-w)>10){
		last_known_positioner_width=w;
		console.log("Detected TTable Positioner Width change - recenter");
		update_styles();
	}
});
positioner_resize_observer.observe(timetable_positoner);
export function mobile_next(){
	if (!mobile_mode) return;
	cgroup_index++;
	if (cgroup_index>=cgroup_centers.length) cgroup_index=cgroup_centers.length-1;
	//console.log("CGI",cgroup_index);
	update_styles();
}
export function mobile_prev(){
	if (!mobile_mode) return;
	cgroup_index--;
	if (cgroup_index<0) cgroup_index=0;
	//console.log("CGI",cgroup_index);
	update_styles();
}

timetable_container.appendChild(timetable_build(TimetableData));


ttmmbL.addEventListener("click",()=>{mobile_prev()});
ttmmbR.addEventListener("click",()=>{mobile_next()});

