
// Draw a glowing circle in the canvas.
// c2d: Canvas 2D context
// x,y: the center of the circle.
// color_inner: circle color
// color_glow: the glow color
// color_edge: the color of the edge of the glow. Should have an alpha of 0.
// radius: the base radius of the circle.
// border_feather: the edge of the circle will be faded by this amount.
// glor_radius: the radius of the glow.
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

  gradient.addColorStop(stop1,color_inner);
  gradient.addColorStop(stop2,color_glow);
  gradient.addColorStop(stop3,color_edge);
    
  c2d.fillStyle=gradient;
  c2d.beginPath();
  c2d.arc(x,y,total_r,0,2*Math.PI);
  c2d.fill();
}
