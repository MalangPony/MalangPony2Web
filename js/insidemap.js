import { Vector2, Vector3 } from "./vectors.js";
import { AnimatedValue } from "./animator.js";
import { linear_map } from "./utils.js";

import * as InsidemapAutoData from "./insidemap_data_auto.js";
import * as InsidemapManualData from "./insidemap_data_manual.js";
import * as Global from "./global.js";

let scroller = document.getElementById("internal-map-scroller");
let container = document.getElementById("internal-map-container");
let image_pl = document.getElementById("internal-map-image-persp1-light");
let image_ol = document.getElementById("internal-map-image-ortho1-light");
let image_pd = document.getElementById("internal-map-image-persp1-dark");
let image_od = document.getElementById("internal-map-image-ortho1-dark");
let canvas = document.getElementById("internal-map-canvas");

let button_overlay_off=document.getElementById("internal-map-button-overlay-off");
let button_overlay_on=document.getElementById("internal-map-button-overlay-on");

let button_domain_persp1=document.getElementById("internal-map-button-domain-persp1");
let button_domain_ortho1=document.getElementById("internal-map-button-domain-ortho1");

const bounds_pixel_basis=3000;


let current_size=0;
let current_domain="persp1";

let paths={};
function recalculate_paths(){
  paths={};
  for (const k of InsidemapAutoData.zone_list){
    let p2d=new Path2D();
    let coords=InsidemapAutoData.data[current_domain][k]["zone_poly"];
    for (let i=0;i<coords.length;i++){
      let x=coords[i][0]/bounds_pixel_basis*current_size;
      let y=coords[i][1]/bounds_pixel_basis*current_size;
      if (i==0) p2d.moveTo(x,y);
      else p2d.lineTo(x,y);
    }
    p2d.closePath();
    paths[k]=p2d;
  }
}

let centers={};
function recalculate_centers(){
  centers={};
  for (const k of InsidemapAutoData.zone_list){
    let co=InsidemapAutoData.data[current_domain][k]["center_override"];
    if (co !== undefined){
      centers[k]=[
        co[0]/bounds_pixel_basis*current_size,
        co[1]/bounds_pixel_basis*current_size,
      ];
    }else{
      let coords=InsidemapAutoData.data[current_domain][k]["zone_poly"];
      let maxX=-Infinity;
      let maxY=-Infinity;
      let minX=Infinity;
      let minY=Infinity;
      for (let i=0;i<coords.length;i++){
        let x=coords[i][0]/bounds_pixel_basis*current_size;
        let y=coords[i][1]/bounds_pixel_basis*current_size;
        if (x>maxX) maxX=x;
        if (x<minX) minX=x;
        if (y>maxY) maxY=y;
        if (y<minY) minY=y;
      }
      centers[k]=[(minX+maxX)/2.0,(minY+maxY)/2.0];
    }
  }
}

function apply_domain_and_theme(){
  image_pl.style.display="none";
  image_ol.style.display="none";
  image_pd.style.display="none";
  image_od.style.display="none";
  button_domain_ortho1.style.display="none";
  button_domain_persp1.style.display="none";
  if (current_domain=="ortho1"){
    if (!Global.darkmode) image_ol.style.display="block";
    else image_od.style.display="block";
    
    button_domain_persp1.style.display="flex";
  }else if(current_domain=="persp1"){
    if (!Global.darkmode) image_pl.style.display="block";
    else image_pd.style.display="block";
    
    button_domain_ortho1.style.display="flex";
  }
  
  recalculate_paths();
  recalculate_centers();
}
export function set_domain(d){
  current_domain=d;
  apply_domain_and_theme();
}
Global.add_darkmode_listener(()=>{
  apply_domain_and_theme();
});
apply_domain_and_theme();


// All UI elements were sized using a canvas of 700px in size,
// So if the canvas has a different size, we must scale the fonts accordingly.
// BUT don't resize it to be too small.
let font_size_muliplier=1.0;
let canvas_resolution_multiplier=1.0;
function handle_resize(){
  current_size=container.clientWidth;
  if (Global.mobile) canvas_resolution_multiplier=2.0;
  else canvas_resolution_multiplier=1.0;
  
  canvas.width=current_size*canvas_resolution_multiplier;
  canvas.height=current_size*canvas_resolution_multiplier;
  
  console.log("InsideMap Size "+current_size.toFixed(1)+" (x"+canvas_resolution_multiplier.toFixed(2)+")");
  
  font_size_muliplier=current_size/700.0;
  if (font_size_muliplier<0.5) font_size_muliplier=0.5;
  recalculate_paths();
  recalculate_centers();
}
Global.add_mobile_listener(()=>{
  handle_resize();
});


