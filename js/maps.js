/*
 * Handles all KakaoMap logic.
 * 
 */
let page_venue=document.getElementById("page-venue");

let directions_munrae = document.getElementById("directions-munrae");
let directions_yangpyong = document.getElementById("directions-yangpyong");
let directions_bus = document.getElementById("directions-bus");

//AllThatMind location
var positionATM  = new kakao.maps.LatLng(37.520484, 126.887396); 

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
let overlayContent='<div style="margin-top:12px;border:2px solid #F00;background-color:#F88;text-align:center;font-size:16px;">말랑포니 행사 장소<br><strong>올댓마인드</strong></div>'
var customOverlay = new kakao.maps.CustomOverlay({
    map: kkm,
    position: positionATM,
    content: overlayContent,
    xAnchor:0.5,
    yAnchor: 0.0
});

// Route functions

let flashing_functions=[];
let delayed_functions=[];
// Flash a polyline pl,
// Over duration milliseconds, every interval milliseconds.
// Flash between optA and optB, settling on optE at the end.
function flash_polyline(pl,duration,interval,optA,optB,optE){
  // Cancel everything else. Only one route may be flashed at a time.
  for (const iid of flashing_functions) window.clearInterval(iid);
  for (const iid of delayed_functions) window.clearTimeout(iid);
  
  let parity=true;
  pl.setOptions(optA); // Apply optA immediately.
  let interval_id = window.setInterval(()=>{
    parity=!parity;
    if (parity) pl.setOptions(optA);
    else pl.setOptions(optB);
  },interval);
  flashing_functions.push(interval_id);
  
  // Timeout to clear the interval.
  let timeout_id=window.setTimeout(()=>{
    window.clearInterval(interval_id);
    pl.setOptions(optE);
  },duration);
  delayed_functions.push(timeout_id);
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

// Route display: Munrae
let route_munrae=[
  new kakao.maps.LatLng(37.51900312549791, 126.89473099985379), // Exit 3
  new kakao.maps.LatLng(37.519041535116756, 126.89470100700552), //Road start
  new kakao.maps.LatLng(37.52022853982451, 126.88718840508649), //Turn 1
  new kakao.maps.LatLng(37.520765908380696, 126.88732130114812), //Turn 2
  new kakao.maps.LatLng(37.52070183791423, 126.88768351702015) //Entrance
];
let line_munrae=new kakao.maps.Polyline({
  map:kkm,
  path:route_munrae,
  strokeOpacity:0.8,
  strokeColor:"var(--color-route-line2)",
  strokeStyle:"dashed",
  strokeWeight:2,
});
let bounds_munrae=calculate_polyline_bounds(line_munrae);

// Route display: Yangpyong
let route_yangpyong=[
  new kakao.maps.LatLng(37.525337054886194, 126.88603390409557), // Exit 2
  new kakao.maps.LatLng(37.525230806644785, 126.88614554477905), //Road start
  new kakao.maps.LatLng(37.52171598001462, 126.88529751693837), //Turn 1
  new kakao.maps.LatLng(37.5213748337489, 126.88748158786863), //Turn 2
  new kakao.maps.LatLng(37.520756986466395, 126.88732387473068), //Turn 3
  new kakao.maps.LatLng(37.52070183791423, 126.88768351702015) //Entrance
];
let line_yangpyong=new kakao.maps.Polyline({
  map:kkm,
  path:route_yangpyong,
  strokeOpacity:0.8,
  strokeColor:"var(--color-route-line5)",
  strokeStyle:"dashed",
  strokeWeight:2,
});
let bounds_yangpyong=calculate_polyline_bounds(line_yangpyong);


directions_munrae.addEventListener("click",()=>{
  //line_munrae.setOptions({});
  //line_yangpyong.setOptions({strokeOpacity:0});
  flash_polyline(
    line_munrae,3000,250,
    {strokeOpacity:1.0,strokeWeight:5,strokeStyle:"solid"},
    {strokeOpacity:0.5,strokeWeight:5,strokeStyle:"solid"},
    {strokeOpacity:1.0,strokeWeight:3,strokeStyle:"dashed"});
  kkm.setBounds(bounds_munrae,50);
  container.scrollIntoView({behavior:"smooth",block:"nearest"});
});
directions_munrae.style.cursor="pointer";
directions_yangpyong.addEventListener("click",()=>{
  //line_yangpyong.setOptions({});
  //line_munrae.setOptions({strokeOpacity:0});
  flash_polyline(
    line_yangpyong,3000,250,
    {strokeOpacity:1.0,strokeWeight:5,strokeStyle:"solid"},
    {strokeOpacity:0.5,strokeWeight:5,strokeStyle:"solid"},
    {strokeOpacity:1.0,strokeWeight:3,strokeStyle:"dashed"});
  kkm.setBounds(bounds_yangpyong,50);
  container.scrollIntoView({behavior:"smooth",block:"nearest"});
});
directions_yangpyong.style.cursor="pointer";


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
// Hide drawing if zoomed out
kakao.maps.event.addListener(kkm, 'zoom_changed', function() {
  let zl=kkm.getLevel();
  if (zl>5.5) drawing1.setVisible(false);
  else drawing1.setVisible(true);
});

function recenter(){
  kkm.jump(positionATM,5,{animate:{duration:500}});
}

// Jump button
mbj.style.display="none";
mbj.addEventListener("click",recenter);
mbj.style.cursor="pointer";
