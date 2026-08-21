/**
 * 台湾全体の旅行実用情報(交通・お金・通信・気候・緊急)。3言語の静的コンテンツ。
 * 出典: 一般に公知の制度情報(2026-08時点)。運賃・料金は目安として書かない方針
 * (改定で腐るため。制度名と使い方だけを載せる)。
 */
export const TRAVEL_INFO = {
  zh: {
    title: "台灣旅遊實用資訊",
    sections: [
      { h: "交通", lines: [
        "高鐵(HSR): 台北—左營(高雄)約1.5〜2小時，串起西部主要城市。",
        "台鐵(TRA): 環島鐵路網，東部(宜蘭/花蓮/台東)與支線(平溪/集集/內灣)之旅的主角。",
        "捷運(MRT): 台北/桃園機場/台中/高雄。悠遊卡或一卡通全線通用。",
        "悠遊卡(EasyCard): 捷運/公車/台鐵/超商都能用，超商即可購買儲值。",
        "台灣好行: 串接主要景點的觀光巴士路線，適合無自駕的旅客。",
        "YouBike: 公共自行車，悠遊卡+手機註冊即可租借。",
      ]},
      { h: "金錢", lines: [
        "貨幣為新台幣(TWD)。夜市與小吃店多為現金交易，準備零錢較方便。",
        "機場與市區銀行皆可換匯；便利商店ATM多支援海外卡提領。",
        "不需給小費(部分餐廳收10%服務費)。",
      ]},
      { h: "通訊", lines: [
        "桃園/松山/高雄機場可購買旅客SIM/eSIM，吃到飽方案普遍。",
        "車站/超商/捷運多有免費Wi-Fi(iTaiwan等)。",
      ]},
      { h: "氣候與季節", lines: [
        "3〜5月春季舒適；6〜9月炎熱多雨並有颱風；10〜11月秋高氣爽最宜旅行；12〜2月北部濕冷、南部溫暖。",
        "山區(阿里山/太平山/合歡山)早晚溫差大，請備保暖衣物。",
      ]},
      { h: "緊急與禮儀", lines: [
        "報警110／火警救護119。外國旅客24小時服務專線0800-011-765。",
        "捷運車廂內禁止飲食(含飲料與口香糖)。",
        "電壓110V、插座與日本/美國同型。",
      ]},
      { h: "官方網站(即時資訊)", lines: ["台灣高鐵 thsrc.com.tw ／ 台鐵 tip.railway.gov.tw", "桃園機場 taoyuan-airport.com ／ 台灣好行 taiwantrip.com.tw", "訂房(觀光署 台灣旅宿網) taiwanstay.net.tw", "交通部觀光署 taiwan.net.tw"] },
    ],
  },
  ja: {
    title: "台湾 旅の基本情報",
    sections: [
      { h: "交通", lines: [
        "高鉄(新幹線): 台北—左営(高雄)を約1.5〜2時間で結ぶ。西海岸の主要都市を網羅。",
        "台鉄(在来線): 島を一周する鉄道網。東部(宜蘭・花蓮・台東)やローカル線(平渓線・集集線・内湾線)の旅の主役。",
        "MRT(地下鉄): 台北・桃園空港・台中・高雄にあり。悠遊カードが全線で使える。",
        "悠遊カード(EasyCard): MRT・バス・台鉄・コンビニで使える交通系IC。コンビニで購入・チャージ可能。",
        "台湾好行バス: 主要観光地を結ぶ観光路線バス。車なし旅行の強い味方。",
        "YouBike: シェアサイクル。悠遊カード+携帯番号の登録で借りられる。",
      ]},
      { h: "お金", lines: [
        "通貨は新台湾ドル(TWD)。夜市や食堂は現金主体なので小銭があると便利。",
        "両替は空港・市中銀行で。コンビニATMの海外カード引き出しも広く対応。",
        "チップの習慣はなし(レストランはサービス料10%が付く店あり)。",
      ]},
      { h: "通信", lines: [
        "桃園・松山・高雄空港で旅行者向けSIM/eSIMを購入可能。使い放題プランが主流。",
        "駅・コンビニ・MRTなど無料Wi-Fi(iTaiwan等)も多い。",
      ]},
      { h: "気候とベストシーズン", lines: [
        "3〜5月は快適な春。6〜9月は蒸し暑く台風期。10〜11月が最も旅行向き。12〜2月は北部が湿った寒さ、南部は温暖。",
        "山岳部(阿里山・太平山・合歓山)は朝晩冷えるので防寒を。",
      ]},
      { h: "緊急・マナー", lines: [
        "警察110／消防・救急119。外国人旅行者ホットライン0800-011-765(24時間・日本語可)。",
        "MRT車内は飲食禁止(飲み物・ガムも不可)。",
        "電圧110V・プラグは日本と同じAタイプ(変換不要)。",
      ]},
      { h: "公式サイト(最新情報はこちら)", lines: ["台湾高鉄 thsrc.com.tw ／ 台鉄 tip.railway.gov.tw", "桃園空港 taoyuan-airport.com ／ 台湾好行バス taiwantrip.com.tw", "宿泊予約(観光署公式 台湾旅宿網) taiwanstay.net.tw", "台湾観光庁 taiwan.net.tw"] },
    ],
  },
  en: {
    title: "Taiwan travel essentials",
    sections: [
      { h: "Getting around", lines: [
        "HSR (high-speed rail): Taipei to Zuoying (Kaohsiung) in about 1.5-2 hours, covering the west coast.",
        "TRA (railway): loops the whole island - the way to reach the east coast and branch lines like Pingxi.",
        "Metro: Taipei, Taoyuan Airport, Taichung and Kaohsiung. EasyCard works on all of them.",
        "EasyCard: tap-and-go card for metro, buses, trains and convenience stores. Buy and top up at any convenience store.",
        "Taiwan Tourist Shuttle: bus routes linking major sights - great without a car.",
        "YouBike: public bikes, rentable with an EasyCard plus phone registration.",
      ]},
      { h: "Money", lines: [
        "Currency is the New Taiwan Dollar (TWD). Night markets are mostly cash - keep small bills.",
        "Exchange at airports and banks; convenience-store ATMs widely accept foreign cards.",
        "No tipping culture (some restaurants add a 10% service charge).",
      ]},
      { h: "Connectivity", lines: [
        "Tourist SIM/eSIM with unlimited data is easy to buy at Taoyuan, Songshan and Kaohsiung airports.",
        "Free Wi-Fi (iTaiwan and others) at stations, metro and convenience stores.",
      ]},
      { h: "Weather and seasons", lines: [
        "Mar-May is pleasant spring; Jun-Sep is hot, humid and typhoon season; Oct-Nov is the best time to visit; Dec-Feb is damp-cool in the north, mild in the south.",
        "Mountain areas (Alishan, Taipingshan, Hehuanshan) get cold at night - bring layers.",
      ]},
      { h: "Emergency and etiquette", lines: [
        "Police 110 / Fire and ambulance 119. 24h tourist hotline 0800-011-765 (English available).",
        "No eating or drinking inside the metro (including gum and drinks).",
        "Voltage is 110V with US-style type-A plugs.",
      ]},
      { h: "Official sites (live info)", lines: ["HSR thsrc.com.tw / TRA tip.railway.gov.tw", "Taoyuan Airport taoyuan-airport.com / Tourist Shuttle taiwantrip.com.tw", "Official lodging portal taiwanstay.net.tw", "Tourism Administration taiwan.net.tw"] },
    ],
  },
  cn: {
    title: "台湾旅游实用资讯",
    sections: [
      { h: "交通", lines: [
        "高铁(HSR): 台北—左营(高雄)约1.5〜2小时，串起西部主要城市。",
        "台铁(TRA): 环岛铁路网，东部(宜兰/花莲/台东)与支线(平溪/集集/内湾)之旅的主角。",
        "捷运(MRT): 台北/桃园机场/台中/高雄。悠游卡或一卡通全线通用。",
        "悠游卡(EasyCard): 捷运/公车/台铁/便利店都能用，便利店即可购买充值。",
        "台湾好行: 串接主要景点的观光巴士路线，适合无自驾的旅客。",
        "YouBike: 公共自行车，悠游卡+手机注册即可租借。",
      ]},
      { h: "金钱", lines: [
        "货币为新台币(TWD)。夜市与小吃店多为现金交易，准备零钱较方便。",
        "机场与市区银行皆可换汇；便利店ATM多支持海外卡提取。",
        "不需给小费(部分餐厅收10%服务费)。",
      ]},
      { h: "通讯", lines: [
        "桃园/松山/高雄机场可购买旅客SIM/eSIM，不限量方案普遍。",
        "车站/便利店/捷运多有免费Wi-Fi(iTaiwan等)。",
      ]},
      { h: "气候与季节", lines: [
        "3〜5月春季舒适；6〜9月炎热多雨并有台风；10〜11月秋高气爽最宜旅行；12〜2月北部湿冷、南部温暖。",
        "山区(阿里山/太平山/合欢山)早晚温差大，请备保暖衣物。",
      ]},
      { h: "紧急与礼仪", lines: [
        "报警110／火警救护119。外国旅客24小时服务专线0800-011-765。",
        "捷运车厢内禁止饮食(含饮料与口香糖)。",
        "电压110V、插座与日本/美国同型。",
      ]},
      { h: "官方网站(实时资讯)", lines: ["台湾高铁 thsrc.com.tw ／ 台铁 tip.railway.gov.tw", "桃园机场 taoyuan-airport.com ／ 台湾好行 taiwantrip.com.tw", "订房(观光署 台湾旅宿网) taiwanstay.net.tw", "交通部观光署 taiwan.net.tw"] },
    ],
  },
  ko: {
    title: "타이완 여행 기본 정보",
    sections: [
      { h: "교통", lines: [
        "고속철도(HSR): 타이베이—쭤잉(가오슝)을 약 1.5~2시간에 연결. 서부 주요 도시를 커버.",
        "타이완 철도(TRA): 섬을 한 바퀴 도는 철도망. 동부(이란·화롄·타이둥)와 지선(핑시선 등) 여행의 주역.",
        "지하철(MRT): 타이베이·타오위안공항·타이중·가오슝. 이지카드로 전 노선 이용 가능.",
        "이지카드(EasyCard): 지하철·버스·기차·편의점에서 쓰는 교통카드. 편의점에서 구매·충전.",
        "타이완 하오싱: 주요 관광지를 잇는 관광버스. 렌터카 없는 여행의 든든한 친구.",
        "YouBike: 공공자전거. 이지카드+휴대폰 등록으로 대여 가능.",
      ]},
      { h: "돈", lines: [
        "통화는 신타이완달러(TWD). 야시장과 식당은 현금 위주이니 잔돈을 준비하면 편리.",
        "환전은 공항·시내 은행에서. 편의점 ATM 대부분 해외 카드 출금 지원.",
        "팁 문화 없음(일부 레스토랑은 봉사료 10% 부과).",
      ]},
      { h: "통신", lines: [
        "타오위안·쑹산·가오슝 공항에서 여행자 SIM/eSIM 구매 가능. 무제한 요금제가 일반적.",
        "역·편의점·지하철 등에 무료 Wi-Fi(iTaiwan 등)도 많다.",
      ]},
      { h: "기후와 시즌", lines: [
        "3~5월은 쾌적한 봄. 6~9월은 덥고 습하며 태풍철. 10~11월이 여행 최적기. 12~2월은 북부는 습한 추위, 남부는 온화.",
        "산악 지역(아리산·타이핑산·허환산)은 아침저녁 일교차가 크니 방한복을.",
      ]},
      { h: "긴급·매너", lines: [
        "경찰 110 / 소방·구급 119. 외국인 관광객 24시간 핫라인 0800-011-765.",
        "지하철 안에서는 취식 금지(음료·껌 포함).",
        "전압 110V, 플러그는 A타입(한국 여행자는 변환 어댑터 필요).",
      ]},
      { h: "공식 사이트(실시간 정보)", lines: ["고속철도 thsrc.com.tw / 타이완철도 tip.railway.gov.tw", "타오위안공항 taoyuan-airport.com / 하오싱버스 taiwantrip.com.tw", "숙박 예약(관광서 공식) taiwanstay.net.tw", "관광서 taiwan.net.tw"] },
    ],
  },
};