let rso = new ResizeObserver(handle_resize);
rso.observe(container);
handle_resize();


const sc2d = canvas.getContext("2d");

let selection_progress={};
let hover_progress={};
for (const k of InsidemapAutoData.zone_list){
  let s=new AnimatedValue(0.0);
  s.duration=0.5;
  s.exponent=3.0;
  s.ease_out=true;
  selection_progress[k]=s;
  
  let h=new AnimatedValue(0.0);
  h.duration=0.4;
  h.exponent=3.0;
  h.ease_out=true;
  h.ease_in=true;
  hover_progress[k]=h;
}

// Last selected area is at the end
let selection_sorted_keys=[];
for (const k of InsidemapAutoData.zone_list){
  selection_sorted_keys.push(k);
}

// AV of the 'focus' - will ramp up to 1.0 when ANYTHING is selected.
let focusAV = new AnimatedValue(0.0);
focusAV.duration=1.0;
focusAV.exponent=3.0;
focusAV.ease_out=true;
focusAV.ease_in=false;


// Is the zone selected? (clicked)
let selection_map={};
// Is the zone being hovered over?
let hover_map={};

for (const k of InsidemapAutoData.zone_list){
  selection_map[k]=false;
  hover_map[k]=false;
}
  
function mouse_events_handler(e,click){
  if (!overlay_active) {
    container.style.cursor="unset";
    return;
  }
  
  let bbox=container.getBoundingClientRect();
  let localX=e.clientX-bbox.left;
  let localY=e.clientY-bbox.top;
  
  // Actual bounds check
  let hm_last=hover_map;
  hover_map={};
  for (const k of InsidemapAutoData.zone_list){
    hover_map[k] = sc2d.isPointInPath(paths[k],localX,localY);
  }
  
  // Calculate max priority
  let max_priority=-Infinity;
  for (const k of InsidemapAutoData.zone_list){
    if (hover_map[k]){
      if (InsidemapManualData.zone_data[k].priority>max_priority) max_priority=InsidemapManualData.zone_data[k].priority;
    }
  }
  // Filter out lower-priority zones
  for (const k of InsidemapAutoData.zone_list){
    if (InsidemapManualData.zone_data[k].priority<max_priority){
      hover_map[k] = false;
    }
  }
  
  let sm_last=selection_map;
  if (click){
    // Select only hovered-over zones, deselect all else.
    selection_map={};
    for (const k of InsidemapAutoData.zone_list){
      if (hover_map[k]) selection_map[k]= !sm_last[k];
      else selection_map[k]=false;
    }
  }
  
  let any_hover=false;
  let any_selected=false;
  let was_any_selected=false;
  for (const k of InsidemapAutoData.zone_list){
    let was_selected = sm_last[k];
    let selected = selection_map[k];
    let was_hovered = hm_last[k];
    let hovered=hover_map[k];
    
    if (selected) any_selected=true;
    if (was_selected) was_any_selected=true;
    
    if (hovered) any_hover=true;
    
    if (was_selected && (!selected)){
      if (Global.animated) selection_progress[k].animate_to(0.0);
      else selection_progress[k].jump_to(0.0);
    }
    if ((!was_selected) && selected){
      if (Global.animated) selection_progress[k].animate_to(1.0);
      else selection_progress[k].jump_to(1.0);
      
      selection_sorted_keys.splice(selection_sorted_keys.indexOf(k),1);
      selection_sorted_keys.push(k);
    }
    
    if (was_hovered && (!hovered)){
      if (Global.animated) hover_progress[k].animate_to(0.0);
      else hover_progress[k].jump_to(0.0);
    }
    if ((!was_hovered) && hovered){
      if (Global.animated) hover_progress[k].animate_to(1.0);
      else hover_progress[k].jump_to(1.0);
    }
  }
  
  // Check if anything was hit
  
  if (any_hover) container.style.cursor="pointer";
  else container.style.cursor="unset";
  
  if ((!was_any_selected) && any_selected) {
    if (Global.animated) focusAV.animate_to(1.0);
    else focusAV.jump_to(1.0);
  }
  if (was_any_selected && (!any_selected)) {
    if (Global.animated) focusAV.animate_to(0.0);
    else focusAV.jump_to(1.0);
  }
}

container.addEventListener("click",(e)=>{
  mouse_events_handler(e,true);
});
container.addEventListener("mousemove",(e)=>{
  mouse_events_handler(e,false);
});
container.addEventListener("mouseleave",(e)=>{
  for (const k of InsidemapAutoData.zone_list){
    hover_map[k] = false;
    if (Global.animated) selection_progress[k].animate_to(0.0);
    else selection_progress[k].jump_to(0.0);
  }
});

