
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
	let x=0;
	
	let max_x=0;
	let max_y=0;
	
	for (const col of columns){
		if (col.type=="spacer") x+=col.width;
		else if (col.type=="location"){
			column_x_coords[col.name]=x;
			column_widths[col.name]=col.width;
			column_textsizes[col.name]=col.text_size;
			column_vertical[col.name]=col.text_vertical
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
		
		// Child DOM elements
		let block_dom=document.createElement("div");
		let text_dom=document.createElement("div");
		let outline_dom=document.createElement("div");
		
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
		
		max_y=Math.max(max_y,end_time_relative*tt_px_per_minute);
		
		// Center child
		block_dom.style.display="flex";
		block_dom.style.flexDirection="column";
		block_dom.style.justifyContent="center";
		block_dom.style.alignItems="center";
		
		// Text DOM
		block_dom.appendChild(text_dom);
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
		block_dom.style.backgroundColor=bg_color;
		if (!(connecting.T || connecting.L))
			block_dom.style.borderTopLeftRadius = radius;
		if (!(connecting.T || connecting.R))
			block_dom.style.borderTopRightRadius = radius;
		if (!(connecting.B || connecting.L))
			block_dom.style.borderBottomLeftRadius = radius;
		if (!(connecting.B || connecting.R))
			block_dom.style.borderBottomRightRadius = radius;
		
		
		
		if (vertical){
			block_dom.style.width=px2em(30-(tt_block_gap*2));
			text_dom.style.width=px2em(200);
			text_dom.style.transform="rotate(90deg)";
			text_dom.style.textAlign="center";
		}
		domroot.appendChild(block_dom);
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
		tick_dom.style.width=max_x+"px";
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
	domroot.style.width=max_x+"px";
	domroot.style.height=max_y+"px";
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

