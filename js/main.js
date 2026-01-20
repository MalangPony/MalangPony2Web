/*
 * Main script. 
 * Imports all other scripts.
 * Handles some global page logic.
 */
import { Vector2, Vector3 } from "./vectors.js";
import * as Config  from "./config.js";
import * as Fireworks from "./fireworks.js";
import * as Stars from "./stars.js";
import * as L2D from "./l2d.js";
import {FPS_Counter,linear_map} from "./utils.js";
import * as Timetable from "./timetable.js";
import * as Dyntex from "./dyntex.js";
import * as Maps from "./maps.js";
import * as Cookies from "./cookies.js";
import * as Credits from "./credits.js";
import * as Register from "./register.js";
import * as Castle from "./castle.js";
import * as StaticBG from "./static_bg.js";
import * as FAQ from "./faq.js";
import * as InsideMap from "./insidemap.js";

// DOM
const body_dom = document.querySelector("body");

const wsd = document.getElementById("whole-screen-div");

const main_content_backdrop=document.getElementById("main-content-backdrop");

const l2d_buttons_container = document.getElementById("l2d-buttons-container");

const logo_image_base = document.getElementById("logo-base");
const logo_image_flash01 = document.getElementById("logo-flash01");
const logo_image_orig = document.getElementById("logo-orig");

const content_scroller =document.getElementById("content-scroller");
const logo_spacer = document.getElementById("mpn-logo-spacer");
const screen_blanker=document.getElementById("screen-blanker");
const pages_container=document.getElementById("pages-container");

const sidebar = document.getElementById("sidebar");
const siap = document.getElementById("sidebar-intro-anim-positioner");
const lmsa = document.getElementById("letter-magic-spritesheet-animation");

const lang_btn = document.getElementById("langswitch-btn");
const theme_btn = document.getElementById("themeswitch-btn");
const sb_btn_active_area = document.getElementById("sb-btn-active-area");
const sb_btn_outer_animator = document.getElementById("sb-btn-outer-animator");
const sb_close_btn = document.getElementById("sb-close-button-container");

const scroll_inviter_container = document.getElementById("scroll-inviter-container");
const scroll_fixer = document.getElementById("scroll-fixer");
const scroll_inviter = document.getElementById("scroll-inviter");

const debug_print_fps=document.getElementById("debug-print-fps");
const debug_print_fps2=document.getElementById("debug-print-fps2");
const debug_print_fps3=document.getElementById("debug-print-fps3");
const debug_print_acms=document.getElementById("debug-print-acms");
const debug_print_featurelevel=document.getElementById("debug-print-fl");
const debug_print_features=document.getElementById("debug-print-features");
const debug_print_faa=document.getElementById("debug-print-faa");
const debug_print_container=document.getElementById("debug-print-area");


const hanmari_image_container = document.getElementById("hmr-image-container");
const master_hanmari_container = document.getElementById("master-hanmari-container");
const stickies_container = document.getElementById("stickies");

const debug_btn_perf_increment = document.getElementById(
	"debug-button-feature-increment");
const debug_btn_perf_decrement = document.getElementById(
	"debug-button-feature-decrement");
const debug_btn_perf_auto = document.getElementById(
	"debug-button-feature-auto");

const mascot_selector=document.getElementById("mascot-selector");
const mascot_container_hmr=document.getElementById("mascot-container-hmr");
const mascot_container_lbr=document.getElementById("mascot-container-lbr");
const mascot_click_suggester=document.getElementById("mascot-click-suggester");

const sky_bg = document.getElementById("sky-bg");

const intro_logo = document.getElementById("intro-logo");
const nonintro_header =  document.getElementById("nonintro-header-content");
//const header_divider = document.getElementById("header-divider");
const main_content_actual = document.getElementById("main-content-actual");

const countdown_display = document.getElementById("countdown-display");


// Debug print area
if (!Config.DEBUG_OVERLAY_ACTIVE) debug_print_container.style.display="none";
else debug_print_container.style.display="flex";

// PerfManager callback: CSS Filters
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

// Sky <-> Ground transition
let in_sky_mode=true;
function transition_sky(){
  in_sky_mode=true;
  
  let animation_out=[{ opacity: "1.0" },{ opacity: "0.0" } ];
  let animation_in=[{ opacity: "0.0" },{ opacity: "1.0" } ];
  let animation_opt={duration: 500,fill:"forwards"};
  logo_image_orig.animate(animation_out,animation_opt);
  
  main_content_backdrop.classList.remove("activated");
  pages_container.classList.remove("activated");
  lang_btn.classList.remove("activated");
  theme_btn.classList.remove("activated");
  
  if (mobile_mode) sidebar_mobile_button_exit();
  else sidebar_desktop_hide();
  
  L2D.transition_sky();
}
function transition_ground(){
  in_sky_mode=false;
  
  let animation_out=[{ opacity: "1.0" },{ opacity: "0.0" } ];
  let animation_in=[{ opacity: "0.0" },{ opacity: "1.0" } ];
  let animation_opt={duration: 500,fill:"forwards"};
  logo_image_orig.animate(animation_in,animation_opt);
  
  main_content_backdrop.classList.add("activated");
  pages_container.classList.add("activated");
  lang_btn.classList.add("activated");
  theme_btn.classList.add("activated");
  

  if (mobile_mode) sidebar_mobile_button_enter();
  else sidebar_desktop_open();

  L2D.transition_ground();
}




// As overlapping animations can cause glitches,
// we keep track of ongoing animations so we can cancel everything
// before starting another animation group.

// All potentially ongoing animations.
let sidebar_animations=[];

function force_finish_all_sidebar_animations(){
  for (const anim of sidebar_animations){
    if (anim.playState=="running") anim.finish();
  }
  sidebar_animations.length=0;
}

