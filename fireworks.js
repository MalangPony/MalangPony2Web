import { Vector2, Vector3 } from "./vectors.js";
import * as Config  from "./config.js";
import * as Graphics  from "./graphics.js";

const wsd = document.getElementById("whole-screen-div");
const canvas_fireworks = document.getElementById("canvas-fireworks");
const debug_print_particles=document.getElementById("debug-print-particles");

class EntityPhysicsParameters{
  drag_coefficient_linear=0.0;
  drag_coefficient_quadratic=0.0;
  gravity=0.0;
}

class Entity{
  // Postion. Unit: Pixels.
  position = new Vector2();
  // Velocity. Unit: px/sec
  velocity = new Vector2();
  // Drag cofficients. Acceleration = Drag. Coeff * v^2
  drag_coefficient_linear = 0;
  drag_coefficient_quadratic = 0;
  // Gravitational acceleration towards +Y direction. px/s^2
  gravity = 0;
  constructor(){
    
  }
  tick(dt){
    if (isNaN(this.position.x)) return;
    //console.log("V1 "+this.velocity);
    //console.log("P1 "+this.position);
    let speed = this.velocity.length();
    let drag_force = 
      this.drag_coefficient_linear*speed+
      this.drag_coefficient_quadratic*speed*speed;
    let final_speed = speed - drag_force*dt;
    // Do not decelerate below zero speed.
    if (final_speed < 0) final_speed=0;
    //console.log("DT "+dt);
    //console.log("FS "+final_speed);
    //console.log("V2 "+this.velocity);
    //console.log("P2 "+this.position);
    //console.log("LE "+this.velocity.length());
    //console.log("NR "+this.velocity.normalize());
    this.velocity=this.velocity.normalize().multiply(final_speed);
    //console.log("V3 "+this.velocity);
    //console.log("P3 "+this.position);
    this.velocity=this.velocity.add(new Vector2(0,+this.gravity*dt));
    //console.log("V4 "+this.velocity);
    //console.log("P4 "+this.position);
    this.position=this.position.add(this.velocity.multiply(dt));
    //console.log("V5 "+this.velocity);
    //console.log("P5 "+this.position);
    
  }
  alive(){
    return true;
  }
  render(c2d){
    cs.context.fillStyle="#FF0000";
    let draw_position = this.position.add(c2d.offset);
    cs.context.fillRect(draw_position.x-2,draw_position.y-2,5,5);
  }
}



