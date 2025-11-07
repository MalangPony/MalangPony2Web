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
const parallax_image_container = document.getElementById("parallax-image-container");

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
  // A crude 3D projection into 2D space.
  // The math is probably wrong, but it's convincing enough.
  solve(camera_location = new Vector3()){
    let relative_location = this.location.subtract(camera_location);
    
    // Fade image if too close to camera.
    // 0% at 100, 100% at 500
    let opacity=(relative_location.z-100)/400;
    if (opacity<0) opacity=0;
    if (opacity>1) opacity=1;
    if (opacity<=0) return {"render":false};
    
    // Calculate size and location.
    // intrinsic size at 100. 50% scale at 200.
    let xy_multiplier = 500/relative_location.z;
    let scaled_dim = this.dimensions.multiply(xy_multiplier);
    let offset_location = relative_location.multiply(xy_multiplier).projectXY();
    
    return {
      "render":true,
      "opacity":opacity,
      "x":offset_location.x,
      "y":offset_location.y+(relative_location.z)*0.3,
      "w":scaled_dim.x,
      "h":scaled_dim.y
    };
  }
  toString(){
    return "ParallaxImage(LOC="+this.location+", DIM="+this.dimensions+", TYP="+this.type+", SRC="+this.src+")";
  }
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

let camera_locations={};
for (const k in ParallaxData.camera_locations){
  const v=ParallaxData.camera_locations[k];
  camera_locations[k]=new Vector3(v[0],v[1],v[2]);
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
  parallax_image_container.replaceChildren();
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
    }else{
      console.log("ERROR 817");
    }
    // All images are absolutely-positioned.
    e.style.position="absolute";
    e.style.zIndex=zi;
    e.style.display="none";
    parallax_image_container.appendChild(e);
    pimg_doms.push(e);
  }
}
if (Config.OPTION_ENABLE_PARALLAX_BG)
  populate_parallax_images();

// Recalculate image positions from camera position.
let last_camera_position=null;
function recalculate_parallax_images(camera_location){
  
  // Don't bother doing any of this if camera didn't move.
  let cam_movement_distance=10000000;
  if (last_camera_position !== null){
    let cam_delta = last_camera_position.subtract(camera_location);
    cam_movement_distance=cam_delta.length();
  }
  last_camera_position=camera_location;
  if (cam_movement_distance<0.0001) return;
  
  
  // Something is very wrong here.
  if (parallax_images.length != pimg_doms.length){
    console.log("ERROR 623")
  }
  let n=parallax_images.length;
  let containerW=parallax_image_container.clientWidth;
  let containerH=parallax_image_container.clientHeight;
  
  // For each parallax image...
  for (let i=0;i<n;i++){
    let dom = pimg_doms[i];
    let pimg=parallax_images[i];
    
    // Let ParallaxImage::solve do the maths.
    let solve_result=pimg.solve(camera_location);
    
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

// The camera location.
let parallax_camera = new AnimatedValue(new Vector3(0,0,-500));
parallax_camera.set_ease(3,true,true);

// Move camera with a smooth animation
export function camera_animate_to(loc){
  parallax_camera.animate_to(loc);
}
// Move camera instantly
export function camera_jump_to(loc){
  parallax_camera.jump_to(loc);
}

// Move camera to location name
export function camera_animate_to_name(location_name){
  if (!(location_name in camera_locations))
    console.log("Invalid location name: "+location_name)
  else
    camera_animate_to(camera_locations[location_name]);
}
export function camera_jump_to_name(location_name){
  if (!(location_name in camera_locations))
    console.log("Invalid location name: "+location_name)
  else
    camera_jump_to(camera_locations[location_name]);
}
export function name_defined_in_camera_locations(name){
  return (name in camera_locations);
}

// Should be called by the main JS.
let scroll_progress=0;
export function set_scroll_progress(f){
  scroll_progress=f;
}


// Simple polynomial easing functions.
function polynomialEaseIn(x,power){
  return Math.pow(x,power);
}
function polynomialEaseOut(x,power){
  return 1-polynomialEaseIn(1-x,power)
}
function polynomialEase(x,power){
  if (x<0.5) return polynomialEaseIn(x*2,power)*0.5;
  else return polynomialEaseOut((x-0.5)*2,power)*0.5+0.5;
}

PerformanceManager.register_feature_disable_callback(
  PerformanceManager.Feature.PARALLAX_GROUND,()=>{
    parallax_image_container.style.display="none";
    parallax_camera.jump_to_end();
  }
);
PerformanceManager.register_feature_enable_callback(
  PerformanceManager.Feature.PARALLAX_GROUND,()=>{
    parallax_image_container.style.display="block";
  }
);

let camera_nudge_lerped=Vector2.ZERO;
export function animationTick(dt){
  if (!Config.OPTION_ENABLE_PARALLAX_BG) return;
  if (!PerformanceManager.check_feature_enabled(
      PerformanceManager.Feature.PARALLAX_GROUND)) return;
  
  // Animate camera
  parallax_camera.tick(dt);
  let parallax_camera_current=parallax_camera.calculate_value();
  
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
  
  // Recalculate parallax with the new camera location
  recalculate_parallax_images(
    new Vector3(
      parallax_camera_current.x+camera_nudge_lerped.x,
      (1-scroll_progress)*1000+camera_nudge_lerped.y,
      parallax_camera_current.z
    ));
	
}