// Spike Magic animation
function sidebar_magic_play(){
  force_finish_all_sidebar_animations();
  // Run the animation code after 0 delay.
  // This is to give enough time for all the animations 
  // finished by force_finish_all_sidebar_animations() to run their onfinish code.
  // If not wrapped around this dummy delay, all the animation code below
  // will run before the force-finished animation's onfinish code
  // which messes up the animation.
  window.setTimeout(()=>{
  siap.style.display="flex";
  
  const animation_frame_count=16;
  const actual_size_x=lmsa.clientWidth;
  const actual_size_y=lmsa.clientHeight;
  lmsa.style.backgroundSize=`${actual_size_x*animation_frame_count}px ${actual_size_y}px`;
  
  let anim_slide=lmsa.animate(
    [{backgroundPositionX:"0"},{backgroundPositionX:"100%"}],
    {duration:1200,delay:0,easing:`steps(${animation_frame_count-1})`});
  sidebar_animations.push(anim_slide);
  let anim_fadein=lmsa.animate(
    [{opacity:"0.0"},{opacity:"1.0"}],
    {duration:500,delay:0,easing:"linear"});
  sidebar_animations.push(anim_fadein);
  
  let anim_rise=lmsa.animate(
    [{marginTop:"200px"},{marginTop:"0"}],
    {duration:1000,delay:0,easing:"cubic-bezier(.18,.58,.6,.99)"});
  sidebar_animations.push(anim_rise);
  anim_slide.onfinish=(e)=>{
    siap.style.display="none";
  };
  },0);
  
  return 1100;
}

// After magic_animate, open up the scroll
function sidebar_desktop_open(){
  force_finish_all_sidebar_animations();
  window.setTimeout(()=>{
  sidebar.classList.remove("sb-mobile-mode");
  sidebar.classList.add("sb-expanded");
  
  sb_close_btn.style.display="none";
  
  let magic_duration=sidebar_magic_play();
  sidebar_collapse_and_unlock();
  sidebar_autoexpand(currently_on_page);
  
  let anim_scale=sidebar.animate(
    [{transform:"scale(0.0)",opacity:0},
     {transform:"scale(1.0)",opacity:1}],
    {duration:400,delay:magic_duration,easing:"ease-out"});
  sidebar_animations.push(anim_scale);
  let anim_unfold=sidebar.animate(
    [{maxHeight:"160px"},
     {maxHeight:"100dvh"}],
    {duration:500,delay:magic_duration+400,easing:"cubic-bezier(0.7, 0.0, 1.0, 0.3)"});
  sidebar_animations.push(anim_unfold);
  
  sidebar.style.transform="scale(0)";
  sidebar.style.display="flex";
  sidebar.style.maxHeight="160px";
  
  anim_scale.onfinish=(e)=>{
    sidebar.style.transform="none";
  };
  
  anim_unfold.onfinish=(e)=>{
    sidebar.style.maxHeight="100dvh";
  }
  },0);
}

// Pop in the mobile sidebar button
function sidebar_mobile_button_enter(){
  force_finish_all_sidebar_animations();
  window.setTimeout(()=>{
  let magic_duration=sidebar_magic_play();
  
  let anim_popin=sb_btn_outer_animator.animate(
    [{transform:"scale(0.0)"},
     {transform:"scale(1.0)"}],
    {duration:400,delay:magic_duration,easing:"ease-out"});
  sidebar_animations.push(anim_popin);
  
  sb_btn_outer_animator.style.display="block";
  sb_btn_outer_animator.style.transform="scale(0.0)";
  
  anim_popin.onfinish=(e)=>{
    sb_btn_outer_animator.style.transform="none";
  };  
  },0);
}

// Hide the sidebar button
function sidebar_mobile_button_exit(){
  force_finish_all_sidebar_animations();
  window.setTimeout(()=>{
  let anim_slideout=sb_btn_outer_animator.animate(
    [{marginLeft:"0px",opacity:"1"},
     {marginLeft:"-160px",opacity:"0"}],
    {duration:500,delay:0,easing:"ease-in"});
  sidebar_animations.push(anim_slideout);
  
  anim_slideout.onfinish = (e)=>{
    sb_btn_outer_animator.style.display="none";
    sb_btn_outer_animator.style.marginLeft="0px";
  }
  },0);
}

let sidebar_opened_in_mobile=false;
// Open up the scroll in fullscreen (mobile mode)
function sidebar_mobile_open(){
  force_finish_all_sidebar_animations();
  window.setTimeout(()=>{
  sidebar.classList.add("sb-mobile-mode");
  sidebar.classList.add("sb-expanded");
  
  if (!sidebar_opened_in_mobile){
    sidebar_opened_in_mobile=true;
    sb_btn_active_area.classList.add("inhibit-animation");
  }
  
  sidebar.style.transform="none";
  sidebar.style.display="flex";
  
  // Expand all categories and lock it open
  sidebar_expand_and_lock();
  
  let anim_fadein=sidebar.animate(
    [{opacity:"0"},
     {opacity:"1"}],
    {duration:300,delay:0,easing:"ease-out"});
  sidebar_animations.push(anim_fadein);
  let anim_scaleX=sidebar.animate(
    [{maxWidth:"0"},
     {maxWidth:"100vw"}],
    {duration:300,delay:0,easing:"ease-in-out"});
  sidebar_animations.push(anim_scaleX);
  anim_scaleX.onfinish= ()=>{
    sidebar.style.maxWidth="100vw";
  }
  sidebar.style.maxHeight="0";
  let anim_scaleY=sidebar.animate(
    [{maxHeight:"0"},
     {maxHeight:"100dvh"}],
    {duration:300,delay:0,easing:"ease-in-out"});
  sidebar_animations.push(anim_scaleY);
  anim_scaleY.onfinish= ()=>{
    sidebar.style.maxHeight="100dvh";
  };
  let anim_button_fadeout=sb_btn_outer_animator.animate(
    [{opacity:1},
     {opacity:0}],
    {duration:300,delay:0,easing:"linear"});
  sidebar_animations.push(anim_button_fadeout);
  sb_btn_outer_animator.style.opacity=1;
  anim_button_fadeout.onfinish=(e)=>{
    sb_btn_outer_animator.style.opacity=0;
    sb_btn_outer_animator.style.display="none";
  };  
  
  sb_close_btn.style.display="block";
  sb_close_btn.style.opacity=0;
  let anim_closebutton_fadein=sb_close_btn.animate(
    [{opacity:0},
     {opacity:1}],
    {duration:300,delay:200,easing:"linear"});
  sidebar_animations.push(anim_closebutton_fadein);
  anim_closebutton_fadein.onfinish=(e)=>{
    sb_close_btn.style.opacity=1;
  };  
  },0);
}

