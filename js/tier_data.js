
export const tiers_data={
	standard:{
		name_en:"Standard",
		name_ko:"스탠다드",
		desc_en:"The most basic badge tier.",
		desc_ko:"가장 기본이 되는 일반 참가 등급입니다.",
		css_class:"tier-standard",
		inherits:null,
		perks_list:[
			"standard_badge",
			"standard_lanyard",
			"conbook"
		],
		inherit_exclude:[],
		price:30,
		limit:Infinity,
		icon:"/sprites-prototype/circle_64dp_2854C5_FILL0_wght700_GRAD0_opsz48.png"
	},
	sponsor:{
		name_en:"Sponsor",
		name_ko:"스폰서",
		desc_en:"Includes a merch package, for those looking to support the event.",
		desc_ko:"행사를 더욱 풍성하게 후원해주실 분들을 위한 굿즈 패키지입니다.",
		css_class:"tier-sponsor",
		inherits:"standard",
		perks_list:[
			"conbook_website_mention",
			"light_stick",
			"shirt",
			"poster",
			"sticker_pack",
			"water_bottle",
			"hand_fan",
			"notepad",
			"tin_badge_sponsor"
		],
		inherit_exclude:[],
		price:75,
		limit:Infinity,
		icon:"/sprites-prototype/favorite_64dp_B89230_FILL0_wght700_GRAD0_opsz48.png"
	},
	mane:{
		name_en:"Mane Six",
		name_ko:"메인식스",
		desc_en:"A VIP tier, for bearers of the six Elements of Harmony.",
		desc_ko:"단 6명, 조화의 원소들을 위한 특별한 VIP 등급입니다.",
		css_class:"tier-mane",
		inherits:"sponsor",
		perks_list:[
			"opening_closing_mention",
			"vendor_priority",
			"acrylic_keyring",
			"towel",
			"acrylic_stand",
			"stamp",
			"embroidered_tag",
			"tin_badge_mane"
		],
		inherit_exclude:[],
		price:150,
		limit:6,
		icon:"/sprites-prototype/token_64dp_6B2346_FILL0_wght700_GRAD0_opsz48.png"
	},
	princess:{
		name_en:"Royal Princess",
		name_ko:"로얄 프린세스",
		desc_en:"This VIP tier is dedicated to the most special three Alicorn Princesses.",
		desc_ko:"알리콘의 위엄을 담아, 최상위 3명 한정 VVIP 등급입니다.",
		css_class:"tier-princess",
		inherits:"mane",
		perks_list:[
			"backstage",
			"priority_access",
			"reserved_seating",
			"custom_badge",
			"large_tapestry",
			"song_request",
			"signed_poster",
			"opening_closing_floor",
			"tin_badge_princess",
			"shipping",
			"discord_hotline",
		],
		inherit_exclude:[],
		price:400,
		limit:3,
		icon:"/sprites-prototype/crown_64dp_321D71_FILL0_wght700_GRAD0_opsz48.png"
	},
	spirit:{
		margin_top:32,
		name_en:"Spirit Badge",
		name_ko:"영혼참가",
		desc_en:"For those who can't make it to the event in person, you'll be able to support the event and receive an attendee badge.",
		desc_ko:"현장 방문이 어려운 분들을 위해 참가증만 배송해 드리는 후원 등급입니다.",
		css_class:"tier-spirit",
		perks_list:[
			"standard_badge",
			"standard_lanyard",
			"conbook"
		],
		inherit_exclude:[],
		price:20,
		limit:Infinity,
		icon:"/sprites-prototype/motion_blur_64dp_434343_FILL0_wght700_GRAD0_opsz48_FILL-A96424.png"
	},
	spirit_dx:{
		name_en:"Deluxe Spirit",
		name_ko:"디럭스 영혼참가",
		desc_en:"For those who want to sponsor the event but can't make it in person, this tier includes most of the sponsor goodies.",
		desc_ko:"현장 방문이 어려운 분들을 위해 거의 모든 공식 굿즈를 배송해 드리는 후원 등급입니다.",
		css_class:"tier-spirit-dx",
		inherits:"spirit",
		perks_list:[
			"conbook_website_mention",
			"light_stick",
			"shirt",
			"poster",
			"sticker_pack",
			"water_bottle",
			"hand_fan",
			"notepad",
			"acrylic_keyring",
			"towel",
			"acrylic_stand",
			"stamp",
			"embroidered_tag",
			"signed_poster",
			"tin_badge_spirit_dx",
		],
		inherit_exclude:[],
		price:200,
		limit:Infinity,
		icon:"/sprites-prototype/motion_blur_64dp_434343_FILL0_wght700_GRAD0_opsz48_FILL-911F1F.png"
	},
	onsite:{
		margin_top:32,
		name_en:"On-Site Badge",
		name_ko:"현장등록",
		desc_en:"We will offer a <strong>limited number</strong> of on-site registrations for those who missed the pre-registration. ",
		desc_ko:"행사 당일 현장에서 티켓을 구매하는 경우입니다. 인원이 한정되어 있으며 선착순으로 마감되니 유의해 주세요.",
		css_class:"tier-onsite",
		inherits:null,
		perks_list:["daiso_badge","conbook"],
		inherit_exclude:[],
		price:40,
		limit:14,
		icon:"/sprites-prototype/add_2_64dp_A96424_FILL0_wght700_GRAD0_opsz48_FILL-1e741e.png"
	},
};

