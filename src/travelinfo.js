/**
 * 台湾全体の旅行実用情報(交通・お金・通信・気候・緊急)。3言語の静的コンテンツ。
 * 出典: 一般に公知の制度情報(2026-08時点)。運賃・料金は目安として書かない方針
 * (改定で腐るため。制度名と使い方だけを載せる)。
 */
export const TRAVEL_INFO = {
  "zh": {
    "title": "台灣旅遊實用資訊",
    "sections": [
      {
        "id": "entry",
        "h": "入境",
        "gist": "免簽也要先線上填入境卡",
        "rows": [
          [
            "免簽證",
            "多數國家可免簽入境，可停留天數依國籍分為90天、30天、14天。實際條件以外交部領事事務局公告為準。"
          ],
          [
            "入境卡 TWAC",
            "免簽入境需在線上填寫台灣入境卡(TWAC)，不再發紙本。出發前先填好，落地會快很多。"
          ]
        ]
      },
      {
        "id": "rail",
        "h": "交通",
        "gist": "高鐵、台鐵、捷運與觀光巴士",
        "rows": [
          [
            "高鐵(HSR)",
            "台北—左營(高雄)約1.5〜2小時，串起西部主要城市。"
          ],
          [
            "台鐵(TRA)",
            "環島鐵路網，東部(宜蘭/花蓮/台東)與支線(平溪/集集/內灣)之旅的主角。"
          ],
          [
            "捷運(MRT)",
            "台北/桃園機場/台中/高雄。悠遊卡或一卡通全線通用。"
          ],
          [
            "台灣好行",
            "串接主要景點的觀光巴士路線，適合無自駕的旅客。"
          ],
          [
            "YouBike",
            "公共自行車，悠遊卡+手機註冊即可租借。"
          ]
        ]
      },
      {
        "id": "ic",
        "h": "交通IC卡",
        "gist": "一張卡走遍捷運、公車與超商",
        "kind": "ic",
        "rows": [
          [
            "悠遊卡(EasyCard)",
            "捷運/公車/台鐵/超商都能用，超商即可購買儲值。"
          ]
        ]
      },
      {
        "id": "money",
        "h": "金錢",
        "gist": "現金仍然重要，沒有小費文化",
        "rows": [
          [
            "貨幣",
            "貨幣為新台幣(TWD)。夜市與小吃店多為現金交易，準備零錢較方便。"
          ],
          [
            "換匯與ATM",
            "機場與市區銀行皆可換匯；便利商店ATM多支援海外卡提領。"
          ],
          [
            "小費",
            "不需給小費(部分餐廳收10%服務費)。"
          ]
        ]
      },
      {
        "id": "net",
        "h": "通訊",
        "gist": "eSIM 出發前買最快",
        "rows": [
          [
            "SIM／eSIM",
            "桃園/松山/高雄機場可購買旅客SIM/eSIM，吃到飽方案普遍。"
          ],
          [
            "免費Wi-Fi",
            "車站/超商/捷運多有免費Wi-Fi(iTaiwan等)。"
          ]
        ]
      },
      {
        "id": "climate",
        "h": "氣候與季節",
        "gist": "10〜11月最好走",
        "rows": [
          [
            "四季",
            "3〜5月春季舒適；6〜9月炎熱多雨並有颱風；10〜11月秋高氣爽最宜旅行；12〜2月北部濕冷、南部溫暖。"
          ],
          [
            "山區",
            "山區(阿里山/太平山/合歡山)早晚溫差大，請備保暖衣物。"
          ]
        ],
        "kind": "climate"
      },
      {
        "id": "manner",
        "h": "緊急與禮儀",
        "gist": "有狀況就打多語言熱線",
        "rows": [
          [
            "緊急電話",
            "報警110／火警救護119。外國旅客24小時服務專線0800-011-765。"
          ],
          [
            "捷運車廂",
            "捷運車廂內禁止飲食(含飲料與口香糖)。"
          ],
          [
            "電壓",
            "電壓110V、插座與日本/美國同型。"
          ]
        ],
        "kind": "sos"
      },
      {
        "id": "links",
        "h": "官方網站(即時資訊)",
        "gist": "最新資訊在這裡確認",
        "rows": [
          [
            "鐵路",
            "台灣高鐵 thsrc.com.tw ／ 台鐵 tip.railway.gov.tw"
          ],
          [
            "機場與巴士",
            "桃園機場 taoyuan-airport.com ／ 台灣好行 taiwantrip.com.tw"
          ],
          [
            "訂房",
            "訂房(觀光署 台灣旅宿網) taiwanstay.net.tw"
          ],
          [
            "觀光署",
            "交通部觀光署 taiwan.net.tw"
          ]
        ]
      }
    ]
  },
  "ja": {
    "title": "台湾 旅の基本情報",
    "sections": [
      {
        "id": "entry",
        "h": "入国",
        "gist": "ビザ不要でも入境カードは事前提出",
        "rows": [
          [
            "ビザ免除",
            "多くの国が免除で、滞在できる日数は国籍により90日・30日・14日に分かれます。条件は外交部領事事務局の一覧が正本です。"
          ],
          [
            "入境カード TWAC",
            "ビザ免除で入る場合、台湾入境カード(TWAC)のオンライン提出が必要です。紙の配布はもうありません。出発前に済ませておくと着いてから早いです。"
          ]
        ]
      },
      {
        "id": "rail",
        "h": "交通",
        "gist": "高鉄・台鉄・MRT・観光バス",
        "rows": [
          [
            "高鉄(新幹線)",
            "台北—左営(高雄)を約1.5〜2時間で結ぶ。西海岸の主要都市を網羅。"
          ],
          [
            "台鉄(在来線)",
            "島を一周する鉄道網。東部(宜蘭・花蓮・台東)やローカル線(平渓線・集集線・内湾線)の旅の主役。"
          ],
          [
            "MRT(地下鉄)",
            "台北・桃園空港・台中・高雄にあり。悠遊カードが全線で使える。"
          ],
          [
            "台湾好行バス",
            "主要観光地を結ぶ観光路線バス。車なし旅行の強い味方。"
          ],
          [
            "YouBike",
            "シェアサイクル。悠遊カード+携帯番号の登録で借りられる。"
          ]
        ]
      },
      {
        "id": "ic",
        "h": "交通ICカード",
        "gist": "1枚でMRT・バス・コンビニ",
        "kind": "ic",
        "rows": [
          [
            "悠遊カード(EasyCard)",
            "MRT・バス・台鉄・コンビニで使える交通系IC。コンビニで購入・チャージ可能。"
          ]
        ]
      },
      {
        "id": "money",
        "h": "お金",
        "gist": "現金も要る。チップは無い",
        "rows": [
          [
            "通貨",
            "通貨は新台湾ドル(TWD)。夜市や食堂は現金主体なので小銭があると便利。"
          ],
          [
            "両替とATM",
            "両替は空港・市中銀行で。コンビニATMの海外カード引き出しも広く対応。"
          ],
          [
            "チップ",
            "チップの習慣はなし(レストランはサービス料10%が付く店あり)。"
          ]
        ]
      },
      {
        "id": "net",
        "h": "通信",
        "gist": "eSIMは出発前に買うのが早い",
        "rows": [
          [
            "SIM・eSIM",
            "桃園・松山・高雄空港で旅行者向けSIM/eSIMを購入可能。使い放題プランが主流。"
          ],
          [
            "無料Wi-Fi",
            "駅・コンビニ・MRTなど無料Wi-Fi(iTaiwan等)も多い。"
          ]
        ]
      },
      {
        "id": "climate",
        "h": "気候とベストシーズン",
        "gist": "10〜11月が最も旅行しやすい",
        "rows": [
          [
            "季節ごと",
            "3〜5月は快適な春。6〜9月は蒸し暑く台風期。10〜11月が最も旅行向き。12〜2月は北部が湿った寒さ、南部は温暖。"
          ],
          [
            "山岳部",
            "山岳部(阿里山・太平山・合歓山)は朝晩冷えるので防寒を。"
          ]
        ],
        "kind": "climate"
      },
      {
        "id": "manner",
        "h": "緊急・マナー",
        "gist": "困ったら多言語ホットラインへ",
        "rows": [
          [
            "緊急連絡先",
            "警察110／消防・救急119。外国人旅行者ホットライン0800-011-765(24時間・日本語可)。"
          ],
          [
            "電車内",
            "MRT車内は飲食禁止(飲み物・ガムも不可)。"
          ],
          [
            "電源",
            "電圧110V・プラグは日本と同じAタイプ(変換不要)。"
          ]
        ],
        "kind": "sos"
      },
      {
        "id": "links",
        "h": "公式サイト(最新情報はこちら)",
        "gist": "最新はここで確かめる",
        "rows": [
          [
            "鉄道",
            "台湾高鉄 thsrc.com.tw ／ 台鉄 tip.railway.gov.tw"
          ],
          [
            "空港とバス",
            "桃園空港 taoyuan-airport.com ／ 台湾好行バス taiwantrip.com.tw"
          ],
          [
            "宿の予約",
            "宿泊予約(観光署公式 台湾旅宿網) taiwanstay.net.tw"
          ],
          [
            "観光庁",
            "台湾観光庁 taiwan.net.tw"
          ]
        ]
      }
    ]
  },
  "cn": {
    "title": "台湾旅游实用资讯",
    "sections": [
      {
        "id": "entry",
        "h": "入境",
        "gist": "免签也要先线上填入境卡",
        "rows": [
          [
            "免签证",
            "多数国家可免签入境，可停留天数依国籍分为90天、30天、14天。实际条件以外交部领事事务局公告为准。"
          ],
          [
            "入境卡 TWAC",
            "免签入境需在线上填写台湾入境卡(TWAC)，不再发纸本。出发前先填好，落地会快很多。"
          ]
        ]
      },
      {
        "id": "rail",
        "h": "交通",
        "gist": "高铁、台铁、捷运与观光巴士",
        "rows": [
          [
            "高铁(HSR)",
            "台北—左营(高雄)约1.5〜2小时，串起西部主要城市。"
          ],
          [
            "台铁(TRA)",
            "环岛铁路网，东部(宜兰/花莲/台东)与支线(平溪/集集/内湾)之旅的主角。"
          ],
          [
            "捷运(MRT)",
            "台北/桃园机场/台中/高雄。悠游卡或一卡通全线通用。"
          ],
          [
            "台湾好行",
            "串接主要景点的观光巴士路线，适合无自驾的旅客。"
          ],
          [
            "YouBike",
            "公共自行车，悠游卡+手机注册即可租借。"
          ]
        ]
      },
      {
        "id": "ic",
        "h": "交通IC卡",
        "gist": "一张卡走遍捷运、公交与便利店",
        "kind": "ic",
        "rows": [
          [
            "悠游卡(EasyCard)",
            "捷运/公车/台铁/便利店都能用，便利店即可购买充值。"
          ]
        ]
      },
      {
        "id": "money",
        "h": "金钱",
        "gist": "现金仍然重要，没有小费文化",
        "rows": [
          [
            "货币",
            "货币为新台币(TWD)。夜市与小吃店多为现金交易，准备零钱较方便。"
          ],
          [
            "换汇与ATM",
            "机场与市区银行皆可换汇；便利店ATM多支持海外卡提取。"
          ],
          [
            "小费",
            "不需给小费(部分餐厅收10%服务费)。"
          ]
        ]
      },
      {
        "id": "net",
        "h": "通讯",
        "gist": "eSIM 出发前买最快",
        "rows": [
          [
            "SIM／eSIM",
            "桃园/松山/高雄机场可购买旅客SIM/eSIM，不限量方案普遍。"
          ],
          [
            "免费Wi-Fi",
            "车站/便利店/捷运多有免费Wi-Fi(iTaiwan等)。"
          ]
        ]
      },
      {
        "id": "climate",
        "h": "气候与季节",
        "gist": "10〜11月最好走",
        "rows": [
          [
            "四季",
            "3〜5月春季舒适；6〜9月炎热多雨并有台风；10〜11月秋高气爽最宜旅行；12〜2月北部湿冷、南部温暖。"
          ],
          [
            "山区",
            "山区(阿里山/太平山/合欢山)早晚温差大，请备保暖衣物。"
          ]
        ],
        "kind": "climate"
      },
      {
        "id": "manner",
        "h": "紧急与礼仪",
        "gist": "有状况就打多语言热线",
        "rows": [
          [
            "紧急电话",
            "报警110／火警救护119。外国旅客24小时服务专线0800-011-765。"
          ],
          [
            "捷运车厢",
            "捷运车厢内禁止饮食(含饮料与口香糖)。"
          ],
          [
            "电压",
            "电压110V、插座与日本/美国同型。"
          ]
        ],
        "kind": "sos"
      },
      {
        "id": "links",
        "h": "官方网站(实时资讯)",
        "gist": "最新资讯在这里确认",
        "rows": [
          [
            "铁路",
            "台湾高铁 thsrc.com.tw ／ 台铁 tip.railway.gov.tw"
          ],
          [
            "机场与巴士",
            "桃园机场 taoyuan-airport.com ／ 台湾好行 taiwantrip.com.tw"
          ],
          [
            "订房",
            "订房(观光署 台湾旅宿网) taiwanstay.net.tw"
          ],
          [
            "观光署",
            "交通部观光署 taiwan.net.tw"
          ]
        ]
      }
    ]
  },
  "en": {
    "title": "Taiwan travel essentials",
    "sections": [
      {
        "id": "entry",
        "h": "Entry",
        "gist": "Even visa-free needs the online arrival card",
        "rows": [
          [
            "Visa-free",
            "Most nationalities enter visa-free, with 90, 30 or 14 days depending on passport. The Bureau of Consular Affairs list is authoritative."
          ],
          [
            "Arrival card (TWAC)",
            "Visa-free arrivals must submit the Taiwan Arrival Card online; paper forms are no longer handed out. Do it before you fly and you clear the airport faster."
          ]
        ]
      },
      {
        "id": "rail",
        "h": "Getting around",
        "gist": "HSR, TRA, metro and tourist buses",
        "rows": [
          [
            "HSR (high-speed rail)",
            "Taipei to Zuoying (Kaohsiung) in about 1.5-2 hours, covering the west coast."
          ],
          [
            "TRA (railway)",
            "loops the whole island - the way to reach the east coast and branch lines like Pingxi."
          ],
          [
            "Metro",
            "Taipei, Taoyuan Airport, Taichung and Kaohsiung. EasyCard works on all of them."
          ],
          [
            "Taiwan Tourist Shuttle",
            "bus routes linking major sights - great without a car."
          ],
          [
            "YouBike",
            "public bikes, rentable with an EasyCard plus phone registration."
          ]
        ]
      },
      {
        "id": "ic",
        "h": "IC cards",
        "gist": "One card for metro, buses and shops",
        "kind": "ic",
        "rows": [
          [
            "EasyCard",
            "tap-and-go card for metro, buses, trains and convenience stores. Buy and top up at any convenience store."
          ]
        ]
      },
      {
        "id": "money",
        "h": "Money",
        "gist": "Cash still matters; no tipping",
        "rows": [
          [
            "Currency",
            "Currency is the New Taiwan Dollar (TWD). Night markets are mostly cash - keep small bills."
          ],
          [
            "Exchange & ATMs",
            "Exchange at airports and banks; convenience-store ATMs widely accept foreign cards."
          ],
          [
            "Tipping",
            "No tipping culture (some restaurants add a 10% service charge)."
          ]
        ]
      },
      {
        "id": "net",
        "h": "Connectivity",
        "gist": "Buy an eSIM before you fly",
        "rows": [
          [
            "SIM & eSIM",
            "Tourist SIM/eSIM with unlimited data is easy to buy at Taoyuan, Songshan and Kaohsiung airports."
          ],
          [
            "Free Wi-Fi",
            "Free Wi-Fi (iTaiwan and others) at stations, metro and convenience stores."
          ]
        ]
      },
      {
        "id": "climate",
        "h": "Weather and seasons",
        "gist": "October and November are easiest",
        "rows": [
          [
            "Through the year",
            "Mar-May is pleasant spring; Jun-Sep is hot, humid and typhoon season; Oct-Nov is the best time to visit; Dec-Feb is damp-cool in the north, mild in the south."
          ],
          [
            "In the mountains",
            "Mountain areas (Alishan, Taipingshan, Hehuanshan) get cold at night - bring layers."
          ]
        ],
        "kind": "climate"
      },
      {
        "id": "manner",
        "h": "Emergency and etiquette",
        "gist": "Multilingual hotline if you need help",
        "rows": [
          [
            "Emergency numbers",
            "Police 110 / Fire and ambulance 119. 24h tourist hotline 0800-011-765 (English available)."
          ],
          [
            "On the metro",
            "No eating or drinking inside the metro (including gum and drinks)."
          ],
          [
            "Power",
            "Voltage is 110V with US-style type-A plugs."
          ]
        ],
        "kind": "sos"
      },
      {
        "id": "links",
        "h": "Official sites (live info)",
        "gist": "Check here for the latest",
        "rows": [
          [
            "Rail",
            "HSR thsrc.com.tw / TRA tip.railway.gov.tw"
          ],
          [
            "Airport & buses",
            "Taoyuan Airport taoyuan-airport.com / Tourist Shuttle taiwantrip.com.tw"
          ],
          [
            "Accommodation",
            "Official lodging portal taiwanstay.net.tw"
          ],
          [
            "Tourism Administration",
            "Tourism Administration taiwan.net.tw"
          ]
        ]
      }
    ]
  },
  "ko": {
    "title": "타이완 여행 기본 정보",
    "sections": [
      {
        "id": "entry",
        "h": "입국",
        "gist": "무비자여도 입국카드는 사전 제출",
        "rows": [
          [
            "무비자",
            "다수 국가가 무비자로 입국할 수 있으며 체류 일수는 국적에 따라 90일·30일·14일로 나뉩니다."
          ],
          [
            "입국카드 TWAC",
            "무비자 입국 시 타이완 입국카드(TWAC)를 온라인으로 제출해야 합니다. 종이 양식은 더 이상 배부하지 않습니다."
          ]
        ]
      },
      {
        "id": "rail",
        "h": "교통",
        "gist": "고속철·타이완철도·전철·관광버스",
        "rows": [
          [
            "고속철도(HSR)",
            "타이베이—쭤잉(가오슝)을 약 1.5~2시간에 연결. 서부 주요 도시를 커버."
          ],
          [
            "타이완 철도(TRA)",
            "섬을 한 바퀴 도는 철도망. 동부(이란·화롄·타이둥)와 지선(핑시선 등) 여행의 주역."
          ],
          [
            "지하철(MRT)",
            "타이베이·타오위안공항·타이중·가오슝. 이지카드로 전 노선 이용 가능."
          ],
          [
            "타이완 하오싱",
            "주요 관광지를 잇는 관광버스. 렌터카 없는 여행의 든든한 친구."
          ],
          [
            "YouBike",
            "공공자전거. 이지카드+휴대폰 등록으로 대여 가능."
          ]
        ]
      },
      {
        "id": "ic",
        "h": "교통 IC카드",
        "gist": "카드 한 장으로 전철·버스·편의점",
        "kind": "ic",
        "rows": [
          [
            "이지카드(EasyCard)",
            "지하철·버스·기차·편의점에서 쓰는 교통카드. 편의점에서 구매·충전."
          ]
        ]
      },
      {
        "id": "money",
        "h": "돈",
        "gist": "현금도 필요, 팁 문화 없음",
        "rows": [
          [
            "통화",
            "통화는 신타이완달러(TWD). 야시장과 식당은 현금 위주이니 잔돈을 준비하면 편리."
          ],
          [
            "환전과 ATM",
            "환전은 공항·시내 은행에서. 편의점 ATM 대부분 해외 카드 출금 지원."
          ],
          [
            "팁",
            "팁 문화 없음(일부 레스토랑은 봉사료 10% 부과)."
          ]
        ]
      },
      {
        "id": "net",
        "h": "통신",
        "gist": "eSIM은 출발 전 구입이 빠름",
        "rows": [
          [
            "SIM·eSIM",
            "타오위안·쑹산·가오슝 공항에서 여행자 SIM/eSIM 구매 가능. 무제한 요금제가 일반적."
          ],
          [
            "무료 Wi-Fi",
            "역·편의점·지하철 등에 무료 Wi-Fi(iTaiwan 등)도 많다."
          ]
        ]
      },
      {
        "id": "climate",
        "h": "기후와 시즌",
        "gist": "10〜11월이 가장 다니기 좋음",
        "rows": [
          [
            "계절별",
            "3~5월은 쾌적한 봄. 6~9월은 덥고 습하며 태풍철. 10~11월이 여행 최적기. 12~2월은 북부는 습한 추위, 남부는 온화."
          ],
          [
            "산악 지역",
            "산악 지역(아리산·타이핑산·허환산)은 아침저녁 일교차가 크니 방한복을."
          ]
        ],
        "kind": "climate"
      },
      {
        "id": "manner",
        "h": "긴급·매너",
        "gist": "곤란하면 다국어 핫라인으로",
        "rows": [
          [
            "긴급 연락처",
            "경찰 110 / 소방·구급 119. 외국인 관광객 24시간 핫라인 0800-011-765."
          ],
          [
            "전철 안",
            "지하철 안에서는 취식 금지(음료·껌 포함)."
          ],
          [
            "전원",
            "전압 110V, 플러그는 A타입(한국 여행자는 변환 어댑터 필요)."
          ]
        ],
        "kind": "sos"
      },
      {
        "id": "links",
        "h": "공식 사이트(실시간 정보)",
        "gist": "최신 정보는 여기서 확인",
        "rows": [
          [
            "철도",
            "고속철도 thsrc.com.tw / 타이완철도 tip.railway.gov.tw"
          ],
          [
            "공항과 버스",
            "타오위안공항 taoyuan-airport.com / 하오싱버스 taiwantrip.com.tw"
          ],
          [
            "숙박 예약",
            "숙박 예약(관광서 공식) taiwanstay.net.tw"
          ],
          [
            "관광청",
            "관광서 taiwan.net.tw"
          ]
        ]
      }
    ]
  }
};