// Desktop mode, hide scroll
function sidebar_desktop_hide(){
  force_finish_all_sidebar_animations();
  window.setTimeout(()=>{
  sidebar.classList.remove("sb-mobile-mode");
  sidebar.classList.remove("sb-expanded");
  
  let anim_slideout=sidebar.animate(
    [{marginLeft:"0"},
     {marginLeft:"-160px"}],
    {duration:500,delay:0,easing:"ease-in"});
  sidebar_animations.push(anim_slideout);
  anim_slideout.onfinish = (e)=>{
    sidebar.style.marginLeft="0";
  }
  let anim_fadeout=sidebar.animate(
    [{opacity:"1"},
     {opacity:"0"}],
    {duration:500,delay:0,easing:"linear"});
  sidebar_animations.push(anim_fadeout);
  anim_fadeout.onfinish = (e)=>{
    sidebar.style.display="none";
  }
  
  // Not really needed, I think...
  sb_close_btn.style.display="none";
  },0);
}

// Mobile mode, hide fullscreen scroll
function sidebar_mobile_close(){
  force_finish_all_sidebar_animations();
  window.setTimeout(()=>{
  sidebar.classList.add("sb-mobile-mode");
  sidebar.classList.remove("sb-expanded");
  
  let anim_scroll_fadeout=sidebar.animate(
    [{opacity:1},
     {opacity:0}],
    {duration:300,delay:0,easing:"linear"});
  sidebar_animations.push(anim_scroll_fadeout);
  anim_scroll_fadeout.onfinish = (e)=>{
    sidebar.style.display="none";
  }
  
  let anim_button_fadein=sb_btn_outer_animator.animate(
    [{opacity:0},
     {opacity:1}],
    {duration:300,delay:0,easing:"linear"});
  sidebar_animations.push(anim_button_fadein);
  sb_btn_outer_animator.style.display="block";
  sb_btn_outer_animator.style.opacity=0;
  anim_button_fadein.onfinish=(e)=>{
    sb_btn_outer_animator.style.opacity=1;
  };  
  
  sb_close_btn.style.display="block";
  sb_close_btn.style.opacity=1;
  let anim_scroll_close_button_fadeout=sb_close_btn.animate(
    [{opacity:1},
     {opacity:0}],
    {duration:200,delay:0,easing:"linear"});
  sidebar_animations.push(anim_scroll_close_button_fadeout);
  anim_scroll_close_button_fadeout.onfinish=(e)=>{
    sb_close_btn.style.display="none";
  };  
  },0);
}
function sidebar_desktop_hide_instant(){
  force_finish_all_sidebar_animations();
  window.setTimeout(()=>{
  sidebar.style.display="none";
  sb_close_btn.style.display="none";
  sidebar.classList.remove("sb-expanded");
  },0);
}

// Sidebar close button
sb_close_btn.addEventListener("click",()=>{
  if (mobile_mode) sidebar_mobile_close();
});

// Called every time a firework explodes
let firework_exploded=false;
let last_firework_explosion_time=-1000;
Fireworks.add_burst_callback(()=>{
  firework_exploded=true;
});




// FPS counter
let ac_tt_hist=[];
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

const l2d_ground_transition_per_second=2.0;
let l2d_ground_transition_progress=0.0;

let last_t=NaN;
function animationCallback(time) {
  // FPS counting
  fpsc_primary_anim_callback.frame();
  let cb_start_t=performance.now();
  
  // Delta-T
  if (isNaN(last_t)) last_t=time;
  let dt=(time-last_t)/1000;
  last_t=time;
  if (dt>1.0) dt=1.0;
  
  // PerfManager
  PerformanceManager.report_frame_time(time);
  
  // Try to compensate for the scrollbar width. (Chromium)
  let width_wholescreen=wsd.clientWidth;
  let width_scroller=content_scroller.clientWidth;
  let scrollbar_width=width_wholescreen-width_scroller;
  if (scrollbar_width>50){
    scrollbar_width=50;
  }
  master_hanmari_container.style.marginRight=scrollbar_width+"px";
  stickies_container.style.marginRight=scrollbar_width+"px";
  
  // Firework flash
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
  logo_image_flash01.style.opacity=firework_light_factor;
  
  if (in_sky_mode)
    l2d_ground_transition_progress-=dt*l2d_ground_transition_per_second;
  else
    l2d_ground_transition_progress+=dt*l2d_ground_transition_per_second;
  
  if (l2d_ground_transition_progress<0) l2d_ground_transition_progress=0;
  if (l2d_ground_transition_progress>1) l2d_ground_transition_progress=1;
  L2D.set_darken_strength(1-l2d_ground_transition_progress);
  L2D.set_staring_strength(l2d_ground_transition_progress);
    
  
  // Debug prints
  debug_print_featurelevel.innerHTML = "Feature Level "+PerformanceManager.get_feature_level();
  debug_print_features.innerHTML = PerformanceManager.generate_feature_list();
  debug_print_faa.innerHTML = PerformanceManager.is_auto_adjust_enabled()?"ON":"OFF";
  
  // Tick all subsystems
  Stars.animationTick(dt);
  Fireworks.animationTick(dt);
  L2D.animationTick(dt);
  Dyntex.animationTick(dt);
  InsideMap.animationTick(dt);
  
  // Eye tracking.
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
  
  // Report frame time
  let cb_time_taken=performance.now()-cb_start_t;
  ac_tt_hist.push(cb_time_taken);
  while (ac_tt_hist.length>100) ac_tt_hist.shift();
}


