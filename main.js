import { Vector2, Vector3 } from "./vectors.js";
import * as Config  from "./config.js";
import * as Fireworks from "./fireworks.js";
import * as Stars from "./stars.js";
import * as Parallax from "./parallax.js";
import * as L2D from "./l2d.js";
import {FPS_Counter,linear_map} from "./utils.js";
import * as ParallaxData from "./parallax_data.js";

const wsd = document.getElementById("whole-screen-div");

const intro_content_container=document.getElementById("intro-content-container");

const hmr_container= document.getElementById("hmr-image-container");
const hmr_image_base = document.getElementById("hmr-base");
const hmr_image_flash01 = document.getElementById("hmr-flash01");
const hmr_image_ground = document.getElementById("hmr-ground");

const logo_image_base = document.getElementById("logo-base");
const logo_image_flash01 = document.getElementById("logo-flash01");
const logo_image_orig = document.getElementById("logo-orig");

const content_scroller =document.getElementById("content-scroller");
const logo_spacer = document.getElementById("mpn-logo-spacer");
const screen_blanker=document.getElementById("screen-blanker");
const afterscroll_container=document.getElementById("afterscroll-content-container");

const sidebar = document.getElementById("sidebar");
const sia = document.getElementById("sidebar-intro-anim");
const siai =document.getElementById("sidebar-intro-anim-image");
const lmsa = document.getElementById("letter-magic-spritesheet-animation");

const lang_btn = document.getElementById("lang-btn");
const sb_btn = document.getElementById("sb-btn");

const scroll_inviter_container = document.getElementById("scroll-inviter-container");
const scroll_inviter = document.getElementById("scroll-inviter");

const debug_print_fps=document.getElementById("debug-print-fps");
const debug_print_fps2=document.getElementById("debug-print-fps2");
const debug_print_fps3=document.getElementById("debug-print-fps3");
const debug_print_acms=document.getElementById("debug-print-acms");
const debug_print_featurelevel=document.getElementById("debug-print-fl");
const debug_print_features=document.getElementById("debug-print-features");
const debug_print_faa=document.getElementById("debug-print-faa");


const hanmari_image_container = document.getElementById("hmr-image-container");
const master_hanmari_container = document.getElementById("master-hanmari-container");
const stickies_container = document.getElementById("stickies");

const debug_btn_perf_increment = document.getElementById(
	"debug-button-feature-increment");
const debug_btn_perf_decrement = document.getElementById(
	"debug-button-feature-decrement");
const debug_btn_perf_auto = document.getElementById(
	"debug-button-feature-auto");

// Is Non-animated Hanmari enabled?
// Only enable if L2D Hanmari is NOT on the screen!

// Initial values
let static_hanmari_enabled=false;
if (Config.OPTION_ENABLE_L2D_HANMARI){
  hmr_container.style.display="none";
}else{
  hmr_container.style.display="block";
  static_hanmari_enabled=true;
}

// Change callbacks
PerformanceManager.register_feature_disable_callback(
	PerformanceManager.Feature.HANMARI_L2D, ()=>{
		hmr_container.style.display="block";
        static_hanmari_enabled=true;
	}
);
PerformanceManager.register_feature_enable_callback(
	PerformanceManager.Feature.HANMARI_L2D, ()=>{
      if (Config.OPTION_ENABLE_L2D_HANMARI){
        hmr_container.style.display="none";
        static_hanmari_enabled=false;
      }
	}
);


// CSS Filters
PerformanceManager.register_feature_disable_callback(
  PerformanceManager.Feature.CSS_FILT_DROP_SHADOWS, ()=>{
    ticket.classList.remove("css-filters");
    sidebar.classList.remove("css-filters");
  });
PerformanceManager.register_feature_enable_callback(
  PerformanceManager.Feature.CSS_FILT_DROP_SHADOWS, ()=>{
     ticket.classList.add("css-filters");
    sidebar.classList.add("css-filters");
  });
PerformanceManager.register_feature_disable_callback(
  PerformanceManager.Feature.CSS_FILT_ICC_BACKBLUR, ()=>{
    intro_content_container.classList.remove("css-filters");
  });
PerformanceManager.register_feature_enable_callback(
  PerformanceManager.Feature.CSS_FILT_ICC_BACKBLUR, ()=>{
    intro_content_container.classList.add("css-filters");
  });

