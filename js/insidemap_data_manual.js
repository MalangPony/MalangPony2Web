// Data for the internal map.
// This data is manually input.

// Zones. The actual boundaries are defined over at insidemap_data_auto.js
export const zone_data={
  entrance:{
    name_ko:"입구",
    name_en:"Entrance",
    desc_ko:"",
    desc_en:"",
    category:"facility",
    priority:2
  },
  main:{
    name_ko:"메인 홀",
    name_en:"Main Hall",
    desc_ko:"",
    desc_en:"",
    category:"area",
    priority:1
  },
  lobby:{
    name_ko:"로비",
    name_en:"Lobby",
    desc_ko:"",
    desc_en:"",
    category:"area",
    priority:1
  },
  sub:{
    name_ko:"서브 홀",
    name_en:"Sub Hall",
    desc_ko:"소규모 패널과 활동이\n진행되는 공간입니다.",
    desc_en:"A place for smaller\npanels and activities.",
    category:"sub",
    priority:2
  },
  storage:{
    name_ko:"창고",
    name_en:"Storage",
    desc_ko:"스태프 전용 공간입니다.",
    desc_en:"Staff-only area.",
    category:"offlimit",
    priority:2
  },
  gallery:{
    name_ko:"아트 갤러리",
    name_en:"Art Gallery",
    desc_ko:"참가자들이 직접 제작한\n팬아트를 전시하는 공간입니다.",
    desc_en:"An art gallery of fanart\nsubmitted by other attendees.",
    category:"persistent",
    priority:2
  },
  regDesk:{
    name_ko:"등록 데스크",
    name_en:"Registration",
    desc_ko:"등록 데스크에서\n참가증과 특전을 수령하세요.",
    desc_en:"Redeem your badge and goodies\nfrom the registration desk.",
    category:"reg",
    priority:2
  },
  signboard:{
    name_ko:"사인보드",
    name_en:"Doodle Board",
    desc_ko:"방명록과 낙서를 그릴 수 있는\n거대한 캔버스!",
    desc_en:"A HUGE canvas for\nall your doodles and signatures.",
    category:"persistent",
    priority:2
  },
  stage:{
    name_ko:"메인 무대",
    name_en:"Main Stage",
    desc_ko:"말랑포니의 중심!",
    desc_en:"The center stage!",
    category:"main",
    priority:2
  },
  control:{
    name_ko:"본부석",
    name_en:"HQ",
    desc_ko:"문의사항이 생기면 여기로 와주세요.",
    desc_en:"Here's where you can get help\nif you ever need it.",
    category:"reg",
    priority:2
  },
  vendor:{
    name_ko:"부스 존",
    name_en:"Vendor Zone",
    desc_ko:"부스에서 포니 굿즈를 구매하세요!",
    desc_en:"Check out all the pony merch\nat the Vendor Zone!",
    category:"vendor",
    priority:2
  },
  snack:{
    name_ko:"스낵 바",
    name_en:"Snack Bar",
    desc_ko:"출출하신 분들을 위해\n간식이 준비되어 있습니다.",
    desc_en:"Some food and drinks\nfor the hungry and thirsty.",
    category:"persistent",
    priority:2
  },
  seating:{
    name_ko:"메인 관중석",
    name_en:"Main\nSeating",
    desc_ko:"",
    desc_en:"",
    category:"main",
    priority:2
  },
  drawing:{
    name_ko:"그림 라운지",
    name_en:"Drawing\nLounge",
    desc_ko:"잠깐 쉬어가며 포니 그림을 그리고\n담소도 나눌 수 있는 공간입니다.",
    desc_en:"Take a break, draw ponies, and chat.",
    category:"persistent",
    priority:2
  },
  shrine:{
    name_ko:"굿즈 전시대",
    name_en:"Merch Shrine",
    desc_ko:"누구나 포니 굿즈를 가져와서\n전시할 수 있는 공간입니다.",
    desc_en:"A place to show off\nyour pony merch.",
    category:"persistent",
    priority:2
  },
  restroom:{
    name_ko:"화장실",
    name_en:"Restrooms",
    desc_ko:"",
    desc_en:"",
    category:"facility",
    priority:2
  },
};

// Categories. Defines the colors.
export let category_data={
  base:{
    color_light:"#000",
    color_dark:"#FFF",
    
    alpha_border_active:80,
    alpha_border_inactive:50,
    
    alpha_fill_active:50,
    alpha_fill_inactive:20,
    
    alpha_title_active:100,
    alpha_title_inactive:100,
  },
  
  area:{ 
    color_light:"#AD8CD9", //#765C99 --template-malang-TWI --template-malang-TS
    color_dark:"#765C99",
    alpha_title_inactive:0,
    alpha_fill_inactive:0,
  },
  main:{ 
    color_light:"#afe0ff", //--color-timetable-panel-main
    color_dark:"#3e93cc",
  },
  sub:{ 
    color_light:"#ffd1a9", //--color-timetable-panel-open
    color_dark:"#dd9954",
  },
  persistent:{ 
    color_light:"#AFFAD7", //--color-timetable-long-running
    color_dark:"#3abe80",
  },
  reg:{ 
    color_light:"#F8FAB5", //--color-timetable-event-critical
    color_dark:"#ac9e08",
  },
  vendor:{ 
    color_light:"#FFCCFF", //--color-timetable-vendor-main
    color_dark:"#a64ca5",
  },
  facility:{
    color_light:"#DDD",
    color_dark:"#222",
  },
  offlimit:{
    color_light:"#C33",
    color_dark:"#F77",
  }
};
// Copy all non-existing keys from ["base"]
for (const k in category_data){
  if (k=="base") continue;
  for (const d in category_data["base"]){
    if (category_data[k][d]===undefined){
      category_data[k][d]=category_data["base"][d];
    }
  }
}