// The actual animationframe call.
function recursiveAnimFrameFunc(t){
  animationCallback(t);
  requestAnimationFrame(recursiveAnimFrameFunc);
}
requestAnimationFrame(recursiveAnimFrameFunc);



let sky_offset = Config.OPTION_INTRO_SKY_SCROLL_AMOUNT;

// Sky BG size
sky_bg.style.height = wsd.clientHeight+sky_offset+"px";  
sky_bg.style.top="0"; 
let screen_resize_observer = new ResizeObserver(()=>{
  sky_bg.style.height = wsd.clientHeight+sky_offset+"px";  
});
screen_resize_observer.observe(wsd);


// Disble sky in non-intro pages
let sky_disabled=false;
function sky_disable(){
  screen_blanker.style.display="none";
  scroll_inviter_container.style.display="none";
  scroll_fixer.style.display="none";
  sky_disabled=true;
  forceScrollUp();
  if (in_sky_mode) transition_ground();
}
function sky_enable(){
  screen_blanker.style.display="block";
  scroll_inviter_container.style.display="block";
  scroll_fixer.style.display="block";
  sky_disabled=false;
  forceScrollDown();
}

let scroll_inviter_active=true;
function forceScrollDown(){
  if (sky_disabled) return;
  content_scroller.scrollTop=screen_blanker.clientHeight;
}
function forceScrollUp(){
  content_scroller.scrollTop=0;
}
function scroll_callback(){ 
  let scroll_progress_ratio=1;
  let scroll_pixels=0;
  let scroll_maxium=0;
  
  if (!sky_disabled) {
    scroll_pixels=content_scroller.scrollTop;
    scroll_maxium=screen_blanker.clientHeight;
    scroll_progress_ratio=scroll_pixels/scroll_maxium;
    if (scroll_pixels>scroll_maxium) scroll_pixels=scroll_maxium;
  }
  
  scroll_progress_ratio=Math.min(Math.max(scroll_progress_ratio,0),1);
  
  // Hide scroll inviter if scroll ratio > 30%
  if (scroll_inviter_active && (scroll_progress_ratio>0.3)){
    let anim=scroll_inviter_container.animate(
    [{ opacity: "1.0" },{ opacity: "0.0" } ],
    {duration: 500,fill:"forwards"});
    scroll_inviter_active=false;
    anim.onfinish=()=>{
      scroll_inviter_container.style.display="none";
    }
  }
  
  // Update sky
  // This will match the star movement.
  sky_bg.style.top = "-"+sky_offset*scroll_progress_ratio+"px";
  
  // Transition if 90% scrolled
  if (scroll_progress_ratio>0.90){
    if (in_sky_mode) transition_ground();
  }else{
    if (!in_sky_mode) transition_sky();
  }
  
  // Fireworks enabled if less than 50% scrolled
  Fireworks.set_fireworks_enabled(scroll_progress_ratio<0.5);
  
  // Update subsystems
  Stars.set_scroll_progress(scroll_progress_ratio);
  Fireworks.set_scroll_progress(scroll_progress_ratio);
  Castle.report_scroll_progress(scroll_pixels,scroll_maxium);
};
content_scroller.addEventListener("scroll",scroll_callback);
window.setTimeout(scroll_callback,0); // Call after load

let pageid_to_name_en={};
let pageid_to_name_ko={};
let pageid_list=[];
let sbls=document.querySelectorAll(".sb-link");
for (const sbl of sbls){
  let pageid=sbl.getAttribute("data-pageid");
  let kspan=sbl.querySelector(".lang-ko");
  let espan=sbl.querySelector(".lang-en");
  if (pageid){
    if (kspan) pageid_to_name_ko[pageid]=kspan.innerHTML;
    if (espan) pageid_to_name_en[pageid]=espan.innerHTML;
  }
  pageid_list.push(pageid);
}

function autoset_title(){
  let title_pre="";
  let title_post=""
  if (current_lang=="ko") {
    title_pre="말랑포니!";
    if (pageid_to_name_ko[currently_on_page]) 
     title_post=pageid_to_name_ko[currently_on_page];
  }else if (current_lang=="en"){
    title_pre="MalangPony";
    if (pageid_to_name_en[currently_on_page]) 
      title_post=pageid_to_name_en[currently_on_page];
  }
  
  let title="";
  title=title+title_pre;
  if (title_post)
    title=title+" - "+title_post;
  
  // un-escape ampersand
  title=title.replaceAll("&amp;","&");
  
  document.title=title;
}

// Language switching
let current_lang="ko";
let all_langs=["ko","en"];
function apply_lang(code){
  current_lang=code;
  // Add .langmode-* class to body.
  // This is used in some CSS rules.
  for (const lang of all_langs){
    if (lang===current_lang) body_dom.classList.add("langmode-"+lang);
    else body_dom.classList.remove("langmode-"+lang);
  }
  
  autoset_title();
  Maps.lang_changed();
  
  // Save to cookie
  Cookies.createCookie("language",code);
}

