
let container = document.getElementById("internal-map-container");
let image = document.getElementById("internal-map-image");
let canvas = document.getElementById("internal-map-canvas");

const bounds_pixel_basis=3000;
const bounds={
  /*
  main:[
    [1438.123,308.962],
    [495.021,1310.953],
    [1005.406,1649.787],
    [1402.276,1551.636],
    [1793.172,1800.000],
    [2473.400,866.288],
  ],
  lobby:[
    [475.562,1327.711],
    [101.389,1730.853],
    [931.812,2331.944],
    [1477.381,1631.878],
    [1395.304,1578.770],
    [994.577,1672.916],
  ],*/
  sub:[
    [2252.281,1223.909],
    [1820.172,1820.172],
    [2247.453,2097.784],
    [2660.251,1460.483],
  ],
  storage:[
    [2491.269,861.805],
    [2249.867,1199.768],
    [2667.493,1441.170],
    [2819.576,1204.596],
    [2744.742,992.163],
  ],
  gallery:[
    [475.562,1344.610],
    [159.325,1692.229],
    [386.243,1856.382],
    [707.308,1499.107],
  ],
  regDesk:[
    [528.671,1742.923],
    [371.759,1916.733],
    [654.200,2119.510],
    [806.283,1936.045],
  ],
  signboard:[
    [1011.475,1658.432],
    [1028.373,1716.369],
    [1308.399,1651.190],
    [1289.087,1595.668],
  ],
  stage:[
    [1127.348,634.887],
    [854.563,922.156],
    [1074.239,1059.755],
    [1342.196,760.417],
  ],
  control:[
    [1431.514,299.339],
    [1257.705,482.804],
    [1400.132,562.467],
    [1576.356,371.759],
  ],
  vendor:[
    [1711.541,451.422],
    [1624.636,552.811],
    [2257.110,900.430],
    [2344.014,789.385],
  ],
  snack:[
    [1725.747,800.569],
    [1666.003,873.969],
    [1891.323,996.871],
    [1947.653,918.350],
  ],
  seating:[
    [1495.306,681.081],
    [1032.717,1206.828],
    [1252.916,1345.093],
    [1346.800,1235.847],
    [1592.603,1389.474],
    [1874.254,1034.424],
    [1630.157,892.746],
    [1710.384,803.983],
  ],
  rest:[
    [2145.662,894.453],
    [1916.928,1191.465],
    [2091.039,1295.591],
    [2314.652,986.629],
  ],
  drawing:[
    [1797.440,1322.902],
    [1555.050,1638.692],
    [1735.989,1756.473],
    [1978.379,1423.613],
  ],
  shrine:[
    [2073.969,1324.609],
    [1747.938,1773.542],
    [1797.440,1802.561],
    [2125.178,1348.507],
  ],
  restroom:[
    [1295.591,1881.082],
    [1034.424,2219.062],
    [1783.784,2749.930],
    [2031.295,2370.982],
  ],
};

let active_area=null;
function generate_map(image_size){
  let dom_map=document.createElement("map");
  dom_map.setAttribute("name","insidemap-map");
  dom_map.setAttribute("id","insidemap-map");
  for (const k in bounds){
    let coords=bounds[k];
    let dom_area = document.createElement("area");
    dom_area.setAttribute("shape","poly");
    
    let s='';
    for (const c of coords){
      let x=c[0]/bounds_pixel_basis*image_size;
      let y=c[1]/bounds_pixel_basis*image_size;
      s=s+x.toFixed(2)+","+y.toFixed(2)+","
    }
    s=s.substring(0,s.length-1);
    
    dom_area.setAttribute("coords",s);
    dom_area.setAttribute("href","javascript:void(0);");
    
    dom_area.addEventListener("click",(e)=>{
      console.log(k);
      e.preventDefault();
    });
    dom_area.addEventListener("mouseenter",(e)=>{
      active_area=k;
    });
    dom_area.addEventListener("mouseleave",(e)=>{
      active_area=null;
    });
    dom_map.appendChild(dom_area);
  }
  return dom_map;
}

let current_size=0;
function handle_resize(){
  current_size=container.clientWidth
  let existing_map = document.getElementById("insidemap-map")
  if (existing_map) existing_map.remove();
  container.appendChild(generate_map(current_size));
  image.setAttribute("usemap","#insidemap-map");
  canvas.width=current_size;
  canvas.height=current_size;
  active_area=null;
}

let rso = new ResizeObserver(handle_resize);
rso.observe(container);

const sc2d = canvas.getContext("2d");

function update_canvas(){
  bounds_pixel_basis*current_size;
  
  sc2d.clearRect(0,0,current_size,current_size);
  
  
  
  
 
  

  for (const k in bounds){
    sc2d.beginPath();
    let coords=bounds[k];
    let avgX=0;
    let avgY=0;
    for (let i=0;i<coords.length;i++){
      
      let x=coords[i][0]/bounds_pixel_basis*current_size;
      let y=coords[i][1]/bounds_pixel_basis*current_size;
      if (i==0) sc2d.moveTo(x,y);
      else sc2d.lineTo(x,y);
      
      avgX+=x/coords.length;
      avgY+=y/coords.length;
    }
    sc2d.closePath();
    
    sc2d.lineWidth = 2;
    if (k==active_area) sc2d.strokeStyle = "#FF0000FF";
    else sc2d.strokeStyle = "#FF000060";
    sc2d.stroke();
    
    sc2d.fillStyle="#FF000080"
    if (k==active_area) sc2d.fill();
    
    if (k==active_area) sc2d.font="bold 16px NPS";
    else sc2d.font="normal 12px NPS";
    sc2d.textAlign="center";
    
    sc2d.lineWidth = 5;
    sc2d.strokeStyle = "#000000";
    sc2d.strokeText(k,avgX,avgY);
    
    sc2d.fillStyle="#FFFFFF"
    sc2d.fillText(k,avgX,avgY);
  }
}


// This should be called every frame, from main JS.
export function animationTick(dt){
  update_canvas();
}