let in_sky_mode=true;
function transition_sky(){
  in_sky_mode=true;
  let animation_out=[{ opacity: "1.0" },{ opacity: "0.0" } ];
  let animation_in=[{ opacity: "0.0" },{ opacity: "1.0" } ];
  let animation_opt={duration: 500,fill:"forwards"};
  logo_image_orig.animate(animation_out,animation_opt);
  if (static_hanmari_enabled){
    hmr_image_ground.animate(animation_out,animation_opt);
    hmr_image_base.animate(animation_in,animation_opt);
  }else{
    hmr_image_ground.style.opacity="0.0";
    hmr_image_base.style.opacity="1.0";
  }
  intro_content_container.classList.remove("activated");
  afterscroll_container.classList.remove("activated");
  lang_btn.classList.remove("activated");
  sb_btn.classList.remove("activated");
  if (mobile_mode) sidebar_button_hide_mobile();
  else sidebar_hide();
  L2D.transition_sky();
}
function transition_ground(){
  in_sky_mode=false;
  let animation_out=[{ opacity: "1.0" },{ opacity: "0.0" } ];
  let animation_in=[{ opacity: "0.0" },{ opacity: "1.0" } ];
  let animation_opt={duration: 500,fill:"forwards"};
  logo_image_orig.animate(animation_in,animation_opt);
  if (static_hanmari_enabled){
    hmr_image_ground.animate(animation_in,animation_opt);
    hmr_image_base.animate(animation_out,animation_opt);
    hmr_image_flash01.animate(animation_out,animation_opt);
  }else{
    hmr_image_ground.style.opacity="1.0";
    hmr_image_base.style.opacity="0.0";
    hmr_image_flash01.style.opacity="0.0";
  }
  intro_content_container.classList.add("activated");
  afterscroll_container.classList.add("activated");
  lang_btn.classList.add("activated");
  sb_btn.classList.add("activated");
  window.setTimeout(()=>{
    if (!in_sky_mode) {
      if (mobile_mode) sidebar_button_animate_mobile();
      else sidebar_intro_animate();
    }},100);
  L2D.transition_ground();
}

