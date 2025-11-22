/*
 * Handles all KakaoMap logic.
 * 
 */

import * as MapData from "./map_data.js";

let page_venue=document.getElementById("page-venue");

let directions_munrae = document.getElementById("directions-munrae");
let directions_yangpyong = document.getElementById("directions-yangpyong");
let directions_bus = document.getElementById("directions-bus");
let directions_icn = document.getElementById("directions-icn");
let directions_gmp = document.getElementById("directions-gmp");
let directions_railway = document.getElementById("directions-railway");
let directions_gsbus = document.getElementById("directions-gsbus");

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
function concatenate_route(...a){
  if (a.length==1) {
    return a[0];
  }
  let end_trimmed=a[0].slice(0,a[0].length-1);
  let args_rest=a.slice(1);
  let recursive_retval=concatenate_route(...args_rest);
  return end_trimmed.concat(recursive_retval);
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
let overlayContent='<div class="atm-label-overlay">말랑포니 행사 장소<br><strong>올댓마인드</strong></div>'
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
    waypoints:[],
    color:"var(--color-route-line2)",
    focus_button:directions_munrae,
    zl_max:6.5,
    shown_by_default:true
  },
  yangpyong:{
    points:MapData.route_YangpyeongToATM,
    waypoints:[],
    color:"var(--color-route-line5)",
    focus_button:directions_yangpyong,
    zl_max:6.5,
    shown_by_default:true
  },
  bus:{
    points:MapData.route_B641ToATM,
    waypoints:[
      {point:MapData.point_BusStopA,ko:"영문초등학교 정류장",en:"Bus Stop"},
      {point:MapData.point_BusStopB,ko:"영문초등학교 정류장",en:"Bus Stop",topalign:true},
    ],
    color:"var(--color-route-bluebus)",
    focus_button:directions_bus,
    zl_max:6.5,
    shown_by_default:false
  },
  icn:{
    points:concatenate_route(
      MapData.route_ICN2GMP,
      MapData.route_GMP2Yangpyeong,
      MapData.route_YangpyeongToATM,
    ),
    waypoints:[
      {point:MapData.point_ICN1,ko:"인천국제공항 1터미널",en:"ICN Terminal 1",topalign:true},
      {point:MapData.point_ICN2,ko:"인천국제공항 2터미널",en:"ICN Terminal 2"},
      {point:MapData.point_GMP,ko:"환승",en:"Transfer"},
    ],
    color:"var(--color-route-airport)",
    focus_button:directions_icn,
    zl_max:null,
    shown_by_default:false
  },
  gmp:{
    points:concatenate_route(
      MapData.route_GMP2Yangpyeong,
      MapData.route_YangpyeongToATM,
    ),
    waypoints:[
      {point:MapData.point_GMP,ko:"김포공항",en:"GMP"},
    ],
    color:"var(--color-route-airport)",
    focus_button:directions_gmp,
    zl_max:null,
    shown_by_default:false
  },
  xbt:{
    points:concatenate_route(
      MapData.route_ExBusTermToYeoido,
      MapData.route_YeoidoToYangpyeong,
      MapData.route_YangpyeongToATM,
    ),
    waypoints:[
      {point:MapData.point_EBT9,ko:"서울고속버스터미널",en:"Seoul Express Bus Terminal"},
      {point:MapData.point_Yeoido,ko:"환승",en:"Transfer"},
    ],
    color:"var(--color-route-gsbus)",
    focus_button:directions_gsbus,
    zl_max:null,
    shown_by_default:false
  },
  railway:{
    points:concatenate_route(
      MapData.route_SeoulStnToShindorim,
      MapData.route_ShindorimToMunrae,
      MapData.route_MunraeToATM,
    ),
    waypoints:[
      {point:MapData.point_SeoulStn,ko:"서울역",en:"Seoul Station"},
      {point:MapData.point_Yongsan,ko:"용산역",en:"Yongsan Station"},
      {point:MapData.point_Shindorim,ko:"환승",en:"Transfer"},
    ],
    color:"var(--color-route-railway)",
    focus_button:directions_railway,
    zl_max:null,
    shown_by_default:false
  }
};

for (const k in routes){
  let route=routes[k];
  route.polyline=new kakao.maps.Polyline({
    path:convert_to_polyline_path(route.points),
    strokeOpacity:0.7,
    strokeColor:route.color,
    strokeStyle:"dashed",
    strokeWeight:4,
  });
  if (route.shown_by_default){
    route.polyline.setMap(kkm)
    route.shown=true;
  }else{
    route.shown=false;
  }
  route.bounds=calculate_polyline_bounds(route.polyline);
  route.focus_button.addEventListener("click",()=>{
    for (const otherK in routes){
      if (k==otherK) continue;
      let otherRoute=routes[otherK];
      for (const wpo of otherRoute.wp_overlays) wpo.setMap(null);
      otherRoute.polyline.setMap(null);
      otherRoute.shown=false;
    }
    route.polyline.setMap(kkm);
    route.shown=true;
    for (const wpo of route.wp_overlays) wpo.setMap(kkm);
    flash_polyline(
      route.polyline,3000,250,
      {strokeOpacity:1.0,strokeWeight:6,strokeStyle:"solid"},
      {strokeOpacity:0.5,strokeWeight:6,strokeStyle:"solid"},
      {strokeOpacity:0.7,strokeWeight:4,strokeStyle:"dashed"});
    kkm.setBounds(route.bounds,50);
    container.scrollIntoView({behavior:"smooth",block:"nearest"});
  });
  route.focus_button.style.cursor="pointer";
  route.wp_overlays=[];
  
  for (const wp of route.waypoints){
    let topalign=!!wp.topalign; // Convert undefined to false
    let overlay_content="";
    overlay_content+='<div class="route-waypoint-container">';
     if (topalign)
      overlay_content+='<div class="route-waypoint-arrow">arrow_drop_up</div>';
    overlay_content+=  '<div class="route-waypoint-text">';
    overlay_content+=    '<span class="lang-en">'+wp.en+'</span>';
    overlay_content+=    '<span class="lang-ko">'+wp.ko+'</span>';
    overlay_content+=  '</div>';
    if (!topalign)
      overlay_content+='<div class="route-waypoint-arrow">arrow_drop_down</div>';
    overlay_content+='</div>';
    let overlay= new kakao.maps.CustomOverlay({
        position: array_to_latlng(wp.point),
        content: overlay_content,
        xAnchor:0.5,
        yAnchor: topalign? 0.0 : 1.0
    });
    if (route.shown) overlay.setMap(kkm);
    route.wp_overlays.push(overlay);
  }
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
  
  for (const k in routes){
    let route=routes[k];
    if (route.zl_max && route.shown){
      if (zl>route.zl_max) route.polyline.setMap(null);
      else route.polyline.setMap(kkm);
    }
  }
  
});

function recenter(){
  kkm.jump(positionATM,5,{animate:{duration:500}});
}

// Jump button
mbj.style.display="none";
mbj.addEventListener("click",recenter);
mbj.style.cursor="pointer";
