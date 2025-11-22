/*
 * Handles all KakaoMap logic.
 * 
 */

import * as MapData from "./map_data.js";

let page_venue=document.getElementById("page-venue");

let directions_munrae = document.getElementById("directions-munrae");
let directions_yangpyong = document.getElementById("directions-yangpyong");
let directions_bus = document.getElementById("directions-bus");

function array_to_latlng(a){
  return new kakao.maps.LatLng(a[0], a[1]); 
}
function convert_to_polyline_path(a){
  let ret=[];
  for(const i of a){
    ret.push(array_to_latlng(i));
  }
  return ret;
}
function concatenate_route(a,b){
  return a.slice(a,a.length-1).concat(b);
}

//AllThatMind location
var positionATM  = array_to_latlng(MapData.point_ATM);

// Main container
var container = document.getElementById('kakaomap-content'); 

// Jump to ATM button
let mbj=document.getElementById("map-btn-jump");


// The all-important map object
var kkm = new kakao.maps.Map(
  container, { 
	center: positionATM, 
	level: 5});

// Note: Call kkm.relayout() on visibility changes!
export function relayout(){
  kkm.relayout();
}

// Automatically call relayout on visibility change
let page_visible=false;
let visibilityObserver=new MutationObserver((mutations,observer)=>{
  for (const mutation of mutations) {
    //console.log(mutation);
    if (mutation.type=="attributes" && mutation.attributeName==="style"){
      let now_visible=(page_venue.style.display!=="none");
      if ((!page_visible) && now_visible) {
        console.log("Detected Map page becoming visible. Trigger relayout.");
        relayout();
      }
      page_visible=now_visible;
    }
  }
});
visibilityObserver.observe(page_venue,{attributes:true});

let was_zero_size=true;
let resizeObserver = new ResizeObserver((entries,observer)=>{
  let h=container.clientHeight;
  let w=container.clientWidth;
  let zero_size=(h*w)<10;
  if (was_zero_size && (!zero_size)){
    console.log("Map container went from zero size to nonzero size. Recentering.")
    // Now not zero-size!
    relayout();
    recenter();
  }
  was_zero_size=zero_size;
});
resizeObserver.observe(container);


// Main ATM Marker
let markerSizeMultiplier=0.3;
var markerImage = new kakao.maps.MarkerImage(
  'sprites-prototype/MPN2-Prototype-Image_MapMarker.png', 
  new kakao.maps.Size(300*markerSizeMultiplier, 300*markerSizeMultiplier), 
  {offset: new kakao.maps.Point(100*markerSizeMultiplier, 250*markerSizeMultiplier)});
var marker = new kakao.maps.Marker({
    position: positionATM,
    image:markerImage
});
marker.setMap(kkm);

// Overlay below marker
let overlayContent='<div style="margin-top:12px;padding:8px;border-radius:8px;background-color:hsl(from var(--template-malang-TWI) h s l / 90%);color:var(--color-text-light);text-align:center;font-size:16px;">말랑포니 행사 장소<br><strong>올댓마인드</strong></div>'
var placeLabel = new kakao.maps.CustomOverlay({
    map: kkm,
    position: positionATM,
    content: overlayContent,
    xAnchor:0.5,
    yAnchor: 0.0
});

// Route functions