function sidebar_magic_animate(){
  sia.style.display="block";
  
  const animation_frame_count=16;
  const actual_size_x=lmsa.clientWidth;
  const actual_size_y=lmsa.clientHeight;
  //console.log(`ASX ${actual_size_x} ASY ${actual_size_y} AFC ${animation_frame_count}`)
  lmsa.style.backgroundSize=`${actual_size_x*animation_frame_count}px ${actual_size_y}px`;
  
  let anim1=lmsa.animate(
    [{backgroundPositionX:"0"},{backgroundPositionX:"100%"}],
    {duration:1200,delay:0,easing:`steps(${animation_frame_count-1})`})
  let anim2=lmsa.animate(
    [{opacity:"0.0"},{opacity:"1.0"}],
    {duration:500,delay:0,easing:"linear"});
  let anim3=lmsa.animate(
    [{transform:"translate(0,+100px)"},{transform:"none"}],
    {duration:1000,delay:0,easing:"cubic-bezier(.18,.58,.6,.99)"})
  anim1.onfinish=(e)=>{
    sia.style.display="none";
  };
}
function sidebar_intro_animate(){
  sidebar_magic_animate();
  
  
  let anim4=sidebar.animate(
    [{transform:"scale(0.0)"},
     {transform:"scale(1.0)"}],
    {duration:400,delay:1100,easing:"ease-out"})
  let anim5=sidebar.animate(
    [{maxHeight:"0"},
     {maxHeight:"calc(100dvh - 64px)"}],
    {duration:1000,delay:1500,easing:"ease-in-out"})
  
  sidebar.style.transform="scale(0)";
  sidebar.style.display="flex";
  sidebar.style.maxHeight="0";
  
  anim4.onfinish=(e)=>{
    sidebar.style.transform="none";
  };
  
  anim5.onfinish=(e)=>{
    sidebar.style.maxHeight="calc(100dvh - 64px)";
  }
}
function sidebar_button_animate_mobile(){
  sidebar_magic_animate();
  
  let anim4=sb_btn.animate(
    [{transform:"scale(0.0)"},
     {transform:"scale(1.0)"}],
    {duration:400,delay:1100,easing:"ease-out"})
  
  sb_btn.style.display="block";
  sb_btn.style.transform="scale(0.0)";
  
  anim4.onfinish=(e)=>{
    sb_btn.style.transform="none";
  };  
}
function sidebar_button_hide_mobile(){
  let anim1=sb_btn.animate(
    [{marginLeft:"16px"},
     {marginLeft:"-160px"}],
    {duration:500,delay:0,easing:"ease-in"})
  anim1.onfinish = (e)=>{
    sb_btn.style.display="none";
    sb_btn.style.marginLeft="16px";
  }
}
function sidebar_intro_animate_mobile(){
  sidebar.style.transform="none";
  sidebar.style.display="flex";
  
  let anim4=sidebar.animate(
    [{opacity:"0"},
     {opacity:"1"}],
    {duration:300,delay:0,easing:"ease-out"});
  let anim2=sidebar.animate(
    [{maxWidth:"0"},
     {maxWidth:"100vw"}],
    {duration:300,delay:0,easing:"ease-in-out"});
  anim2.onfinish= ()=>{
    sidebar.style.maxWidth="100vw";
  }
  sidebar.style.maxHeight="0";
  let anim5=sidebar.animate(
    [{maxHeight:"0"},
     {maxHeight:"100dvh"}],
    {duration:300,delay:0,easing:"ease-in-out"});
  anim5.onfinish= ()=>{
    sidebar.style.maxHeight="100dvh";
  };
  let anim6=sb_btn.animate(
    [{opacity:1},
     {opacity:0}],
    {duration:300,delay:0,easing:"linear"})
  sb_btn.style.opacity=1;
  anim6.onfinish=(e)=>{
    sb_btn.style.opacity=0;
  };  
}
function sidebar_hide(){
  let anim1=sidebar.animate(
    [{marginLeft:"0"},
     {marginLeft:"-160px"}],
    {duration:500,delay:0,easing:"ease-in"})
  anim1.onfinish = (e)=>{
    sidebar.style.display="none";
    sidebar.style.marginLeft="0";
  }
}
function sidebar_hide_mobile(){
  let anim1=sidebar.animate(
    [{opacity:1},
     {opacity:0}],
    {duration:300,delay:0,easing:"linear"})
  anim1.onfinish = (e)=>{
    sidebar.style.display="none";
  }
  
  let anim4=sb_btn.animate(
    [{opacity:0},
     {opacity:1}],
    {duration:300,delay:0,easing:"linear"})
  sb_btn.style.opacity=0;
  anim4.onfinish=(e)=>{
    sb_btn.style.opacity=1;
  };  
}
function sidebar_hide_instant(){
  sidebar.style.display="none";
}

let firework_exploded=false;
Fireworks.add_burst_callback(()=>{
  firework_exploded=true;
});


let dbp=document.getElementById("debug-print");

let last_firework_explosion_time=-1000;
let last_t=NaN;
let fpsc_primary_anim_callback=new FPS_Counter();
window.setInterval(()=>{
  debug_print_fps.innerHTML="AnimCB 1s: "+fpsc_primary_anim_callback.fps_1sec().toFixed(2)+" FPS";
},500);
window.setInterval(()=>{
  debug_print_fps2.innerHTML="AnimCB 10s: "+fpsc_primary_anim_callback.fps_10sec().toFixed(2)+" FPS";
},2000);
window.setInterval(()=>{
  let fps_str=L2D.fpsc.fps_1sec().toFixed(2);
  if (fps_str==="NaN") fps_str="---";
  debug_print_fps3.innerHTML="PIXI/L2D 1s: "+fps_str+" FPS";
},500);
window.setInterval(()=>{
  if (ac_tt_hist.length<1) return;
  let avg = ac_tt_hist.reduce((a,b)=>a+b,0)/ac_tt_hist.length;
  debug_print_acms.innerHTML="Anim CB taking "+avg.toFixed(2)+" ms"
},500);

