

// X controls horizontal position. Positive is right.
// Y controls the height. Positive is higher.
// Z controls depth. Positive is further away.

// Ground plane is at Y=0
// don't put anything in front of Z=0
export let images=[
	{	
		location:[0,0,3000],
		size:[Infinity,-1],
		type:"solid",
		src:"#0e3108"
	},
	{	
		location:[-200,0,0],
		size:[200,200*(326/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D2489678.png"
	},
	{	
		location:[200,0,100],
		size:[200,200*(370/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D1408232.png"
	},
	{	
		location:[100,0,200],
		size:[200,200*(500/469)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D926915.png"
	},
	{	
		location:[0,0,0],
		size:[200,200*(500/1050)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D1467319-E1.png"
	},
	{	
		location:[-400,0,300],
		size:[200,200*(458/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D1718519.png"
	},
	/*
	{	
		location:[,,],
		size:[,],
		type:"",
		src:""
	},*/
]

let camera_y=200;
let camera_default_tilt=+0.5
// X Y Z Zoom Tilt
export let camera_locations={
	intro:     [   0, camera_y,  -500, 1.0, camera_default_tilt],
	about:     [   0,      100,  -100, 0.8, camera_default_tilt],
	coc:       [ 800, camera_y,   300, 1.0, camera_default_tilt],
	news:      [   0, 800, -1000, 1.0, +1.0],
	timetable: [-500, camera_y,  -500, 1.0, camera_default_tilt],
	venue:     [-100, camera_y, -1000, 1.0, camera_default_tilt]
}
