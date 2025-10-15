import * as Config  from "./config.js";
import * as Graphics  from "./graphics.js";

const wsd = document.getElementById("whole-screen-div");
const canvas_stars = document.getElementById("canvas-stars");
const container_stars = document.getElementById("container-stars");
const debug_print_stars=document.getElementById("debug-print-stars");

const star_density_reciprocal=10000/Config.OPTION_STAR_DENSITY_MULTIPLIER; // One star every X pixels
//console.log("SDM "+Config.OPTION_STAR_DENSITY_MULTIPLIER);

// Pre-calculate star locations and attributes
let star_definitions=[];
let star_def_area_w=0;
let star_def_area_h=0;
let STARS_MAX_SCROLL=100;
let stars_scroll_pixels=0;

function spawn_stars(
    count,minX,maxX,minY,maxY){
    // min is inclusive, max is exclusive.
  //console.log(`Spawn Stars: ${count} in X ${minX} - ${maxX}, Y ${minY} - ${maxY}`);
  for (let i=0;i<count;i++){
    star_definitions.push({
      "x":minX+(maxX-minX-1)*Math.random(),
      "y":minY+(maxY-minY-1)*Math.random(),
      "size":Math.random(),
      "sine_period":Math.random()*1.0+2.0,
      "sine_phase":Math.random()})
  }
}

function resize_star_area(new_w,new_h){
  console.log(`Star Area Changed: ${new_w} ${new_h}`)
  let old_area=star_def_area_h*star_def_area_w;
  
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
    let stars_to_spawn_f=stars_to_spawn_r-stars_to_spawn_i;
    let stars_to_spawn=0;
    //console.log("SDR "+star_density_reciprocal)
    if (stars_to_spawn_f>Math.random()) stars_to_spawn=stars_to_spawn_i+1;
    else stars_to_spawn=stars_to_spawn_i;
    spawn_stars(
      stars_to_spawn,
      star_def_area_w,new_w,
      0,star_def_area_h);
    star_def_area_w=new_w;
  }
  
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

export function set_scroll_progress(f){
  stars_scroll_pixels=f*100;
}


const sc2d = canvas_stars.getContext("2d");
function refresh_stars_canvas(dt){
  let w=canvas_stars.width;
  let h=canvas_stars.height;
  
  if ((w!=star_def_area_w) || ((h+STARS_MAX_SCROLL)!=star_def_area_h)){
    resize_star_area(w,h+STARS_MAX_SCROLL);
  }
  
  sc2d.clearRect(0,0,w,h);
  
  //console.log("Stars.js: Drawing "+star_definitions.length+" stars...");
  
  for (const sd of star_definitions){
    let x=sd.x;
    let y=sd.y-stars_scroll_pixels;
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
  
  debug_print_stars.innerHTML="Stars x"+star_definitions.length
  
}

export function animationTick(dt){
  if (canvas_stars.width!=wsd.clientWidth)
    canvas_stars.width=wsd.clientWidth;
  if (canvas_stars.height!=wsd.clientHeight)
    canvas_stars.height=wsd.clientHeight;
  
  refresh_stars_canvas(dt);
}
