/*
 * Small miscellaneous routines.
 * 
 */


//Calculates FPS.
export class FPS_Counter{
	history_window_seconds=30;
	frame_times_ms=[];
	// Report a frame drawn.
	frame(){
		let t=performance.now();
		this.frame_times_ms.push(t);
		while(this.frame_times_ms[0]<t-this.history_window_seconds*1000){
			this.frame_times_ms.shift();
		}
	}
	// Milliseconds per frame
	calculate_mspf(window_ms){
		let window_start_ms=performance.now()-window_ms;
		let frame_count=0;
		let index=this.frame_times_ms.length-1;
		if (index<0) return NaN;
		let end_ms=this.frame_times_ms[index];
		let start_ms=0;
		while (index>=0){
			if (this.frame_times_ms[index]<window_start_ms) break;
				
			start_ms=this.frame_times_ms[index];
			index--;
			frame_count++;
		}
		frame_count--; // we are counting intervals between frames, so...
		if (frame_count<1) return NaN;
		return (end_ms-start_ms)/frame_count;
	}
	calculate_fps(window_ms){
		return 1000/this.calculate_mspf(window_ms);
	}
	fps_1sec(){
		return this.calculate_fps(1000);
	}
	fps_10sec(){
		return this.calculate_fps(10000);
	}
	
}

export function linear_map(input_min,input_max,x,out_min,out_max,clamp=true){
	let range_input=input_max-input_min;
	let range_output=out_max-out_min;
	let ratio=(x-input_min)/range_input;
	
	if (clamp && (ratio<0)) ratio=0;
	if (clamp && (ratio>1)) ratio=1;
	
	return ratio*range_output+out_min;
}
