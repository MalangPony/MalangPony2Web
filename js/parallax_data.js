/*
 * Data for background parallax field.
 */

// Valid Properties:
// location, size, type, src, (illuminated), (tile_size)

// Location [Required]:
// X controls horizontal position. Positive is right.
// Y controls the height. Positive is higher in the screen. 
//    (This is opposite from actual screen coords!)
// Z controls depth. Positive is further away.
// If Z<3000, the image will be placed in front of the fireworks.
// If Z>3000, the image will be placed behind the fireworks.
// The firework system will follow the offset at Z=3000

// Size [Required]:
// Intrinsic size. Will be this size if 500px away from camera.
// If a coordinate is Infinity, it will extend to the end of the screen, towards + direction.
// If a coordinate is -Infinity, it will extend to the end of the screen, towards - direction.
// If a coordinate is NaN, it will fill the screen in both directions.

// Type [Required]:
// "solid", "image", "gradient", or "tile-{x,y}".

// Tile-Size [Optional]:
// Size of the tile. Only has an effect if type is a tile.

// SRC [Required]:
// Color code for solids,
// Image src for image and tile*.
// Gradient definition for gradients.

// Illuminated [Optional]:
// IF DEFINED, will display two instances of the image.

// Ground plane is at Y=0
// don't put anything in front of Z=0
// Everything is at its intrinsic size at 500px away from camera.
// Which means, at default camera Z=+500, an object at Z=0 will be at its
// original size. An object at, say Z=3000 will be at its 1/7 = 14% size.
export let images=[
	{ // Ground plane
		location:[0,0,2900],
		size:[NaN,-Infinity],
		type:"gradient",
		src:"linear-gradient(to right, #31407b 0%, #376483 40% 60%, #31407b 100%)"
	},
	{ // Fence
		location:[0,-100,2901],
		size:[NaN,500],
		tile_size:[798,500],
		type:"tile",
		src:"sprites-prototype/MPN2-Prototype-Image_D582943-EDIT01_ResizeH500.png"
	},
	{ // Mountain
		location:[1000,-500,6000],
		size:[6000,3000],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-Namsan.png"
	},
	{ // Cloud #1 - hat
		location:[300,1500,4000],
		size:[1000,1000*(197/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D1628947.png",
		illuminated:"sprites-prototype/MPN2-Prototype-Image-D1628947B.png",
	},
	{ // Cloud #2 - flat
		location:[-2000,2500,4000],
		size:[1000,1000*(333/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D1628954.png",
		illuminated:"sprites-prototype/MPN2-Prototype-Image-D1628954B.png"
	},
	{ // Cloud #3 - swirly
		location:[-2500,1500,4000],
		size:[1000,1000*(200/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D1629031.png",
		illuminated:"sprites-prototype/MPN2-Prototype-Image-D1629031B.png"
	},
	{ // Cloud #4 - round
		location:[2200,3000,4000],
		size:[1000,1000*(333/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D1629034.png",
		illuminated:"sprites-prototype/MPN2-Prototype-Image-D1629034B.png"
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
	// Maybe combine all the guards into a single image? 
	// Might be better for performance...
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
	news:      [   0,      800, -1000, 1.0, +1.2],
	timetable: [-500, camera_y,  -500, 1.0, camera_default_tilt],
	venue:     [-100, camera_y,  -800, 1.0, camera_default_tilt],
	previous:  [   0, camera_y, -1000, 1.2, camera_default_tilt],
	mascot:    [-200, camera_y,  -100, 1.0, camera_default_tilt],
}

// Camera parameters in sky mode.
export let camera_sky_tilt = 0.0;
export let camera_sky_y_offset = 500;
