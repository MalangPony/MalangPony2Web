/*
 * BG Dynamic Texture
 * 
 * 
 * 
 * 
 */

// Module imports
import { Vector2, Vector3 } from "./vectors.js";
import * as Config  from "./config.js";
import * as Graphics  from "./graphics.js";
import * as PerformanceManager from "./perfmanager.js";

// DOM definitions
const wsd = document.getElementById("whole-screen-div");
const canvas_dyntex = document.getElementById("canvas-dyntex");
const cc2d = canvas_dyntex.getContext("2d");

function drawTriangle(ctx,v1,v2,v3,color){
	ctx.save();
	ctx.fillStyle=color;
	ctx.beginPath();
	ctx.moveTo(v1.x,v1.y);
	ctx.lineTo(v2.x,v2.y);
	ctx.lineTo(v3.x,v3.y);
	ctx.closePath();
	ctx.fill();
	ctx.restore();
}

/*
const TRIANGLE_DENSITY=30.0; //Triangles per Megapixel
let triangles=[];


function random_triangle(){
	let res=[];
	for (let i=0;i<100;i++){
		res=[Vector2.random(),Vector2.random(),Vector2.random()];
		let sides=[res[0].subtract(res[1]),res[1].subtract(res[2]),res[2].subtract(res[0])]
		if (sides[0].length()<0.5) continue;
		if (sides[1].length()<0.5) continue;
		if (sides[2].length()<0.5) continue;
		if (Math.abs(sides[0].atan2()-sides[1].atan2())<0.5) continue;
		if (Math.abs(sides[1].atan2()-sides[2].atan2())<0.5) continue;
		if (Math.abs(sides[2].atan2()-sides[0].atan2())<0.5) continue;
		console.log("Generated triangle after "+i+" tries.");
		break;
	}
	
	return res;
}

function spawn_triangles(w,h,count){
	console.log(`SpTri W${w} H${h} C${count}`);
	triangles.length=0;
	for (let i=0;i<count;i++){
		let center = new Vector2(Math.random()*w,Math.random()*h);
		let unscaled_triangle=random_triangle();
		let scaling_factor=30+Math.random()*70;
		let trigroup=[
			center.add(unscaled_triangle[0].multiply(scaling_factor)),
			center.add(unscaled_triangle[1].multiply(scaling_factor)),
			center.add(unscaled_triangle[2].multiply(scaling_factor))
		];
		triangles.push(trigroup);
	}
}

// Delaunay triangulation?

export function animationTick(dt){
	let containerW=wsd.clientWidth;
	if (!containerW) containerW=1; // Check for false-ish values
	let containerH=wsd.clientHeight;
	if (!containerH) containerH=1;
	
	if (canvas_dyntex.width!=containerW)
		canvas_dyntex.width=containerW;
	if (canvas_dyntex.height!=containerH)
		canvas_dyntex.height=containerH;
	
	let w=canvas_dyntex.width;
	let h=canvas_dyntex.height;
  
	let canvas_megapixels = w * h /1000 /1000;
	let triangle_count_target=Math.round(canvas_megapixels*TRIANGLE_DENSITY);
	if (triangles.length != triangle_count_target){
		spawn_triangles(w,h,triangle_count_target);
	}
	
	for (let ti=0; ti<triangles.length;ti++){
		for (let vi=0; vi<3;vi++){
			let v=triangles[ti][vi];
			v=v.add(Vector2.random().multiply(20*dt));
			triangles[ti][vi]=v;
		}
	}
	
	cc2d.clearRect(0,0,w,h);
	for (const tg of triangles){
		drawTriangle(cc2d,tg[0],tg[1],tg[2],"#FFFFFF20");
	}
}
*/


const POINT_DENSITY=100; // Points per Megapixel
// Array of Vector2
let points=[];
// Array of 
let triangles=[];

function spawn_points(w,h,pointcount){
	points.length=0;
	for (let i=0;i<pointcount;i++){
		points.push(new Vector2(Math.random()*w,Math.random()*h));
	}
}
function recalculate_triangulation(){
	triangles.length=0;
	let coords=[];
	for (const p of points){
		coords.push(p.x);
		coords.push(p.y);
	}
	//console.log("RT");
	//console.log(coords);
	let delaunay = new Delaunator(coords);
	//console.log(delaunay.triangles);
	for (let i=0;i<delaunay.triangles.length;i+=3){
		let ax=coords[delaunay.triangles[i]*2];
		let ay=coords[delaunay.triangles[i]*2+1];
		let bx=coords[delaunay.triangles[i+1]*2];
		let by=coords[delaunay.triangles[i+1]*2+1];
		let cx=coords[delaunay.triangles[i+2]*2];
		let cy=coords[delaunay.triangles[i+2]*2+1];
		triangles.push([
			new Vector2(ax,ay),
			new Vector2(bx,by),
			new Vector2(cx,cy)]);
	}
}

export function animationTick(dt){
	let containerW=wsd.clientWidth;
	if (!containerW) containerW=1; // Check for false-ish values
	let containerH=wsd.clientHeight;
	if (!containerH) containerH=1;
	
	if (canvas_dyntex.width!=containerW)
		canvas_dyntex.width=containerW;
	if (canvas_dyntex.height!=containerH)
		canvas_dyntex.height=containerH;
	
	let w=canvas_dyntex.width;
	let h=canvas_dyntex.height;
  
	let canvas_megapixels = w * h /1000 /1000;
	let point_count_target=Math.round(canvas_megapixels*POINT_DENSITY);
	if (points.length != point_count_target){
		spawn_points(w,h,point_count_target);
	}
	
	
	
	for (let i=0; i<points.length;i++){
		let v=points[i];
		v=v.add(Vector2.random().multiply(20*dt));
		points[i]=v;
	}
	
	recalculate_triangulation();
	//console.log(triangles);
	
	cc2d.clearRect(0,0,w,h);
	let i=0;
	for (const tg of triangles){
		i++;
		drawTriangle(cc2d,tg[0],tg[1],tg[2],"rgba(255,255,255,"+((i*4881)%101)/100+")");
	}
}
