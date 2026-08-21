import RINKA_COUNTY from "../data/i18n/rinka-county.json";

/**
 * RINKA(MV STUDIO)のガイド演出。
 * - 県市クリック: rinka-county.json の手書きコメント(22県市×5言語)
 * - 景点詳細: 名称(繁体)のキーワードでテンプレートを選ぶ(10分類×5言語)
 * - プロフィール: 自己紹介+MV STUDIO公式サイト/YouTubeへの動線
 */
export const rinkaCounty = (iso, lang) => RINKA_COUNTY[iso]?.[lang] ?? "";

const T = {
  night: {
    zh: "夜市就是要邊走邊吃！跟我一起把小吃吃過一輪吧。",
    cn: "夜市就是要边走边吃！跟我一起把小吃吃个遍吧。",
    ja: "夜市は食べ歩きが正義！私と一緒に小吃を制覇しよ。",
    en: "Night markets are for grazing! Let's try every stall together.",
    ko: "야시장은 먹으면서 걷는 게 정답! 나랑 같이 간식 정복하자.",
  },
  street: {
    zh: "老街的紅磚和小店好有味道，隨手一拍都是明信片。",
    cn: "老街的红砖和小店好有味道，随手一拍都是明信片。",
    ja: "老街のレンガと小さなお店、どこを撮っても絵はがきみたいだよ。",
    en: "The old street's bricks and little shops - every photo looks like a postcard.",
    ko: "옛거리의 붉은 벽돌과 작은 가게들, 어디를 찍어도 엽서 같아.",
  },
  spring: {
    zh: "泡完溫泉整個人都軟綿綿的，旅途的疲勞瞬間消失！",
    cn: "泡完温泉整个人都软绵绵的，旅途的疲劳瞬间消失！",
    ja: "温泉に浸かったら体がとろけちゃう。旅の疲れも一瞬で消えるよ！",
    en: "A hot-spring soak melts me completely - travel fatigue, gone!",
    ko: "온천에 몸을 담그면 완전히 녹아버려. 여행 피로도 한순간에 사라져!",
  },
  museum: {
    zh: "慢慢逛才會發現細節的驚喜，記得留多一點時間喔。",
    cn: "慢慢逛才会发现细节的惊喜，记得留多一点时间喔。",
    ja: "ゆっくり見るほど発見がある場所。時間に余裕をもって来てね。",
    en: "The slower you wander, the more you discover - leave extra time here.",
    ko: "천천히 볼수록 발견이 많은 곳이야. 시간을 넉넉히 잡고 와.",
  },
  temple: {
    zh: "屋簷上的雕刻和香火的氣味，台灣的故事都在這裡。",
    cn: "屋檐上的雕刻和香火的气味，台湾的故事都在这里。",
    ja: "屋根の彫刻とお線香の香り。台湾の物語がぎゅっと詰まってるの。",
    en: "Carved roofs and the scent of incense - Taiwan's stories live here.",
    ko: "지붕의 조각과 향 내음. 타이완의 이야기가 가득 담겨 있어.",
  },
  mountain: {
    zh: "森林的空氣好甜！穿好走的鞋，我們慢慢往上爬。",
    cn: "森林的空气好甜！穿好走的鞋，我们慢慢往上爬。",
    ja: "森の空気が甘いの！歩きやすい靴で、ゆっくり登ろうね。",
    en: "The forest air tastes sweet! Wear comfy shoes and climb slowly with me.",
    ko: "숲의 공기가 달콤해! 편한 신발 신고 천천히 올라가자.",
  },
  sea: {
    zh: "海風好舒服！傍晚的夕陽時間來，美到你捨不得走。",
    cn: "海风好舒服！傍晚的夕阳时间来，美到你舍不得走。",
    ja: "潮風が最高に気持ちいい！夕日の時間に来たら帰れなくなるよ。",
    en: "The sea breeze feels amazing! Come at sunset and you won't want to leave.",
    ko: "바닷바람이 정말 상쾌해! 노을 시간에 오면 떠나기 싫어질걸.",
  },
  lake: {
    zh: "水面安安靜靜的，心情也跟著平靜下來了。",
    cn: "水面安安静静的，心情也跟着平静下来了。",
    ja: "静かな水面を見てると、心までゆったりしてくるの。",
    en: "The calm water quiets my mind too.",
    ko: "잔잔한 수면을 보면 마음까지 차분해져.",
  },
  park: {
    zh: "想放空的話來這裡就對了，帶點小點心野餐吧！",
    cn: "想放空的话来这里就对了，带点小点心野餐吧！",
    ja: "のんびりしたい日はここ。おやつを持ってピクニックしよ！",
    en: "Perfect for a lazy day - bring snacks and picnic with me!",
    ko: "느긋하게 쉬고 싶은 날엔 여기야. 간식 들고 소풍 가자!",
  },
  generic: {
    zh: "這裡在我的口袋名單裡！來過就懂為什麼。",
    cn: "这里在我的口袋名单里！来过就懂为什么。",
    ja: "ここ、私のお気に入りリスト入り。来ればわかるよ！",
    en: "This one's on my personal favorites list - you'll see why!",
    ko: "여기 내 즐겨찾기 리스트에 있어! 와보면 이유를 알 거야.",
  },
};

const RULES = [
  ["night", /夜市/],
  ["street", /老街|街區|眷村/],
  ["spring", /溫泉|冷泉/],
  ["museum", /博物|美術|文物|紀念|故事館|園區|文化|水族/],
  ["temple", /寺|廟|宮|祠|堂|教堂/],
  ["mountain", /山|步道|森林|瀑布|國家公園|樹|岩/],
  ["sea", /海|濱|灣|島|燈塔|沙灘|漁港|藍|潮/],
  ["lake", /湖|潭|池|水庫/],
  ["park", /公園|農場|牧場|花|植物園|綠/],
];

export const rinkaSpot = (spot, lang) => {
  const zh = spot.name.zh;
  for (const [key, re] of RULES) {
    if (re.test(zh)) return T[key][lang] ?? T[key].en;
  }
  return T.generic[lang] ?? T.generic.en;
};

export const RINKA_PROFILE = {
  zh: {
    intro: "我是RINKA，MV STUDIO的虛擬藝人。平常在唱歌、拍MV，這次擔任台灣旅遊的導覽員！",
    site: "MV STUDIO 官方網站",
    yt: "YouTube 頻道",
  },
  cn: {
    intro: "我是RINKA，MV STUDIO的虚拟艺人。平时在唱歌、拍MV，这次担任台湾旅游的导览员！",
    site: "MV STUDIO 官方网站",
    yt: "YouTube 频道",
  },
  ja: {
    intro: "RINKAだよ。MV STUDIO所属のバーチャルアーティスト。普段は歌とMVづくり、今回は台湾旅行の案内人をしてるの！",
    site: "MV STUDIO 公式サイト",
    yt: "YouTubeチャンネル",
  },
  en: {
    intro: "I'm RINKA, a virtual artist from MV STUDIO. I usually sing and make music videos - today I'm your Taiwan travel guide!",
    site: "MV STUDIO official site",
    yt: "YouTube channel",
  },
  ko: {
    intro: "나는 RINKA, MV STUDIO 소속 버추얼 아티스트야. 평소엔 노래와 뮤직비디오를 만들고, 이번엔 타이완 여행 가이드를 맡았어!",
    site: "MV STUDIO 공식 사이트",
    yt: "YouTube 채널",
  },
};

export const RINKA_LINKS = {
  site: "https://ethanjapan.github.io/mv-studio-site/",
  yt: "https://www.youtube.com/@mvstudio_by_linlin",
};
