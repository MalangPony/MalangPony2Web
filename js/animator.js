/*
 * JS module implementing a simple animation manager.
 * 
 */

// Modules
import { Vector2, Vector3 } from "./vectors.js";

export class AnimatedValue{
	duration=1.0;
	delay=0.0;
	#elapsed_time=Infinity;
	exponent=2.0;
	ease_in=false;
	ease_out=false;
	start_value=0;
	end_value=0;
	
	constructor(initial_value=0){
		this.start_value=initial_value;
		this.end_value=initial_value;
	}
	tick(dt){
		this.#elapsed_time+=dt;
	}
	jump(val){
		this.start_value=val;
		this.end_value=val;
		this.#elapsed_time=Infinity;
	}
	start(){
		this.#elapsed_time=0;
	}
	stop(){
		this.jump(this.calculate_value());
	}
	jump_to_end(){
		this.jump(this.end_value);
	}
	animate_to(val){
		this.start_value=this.calculate_value();
		this.end_value=val;
		this.#elapsed_time=0;
	}
	set_ease(expo=2.0,ein=true,eout=true){
		this.exponent=expo;
		this.ease_in=ein;
		this.ease_out=eout;
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
	get being_animated(){
		return this.elapsed_time<(this.duration+this.delay);
	}
	calculate_linear_anim_progress(){
		let rel_time=(this.#elapsed_time-this.delay);
		let ratio=rel_time/this.duration;
		if (ratio<0) return 0;
		if (ratio>1) return 1;
		return ratio;
	}
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
