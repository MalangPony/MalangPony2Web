/*
 * BG DYNamic TEXture
 * aka, the pretty triangles.
 * 
 * Generates a random mesh-like graphic using delaunay triangulation.
 */

// Module imports
import { Vector2, Vector3 } from "./vectors.js";
import * as Config  from "./config.js";
import {drawTriangle}  from "./graphics.js";
import * as PerformanceManager from "./perfmanager.js";
import { save_canvas_to_file } from "./utils.js";
import * as Global from "./global.js";

// DOM definitions
const wsd = document.getElementById("whole-screen-div");
const canvas_dyntex = document.getElementById("canvas-dyntex");
const cc2d = canvas_dyntex.getContext("2d");


// Physics Parameters.
const pp_triangles={ // For the actual triangles
	velocity_damp:0.01,
	velocity_brownian:30.0,
	return_spring_k:1.0
};
const pp_tvf={ // For the triangle colors (TriangleVisibilityFactor)
	velocity_damp:0.01,
	velocity_brownian:10.0,
	return_spring_k:0.3
};

// Limit Vector to a length
function limitVec(v,l){
	if (v.length()>l){
		return v.normalize().multiply(l)
	}else return v;
}

// Simulates a point mass that follows
// Newtonian motion, Brownian motion, and drag.
class WigglyPoint{
	// Current position. Units are in Pixels.
	#position;
	// Current velocity. Pixels per Second.
	#velocity;
	// Base position. 
	// The particle will feel a returning force towards this point.
	#intrinsic_position;
	// Physics Parameters
	#pp;
	
	constructor(pos,physics_parameters){
		this.#position=pos;
		this.#intrinsic_position=pos;
		this.#velocity=Vector2.ZERO;
		this.#pp=physics_parameters;
	}
	
	// Should be called every animation tick.
	tick(dt){
		
		if (dt>0.1) dt=0.1;
		
		
		
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
		
		// Accumulate all forces
		let accel=Vector2.ZERO;
		accel = Vector2.ZERO.add(damp_force).add(brownian_force).add(return_force);
		
		// Physics step
		this.#velocity=this.#velocity.add(accel.multiply(dt));
		this.#position = this.#position.add(this.#velocity.multiply(dt));
	}
	get position(){
		return this.#position;
	}
	
}

const POINT_DENSITY=50; // Points per Megapixel

// Array of WigglyPoints
let wpoints=[];
// Array of point indices
let triangle_indices=[];
// Array of WigglyPoints. The coordinates are used as triangle colors.
let triangle_visiblity_factors=[];

let last_generated_with_pointcount=-1;

