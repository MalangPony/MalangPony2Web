import { Vector2, Vector3 } from "./vectors.js";
import * as Config  from "./config.js";

const wsd = document.getElementById("whole-screen-div");
const parallax_image_container = document.getElementById("parallax-image-container");

class ParallaxImage{
  // Note that this is the coordinate of BOTTOM CENTER.
  location = new Vector3();
  dimensions = new Vector2();
  type;
  src;
  constructor(loc,dim,type,src){
    this.location=loc;
    this.dimensions=dim;
    this.type=type;
    this.src=src;
  }
  solve(camera_location = new Vector3()){
    let relative_location = this.location.subtract(camera_location);
    // 0% at 100, 100% at 500
    let opacity=(relative_location.z-100)/400;
    if (opacity<0) opacity=0;
    if (opacity>1) opacity=1;
    
    if (opacity<=0) return {"render":false};
    
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

let parallax_images=[
  // Ground
  new ParallaxImage(
    new Vector3(0,-300,1000),
    new Vector2(Infinity,-1),
    "solid","#0e3108"),
  //FS
  new ParallaxImage(
    new Vector3(-200,0,-100),
    new Vector2(200,200*(326/500)),
    "image","MPN2-Prototype-Image-D2489678.png"),
  //TS
  new ParallaxImage(
    new Vector3(200,0,0),
    new Vector2(200,200*(370/500)),
    "image","MPN2-Prototype-Image-D1408232.png"),
  //RD
  new ParallaxImage(
    new Vector3(100,0,200),
    new Vector2(200,200*(500/469)),
    "image","MPN2-Prototype-Image-D926915.png"),
  //Table
  new ParallaxImage(
    new Vector3(0,0,0),
    new Vector2(200,200*(500/1050)),
    "image","MPN2-Prototype-Image-D1467319-E1.png"),
  //Cannon
  new ParallaxImage(
    new Vector3(-400,0,300),
    new Vector2(200,200*(458/500)),
    "image","MPN2-Prototype-Image-D1718519.png"),
  
];
let pimg_doms=[];

parallax_images.sort((a,b)=>{return b.location.z-a.location.z})


function populate_parallax_images(){
  // Clear all DOM
  parallax_image_container.replaceChildren();
  pimg_doms=[];
  
  // Add DOMs
  let zi=0;
  for (const pimg of parallax_images){
    zi++;
    //console.log("Create PIMG "+pimg);
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
    e.style.position="absolute";
    e.style.zIndex=zi;
    e.style.display="none";
    parallax_image_container.appendChild(e);
    pimg_doms.push(e);
  }
}
populate_parallax_images();
function recalculate_parallax_images(camera_location){
  if (parallax_images.length != pimg_doms.length){
    console.log("ERROR 623")
  }
  let n=parallax_images.length;
  let containerW=parallax_image_container.clientWidth;
  let containerH=parallax_image_container.clientHeight;
  for (let i=0;i<n;i++){
    let dom = pimg_doms[i];
    let pimg=parallax_images[i];
    
    let solve_result=pimg.solve(camera_location);
    
    //console.log("SR "+i+" / "+JSON.stringify(solve_result));
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
let CAMERA_NUDGE_MODE="MOUSE";

let mq_pointer=window.matchMedia("(pointer:fine)");
if (!mq_pointer.matches) CAMERA_NUDGE_MODE="GYRO";

if (!Config.OPTION_CAMERA_NUDGE_ENABLED)
  CAMERA_NUDGE_MODE="NO";

console.log("Cam Nudge Mode: "+CAMERA_NUDGE_MODE);

function limit(low,x,high){
  if (x<low) return low;
  if (x>high) return high;
  return x
}
let gyro_data=Vector2.ZERO;
//https://stackoverflow.com/questions/69216465/the-simplest-way-to-solve-gimbal-lock-when-using-deviceorientation-events-in-jav#comment138275927_75897568
window.ondeviceorientation = (e) => {
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

let mouse_location=new Vector2(wsd.clientWidth/2,wsd.clientHeight/2);
let mouse_screen_relative_location = Vector2.ZERO;
window.onmousemove= (e)=>{
  let screen_size = new Vector2(wsd.clientWidth,wsd.clientHeight);
  mouse_location=new Vector2(e.clientX,e.clientY);
  mouse_screen_relative_location = new Vector2(
    ((e.clientX/wsd.clientWidth)-0.5)*2,
    ((e.clientY/wsd.clientHeight)-0.5)*2
  );
}
let camera_nudge_lerped=Vector2.ZERO;



let parallax_camera = new Vector3(0,0,-500);

let camera_being_animated=false;
let camera_anim_position_start=null;
let camera_anim_position_end=null;
let camera_anim_time_duration=0;
let camera_anim_time_remaining=0;

export function camera_animate_to(loc){
  camera_being_animated=true;
  camera_anim_position_start=parallax_camera;
  camera_anim_position_end=loc;
  camera_anim_time_duration=1.0;
  camera_anim_time_remaining=camera_anim_time_duration;
}

let scroll_progress=0;
export function set_scroll_progress(f){
  scroll_progress=f;
}



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

export function animationTick(dt){
    if (camera_being_animated){
    camera_anim_time_remaining-=dt;
    if (camera_anim_time_remaining<0){
      camera_being_animated=false;
      parallax_camera=camera_anim_position_end;
    }else{
      let anim_ratio = 1-(camera_anim_time_remaining/camera_anim_time_duration);
      anim_ratio=polynomialEase(anim_ratio,3);
      parallax_camera=camera_anim_position_end.subtract(camera_anim_position_start).multiply(anim_ratio).add(camera_anim_position_start);
    }
  }
  
  
  if (CAMERA_NUDGE_MODE==="NO"){
    camera_nudge_lerped = Vector2.ZERO;
  }else{
    let camera_nudge=Vector2.ZERO;
    if (CAMERA_NUDGE_MODE==="MOUSE"){
      camera_nudge= mouse_screen_relative_location.multiply(
        20*Config.OPTION_CAMERA_NUDGE_MOUSE_SENSITIVITY);
      camera_nudge=new Vector2(camera_nudge.x,-camera_nudge.y);
    }
    else if (CAMERA_NUDGE_MODE==="GYRO"){
      camera_nudge= gyro_data.multiply(
        50*Config.OPTION_CAMERA_NUDGE_GYRO_SENSITIVITY);
      camera_nudge=new Vector2(-camera_nudge.x,camera_nudge.y);
    }
    let lerp_fac=3.0;
    let lerp_raw_distance = camera_nudge.subtract(camera_nudge_lerped);
    let lerp_delta = lerp_raw_distance.multiply(Math.min(dt*lerp_fac,1.0));
    let speed = lerp_delta.length()/dt; //pixels per second
    if (speed<5) lerp_delta=Vector2.ZERO;//lerp_raw_distance;
    camera_nudge_lerped=camera_nudge_lerped.add(lerp_delta);
  }
  
  recalculate_parallax_images(
    new Vector3(
      parallax_camera.x+camera_nudge_lerped.x,
      (1-scroll_progress)*1000+camera_nudge_lerped.y,
      parallax_camera.z
    ));
	
}

