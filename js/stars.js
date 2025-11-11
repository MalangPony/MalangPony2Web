/*
 * JS Module handling the stars in the background.
 * 
 */

// Module imports
import * as Config  from "./config.js";
import * as Graphics  from "./graphics.js";
import * as PerformanceManager from "./perfmanager.js";

// DOM definitions
const wsd = document.getElementById("whole-screen-div");
const canvas_stars = document.getElementById("canvas-stars");
const debug_print_stars=document.getElementById("debug-print-stars");

// One star every X pixels
const star_density_reciprocal=10000/Config.OPTION_STAR_DENSITY_MULTIPLIER;

// Pre-calculate star locations and attributes
let star_definitions=[];
let star_def_area_w=0;
let star_def_area_h=0;
let stars_scroll_pixels=0;

// Spawn [count] stars in the given coordinates.
// min is inclusive, max is exclusive.
function spawn_stars(
    count,minX,maxX,minY,maxY){

  for (let i=0;i<count;i++){
    star_definitions.push({
      "x":minX+(maxX-minX-1)*Math.random(),
      "y":minY+(maxY-minY-1)*Math.random(),
      "size":Math.random(),
      "sine_period":Math.random()*1.0+2.0,
      "sine_phase":Math.random()})
  }
}

// Handle canvas resize.
// We only populate or remove stars in the areas that were affected.
// Not only is this good for performance, but this also makes the BG
// less jittery when resizing.
function resize_star_area(new_w,new_h){
  console.log(`Star Area Changed: ${new_w} ${new_h}`);
  let old_area=star_def_area_h*star_def_area_w;
  
  // Handle each axis separately.
  
  // X
  if (new_w<star_def_area_w){
    // Contract X
    star_definitions=star_definitions.filter((sd)=>{
      return (sd.x<new_w);
    });
    star_def_area_w=new_w;
  }else if (new_w>star_def_area_w){
    //Expand X
    let new_area = new_w*star_def_area_h;
    let stars_to_spawn_r = (new_area-old_area)/star_density_reciprocal;
    let stars_to_spawn_i=Math.floor(stars_to_spawn_r);
    
    // This probably isn't needed, but in case we want to spawn, say 1.5 stars,
    // we spawn 1 star and spawn another with a 50% probablilty.
    // This makes sure that even if the screen is resized slowly, the results
    // will be more or less correct.
    let stars_to_spawn_f=stars_to_spawn_r-stars_to_spawn_i;
    let stars_to_spawn=0;
    if (stars_to_spawn_f>Math.random()) stars_to_spawn=stars_to_spawn_i+1;
    else stars_to_spawn=stars_to_spawn_i;
    
    // Do the actual spawning.
    spawn_stars(
      stars_to_spawn,
      star_def_area_w,new_w,
      0,star_def_area_h);
    star_def_area_w=new_w;
  }
  
  // The logic for Y is the same as X.
  if (new_h<star_def_area_h){
    // Contract Y
    star_definitions=star_definitions.filter((sd)=>{
      return (sd.y<new_h);
    });
    star_def_area_h=new_h;
  }else if (new_h>star_def_area_h){
    //Expand Y
    let new_area = new_h*star_def_area_w;
    let stars_to_spawn_r = (new_area-old_area)/star_density_reciprocal;
    let stars_to_spawn_i=Math.floor(stars_to_spawn_r);
    let stars_to_spawn_f=stars_to_spawn_r-stars_to_spawn_i;
    let stars_to_spawn=0;
    if (stars_to_spawn_f>Math.random()) stars_to_spawn=stars_to_spawn_i+1;
    else stars_to_spawn=stars_to_spawn_i;
    spawn_stars(
      stars_to_spawn,
      0,star_def_area_w,
      star_def_area_h,new_h);
    star_def_area_h=new_h;
  }
}

// This should be called from the main JS file.
export function set_scroll_progress(f){
  stars_scroll_pixels=f*Config.OPTION_SCROLL_BG_OFFSET_AMOUNT;
}


const sc2d = canvas_stars.getContext("2d");
function refresh_stars_canvas(dt){
  // Set canvas size to cover the full screen PLUS the max offset.
  let fullscreenW=wsd.clientWidth;
  let fullscreenH=wsd.clientHeight;
  
  let targetSizeW=fullscreenW;
  let targetSizeH=fullscreenH+Config.OPTION_SCROLL_BG_OFFSET_AMOUNT;
  
  if (canvas_stars.width!=targetSizeW)
    canvas_stars.width=targetSizeW;
  if (canvas_stars.height!=targetSizeH)
    canvas_stars.height=targetSizeH;
  
  let w=canvas_stars.width;
  let h=canvas_stars.height;
  
  // Check if resize is needed
  let resized=false;
  if ((w!=star_def_area_w) || (h!=star_def_area_h)){
    resize_star_area(w,h);
    resized=true;
  }
  
  let animated = (Config.OPTION_ENABLE_ANIMATED_STARS 
       && PerformanceManager.check_feature_enabled(
            PerformanceManager.Feature.ANIMATED_STARS))

  if (animated || resized){
    // Clear canvas.
    sc2d.clearRect(0,0,w,h);
    
    
    // Draw all the stars.
    // The stars flicker in a sine wave.
    for (const sd of star_definitions){
      let x=sd.x;
      let y=sd.y;
      if ((y<0) || (y>h)) continue;
      sd.sine_phase+=(dt/sd.sine_period);
      // Discard integer part
      sd.sine_phase=sd.sine_phase-Math.floor(sd.sine_phase);
      let sine_value = Math.sin(2*Math.PI*sd.sine_phase)*0.5+0.5;
      let size=1.0+sd.size*1.0+sine_value*0.5;
      Graphics.draw_glowing_circle(
        sc2d,
        x,y,
        "hsla(  0,   0%, 100%, 0.9)",
        "hsla( 60, 100%,  50%, 0.3)",
        "hsla( 60, 100%, 100%, 0.0)",
        size,size*0.5,1.0+sine_value*2.0
      )
    }
  }
  
  canvas_stars.style.top="-"+stars_scroll_pixels+"px";
  canvas_stars.style.height=""+targetSizeH+"px";
  
  debug_print_stars.innerHTML="Stars x"+star_definitions.length+(animated?" (Animated)":" (Static)");
}

// This should be called every frame, from main JS.
export function animationTick(dt){
  refresh_stars_canvas(dt);
}
