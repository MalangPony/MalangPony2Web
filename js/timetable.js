import * as Config  from "./config.js";

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

let fetch_fail_reason=null;
let fetch_success=false;
let timetable_data=null;
let timetable_dom=null;

let resolves=[];
let rejects=[];
export async function get_timetable_data(){
	return new Promise((resolve,reject)=>{
		if (fetch_fail_reason!==null) reject(fetch_fail_reason);
		else if (fetch_success) resolve(
			{"data":timetable_data,"dom":timetable_dom});
		else{
			resolves.push(resolve);
			rejects.push(reject);
		}
	});
}
function resolve(data,dom){
	if (fetch_success){
		console.log("resolve() done twice?");
		return;
	}
	console.log("TT Resolved.");
	timetable_data=data;
	timetable_dom=dom;
	fetch_success=true;
	for (const r of resolves){
		r({"data":timetable_data,"dom":timetable_dom});
	}
}
function reject(reason){
	if (fetch_fail_reason !== null){
		console.log("reject() done twice?");
		return;
	}
	console.log("TT Rejected: "+reason);
	fetch_fail_reason=reason;
	for (const r of rejects){
		r(fetch_fail_reason);
	}
}


const tt_start_t=parse_time("8:20");
const tt_block_gap=2;
const tt_px_per_minute=0.8;
const tt_tick_px=1.5;
const tt_cg_top_extension=48;
const tt_cg_bottom_extension=6;
const tt_cg_side_extension=4;
const tt_cg_label_textsize=24;
const tt_time_label_textsize=12;
const tt_block_border_width=4;
const tt_block_expanded_height=120;
const tt_block_expanded_width=300;
const tt_close_button_size=32;
const tt_close_button_padding=2;
// For scalibilty, all units should be in em.
function px2em(p){
	return (p/16)+"em";
}
// This will keep increasing on each mouse over.
// Hopefully nopony will mouse-over the timetable 2 billion times...
let mouseover_zindex=+100;
function timetable_build(ttd){
	let domroot=document.createElement("div");
	// Make every child use its rel.coords when in absolute positioning.
	domroot.style.position="relative";
	
	let blocks=ttd.blocks;
	let columns=ttd.columns;
	let cpresets=ttd.color_presets;
	let cgroups=ttd.column_groups;
	
	
	let column_x_coords={};
	let column_textsizes={};
	let column_vertical={};
	let column_widths={};
	let column_expand_direction={};
	
	let cgroup_left={};
	let cgroup_right={};
	
	let x=0;
	let max_x=0;
	let max_y=0;
	
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
	
	let color_presets={}
	for(const cp of cpresets){
		color_presets[cp.name]=cp.color;
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
	
	let exit_functions=[];
	let time_ticks=new Set();
	for (const block of blocks){
		//console.log(block);
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
		let bg_color=color_presets[block.color_preset];
		let expand_direction=column_expand_direction[block.column];
		
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
		closebtn_dom.style.position="absolute";
		closebtn_dom.style.top=0;
		closebtn_dom.style.right=0;
		closebtn_dom.style.width=px2em(tt_close_button_size);
		closebtn_dom.style.height=px2em(tt_close_button_size);
		closebtn_dom.style.zIndex=+1;
		closebtn_dom.classList.add("hidden");
		
		let close_svg=document.createElementNS("http://www.w3.org/2000/svg", "svg");
		close_svg.setAttributeNS(null,"viewBox","0 -960 960 960");
		close_svg.setAttribute("fill","#000000");
		close_svg.style.position="absolute";
		close_svg.style.top=   px2em(tt_close_button_padding);
		close_svg.style.bottom=px2em(tt_close_button_padding);
		close_svg.style.left=  px2em(tt_close_button_padding);
		close_svg.style.right= px2em(tt_close_button_padding);
		let svg_path=document.createElementNS("http://www.w3.org/2000/svg","path");
		svg_path.setAttribute("d","m256-168-88-88 224-224-224-224 88-88 224 224 224-224 88 88-224 224 224 224-88 88-224-224-224 224Z");
		close_svg.appendChild(svg_path);
		closebtn_dom.appendChild(close_svg);
		if (Config.OPTION_TIMETABLE_REQUIRE_CLICK){
			block_dom.appendChild(closebtn_dom);
		}
		
		// Description
		desc_dom.style.width=px2em(270);
		let info_time_dom=document.createElement("div");
		info_time_dom.classList.add("timetable-desc-time");
		info_time_dom.innerHTML=block.start_time+" ~ "+block.end_time;
		desc_dom.appendChild(info_time_dom);
		let info_text_dom_ko=document.createElement("div");
		let info_text_dom_en=document.createElement("div");
		info_text_dom_ko.classList.add("timetable-desc-text");
		info_text_dom_ko.classList.add("langdiv-ko");
		info_text_dom_ko.innerHTML=block.description_kr;
		desc_dom.appendChild(info_text_dom_ko);
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
		block_dom.style.position="absolute";
		block_dom.style.top=px2em(y);
		block_dom.style.left=px2em(x);
		block_dom.style.height=px2em(h);
		block_dom.style.width=px2em(w);
		
		outline_dom.style.zIndex=+80;
		outline_dom.style.position="absolute";
		outline_dom.style.top=px2em(y);
		outline_dom.style.left=px2em(x);
		outline_dom.style.height=px2em(h);
		outline_dom.style.width=px2em(w);
		outline_dom.style.opacity=0;
		//outline_dom.style.backgroundColor="#FFF";
		
		max_y=Math.max(max_y,y+h);
		
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
			block_dom.style.left=px2em(expX);
			block_dom.style.height=px2em(expH);
			block_dom.style.width=px2em(expW);
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
		
		
		let mouse_inside_block=false;
		let mouse_inside_outline=false;
		let transition_in_progress=false;
		if (!Config.OPTION_TIMETABLE_REQUIRE_CLICK){
			block_dom.addEventListener("transitionend",(e)=>{
				// filter runs for a shorter time so we need to ignore that
				if (e.propertyName=="filter") return;
				transition_in_progress=false;
				update();
			});
		}
		
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
		
		if (!Config.OPTION_TIMETABLE_REQUIRE_CLICK){
			outline_dom.addEventListener("mouseleave",()=>{
				//console.log("Outline OUT");
				mouse_inside_outline=false;
				queue_update();
			});
			outline_dom.addEventListener("mouseenter",()=>{
				//console.log("Outline IN");
				mouse_inside_outline=true;
				queue_update();
			});
			block_dom.addEventListener("mouseleave",()=>{
				//console.log("Block OUT");
				mouse_inside_block=false;
				queue_update();
			});
			block_dom.addEventListener("mouseenter",()=>{
				//console.log("Block IN");
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
				//console.log("BlockClicked");
				while (exit_functions.length>0) exit_functions.pop()();
				exit_functions.push(exit);
				enter();
			});
			closebtn_dom.addEventListener("click",(e)=>{
				e.stopPropagation();
				//console.log("CloseBTN");
				exit();
			});
		}
		
		
		// Text DOM
		text_dom.style.textAlign="center";
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
		
		block_dom.style.backgroundColor=bg_color;
		outline_dom.style.borderColor=bg_color;
		outline_dom.style.borderStyle="solid"; // Maybe dotted?
		outline_dom.style.borderWidth=px2em(tt_block_border_width);
		
		if (vertical){
			text_dom.style.width=px2em(200);
			block_dom.classList.add("timetable-block-vertical");
		}
		
	}
	time_ticks=Array.from(time_ticks);
	time_ticks.sort();
	// time_ticks are where the blocks line up,
	// But putting lines only there looks kinda weird.
	// So....
	time_ticks=Array(15).fill().map((e, i) => (i + 9)*60)
	for (const tt of time_ticks){
		let tick_dom=document.createElement("div");
		tick_dom.style.position="absolute";
		//console.log(`TT ${tt} TTS ${tt_start_t} TPPM ${tt_px_per_minute} TTTX ${tt_tick_px}`);
		tick_dom.style.top=px2em(
			(tt-tt_start_t)*tt_px_per_minute+tt_tick_px/2-30+tt_cg_top_extension);
		tick_dom.style.left=0;
		tick_dom.style.height=px2em(30);
		tick_dom.style.width=px2em(max_x);
		//tick_dom.style.backgroundColor="#FFFFFF80"
		tick_dom.style.borderBottomColor="#FFFFFF80";
		tick_dom.style.borderBottomStyle="solid";
		tick_dom.style.borderBottomWidth=px2em(tt_tick_px);
		tick_dom.style.zIndex=+5;
		domroot.appendChild(tick_dom);
		
		max_y=Math.max(max_y,(tt-tt_start_t)*tt_px_per_minute+tt_cg_top_extension);
		
		let timedisp_dom_L = document.createElement("div");
		timedisp_dom_L.style.position="absolute";
		timedisp_dom_L.style.bottom=0;
		timedisp_dom_L.style.zIndex=+6;
		
		var m=tt%60
		var h=Math.floor(tt/60);
		if (m<10) m="0"+m;
		else m=""+m
		if (h<10) h="0"+h;
		else h=""+h
		timedisp_dom_L.style.fontSize=px2em(tt_time_label_textsize);
		timedisp_dom_L.style.color="#FFFFFFA0";
		timedisp_dom_L.style.fontWeight=900;
		timedisp_dom_L.innerHTML=h+":"+m;
		
		let timedisp_dom_R= timedisp_dom_L.cloneNode(true);
		timedisp_dom_L.style.left=0;
		timedisp_dom_R.style.right=0;
		
		tick_dom.appendChild(timedisp_dom_L);
		tick_dom.appendChild(timedisp_dom_R);
	}
	
	
	for (const cg of cgroups){
		let left=cgroup_left[cg.name];
		let right=cgroup_right[cg.name];
		let line1EN=cg.fullname_en;
		let line1KR=cg.fullname_kr
		let line2EN=cg.line2_en;
		let line2KR=cg.line2_kr
		
		let cg_outline_dom = document.createElement("div");
		let cg_label_dom=document.createElement("div");
		let cg_label_text1_en=document.createElement("div");
		let cg_label_text1_ko=document.createElement("div");
		let cg_label_text2_en=document.createElement("div");
		let cg_label_text2_ko=document.createElement("div");
		
		cg_outline_dom.style.position="absolute";
		cg_outline_dom.style.left=px2em(
			left-tt_cg_side_extension);
		cg_outline_dom.style.width=px2em(
			right-left+tt_cg_side_extension*2);
		cg_outline_dom.style.top=0;
		cg_outline_dom.style.height=px2em(
			max_y+tt_cg_bottom_extension);
		
		
		cg_outline_dom.style.borderRadius=px2em(8);
		/*
		cg_outline_dom.style.borderLeftWidth=px2em(1);
		cg_outline_dom.style.borderRightWidth=px2em(1);
		cg_outline_dom.style.borderTopWidth=px2em(1);
		cg_outline_dom.style.borderBottomWidth=0;
		cg_outline_dom.style.borderLeftStyle="solid";
		cg_outline_dom.style.borderRightStyle="solid";
		cg_outline_dom.style.borderTopStyle="solid";
		cg_outline_dom.style.borderBottomStyle="none";
		cg_outline_dom.style.borderColor="#FFFFFFC0";
		*/
		//cg_outline_dom.style.filter="blur(2px)";
		cg_outline_dom.style.background="linear-gradient(to bottom, "+cg.ramp_color_top+", "+cg.ramp_color_bottom+")";
		cg_outline_dom.style.zIndex=+50;
		
		cg_label_dom.style.position="absolute";
		cg_label_dom.style.left=0;
		cg_label_dom.style.right=0;
		cg_label_dom.style.top=0;
		cg_label_dom.style.height=px2em(tt_cg_top_extension);
		cg_label_dom.style.fontSize=px2em(tt_cg_label_textsize);
		cg_label_dom.style.display="flex";
		cg_label_dom.style.justifyContent="center";
		cg_label_dom.style.alignItems="center";
		cg_label_dom.style.flexDirection="column";
		cg_label_dom.style.gap=px2em(3);
		cg_outline_dom.appendChild(cg_label_dom);
		
		
		
		cg_label_text1_en.classList.add("langflex-en");
		cg_label_text1_en.innerHTML=line1EN;
		cg_label_dom.appendChild(cg_label_text1_en);
		
		if (line2EN){
			cg_label_text2_en.classList.add("langflex-en");
			cg_label_text2_en.innerHTML=line2EN;
			cg_label_text2_en.style.fontSize="0.8em";
			cg_label_dom.appendChild(cg_label_text2_en);
		}
		
		cg_label_text1_ko.classList.add("langflex-ko");
		cg_label_text1_ko.innerHTML=line1KR;
		cg_label_dom.appendChild(cg_label_text1_ko);
		
		if (line2KR){
			cg_label_text2_ko.classList.add("langflex-ko");
			cg_label_text2_ko.innerHTML=line2KR;
			cg_label_text2_ko.style.fontSize="0.8em";
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

window.fetch("timetable_data.json").then(
	(resp)=>{
		if (!resp.ok) throw new Error(`Response status: ${response.status}`);
		else return resp.json();
	}
).then(
	(jdat)=>{ // OK
		console.log("Timetable Fetch success");
		resolve(jdat,timetable_build(jdat));
	},
	(reason)=>{
		reject(reason);
	}
)

