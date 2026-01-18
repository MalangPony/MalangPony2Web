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

// Main ATM Marker
let markerSizeMultiplier=0.25;
var markerImage = new kakao.maps.MarkerImage(
  '/sprites/OBJ-004_Outlined_e2_Rsz400.png', 
  new kakao.maps.Size(400*markerSizeMultiplier, 400*markerSizeMultiplier), 
  {offset: new kakao.maps.Point(140*markerSizeMultiplier, 370*markerSizeMultiplier)});
var marker = new kakao.maps.Marker({
    position: positionATM,
    image:markerImage,
    zIndex:5
});
marker.setMap(kkm);

// Overlay below marker
let overlayContent='<div class="atm-label-overlay"><span class="lang-ko">말랑포니 행사 장소</span><span class="lang-en">MalangPony Venue</span><br><strong><span class="lang-ko">올댓마인드</span><span class="lang-en">AllThatMind</span></strong></div>'
var placeLabel = new kakao.maps.CustomOverlay({
    map: kkm,
    position: positionATM,
    content: overlayContent,
    xAnchor:0.5,
    yAnchor: 0.0,
    zIndex:4
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
    color:"var(--color-route-icn)",
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
    color:"var(--color-route-gmp)",
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
      {point:MapData.point_XBT9,ko:"서울고속버스터미널",en:"Seoul Express Bus Terminal"},
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
        yAnchor: topalign? 0.0 : 1.0,
        zIndex:1
    });
    if (route.shown) overlay.setMap(kkm);
    route.wp_overlays.push(overlay);
  }
}


/* ZL>7 not shown
 * ZL=7 not shown
 * ZL=6 small
 * ZL=5 medium
 * ZL=4 big
 * ZL<4 huge
 */

function generate_drawing_html(dat,size){
  let src=dat.src;
  let aspect=dat.aspect;
  let height=dat[size].height;
  return '<img src="'+src+'" class="station-drawings" style="height:'+height+'px;aspect-ratio:'+aspect+'">';
}

// Drawing #1, near Munrae station
let drawing1_data={
  src:"/sprites/DRW-001-B_Outline50px-ResizeH500.png",
  aspect:0.79,
  small:{
    height:90,
    location:new kakao.maps.LatLng(37.518522, 126.895471)
  },
  medium:{
    height:120,
    location:new kakao.maps.LatLng(37.518522, 126.895471)
  },
  big:{
    height:180,
    location:new kakao.maps.LatLng(37.518522, 126.895471)
  },
  huge:{
    height:240,
    location:new kakao.maps.LatLng(37.518522, 126.895471)
  }
}

var drawing1 = new kakao.maps.CustomOverlay({
    map: kkm,
    position: drawing1_data.medium.location,
    content: generate_drawing_html(drawing1_data,"medium"),
    xAnchor:0.0,
    yAnchor: 1.0,
    zIndex:2
});

// Drawing #2, near Yangpyeong station
let drawing2_data={
  src:"/sprites/DRW-001-A_Outline50px-ResizeH500.png",
  aspect:1.0,
  small:{
    height:80,
    location:new kakao.maps.LatLng(37.526027, 126.886602)
  },
  medium:{
    height:110,
    location:new kakao.maps.LatLng(37.525827, 126.886602)
  },
  big:{
    height:160,
    location:new kakao.maps.LatLng(37.525715, 126.886432)
  },
  huge:{
    height:220,
    location:new kakao.maps.LatLng(37.525715, 126.886432)
  }
}
var drawing2 = new kakao.maps.CustomOverlay({
    map: kkm,
    position: drawing2_data.medium.location,
    content: generate_drawing_html(drawing2_data,"medium"),
    xAnchor:0.0,
    yAnchor: 1.0,
    zIndex:2
});


// Markers of previous locations
function generate_previous_marker_content(desc_en,desc_ko,date,src,compact){
  let previous_marker_content="";
  if (compact)
    previous_marker_content+='<div class="previous-marker-container compact">';
  else
    previous_marker_content+='<div class="previous-marker-container">';
  
  previous_marker_content+=  '<img src="'+src+'" class="previous-marker-image">';
  previous_marker_content+=  '<div class="previous-marker-texts">';
  previous_marker_content+=    '<div class="previous-marker-description">';
  previous_marker_content+=      '<span class="lang-en">'+desc_en+'</span>';
  previous_marker_content+=      '<span class="lang-ko">'+desc_ko+'</span>';
  previous_marker_content+=    '</div>';
  previous_marker_content+=    '<div class="previous-marker-date">'+date+'</div>';
  previous_marker_content+=  '</div>';
  previous_marker_content+=  '<div class="previous-marker-arrow">arrow_drop_down</div>';
  previous_marker_content+='</div>';
  return previous_marker_content;
}

let marker_mpn1_content_compact=generate_previous_marker_content(
      "MalangPony 1","말랑포니 1","2025-02-15",
      "sprites/MPN_Twtr_Header_var1_VECTORIZE_rev6_SS-NoBGCrop_300_RszW300+Expand+Shadow1.png",
      true);
