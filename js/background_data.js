
// A blank string will be a transparent image.
export let page_to_background_id={
	intro:     "", 
	
	news:      "bgd001",
	
	about:     "bgd002",
	previous:  "bgd002",
	coc:       "bgd002",
	mascot:    "bgd002",
	credits:   "bgd002",
	
	timetable: "bgd003",
	venue:     "bgd003",
	conbook:   "bgd003",
	internal:  "bgd003",
	faq:       "bgd003",
	
	involved:  "nothing",
	
	register:  "bgd004",
	panelist:  "bgd004",
	vendor:    "bgd004",
	artgallery:"bgd004",
	
	
	
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
	
	bgd001:{
		outer_fill_left:"#391548",
		outer_fill_right:"#391548",
		base_image:"/backgrounds/BGD-001C_Faded-GB20-RszH512_J90.jpg",
		left_image:"/backgrounds/BGD-001L_RszW1024-Crop.png",
		left_align:"bottom",
		left_height_vh:50,
		left_margin_px:16,
	},
	
	bgd002:{
		outer_fill_left:"#1C102C",
		outer_fill_right:"#1C102C",
		base_image:"/backgrounds/BGD-002C_Faded-Filtered-RszH500_J95.jpg",
		left_image:"/backgrounds/BGD-002A_Rsz1024-Crop-HFlip.png",
		left_align:"bottom",
		left_height_vh:50,
		left_margin_px:16,
		right_image:"/backgrounds/BGD-002Bb_Rsz1024-Crop.png",
		right_align:"top",
		right_height_vh:50,
		right_margin_px:16,
	},
	
	bgd003:{
		outer_fill_left:"#ab9976",
		outer_fill_right:"#ab9976",
		base_image:"/backgrounds/BGD-003C_Faded-GB20-RszH512_J90.jpg",
	},
	
	bgd004:{
		outer_fill_left:"#2e1763",
		outer_fill_right:"#2e1763",
		base_image:"/backgrounds/BGD-004C_Faded3-GB20-RszH512_J90.jpg",
		left_image:"/backgrounds/BGD-004H_Rsz1024-Crop-HFlip.png",
		left_align:"bottom",
		left_height_vh:50,
		left_margin_px:16,
		right_image:"/backgrounds/BGD-004L_Rsz1024-Crop-HFlip.png",
		right_align:"top",
		right_height_vh:50,
		right_margin_px:16,
	},
	
}
