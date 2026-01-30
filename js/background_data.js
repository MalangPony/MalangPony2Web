
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
	directions:"bgd003",
	conbook:   "bgd003",
	internal:  "bgd003",
	faq:       "bgd003",
	
	involved:  "nothing",
	
	register:  "bgd004",
	panelist:  "bgd004",
	vendor:    "bgd004",
	artgallery:"bgd004",
	volunteer: "bgd004",
	
	
	inquiries: "nothing",
};


export let background_definitions={
	nothing:{
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
	
	bgd001:{
		base_image:"/backgrounds/BGD-001C_NoFade-GB20-RszH512_J90.jpg",
		left_image:"/backgrounds/BGD-001L_RszH1024-Crop.png",
		left_align:"bottom",
		left_height_vh:50,
		left_margin_px:16,
		right_image:"/backgrounds/BGD-001M_RszH1000-Crop.png",
		right_align:"top",
		right_height_vh:50,
		right_margin_px:16,
	},
	
	bgd002:{
		base_image:"/backgrounds/BGD-002C_NoFade-GB20-RszH512_J90.jpg",
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
		base_image:"/backgrounds/BGD-003C_NoFade-GB20-RszH512_J90.jpg",
		left_image:"/backgrounds/BGD-003H_Rsz1024-Crop-HFlip.png",
		left_align:"bottom",
		left_height_vh:50,
		left_margin_px:16,
		right_image:"/backgrounds/BGD-003L_Rsz1024-Crop.png",
		right_align:"top",
		right_height_vh:50,
		right_margin_px:16,
	},
	
	bgd004:{
		base_image:"/backgrounds/BGD-004C_NoFade-GB20-RszH512_J90.jpg",
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
