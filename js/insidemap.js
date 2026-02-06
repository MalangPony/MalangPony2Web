/*
 * Code for generating and drawing the internal map page.
 * 
 * Gets data from insidemap_data_*.js
 */

import { Vector2, Vector3 } from "./vectors.js";
import { AnimatedValue } from "./animator.js";
import { linear_map } from "./utils.js";
import * as InsidemapAutoData from "./insidemap_data_auto.js";
import * as InsidemapManualData from "./insidemap_data_manual.js";
import * as Global from "./global.js";
import * as Config  from "./config.js";

// Grab DOM
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


// This is the original size of the SVG file used to trace out the zones.
// The zone coordinates will be divided by this value to get the relative coordinates.
const bounds_pixel_basis=3000;

// Current size of the container = canvas
let current_size=0;

// Domain is just a fancy name for the map type.
let current_domain="persp1";

// Generate Path2D objects from the raw data
// Should match the canvas pixel size.
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

// Calculate the zone centers.
// If center_override is defined, that will be used.
// If not, the axis-aligned bounding box center will be used.
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
let canvas_oversample=1.0;
export function set_canvas_oversample(n){
  canvas_oversample=n;
  handle_resize();
}
function handle_resize(){
  current_size=container.clientWidth;
  
  // For mobile, we must render the canvas at 2x resolution or it will be blurry.
  if (Global.mobile) canvas_resolution_multiplier=2.0;
  else canvas_resolution_multiplier=1.0;
  
  canvas_resolution_multiplier*=canvas_oversample;
  
  canvas.width=current_size*canvas_resolution_multiplier;
  canvas.height=current_size*canvas_resolution_multiplier;
  
  console.log("InsideMap Size "+current_size.toFixed(1)+" (x"+canvas_resolution_multiplier.toFixed(2)+")");
  
  // How big is this canvas, compared to the reference canvas?
  let canvas_size_factor=current_size/700.0;
  
  // To keep the fonts the same size relative to the canvas size, this is the multipler to use.
  let naive_font_size_muliplier=canvas_size_factor;
  
  // For smaller canvases, don't scale down the fonts.
  if (naive_font_size_muliplier<1.0) naive_font_size_muliplier=1.0;
  
  // The canvas-relative font size. Will be 1.0 for canvas size of >700px and bigger for <700px
  let canvas_relative_font_size = naive_font_size_muliplier/canvas_size_factor;
  console.log("CRFS",canvas_relative_font_size);
  
  // Don't make fonts bigger than 110% of original (canvas-relative size).
  // the x1.1 multiplier is to enlarge the fonts equally
  if (canvas_relative_font_size>1.1) font_size_muliplier=1.1*canvas_size_factor*1.1;
  else font_size_muliplier=canvas_relative_font_size*canvas_size_factor*1.1;
  
  
  recalculate_paths();
  recalculate_centers();
}
Global.add_mobile_listener(()=>{
  handle_resize();
});


let rso = new ResizeObserver(handle_resize);
rso.observe(container);
handle_resize();

// Canvas context.
const sc2d = canvas.getContext("2d");

// AnimatedValues for selection and hover
// Hover progress rises to 1.0 when mouse is over a zone, and falls to 0 when mouse exits.
// Selection progress rises to 1.0 when clicked, and falls to 0.0 when another zone is selected
//   or when the zone is clicked again.
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
  h.ease_in=true; // Ease-in on the hover progress makes it less flickery when quickly passing over a zone.
  hover_progress[k]=h;
}

// When a zone is selected, its key is shifted to the end.
// This is used to determine the drawing order.
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


// Boolean values. Not to be confused with the selection/hover factors which is an AnimatedValue
// Is the zone selected? (clicked)
let selection_map={};
// Is the zone being hovered over?
let hover_map={};

for (const k of InsidemapAutoData.zone_list){
  selection_map[k]=false;
  hover_map[k]=false;
}

