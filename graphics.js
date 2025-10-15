

export function draw_glowing_circle(
    c2d,
    x,y,
    color_inner,color_glow,color_edge,
    radius,border_feather,glow_radius){

  const total_r=radius+glow_radius;
  
  const gradient=c2d.createRadialGradient(
    x,y,0,
    x,y,total_r);
  let stop1=(radius-border_feather)/total_r;
  let stop2=(radius+border_feather)/total_r;
  let stop3=1.0;
  //console.log(color_inner);
  gradient.addColorStop(stop1,color_inner);
  //console.log(color_glow);
  gradient.addColorStop(stop2,color_glow);
  //console.log(color_edge);
  gradient.addColorStop(stop3,color_edge);
    
  c2d.fillStyle=gradient;
  c2d.beginPath();
  c2d.arc(x,y,total_r,0,2*Math.PI);
  c2d.fill();
}
