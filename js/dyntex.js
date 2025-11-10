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


const pp_triangles={
	velocity_damp:0.01,
	velocity_brownian:30.0,
	return_spring_k:1.0
};
const pp_tvf={
	velocity_damp:0.01,
	velocity_brownian:10.0,
	return_spring_k:0.3
};
function limitVec(v,l){
	if (v.length()>l){
		return v.normalize().multiply(l)
	}else return v;
}
class WigglyPoint{
	#position;
	#velocity;
	#intrinsic_position;
	#pp;
	constructor(pos,physics_parameters){
		this.#position=pos;
		this.#intrinsic_position=pos;
		this.#velocity=Vector2.ZERO;
		this.#pp=physics_parameters;
	}
	tick(dt){
		
		if (dt>0.1) dt=0.1;
		
		let accel=Vector2.ZERO;
		// Damping force
		let speed = this.#velocity.length();
		let velvec=this.#velocity.normalize();
		let damp_force=limitVec(
			velvec.multiply(-speed*speed*this.#pp.velocity_damp),
			speed/dt); // This will zero the speed on this tick - don't overshoot.
		let brownian_force=Vector2.random().multiply(this.#pp.velocity_brownian);
		let displacement=this.#position.subtract(this.#intrinsic_position);
		let return_force=limitVec(
			displacement.multiply(-this.#pp.return_spring_k),
			1000);
		accel = Vector2.ZERO.add(damp_force).add(brownian_force).add(return_force);
		this.#velocity=this.#velocity.add(accel.multiply(dt));
		this.#position = this.#position.add(this.#velocity.multiply(dt));
		
	}
	get position(){
		return this.#position;
	}
	
}

const POINT_DENSITY=100; // Points per Megapixel
// Array of WigglyPoints
let wpoints=[];
// Array of point indices
let triangle_indices=[];
let triangle_visiblity_factors=[];
let last_generated_with_pointcount=-1;

function spawn_points(w,h,pointcount){
	/*
	 * In a perfect hexagonal configuration,
	 * the distance between points will be 
	 * area = (r*sqrt(3)/2)*r/2 = r^2 * sqrt(3) / 4
	 * r^2 = area * 4 / sqrt(3)
	 * r = sqrt(area*4/sqrt(3)) = sqrt(area * 2.309)
	 * area =total_area/N
	 */
	last_generated_with_pointcount=pointcount;
	wpoints.length=0;
	let points=[];
	let area = w*h;
	let ideal_distance = Math.sqrt(area / pointcount * 2.309);
	let distance_threshold = ideal_distance*0.5;
	// O(n^2) algorithm. Probably not a good idea.
	
	
	//pointcount=Math.min(10,pointcount);
	let bailcount=0;
	for (let i=0;i<pointcount;i++){
		
		let trycount=0;
		let candidate;
		while (1){
			trycount++;
			if (trycount>100){
				//console.log("Point spawning bailing out.");
				//console.log(points);
				bailcount++;
				break;
			}
			candidate=new Vector2(Math.random()*w,Math.random()*h);
			let min_dist=Infinity;
			for (const p of points){
				let dist=p.subtract(candidate).length();
				if (dist<min_dist) min_dist=dist;
			}
			if (min_dist>=distance_threshold) break;
		}
		points.push(candidate);
	}
	
	let outer_grid_w=w+ideal_distance*2;
	let outer_grid_h=h+ideal_distance*2;
	let outer_xcount = Math.ceil(outer_grid_w/ideal_distance);
	let outer_ycount=Math.floor(outer_grid_h/ideal_distance);
	for (let xi=-1;xi<(outer_xcount+1);xi++){
		let x=xi*ideal_distance;
		points.push(new Vector2(x,-ideal_distance));
		points.push(new Vector2(x,+ideal_distance));
		//console.log("X "+x);
	}
	for (let yi=0;yi<outer_ycount;yi++){
		let y=yi*ideal_distance;
		points.push(new Vector2(-ideal_distance,y));
		points.push(new Vector2(+ideal_distance,y));
		//console.log("Y "+y);
	}
	
	for (const p of points){
		wpoints.push(new WigglyPoint(p,pp_triangles));
	}
	console.log(`Spawn_points W${w} H${h} PC${pointcount} DT${distance_threshold} BC${bailcount}`);
}
function recalculate_triangulation(){
	triangle_indices.length=0;
	triangle_visiblity_factors.length=0;
	let coords=[];
	for (const p of wpoints){
		coords.push(p.position.x);
		coords.push(p.position.y);
	}
	//console.log("RT");
	//console.log(coords);
	let delaunay = new Delaunator(coords);
	//console.log(delaunay.triangles);
	for (let i=0;i<delaunay.triangles.length;i+=3){
		triangle_indices.push([
			delaunay.triangles[i],
			delaunay.triangles[i+1],
			delaunay.triangles[i+2]
		]);
		triangle_visiblity_factors.push(new WigglyPoint(Vector2.ZERO,pp_tvf));
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
	if (last_generated_with_pointcount != point_count_target){
		spawn_points(w,h,point_count_target);
		recalculate_triangulation();
		for (let i=0;i<100;i++){
			for (const tvf of triangle_visiblity_factors) tvf.tick(0.1);
		}
	}
	
	for (const wp of wpoints){
		wp.tick(dt);
	}
	
	for (const tvf of triangle_visiblity_factors) tvf.tick(dt);
	
	
	/*
	for (let i=0; i<points.length;i++){
		let v=points[i];
		v=v.add(Vector2.random().multiply(20*dt));
		points[i]=v;
	}*/
	
	//recalculate_triangulation();
	//console.log(triangles);
	
	cc2d.clearRect(0,0,w,h);
	for (let i=0;i<triangle_indices.length;i++){
		let tg=triangle_indices[i]
		let tvf=triangle_visiblity_factors[i];
		//console.log(tvf);
		let a=wpoints[tg[0]];
		let b=wpoints[tg[1]];
		let c=wpoints[tg[2]];
		let alpha=tvf.position.x;
		alpha = (alpha-5)/10;
		if (alpha<0) alpha=0;
		if (alpha>1) alpha=1.0;
		alpha=Math.pow(alpha,2);
		//console.log(a.position);
		if (alpha>0.001){
			drawTriangle(cc2d,
				a.position,
				b.position,
				c.position,
				"rgba(255,255,255,"+alpha+")");
		}
	}
}
