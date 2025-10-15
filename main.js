import { Vector2, Vector3 } from "./vectors.js";
import * as Config  from "./config.js";
import * as Fireworks from "./fireworks.js";
import * as Stars from "./stars.js";
import * as Parallax from "./parallax.js";


const wsd = document.getElementById("whole-screen-div");



const intro_content_container=document.getElementById("intro-content-container");

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



const hanmari_image_container = document.getElementById("hmr-image-container");





let in_sky_mode=true;
function transition_sky(){
  in_sky_mode=true;
  let animation_out=[{ opacity: "1.0" },{ opacity: "0.0" } ];
  let animation_in=[{ opacity: "0.0" },{ opacity: "1.0" } ];
  let animation_opt={duration: 500,fill:"forwards"};
  logo_image_orig.animate(animation_out,animation_opt);
  hmr_image_ground.animate(animation_out,animation_opt);
  hmr_image_base.animate(animation_in,animation_opt);
  intro_content_container.classList.remove("activated");
  afterscroll_container.classList.remove("activated");
  lang_btn.classList.remove("activated");
  sb_btn.classList.remove("activated");
  if (mobile_mode) sidebar_button_hide_mobile();
  else sidebar_hide();
}
function transition_ground(){
  in_sky_mode=false;
  let animation_out=[{ opacity: "1.0" },{ opacity: "0.0" } ];
  let animation_in=[{ opacity: "0.0" },{ opacity: "1.0" } ];
  let animation_opt={duration: 500,fill:"forwards"};
  logo_image_orig.animate(animation_in,animation_opt);
  hmr_image_ground.animate(animation_in,animation_opt);
  hmr_image_base.animate(animation_out,animation_opt);
  //hmr_image_flash01.animate(animation_out,animation_opt);
  intro_content_container.classList.add("activated");
  afterscroll_container.classList.add("activated");
  lang_btn.classList.add("activated");
  sb_btn.classList.add("activated");
  window.setTimeout(()=>{
    if (!in_sky_mode) {
      if (mobile_mode) sidebar_button_animate_mobile();
      else sidebar_intro_animate();
    }},100);
}
/*
function sidebar_intro_animate(){
  sia.style.display="block";
  let anim1=sia.animate(
    [{opacity:0.0,transform:"translate(0,0)"},
     {opacity:0.5,transform:"translate(0,-50px)"},
     {opacity:1.0,transform:"translate(0,0)"}],
    {duration:700,delay:0,easing:"cubic-bezier(0,.3,1,.7)"})
  let anim3=siai.animate(
    [{transform:"scale(0.5) rotate(-180deg)"},
     {transform:"scale(1.2) rotate(360deg)"}],
     {duration:700,delay:0,easing:"linear"})
  let anim4=sidebar.animate(
    [{transform:"scale(0.0) rotate(-180deg)"},
     {transform:"scale(1.0) rotate(0)"}],
    {duration:300,delay:700,easing:"ease-out"})
  let anim5=sidebar.animate(
    [{maxHeight:"0"},
     {maxHeight:"calc(100vh - 64px)"}],
    {duration:1000,delay:1000,easing:"ease-in-out"})
  
  sidebar.style.display="none";
  sidebar.style.maxHeight="0";
  anim3.onfinish=(e)=>{
    sidebar.style.display="flex";
    sia.style.display="none";
  };
  anim5.onfinish=(e)=>{
    sidebar.style.maxHeight="calc(100vh - 64px)";
  }
}*/
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
     {maxHeight:"calc(100vh - 64px)"}],
    {duration:1000,delay:1500,easing:"ease-in-out"})
  
  sidebar.style.transform="scale(0)";
  sidebar.style.display="flex";
  sidebar.style.maxHeight="0";
  
  anim4.onfinish=(e)=>{
    sidebar.style.transform="none";
  };
  
  anim5.onfinish=(e)=>{
    sidebar.style.maxHeight="calc(100vh - 64px)";
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
     {maxHeight:"100vh"}],
    {duration:300,delay:0,easing:"ease-in-out"});
  anim5.onfinish= ()=>{
    sidebar.style.maxHeight="100vh";
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

function flash_anim_trigger(){
  if (!in_sky_mode) return;
  let animation_kf=[{ opacity: "1.0" },{ opacity: "0.0" } ];
  let animation_opt={duration: 600+Math.random()*200,
     easing:"cubic-bezier(1.0, 0.0, 0.8, 1.0)",
     fill:"forwards",
     direction:"normal",
     iterations: 1};
  hmr_image_flash01.animate(animation_kf,animation_opt);
  logo_image_flash01.animate(animation_kf,animation_opt);
  /*container_ground.animate(
    [{ backgroundColor: "#144814" },
    { backgroundColor: "#104010" } ],
    animation_opt);*/
}
Fireworks.add_burst_callback(flash_anim_trigger);





let dbp=document.getElementById("debug-print");


let last_t=NaN;
let frame_times=[];
function animationCallback(time) {
  frame_times.push(time);
  while (frame_times[0]+1000<time){
    let fps=(frame_times.length-1)/(time-frame_times[0])*1000;
    debug_print_fps.innerHTML="Anim "+fps.toFixed(2)+" FPS";
    frame_times=[];
  }
  
  
  if (isNaN(last_t)) last_t=time;
  let dt=(time-last_t)/1000;
  last_t=time;
  if (dt>1.0) dt=1.0;
  
  Stars.animationTick(dt);
  Fireworks.animationTick(dt);
  Parallax.animationTick(dt);
  
  requestAnimationFrame(animationCallback);
}
requestAnimationFrame(animationCallback);


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
  //console.log("Scroll"+e);
  let scroll_progress_ratio=1;
  
  if (!sky_disabled) {
    let scroll_pixels=content_scroller.scrollTop;
    let scroll_maxium=screen_blanker.clientHeight;
    scroll_progress_ratio=scroll_pixels/scroll_maxium;
  }
  
  if (scroll_inviter_active && (scroll_progress_ratio>0.3)){
    scroll_inviter_container.animate(
    [{ opacity: "1.0" },{ opacity: "0.0" } ],
    {duration: 500,fill:"forwards"});
    scroll_inviter_active=false;
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




/*
function recalculate_camera_position(){
  let scroll_amount=content_scroller.scrollTop;
  let scroll_maximum=intro_content_container.clientHeight-content_scroller.clientHeight;
  let scroll_bottom=scroll_maximum-scroll_amount;
  parallax_camera=new Vector3(
    Math.sin(Date.now()/500)*100,
    scroll_bottom,
    parallax_camera.z);
}
recalculate_parallax_images();
*/

function hide_hanmari(){
  hanmari_image_container.style.opacity=1.0;
  let anim3=hanmari_image_container.animate(
    [{ opacity: "1.0" },{ opacity: "0.0" }],
    {duration: 500,delay:0});
  anim3.onfinish= () => {
    hanmari_image_container.style.display="none";
  }
}
function hide_hanmari_instant(){
  hanmari_image_container.style.display="none";
}
function show_hanmari(){
  hanmari_image_container.style.display="block";
  hanmari_image_container.style.opacity=0.0;
  let anim3=hanmari_image_container.animate(
    [{ opacity: "0.0" },{ opacity: "1.0" }],
    {duration: 500,delay:0});
  anim3.onfinish= () => {
    hanmari_image_container.style.opacity=1.0;
  }
}
function show_hanmari_instant(){
  hanmari_image_container.style.display="block";
  hanmari_image_container.style.opacity=1.0;
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
    if (config.OPTION_HIDE_HANMARI_ON_NONINTRO_PAGES)
      hide_hanmari_instant();
  }
}
function page_transition(name){
  if (mobile_mode) sidebar_hide_mobile();
  
  //console.log("PT "+name)
  if (name===currently_on_page) return;
  //console.log("PT 1");
  let last=document.getElementById("page-"+currently_on_page);
  if (last===null) return;
  //console.log("PT 2");
  let target=document.getElementById("page-"+name);
  if (target===null) return;
  //console.log("PT 3");
  
  
  /*
  let anim1=last.animate(
    [{ opacity: "1.0" },{ opacity: "0.0" } ],
    {duration: 500});
  anim1.onfinish= () => {
    last.style.display="none";
    target.style.display="flex";
    target.style.opacity="0";
  }
  let anim2=target.animate(
    [{ opacity: "0.0" },{ opacity: "1.0" } ],
    {duration: 500,delay:500});
  anim2.onfinish= () => {
    target.style.opacity="1.0";
  }*/
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

let camera_locations={
  intro:new Vector3(0,0,-500),
  about:new Vector3(200,0,-500),
  coc:new Vector3(0,0,-100),
  news:new Vector3(0,0,-800),
}
export function sidebar_clicked(x){
  page_transition(x);
  let camloc=camera_locations[x];
  if (camloc === undefined) return;
  Parallax.camera_animate_to(camloc);
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
  
  let camloc=camera_locations[path_location];
  if (camloc !== undefined) {
    console.log("From URL, going to page: "+path_location);
    // Valid page location
    parallax_camera=camloc; // Jump camera
    forceScrollDown();
    page_transition_instant(path_location);
  }else{
    console.log("From URL, invalid page: "+path_location);
  }
}