const tin_badge_desc_ko="말랑포니의 후원자임을 증명하는 한정판 핀뱃지입니다.";
const tin_badge_desc_en="A limited-edition tin badge that shows that you've sponsored this event.";
export const perks_data={
	standard_badge:{
		name_en:"MalangPony Badge",name_ko:"말랑포니 참가증",
		desc_en:"A durable plastic badge with the event logo and your name.",
		desc_ko:"행사 로고와 참가자의 이름이 인쇄된 내구성 좋은 PVC 재질의 목걸이형 명찰입니다."},
	daiso_badge:{
		name_en:"Paper Badge",name_ko:"일반 종이 명찰",
		desc_en:"A pre-registeration plastic badge will not be provided, and a paper on-site badge will be given instead.",
		desc_ko:"사전 등록 특전(PVC 참가증)이 제공되지 않으며, 현장에서 발급되는 일반 종이 재질의 명찰이 제공됩니다."},
	
	standard_lanyard:{
		name_en:"Lanyard",name_ko:"랜야드",
		desc_en:"A soft lanyard for your badge, with MalangPony's pattern and logo.",
		desc_ko:"말랑포니의 시그니처 패턴과 로고가 인쇄된 부드러운 재질의 명찰 목걸이 줄입니다."},
	
	conbook:{
		name_en:"Conbook",name_ko:"콘북",
		desc_en:"An official MalangPony 2's conbook, with the venue information, booth information, and art.",
		desc_ko:"행사장 안내, 부스 정보, 축전 등이 담긴 말랑포니 2의 공식 책자입니다."},
	
	conbook_website_mention:{
		name_en:"Conbook &amp; Website Mention",name_ko:"콘북 &amp; 웹페이지 기재",
		desc_en:"The sponsor's name will be printed on the 'Special Thanks' page in the conbook and on the official website.",
		desc_ko:"콘북 내 'Special Thanks' 페이지와 공식 웹사이트에 후원자 닉네임을 기재해 드립니다."},
	light_stick:{
		name_en:"Pen Light",name_ko:"말랑포니 공식 펜라이트",
		desc_en:"An LED light stick with the event logo, for lighting up the floor.",
		desc_ko:"어두운 공연장을 비추는 행사 로고가 각인된 LED 응원봉입니다."},
	shirt:{
		name_en:"Official T-Shirt",name_ko:"공식 그래픽 티셔츠",
		desc_en:"A high-quality cotton T-shirt with an event artwork.",
		desc_ko:"행사 기념 일러스트가 인쇄 된 고품질 면 티셔츠입니다."},
	poster:{
		name_en:"A3 Poster",name_ko:"A3 기념 포스터",
		desc_en:"A high-quality print of this event's main visual, to remember this event by.",
		desc_ko:"이번 행사의 메인 비주얼 일러스트를 고화질로 인쇄한 소장용 포스터입니다."},
	sticker_pack:{
		name_en:"MalangPony Sticker Pack",name_ko:"말랑포니 스티커 팩",
		desc_en:"A MalangPony sticker pack, for your luggage or laptop, etc.",
		desc_ko:"캐리어, 노트북 등에 붙이기 좋은 말랑포니 스티커 세트입니다."},
	water_bottle:{
		name_en:"Water Bottle",name_ko:"워터 보틀",
		desc_en:"A plastic water bottle with this event's design.",
		desc_ko:"행사 한정 디자인이 적용된 플라스틱 물병입니다."},
	hand_fan:{
		name_en:"Hand Fan",name_ko:"일러스트 부채",
		desc_en:"A hand fan with our mascot character, that will come in handy in hot summer days.",
		desc_ko:"더운 여름날 유용하게 쓰일 마스코트 캐릭터 부채입니다."},
	notepad:{
		name_en:"Notepad",name_ko:"말랑포니 메모지",
		desc_en:"A notepad with an illustration of this event.",
		desc_ko:"말랑포니 일러스트가 들어간 떡 메모지입니다."},
	tin_badge_sponsor:{
		name_en:"Sponsor Tin Badge",name_ko:"스폰서 전용 핀뱃지",
		desc_en:tin_badge_desc_en,
		desc_ko:tin_badge_desc_ko},
	opening_closing_mention:{
		name_en:"Opening &amp; Closing Cereminies Mention",name_ko:"개·폐회식 감사의 말",
		desc_en:"We will call out your name at the start and end of the event and express gratitude for your support.",
		desc_ko:"행사 시작과 끝에 사회자가 직접 닉네임을 호명하여 감사의 인사를 전합니다."},
	vendor_priority:{
		name_en:"Vendor Zone Priority Access",name_ko:"부스존 우선 입장",
		desc_en:"You'll be able to enter the vendor zone 30 minutes earlier, so you can browse and shop more comfortably.",
		desc_ko:"일반 참가자보다 부스존에 30분 먼저 입장하여 여유롭게 부스를 둘러보고 굿즈를 구매할 수 있습니다."},
	acrylic_keyring:{
		name_en:"Acrylic Charm",name_ko:"아크릴 키링",
		desc_en:"A cute acrylic charm of our mascot that you can hang on your bags, etc.",
		desc_ko:"가방 등에 달고 다닐 수 있는 귀여운 마스코트 키링입니다."},
	towel:{
		name_en:"Towel",name_ko:"기념 타올",
		desc_en:"A limited-edition towel, designed by the MalangPony staff.",
		desc_ko:"말랑포니 운영진이 직접 디자인한 한정판 수건입니다."},
	acrylic_stand:{
		name_en:"Acrylic Stand",name_ko:"아크릴 코롯토",
		desc_en:"A 10mm-thick acrylic stand",
		desc_ko:"10mm 두께의 아크릴로 제작되어 세워둘 수 있는 입체적인 장식품입니다."},
	stamp:{
		name_en:"MalangPony Stamp",name_ko:"말랑포니 기념 도장",
		desc_en:"A limited-edition stamp, with a special MalangPony design.",
		desc_ko:"말랑포니 디자인이 새겨진 한정판 도장입니다."},
	embroidered_tag:{
		name_en:"Embroidered Tag",name_ko:"말랑포니 자수 태그",
		desc_en:"A fabric tag, with an embroidery of MalangPony mascots' cutie marks.",
		desc_ko:"말랑포니 마스코트들의 큐티마크를 정교한 자수로 표현한, 천으로 만든 키링입니다."},
	tin_badge_mane:{
		name_en:"Mane Six Tin Badge",name_ko:"메인식스 전용 핀뱃지",
		desc_en:tin_badge_desc_en,
		desc_ko:tin_badge_desc_ko,
		overwrites:["tin_badge_sponsor"]},
	backstage:{
		name_en:"Backstage Pass",name_ko:"백스테이지",
		desc_en:"A special privilege to enter the venue as early as 8AM, while the event is being set up.",
		desc_ko:"오전 8시부터 행사 준비 시간 중 어디든 미리 입장하실 수 있는 특별한 권한입니다."},
	priority_access:{
		name_en:"Super Pass",name_ko:"슈퍼 패스 (최우선 입장)",
		desc_en:"You may enter event halls and vendor zones earlier than any other attendee, even at set-up time.",
		desc_ko:"모든 참가자 중 가장 먼저 행사장 및 부스 구역에 입장할 수 있습니다. (준비 시간부터 체류 가능)",},
	reserved_seating:{
		name_en:"Reserved Seating",name_ko:"로얄프린세스 전용석",
		desc_en:"We will reserve the frontmost seats with the best view for you.",
		desc_ko:"행사 시 가장 시야가 좋은 앞열 좌석을 고정석으로 배정해 드립니다."},
	custom_badge:{
		name_en:"Custom Badge",name_ko:"커스텀 참가증 제작권",
		desc_en:"We will create a one-of-a-kind badge, incorporating your OC or any image of your choosing into the design.",
		desc_ko:"본인의 자캐(OC)나 원하는 이미지를 넣어 세상에 단 하나뿐인 플라스틱 명찰을 제작해 드립니다.",
		overwrites:["standard_badge"]},
	large_tapestry:{
		name_en:"Large Tapestry",name_ko:"대형 태피스트리",
		desc_en:"A large tapestry with a high-quality print of an artwork.",
		desc_ko:"고화질 일러스트가 인쇄된 족자봉입니다. (택배 발송 가능)"},
	song_request:{
		name_en:"Song Request in Malang The Beat!",name_ko:"말랑 더 비트! 선곡권",
		desc_en:"You'll be able to request a song in our DJ show, Malang The Beat! Fill the floor with a song of your choosing. The DJ will mention the song was requested by a VIP.",
		desc_ko:"행사의 피날레인 '말랑 더 비트', 귀하가 선택한 음악으로 플로어를 채울 수 있습니다. DJ가 VVIP의 신청곡임을 특별히 언급하며 재생해 드립니다."},
	signed_poster:{
		name_en:"Poster Signed by Staff",name_ko:"스태프 사인 포스터",
		desc_en:"A poster signed by all the staff and guests, expressing our gratitude for your support.",
		desc_ko:"행사를 만들어간 모든 스태프와 게스트의 존경과 감사가 담긴 포스터입니다."},
	opening_closing_floor:{
		name_en:"Oppertunity to Speak at Opening/Closing",name_ko:"개·폐회식 축사 권한",
		desc_en:"You'll be able to come up on stage and freely talk for a short period of time. (Optional)",
		desc_ko:"원하실 경우, 개/폐회식에서 무대에 올라와, 참가자들에게 짧은 인사나 소감을 발표할 수 있는 시간을 드립니다."},
	tin_badge_princess:{
		name_en:"Royal Princess Tin Badge",name_ko:"로얄프린세스 전용 핀뱃지",
		desc_en:tin_badge_desc_en,
		desc_ko:tin_badge_desc_ko,
		overwrites:["tin_badge_mane","tin_badge_sponsor"]},
	shipping:{
		name_en:"Shipping Service",name_ko:"배송 서비스",
		desc_en:"If needed, we will ship all the heavy merchandise you have purchased or received during the event, free of charge.",
		desc_ko:"현장에서 수령한 무거운 굿즈들을 댁까지 편안하게 택배로 발송해 드립니다."},
	discord_hotline:{
		name_en:"Discord Hotline",name_ko:"디스코드 핫라인",
		desc_en:"You'll be invited to a dedicated Discord channel that you can directly chat with the event staff. Any suggestions you tell us through this channel will be given utmost priotity.",
		desc_ko:"운영진과 직접 소통할 수 있는 전용 디스코드 채널에 초대되며, 건의사항을 말씀해 주신다면 최우선으로 검토합니다."},
	tin_badge_spirit_dx:{
		name_en:"Deluxe Spirit Tin Badge",name_ko:"디럭스 영혼참가 전용 핀뱃지",
		desc_en:tin_badge_desc_en,
		desc_ko:tin_badge_desc_ko},
};