/**
 * 空港→市内アクセスのフロー図データ(5言語)。
 * 所要時間の出典(2026-08-21 Web確認): 機捷直達車36〜39分/普通車49分・約15分毎(tymetro/Trip.com)、
 * 國光1819約55分・24時間(kkday他)、空港→A18高鐵桃園16〜19分(tymetro)。運賃は書かない方針。
 */
export const TRANSIT = {
  zh: {
    h: "從機場到市區",
    airport: "桃園國際機場",
    taipei: "台北車站",
    hsr: "高鐵桃園站",
    routes: [
      { name: "機場捷運(直達車)", time: "36〜39分", note: "約15分一班", best: true },
      { name: "客運巴士 1819", time: "約55分", note: "24小時行駛" },
      { name: "計程車", time: "約40〜60分", note: "依路況而定" },
    ],
    onward: ["高鐵", "台鐵", "捷運MRT"],
    southRoute: { via: "機場捷運 16〜19分", to: "往台中・台南・高雄" },
    card: {
      h: "悠遊卡的用法",
      steps: ["在便利商店或車站購買", "用現金儲值(便利商店/售票機)", "捷運・公車感應即可搭乘", "便利商店小額付款也能用"],
    },
  },
  cn: {
    h: "从机场到市区",
    airport: "桃园国际机场",
    taipei: "台北车站",
    hsr: "高铁桃园站",
    routes: [
      { name: "机场捷运(直达车)", time: "36〜39分", note: "约15分一班", best: true },
      { name: "客运巴士 1819", time: "约55分", note: "24小时运行" },
      { name: "出租车", time: "约40〜60分", note: "视路况而定" },
    ],
    onward: ["高铁", "台铁", "捷运MRT"],
    southRoute: { via: "机场捷运 16〜19分", to: "往台中・台南・高雄" },
    card: {
      h: "悠游卡的用法",
      steps: ["在便利店或车站购买", "用现金充值(便利店/售票机)", "地铁・公交刷卡即乘", "便利店小额支付也能用"],
    },
  },
  ja: {
    h: "空港から市内へ",
    airport: "桃園国際空港",
    taipei: "台北駅",
    hsr: "高鉄桃園駅",
    routes: [
      { name: "空港MRT(直達車)", time: "36〜39分", note: "約15分間隔", best: true },
      { name: "リムジンバス1819", time: "約55分", note: "24時間運行" },
      { name: "タクシー", time: "約40〜60分", note: "道路状況による" },
    ],
    onward: ["高鉄", "台鉄", "MRT"],
    southRoute: { via: "空港MRTで16〜19分", to: "台中・台南・高雄方面へ" },
    card: {
      h: "悠遊カードの使い方",
      steps: ["コンビニか駅で購入", "現金でチャージ(コンビニ/券売機)", "MRT・バスはタッチで乗車", "コンビニの少額払いにも使える"],
    },
  },
  en: {
    h: "From the airport to the city",
    airport: "Taoyuan Int'l Airport",
    taipei: "Taipei Main Station",
    hsr: "HSR Taoyuan Station",
    routes: [
      { name: "Airport MRT (Express)", time: "36-39 min", note: "every ~15 min", best: true },
      { name: "Bus 1819", time: "~55 min", note: "runs 24h" },
      { name: "Taxi", time: "40-60 min", note: "depends on traffic" },
    ],
    onward: ["HSR", "TRA", "Metro"],
    southRoute: { via: "Airport MRT, 16-19 min", to: "for Taichung / Tainan / Kaohsiung" },
    card: {
      h: "How to use EasyCard",
      steps: ["Buy at any convenience store or station", "Top up with cash (store / machine)", "Tap to ride metro and buses", "Also pays at convenience stores"],
    },
  },
  ko: {
    h: "공항에서 시내로",
    airport: "타오위안 국제공항",
    taipei: "타이베이역",
    hsr: "고속철도 타오위안역",
    routes: [
      { name: "공항 MRT(직행)", time: "36〜39분", note: "약 15분 간격", best: true },
      { name: "리무진 버스 1819", time: "약 55분", note: "24시간 운행" },
      { name: "택시", time: "약 40〜60분", note: "교통 상황에 따라" },
    ],
    onward: ["고속철도", "타이완철도", "MRT"],
    southRoute: { via: "공항 MRT 16〜19분", to: "타이중・타이난・가오슝 방면" },
    card: {
      h: "이지카드 사용법",
      steps: ["편의점이나 역에서 구매", "현금으로 충전(편의점/발매기)", "지하철・버스는 태그하고 탑승", "편의점 소액 결제도 가능"],
    },
  },
};

