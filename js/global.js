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

export let lang=null;
let lang_listeners=[];
export function add_lang_listener(f){
	lang_listeners.push(f);
}
export function set_lang(l){
	lang=l;
	for (const f of lang_listeners) f();
}