lang_btn.onclick= ()=>{
  if (current_lang=="ko") apply_lang("en");
  else apply_lang("ko");
}

for (const dom of document.querySelectorAll(".lang-button-set-ko")){
  dom.addEventListener("click",()=>{apply_lang("ko");})
}
for (const dom of document.querySelectorAll(".lang-button-set-en")){
  dom.addEventListener("click",()=>{apply_lang("en");})
}


function apply_darkmode(darkmode){
  if (darkmode) {
    body_dom.style.colorScheme="dark";
    body_dom.classList.add("dark-mode");
    body_dom.classList.remove("light-mode");
    Cookies.createCookie("theme","D");
  }else {
    body_dom.style.colorScheme="light";
    body_dom.classList.remove("dark-mode");
    body_dom.classList.add("light-mode");
    Cookies.createCookie("theme","L");
  }
}

theme_btn.onclick= ()=>{
  darkmode=!darkmode;
  apply_darkmode(darkmode);
}







// Page transition
let currently_on_page="intro";

// Custom page setup and cleanup functions may be defined here.
let page_setup_functions={};
let page_cleanup_functions={};

// We add the iframe only when the page is actually loaded
// because Youtube's iframe is extremely noisy on the js console.
page_setup_functions["previous"]=function(){
  document.getElementById("yt-embed-container-mpn1").innerHTML='<iframe src="https://www.youtube.com/embed/ZtCIdW_r-U8" frameborder="0" class="embed-frame" allowfullscreen></iframe>';
  document.getElementById("yt-embed-container-mpnL").innerHTML=' <iframe src="https://www.youtube.com/embed/GTEJi7Jr5Cc" frameborder="0"  class="embed-frame" allowfullscreen></iframe>';
}
// This makes sure the videos actually stop when you move to another page.
page_cleanup_functions["previous"]=function(){
  document.getElementById("yt-embed-container-mpn1").innerHTML='';
  document.getElementById("yt-embed-container-mpnL").innerHTML='';
}

page_setup_functions["timetable"]= function(){
  Timetable.enter_timetable_page();
}
page_cleanup_functions["timetable"]= function(){
  Timetable.exit_timetable_page();
}


page_setup_functions["directions"]= function(){
  Maps.relayout();
  Maps.recenter();
  Maps.inhibit_mbj(1000);
}
page_cleanup_functions["directions"]= function(){
}

page_setup_functions["mascot"]= function(){
  
}
page_cleanup_functions["mascot"]= function(){
  mascot_selection_mode=0;
  apply_mascot_selection_mode();
}

page_setup_functions["register"]= function(){
  
}
page_cleanup_functions["register"]= function(){
  Register.close_all_tierboxes();
}

