/*
 * Module for turning on/off website features
 * for differently performant devices.
 */



// 'Enum' of features that can be turned on/off.
export class Feature{
	static JAVASCRIPT = 1;
	static FIREWORKS = 10;
	static FIREWORKS_HIRES=11;
	static FIREWORKS_HIGHCOUNT=12;
	static PARALLAX_GROUND = 20;
	static PARALLAX_ANIMATED=21;
	static HANMARI_L2D = 30;
	static L2D_FILTERS=31;
	static ANIMATED_STARS = 40; 
	//static FULL_FRAMERATE=50;
}

// Populate variables.
let enable_callbacks={};
let disable_callbacks={};
let current_state={};
let values=[];
for (const k of Object.keys(Feature)){
	const v=Feature[k];
	enable_callbacks[v]=[];
	disable_callbacks[v]=[];
	current_state[v]=true;
	//console.log(k+":"+v);
	values.push(v);
}



function report_frame_time(ms){
	//TODO automatically turn features on/off with respect to 
	// the frame rate.
}



// Enable/disable each feature individually.
// The callbacks will be called automatically.
function feature_enable(feature){
	if (current_state[feature]) return;
	current_state[feature]=true;
	for (const f of enable_callbacks[feature]) f();
}
function feature_disable(feature){
	if (!current_state[feature]) return;
	current_state[feature]=false;
	for (const f of disable_callbacks[feature]) f();
}

let feature_level=values[values.length-1];
// Enable all features up to the given level,
// and disable all features above that level.
export function set_feature_level(level){
	feature_level=level;
	for (const k of Object.keys(Feature)){
		const v=Feature[k];
		if (v>level) feature_disable(v);
		else feature_enable(v);
	}
}
export function get_feature_level(){
	return feature_level;
}
export function decrement_feature_level(){
	let idx=values.findIndex((e)=>e==feature_level);
	idx--;
	if (idx<0) idx=0;
	set_feature_level(values[idx]);
}
export function increment_feature_level(){
	let idx=values.findIndex((e)=>e==feature_level);
	idx++;
	if (idx>=values.length) idx=values.length-1;
	set_feature_level(values[idx]);
}

// Register callbacks to be called when a feature is enable/disabled.
export function register_feature_enable_callback(feature,func){
	enable_callbacks[feature].push(func);
}
export function register_feature_disable_callback(feature,func){
	disable_callbacks[feature].push(func);
}
// Check if feature is enabled right now
export function check_feature_enabled(feature){
	return current_state[feature];
}


export function generate_feature_list(){
	let s="";
	for (const k of Object.keys(Feature)){
		const v=Feature[k];
		if (!current_state[v]) continue;
		if (s !== "") s=s+"<br>";
		s=s+k;
	}
	return s;
}