const font_title_family="NPS";
const font_title_weight="bold";
const font_title_size=24;
const scale_inactive_title=0.7;
const scale_active_title=1.0;
const delta_y_inactive_title=0;
const delta_y_active_title=-20;
const stroke_title=6;

const font_desc_family="NPS";
const font_desc_weight="normal";
const font_desc_size=16;
const delta_y_desc=+30;
const line_height_desc=20;
const stroke_desc=6;

function color_with_alpha(color,alpha){
  return "rgb(from "+color+" r g b / "+alpha+"%)";
}
function colormix(a,b,fac){
  return "color-mix(in srgb, "+a+" "+(100-fac*100)+"%, "+b+")";
}

const sine_period_seconds=2.0;
let sine_phase=0;
function update_canvas(dt){
  
  sine_phase+=dt*(2*Math.PI/sine_period_seconds);
  sine_phase = sine_phase % (2*Math.PI);
  let sine_value=Math.sin(sine_phase);
  if (!Global.animated) sine_value=0;
  
  for (const k of InsidemapAutoData.zone_list){
    selection_progress[k].tick(dt);
    hover_progress[k].tick(dt);
  }
  focusAV.tick(dt);
  
  sc2d.clearRect(0,0,current_size*canvas_resolution_multiplier,current_size*canvas_resolution_multiplier);
  
  sc2d.resetTransform();
  sc2d.scale(canvas_resolution_multiplier,canvas_resolution_multiplier);
  
  sc2d.miterLimit=2;
  sc2d.lineJoin="round";
  
  
  let focus=focusAV.calculate_value();
  //console.log(sp_max);
  for (const k of InsidemapAutoData.zone_list){
    let p=paths[k];
    let hp=hover_progress[k].calculate_value();
    let sp=selection_progress[k].calculate_value();
    let prog=Math.max(hp,sp);
    let focus_factor=1-Math.max(focus-prog,0);
    let fam = 0.6+0.4*focus_factor; // Focus Alpha Multiplier
    
    let cd=InsidemapManualData.category_data[InsidemapManualData.zone_data[k].category];
    const color_border= Global.darkmode ? cd.color_light:cd.color_dark;
    const color_fill= Global.darkmode ? cd.color_light:cd.color_dark;
    const alpha_inactive_border=cd.alpha_border_inactive;
    const alpha_active_border=cd.alpha_border_active;
    const alpha_inactive_fill=cd.alpha_fill_inactive;
    const alpha_active_fill=cd.alpha_fill_active;
    
    // bounds stroke
    sc2d.lineWidth = 2+sp*3;
    sc2d.strokeStyle = color_with_alpha(color_border,
       linear_map(0,1,prog,alpha_inactive_border,alpha_active_border)*fam);
    sc2d.stroke(p);
    
    // bounds fill
    sc2d.fillStyle=color_with_alpha(color_fill,
       linear_map(0,1,prog,alpha_inactive_fill,alpha_active_fill)*fam);
    sc2d.fill(p);
  }
  
  
  for (const k of selection_sorted_keys){
    let c=centers[k];
    let x=c[0];
    let y=c[1];
    let hp=hover_progress[k].calculate_value();
    let sp=selection_progress[k].calculate_value();
    let prog=Math.max(hp,sp);
    let focus_factor=1-Math.max(focus-prog,0);
    
    let zone_data=InsidemapManualData.zone_data[k];
    let cd=InsidemapManualData.category_data[zone_data.category];
    const ata=cd.alpha_title_active;
    const ati=cd.alpha_title_inactive;
    const alpha_title=linear_map(0,1,sp,ati,ata);
    
    const ctfa=Global.darkmode?"#FFF":"#FFF";
    const ctfi=Global.darkmode?"#AAA":"#CCC";
    const ctf=color_with_alpha(colormix(ctfi,ctfa,focus_factor),alpha_title);
    
    const ctsa=Global.darkmode?"#000":"#2F4575";
    const ctsi=Global.darkmode?"#555":"#8e9fb3";
    const cts=color_with_alpha(colormix(ctsi,ctsa,focus_factor),alpha_title);
    
    let text=zone_data["name_"+Global.lang];
    let desc=zone_data["desc_"+Global.lang];
    
    // Title
    let dy=linear_map(0,1,sp,delta_y_inactive_title,delta_y_active_title);
    dy+=3*sine_value*sp;
    
    let scale=linear_map(0,1,sp,scale_inactive_title,scale_active_title);
    let font_scale = scale;//*linear_map(0,1,hp,1,1.2);
    
    //sc2d.font=font_title;
    sc2d.textAlign="center";
    sc2d.textBaseline="middle";
    
    // Shadow
    if (sp>0.0001){
      let r_mult=(1+sp*sine_value*0.08)*scale;
      sc2d.beginPath();
      sc2d.ellipse(
        x,y+10*font_size_muliplier,
        30*r_mult*font_size_muliplier,
        10*r_mult*font_size_muliplier,
        0,0,2*Math.PI);
      sc2d.fillStyle=color_with_alpha("#000000",sp*25);
      sc2d.fill();
    }
    
    sc2d.font=font_title_weight+" "+(font_title_size*font_scale*font_size_muliplier)+"px "+font_title_family;
    
    // Title Stroke
    sc2d.lineWidth = stroke_title*font_size_muliplier;
    sc2d.strokeStyle = cts;
    sc2d.strokeText(text,x,y+dy);
    
    // Title Fill
    sc2d.fillStyle=ctf;
    sc2d.fillText(text,x,y+dy);
    
    sc2d.font=font_title_weight+" "+(font_title_size*scale_active_title*font_size_muliplier)+"px "+font_title_family;
    let tm=sc2d.measureText(text);
    let title_expanded_left=-tm.actualBoundingBoxLeft;
    let title_expanded_right=tm.actualBoundingBoxRight;
    

    if (sp>0.0001){
      // Description
      sc2d.textAlign="center";
      sc2d.textBaseline="alphabetic";
      sc2d.font=font_desc_weight+" "+(font_desc_size*font_size_muliplier)+"px "+font_desc_family;
      
      let lines=desc.split("\n");
      let dy=0; // add line height
      let dx=0; // add title edge if align!=center
      
      
      let align="center";
      for (let line of lines){
        let tm=sc2d.measureText(line);
        if (x-tm.actualBoundingBoxLeft<0) {
          align="left";
          dx=title_expanded_left;
        }
        if (x+tm.actualBoundingBoxRight>current_size) {
          align="right";
          dx=title_expanded_right;
        }
      }
      sc2d.textAlign=align;
      
      
      for (let line of lines){
        line=line.trim();
        
        // Description Stroke
        sc2d.lineWidth = stroke_desc*font_size_muliplier;
        sc2d.strokeStyle = color_with_alpha(cts,sp*100);
        sc2d.strokeText(line,x+dx,y+(delta_y_desc+dy)*font_size_muliplier);
        
        // Description Fill
        sc2d.fillStyle=color_with_alpha(ctf,sp*100);
        sc2d.fillText(line,x+dx,y+(delta_y_desc+dy)*font_size_muliplier);
        
        dy+=line_height_desc;
      }
    }
    
  }
  sc2d.resetTransform();
}