let ac_tt_hist=[];
function animationCallback(time) {
  fpsc_primary_anim_callback.frame();
  let cb_start_t=performance.now();
  /*
  frame_times.push(time);
  if (frame_times[0]+1000<time){
    let fps=(frame_times.length-1)/(time-frame_times[0])*1000;
    debug_print_fps.innerHTML="1s avg: "+fps.toFixed(2)+" FPS";
    frame_times=[];
  }
  frame_times_10s.push(time);
  if (frame_times_10s[0]+10000<time){
    let fps=(frame_times_10s.length-1)/(time-frame_times_10s[0])*1000;
    debug_print_fps2.innerHTML="10s avg: "+fps.toFixed(2)+" FPS";
    frame_times_10s=[];
  }*/
  
  if (isNaN(last_t)) last_t=time;
  let dt=(time-last_t)/1000;
  last_t=time;
  if (dt>1.0) dt=1.0;
  
  PerformanceManager.report_frame_time(time);
  
  let width_wholescreen=wsd.clientWidth;
  let width_scroller=content_scroller.clientWidth;
  let scrollbar_width=width_wholescreen-width_scroller;
  if (scrollbar_width>50){
    //console.log("Scrollbar width>50px? Seems sus.");
    scrollbar_width=50;
  }
  master_hanmari_container.style.marginRight=scrollbar_width+"px";
  stickies_container.style.marginRight=scrollbar_width+"px";
  
  if (firework_exploded){
    last_firework_explosion_time=time;
    firework_exploded=false;
  }
  let time_from_last_firework_explosion=(time-last_firework_explosion_time)/1000;
  let firework_light_factor=1-(time_from_last_firework_explosion/1.5);
  if (firework_light_factor<0) firework_light_factor=0;
  if (firework_light_factor>1) firework_light_factor=1;
  firework_light_factor=Math.pow(firework_light_factor,1.0);
  L2D.set_lighten_strength(firework_light_factor);
  if (static_hanmari_enabled){
    hmr_image_flash01.style.opacity=firework_light_factor;
  }
  logo_image_flash01.style.opacity=firework_light_factor;
  
  debug_print_featurelevel.innerHTML = "Feature Level "+PerformanceManager.get_feature_level();
  debug_print_features.innerHTML = PerformanceManager.generate_feature_list();
  debug_print_faa.innerHTML = PerformanceManager.is_auto_adjust_enabled()?"ON":"OFF";
  
  Stars.animationTick(dt);
  Fireworks.animationTick(dt);
  Parallax.animationTick(dt);
  L2D.animationTick(dt);
  
  Fireworks.update_attention(dt);
  // 0~1 value. X increasing to right, Y increasing to bottom
  let fw_attn_pos=Fireworks.get_lerped_attention_position_relative();
  // -1~+1 value. X increasing to right, Y increasing to top.
  // Since hanmari is looking back-ish, X should be inverted (i think?)
  let sky_eye_pos=new Vector2(
    linear_map(1,0,fw_attn_pos.x,-0.8,-0.0),
    linear_map(1,0,fw_attn_pos.y,-0.7,+0.7));
  //console.log("FW Attn Pos "+JSON.stringify(fw_attn_pos));
  //console.log("L2D Sky eyepos "+JSON.stringify(sky_eye_pos));
  L2D.set_sky_eye_position(sky_eye_pos.x,sky_eye_pos.y)
  
  let cb_time_taken=performance.now()-cb_start_t;
  ac_tt_hist.push(cb_time_taken);
  while (ac_tt_hist.length>100) ac_tt_hist.shift();
}


let raff_last_rendered_t=-1000;
function recursiveAnimFrameFunc(t){
  /*
  let dt=(t-raff_last_rendered_t);
  // If FULL_FRAMERATE feature not active...
  if (!PerformanceManager.check_feature_enabled(
    PerformanceManager.Feature.FULL_FRAMERATE)){
    if (dt>20){ // Only call if more than 20ms passed (50Hz)
      animationCallback(t);
      raff_last_rendered_t=t;
    }
  }else {
    animationCallback(t);
    raff_last_rendered_t=t;
  }*/
  animationCallback(t);
  requestAnimationFrame(recursiveAnimFrameFunc);
}
requestAnimationFrame(recursiveAnimFrameFunc);


