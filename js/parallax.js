/*
 * JS module handling the parallax scene in the background.
 * 
 * This implements a faux-3D environment in a 2D HTML layout space.
 */

// Modules
import { Vector2, Vector3 } from "./vectors.js";
import * as Config  from "./config.js";
import * as PerformanceManager from "./perfmanager.js";
import * as ParallaxData from "./parallax_data.js";
import { AnimatedValue } from "./animator.js";

// DOM definitions
const wsd = document.getElementById("whole-screen-div");
const image_container_near = document.getElementById("parallax-image-container-near");
const image_container_far = document.getElementById("parallax-image-container-far");

// A Parallax-affected image.
// This behaves like a object in 3D space.
class ParallaxImage{
  // Note that this is the coordinate of BOTTOM CENTER.
  // Z moves away and from the screen.
  // X is left and right.
  // Y is up and down. +Y is UP.
  location = new Vector3();
  // X,Y dimensions
  dimensions = new Vector2();
  // Either "image" or "solid"
  type;
  // For Images, the source image src. For Solids, a CSS color.
  src;
  constructor(loc,dim,type,src){
    this.location=loc;
    this.dimensions=dim;
    this.type=type;
    this.src=src;
  }
  
  toString(){
    return "ParallaxImage(LOC="+this.location+", DIM="+this.dimensions+", TYP="+this.type+", SRC="+this.src+")";
  }
}

// Stores camera parameters.
class CameraParameters{
  position= Vector3.ZERO;
  zoom=1;
  tilt=0;
  constructor(p,z,t){
    this.position=p;
    this.zoom=z;
    this.tilt=t;
  }
  toString(){
    return "CamParam(LOC="+this.position+", ZOOM="+this.zoom.toFixed(2)+", TILT="+this.tilt.toFixed(2)+")";
  }
}

// Stores an animated CameraParameter
class AnimatedCamera{
  #positionAV;
  #zoomAV;
  #tiltAV;
  
  constructor(){
    this.#positionAV=new AnimatedValue(new Vector3(0,0,-500));
    this.#zoomAV=new AnimatedValue(1);
    this.#tiltAV=new AnimatedValue(0);
    this.#positionAV.set_ease(3,true,true);
    this.#zoomAV.set_ease(3,true,true);
    this.#tiltAV.set_ease(3,true,true);
  }  
  
  get_value(){
    return new CameraParameters(
      this.#positionAV.calculate_value(),
      this.#zoomAV.calculate_value(),
      this.#tiltAV.calculate_value()
    );
  }
  tick(dt){
    this.#positionAV.tick(dt);
    this.#zoomAV.tick(dt);
    this.#tiltAV.tick(dt);
  }
  
  was_changed_this_tick(){
    return this.#positionAV.changed_this_tick ||
      this.#zoomAV.changed_this_tick ||
      this.#tiltAV.changed_this_tick;
  }
  
  animate_to(cp){
    this.#positionAV.animate_to(cp.position);
    this.#zoomAV.animate_to(cp.zoom);
    this.#tiltAV.animate_to(cp.tilt);
  }
  jump_to(cp){
    this.#positionAV.jump_to(cp.position);
    this.#zoomAV.jump_to(cp.zoom);
    this.#tiltAV.jump_to(cp.tilt);
  }
  jump_to_end(){
    this.#positionAV.jump_to_end();
    this.#zoomAV.jump_to_end();
    this.#tiltAV.jump_to_end();
  }
  toString(){
    return "CamParam(LOC="+this.#positionAV.calculate_value()+", ZOOM="+this.#zoomAV.calculate_value().toFixed(2)+", TILT="+this.#tiltAV.calculate_value().toFixed(2)+")";
  }
}
let animated_camera = new AnimatedCamera();

