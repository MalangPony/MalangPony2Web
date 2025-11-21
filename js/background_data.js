
// A blank string will be a transparent image.
export let page_to_background_id={
	intro:     "", 
	
	news:      "library",
	
	about:     "manehattan",
	previous:  "manehattan",
	coc:       "manehattan",
	mascot:    "manehattan",
	credits:   "manehattan",
	
	timetable: "cloudsdale",
	venue:     "cloudsdale",
	conbook:   "cloudsdale",
	internal:  "cloudsdale",
	
	involved:  "library",
	register:  "library",
	
	
	inquiries: "nothing",
};


/* All images are fit to height. */
export let background_definitions={
	nothing:{
		outer_fill_left:"#000000",
		outer_fill_right:"#000000",
		base_image:"",
		left_image:"",
		left_align:"bottom",
		left_height_vh:0,
		left_margin_px:0,
		right_image:"",
		right_align:"top",
		right_height_vh:0,
		right_margin_px:0,
	},
	
	library:{
		outer_fill_right:"#81262d",
		outer_fill_left:"#a4463e",
		base_image:"/sprites-prototype/MPN2-Prototype-Image-D3612742.jpg",
		left_image:"/sprites-prototype/MPN2-Prototype-Image-D1635754.png",
		left_align:"bottom",
		left_height_vh:60,
		left_margin_px:16,
		right_image:"/sprites-prototype/MPN2-Prototype-Image-D1405288.png",
		right_align:"top",
		right_height_vh:60,
		right_margin_px:16,
	},
	
	manehattan:{
		outer_fill_left:"#2f1b35",
		outer_fill_right:"#28283c",
		base_image:"/sprites-prototype/MPN2-Prototype-Image-D3672976.jpg",
		left_image:"/sprites-prototype/MPN2-Prototype-Image-D982559.png",
		left_align:"bottom",
		left_height_vh:60,
		left_margin_px:16,
		right_image:"",
		right_align:"bottom",
		right_height_vh:0,
		right_margin_px:16,
	},
	
	cloudsdale:{
		outer_fill_left:"#64a2b7",
		outer_fill_right:"#64a2b7",
		base_image:"/sprites-prototype/MPN2-Prototype-Image-D3666326.jpg",
		left_image:"/sprites-prototype/MPN2-Prototype-Image-D1343951.png",
		left_align:"bottom",
		left_height_vh:60,
		left_margin_px:16,
		right_image:"/sprites-prototype/MPN2-Prototype-Image-D1108682.png",
		right_align:"top",
		right_height_vh:60,
		right_margin_px:16,
	},
	
}
