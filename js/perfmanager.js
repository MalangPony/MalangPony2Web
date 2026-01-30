/*
 * Module for dynamically turning on/off website features
 * for differently performant devices.
 */

// Note: Right now this module doesn't really do anything.
//       The feature level is always locked at FULL, so all features are
//         permanently on.
//       You can re-enable by setting .auto_adjust_feature_level to true.


// 'Enum' of features that can be turned on/off.
export class Feature{
	// Lowest level. Everything is disabled.
	static LOWEST = 1;
	
	// Basic feature set. These are the core visual features.
	static FIREWORKS = 10;
	
	// L2D is heavy, so it has a lower priority.
	static HANMARI_L2D = 20;
	
	// Refinement features. 
	// Makes things look nicer, but not strictly required.
	static CSS_FILT_DROP_SHADOWS=50;
	static FIREWORKS_HIRES=51;
	static L2D_HIRES=52;
	
	static FIREWORKS_HIGHCOUNT=60;
	static L2D_FILTERS=61;
	
	// Extra features.
	// Technically makes things prettier, but barely noticable.
	static ANIMATED_STARS = 80; 
	
	// The highest level. Everything is enabled.
	static FULL=99;
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
	values.push(v);
}


// Auto-adjust feature level

/*
 * TODO we need a way to fix feature oscillations.
 * For example, if a feature is so heavy that it can take a 60FPS down to 15FPS,
 * It will start an oscillation with the auto-adjust.
 * How do we detect this? How do we stop this?
 */

// Start disabling features under this FPS
const FEATURE_DISABLE_THRESHOLD_FPS=20;
// Start enabling features when over this FPS
const FEATURE_ENABLE_THRESHOLD_FPS = 50;
function step_feature_level(current_fps){
	if (current_fps<FEATURE_DISABLE_THRESHOLD_FPS) decrement_feature_level();
	else if (current_fps>FEATURE_ENABLE_THRESHOLD_FPS) increment_feature_level();
}

// Initial guess
function guess_feature_level(current_fps){
	// This is totally guessing 
	if (current_fps>50) set_feature_level(Feature.FULL);
	else if (current_fps>40) set_feature_level(Feature.L2D_FILTERS);
	else if (current_fps>30) set_feature_level(Feature.HANMARI_L2D);
	else if (current_fps>20) set_feature_level(Feature.FIREWORKS);
	else set_feature_level(Feature.LOWEST);
}

let frame_times=[];
let feature_last_adjusted=NaN;
const FEATURE_ADJUST_INTERVAL=500; //milliseconds
let auto_adjust_feature_level=false;
export function disable_auto_adjust(){
	auto_adjust_feature_level=false;
}
export function enable_auto_adjust(){
	auto_adjust_feature_level=true;
}
export function toggle_auto_adjust(){
	auto_adjust_feature_level=!auto_adjust_feature_level;
}
export function is_auto_adjust_enabled(){
	return auto_adjust_feature_level;
}

// MUST be called on every animationCallback frame.
let page_started_time=NaN;
export function report_frame_time(ms){
	frame_times.push(ms);
	while (frame_times.length>11) frame_times.shift();
	
	// Gather data for 500ms
	let page_start_enough_time_passed=false;
	if (isNaN(page_started_time)) {
		page_started_time=ms;
	}else{
		let time_since_page_start=ms-page_started_time;
		if (time_since_page_start>500) page_start_enough_time_passed=true;
	}
	
	
	if (auto_adjust_feature_level){
		// Calculate FPS
		let fps_avg = NaN;
		if (frame_times.length>10){
			let fp_last=frame_times[frame_times.length-1];
			let fp_first=frame_times[0];
			let fp_intervals = frame_times.length-1;
			let milliseconds_per_frame=(fp_last-fp_first)/fp_intervals;
			fps_avg=1000/milliseconds_per_frame;
		}
		
		// Only run if we have a valid FPS.
		if (!isNaN(fps_avg)){
			// Never adjusted. BUT we have an FPS. AND enough time has passed.
			// Do the first adjust.
			if (isNaN(feature_last_adjusted) && page_start_enough_time_passed){
				guess_feature_level(fps_avg);
				feature_last_adjusted=ms;
			}else if ((ms-feature_last_adjusted)>FEATURE_ADJUST_INTERVAL){
				step_feature_level(fps_avg);
				feature_last_adjusted=ms;
			}
		}
	}
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

// Initialize to higest feature level.
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

// Feature Level access functions
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

// For debug printing.
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