// Handles all kinds of mouse events.
function mouse_events_handler(e,click){
  if (!overlay_active) {
    container.style.cursor="unset";
    return;
  }
  
  let bbox=container.getBoundingClientRect();
  let localX=e.clientX-bbox.left;
  let localY=e.clientY-bbox.top;
  
  // Zone bounds check
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
  // Filter out lower-priority zones.
  // This means if multiple zones have the same priority, they can be selected at the same time.
  for (const k of InsidemapAutoData.zone_list){
    if (InsidemapManualData.zone_data[k].priority<max_priority){
      hover_map[k] = false;
    }
  }
  
  // Keep the last selection map, for detecting press or release events.
  let sm_last=selection_map;
  if (click){
    selection_map={};
    for (const k of InsidemapAutoData.zone_list){
      // Flip the selection if clicked. Clicking again on a selected zone deselects it.
      if (hover_map[k]) selection_map[k]= !sm_last[k];
      else selection_map[k]=false;
    }
  }
  
  // Some edge detection and OR logic.
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
    
    // If newly selected or deselected, animated the progress factors.
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
    
    // Same with hover factors.
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
  
  // Raise focus to 1 if any is selected, lower to 0 if not.
  if ((!was_any_selected) && any_selected) {
    if (Global.animated) focusAV.animate_to(1.0);
    else focusAV.jump_to(1.0);
  }
  if (was_any_selected && (!any_selected)) {
    if (Global.animated) focusAV.animate_to(0.0);
    else focusAV.jump_to(0.0);
  }
}

container.addEventListener("click",(e)=>{
  mouse_events_handler(e,true);
});
container.addEventListener("mousemove",(e)=>{
  mouse_events_handler(e,false);
});
// Deselect everything
/*
container.addEventListener("mouseleave",(e)=>{
  mouse_events_handler({clientX:-10000,clientY:-10000},false);
});*/

// Canvas drawing constants
const font_title_family="NPS";
const font_title_weight="bold";
const font_title_size=24;
const scale_inactive_title=0.7;
const scale_active_title=1.0;
const delta_y_inactive_title=0;
const delta_y_active_title=-20;
const stroke_title=6;
const line_height_title=30;

const font_desc_family="NPS";
const font_desc_weight="normal";
const font_desc_size=16;
const delta_y_desc=+30;
const line_height_desc=20;
const stroke_desc=6;

// Use CSS color functions
function color_with_alpha(color,alpha){
  return "rgb(from "+color+" r g b / "+alpha+"%)";
}
function colormix(a,b,fac){
  return "color-mix(in srgb, "+a+" "+(100-fac*100)+"%, "+b+")";
}

let description_enabled=true;
export function set_description_enable(b){
  description_enabled=b;
}