//TODO change this JS-based animation to
// a CSS-based animation with "animation-timeline: scroll()" 
let scroll_inviter_active=true;
function forceScrollDown(){
  if (sky_disabled) return;
  content_scroller.scrollTop=screen_blanker.clientHeight;
}
function forceScrollUp(){
  content_scroller.scrollTop=0;
}
content_scroller.addEventListener("scroll", (e) => { 
  let scroll_progress_ratio=1;
  
  if (!sky_disabled) {
    let scroll_pixels=content_scroller.scrollTop;
    let scroll_maxium=screen_blanker.clientHeight;
    scroll_progress_ratio=scroll_pixels/scroll_maxium;
  }
  
  if (scroll_inviter_active && (scroll_progress_ratio>0.3)){
    let anim=scroll_inviter_container.animate(
    [{ opacity: "1.0" },{ opacity: "0.0" } ],
    {duration: 500,fill:"forwards"});
    scroll_inviter_active=false;
    anim.onfinish=()=>{
      scroll_inviter_container.style.display="none";
    }
  }
  
  scroll_progress_ratio=Math.min(Math.max(scroll_progress_ratio,0),1);
  Parallax.set_scroll_progress(scroll_progress_ratio);
  
  if (scroll_progress_ratio>0.95){
    if (in_sky_mode) transition_ground();
  }else{
    if (!in_sky_mode) transition_sky();
  }
  Fireworks.set_fireworks_enabled(scroll_progress_ratio<0.5);
  
  Stars.set_scroll_progress(scroll_progress_ratio);
  Fireworks.set_scroll_progress(scroll_progress_ratio);
  
  let darken_strength=1-((scroll_progress_ratio-0.8)*5);
  if (darken_strength<0) darken_strength=0;
  if (darken_strength>1) darken_strength=1.0;
  L2D.set_darken_strength(darken_strength);
  L2D.set_staring_strength(1-darken_strength);
  
});

let current_lang="ko";
let all_langs=["ko","en"];
function apply_lang(code){
  current_lang=code;
  for (const lang of all_langs){
    let all_elements=document.querySelectorAll(".lang-"+lang);
    for (const e of all_elements){
      if (lang===current_lang) e.style.display="inline";
      else e.style.display="none";
    }
  }
  // Save to cookie
  document.cookie="language="+code;
}

lang_btn.onclick= ()=>{
  if (current_lang=="ko") apply_lang("en");
  else apply_lang("ko");
}

let lang_from_cookie=null;
const cookieValue = document.cookie.split("; ").find((row) => row.startsWith("language="))?.split("=")[1];
console.log("language cookie value: "+cookieValue);
if (cookieValue!==undefined) {
  if (all_langs.includes(cookieValue)) lang_from_cookie=cookieValue;
  else console.log("Error: Language cookie value invalid!");
}

let lang_from_environment=null;
for (const lang of navigator.languages){
  for (const langcode of all_langs){
    if (lang.startsWith(langcode)){
      lang_from_environment=langcode;
      break;
    }
  }
  if (lang_from_environment !== null) break;
}
console.log("Language detected from environment: "+lang_from_environment);


if (lang_from_cookie !== null) {
  console.log("Apply language from cookie: "+lang_from_cookie);
  apply_lang(lang_from_cookie);
} else if (lang_from_environment !== null){
  console.log("Apply language from environment: "+lang_from_environment);
  apply_lang(lang_from_environment);
}else{
  console.log("Language fallback to EN");
  apply_lang("en");
}


function hide_hanmari(){
  master_hanmari_container.style.opacity=1.0;
  let anim3=master_hanmari_container.animate(
    [{ opacity: "1.0" },{ opacity: "0.0" }],
    {duration: 500,delay:0});
  anim3.onfinish= () => {
    master_hanmari_container.style.display="none";
    L2D.pause_render();
  }
}
function hide_hanmari_instant(){
  master_hanmari_container.style.display="none";
  L2D.pause_render();
}
function show_hanmari(){
  master_hanmari_container.style.display="block";
  master_hanmari_container.style.opacity=0.0;
  L2D.unpause_render();
  let anim3=master_hanmari_container.animate(
    [{ opacity: "0.0" },{ opacity: "1.0" }],
    {duration: 500,delay:0});
  anim3.onfinish= () => {
    master_hanmari_container.style.opacity=1.0;
  }
}
function show_hanmari_instant(){
  master_hanmari_container.style.display="block";
  master_hanmari_container.style.opacity=1.0;
  L2D.unpause_render();
}

