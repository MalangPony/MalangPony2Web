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
    yAnchor: 0.0
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
mbj.style.display="none";
mbj.addEventListener("click",()=>{
  kkm.panTo(positionATM);
});

// Hide it here, after initialization
document.getElementById("page-venue").style.display="none";
