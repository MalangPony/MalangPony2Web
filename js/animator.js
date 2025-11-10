/*
 * JS module implementing a simple animation manager.
 * 
 */

// Modules
import { Vector2, Vector3 } from "./vectors.js";

/*
 * A class that represents a single animated value.
 * The value may be a Number, or a Vector2 or Vector3.
 * The value will always be smoothly animated, even if it is interrupted.
 */
export class AnimatedValue{
	// Most values should be self-explainatory.
	duration=1.0;
	delay=0.0;
	exponent=2.0;
	ease_in=false;
	ease_out=false;
	start_value=0;
	end_value=0;
	
	// Seconds since animation start
	#elapsed_time=Infinity;
	
	// Reset to -1 every time this value might have changed.
	// A <=0 value does not guarentee that the value was actually changed,
	// But a >1 value does guarentee that the value wasn't changed.
	#ticks_since_change=0;
	#time_since_change=0;
	
	constructor(initial_value=0){
		this.start_value=initial_value;
		this.end_value=initial_value;
		this.#ticks_since_change=0;
		this.#time_since_change=0;
	}
	#changed(){
		this.#ticks_since_change=-1;
		this.#time_since_change=-1;
	}
	
	get ticks_since_change(){
		return Math.max(this.#ticks_since_change,0);
	}
	get changed_this_tick(){
		return this.ticks_since_change<=0;
	}
	get time_since_change(){
		return Math.max(this.#time_since_change,0);
	}
	
	// This should be called on every animation tick.
	tick(dt){
		this.#elapsed_time+=dt;
		
		if (this.being_animated ){
			this.#changed();
		}
	}
	
	// Go to this value without animation.
	jump_to(val){
		this.start_value=val;
		this.end_value=val;
		this.#elapsed_time=Infinity;
		this.#changed();
	}
	// Start animation now.
	start(){
		this.#elapsed_time=0;
		this.#changed()
	}
	// Stop animation now. The value is frozen at the current value.
	stop(){
		this.jump_to(this.calculate_value());
	}
	// Stop animation and jump to the end value.
	jump_to_end(){
		this.jump_to(this.end_value);
	}
	// Animate from the current value to the given value.
	animate_to(val){
		this.start_value=this.calculate_value();
		this.end_value=val;
		this.#elapsed_time=0;
		this.#changed();
	}
	// Set exponent and Ease-in and Ease-out.
	set_ease(expo=2.0,ein=true,eout=true){
		this.exponent=expo;
		this.ease_in=ein;
		this.ease_out=eout;
		this.#changed();
	}
	static polynomialEaseIn(x,power){
		return Math.pow(x,power);
	}
	static polynomialEaseOut(x,power){
		return 1-this.polynomialEaseIn(1-x,power)
	}
	static polynomialEase(x,power){
		if (x<0.5) return this.polynomialEaseIn(x*2,power)*0.5;
		else return this.polynomialEaseOut((x-0.5)*2,power)*0.5+0.5;
	}
	
	// Is this value being animated right now?
	// Note that this will return false on the tick that the 
	// animation was completed. And it does not know if this value was
	// jump_to()'d this tick.
	// This means that even if being_animated is false, the value may
	// have changed from the last tick.
	// Use .changed_this_tick property to check for that instead.
	get being_animated(){
		return this.elapsed_time<(this.duration+this.delay);
	}
	
	// Animation progress, without any easing.
	calculate_linear_anim_progress(){
		let rel_time=(this.#elapsed_time-this.delay);
		let ratio=rel_time/this.duration;
		if (ratio<0) return 0;
		if (ratio>1) return 1;
		return ratio;
	}
	// Animation progress, with easing applied.
	calculate_eased_anim_progress(){
		let ratio = this.calculate_linear_anim_progress();
		if (this.ease_in && this.ease_out){
			ratio=AnimatedValue.polynomialEase(ratio,this.exponent);
		}else if (this.ease_in){
			ratio=AnimatedValue.polynomialEaseIn(ratio,this.exponent);
		}else if (this.ease_in){
			ratio=AnimatedValue.polynomialEaseOut(ratio,this.exponent);
		}else{
			//do nothin
		}
		return ratio;
	}
	// Calculate the actual animated value.
	calculate_value(){
		if (this.#elapsed_time<=this.delay) return this.start_value;
		if (this.#elapsed_time>=(this.delay+this.duration)) return this.end_value;
		
		let is_vector = (this.start_value instanceof Vector2) || (this.start_value instanceof Vector3);
		let progress = this.calculate_eased_anim_progress();
		if (is_vector){
			let delta=this.end_value.subtract(this.start_value);
			return this.start_value.add(delta.multiply(progress));
		}else{
			let delta=this.end_value-this.start_value;
			return this.start_value+delta*progress;
		}
	}
	
	
}
