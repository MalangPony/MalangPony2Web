/*
 * Important note: The Kakaomap Div MUST be visible at the time of map initialization. 
 * If it is display:none when it is initialized,it behaves in strange ways.
 * That is why we display the #page-venue div for a short while here.
 */
document.getElementById("page-venue").style.display="block";
var positionATM  = new kakao.maps.LatLng(37.520484, 126.887396); 
var container = document.getElementById('kakaomap-content'); 
let mbj=document.getElementById("map-btn-jump");
var options = { 
	center: positionATM, 
	level: 5
};
var kkm = new kakao.maps.Map(container, options);
// Note: Call kkm.relayout() on size changes!

/*
var mapTypeControl = new kakao.maps.MapTypeControl();
kkm.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

var zoomControl = new kakao.maps.ZoomControl();
kkm.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
*/

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

let overlayContent='<div style="margin-top:12px;border:2px solid #F00;background-color:#F88;text-align:center;font-size:16px;">말랑포니 행사 장소<br><strong>올댓마인드</strong></div>'
var customOverlay = new kakao.maps.CustomOverlay({
    map: kkm,
    position: positionATM,
    content: overlayContent,
    xAnchor:0.5,
    yAnchor: 0.0
});

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



let drawing1_html='<img src="sprites-prototype/MPN2-Prototype-Image_MapDrawing_Munrae1.png" style="width:150px;height:150px;">'
var drawing1 = new kakao.maps.CustomOverlay({
    map: kkm,
    position: new kakao.maps.LatLng(37.51852288426295, 126.89547104210291),
    content: drawing1_html,
    xAnchor:0.2,
    yAnchor: 0.8
});

// Display button if venue is too off to the side
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
  //if (llb.contain(positionATM)) mbj.style.display="none";
  if (centeredX && centeredY) mbj.style.display="none";
  else mbj.style.display="flex";
});
kakao.maps.event.addListener(kkm, 'zoom_changed', function() {
  let zl=kkm.getLevel();
    //console.log("ZL",zl);
    if (zl>5.5) drawing1.setVisible(false);
    else drawing1.setVisible(true);
});

mbj.style.display="none";
mbj.addEventListener("click",()=>{
  kkm.panTo(positionATM);
});

// Hide it here, after initialization
document.getElementById("page-venue").style.display="none";