class GlowingCircleEntity extends Entity{
  radius;
  inner_color;
  border_feather;
  glow_color;
  glow_radius;
  edge_color;
  life_size_power=1.0
  #life_fade=false;
  #lifetime;
  #remaining_life;
  set lifetime(t){
    this.#life_fade=true;
    this.#lifetime=t;
    this.#remaining_life=t;
  }
  tick(dt){
    super.tick(dt);
    if (this.#life_fade) this.#remaining_life-=dt;
  }
  alive(){
    if (this.#life_fade && this.#remaining_life<=0) return false;
    return true;
  }
  render(cs){
    let draw_position = this.position.add(cs.offset);
    
    let size_multiplier=1.0;
    if (this.#life_fade) size_multiplier=Math.pow(
      this.#remaining_life/this.#lifetime,
      this.life_size_power);
    //console.log("RL "+this.#remaining_life+" | SM "+size_multiplier);
    
    Graphics.draw_glowing_circle(
      cs.context,
      draw_position.x,draw_position.y,
      this.inner_color,this.glow_color,this.edge_color,
      this.radius*size_multiplier,
      this.border_feather*size_multiplier,
      this.glow_radius*size_multiplier
    );
  }
}
class FireworkEntity extends GlowingCircleEntity{
  fuze_seconds;
  distance_travelled_without_particle=0;
  tick(dt){
    let old_position = this.position;
    super.tick(dt);
    let new_position=this.position;
    
    if (this.distance_travelled_without_particle>1000) //failsafe
      this.distance_travelled_without_particle=0
    
    if (this.fuze_seconds<0) return;
    this.fuze_seconds-=dt;
    if (this.fuze_seconds<0) {
      spawn_firework_burst(this.position,this.velocity);
    }else{
      // We are traveling - spawn some trail particles!
      this.distance_travelled_without_particle+=
        old_position.subtract(new_position).length();
      let particleN=0;
      while (this.distance_travelled_without_particle>0){
        this.distance_travelled_without_particle-=5;
        let e=new GlowingCircleEntity();
        e.position=new_position.subtract(old_position).multiply(Math.random()).add(old_position);
        let exhaust_velocity=this.velocity.normalize().multiply(-1*100);
        e.velocity=Vector2.random().multiply(150).add(exhaust_velocity);
        e.drag_coefficient_quadratic=0.1;
        e.gravity=PARTICLE_PHYSICS_GRAVITY;
        e.radius=0;
        e.lifetime=1.0;
        e.life_size_power=3.0;
        e.inner_color="#FFFFFF";
        e.border_feather=0;
        e.glow_color="#FFFFFF";
        e.glow_radius=5;
        e.edge_color="#FFFFFF00";
        entity_array.push(e);
      }
    }
  }
  alive(){
    return this.fuze_seconds>=0;
  }
}

let entity_array=[];

function offset_all_entities(dx,dy){
  for (const e of entity_array){
    e.position = e.position.add(new Vector2(dx,dy));
  }
}

let last_explosion_location=new Vector2();
const PARTICLE_PHYSICS_GRAVITY=300;
function spawn_firework_rocket(){
  let h=canvas_fireworks.height;
  let w=canvas_fireworks.width;
  
  let planned_explosion_X=0;
  let planned_explosion_Y=0;
  let avoidance_thresh=Math.min(h,w)*0.3;
  //let avoidance_thresh=w*0.5;
  for (let i=0;i<10;i++){
    planned_explosion_X=Math.random()*w;
    planned_explosion_Y=Math.random()*0.5*h;
    let explosion_candidate=new Vector2(planned_explosion_X,planned_explosion_Y);
    let distance=last_explosion_location.subtract(explosion_candidate).length();
    //console.log(distance);
    if (distance>avoidance_thresh) {
      last_explosion_location=explosion_candidate;
      break;
    }
  }
  
  let explosion_height=h-planned_explosion_Y;
  let seconds_to_apogee = Math.sqrt(explosion_height*2/PARTICLE_PHYSICS_GRAVITY);
  let vy=seconds_to_apogee*PARTICLE_PHYSICS_GRAVITY
  let fuze=seconds_to_apogee-Math.random()*0.5;
  
  
  let px = 0;
  let py = h;
  let vx=0;
  while (1){
    vx=(Math.random()*2-1)*100;
    px=planned_explosion_X-vx*fuze;
    if (px>0 && px<w){
      break;
    }
  }
  
  
  let e= new FireworkEntity();
  e.position=new Vector2(px,py);
  e.velocity=new Vector2(vx,-vy);
  e.gravity=PARTICLE_PHYSICS_GRAVITY;
  e.fuze_seconds=fuze;
  e.lifetime=fuze+0.01;
  e.radius=20;
  e.life_size_power=0.5;
  e.inner_color="#FFFFFF";
  e.border_feather=5;
  e.glow_color="#FF0000";
  e.glow_radius=30;
  e.edge_color="#FF000000";
  
  entity_array.push(e);
}

let firework_burst_callbacks=[];
export function add_burst_callback(f){
	firework_burst_callbacks.push(f);
}

function spawn_firework_burst(center=null,initial_velocity=null){
  if (location===null){
    center=new Vector2(Math.random()*600,Math.random()*300);
  }
  if (initial_velocity===null){
    initial_velocity=new Vector2(0,0);
  }
  for (let i=0;i<50;i++){
    let e=new GlowingCircleEntity();
    e.position=center.add(Vector2.random().multiply(30));
    e.velocity=Vector2.random().multiply(1000).add(initial_velocity);
    e.drag_coefficient_quadratic=0.010;
    e.gravity=PARTICLE_PHYSICS_GRAVITY;
    e.radius=10;
    e.lifetime=2.0;
    e.life_size_power=3.0;
    e.inner_color="#FFFFFF";
    e.border_feather=2;
    e.glow_color="#00FF00";
    e.glow_radius=10;
    e.edge_color="#00FF0000";
    entity_array.push(e);
  }
  for (const f of firework_burst_callbacks){
    f();
	}
}

class CanvasState{
  context;
  width;
  height;
  offset=new Vector2();
}

const fc2d = canvas_fireworks.getContext("2d");
let cs = new CanvasState();
cs.context=fc2d;
cs.offset=new Vector2(0,0);
function refresh_fireworks_canvas(dt){
  let w=canvas_fireworks.width;
  let h=canvas_fireworks.height;
  cs.width=w;
  cs.height=h;
  for (const e of entity_array){
    e.tick(dt);
  }
  
  entity_array=entity_array.filter((e)=>{
    if (!e.alive()) return false;
    if (e.position.x<0 || e.position.x>w) return false
    if (e.position.y<0 || e.position.y>h) return false
    return true;
  });
  
  //console.log("#Entities: "+entity_array.length);
  
  fc2d.clearRect(0,0,w,h);
  for (const e of entity_array){
    e.render(cs);
  }
  
  debug_print_particles.innerHTML="Particles x"+entity_array.length
}

export function set_scroll_progress(f){
  cs.offset=new Vector2(0,-f*100);
}

let fireworks_enabled=true;
export function set_fireworks_enabled(b){
  fireworks_enabled=b;
}
function launch_firework_periodic(){
  if (fireworks_enabled) spawn_firework_rocket();
  window.setTimeout(launch_firework_periodic,Math.random()*2500+500);
}
launch_firework_periodic();

export function animationTick(dt){
  
  if (canvas_fireworks.width!=wsd.clientWidth)
    canvas_fireworks.width=wsd.clientWidth;
  if (canvas_fireworks.height!=wsd.clientHeight)
    canvas_fireworks.height=wsd.clientHeight;
  
  refresh_fireworks_canvas(dt);
  
}