/**
 * 交通部觀光署の公式プロモーション動画(YouTube)。
 * 出典: 観光署 國際宣傳ページ(taiwan.net.tw sNo=0027335)・日本語CMページ(jp.taiwan.net.tw sNo=0003169)、
 * 公式チャンネル https://www.youtube.com/user/TheTbroc (2026-08-21確認)。
 * 埋め込みは click-to-play(サムネのみ先読み・iframeはクリック時に生成)。
 */
export const PROMO_VIDEOS = {
  zh: {
    h: "官方宣傳影片",
    more: "更多影片(觀光署官方)",
    moreUrl: "https://www.taiwan.net.tw/m1.aspx?sNo=0027335",
    items: [
      { id: "KDhH5YEZREs", t: "TAIWAN – Waves of Wonder 品牌動畫" },
      { id: "kesxo-pcGpw", t: "Waves of Wonder — Discover NOW" },
    ],
  },
  cn: {
    h: "官方宣传影片",
    more: "更多影片(观光署官方)",
    moreUrl: "https://www.taiwan.net.tw/m1.aspx?sNo=0027335",
    items: [
      { id: "KDhH5YEZREs", t: "TAIWAN – Waves of Wonder 品牌动画" },
      { id: "kesxo-pcGpw", t: "Waves of Wonder — Discover NOW" },
    ],
  },
  ja: {
    h: "公式プロモーション動画",
    more: "もっと見る(観光署 CM・動画)",
    moreUrl: "https://jp.taiwan.net.tw/m1.aspx?sNo=0003169",
    items: [
      { id: "LHBURIj3d0k", t: "Taiwan – Waves of Wonder(日本語版)" },
      { id: "wUjrA1weUKs", t: "Time For Taiwan(日本語版)" },
    ],
  },
  en: {
    h: "Official promo videos",
    more: "More videos (Tourism Administration)",
    moreUrl: "https://eng.taiwan.net.tw/",
    items: [
      { id: "uw6fBQyJGhw", t: "Taiwan – Waves of Wonder (EN)" },
      { id: "kesxo-pcGpw", t: "Waves of Wonder — Discover NOW" },
    ],
  },
  ko: {
    h: "공식 홍보 영상",
    more: "더 보기(관광서 공식 채널)",
    moreUrl: "https://www.youtube.com/user/TheTbroc",
    items: [
      { id: "3hMY0OurVlQ", t: "타이완! 곧 다시 만나요!(한국 시장편)" },
      { id: "KDhH5YEZREs", t: "TAIWAN – Waves of Wonder" },
    ],
  },
};
