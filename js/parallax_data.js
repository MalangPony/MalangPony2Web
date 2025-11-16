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
// The sky follows the offset at Z=10000

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
	{ // Airship
		location:[1000,3000,3700],
		size:[2000,2000*(365/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D1628188D.png",
		illuminated:"sprites-prototype/MPN2-Prototype-Image-D1628188.png",
	},
	{ // Cloud #1 - hat
		location:[1300,2500,4000],
		size:[1000,1000*(197/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D1628947.png",
		illuminated:"sprites-prototype/MPN2-Prototype-Image-D1628947B.png",
	},
	{ // Cloud #2 - flat
		location:[-2000,4000,4000],
		size:[1000,1000*(333/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D1628954.png",
		illuminated:"sprites-prototype/MPN2-Prototype-Image-D1628954B.png"
	},
	{ // Cloud #3 - swirly
		location:[-3500,2000,4000],
		size:[1000,1000*(200/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D1629031.png",
		illuminated:"sprites-prototype/MPN2-Prototype-Image-D1629031B.png"
	},
	{ // Cloud #4 - round
		location:[3100,3500,4000],
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
	{ //Trixie's Wagon
		location:[-1500,0,800],
		size:[400,400*(430/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D595907D.png"
	},
	{ //Trixie's Stage
		location:[0,0,1500],
		size:[1000,1000*(397/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D1446383D.png"
	},
	{ //Vinyl's Set
		location:[-600,0,700],
		size:[500,500*(340/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D1718220D.png"
	},
	
	{ //PARTY CANNON
		location:[-800,0,400],
		size:[200,200*(415/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D1088400D.png"
	},

	{ //Chariot
		location:[800,0,-800],
		size:[500,500*(347/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D3599406D.png"
	},

	{ //Tree #1
		location:[-800,0,1000],
		size:[500,500*(500/428)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D1687812.png"
	},
	{ //Tree #2
		location:[1300,0,800],
		size:[500,500*(460/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D1695788D.png"
	},
	{ //Tree #3
		location:[800,0,1300],
		size:[500,500*(588/537)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D1633676D.png"
	},	
	{ //PP
		location:[800,0,200],
		size:[300,300],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D451590.png"
	},
	{ //DH
		location:[1500,0,1500],
		size:[300,300*(500/350)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D819252.png"
	},
	{ //Cherilee
		location:[-1000,0,0],
		size:[400,400*(245/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D1225414.png"
	},
	{ //Printing
		location:[500,0,-300],
		size:[400,400*(316/500)],
		type:"image",
		src:"sprites-prototype/MPN2-Prototype-Image-D43450.png"
	},

	// Maybe combine all the guards into a single image? 
	// Might be better for performance...
	{ //Guard #1
		location:[650,0,700],
		size:[150,150*(2500/1650)],
		type:"image",
		src:"sprites/BGP-002-A_RESIZE.png"
	},
	{ //Guard #2
		location:[750,0,700],
		size:[150,150*(2500/1650)],
		type:"image",
		src:"sprites/BGP-002-C_RESIZE.png"
	},
	{ //Guard #3
		location:[850,0,700],
		size:[150,150*(2500/1650)],
		type:"image",
		src:"sprites/BGP-002-B_RESIZE.png"
	},
	{ //Guard #4
		location:[950,0,700],
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
];
const GRASS_COUNT=10;
const GRASS_SIZE=40;
for(let i=0;i<GRASS_COUNT;i++){
	images.push({ // Grass #1
		location:[Math.random()*5000-2500,-0.5*GRASS_SIZE,3000*i/GRASS_COUNT],
		size:[NaN,GRASS_SIZE],
		tile_size:[GRASS_SIZE*30,GRASS_SIZE],
		type:"tile",
		src:"sprites-prototype/MPN2-Prototype-Image-GrassTile.png"
	})
}

// Camera locations.
let camera_y=200;
let camera_default_tilt=+0.7
// X Y Z Zoom Tilt
export let camera_locations={
	intro:     [   0, camera_y,  -500, 1.0, camera_default_tilt,0.5], //Center
	about:     [-1000,camera_y,  -300, 1.0, camera_default_tilt,0.1], //Cherilee
	coc:       [ 800, camera_y,   300, 1.0, camera_default_tilt,0.1], //Guards
	news:      [ 800, camera_y,  -100, 1.0, camera_default_tilt,0.1], //PP
	timetable: [   0, camera_y,  1000, 1.0, camera_default_tilt,0.1], //Stage
	venue:     [ 800, camera_y, -1200, 1.0, camera_default_tilt,0.1], //Carriage
	previous:  [1500, camera_y,  1000, 1.0, camera_default_tilt,0.1], //Whooves
	mascot:    [-200, camera_y,  -100, 1.0, camera_default_tilt,0.1], //N/A
	credits:   [   0,      300, -1500, 1.3, camera_default_tilt,0.1], //Dolly Zoom
	conbook:   [ 500, camera_y,  -600, 1.0, camera_default_tilt,0.1], //Press
	inquiries: [-600, camera_y,   300, 1.0, camera_default_tilt,0.1], //Vinyl's Set
	involved:  [-1500,camera_y,   400, 1.0, camera_default_tilt,0.1], //Wagon
	register:  [   0,      100,  -200, 0.7, camera_default_tilt,0.1], //Wide-Angle
}

// Camera parameters in sky mode.
export let camera_sky_tilt = 0.0;
export let camera_sky_y_offset = 500;
