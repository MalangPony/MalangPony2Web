/*
 * JS module handling the fireworks in the background.
 * 
 * This implements a simple physics-based particle system.
 */

// Module imports
import { Vector2, Vector3 } from "./vectors.js";
import { save_canvas_to_file } from "./utils.js";
import * as Config  from "./config.js";
import * as Graphics  from "./graphics.js";
import * as PerformanceManager from "./perfmanager.js";
import * as Global from "./global.js";

// DOM definitions
const wsd = document.getElementById("whole-screen-div");
const canvas_fireworks = document.getElementById("canvas-fireworks");
const debug_print_particles=document.getElementById("debug-print-particles");

// Represents a physics-based object in the simulation
class Entity{
  // Postion. Unit: Pixels.
  position = new Vector2();
  // Velocity. Unit: px/sec
  velocity = new Vector2();
  // Drag cofficients. Acceleration = DCL * |v| + DCQ * v^2
  drag_coefficient_linear = 0;
  drag_coefficient_quadratic = 0;
  // Gravitational acceleration towards +Y direction. px/s^2
  gravity = 0;
  
  constructor(){
  }
  tick(dt){
    // Check is position is valid
    if (isNaN(this.position.x)) return;
    
    // Calculate drag
    let speed = this.velocity.length();
    let drag_force = 
      this.drag_coefficient_linear*speed+
      this.drag_coefficient_quadratic*speed*speed;
    let final_speed = speed - drag_force*dt;
    // Do not decelerate below zero speed.
    if (final_speed < 0) final_speed=0;
  
    // Apply drag
    this.velocity=this.velocity.normalize().multiply(final_speed);
    // Apply gravity
    this.velocity=this.velocity.add(new Vector2(0,+this.gravity*dt));
    // Step
    this.position=this.position.add(this.velocity.multiply(dt));
  }
  alive(){
    // May be overridden by a child class.
    return true;
  }
  render(c2d){
    // By default, just draw a red dot.
    // This should be overridden by a child class.
    cs.context.fillStyle="#FF0000";
    let draw_position = this.position.add(c2d.offset);
    cs.context.fillRect(draw_position.x-2,draw_position.y-2,5,5);
  }
}


// Represents a glowing orb
class GlowingCircleEntity extends Entity{
  // Orb size and colors
  radius;
  inner_color;
  border_feather;
  glow_color;
  glow_radius;
  edge_color;
  
  // (Orb size) = (life left) ^ (life_size_power)
  // This allows for 'easing' the orb size with respect to time.
  life_size_power=1.0
  // should this orb fade away?
  #life_fade=false;
  // Total lifetime. Should not change during the particle's lifetime.
  #lifetime;
  // Remaining lifetime. Gets updated constantly. Particle dies at 0.
  #remaining_life;
  