let sky_disabled=false;
function sky_disable(){
  screen_blanker.style.display="none";
  mpn_logo_container.style.display="none";
  scroll_inviter_container.style.display="none";
  sky_disabled=true;
  forceScrollUp();
}
function sky_enable(){
  screen_blanker.style.display="block";
  mpn_logo_container.style.display="block";
  scroll_inviter_container.style.display="block";
  sky_disabled=false;
  forceScrollDown();
}

let currently_on_page="intro";
function page_transition_instant(name){

  if (name===currently_on_page) return;

  let last=document.getElementById("page-"+currently_on_page);
  if (last===null) return;

  let target=document.getElementById("page-"+name);
  if (target===null) return;

  last.style.display="none";
  target.style.display="flex";
  target.style.opacity=1.0;
  
  currently_on_page=name;
  if (currently_on_page==="intro") {
    sky_enable();
    show_hanmari_instant();
  }else {
    sky_disable();
    if (Config.OPTION_HIDE_HANMARI_ON_NONINTRO_PAGES)
      hide_hanmari_instant();
  }
}
function page_transition(name){
  if (mobile_mode) sidebar_hide_mobile();
  
  if (name===currently_on_page) return;

  let last=document.getElementById("page-"+currently_on_page);
  if (last===null) return;

  let target=document.getElementById("page-"+name);
  if (target===null) return;
  
  if (name!=="intro" && Config.OPTION_HIDE_HANMARI_ON_NONINTRO_PAGES) 
    hide_hanmari();
    
    
  let anim3=intro_content_container.animate(
    [{ opacity: "1.0" },{ opacity: "0.0" }],
    {duration: 500,delay:0});
  anim3.onfinish= () => {
    last.style.display="none";
    target.style.display="flex";
    if (name==="intro") sky_enable();
    else sky_disable();
    if (name==="intro" && Config.OPTION_HIDE_HANMARI_ON_NONINTRO_PAGES) 
      show_hanmari();
  }
  let anim4=intro_content_container.animate(
    [{ opacity: "0.0" },{ opacity: "1.0" }],
    {duration: 500,delay:500});
  anim4.onfinish= () => {
  }
  
  currently_on_page=name;
}



export function sidebar_clicked(x){
  page_transition(x);
  if (!Parallax.name_defined_in_camera_locations(x)) return;
  Parallax.camera_animate_to_name(x);
  //window.location.hash = x;
  
  if (window.location.protocol==="file:"){
    console.log("Not rewriting URL because we're in a file URL.")
  }else{
    let url=window.location.origin+"/"+x;
    // Edge case for the intro page
    if (x==="intro") url=window.location.origin;
    window.history.pushState({},"",url);
  }
}


let mq_mobile=window.matchMedia("(width <= 640px)");

let mobile_mode=mq_mobile.matches;
function mobile_enter(){
  sidebar_hide_instant();
  sidebar_button_animate_mobile();
}
function mobile_leave(){
  if (!in_sky_mode) {
  sidebar_intro_animate();
  sidebar_button_hide_mobile();
  }
}

mq_mobile.onchange= ()=>{
  let match=mq_mobile.matches;
  mobile_mode=match;
  if (match) mobile_enter();
  else mobile_leave();
};
sb_btn.onclick=sidebar_intro_animate_mobile;

if (window.location.pathname != ""){
  let path_location=window.location.pathname.substring(1);
  
  if (Parallax.name_defined_in_camera_locations(path_location)) {
    console.log("From URL, going to page: "+path_location);
    // Valid page location
    Parallax.camera_jump_to_name(path_location); // Jump camera
    forceScrollDown();
    page_transition_instant(path_location);
  }else{
    console.log("From URL, invalid page: "+path_location);
  }
}

debug_btn_perf_increment.addEventListener("click", (e) => {
  //console.log("FL+");
	PerformanceManager.increment_feature_level();
});
debug_btn_perf_decrement.addEventListener("click", (e) => {
  //console.log("FL-");
	PerformanceManager.decrement_feature_level();
});
debug_btn_perf_auto.addEventListener("click", (e) => {
  //console.log("FL-");
	PerformanceManager.toggle_auto_adjust();
});