/**
 * 空港→市内アクセスのフロー図データ(5言語)。
 * 所要時間の出典(2026-08-21 Web確認): 機捷直達車36〜39分/普通車49分・約15分毎(tymetro/Trip.com)、
 * 國光1819約55分・24時間(kkday他)、空港→A18高鐵桃園16〜19分(tymetro)。運賃は書かない方針。
 */
export const TRANSIT = {
  zh: {
    h: "從機場到市區",
    pick: "選擇入境的機場",
    airports: [
          {
                "id": "tpe",
                "name": "桃園國際機場",
                "city": "台北市區",
                "routes": [
                      {
                            "name": "機場捷運 直達車",
                            "time": "到台北車站36〜39分",
                            "note": "約15分一班",
                            "best": true
                      },
                      {
                            "name": "國道客運 1819",
                            "time": "約55分",
                            "note": "24小時營運"
                      },
                      {
                            "name": "高鐵桃園站",
                            "time": "機場捷運16〜19分",
                            "note": "直接南下台中・台南・高雄"
                      }
                ],
                "onward": [
                      "高鐵",
                      "台鐵",
                      "捷運"
                ]
          },
          {
                "id": "tsa",
                "name": "松山機場",
                "city": "台北市區",
                "routes": [
                      {
                            "name": "捷運文湖線",
                            "time": "到忠孝復興約9分",
                            "note": "市區機場，最快進城",
                            "best": true
                      },
                      {
                            "name": "計程車",
                            "time": "到台北車站約15分",
                            "note": "行李多時很划算"
                      }
                ],
                "onward": [
                      "捷運",
                      "台鐵",
                      "市區公車"
                ]
          },
          {
                "id": "khh",
                "name": "高雄小港機場",
                "city": "高雄市區",
                "routes": [
                      {
                            "name": "捷運紅線",
                            "time": "到美麗島約12分",
                            "note": "機場就在捷運站上方",
                            "best": true
                      },
                      {
                            "name": "計程車",
                            "time": "到市區約20分",
                            "note": "深夜航班時方便"
                      }
                ],
                "onward": [
                      "高鐵左營",
                      "台鐵",
                      "輕軌"
                ]
          },
          {
                "id": "rmq",
                "name": "台中機場",
                "city": "台中市區",
                "routes": [
                      {
                            "name": "市區公車",
                            "time": "到台中車站約60分",
                            "note": "班次不多，先查時刻"
                      },
                      {
                            "name": "計程車",
                            "time": "到高鐵台中站約30分",
                            "note": "轉高鐵最快",
                            "best": true
                      }
                ],
                "onward": [
                      "高鐵",
                      "台鐵",
                      "市區公車"
                ]
          }
    ],
    card: {
      h: "悠遊卡的用法",
      steps: ["在便利商店或車站購買", "用現金儲值(便利商店/售票機)", "捷運・公車感應即可搭乘", "便利商店小額付款也能用"],
    }
  },
  ja: {
    h: "空港から市内へ",
    pick: "入口の空港を選ぶ",
    airports: [
          {
                "id": "tpe",
                "name": "桃園国際空港",
                "city": "台北市内",
                "routes": [
                      {
                            "name": "空港MRT(直達車)",
                            "time": "台北駅まで36〜39分",
                            "note": "約15分間隔",
                            "best": true
                      },
                      {
                            "name": "リムジンバス1819",
                            "time": "約55分",
                            "note": "24時間運行"
                      },
                      {
                            "name": "高鉄桃園駅へ",
                            "time": "空港MRTで16〜19分",
                            "note": "そのまま台中・台南・高雄へ"
                      }
                ],
                "onward": [
                      "高鉄",
                      "台鉄",
                      "MRT"
                ]
          },
          {
                "id": "tsa",
                "name": "松山空港",
                "city": "台北市内",
                "routes": [
                      {
                            "name": "MRT文湖線",
                            "time": "忠孝復興まで約9分",
                            "note": "市内空港。いちばん街に近い",
                            "best": true
                      },
                      {
                            "name": "タクシー",
                            "time": "台北駅まで約15分",
                            "note": "荷物が多いなら"
                      }
                ],
                "onward": [
                      "MRT",
                      "台鉄",
                      "市バス"
                ]
          },
          {
                "id": "khh",
                "name": "高雄小港空港",
                "city": "高雄市内",
                "routes": [
                      {
                            "name": "MRT紅線",
                            "time": "美麗島まで約12分",
                            "note": "空港の真下がMRT駅",
                            "best": true
                      },
                      {
                            "name": "タクシー",
                            "time": "市内まで約20分",
                            "note": "深夜便のとき"
                      }
                ],
                "onward": [
                      "高鉄左営",
                      "台鉄",
                      "LRT"
                ]
          },
          {
                "id": "rmq",
                "name": "台中空港",
                "city": "台中市内",
                "routes": [
                      {
                            "name": "市バス",
                            "time": "台中駅まで約60分",
                            "note": "本数が少ないので時刻を先に"
                      },
                      {
                            "name": "タクシー",
                            "time": "高鉄台中駅まで約30分",
                            "note": "高鉄に乗り継ぐならこれ",
                            "best": true
                      }
                ],
                "onward": [
                      "高鉄",
                      "台鉄",
                      "市バス"
                ]
          }
    ],
    card: {
      h: "悠遊カードの使い方",
      steps: ["コンビニか駅で購入", "現金でチャージ(コンビニ/券売機)", "MRT・バスはタッチで乗車", "コンビニの少額払いにも使える"],
    }
  },
  cn: {
    h: "从机场到市区",
    pick: "选择入境的机场",
    airports: [
          {
                "id": "tpe",
                "name": "桃园国际机场",
                "city": "台北市区",
                "routes": [
                      {
                            "name": "机场捷运 直达车",
                            "time": "到台北车站36〜39分",
                            "note": "约15分一班",
                            "best": true
                      },
                      {
                            "name": "国道客运 1819",
                            "time": "约55分",
                            "note": "24小时营运"
                      },
                      {
                            "name": "高铁桃园站",
                            "time": "机场捷运16〜19分",
                            "note": "直接南下台中・台南・高雄"
                      }
                ],
                "onward": [
                      "高铁",
                      "台铁",
                      "捷运"
                ]
          },
          {
                "id": "tsa",
                "name": "松山机场",
                "city": "台北市区",
                "routes": [
                      {
                            "name": "捷运文湖线",
                            "time": "到忠孝复兴约9分",
                            "note": "市区机场，最快进城",
                            "best": true
                      },
                      {
                            "name": "出租车",
                            "time": "到台北车站约15分",
                            "note": "行李多时很划算"
                      }
                ],
                "onward": [
                      "捷运",
                      "台铁",
                      "市区公交"
                ]
          },
          {
                "id": "khh",
                "name": "高雄小港机场",
                "city": "高雄市区",
                "routes": [
                      {
                            "name": "捷运红线",
                            "time": "到美丽岛约12分",
                            "note": "机场就在捷运站上方",
                            "best": true
                      },
                      {
                            "name": "出租车",
                            "time": "到市区约20分",
                            "note": "深夜航班时方便"
                      }
                ],
                "onward": [
                      "高铁左营",
                      "台铁",
                      "轻轨"
                ]
          },
          {
                "id": "rmq",
                "name": "台中机场",
                "city": "台中市区",
                "routes": [
                      {
                            "name": "市区公交",
                            "time": "到台中车站约60分",
                            "note": "班次不多，先查时刻"
                      },
                      {
                            "name": "出租车",
                            "time": "到高铁台中站约30分",
                            "note": "转高铁最快",
                            "best": true
                      }
                ],
                "onward": [
                      "高铁",
                      "台铁",
                      "市区公交"
                ]
          }
    ],
    card: {
      h: "悠游卡的用法",
      steps: ["在便利店或车站购买", "用现金充值(便利店/售票机)", "地铁・公交刷卡即乘", "便利店小额支付也能用"],
    }
  },
  en: {
    h: "From the airport to the city",
    pick: "Pick your arrival airport",
    airports: [
          {
                "id": "tpe",
                "name": "Taoyuan Int'l",
                "city": "Taipei city",
                "routes": [
                      {
                            "name": "Airport MRT (Express)",
                            "time": "36–39 min to Taipei Main",
                            "note": "About every 15 min",
                            "best": true
                      },
                      {
                            "name": "Bus 1819",
                            "time": "About 55 min",
                            "note": "Runs 24 hours"
                      },
                      {
                            "name": "To HSR Taoyuan",
                            "time": "16–19 min by Airport MRT",
                            "note": "Straight on to Taichung, Tainan, Kaohsiung"
                      }
                ],
                "onward": [
                      "HSR",
                      "TRA",
                      "Metro"
                ]
          },
          {
                "id": "tsa",
                "name": "Songshan",
                "city": "Taipei city",
                "routes": [
                      {
                            "name": "Metro Wenhu line",
                            "time": "9 min to Zhongxiao Fuxing",
                            "note": "In-city airport; closest of all",
                            "best": true
                      },
                      {
                            "name": "Taxi",
                            "time": "About 15 min to Taipei Main",
                            "note": "Worth it with luggage"
                      }
                ],
                "onward": [
                      "Metro",
                      "TRA",
                      "City buses"
                ]
          },
          {
                "id": "khh",
                "name": "Kaohsiung",
                "city": "Kaohsiung city",
                "routes": [
                      {
                            "name": "Metro Red line",
                            "time": "12 min to Formosa Blvd",
                            "note": "The station is right under the terminal",
                            "best": true
                      },
                      {
                            "name": "Taxi",
                            "time": "About 20 min to downtown",
                            "note": "Handy for late flights"
                      }
                ],
                "onward": [
                      "HSR Zuoying",
                      "TRA",
                      "Light rail"
                ]
          },
          {
                "id": "rmq",
                "name": "Taichung",
                "city": "Taichung city",
                "routes": [
                      {
                            "name": "City bus",
                            "time": "About 60 min to Taichung Station",
                            "note": "Infrequent; check the timetable first"
                      },
                      {
                            "name": "Taxi",
                            "time": "About 30 min to HSR Taichung",
                            "note": "Fastest way to the HSR",
                            "best": true
                      }
                ],
                "onward": [
                      "HSR",
                      "TRA",
                      "City buses"
                ]
          }
    ],
    card: {
      h: "How to use EasyCard",
      steps: ["Buy at any convenience store or station", "Top up with cash (store / machine)", "Tap to ride metro and buses", "Also pays at convenience stores"],
    }
  },
  ko: {
    h: "공항에서 시내로",
    pick: "입국하는 공항을 고르세요",
    airports: [
          {
                "id": "tpe",
                "name": "타오위안 국제공항",
                "city": "타이베이 시내",
                "routes": [
                      {
                            "name": "공항 MRT 직통",
                            "time": "타이베이역까지 36〜39분",
                            "note": "약 15분 간격",
                            "best": true
                      },
                      {
                            "name": "리무진버스 1819",
                            "time": "약 55분",
                            "note": "24시간 운행"
                      },
                      {
                            "name": "고속철 타오위안역",
                            "time": "공항 MRT로 16〜19분",
                            "note": "타이중·타이난·가오슝으로 바로"
                      }
                ],
                "onward": [
                      "고속철",
                      "타이완철도",
                      "전철"
                ]
          },
          {
                "id": "tsa",
                "name": "쑹산공항",
                "city": "타이베이 시내",
                "routes": [
                      {
                            "name": "전철 원후선",
                            "time": "중샤오푸싱까지 약 9분",
                            "note": "시내 공항, 가장 가까움",
                            "best": true
                      },
                      {
                            "name": "택시",
                            "time": "타이베이역까지 약 15분",
                            "note": "짐이 많을 때"
                      }
                ],
                "onward": [
                      "전철",
                      "타이완철도",
                      "시내버스"
                ]
          },
          {
                "id": "khh",
                "name": "가오슝 샤오강공항",
                "city": "가오슝 시내",
                "routes": [
                      {
                            "name": "전철 홍선",
                            "time": "메이리다오까지 약 12분",
                            "note": "공항 바로 아래가 역",
                            "best": true
                      },
                      {
                            "name": "택시",
                            "time": "시내까지 약 20분",
                            "note": "심야편일 때"
                      }
                ],
                "onward": [
                      "고속철 쭤잉",
                      "타이완철도",
                      "경전철"
                ]
          },
          {
                "id": "rmq",
                "name": "타이중공항",
                "city": "타이중 시내",
                "routes": [
                      {
                            "name": "시내버스",
                            "time": "타이중역까지 약 60분",
                            "note": "배차가 적으니 시각표 확인"
                      },
                      {
                            "name": "택시",
                            "time": "고속철 타이중역까지 약 30분",
                            "note": "고속철 환승이 가장 빠름",
                            "best": true
                      }
                ],
                "onward": [
                      "고속철",
                      "타이완철도",
                      "시내버스"
                ]
          }
    ],
    card: {
      h: "이지카드 사용법",
      steps: ["편의점이나 역에서 구매", "현금으로 충전(편의점/발매기)", "지하철・버스는 태그하고 탑승", "편의점 소액 결제도 가능"],
    }
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

/**
 * 交通ICカードの比較。
 * ★パネルは実測160px級まで狭くなるので、4列の表ではなくカードの積み重ねにする
 *   (日本版で表にしたら1文字ずつ折り返して読めなくなった)。
 */
export const IC_TABLE = {
  zh: { head: ["卡片", "使用範圍", "購買地", "備註"], rows: [
    ["悠遊卡 EasyCard", "捷運・公車・台鐵・超商", "超商・捷運站", "單次儲值與餘額上限皆 NT$10,000"],
    ["一卡通 iPASS", "捷運・公車・台鐵・超商", "超商・捷運站", "高雄起家，現已全台通用"],
    ["icash", "超商為主，部分交通", "7-ELEVEN", "以消費為主，交通功能較少"],
  ] },
  ja: { head: ["カード", "使えるところ", "入手先", "備考"], rows: [
    ["悠遊カード EasyCard", "MRT・バス・台鉄・コンビニ", "コンビニ・MRT駅", "1回のチャージも残高も上限 NT$10,000"],
    ["一卡通 iPASS", "MRT・バス・台鉄・コンビニ", "コンビニ・MRT駅", "高雄発だが今は全土で使える"],
    ["icash", "コンビニ中心・一部の交通", "7-ELEVEN", "買い物寄り。交通の対応は狭い"],
  ] },
  cn: { head: ["卡片", "使用范围", "购买地", "备注"], rows: [
    ["悠游卡 EasyCard", "捷运・公交・台铁・便利店", "便利店・捷运站", "单次储值与余额上限皆 NT$10,000"],
    ["一卡通 iPASS", "捷运・公交・台铁・便利店", "便利店・捷运站", "高雄起家，现已全台通用"],
    ["icash", "便利店为主，部分交通", "7-ELEVEN", "以消费为主，交通功能较少"],
  ] },
  en: { head: ["Card", "Where it works", "Where to buy", "Notes"], rows: [
    ["EasyCard", "Metro, buses, TRA, shops", "Convenience stores, metro", "NT$10,000 cap on both top-up and balance"],
    ["iPASS", "Metro, buses, TRA, shops", "Convenience stores, metro", "Started in Kaohsiung, now island-wide"],
    ["icash", "Mostly shops, some transit", "7-ELEVEN", "Retail-first; limited transit use"],
  ] },
  ko: { head: ["카드", "사용 범위", "구입처", "비고"], rows: [
    ["이지카드 EasyCard", "전철·버스·타이완철도·편의점", "편의점·전철역", "1회 충전과 잔액 모두 NT$10,000 상한"],
    ["아이패스 iPASS", "전철·버스·타이완철도·편의점", "편의점·전철역", "가오슝에서 시작해 지금은 전국 사용"],
    ["icash", "편의점 위주, 일부 교통", "7-ELEVEN", "쇼핑 중심, 교통 대응은 좁음"],
  ] },
};

/** 12か月の帯。「いつ行くか」は文章で読むより色と一語で拾う方が速い。 */
export const MONTHS = {
  colors: ["#8fb4dc", "#a8cfa0", "#a8cfa0", "#f0a8c0", "#a8d99a", "#9fc4b0",
           "#f2c46a", "#f0a05a", "#e08a58", "#c9b48a", "#d9c48a", "#8fb4dc"],
  best: [10, 11, 3, 4],
  name: {
    zh: Array.from({ length: 12 }, (_, i) => `${i + 1}月`),
    ja: Array.from({ length: 12 }, (_, i) => `${i + 1}月`),
    cn: Array.from({ length: 12 }, (_, i) => `${i + 1}月`),
    ko: Array.from({ length: 12 }, (_, i) => `${i + 1}월`),
    en: ["January", "February", "March", "April", "May", "June",
         "July", "August", "September", "October", "November", "December"],
  },
  word: {
    zh: ["濕冷", "櫻花", "櫻花", "螢火蟲", "梅雨", "梅雨", "颱風", "颱風", "颱風", "最舒服", "最舒服", "溫泉"],
    ja: ["湿った寒さ", "桜", "桜", "蛍", "梅雨", "梅雨", "台風", "台風", "台風", "快適", "快適", "温泉"],
    cn: ["湿冷", "樱花", "樱花", "萤火虫", "梅雨", "梅雨", "台风", "台风", "台风", "最舒服", "最舒服", "温泉"],
    en: ["Damp cold", "Blossom", "Blossom", "Fireflies", "Plum rain", "Plum rain",
         "Typhoon", "Typhoon", "Typhoon", "Best", "Best", "Hot springs"],
    ko: ["습한 추위", "벚꽃", "벚꽃", "반딧불이", "장마", "장마", "태풍", "태풍", "태풍", "쾌적", "쾌적", "온천"],
  },
  bestLabel: {
    zh: "最好走的月份", ja: "旅行しやすい", cn: "最好走的月份",
    en: "Best months", ko: "여행하기 좋음",
  },
};

/** 緊急番号。文字で書いても電話はかけられないので tel: の押せるカードにする。 */
export const SOS = {
  zh: [["110", "報警"], ["119", "消防・救護"], ["0800-011-765", "旅遊諮詢熱線(24小時・中英日韓)"]],
  ja: [["110", "警察"], ["119", "消防・救急"], ["0800-011-765", "旅行者ホットライン(24時間・中英日韓)"]],
  cn: [["110", "报警"], ["119", "消防・救护"], ["0800-011-765", "旅游咨询热线(24小时・中英日韩)"]],
  en: [["110", "Police"], ["119", "Fire and ambulance"], ["0800-011-765", "Travel hotline (24h, ZH/EN/JA/KO)"]],
  ko: [["110", "경찰"], ["119", "소방·구급"], ["0800-011-765", "여행 상담 핫라인(24시간·중영일한)"]],
};

/**
 * 表示は短いドメインのまま、飛び先だけ**実際に開けたURL**を持つ表。
 *
 * ★裸のドメインをそのまま href にしてはいけない(2026-08-23 実測):
 *   thsrc.com.tw / taoyuan-airport.com / taiwantrip.com.tw は www 無しでは繋がらない。
 *   taiwan.net.tw は www に入れても英語版へ飛ぶため、日本語だけ別の入口を持つ。
 *   (kr / zh-tw / sc のサブドメインは応答しないことを確認済み)
 *
 * 値は文字列、または言語別の入口を持つ場合だけ { _: 既定, <lang>: 入口 }。
 */
export const SITE_URL = {
  // 天気の出典表示(CC BY 4.0)。文字だけでは出典として弱いのでリンクにする
  "open-meteo.com": "https://open-meteo.com/",
  "thsrc.com.tw": "https://www.thsrc.com.tw/",
  "tip.railway.gov.tw": "https://tip.railway.gov.tw/",
  "taoyuan-airport.com": "https://www.taoyuan-airport.com/",
  "taiwantrip.com.tw": "https://www.taiwantrip.com.tw/",
  "taiwanstay.net.tw": "https://www.taiwanstay.net.tw/",
  "taiwan.net.tw": { _: "https://www.taiwan.net.tw/", ja: "https://jp.taiwan.net.tw/" },
};