// Sine wave used for float-y text
const sine_period_seconds=2.0;
let sine_phase=0;
function update_canvas(dt){
  
  sine_phase+=dt*(2*Math.PI/sine_period_seconds);
  sine_phase = sine_phase % (2*Math.PI);
  let sine_value=Math.sin(sine_phase);
  if (!Global.animated) sine_value=0;
  
  // AnimatedValues must be ticked
  for (const k of InsidemapAutoData.zone_list){
    selection_progress[k].tick(dt);
    hover_progress[k].tick(dt);
  }
  focusAV.tick(dt);
  
  sc2d.clearRect(0,0,current_size*canvas_resolution_multiplier,current_size*canvas_resolution_multiplier);
  
  // Apply scale. Rest of the code can just pretend the resolution multiplier doesn't exist
  sc2d.resetTransform();
  sc2d.scale(canvas_resolution_multiplier,canvas_resolution_multiplier);
  
  // For better text stroke rendering
  sc2d.miterLimit=2;
  sc2d.lineJoin="round";
  
  
  let focus=focusAV.calculate_value();
  
  // Draw zones
  for (const k of InsidemapAutoData.zone_list){
    let p=paths[k];
    let hp=hover_progress[k].calculate_value();
    let sp=selection_progress[k].calculate_value();
    let prog=Math.max(hp,sp);
    // Focus factor will be 1 if nothing is selected, 0 if something other than this is selected,
    //   and 1 if this is the one selected.
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
    
    // Color Title Fill {Active/Inactive}
    const ctfa=Global.darkmode?"#FFF":"#FFF";
    const ctfi=Global.darkmode?"#AAA":"#CCC";
    const ctf=color_with_alpha(colormix(ctfi,ctfa,focus_factor),alpha_title);
    
    // Color Title Stroke {Active/Inactive}
    const ctsa=Global.darkmode?"#000":"#2F4575";
    const ctsi=Global.darkmode?"#555":"#8e9fb3";
    const cts=color_with_alpha(colormix(ctsi,ctsa,focus_factor),alpha_title);
    
    let text=zone_data["name_"+Global.lang];
    let desc=zone_data["desc_"+Global.lang];
    
    // Title transforms
    let dy=linear_map(0,1,sp,delta_y_inactive_title,delta_y_active_title);
    dy+=3*sine_value*sp;
    
    let scale=linear_map(0,1,sp,scale_inactive_title,scale_active_title);
    let font_scale = scale;
    
    sc2d.textAlign="center";
    sc2d.textBaseline="middle";
    
    // Elliptical shadow
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
    
    const ctshwp=Config.CANVAS_TEXT_STROKE_HOLE_WORKAROUND_PASSES;
    
    let title_expanded_left=0;
    let title_expanded_right=0;
      
    let title_lines=text.split("\n");
    let lineN=0;
    for (let line of title_lines){
      lineN++;
      let lineY_centered=(lineN-1-(title_lines.length/2-0.5))*line_height_title;
      let lineY_bottomed=(lineN-(title_lines.length))*line_height_title;
      let lineY=linear_map(0,1,sp,lineY_centered,lineY_bottomed);
      lineY*=font_scale*font_size_muliplier;
      line=line.trim();
      
      
      sc2d.font=font_title_weight+" "+(font_title_size*font_scale*font_size_muliplier)+"px "+font_title_family;
      
      // Title Stroke
      sc2d.strokeStyle = cts;
      // Workaround for self-intersecting stroke producing gaps
      // https://stackoverflow.com/a/69006387
      // setLineDash does nothing, so this is the next best thing (probably)
      // sc2d.setLineDash([10000,1]);
      
      for (let i=0;i<ctshwp;i++){
        sc2d.lineWidth = stroke_title*font_size_muliplier*((i+1)/ctshwp);
        sc2d.strokeText(line,x,y+dy+lineY);
      }
      
      // Title Fill
      sc2d.fillStyle=ctf;
      sc2d.fillText(line,x,y+dy+lineY);
    

      // Measure the title text. Measure at the biggest font size.
      // If the description goes off the canvas, the description will instead align itself to one of the
      //   edges of the title text, measured here.
      // This will only work if the title text does not protrude from the canvas though.
      sc2d.font=font_title_weight+" "+(font_title_size*scale_active_title*font_size_muliplier)+"px "+font_title_family;
      let tm=sc2d.measureText(text);
      title_expanded_left=Math.min(-tm.actualBoundingBoxLeft,title_expanded_left);
      title_expanded_right=Math.max(tm.actualBoundingBoxRight,title_expanded_right);
    
    }
    

    if ((sp>0.0001) && description_enabled){ // Only if selected
      // Description
      sc2d.textAlign="center";
      sc2d.textBaseline="alphabetic";
      sc2d.font=font_desc_weight+" "+(font_desc_size*font_size_muliplier)+"px "+font_desc_family;
      
      // Canvas text drawing functions don't handle multi-line strings, so we must draw 
      //   each line manually.
      let lines=desc.split("\n");
      let dy=0; // add line height
      let dx=0; // add title edge if align!=center
      
      // If ANY of the description lines go outside canvas bounds, change the alignment
      //   and align to one of the title edges
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
        sc2d.strokeStyle = color_with_alpha(cts,sp*100);
        for (let i=0;i<ctshwp;i++){
          sc2d.lineWidth = stroke_desc*font_size_muliplier*((i+1)/ctshwp);
          sc2d.strokeText(line,x+dx,y+(delta_y_desc+dy)*font_size_muliplier);
        }
        
        
        // Description Fill
        sc2d.fillStyle=color_with_alpha(ctf,sp*100);
        sc2d.fillText(line,x+dx,y+(delta_y_desc+dy)*font_size_muliplier);
        
        dy+=line_height_desc;
      }
    }
    
  }
  sc2d.resetTransform();
}

// False if hidden.
let overlay_active=true;

// This should be called every frame, from main JS.
export function animationTick(dt){
  if (!overlay_active) return;
  update_canvas(dt);
}


// Hide or show the canvas.
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

// Button handlers.
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

// Scroll from left to right and back to left again
//   to demonstrate to the user that this map can be scrolled.
// This can be called in the page enter handler.
// Users were confused by this, so it's not called anywhere for now.
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


export function save_internal_map_to_file(){
  canvas.toBlob((b)=>{
    let url = URL.createObjectURL(b);
    let a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'canvas.png';
    document.body.appendChild(a);
    a.click();
  })
}
