
export let questions=[
	/*
	{
		qtext_ko:"",
		qtext_en:"",
		atext_ko:"",
		atext_en:"",
		categories:[]
	},
	*/
	{
		qtext_ko:"행사에 못가게 되었어요! 혹시 환불을 받을 수 있을까요?",
		qtext_en:"I can't make it to the event! Can I get a refund?",
		atext_ko:"티켓 판매 마감일인 6월 30일 전까지 환불이 가능합니다. 환불이 필요한 경우, 공식 계정으로 연락해 주시면 환불을 도와드리겠습니다.",
		atext_en:"The tickets may be refunded until June 30th, Korean Time (KST; GMT+9). Contact us through any of the official channels to get your ticket refunded.",
		categories:[]
	},
	{
		qtext_ko:"참가증 양도가 가능한가요?",
		qtext_en:"Can the tickets be transferred?",
		atext_ko:"티켓 판매 마감일인 6월 30일 전까지 위치폼의 양도 기능을 사용하여 티켓을 자유롭게 양도하실 수 있습니다.",
		atext_en:"You may use the WitchForm's transfer function to transfer tickets before June 30th. However, if you have purchased the ticket through Ko-Fi, you will need to contact us.",
		categories:[]
	},
	{
		qtext_ko:"굿즈들을 가져와도 되나요?",
		qtext_en:"Can I show off my merch?",
		atext_ko:"네, 굿즈를 자유롭게 가져오실 수 있습니다.\"굿즈 전시대\"도 준비되어 있으니, 자신의 굿즈들을 가져와서 자랑해 보세요!",
		atext_en:"You are free to bring all your pony merch. There's also a dedicated area for showing off your pony merchandise, so brag away!",
		categories:[]
	},
	{
		qtext_ko:"점심이나 저녁시간이 있나요?",
		qtext_en:"Is there time for having lunch or dinner?",
		atext_ko:"점심이나 저녁시간은 따로 마련되어 있지 않지만, 행사 도중 언제든지 자유롭게 나가셔서 식사를 하고 오셔도 됩니다.",
		atext_en:"There's no official lunch or dinner time in the event timetable, but you may go outside and get food anytime during the event and return.",
		categories:[]
	},
	{
		qtext_ko:"입장은 언제까지 해야 하나요?",
		qtext_en:"Do I need to be on-time for the event?",
		atext_ko:"행사 시작 시간에 맞춰서 오지 않으셔도 되지만, 참가증 수령은 18시까지만 가능합니다.",
		atext_en:"You do not need to be on time for the opening ceremonies. However, the registration desk closes at 6PM.",
		categories:[]
	},
	{
		qtext_ko:"패널 도중에 들어가거나 나가도 되나요?",
		qtext_en:"Can I leave during a panel?",
		atext_ko:"패널 도중 자유롭게 입장, 퇴장하셔도 됩니다.",
		atext_en:"You are free to leave and enter anytime during any panel.",
		categories:[]
	},
	{
		qtext_ko:"행사가 끝날 때까지 꼭 남아있어야 하나요?",
		qtext_en:"Do I need to stay until the end of the event?",
		atext_ko:"행사 중 언제든지 나가셔도 됩니다.",
		atext_en:"You can leave anytime during the event.",
		categories:[]
	},
	{
		qtext_ko:"패널, 아트갤러리, 부스를 지원하고 싶어요!",
		qtext_en:"I want to apply to be a panelist / submit my art to the art gallery / be a vendor!",
		atext_ko:"웹페이지의 \"참가하기\" 페이지들을 확인해 주세요.",
		atext_en:"Please refer to the \"Participate\" pages on the website.",
		categories:[]
	},
	{
		qtext_ko:"부스에 인원 수 제한이 있나요?",
		qtext_en:"Is there a limit to how many people can be in a single vendor booth?",
		atext_ko:"부스인원에 대한 제약은 없습니다! 다만 부스 하나당 의자는 두개씩 주어지며, 부스 운영자 모두 말랑포니 입장권을 따로 구매하셔야 합니다.",
		atext_en:"There is no hard limit on the number of people. However, there are only two seats per table, and everyone needs to have a badge to the event.",
		categories:[]
	},
	{
		qtext_ko:"코스프레나 퍼슈팅이 가능한가요?",
		qtext_en:"Is cosplay and fursuiting allowed?",
		atext_ko:"코스프레나 퍼슈팅을 하는 것은 가능하지만, 행사장에 탈의실이나 지원 시설은 없으니 참고하시기 바랍니다.",
		atext_en:"You are free to cosplay and fursuit in the venue, but be aware that there are no changing rooms or other supporting facilities in the venue.",
		categories:[]
	},
	{
		qtext_ko:"행사장 내부에서 음식물 섭취가 가능한가요?",
		qtext_en:"Can I bring food and eat during the event?",
		atext_ko:"행사중에 음료나 간단한 간식을 드시는 것은 가능하지만, 냄새나 소리가 다른 참가자들에게 방해가 되지 않도록 해주세요.",
		atext_en:"You are free to have a snack and drink during the event, but make sure the smell or the noise don't bother the other participants.",
		categories:[]
	},
	{
		qtext_ko:"문의를 하고 싶어요! 어디서 할 수 있을까요?",
		qtext_en:"I have other questions! Where can I ask them?",
		atext_ko:"공식 디스코드, 트위터, 블루스카이, 또는 이메일을 활용해 주세요.",
		atext_en:"Feel free to contact us via our official Discord, Twitter, Bluesky, or email.",
		categories:[]
	},
	{
		qtext_ko:"최고의 포니는 누구인가요?",
		qtext_en:"Who is the best pony?",
		atext_ko:"트와일라잇 스파클!<br>트와일라잇 스파클!<br>트와일라잇 스파클!",
		atext_en:"Twilight sparkle!<br>Twilight sparkle!<br>Twilight sparkle!",
		dynamic_text_generator:function(){
			// I am quite fond of Twilight Sparkle
			let names=[
				[25,"Twilight Sparkle","트와일라잇 스파클"],
				[ 5,"Rarity","래리티"],
				[ 5,"Rainbow Dash","레인보우 대시"],
				[ 5,"Fluttershy","플러터샤이"],
				[ 5,"Pinkie Pie","핑키 파이"],
				[ 5,"Applejack","애플잭"],
				[ 3,"Princess Luna","루나 공주"],
				[ 3,"Princess Celestia","셀레스티아 공주"],
				[ 3,"Princess Cadance","케이던스 공주"],
				[ 3,"Sunset Shimmer","선셋 쉬머"],
				[ 3,"Trixie","트릭시"],
				[ 3,"Spike","스파이크"],
				[ 3,"Starlight Glimmer","스타라이트 글리머"],
				[ 2,"Applebloom","애플블룸"],
				[ 2,"Scootaloo","스쿠틀루"],
				[ 2,"Sweetie Belle","스위티 벨"],
				[ 1,"Derpy Hooves","더피 후브즈"],
				[ 1,"Queen Chrysalis","크리살리스 여왕"],
				[ 1,"Discord","디스코드"],
				[ 1,"Lyra Heartstrings","라이라 하트스트링즈"],
				[ 1,"Bon Bon","봉봉"],
				[ 1,"DJ DON-3","DJ-PON3"],
				[ 1,"Octavia Meoldy","옥타비아 멜로디"],
				[ 1,"Big Macintosh","빅 매킨토시"],
				[ 1,"Shining Armor","샤이닝 아머"],
				[ 2,"Sunny Starscout","써니 스타스카우트"],
				[ 2,"Izzy Moonbow","이지 문보우"],
				[ 2,"Pipp Petals","핍 페탈즈"],
				[ 2,"Zipp Storm","집 스톰"],
				[ 2,"Hitch","히치"],
				[ 2,"Misty Brightdawn","미스티 브라이트돈"],
			];
			let weights_sum=0;
			for (const n of names){
				weights_sum+=n[0];
			}
			let rand=Math.random()*weights_sum;
			for (const n of names){
				rand-=n[0];
				let excitement="!".repeat(2+Math.random()*8);
				if (rand<0) return {"en":n[1]+excitement,"ko":n[2]+excitement};
			}
			
		},
		categories:[]
	},
];

export let categories={
	ticket:{en:"Ticket",ko:"참가증"},
};