// Generate a somewhat uniformly spread out array of 2D WigglyPoints.
function spawn_points(w,h,pointcount){
	
	last_generated_with_pointcount=pointcount;
	wpoints.length=0;
	let points=[];
	let area = w*h;
	
	/*
	 * In a perfect hexagonal configuration,
	 * the distance between points will be 
	 * area = (r*sqrt(3)/2)*r/2 = r^2 * sqrt(3) / 4
	 * r^2 = area * 4 / sqrt(3)
	 * r = sqrt(area*4/sqrt(3)) = sqrt(area * 2.309)
	 * area =total_area/N
	 */
	let ideal_distance = Math.sqrt(area / pointcount * 2.309);
	let distance_threshold = ideal_distance*0.5;
	
	// O(n^3) algorithm. (I think?) Probably not a good idea.
	// Generates an array of random points.
	// If the point is too close to an existing point, reroll.
	let bailcount=0;
	for (let i=0;i<pointcount;i++){
		let trycount=0;
		let candidate;
		while (1){
			trycount++;
			if (trycount>100){ // Completely arbitrary threshold.
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
	
	// Generate some points outside the screen.
	// Without these, the delaunay triangulation will not reach the screen edges.
	// The points will be ideal_distance away from the screen edge,
	// with each point being ideal_distance from each other.
	let outer_grid_w=w+ideal_distance*2;
	let outer_grid_h=h+ideal_distance*2;
	let outer_xcount = Math.ceil(outer_grid_w/ideal_distance);
	let outer_ycount=Math.floor(outer_grid_h/ideal_distance);
	for (let xi=-1;xi<(outer_xcount+1);xi++){
		let x=xi*ideal_distance;
		points.push(new Vector2(x,-ideal_distance));
		points.push(new Vector2(x,+ideal_distance));
	}
	for (let yi=0;yi<outer_ycount;yi++){
		let y=yi*ideal_distance;
		points.push(new Vector2(-ideal_distance,y));
		points.push(new Vector2(+ideal_distance,y));
	}
	
	// Convert the points to a WigglePoint
	for (const p of points){
		wpoints.push(new WigglyPoint(p,pp_triangles));
	}
	
	console.log(`Spawn_points W${w} H${h} PC${pointcount} DT${distance_threshold} BC${bailcount}`);
}

// Perform delaunay triangulation.
// Delaunator library does all the work.
// Also initializes the triangle_visiblity_factors array.
function recalculate_triangulation(){
	triangle_indices.length=0;
	triangle_visiblity_factors.length=0;
	let coords=[];
	let coordsV=[];
	for (const p of wpoints){
		coords.push(p.position.x);
		coords.push(p.position.y);
		coordsV.push(p.position);
	}
	
	let delaunay = new Delaunator(coords);
	
	for (let i=0;i<delaunay.triangles.length;i+=3){
		let indexA=delaunay.triangles[i];
		let indexB=delaunay.triangles[i+1];
		let indexC=delaunay.triangles[i+2];
		
		if (Config.REJECT_UGLY_TRIANGLES){
			// An 'Ugly Triangle' is a triangle with a too acute inner angle.
			let angle_thresh_radians=Config.UGLY_TRIANGLE_THRESHOLD_ANGLE_DEGREES/180*Math.PI;
			let pointA=coordsV[indexA];
			let pointB=coordsV[indexB];
			let pointC=coordsV[indexC];
			let angleA=Vector2.angleBetween(
				pointB.subtract(pointA),
				pointC.subtract(pointA));
			let angleB=Vector2.angleBetween(
				pointA.subtract(pointB),
				pointC.subtract(pointB));
			let angleC=Vector2.angleBetween(
				pointA.subtract(pointC),
				pointB.subtract(pointC));
			
			let ugly=false;
			if (angleA<angle_thresh_radians) ugly=true;
			if (angleB<angle_thresh_radians) ugly=true;
			if (angleC<angle_thresh_radians) ugly=true;
			//if (!ugly) continue;
			if (ugly) continue;
		}
		
		triangle_indices.push([indexA,indexB,indexC]);
		triangle_visiblity_factors.push(new WigglyPoint(Vector2.ZERO,pp_tvf));
	}
}


// Functions for image export
let canvas_oversample=1.0;
export function set_canvas_oversample(n){
  canvas_oversample=n;
}
export function save_dyntex_to_file(){
  save_canvas_to_file(canvas_dyntex);
}
let time_multiplier=1.0;
export function set_time_multiplier(f){
  time_multiplier=f;
}

Global.add_animated_listener(()=>{
	if (!Global.animated) {
		cc2d.clearRect(0,0,canvas_dyntex.width,canvas_dyntex.height);
	}
});
export function animationTick(dt){
	// Canvas resize handle
	let containerW=wsd.clientWidth;
	if (!containerW) containerW=1; // Check for false-ish values
	let containerH=wsd.clientHeight;
	if (!containerH) containerH=1;
	
	let logicalW=containerW;
	let logicalH=containerH;
	let pixelW=Math.round(logicalW*canvas_oversample);
	let pixelH=Math.round(logicalH*canvas_oversample);
	
	if ((canvas_dyntex.width!=pixelW) || (canvas_dyntex.height!=pixelH)){
		canvas_dyntex.width=pixelW;
		canvas_dyntex.height=pixelH;
		canvas_dyntex.style.height=containerH+"px";
		canvas_dyntex.style.width=containerW+"px";
	}
	
	// Recalculate everything if canvas changed
	let canvas_megapixels = logicalW * logicalH /1000 /1000;
	let point_count_target=Math.round(canvas_megapixels*POINT_DENSITY);
	if (last_generated_with_pointcount != point_count_target){
		spawn_points(logicalW,logicalH,point_count_target);
		recalculate_triangulation();
		for (let i=0;i<100;i++){
			for (const tvf of triangle_visiblity_factors) tvf.tick(0.1);
		}
	}
	
	if (!Global.animated) return;
	
	
	// Tick all WigglyPoints
	for (const wp of wpoints)
		wp.tick(dt*time_multiplier);
	
	// Tick all TVFs
	for (const tvf of triangle_visiblity_factors) 
		tvf.tick(dt*time_multiplier);
	
	cc2d.clearRect(0,0,pixelW,pixelH);
	cc2d.save();
	cc2d.scale(canvas_oversample,canvas_oversample);
	// Draw all triangles.
	// The X coordinates of the TriangleVisibilityFactor array
	// is used to generate the triangle's alpha value.
	for (let i=0;i<triangle_indices.length;i++){
		let tg=triangle_indices[i]
		let tvf=triangle_visiblity_factors[i];
		//console.log(tvf);
		let a=wpoints[tg[0]];
		let b=wpoints[tg[1]];
		let c=wpoints[tg[2]];
		let alpha=tvf.position.x;
		alpha = (alpha-4.5)/20.0;
		//alpha=0.5+(i*7%13)/12*0.5;
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
	cc2d.restore();
}
