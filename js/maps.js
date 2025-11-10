/*
 * Handles all KakaoMap logic.
 * 
 */
let page_venue=document.getElementById("page-venue");


//AllThatMind location
var positionATM  = new kakao.maps.LatLng(37.520484, 126.887396); 

// Main container
var container = document.getElementById('kakaomap-content'); 

// Jump to ATM button
let mbj=document.getElementById("map-btn-jump");


var kkm = new kakao.maps.Map(
  container, { 
	center: positionATM, 
	level: 5});

// Note: Call kkm.relayout() on visibility changes!
export function relayout(){
  kkm.relayout();
}

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
  strokeWeight:3,
  strokeColor:"#FF0000",
  strokeOpacity:0.7,
  strokeStyle:"dashed"
});

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
  strokeWeight:3,
  strokeColor:"#0000FF",
  strokeOpacity:0.7,
  strokeStyle:"dashed"
});


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
  let centeredX=(ratioX<0.8) && (ratioX>0.2);
  let centeredY=(ratioY<0.8) && (ratioY>0.2);
  
  if (centeredX && centeredY) mbj.style.display="none";
  else mbj.style.display="flex";
});
// Hide drawing if zoomed out
kakao.maps.event.addListener(kkm, 'zoom_changed', function() {
  let zl=kkm.getLevel();
  if (zl>5.5) drawing1.setVisible(false);
  else drawing1.setVisible(true);
});

// Jump button
mbj.style.display="none";
mbj.addEventListener("click",()=>{
  kkm.panTo(positionATM);
});