// Transition with animation.
let page_transition_in_progress=false;
function page_transition(name,animated=true,push_to_history=false){
  console.log("Page transition to "+name+", animated="+animated+", PTH="+push_to_history);
  // Hide sidebar, even if the transition is invalid.
  if (mobile_mode) sidebar_mobile_close();
  
  if (page_transition_in_progress) {
    console.log("Rejecting page transition since another transition is in progress");
    return;
  }
  
  // No-op if the transition is useless
  if (name===currently_on_page) return;

  // Find pages.
  let last=document.getElementById("page-"+currently_on_page);
  if (last===null) return;

  let target=document.getElementById("page-"+name);
  if (target===null) return;
  
  page_transition_in_progress=true;
  
  // Custom functions
  let cleanup_func=page_cleanup_functions[currently_on_page];
  let setup_func=page_setup_functions[name];
  
  // Are we going to/from the intro page?
  let on_intro=(currently_on_page==="intro");
  let to_intro=(name==="intro");
  
  // Select the sidebar entry
  sidebar_buttons_activate(name);
  // Open the corresponding sidebar category
  sidebar_autoexpand(name);
  
  // Hanmari Wake
  L2D.wake_hanmari_if_possible();
  
  if (to_intro)
    l2d_buttons_container.classList.remove("on-nonintro-page");
  else
    l2d_buttons_container.classList.add("on-nonintro-page");
  
  if (animated){
    
    // L2D Hanmari size/visibility
    if ((!to_intro) && Config.OPTION_HIDE_HANMARI_ON_NONINTRO_PAGES) 
      L2D.hide_hanmari();
    if (!to_intro)
      L2D.set_hanmari_size(Config.OPTION_NONINTRO_PAGE_HANMARI_SHRINK_FACTOR);
    else
      L2D.set_hanmari_size(1.0);
    
    let animation_start_time=0;
    
    // Hide current page
    let anim_hide_old=main_content_backdrop.animate(
      [{ opacity: "1.0" },{ opacity: "0.0" }],
      {duration: Config.PAGE_TRANSITION_SPEED_FADEIN,
       delay:animation_start_time});
    anim_hide_old.addEventListener("finish",()=>{
      main_content_backdrop.style.opacity=0.0;
    });
    animation_start_time+=Config.PAGE_TRANSITION_SPEED_FADEIN;
    
    // This is the instant where the transition actually happens.
    function swap_page(){
      if (cleanup_func) cleanup_func();
      
      last.style.display="none";
      target.style.display="flex";
      main_content_backdrop.style.opacity=0;
      
      if (to_intro) sky_enable();
      else sky_disable();
      
      if (to_intro && Config.OPTION_HIDE_HANMARI_ON_NONINTRO_PAGES) 
        L2D.show_hanmari();
      
      if (to_intro)
        main_content_backdrop.classList.add("on-intro-page");
      else
        main_content_backdrop.classList.remove("on-intro-page");
      
      if (setup_func) setup_func();
    }
    
    
   
    
    // Castle animation
    if ( on_intro && (!to_intro) ){ // Enter Castle
      // In this case, the swap_page() should be called AFTER the castle animation.
      let duration=Castle.enter_animation(animation_start_time,
        ()=>{swap_page();});
      animation_start_time+=duration;
      
      //after castle animation complete
      StaticBG.activate_page_bg(name,animation_start_time,
        Config.STATIC_BG_TRANSITION_SPEED_CASTLE_ENTER);
    }else if ( (!on_intro) && to_intro ){ // Exit Castle
      anim_hide_old.addEventListener("finish",()=>{swap_page();});
      // Fade to transparent right away
      StaticBG.activate_page_bg(name,0,
        Config.STATIC_BG_TRANSITION_SPEED_CASTLE_EXIT); 
      let duration=Castle.exit_animation(animation_start_time,()=>{});
      animation_start_time+=duration;
      
    }else{ // move inside castle
      anim_hide_old.addEventListener("finish",()=>{swap_page();});
      // crossfade right away
      StaticBG.activate_page_bg(name,0,
        Config.STATIC_BG_TRANSITION_SPEED_INSIDE); 
    }
    
    // Show next page
    let anim_show_new=main_content_backdrop.animate(
      [{ opacity: "0.0" },{ opacity: "1.0" }],
      {duration: Config.PAGE_TRANSITION_SPEED_FADEIN,
       delay:animation_start_time});
    anim_show_new.onfinish= () => {
      main_content_backdrop.style.opacity=1;
      page_transition_in_progress=false;
    }
  
  }else{
    
    if (cleanup_func) cleanup_func();
    
    last.style.display="none";
    target.style.display="flex";
    target.style.opacity=1.0;
    
    if (setup_func) setup_func();
    
    currently_on_page=name;
    if (currently_on_page==="intro") {
      // Note: Currently this branch is never taken.
      sky_enable();
      L2D.show_hanmari_instant();
      L2D.set_hanmari_size_instant(1.0);
      l2d_ground_transition_progress=0;
      main_content_backdrop.classList.add("on-intro-page");
      
    }else {
      sky_disable();
      if (Config.OPTION_HIDE_HANMARI_ON_NONINTRO_PAGES)
        L2D.hide_hanmari_instant();
      l2d_ground_transition_progress=1;
      L2D.set_hanmari_size_instant(Config.OPTION_NONINTRO_PAGE_HANMARI_SHRINK_FACTOR);
      main_content_backdrop.classList.remove("on-intro-page");
    }
    
    StaticBG.activate_page_bg_instant(name);
    if (name !== "intro") Castle.enter_instant();
    
    page_transition_in_progress=false;
  }
  
  
  
  if (push_to_history){
    // Push state before changing the title.
    let url=window.location.origin+"/"+name;
    if (to_intro) url=window.location.origin;
    //console.log("PushState,"+name+" : "+url);
    window.history.pushState({pageID:name},"",url);
  }
  
  currently_on_page=name;
  autoset_title();
}

window.addEventListener("popstate",(e)=>{
  let pageid=e.state.pageID;
  //console.log("PopState,"+pageid);
  if (pageid){
    page_transition(pageid,true,false);
  }
});

// Setup all .internal-page-autolink
let ipals=document.querySelectorAll(".internal-page-autolink");
for(const ipal of ipals){
  let pageid=ipal.getAttribute("data-pageid");
  if (!pageid) continue;
  let nameK=pageid_to_name_ko[pageid];
  let nameE=pageid_to_name_en[pageid];
  
  ipal.addEventListener("click",()=>{
    page_transition(pageid,true,true);
  });
  ipal.style.cursor="pointer";
  
  if (ipal.classList.contains("autofill-pagename")){
    let kspan=document.createElement("span");
    kspan.classList.add("lang-ko");
    kspan.innerHTML=nameK;
    let espan=document.createElement("span");
    espan.classList.add("lang-en");
    espan.innerHTML=nameE;
    ipal.appendChild(kspan);
    ipal.appendChild(espan);
  }
  
}


// Setup sidebar buttons
let sidebar_buttons_active=document.querySelectorAll(".sb-link-active");
for (const sb of sidebar_buttons_active){
  let pageid=sb.getAttribute("data-pageid");
  sb.addEventListener("click",(e)=>{
    page_transition(pageid,true,true);
    e.preventDefault();
  });
  if (pageid==="intro") sb.href="/";
  else sb.href="/"+pageid;
}

function sidebar_buttons_activate(pageid_active){
  for (const sb of sidebar_buttons_active){
    let pageid=sb.getAttribute("data-pageid");
    if (pageid===pageid_active) sb.classList.add("sb-link-selected");
    else sb.classList.remove("sb-link-selected");
  }
}


// Disable/Enable Mobile mode
let mq_mobile=window.matchMedia("(width <= 640px)");

let mobile_mode=mq_mobile.matches;
function mobile_enter(){
  body_dom.classList.add("mobile-mode");
  body_dom.classList.remove("desktop-mode");
  if (!in_sky_mode) {
    sidebar_desktop_hide_instant();
    sidebar_mobile_button_enter();
  }
  Timetable.enter_mobile();
}
function mobile_leave(){
  body_dom.classList.remove("mobile-mode");
  body_dom.classList.add("desktop-mode");
  if (!in_sky_mode) {
    sidebar_desktop_open();
    sidebar_mobile_button_exit();
  }
  Timetable.exit_mobile();
}