let marker_mpn1_content_expanded=generate_previous_marker_content(
      "MalangPony 1","말랑포니 1","2025-02-15",
      "sprites/MPN_Twtr_Header_var1_VECTORIZE_rev6_SS-NoBGCrop_300_RszW300+Expand+Shadow1.png",
      false);
let marker_mpn1 = new kakao.maps.CustomOverlay({
    map: kkm,
    position: array_to_latlng(MapData.point_GreenLounge),
    content: marker_mpn1_content_expanded,
    xAnchor:0.5,
    yAnchor: 1.0,
    zIndex:4
});

let marker_mpnL_content_compact=generate_previous_marker_content(
      "MalangLittlePony","말랑리틀포니","2025-08-23",
      "sprites/MPN_LogoV2L_PNG-400dpi-NoBG_RszW300+Expand+Shadow1.png",
      true);
let marker_mpnL_content_expanded=generate_previous_marker_content(
      "MalangLittlePony","말랑리틀포니","2025-08-23",
      "sprites/MPN_LogoV2L_PNG-400dpi-NoBG_RszW300+Expand+Shadow1.png",
      false);
let marker_mpnL = new kakao.maps.CustomOverlay({
    map: kkm,
    position: array_to_latlng(MapData.point_EpisodeDaejeon),
    content: marker_mpnL_content_expanded,
    xAnchor:0.5,
    yAnchor: 1.0,
    zIndex:4
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
function zoom_change(){
  let zl=kkm.getLevel();
  
  if (zl>6.5){ // ZL=7+ (very far)
    drawing1.setVisible(false);
    drawing2.setVisible(false);
  } else if (zl>5.5){ //ZL=6 (small)
    drawing1.setVisible(true);
    drawing2.setVisible(true);
    drawing1.setContent(generate_drawing_html(drawing1_data,"small"));
    drawing2.setContent(generate_drawing_html(drawing2_data,"small"));
    drawing1.setPosition(drawing1_data.small.location);
    drawing2.setPosition(drawing2_data.small.location);
  } else if (zl>4.5){ //ZL=5 (medium)
    drawing1.setVisible(true);
    drawing2.setVisible(true);
    drawing1.setContent(generate_drawing_html(drawing1_data,"medium"));
    drawing2.setContent(generate_drawing_html(drawing2_data,"medium"));
    drawing1.setPosition(drawing1_data.medium.location);
    drawing2.setPosition(drawing2_data.medium.location);
  } else if (zl>3.5){ //ZL=4 (big)
    drawing1.setVisible(true);
    drawing2.setVisible(true);
    drawing1.setContent(generate_drawing_html(drawing1_data,"big"));
    drawing2.setContent(generate_drawing_html(drawing2_data,"big"));
    drawing1.setPosition(drawing1_data.big.location);
    drawing2.setPosition(drawing2_data.big.location);
  } else { //ZL=3- (huge)
    drawing1.setVisible(true);
    drawing2.setVisible(true);
    drawing1.setContent(generate_drawing_html(drawing1_data,"huge"));
    drawing2.setContent(generate_drawing_html(drawing2_data,"huge"));
    drawing1.setPosition(drawing1_data.huge.location);
    drawing2.setPosition(drawing2_data.huge.location);
  }
  
  if (zl>5.5){
    marker_mpn1.setContent(marker_mpn1_content_compact);
    marker_mpnL.setContent(marker_mpnL_content_compact);
  }else{
    marker_mpn1.setContent(marker_mpn1_content_expanded);
    marker_mpnL.setContent(marker_mpnL_content_expanded);
  }

  placeLabel.setVisible( (zl>4.5) && (zl<6.5) ); //Onlt ZL=5,6
  
  for (const k in routes){
    let route=routes[k];
    if (route.zl_max && route.shown){
      if (zl>route.zl_max) route.polyline.setMap(null);
      else route.polyline.setMap(kkm);
    }
  }
}
zoom_change();
kakao.maps.event.addListener(kkm, 'zoom_changed', zoom_change);

export function recenter(){
  kkm.jump(positionATM,5,{animate:{duration:500}});
}

// This must be called after a language change!
// Since kakaomap seems to calculate the element size only when
// an overlay is added, changing the inner text will misalign the overlay.
// So here, all content with text in them gets "refreshed" so that the
// element size is re-calculated and gets aligned correctly.
export function lang_changed(){
  for (const k in routes){
    let route=routes[k];
    for (const wpo of route.wp_overlays){
      if (route.shown) {
        //wpo.setMap(null);
        //wpo.setMap(kkm);
        wpo.setContent(wpo.getContent());
      }
    }
  }
  //placeLabel.setMap(null);
  //placeLabel.setMap(kkm);
  placeLabel.setContent(placeLabel.getContent());
}
lang_changed();

// Jump button
mbj.style.display="none";
mbj.addEventListener("click",recenter);
mbj.style.cursor="pointer";