let cleanup_functions=[];
let cleanup_timeout_ids=[];
// Flash a polyline pl,
// Over duration milliseconds, every interval milliseconds.
// Flash between optA and optB, settling on optE at the end.
function flash_polyline(pl,duration,interval,optA,optB,optE){
  // Cancel everything else. Only one route may be flashed at a time.
  for (const f of cleanup_functions) f();
  for (const iid of cleanup_timeout_ids) window.clearTimeout(iid);
  
  let parity=true;
  pl.setOptions(optA); // Apply optA immediately.
  let interval_id = window.setInterval(()=>{
    parity=!parity;
    if (parity) pl.setOptions(optA);
    else pl.setOptions(optB);
  },interval);
  
  //Cleanup
  let cleaned_up=false;
  function cleanup(){
    if (cleaned_up) return;
    window.clearInterval(interval_id);
    pl.setOptions(optE);
    cleaned_up=true;
  }
  cleanup_functions.push(cleanup);
  
  // Cleanup should be run automatically.
  
  let timeout_id=window.setTimeout(cleanup,duration);
  cleanup_timeout_ids.push(timeout_id);
}
function calculate_polyline_bounds(pl){
  let latMax=-1000;
  let latMin= 1000;
  let lngMax=-1000;
  let lngMin= 1000;
  for(const ll of pl.getPath()){
    let lat=ll.getLat();
    let lng=ll.getLng();
    if (lat<latMin) latMin=lat;
    if (lat>latMax) latMax=lat;
    if (lng<lngMin) lngMin=lng;
    if (lng>lngMax) lngMax=lng;
  }
  let sw=new kakao.maps.LatLng(latMin,lngMin);
  let ne=new kakao.maps.LatLng(latMax,lngMax);
  return new kakao.maps.LatLngBounds(sw,ne);
}

let routes={
  munrae:{
    points:MapData.route_MunraeToATM,
    color:"var(--color-route-line2)",
    focus_button:directions_munrae
  },
  yangpyong:{
    points:MapData.route_YangpyeongToATM,
    color:"var(--color-route-line5)",
    focus_button:directions_yangpyong
  }
};

for (const k in routes){
  let route=routes[k];
  route.polyline=new kakao.maps.Polyline({
    map:kkm,
    path:convert_to_polyline_path(route.points),
    strokeOpacity:0.8,
    strokeColor:route.color,
    strokeStyle:"dashed",
    strokeWeight:4,
  });
  route.bounds=calculate_polyline_bounds(route.polyline);
  route.focus_button.addEventListener("click",()=>{
    flash_polyline(
      route.polyline,3000,250,
      {strokeOpacity:1.0,strokeWeight:6,strokeStyle:"solid"},
      {strokeOpacity:0.5,strokeWeight:6,strokeStyle:"solid"},
      {strokeOpacity:1.0,strokeWeight:4,strokeStyle:"dashed"});
    kkm.setBounds(route.bounds,50);
    container.scrollIntoView({behavior:"smooth",block:"nearest"});
  });
  route.focus_button.style.cursor="pointer";
}

// Drawing #1, near Munrae station
let drawing1_html='<img src="sprites-prototype/MPN2-Prototype-Image_MapDrawing_Munrae1.png" style="width:150px;height:150px;">'
var drawing1 = new kakao.maps.CustomOverlay({
    map: kkm,
    position: new kakao.maps.LatLng(37.51852288426295, 126.89547104210291),
    content: drawing1_html,
    xAnchor:0.2,
    yAnchor: 0.8
});

// Event listeners
// Display jump button if venue is too off to the side
kakao.maps.event.addListener(kkm, 'bounds_changed', ()=>{
  let llb=kkm.getBounds();
  let s=llb.getSouthWest().getLat();
  let w=llb.getSouthWest().getLng();
  let n=llb.getNorthEast().getLat();
  let e=llb.getNorthEast().getLng();
  let ratioY=(positionATM.getLat()-s)/(n-s);
  let ratioX=(positionATM.getLng()-w)/(e-w);
  let centeredX=(ratioX<0.95) && (ratioX>0.05);
  let centeredY=(ratioY<0.95) && (ratioY>0.05);
  
  if (centeredX && centeredY) mbj.style.display="none";
  else mbj.style.display="flex";
});

// Zoom-dependent Visibility
kakao.maps.event.addListener(kkm, 'zoom_changed', function() {
  let zl=kkm.getLevel();
  
  drawing1.setVisible( zl<5.5 );

  placeLabel.setVisible( (zl>4.5) && (zl<6.5) );
  
  line_munrae.setMap( (zl<6.5) ? kkm : null );
  line_yangpyong.setMap( (zl<6.5) ? kkm : null );
  
});

function recenter(){
  kkm.jump(positionATM,5,{animate:{duration:500}});
}

// Jump button
mbj.style.display="none";
mbj.addEventListener("click",recenter);
mbj.style.cursor="pointer";
