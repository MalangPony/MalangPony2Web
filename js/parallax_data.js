/*
 * Data for background parallax field.
 */

// Location:
// X controls horizontal position. Positive is right.
// Y controls the height. Positive is higher.
// Z controls depth. Positive is further away.

// Size:
// Intrinsic size. Will be this size if 500px away from camera.
// For solid types, Infinity and -1 sizes have a special meaning.

// Type:
// solid, image, gradient.

// SRC:
// Color code for solids,
// Image src for image.
// Gradient definition for gradients.

// Ground plane is at Y=0
// don't put anything in front of Z=0
export let images=[
	{ // Ground plane
		location:[0,0,3000],
		size:[Infinity,-1],
		type:"gradient",
		src:"linear-gradient(to right, #31407b 0%, #376483 40% 60%, #31407b 100%)"
	},
	{ // Mountain
		location:[1000,0,3000],
		size:[4000,2000],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-Namsan.png"
	},
	{ //FS
		location:[-200,0,-20],
		size:[200,200*(326/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D2489678.png"
	},
	{ //TS
		location:[200,0,-20],
		size:[200,200*(370/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D1408232.png"
	},
	{ //RD
		location:[100,0,+30],
		size:[160,160*(500/469)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D926915.png"
	},
	{ //Table
		location:[0,-30,0],
		size:[150,150],
		type:"image",
		src:"sprites/BGO-002_RESIZE.png"
	},
	{ //BASS CANNON
		location:[-400,0,300],
		size:[200,200*(458/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D1718519.png"
	},
	{ //Guard #1
		location:[500,0,700],
		size:[150,150*(2500/1650)],
		type:"image",
		src:"sprites/BGP-002-A_RESIZE.png"
	},
	{ //Guard #2
		location:[700,0,700],
		size:[150,150*(2500/1650)],
		type:"image",
		src:"sprites/BGP-002-C_RESIZE.png"
	},
	{ //Guard #3
		location:[900,0,700],
		size:[150,150*(2500/1650)],
		type:"image",
		src:"sprites/BGP-002-B_RESIZE.png"
	},
	{ //Guard #4
		location:[1100,0,700],
		size:[150,150*(2500/1650)],
		type:"image",
		src:"sprites/BGP-002-D_RESIZE.png"
	},
	/*
	{	
		location:[,,],
		size:[,],
		type:"",
		src:""
	},*/
]

// Camera locations.
let camera_y=200;
let camera_default_tilt=+0.7
// X Y Z Zoom Tilt
export let camera_locations={
	intro:     [   0, camera_y,  -500, 1.0, camera_default_tilt],
	about:     [   0,      100,  -200, 0.8, camera_default_tilt],
	coc:       [ 800, camera_y,   300, 1.0, camera_default_tilt],
	news:      [   0, 800, -1000, 1.0, +1.2],
	timetable: [-500, camera_y,  -500, 1.0, camera_default_tilt],
	venue:     [-100, camera_y, -1000, 1.0, camera_default_tilt]
}