  set lifetime(t){
    this.#life_fade=true;
    this.#lifetime=t;
    this.#remaining_life=t;
  }
  tick(dt){
    // The physics is handled by the parent class.
    super.tick(dt);
    if (this.#life_fade) this.#remaining_life-=dt;
  }
  alive(){
    // Death by age
    if (this.#life_fade && this.#remaining_life<=0) return false;
    return true;
  }
  render(cs){
    let draw_position = this.position.add(cs.offset);
    
    let size_multiplier=1.0;
    if (this.#life_fade) size_multiplier=Math.pow(
      this.#remaining_life/this.#lifetime,
      this.life_size_power);

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

// Represents a firework.
// Spawns a trail of GlowingCircleEntities while flying
// and explodes into a cluster of GlowingCircleEntities in the end.
class FireworkEntity extends GlowingCircleEntity{
  // How many seconds until detonation?
  fuze_seconds;
  // Used for trail particle spawning.
  distance_travelled_without_particle=0;
  
  tick(dt){
    // calculate distance travelled
    let old_position = this.position;
    super.tick(dt);
    let new_position=this.position;
    
    // Failsafe. May be triggered on laggy or suspended conditions.
    if (this.distance_travelled_without_particle>1000) 
      this.distance_travelled_without_particle=0
    
    // Reduce fuze
    if (this.fuze_seconds<0) return;
    this.fuze_seconds-=dt;
    
    if (this.fuze_seconds<0) {
      // Explode now!
      spawn_firework_burst(this.position,this.velocity,this);
    }else{
      // We are traveling - spawn some trail particles!
      this.distance_travelled_without_particle+=
        old_position.subtract(new_position).length();
      let particleN=0;
      let particle_highcount=PerformanceManager.check_feature_enabled(
        PerformanceManager.Feature.FIREWORKS_HIGHCOUNT);
      while (this.distance_travelled_without_particle>0){
        // Spawn particle every 5 pixels, 10 if low particle count mode.
        this.distance_travelled_without_particle-=(particle_highcount?5:10);
        
        // Spawn the actual smoke particle
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
    // Add fuze death condition
    return this.fuze_seconds>=0;
  }
}

// Master array holding all active Entities
let entity_array=[];

// This could be used for screen resizing
// But at the moment it is not used anywhere.
function offset_all_entities(dx,dy){
  for (const e of entity_array){
    e.position = e.position.add(new Vector2(dx,dy));
  }
}

// Physical constant.
const PARTICLE_PHYSICS_GRAVITY=300;

const firework_color_presets=[
  ["#FFFFFF","#FF91DB","#FF91DB00"],
  ["#FFFFFF","#F7E38F","#F7E38F00"],
  ["#FFFFFF","#70BCFF","#70BCFF00"],
  ["#FFFFFF","#F5B96E","#F5B96E00"],
  ["#FFFFFF","#AD8CD9","#AD8CD900"],
  ["#FFFFFF","#C7303E","#C7303E00"],
];


// Firework spawning logic.
// To make sure the firework doesn't overlap and stays within the screen,
//   we first calculate where the firework should explode
//   and work out the initial velocity and location backwards from there.
let last_explosion_location=new Vector2();
function spawn_firework_rocket(cs){
  let h=cs.height;
  let w=cs.width;
  
  let planned_explosion_X=0;
  let planned_explosion_Y=0;
  let avoidance_thresh=Math.min(h,w)*0.3;
  // Try 10 times to choose a location that is not close
  // to where the previous firework exploded.
  for (let i=0;i<10;i++){
    // Anywhere in X
    planned_explosion_X=Math.random()*w;
    // Explode only in the top half of screen
    planned_explosion_Y=Math.random()*0.5*h;
    let explosion_candidate=new Vector2(planned_explosion_X,planned_explosion_Y);
    
    // Re-roll if too close to last explosion
    let distance=last_explosion_location.subtract(explosion_candidate).length();
    if (distance>avoidance_thresh) {
      last_explosion_location=explosion_candidate;
      break;
    }
  }
  
  let launch_y=h+scroll_offset;
  
  // Given the apogee height, calculate the vertical velocity needed
  // to reach that height. This will be the firework's vertical velocity.
  let explosion_height=launch_y-planned_explosion_Y;
  let seconds_to_apogee = Math.sqrt(explosion_height*2/PARTICLE_PHYSICS_GRAVITY);
  let vy=seconds_to_apogee*PARTICLE_PHYSICS_GRAVITY;
  // For randomness, the fuse will explode 0~0.5 seconds before reaching apogee.
  let fuze=seconds_to_apogee-Math.random()*0.5;
  
  // Set random horizontal velocity.
  // If it results in an off-screen explosion, roll again.
  let px = 0;
  let py = launch_y;
  let vx=0;
  for (let i=0;i<10;i++){
    vx=(Math.random()*2-1)*100;
    px=planned_explosion_X-vx*fuze;
    if (px>0 && px<w){
      break;
    }
    if (i==9) console.log(`HVNF ${w} ${h} ${launch_y} ${px} ${vx}`);
  }
  
  // Actually spawn the firework entity.
  let random_color=firework_color_presets[
    Math.floor(Math.random()*firework_color_presets.length)];
  let e= new FireworkEntity();
  e.position=new Vector2(px,py);
  e.velocity=new Vector2(vx,-vy);
  e.gravity=PARTICLE_PHYSICS_GRAVITY;
  e.fuze_seconds=fuze;
  e.lifetime=fuze+0.01;
  e.radius=20;
  e.life_size_power=0.5;
  e.inner_color=random_color[0];
  e.border_feather=5;
  e.glow_color=random_color[1];
  e.glow_radius=30;
  e.edge_color=random_color[2];
  
  entity_array.push(e);
}

// This callback will be called after each firework explosion.
// Note: firework explosion, not firework launch!
let firework_burst_callbacks=[];
export function add_burst_callback(f){
	firework_burst_callbacks.push(f);
}

let tslfe=Infinity;
export function time_since_last_firework_explosion(){
  return tslfe;
}

// Spawn the firework explosion
// Just spawning a bunch of GlowingCircleEntities with a random velocity.
function spawn_firework_burst(center=null,initial_velocity=null,parent=null){
  let particle_highcount=PerformanceManager.check_feature_enabled(
    PerformanceManager.Feature.FIREWORKS_HIGHCOUNT);
  
  if (initial_velocity===null){
    initial_velocity=new Vector2(0,0);
  }
  let random_color=firework_color_presets[
      Math.floor(Math.random()*firework_color_presets.length)];
  for (let i=0;i<(particle_highcount?50:20);i++){
    
    let e=new GlowingCircleEntity();
    e.position=center.add(Vector2.random().multiply(30));
    e.velocity=Vector2.random().multiply(1000).add(initial_velocity);
    e.drag_coefficient_quadratic=0.010;
    e.gravity=PARTICLE_PHYSICS_GRAVITY;
    e.radius=10;
    e.lifetime=2.0;
    e.life_size_power=3.0;
    //e.inner_color=random_color[0];
    e.inner_color=parent.inner_color;
    e.border_feather=2;
    //e.glow_color=random_color[1];
    e.glow_color=parent.glow_color;
    e.glow_radius=10;
   // e.edge_color=random_color[2];
    e.edge_color=parent.edge_color;
    entity_array.push(e);
  }
  // Call burst callbacks
  for (const f of firework_burst_callbacks){
    f();
	}
  tslfe=0;
}

// Class for holding canvas state. 
class CanvasState{
  context=null;
  get width(){return this.logicalW;};
  get height(){return this.logicalH;};
  pixelW=0;pixelH=0;
  logicalW=0;logicalH=0;
  // Entities outside this range will be instantly killed.
  fieldMinX=0;fieldMaxX=0;fieldMinY=0;fieldMaxY=0;
  offset=new Vector2();
}

// Canvas setup
const fc2d = canvas_fireworks.getContext("2d");
let cs = new CanvasState();
cs.context=fc2d;
cs.offset=new Vector2(0,0);

PerformanceManager.register_feature_disable_callback(
  PerformanceManager.Feature.FIREWORKS,()=>{
    entity_array=[];
    canvas_fireworks.width=0;
    canvas_fireworks.height=0;
    debug_print_particles.innerHTML="FW Disabled.";
  }
);


// Functions for image export
let canvas_oversample=1.0;
export function set_canvas_oversample(n){
  canvas_oversample=n;
}
export function save_fireworks_to_file(){
  save_canvas_to_file(canvas_fireworks);
}
let fireworks_overdrive_freq=0;
export function set_overdrive(f){
  fireworks_overdrive_freq=f;
}
let time_multiplier=1.0;
export function set_time_multiplier(f){
  time_multiplier=f;
}

// Main re-draw loop
let firework_next_fire_timer=0;
function refresh_fireworks_canvas(dt){
  
  let containerW=wsd.clientWidth;
  if (!containerW) containerW=1; // Check for false-ish values
  let containerH=wsd.clientHeight;
  if (!containerH) containerH=1;
  let canvas_hires=PerformanceManager.check_feature_enabled(
    PerformanceManager.Feature.FIREWORKS_HIRES);
  
  let resolution_multiplier=canvas_hires?1.0:0.5;
  resolution_multiplier *= canvas_oversample;
  let targetW=Math.round(containerW*resolution_multiplier);
  let targetH=Math.round(containerH*resolution_multiplier);
  let pixelW=targetW;
  let pixelH=targetH;
  let logicalW=containerW;
  let logicalH=containerH;
  
  if (canvas_fireworks.width!=targetW)
    canvas_fireworks.width=targetW;
  if (canvas_fireworks.height!=targetH)
    canvas_fireworks.height=targetH;
  
  canvas_fireworks.style.width=containerW+"px";
  canvas_fireworks.style.height=containerH+"px";
  
  cs.context.save();
  cs.context.scale(resolution_multiplier,resolution_multiplier);
  cs.logicalW=logicalW;
  cs.logicalH=logicalH;
  cs.pixelW=pixelW;
  cs.pixelH=pixelH;
  cs.fieldMinX=0-100;
  cs.fieldMaxX=logicalW+100;
  cs.fieldMinY=0-100;
  cs.fieldMaxY=logicalH+100+scroll_offset;
  
  // Firework launch
  firework_next_fire_timer-=dt;
  if (firework_next_fire_timer<=0){
    if (fireworks_enabled 
      && Global.animated
      && Config.OPTION_ENABLE_FIREWORKS 
      && PerformanceManager.check_feature_enabled(
        PerformanceManager.Feature.FIREWORKS)){
      spawn_firework_rocket(cs);
      
      firework_next_fire_timer=Math.random()*2.5+0.5;
      if (fireworks_overdrive_freq>0.001) 
        firework_next_fire_timer=1.0/fireworks_overdrive_freq;
    }else{
      // We want to fire a firework, but it is disabled.
      // Keep the timer at 0 so it will be fired the moment it is enabled.
      firework_next_fire_timer=0;
    }
  }
  
  // Tick all entities
  for (const e of entity_array){
    e.tick(dt*time_multiplier);
  }
  
  // Kill any entities that went off-screen.
  entity_array=entity_array.filter((e)=>{
    if (!e.alive()) return false;
    if (e.position.x<cs.fieldMinX || e.position.x>cs.fieldMaxX) return false
    if (e.position.y<cs.fieldMinY || e.position.y>cs.fieldMaxY) return false
    return true;
  });
  
  // Clear canvas
  fc2d.clearRect(0,0,logicalW,logicalH);
  
  // Render all entities
  for (const e of entity_array){
    e.render(cs);
  }
  cs.context.restore();
  
  debug_print_particles.innerHTML="Particles x"+entity_array.length
}


let scroll_offset = Config.OPTION_INTRO_FIREWORKS_SCROLL_AMOUNT;

// Should be called by the main JS
export function set_scroll_progress(f){
  cs.offset=new Vector2(0,-f*scroll_offset);
}

// Disable all firework launching.
// Note that this does not kill any existing fireworks in-flight.
let fireworks_enabled=true;
export function set_fireworks_enabled(b){
  fireworks_enabled=b;
}

// Should be called by the main JS.
export function animationTick(dt){
  if (!Config.OPTION_ENABLE_FIREWORKS) return;
  if (!PerformanceManager.check_feature_enabled(
    PerformanceManager.Feature.FIREWORKS)) return;

  refresh_fireworks_canvas(dt);
  update_attention(dt);
  tslfe+=dt;
}


// Functions used for hanmari's firework-watching effect.
// An object is selected as being 'tracked'.
// We will lerp a point along that object's position.
// When the object dies (firework explodes) another object will be selected
//   after the attention runs out.
let attention_hold_remaining=-1;
let attention_position = Vector2.ZERO;
let attention_position_lerped=Vector2.ZERO;
let tracking_object=null;
export function update_attention(dt){
  let tracking_object_is_alive=false;
  let new_tracking_target_candidate=null;
  for (const e of entity_array){
    if (tracking_object===e) tracking_object_is_alive=true;
    if (e instanceof FireworkEntity){
      if (new_tracking_target_candidate===null){
        new_tracking_target_candidate=e;
      }
    }
  }
  if (tracking_object_is_alive) {
    // Tracking object is alive. Track that object.
    attention_position=tracking_object.position;
    // Reset attention remaining.
    attention_hold_remaining=0.2;
  }else{
    attention_hold_remaining-=dt;
    if (attention_hold_remaining<0){
      // Previous attention ran out.
      // Try to move attention to another object.
      if (new_tracking_target_candidate!==null){
        tracking_object=new_tracking_target_candidate;
        attention_position=tracking_object.position;
      }else{
        // No objects to track. Default to screen center.
        attention_position=new Vector2(cs.pixelW/2,cs.pixelH/2);
      }
    }else{
      // The object is dead, but we are still fixated on that object.
      // Hold the attention position (do nothing)
    }
  }
  
  // lerp calculation
  /*
  attention_position_lerped=Vector2.lerp(
    attention_position_lerped,
    attention_position,
    dt*1.5
  );*/
  // lerping has been moved to l2d.js::look_at()
  attention_position_lerped=attention_position
}

// Returns position in canvas-space.
export function get_lerped_attention_position(){
  //console.log("GLAP APL "+attention_position_lerped);
  return attention_position_lerped;
}

// Returns position in 0~1 'UV' coordinates.
export function get_lerped_attention_position_relative(){
  let apl = get_lerped_attention_position();
  return new Vector2(
    apl.x/canvas_fireworks.width,
    apl.y/canvas_fireworks.height
  );
}