mq_mobile.onchange= ()=>{
  let match=mq_mobile.matches;
  mobile_mode=match;
  if (match) mobile_enter();
  else mobile_leave();
};
sb_btn_active_area.onclick=sidebar_mobile_open;




// Manual performance level set
debug_btn_perf_increment.addEventListener("click", (e) => {
	PerformanceManager.increment_feature_level();
});
debug_btn_perf_decrement.addEventListener("click", (e) => {
	PerformanceManager.decrement_feature_level();
});
debug_btn_perf_auto.addEventListener("click", (e) => {
	PerformanceManager.toggle_auto_adjust();
});


// Sidebar category expansion
/* Sidebar DOM structure:
 * 
 * sb-category-container
 *   sb-category-header
 *   sb-category-content
 *     sb-link-sublevel
 * sb-link-toplevel
 */
let sidebar_category_interactive=true; // set false to disable expand/collapse
let sidebar_expand_functions={};
const sbccs=document.querySelectorAll(".sb-category-container");
for (const clicked_sbcc of sbccs){
  const clicked_header_icon=clicked_sbcc.querySelector(".sbch-icon");
  const clicked_header=clicked_sbcc.querySelector(".sb-category-header");
  function expand(toggle=false){
    if (!sidebar_category_interactive) return;
    for (const other_sbcc of sbccs){
      const other_header=other_sbcc.querySelector(".sb-category-header");
      const other_content=other_sbcc.querySelector(".sb-category-content");
      if (other_sbcc===clicked_sbcc){
        // This is the clicked one.
        if (other_sbcc.classList.contains("sbcc-expanded")){
          // It's already expaned. Close it now.
          if (toggle)
            other_sbcc.classList.remove("sbcc-expanded");
        }else{
          // It's closed now. Expand it.
          other_sbcc.classList.add("sbcc-expanded");
        }
      }else {
        // This is NOT the clicked one. Close it.
        other_sbcc.classList.remove("sbcc-expanded");
      }
    }
  }
  clicked_header.addEventListener("click",()=>{expand(true);});
  let clicked_sbcc_links=clicked_sbcc.querySelectorAll(".sb-link");
  for (const sbl of clicked_sbcc_links){
    let pageid=sbl.getAttribute("data-pageid");
    sidebar_expand_functions[pageid]=expand;
  }
}

// Toplevel links
const sblts=document.querySelectorAll(".sb-link-toplevel");
for (const sblt of sblts){
  const icon=sblt.querySelector(".sbch-icon");
  
  function collapse_all(toggle=false){
    if (!sidebar_category_interactive) return;
    for (const other_sbcc of sbccs){
      other_sbcc.classList.remove("sbcc-expanded");
    }
  }
  let pageid=sblt.getAttribute("data-pageid");
  sidebar_expand_functions[pageid]=collapse_all;
  
}

// Expand everything
function sidebar_expand_all(){
  for (const other_sbcc of sbccs){
    const header_icon=other_sbcc.querySelector(".sbch-icon");
    const header=other_sbcc.querySelector(".sb-category-header");
    const content=other_sbcc.querySelector(".sb-category-content");
    other_sbcc.classList.add("sbcc-expanded");
  }
}
// Expand and disallow collapsing
function sidebar_expand_and_lock(){
  sidebar_expand_all();
  sidebar_category_interactive=false;
  sidebar.classList.add("sb-expand-forced");
}
// Collapse everything
function sidebar_collapse_all(){
  for (const other_sbcc of sbccs){
    const header_icon=other_sbcc.querySelector(".sbch-icon");
    const header=other_sbcc.querySelector(".sb-category-header");
    const content=other_sbcc.querySelector(".sb-category-content");
    other_sbcc.classList.remove("sbcc-expanded");
  }
}
function sidebar_collapse_and_unlock(){
  sidebar_collapse_all();
  sidebar_category_interactive=true;
  sidebar.classList.remove("sb-expand-forced");
}
function sidebar_autoexpand(name){
  let expand_func=sidebar_expand_functions[name];
  if (expand_func) expand_func(false);
}


// 0 None selected +1 Hanmari -1 Leebyeori
let mascot_selection_mode=0;

function apply_mascot_selection_mode(){
  //console.log("MSM",mascot_selection_mode);
  if (mascot_selection_mode==0){
    mascot_container_hmr.classList.add("isolate");
    mascot_container_hmr.classList.remove("minimize");
    mascot_container_lbr.classList.add("isolate");
    mascot_container_lbr.classList.remove("minimize");
  }else if (mascot_selection_mode==-1){
    mascot_container_hmr.classList.add("isolate");
    mascot_container_hmr.classList.add("minimize");
    mascot_container_lbr.classList.remove("isolate");
    mascot_container_lbr.classList.remove("minimize");
  }else if (mascot_selection_mode==+1){
    mascot_container_hmr.classList.remove("isolate");
    mascot_container_hmr.classList.remove("minimize");
    mascot_container_lbr.classList.add("isolate");
    mascot_container_lbr.classList.add("minimize");
  } 
  
  if (mascot_selection_mode==0){
    mascot_click_suggester.classList.remove("hidden");
  }else{
    mascot_click_suggester.classList.add("hidden");
  }
}
mascot_container_hmr.addEventListener("click",()=>{
  if (mascot_selection_mode==0){
    mascot_selection_mode=+1;
    apply_mascot_selection_mode();
  }else if (mascot_selection_mode==-1){
    mascot_selection_mode=0;
    apply_mascot_selection_mode();
  }
});
mascot_container_lbr.addEventListener("click",()=>{
  if (mascot_selection_mode==0){
    mascot_selection_mode=-1;
    apply_mascot_selection_mode();
  }else if (mascot_selection_mode==+1){
    mascot_selection_mode=0;
    apply_mascot_selection_mode();
  }
});
apply_mascot_selection_mode();