// A crude 3D projection into 2D space.
// The math is probably wrong, but it's convincing enough.
const PROJECTION_FADE_START=50;
const PROJECTION_FADE_END=100;
function solve_camera(camera_parameters,parallax_image){
  let relative_location = parallax_image.location.subtract(camera_parameters.position);
  
  // Fade image if too close to camera.
  // 0% at 100, 100% at 300
  let opacity=(relative_location.z-PROJECTION_FADE_START)/(PROJECTION_FADE_END-PROJECTION_FADE_START);
  if (opacity<0) opacity=0;
  if (opacity>1) opacity=1;
  if (opacity<=0) return {"render":false};
  
  // Calculate size and location.
  // intrinsic size at 500. 50% scale at 1000.
  let size_mutiplier = 500/relative_location.z*camera_parameters.zoom;
  let scaled_dim = parallax_image.dimensions.multiply(size_mutiplier);
  let offset_location = relative_location.multiply(size_mutiplier);
  
  return {
    "render":true,
    "opacity":opacity,
    "x":offset_location.x,
    //"y":offset_location.y+(offset_location.z)*camera_parameters.tilt,
    // Above code equivalent to below.
    "y":offset_location.y+(500*camera_parameters.zoom*camera_parameters.tilt),
    "w":scaled_dim.x,
    "h":scaled_dim.y
  };
}


// Parse data from ParallaxData.js
let parallax_images=[];
for (const dat of ParallaxData.images){
  parallax_images.push(
    new ParallaxImage(
      new Vector3(dat.location[0],dat.location[1],dat.location[2]),
      new Vector2(dat.size[0],dat.size[1]),
      dat.type,dat.src)
  )
}

// The DOM elements that correspond to each Parallax image.
// The indices should match.
let pimg_doms=[];

// Sort by Z coordinates.
// We assume Z does not change.
// Otherwise, the draw order will be wrong.
parallax_images.sort((a,b)=>{return b.location.z-a.location.z})

// Create DOM elements representing each parallax image.
function populate_parallax_images(){
  // Clear all DOM
  image_container_near.replaceChildren();
  image_container_far.replaceChildren();
  pimg_doms=[];
  
  // Add DOMs
  let zi=0;
  for (const pimg of parallax_images){
    // Z-Index increases monotonicaly. This assumes the image list is Z-sorted.
    zi++;
    let e=null;
    if (pimg.type=="image"){
      e=document.createElement("img");
      e.src=pimg.src;
    }else if (pimg.type=="solid"){
      e=document.createElement("div");
      e.style.backgroundColor=pimg.src;
    }else if (pimg.type=="gradient"){
      e=document.createElement("div");
      e.style.backgroundImage=pimg.src;
    }else{
      console.log("ERROR 817");
    }
    // All images are absolutely-positioned.
    e.style.position="absolute";
    e.style.zIndex=zi;
    e.style.display="none";
    if (pimg.location.z<3000)
      image_container_near.appendChild(e);
    else
      image_container_far.appendChild(e);
    pimg_doms.push(e);
  }
}

// Populate images on initial page load.
if (Config.OPTION_ENABLE_PARALLAX_BG)
  populate_parallax_images();

// Recalculate image positions from camera position.
let last_cam_param=null;
function recalculate_parallax_images(cam_param){
  
  // Don't bother doing any of this if camera didn't move.
  if (last_cam_param!==null){
    let pos_delta=last_cam_param.position.subtract(cam_param.position).length();
    let zoom_delta = Math.abs(last_cam_param.zoom - cam_param.zoom);
    let tilt_delta = Math.abs(last_cam_param.tilt - cam_param.tilt);
    let changed = (pos_delta>0.0001) || (zoom_delta>0.0001) || (tilt_delta>0.0001);
    if (!changed) return;
  }
  last_cam_param=cam_param;
  
  // Something is very wrong here.
  if (parallax_images.length != pimg_doms.length){
    console.log("ERROR 623")
  }
  let n=parallax_images.length;
  let containerW=image_container_near.clientWidth;
  let containerH=image_container_near.clientHeight;
  
  // For each parallax image...
  for (let i=0;i<n;i++){
    let dom = pimg_doms[i];
    let pimg=parallax_images[i];
    
    // Let solve_camera() do the maths.
    let solve_result=solve_camera(cam_param,pimg);
    
    // Mostly straightforward. Apply solve results to CSS.
    if (solve_result.render===false){
      dom.style.display="none";
    }
    else{
      dom.style.display="block";
      dom.style.opacity=solve_result.opacity;
      if (!Number.isFinite(pimg.dimensions.x)){
        dom.style.width="100%";
        dom.style.left="0";
      }else{

        dom.style.width=solve_result.w+"px";
        dom.style.left=(containerW/2+solve_result.x-solve_result.w/2)+"px";
        
      }
      if (!Number.isFinite(pimg.dimensions.y)){
        dom.style.height="100%";
        dom.style.bottom="0";
      }else if (pimg.dimensions.y<0){
        if (solve_result.y<0){
          dom.style.display="none";
        }else{
          dom.style.height=solve_result.y+"px";
          dom.style.bottom="0";
        }
      }else if (solve_result.h<0){
        dom.style.display="none";
      }else{
        dom.style.height=solve_result.h+"px";
        dom.style.bottom=solve_result.y+"px";
      }
    }
  }
}

