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


const tt_start_t=parse_time("8:00");
const tt_block_gap=2;
const tt_px_per_minute=0.8;
const tt_tick_px=1.5;
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
	let categories=ttd.categories;
	
	
	let column_x_coords={};
	let column_textsizes={};
	let column_vertical={};
	let column_widths={};
	let column_expand_direction={};
	let x=0;
	
	let max_x=0;
	let max_y=0;
	
	for (const col of columns){
		if (col.type=="spacer") x+=col.width;
		else if (col.type=="location"){
			column_x_coords[col.name]=x;
			column_widths[col.name]=col.width;
			column_textsizes[col.name]=col.text_size;
			column_vertical[col.name]=col.text_vertical;
			column_expand_direction[col.name]=col.expand_direction;
			x+=col.width;
		}else{
			console.log("Invalid column"+JSON.stringify(col));
		}
		if (x>max_x) max_x=x;
	}
	
	let category_colors={}
	for(const cat of categories){
		category_colors[cat.name]=cat.color;
	}
	
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
		let vertical=column_vertical[block.location];
		let base_x=column_x_coords[block.location];
		let base_width=column_widths[block.location];
		let text_size=column_textsizes[block.location];
		let bg_color=category_colors[block.category];
		let expand_direction=column_expand_direction[block.location];
		
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
		closebtn_dom.style.width=px2em(32);
		closebtn_dom.style.height=px2em(32);
		closebtn_dom.style.zIndex=+1;
		closebtn_dom.classList.add("hidden");
		
		let close_svg=document.createElementNS("http://www.w3.org/2000/svg", "svg");
		close_svg.setAttributeNS(null,"viewBox","0 -960 960 960");
		close_svg.setAttribute("fill","#000000");
		close_svg.style.position="absolute";
		close_svg.style.top=px2em(2);
		close_svg.style.bottom=px2em(2);
		close_svg.style.left=px2em(2);
		close_svg.style.right=px2em(2);
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
		let y=start_time_relative*tt_px_per_minute;
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
		
		block_dom.style.zIndex=+30;
		block_dom.style.position="absolute";
		block_dom.style.top=px2em(y);
		block_dom.style.left=px2em(x);
		block_dom.style.height=px2em(h);
		block_dom.style.width=px2em(w);
		
		outline_dom.style.zIndex=+10;
		outline_dom.style.position="absolute";
		outline_dom.style.top=px2em(y);
		outline_dom.style.left=px2em(x);
		outline_dom.style.height=px2em(h);
		outline_dom.style.width=px2em(w);
		outline_dom.style.opacity=0;
		//outline_dom.style.backgroundColor="#FFF";
		
		max_y=Math.max(max_y,end_time_relative*tt_px_per_minute);
		
		// Expand animation
		let expX=x;
		let expY=y;
		let expW=w;
		let expH=h;
		if (expand_direction==="L"){
			expX-=(300-w);
			expW=300;
		}else if (expand_direction==="R"){
			expW=300;
		}
		if (expH<120) expH=120;
		if (expH>120){
			let shrinkage=h-120;
			expH=120;
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
		outline_dom.style.borderWidth=px2em(4);
		
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
			(tt-tt_start_t)*tt_px_per_minute+tt_tick_px/2-30);
		tick_dom.style.left=0;
		tick_dom.style.height=px2em(30);
		tick_dom.style.width=px2em(max_x);
		//tick_dom.style.backgroundColor="#FFFFFF80"
		tick_dom.style.borderBottomColor="#FFFFFF80";
		tick_dom.style.borderBottomStyle="solid";
		tick_dom.style.borderBottomWidth=px2em(tt_tick_px);
		tick_dom.style.zIndex=+5;
		domroot.appendChild(tick_dom);
		
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
		timedisp_dom_L.style.fontSize=px2em(12);
		timedisp_dom_L.style.color="#FFFFFFA0";
		timedisp_dom_L.style.fontWeight=900;
		timedisp_dom_L.innerHTML=h+":"+m;
		
		let timedisp_dom_R= timedisp_dom_L.cloneNode(true);
		timedisp_dom_L.style.left=0;
		timedisp_dom_R.style.right=0;
		
		tick_dom.appendChild(timedisp_dom_L);
		tick_dom.appendChild(timedisp_dom_R);
	}

	// Need to do this in order for the root DOM to actually
	// contain all the timetable.
	domroot.style.width=px2em(max_x);
	domroot.style.height=px2em(max_y);
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