// Countdown
function calculateDday(){
  //let eventTime=new Date("2025-02-15T00:00:00+09:00");
  let eventTime=new Date("2026-08-01T10:00:00+09:00");
  let nowTime=new Date();
  let timeDelta = eventTime.getTime() - nowTime.getTime();
  if (timeDelta<0) timeDelta=0;
  
  let seconds=Math.round(timeDelta/1000);
  let minutes = Math.floor(seconds/60);
  seconds = seconds%60;
  let hours = Math.floor(minutes/60);
  minutes = minutes%60;
  let days = Math.floor(hours/24);
  hours = hours%24;
  
  let seconds_numeric=seconds;
  let minutes_numeric=minutes;
  let hours_numeric=hours;
  let days_numeric=days;
  
  days=""+days;
  hours=""+hours;
  let hours_unpadded=hours;
  while (hours.length<2) hours="0"+hours;
  minutes=""+minutes;
  let minutes_unpadded=minutes;
  while (minutes.length<2) minutes="0"+minutes;
  seconds=""+seconds;
  let seconds_unpadded=seconds;
  while (seconds.length<2) seconds="0"+seconds;
  
  return {
    days:days,
    hours:hours_unpadded,
    hours_padded:hours,
    minutes:minutes_unpadded,
    minutes_padded:minutes,
    seconds:seconds_unpadded,
    seconds_padded:seconds,
    days_numeric:days_numeric,
    hours_numeric:hours_numeric,
    minutes_numeric:minutes_numeric,
    seconds_numeric:seconds_numeric
  };
}
function updateDday(){
  let dday=calculateDday();
  for (const dom of countdown_display.querySelectorAll(".countdown-days"))
    dom.innerHTML=dday.days;
  for (const dom of countdown_display.querySelectorAll(".countdown-hours"))
    dom.innerHTML=dday.hours;
  for (const dom of countdown_display.querySelectorAll(".countdown-hours-padded"))
    dom.innerHTML=dday.hours_padded;
  for (const dom of countdown_display.querySelectorAll(".countdown-minutes"))
    dom.innerHTML=dday.minutes;
  for (const dom of countdown_display.querySelectorAll(".countdown-minutes-padded"))
    dom.innerHTML=dday.minutes_padded;
  for (const dom of countdown_display.querySelectorAll(".countdown-seconds"))
    dom.innerHTML=dday.seconds;
  for (const dom of countdown_display.querySelectorAll(".countdown-seconds-padded"))
    dom.innerHTML=dday.seconds_padded;
  for (const dom of countdown_display.querySelectorAll(".countdown-unit-day-plural"))
    dom.style.display=dday.days_numeric==1?"none":"unset";
  for (const dom of countdown_display.querySelectorAll(".countdown-unit-day-singular"))
    dom.style.display=dday.days_numeric==1?"unset":"none";
  for (const dom of countdown_display.querySelectorAll(".countdown-unit-hour-plural"))
    dom.style.display=dday.hours_numeric==1?"none":"unset";
  for (const dom of countdown_display.querySelectorAll(".countdown-unit-hour-singular"))
    dom.style.display=dday.hours_numeric==1?"unset":"none";
  for (const dom of countdown_display.querySelectorAll(".countdown-unit-minute-plural"))
    dom.style.display=dday.minutes_numeric==1?"none":"unset";
  for (const dom of countdown_display.querySelectorAll(".countdown-unit-minute-singular"))
    dom.style.display=dday.minutes_numeric==1?"unset":"none";
  for (const dom of countdown_display.querySelectorAll(".countdown-unit-second-plural"))
    dom.style.display=dday.seconds_numeric==1?"none":"unset";
  for (const dom of countdown_display.querySelectorAll(".countdown-unit-second-singular"))
    dom.style.display=dday.seconds_numeric==1?"unset":"none";
  
}
window.setInterval(
  updateDday,1000
)
updateDday();

// Initial Setup

// Get mobile mode from media query
if (mq_mobile.matches) mobile_enter();
else mobile_leave();

// Get page from URL.
// If found, transition instantly.
if (window.location.pathname != ""){
  let path_location=window.location.pathname.substring(1);
  
  if (pageid_list.includes(path_location)) {
    console.log("From URL, going to page: "+path_location);
    // Valid page location
    forceScrollDown();
    page_transition(path_location,false,false);
  }else{
    console.log("From URL, invalid page: "+path_location);
  }
}

// Setup first history
window.history.replaceState({pageID:currently_on_page},"");

// Get lang value from cookie
let lang_from_cookie=null;
const langCookieRaw = Cookies.readCookie("language");
console.log("language cookie value: "+langCookieRaw);
if (langCookieRaw) {
  if (all_langs.includes(langCookieRaw)) lang_from_cookie=langCookieRaw;
  else console.log("Error: Language cookie value invalid!");
}

// Get lang value from environment
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

// Set lang value
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



// Get theme from cookie
let theme_from_cookie=Cookies.readCookie("theme");

// Get theme from media query
let mq_darkmode=window.matchMedia("(prefers-color-scheme: dark)");
let darkmode_media_query_result=mq_darkmode.matches;

// Set initial theme
let darkmode=darkmode_media_query_result;

// If there was a cookie, override it with the cookie value.
if (theme_from_cookie){
  if (theme_from_cookie==="L"){
    console.log("Set theme to Light, from cookie");
    darkmode=false;
  }else if (theme_from_cookie==="D"){
    console.log("Set theme to Dark, from cookie");
    darkmode=true;
  }
}else{
  console.log("No theme cookie, follow media query; DM="+darkmode);
}

// Apply initial
apply_darkmode(darkmode);