// either "NO", "GYRO" or "MOUSE"
// This will not change during runtime.
let CAMERA_NUDGE_MODE="MOUSE";

// This should match a mouse-environment.
// If there is no mouse, try using the gyro.
let mq_pointer=window.matchMedia("(pointer:fine)");
if (!mq_pointer.matches) CAMERA_NUDGE_MODE="GYRO";

// Of course, if config calls for no nudge, disable the nudge.
if (!Config.OPTION_CAMERA_NUDGE_ENABLED)
  CAMERA_NUDGE_MODE="NO";
if (!Config.OPTION_ENABLE_PARALLAX_BG)
  CAMERA_NUDGE_MODE="NO";
console.log("Cam Nudge Mode: "+CAMERA_NUDGE_MODE);

// Convenience function
function limit(low,x,high){
  if (x<low) return low;
  if (x>high) return high;
  return x
}

// Gyro data projected to a 2D range.
let gyro_data=Vector2.ZERO;
//https://stackoverflow.com/questions/69216465/the-simplest-way-to-solve-gimbal-lock-when-using-deviceorientation-events-in-jav#comment138275927_75897568
if (CAMERA_NUDGE_MODE==="GYRO"){
  window.ondeviceorientation = (e) => {
    if (!PerformanceManager.check_feature_enabled(
      PerformanceManager.Feature.PARALLAX_ANIMATED))
        return;
    let alpha=e.alpha;
    let beta = e.beta;
    let gamma = e.gamma;
    
    const degtorad = Math.PI / 180; // Degree-to-Radian conversion
    let cX = Math.cos( beta  * degtorad );
    let cY = Math.cos( gamma * degtorad );
    let cZ = Math.cos( alpha * degtorad );
    let sX = Math.sin( beta  * degtorad );
    let sY = Math.sin( gamma * degtorad );
    let sZ = Math.sin( alpha * degtorad );

    let m13 = cY * sZ * sX + cZ * sY;
    let m23 = sZ * sY - cZ * cY * sX;

    gyro_data=new Vector2(m23,m13);
  }
}

// Mouse location in the 0~1 range.
let mouse_location=new Vector2(wsd.clientWidth/2,wsd.clientHeight/2);
let mouse_screen_relative_location = Vector2.ZERO;
if (CAMERA_NUDGE_MODE==="MOUSE"){
window.onmousemove= (e)=>{
  if (!PerformanceManager.check_feature_enabled(
    PerformanceManager.Feature.PARALLAX_ANIMATED))
      return;
  let screen_size = new Vector2(wsd.clientWidth,wsd.clientHeight);
  mouse_location=new Vector2(e.clientX,e.clientY);
  mouse_screen_relative_location = new Vector2(
    ((e.clientX/wsd.clientWidth)-0.5)*2,
    ((e.clientY/wsd.clientHeight)-0.5)*2
  );
}
}



// Move camera with a smooth animation
export function camera_animate_to(cp){
  animated_camera.animate_to(cp);
}
// Move camera instantly
export function camera_jump_to(cp){
  animated_camera.jump_to(cp);
}

// Move camera to location name
let camera_param_presets={};
for (const k in ParallaxData.camera_locations){
  const v=ParallaxData.camera_locations[k];
  camera_param_presets[k]=new CameraParameters(
    new Vector3(v[0],v[1],v[2]),
    v[3], //Zoom
    v[4] //Tilt
  )
}
// Initial location.
animated_camera.jump_to(camera_param_presets.intro);

// Lookup ParallaxData location names.
export function camera_animate_to_name(name){
  if (name in camera_param_presets){
    camera_animate_to(camera_param_presets[name]);
  }else{
    console.log("Invalid location name: "+name);
  }
}
export function camera_jump_to_name(name){
   if (name in camera_param_presets){
    camera_jump_to(camera_param_presets[name]);
  }else{
    console.log("Invalid location name: "+name);
  }
}
export function name_defined_in_camera_locations(name){
  return (name in camera_param_presets);
}

// Should be called by the main JS.
let scroll_progress=0;
export function set_scroll_progress(f){
  scroll_progress=f;
}