let overlay_active=true;

// This should be called every frame, from main JS.
export function animationTick(dt){
  if (!overlay_active) return;
  update_canvas(dt);
}


function overlay_apply(){
  if (overlay_active){
    button_overlay_off.style.display="flex";
    button_overlay_on.style.display="none";
    
    canvas.style.display="block";
    
    let anim=canvas.animate(
      [{ opacity: "0.0" },{ opacity: "1.0" }],
      {duration: 400});
    anim.addEventListener("finish",()=>{
      canvas.style.opacity=1.0;
    });
    if (!Global.animated) anim.finish();
    
  }else{
    button_overlay_off.style.display="none";
    button_overlay_on.style.display="flex";
    
    
    let anim=canvas.animate(
      [{ opacity: "1.0" },{ opacity: "0.0" }],
      {duration: 400});
    anim.addEventListener("finish",()=>{
      canvas.style.display="none";
    });
    if (!Global.animated) anim.finish();
  }
}
overlay_apply();

button_overlay_off.addEventListener("click",()=>{
  overlay_active=false;
  overlay_apply();
});
button_overlay_on.addEventListener("click",()=>{
  overlay_active=true;
  overlay_apply();
});

button_domain_ortho1.addEventListener("click",()=>{
  set_domain("ortho1");
});
button_domain_persp1.addEventListener("click",()=>{
  set_domain("persp1");
});


export function demonstrate_scroll(){
  if (!Global.animated) return;
  let max_scroll_amount = scroller.scrollWidth - scroller.clientWidth;
  if (max_scroll_amount>10.0){
    window.setTimeout(()=>{
      scroller.scroll({top:0,left:max_scroll_amount,behavior:"smooth"});
    },500);
    window.setTimeout(()=>{
      scroller.scroll({top:0,left:0,behavior:"smooth"});
    },1500);
  }
}
