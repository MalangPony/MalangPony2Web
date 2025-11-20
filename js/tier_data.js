
export const tiers_data={
	standard:{
		name_en:"Standard",
		name_ko:"스탠다드",
		desc_en:"The standard badge.",
		desc_ko:"일반 참가증입니다.",
		css_class:"tier-standard",
		inherits:null,
		perks_list:["standard_badge","standard_lanyard","conbook"],
		inherit_exclude:[],
		price:35,
		limit:Infinity
	},
	sponsor:{
		name_en:"Sponsor",
		name_ko:"스폰서",
		desc_en:"wow merch",
		desc_ko:"와! 굿즈!",
		css_class:"tier-sponsor",
		inherits:"standard",
		perks_list:["conbook_mention","website_mention","ecobag","light_stick","poster","sticker_pack","plastic_folder","tin_badge"],
		inherit_exclude:[],
		price:75,
		limit:Infinity
	},
	mane:{
		name_en:"Mane Six",
		name_ko:"메인식스",
		desc_en:"Friendship is Magic",
		desc_ko:"우정의 마법",
		css_class:"tier-mane",
		inherits:"sponsor",
		perks_list:["opening_closing_mention","vendor_priority","tumbler","acrylic_stand","mascot_charms"],
		inherit_exclude:[],
		price:150,
		limit:6
	},
	princess:{
		name_en:"Royal Princess",
		name_ko:"로얄 프린세스",
		desc_en:"Princess!!!",
		desc_ko:"공주님!!!",
		css_class:"tier-princess",
		inherits:"mane",
		perks_list:["backstage","vendor_highest_priority","custom_badge","acrylic_diorama","large_tapestry","commision_tapestry","oc_in_website_bg","signed_poster","dinner_with_staff","staff_hotline","opening_closing_shoutout"],
		inherit_exclude:[],
		price:400,
		limit:3
	},
	spirit:{
		margin_top:32,
		name_en:"Spirit Badge",
		name_ko:"영혼 보내기",
		desc_en:"For those who can't attend in person<br>Note to people outside of Korea: You will need to pay for overseas shipping separately.",
		desc_ko:"직접 참여가 어려우신 분들을 위해, 참가증과 콘북을 택배로 보내드립니다.",
		css_class:"tier-spirit",
		inherits:"standard",
		perks_list:[],
		inherit_exclude:[],
		price:25,
		limit:Infinity
	},
	onsite:{
		margin_top:16,
		name_en:"On-Site Badge",
		name_ko:"현장등록",
		desc_en:"We will offer a limited unmber of on-site registrations for those who missed the pre-registration.",
		desc_ko:"티켓 구매를 놓치신 분들을 위해, 한정된 수량의 현장등록 참가증도 준비되어 있습니다.",
		css_class:"tier-onsite",
		inherits:null,
		perks_list:["daiso_badge"],
		inherit_exclude:[],
		price:45,
		limit:14
	},
};

export const perks_data={
	standard_badge:{
		name_en:"Standard Badge",name_ko:"일반 참가증",
		desc_en:"A plastic badge that goes around your neck.",
		desc_ko:"목에 거는 플라스틱 참가증이에요."},
	daiso_badge:{
		name_en:"Clip-on Badge",name_ko:"클립형 참가증",
		desc_en:"A clip-on nametag that goes on your shirt.",
		desc_ko:"옷에 거는 클립형 명찰입니다."},
	
	standard_lanyard:{
		name_en:"Standard Lanyard",name_ko:"일반 랜야드",
		desc_en:"A monochrome lanyard.",
		desc_ko:"일반 단색 랜야드입니다."},
	
	conbook:{
		name_en:"Conbook",name_ko:"콘북",
		desc_en:"A celebration and explanation of this event.",
		desc_ko:"이번 행사 기념 및 설명 책자입니다."},
	
	conbook_mention:{
		name_en:"Conbook Mention",name_ko:"콘북 기재",
		desc_en:"Your name will be written inside the conbook. (Optional)",
		desc_ko:"콘북에 이름이 기재됩니다. (선택)"},
	website_mention:{
		name_en:"Website Mention",name_ko:"웹사이트 기재",
		desc_en:"",
		desc_ko:""},
	ecobag:{
		name_en:"Canvas Bag",name_ko:"에코백",
		desc_en:"",
		desc_ko:""},
	light_stick:{
		name_en:"Light Stick",name_ko:"응원봉",
		desc_en:"",
		desc_ko:""},
	poster:{
		name_en:"Poster",name_ko:"포스터",
		desc_en:"",
		desc_ko:""},
	sticker_pack:{
		name_en:"Sticker Pack",name_ko:"스티커 팩",
		desc_en:"",
		desc_ko:""},
	plastic_folder:{
		name_en:"Plastic Folder",name_ko:"L자 화일",
		desc_en:"",
		desc_ko:""},
	tin_badge:{
		name_en:"Tin Badge",name_ko:"핀뱃지",
		desc_en:"",
		desc_ko:""},
	opening_closing_mention:{
		name_en:"Mentioned on Opening &amp; Closing Cereminies",name_ko:"개회식, 폐회식 언급",
		desc_en:"",
		desc_ko:""},
	vendor_priority:{
		name_en:"Vendor Hall Priority",name_ko:"벤더홀 우선 입장",
		desc_en:"",
		desc_ko:""},
	tumbler:{
		name_en:"Tumbler",name_ko:"텀블러",
		desc_en:"",
		desc_ko:""},
	acrylic_stand:{
		name_en:"Acrylic Stand",name_ko:"아크릴 코롯토",
		desc_en:"",
		desc_ko:""},
	mascot_charms:{
		name_en:"Mascot Charms",name_ko:"마스코트 자수키링",
		desc_en:"",
		desc_ko:""},
	backstage:{
		name_en:"Backstage Pass",name_ko:"백스테이지",
		desc_en:"",
		desc_ko:""},
	vendor_highest_priority:{
		name_en:"Vendor Hall VIP Access",name_ko:"벤더홀 최우선 입장",
		desc_en:"",
		desc_ko:"",
		overwrites:"vendor_priority"},
	custom_badge:{
		name_en:"Custom Badge",name_ko:"뱃지 주문제작",
		desc_en:"",
		desc_ko:"",
		overwrites:"standard_badge"},
	acrylic_diorama:{
		name_en:"Acrylic Diorama",name_ko:"특별 아크릴 디오라마",
		desc_en:"",
		desc_ko:""},
	large_tapestry:{
		name_en:"Large Tapestry",name_ko:"족자봉",
		desc_en:"",
		desc_ko:""},
	commision_tapestry:{
		name_en:"Tapestry Commision from the Official Artist",name_ko:"공식 아티스트 커미션 태피스트리",
		desc_en:"",
		desc_ko:""},
	oc_in_website_bg:{
		name_en:"Your OC in the Website Background",name_ko:"웹사이트 배경에 OC 삽입",
		desc_en:"",
		desc_ko:""},
	signed_poster:{
		name_en:"Poster Signed by Staff",name_ko:"스태프 싸인 포스터",
		desc_en:"",
		desc_ko:""},
	dinner_with_staff:{
		name_en:"Dinner with Staff",name_ko:"스태프와 저녁식사",
		desc_en:"",
		desc_ko:""},
	staff_hotline:{
		name_en:"Staff Hotline",name_ko:"스태프 연락망",
		desc_en:"",
		desc_ko:""},
	opening_closing_shoutout:{
		name_en:"Self-Promotion Chance in the Opening and Closing Ceremonies",name_ko:"개회, 폐회식 홍보 기회",
		desc_en:"",
		desc_ko:""},
};
