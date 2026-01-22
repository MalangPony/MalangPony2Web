// Place for globals.

export let darkmode=null;
let darkmode_listeners=[];
export function add_darkmode_listener(f){
	darkmode_listeners.push(f);
}
export function set_darkmode(dm){
	darkmode=dm;
	for (const f of darkmode_listeners) f();
}

export let animated=null;
let animated_listeners=[];
export function add_animated_listener(f){
	animated_listeners.push(f);
}
export function set_animated(a){
	animated=a;
	for (const f of animated_listeners) f();
}

export let lang=null;
let lang_listeners=[];
export function add_lang_listener(f){
	lang_listeners.push(f);
}
export function set_lang(l){
	lang=l;
	for (const f of lang_listeners) f();
}