// PerfManager
PerformanceManager.register_feature_disable_callback(
  PerformanceManager.Feature.PARALLAX_GROUND,()=>{
    image_container_near.style.display="none";
    animated_camera.jump_to_end();
  }
);
PerformanceManager.register_feature_enable_callback(
  PerformanceManager.Feature.PARALLAX_GROUND,()=>{
    image_container_near.style.display="block";
  }
);

let camera_nudge_lerped=Vector2.ZERO;
export function animationTick(dt){
  if (!Config.OPTION_ENABLE_PARALLAX_BG) return;
  if (!PerformanceManager.check_feature_enabled(
      PerformanceManager.Feature.PARALLAX_GROUND)) return;
  
  // Animate camera
  animated_camera.tick(dt);
  let cam_param = animated_camera.get_value();
  
  // Calculate camera nudge
  if (CAMERA_NUDGE_MODE==="NO"){
    // Nudge disabled
    camera_nudge_lerped = Vector2.ZERO;
  }else{
    
    // Apply nudge multipliers
    let camera_nudge=Vector2.ZERO;
    if (!PerformanceManager.check_feature_enabled(
      PerformanceManager.Feature.PARALLAX_ANIMATED)){
        // Pass. Leave nudge at 0,0
    }else if (CAMERA_NUDGE_MODE==="MOUSE"){
      camera_nudge= mouse_screen_relative_location.multiply(
        20*Config.OPTION_CAMERA_NUDGE_MOUSE_SENSITIVITY);
      camera_nudge=new Vector2(camera_nudge.x,-camera_nudge.y);
    }else if (CAMERA_NUDGE_MODE==="GYRO"){
      camera_nudge= gyro_data.multiply(
        50*Config.OPTION_CAMERA_NUDGE_GYRO_SENSITIVITY);
      camera_nudge=new Vector2(-camera_nudge.x,camera_nudge.y);
    }
    
    // We lerp the camera nudge, to make it move smoothly.
    let lerp_fac=3.0;
    let lerp_raw_distance = camera_nudge.subtract(camera_nudge_lerped);
    let lerp_delta = lerp_raw_distance.multiply(Math.min(dt*lerp_fac,1.0));
    let speed = lerp_delta.length()/dt; //pixels per second
    // The image locations can only be a whole number.
    // Therefore, when the speed is too low,
    // the image will look stuttery because it snaps to integer coordinates.
    // So we just stop moving when the speed is less than 5px/s
    if (speed<5) lerp_delta=Vector2.ZERO;
    
    // Apply camera location
    camera_nudge_lerped=camera_nudge_lerped.add(lerp_delta);
  }
  
  // Camera offset.
  let nudge=new Vector3(
      camera_nudge_lerped.x,
      (1-scroll_progress)*ParallaxData.camera_sky_y_offset+camera_nudge_lerped.y,
      0);
  cam_param.position=cam_param.position.add(nudge);
  cam_param.tilt = 
    scroll_progress * cam_param.tilt + 
    (1-scroll_progress) * ParallaxData.camera_sky_tilt;
  
  
  // Recalculate parallax with the new camera location
  recalculate_parallax_images(cam_param);
}

// At full sky (scroll prog = 0), Y=700, Tilt=0
// At full ground (scroll prog = 1), Y=200, Tilt = 0.7
// For an object at Z=3000, Rel.Z=3500
// SizeMult = 500/3500 = 0.1429
// From tilt, Y gets offset by 350 and by Y-Translation, 71
// Total of ~420 px offset from sky to ground
export function calculate_offset_from_sky_mode_to_ground_mode(z_coords){
  let intro_camera=camera_param_presets["intro"]
  let relZ=z_coords-intro_camera.position.z;
  let scaling_factor=500/relZ;
  let y_translation_by_yoffset = ParallaxData.camera_sky_y_offset*scaling_factor;
  let tilt_delta = (intro_camera.tilt-ParallaxData.camera_sky_tilt);
  let zoom = intro_camera.zoom;
  let y_translation_by_tilt = 500*zoom*tilt_delta;
  let y_total_delta = y_translation_by_yoffset+y_translation_by_tilt;
  console.log(`Intro Sky to Ground Z ${z_coords} YOF ${y_translation_by_yoffset} YTT ${y_translation_by_tilt} TOT ${y_total_delta}`);
  return y_total_delta;
}
