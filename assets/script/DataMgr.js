const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class DataMgr extends cc.Component {
    version = "20181205"; //不同的 version 版本会清空本地信息
    beginTime = 1540537483; //最早是游戏发布的时间
    canvasH = 1280;
    canvasW = 720;

    openid = null;
    isShowShare = false; //显示引导分享

    imageUrl = {
        urlJson: "https://bpw.blyule.com/wxPickCatB/res/pickCat.json",
        urlForward: "https://bpw.blyule.com/wxPickCatB/res/cat_forward.jpg",
        urlFriend: "https://bpw.blyule.com/wxPickCatB/res/cat_friend.jpg",
        urlGroup: "https://bpw.blyule.com/wxPickCatB/res/cat_group.jpg",
    }

    //用户相关需要储存的数据
    userData = {
        bestScore: 0, //最高纪录
        leadStep: -1, //新手引导步骤 -1 时已完成新手引导 后面的时正在进行中

        gems: 0, //玩家拥有的宝石
        coins: 0, //金币

        popType: null, //要显示的 pop
        atRoomIdx: 0, //最近或当前再那个页面
        gameType: 0, //小游戏的类型

        onTouchCat: null, //是否在和小猫互动
        touchCatName: null, //当前选中的猫咪 会禁止玩家移动屏幕
        showCatTake: null, //现在再展示那个小猫带回来的礼品(物品显示了之后才置空) 会禁止玩家移动屏幕

        //计数相关
        countClean: 0, //历史可打扫和已经打扫 次数累加(每生成一个 goldPos +1)
        countOutNum: 0, //已经获得的所有物品统计
        countPool: 0, //点击计数 池塘

        addCleanTime: parseInt(Date.now() / 1000), //最近一次 根据时间随机 cleanNum 的时间
        addOneClean: 30, //新增一个clean 要多少秒

        //拥有的房间 和 房间的数据
        haveRoom: ["shack", "yard", "hall"],
        roomData: [{
                name: "shack",
                isHave: true,
                openedBox: [], //当前房间已经打开的保险箱
                haveThingsNum: 0, //这个房间中拥有物品的数量(也可由 haveThings 中统计出来)
                cleanNum: 2 //这里是便便的数量
            },
            {
                name: "yard",
                isHave: true,
                openedBox: [],
                haveThingsNum: 2,
                cleanNum: 2
            },
            {
                name: "hall",
                isHave: true,
                openedBox: [],
                haveThingsNum: 0,
                cleanNum: 2
            },
            {
                name: "room",
                isHave: false,
                openedBox: [],
                haveThingsNum: 0,
                cleanNum: 2
            },
            {
                name: "miss",
                isHave: false,
                openedBox: [],
                haveThingsNum: 0,
                cleanNum: 2
            },
        ],

        //所有房间已经获得的物品的 key
        haveThings: [],

        //有的小猫 和 小猫的数据
        haveCat: ["catKey_0"],
        catData: {
            "catKey_0": {
                name: "波比",
                catType: "cat-0", //小猫 gameData 中对应的数据
                hat: null, //小猫的帽子、头饰、头巾等
                face: null, //小猫的面具、眼镜、胡子等面部装饰
                tie: null, //小猫的领带
                boot: null, //小猫的靴子
                haveCard: [], //小猫的拼图

                inOut: 0, //0:没出去,1:出去了,2:出去已经回来了(外出时在屋里是不出现猫咪的)
                outTime: 0, //小猫出去的时间秒
                outBack: 200, //小猫多少秒之后 会回来
                outCount: 0, //小猫出去次数统计
                backTake: null, //回来带的礼物

                atRoomIdx: 0, //这只小猫所在的房间下标
                atPosX: 0, //这是小猫当前的位置
                atPosY: 0,
                actionIdx: 0, //这是小猫当前的动画

                //后面再添加数据 包括 什么时候变换状态
                needStatus: "no", //需要什么状态 no:没有 eat:吃 touch:抚摸 shower:洗澡
            }
        },

        //金色猫咪 财神猫
        goldCat: {
            atRoomIdx: 0, //所在房间
            beginTime: 0, //出现的时间
            continueTime: 20, //持续时间

            nextBeginTime: 0, //下次出现的开始(这个时间之后都可以出现)
        },

        dogData: {
            canTake: true, //是否可以领取
            takeCount: 0, //领取了几次
            lastTakeTime: 0, //上次领取的时间
        }
    };

    //游戏中用到的数据
    gameData = {
        "-- 注释:基础数据 --": "--- 猫咪的总数量、开始礼物的顺序、每只猫卡片的总数  ---",
        "cardNum": 15,
        "outCost": [0, 100, 500, 1000],
        "buyCat": [0, 0, 5, 10, 20, 40, 80, 160, 320, 640],
        "baseThings": ["shack_023", "shack_005", "shack_007", "shack_011", "shack_006", "yard_050", "yard_060", "yard_036", "yard_006"],

        "-- 注释 --": "--- 房间数据 ---",
        "roomTotal": ["shack", "yard", "hall", "room", "miss"],
        "roomData": [
            {
                "name": "shack",
                "desc": "商店",
                "price": 0,
                "idx": 0,
                "boxNum": 5,
                "thingsNum": 16,

                "-- 注释 catPos --": "-- 小猫在这个房间的位置坐标 --",
                "catPos": [
                    cc.v2(0, -50),
                    cc.v2(200, -50),
                    cc.v2(-200, -50),
                    cc.v2(400, -50),
                    cc.v2(-400, -50),
                    cc.v2(100, -200),
                    cc.v2(-100, -200),
                    cc.v2(300, -200),
                    cc.v2(-300, -200)
                ],

                "-- 注释 boxData --": "--- 密码箱,注意:boxNum 数量应与 boxData的数量一致。 ---",
                "-- 注释 result --": "--- 分为五种:things(物品),card(猫咪的卡片),coins(金币),gems(钻石),cat(新猫咪) ---",
                "boxData": [{
                        "password": "8",
                        "needThings": "shack_023",
                        "desc": "两只气球？",
                        "result": {
                            "type": "coins",
                            "desc": 1000
                        }
                    },
                    {
                        "password": "red",
                        "needThings": "shack_011",
                        "desc": "里面的石头改变了形状和颜色。",
                        "result": {
                            "type": "gems",
                            "desc": 5
                        }
                    },
                    {
                        "password": "axe",
                        "needThings": "shack_051",
                        "desc": "很有用，但是我不敢用。",
                        "result": {
                            "type": "coins",
                            "desc": 2000
                        }
                    },
                    {
                        "password": "mouse",
                        "needThings": "shack_057",
                        "desc": "哎呀，真恶心，离我远点。",
                        "result": {
                            "type": "gems",
                            "desc": 10
                        }
                    },
                    {
                        "password": "PickCat",
                        "needThings": "key",
                        "desc": "神秘宝箱。。。",
                        "result": {
                            "type": "coins",
                            "desc": 99900
                        }
                    }
                ]
            },
            {
                "name": "yard",
                "desc": "沙滩",
                "price": 0,
                "idx": 1,
                "boxNum": 4,
                "thingsNum": 23,
                "catPos": [
                    cc.v2(0, 110),
                    cc.v2(200, 110),
                    cc.v2(-200, 110),
                    cc.v2(400, 110),
                    cc.v2(-400, 110),
                    cc.v2(100, -50),
                    cc.v2(-100, -50),
                    cc.v2(300, -50),
                    cc.v2(-300, -50),
                    cc.v2(0, -210),
                    cc.v2(200, -210),
                    cc.v2(-200, -210),
                    cc.v2(400, -210),
                    cc.v2(-400, -210)
                ],
                "boxData": [{
                        "password": "002",
                        "needThings": "yard_109",
                        "desc": "这把钥匙可以打开房门",
                        "result": {
                            "type": "gems",
                            "desc": 5
                        }
                    },
                    {
                        "password": "rabbit",
                        "needThings": "yard_115",
                        "desc": "哇，太可爱了。",
                        "result": {
                            "type": "coins",
                            "desc": 1500
                        }
                    },
                    {
                        "password": "no good",
                        "needThings": "yard_119",
                        "desc": "真的很喜欢蛇。",
                        "result": {
                            "type": "gems",
                            "desc": 10
                        }
                    },
                    {
                        "password": "monster",
                        "needThings": "yard_121",
                        "desc": "大树地下好乘凉。",
                        "result": {
                            "type": "coins",
                            "desc": 5000
                        }
                    }
                ]
            },
            {
                "name": "hall",
                "desc": "甜点屋",
                "price": 0,
                "idx": 2,
                "boxNum": 2,
                "thingsNum": 28,
                "catPos": [
                    cc.v2(0, -80),

                    cc.v2(0, -260),
                    cc.v2(200, -260),
                    cc.v2(-200, -260),
                    cc.v2(400, -260),
                    cc.v2(-400, -260),

                    cc.v2(100, -620),
                    cc.v2(-100, -620),
                    cc.v2(300, -620),
                    cc.v2(-300, -620),
                    cc.v2(0, -210),
                    cc.v2(200, -210),
                    cc.v2(-200, -210),
                    cc.v2(400, -210),
                    cc.v2(-400, -210)
                ],
                "boxData": [{
                        "password": "small dog",
                        "needThings": "hall_017",
                        "desc": "天啊，这也太太太可爱了吧！",
                        "result": {
                            "type": "coins",
                            "desc": 2000
                        }
                    },
                    {
                        "password": "square",
                        "needThings": "hall_026",
                        "desc": "最简单的魔方。",
                        "result": {
                            "type": "coins",
                            "desc": 3000
                        }
                    }
                ]
            },
            {
                "name": "room",
                "desc": "房间",
                "price": 10000,
                "idx": 3,
                "boxNum": 4,
                "thingsNum": 45,
                "catPos": [
                    cc.v2(0, 0),
                    cc.v2(0, 0)
                ],
                "boxData": [{
                        "password": "12546",
                        "needThings": "key",
                        "desc": "神秘宝箱1。。。",
                        "result": {
                            "type": "gems",
                            "desc": 5
                        }
                    },
                    {
                        "password": "365487",
                        "needThings": "key",
                        "desc": "神秘宝箱2。。。",
                        "result": {
                            "type": "coins",
                            "desc": 2000
                        }
                    },
                    {
                        "password": "85645",
                        "needThings": "key",
                        "desc": "神秘宝箱3。。。",
                        "result": {
                            "type": "gems",
                            "desc": 10
                        }
                    },
                    {
                        "password": "97552",
                        "needThings": "key",
                        "desc": "神秘宝箱4。。。",
                        "result": {
                            "type": "coins",
                            "desc": 4000
                        }
                    }
                ]
            },
            {
                "name": "miss",
                "desc": "???",
                "price": 0,
                "idx": 4,
                "boxNum": 1,
                "thingsNum": 0,
                "catPos": [
                    cc.v2(0, 0),
                    cc.v2(0, 0)
                ],
                "boxData": [{
                    "password": "0",
                    "needThings": "key",
                    "desc": "哈哈",
                    "result": {
                        "type": "gems",
                        "desc": 20
                    }
                }]
            }
        ],

        "-- 注释:所有信息的物品的总数据 thingsData --": "--- 庭院的物品数据 key 为物品的标识,也是场景中物品的命名,value 为描述 ---",
        "-- 注释 thingsTotal --": "--- 所有物品的key 要放到这个数组里面 方便随机物品 ---",
        "thingsTotal": [
            "shack_023",
			"shack_005",
			"shack_007",
			"shack_011",
			"shack_006",
			"yard_050" ,
			"yard_060" ,
			"yard_036" ,
			"yard_006" ,
			           
			"shack_050",
			"shack_051",
			"shack_052",
			"shack_053",
			"shack_054",
			"shack_055",
			"shack_056",
			"shack_057",
			"shack_058",
			"shack_059",
			"shack_060",
			          
			"yard_100" ,
			"yard_101" ,
			"yard_102" ,
			"yard_103" ,
			"yard_105" ,
			"yard_106" ,
			"yard_107" ,
			"yard_108" ,
			"yard_109" ,
			"yard_110" ,
			"yard_111" ,
			"yard_112" ,
			"yard_113" ,
			"yard_115" ,
			"yard_117" ,
			"yard_118" ,
			"yard_119" ,
			"yard_120" ,
			"yard_121" ,
			
			"hall_010",
			"hall_011",
			"hall_012",
			"hall_013",
			"hall_014",
			"hall_015",
			"hall_016",
			"hall_017",
			"hall_018",
			"hall_019",
			"hall_020",
			"hall_021",
			"hall_022",
			"hall_023",
			"hall_024",
			"hall_025",
			"hall_026",
			"hall_027",
			"hall_028",
			"hall_029",
			"hall_030",
			"hall_031",
			"hall_032",
			"hall_033",
			"hall_034",
			"hall_035",
			"hall_036",
			"hall_039",
			"hall_040"
        ],
        "thingsData": {
            //这些事新手引导要找回的东西
            "shack_023": "两只气球？",
            "shack_005": "野炊的时候可能用得上。",
            "shack_007": "你是在马路边挖的吗？",
            "shack_011": "好吧，我感觉你有惹祸了。",
            "shack_006": "刚好我需要它。",
            "yard_050": "这是一个积木吗？",
            "yard_060": "属于小猫的饭后甜点吗？",
            "yard_036": "一个传唤铃，应该会很有用吧。",
            "yard_006": "一枚精致的小徽章",

            "shack_050": "很漂亮的礼物，谢谢你。",
            "shack_051": "这是一块金属吗？",
            "shack_052": "你在哪里搞到的？",
            "shack_053": "天天的棒棒糖。",
            "shack_054": "一株奇怪的植物",
            "shack_055": "小花篮，小花篮。",
            "shack_056": "很高深的东西。",
            "shack_057": "哇，这一一瓶黄油酱吗？",
            "shack_058": "紫色的糖果。",
            "shack_059": "这是属于你的吗？",
            "shack_060": "看着好眼熟",

            "yard_100": "我想它不适合放到这里。",
            "yard_101": "午夜的月光，洒在长长的脚凳上。",
            "yard_102": "他不可思议了。",
            "yard_103": "天哪，你竟然带回了一艘帆船。",
            "yard_105": "这是你去侏罗纪带回的纪念物吗？",
            "yard_106": "可爱的小盒子",
            "yard_107": "花坛？我感觉我们并不需要它。",
            "yard_108": "不错的椅子。",
            "yard_109": "来自冬天的信箱？",
            "yard_110": "这看着好诡异。",
            "yard_111": "或许他是有用的。",
            "yard_112": "一块小石子？",
            "yard_113": "你这只调皮的小猫。",
            "yard_115": "一颗像风车的树。",
            "yard_117": "灰黄的小夜灯，我想你来错的放了。",
            "yard_118": "来自冬天的树干，那是积雪吗？",
            "yard_119": "一只一只又一只游泳圈。",
            "yard_120": "这个看着好眼熟。",
            "yard_121": "大树地下好乘凉。",

            "hall_010":"一片绿叶？",
            "hall_011":"这是可以吃的东西吗？",
            "hall_012":"装饰一下房间。",
            "hall_013":"蛋糕。",
            "hall_014":"有点腻。",
            "hall_015":"超级无敌大棒棒糖。",
            "hall_016":"一份甜点。",
            "hall_017":"好大的蚕豆。",
            "hall_018":"草莓蛋糕。",
            "hall_019":"夹心蛋糕。",
            "hall_020":"可爱的零食。",
            "hall_021":"红红的小蛋糕。",
            "hall_022":"这是？",
            "hall_023":"巧克力奶糖吗？",
            "hall_024":"棒棒糖。",
            "hall_025":"草莓",
            "hall_026":"桃子",
            "hall_027":"苹果",
            "hall_028":"雪糕",
            "hall_029":"冰淇淋",
            "hall_030":"七彩冰淇淋",
            "hall_031":"纳豆吗？",
            "hall_032":"这个颜色并不好。",
            "hall_033":"七彩糖。",
            "hall_034":"你是来找硬币的吗？",
            "hall_035":"一颗心心。",
            "hall_036":"好魔幻的瓶子。",
            "hall_039":"你确定这是食物？",
            "hall_040":"甜点圈？",

            "room_001": "这是什么1？",

            "miss_01": "丢了 (⊙﹏⊙)"
        },
        "-- 注释 thingsPos --": "物品的摆放位置。",
        "thingsPos": {
            //这些事新手引导要找回的东西
            "shack_023": cc.v2(-85,477),
            "shack_005": cc.v2(-232,-564),
            "shack_007": cc.v2(-1033,-102),
            "shack_011": cc.v2(987,-69),
            "shack_006": cc.v2(272,-467),
            "yard_050": cc.v2(647,142),
            "yard_060": cc.v2(-161,-542),
            "yard_036": cc.v2(12,-297),
            "yard_006": cc.v2(-484,67),
                        
            "shack_050":cc.v2(224,454),
            "shack_051":cc.v2(77,-548),
            "shack_052":cc.v2(-1070,306),
            "shack_053":cc.v2(34,321),
            "shack_054":cc.v2(335,335),
            "shack_055":cc.v2(190,329),
            "shack_056":cc.v2(-928,318),
            "shack_057":cc.v2(-514,335),
            "shack_059":cc.v2(-728,325),
            "shack_058":cc.v2(585,321),
            "shack_060":cc.v2(820,318),

            "yard_100": cc.v2(-303,140),
            "yard_101": cc.v2(96,134),
            "yard_102": cc.v2(-425,226),
            "yard_103": cc.v2(-128,234),
            "yard_105": cc.v2(-368,-554),
            "yard_106": cc.v2(246,-592),
            "yard_107": cc.v2(582,37),
            "yard_108": cc.v2(-556,-179),
            "yard_109": cc.v2(-614,142),
            "yard_110": cc.v2(-494,136),
            "yard_111": cc.v2(-399,163),
            "yard_112": cc.v2(584,-541),
            "yard_113": cc.v2(330,-531),
            "yard_115": cc.v2(-65,169),
            "yard_117": cc.v2(159,-500),
            "yard_118": cc.v2(-637,-321),
            "yard_119": cc.v2(-275,-258),
            "yard_120": cc.v2(57,-79),
            "yard_121": cc.v2(-293,-16),
			
			"hall_010":cc.v2(-446,-480),
			"hall_011":cc.v2(795,-14),
			"hall_012":cc.v2(959,-76),
			"hall_013":cc.v2(-576,227),
			"hall_015":cc.v2(-906,418),
			"hall_014":cc.v2(-563,124),
			"hall_016":cc.v2(-918,-152),
			"hall_017":cc.v2(-930,114),
			"hall_018":cc.v2(-916,-28),
			"hall_019":cc.v2(-828,149),
			"hall_020":cc.v2(-808,-12),
			"hall_021":cc.v2(-796,-134),
			"hall_022":cc.v2(-697,-255),
			"hall_023":cc.v2(-556,31),
			"hall_024":cc.v2(-936,-264),
			"hall_025":cc.v2(-476,37),
			"hall_026":cc.v2(-722,-16),
			"hall_027":cc.v2(-631,-106),
			"hall_028":cc.v2(880,102),
			"hall_030":cc.v2(831,200),
			"hall_031":cc.v2(678,127),
			"hall_032":cc.v2(766,301),
			"hall_033":cc.v2(737,207),
			"hall_034":cc.v2(-417,-414),
			"hall_035":cc.v2(480,-420),
			"hall_036":cc.v2(-57,-315),
			"hall_039":cc.v2(-816,-284),
			"hall_040":cc.v2(780,115),
        },

        "-- 注释:小猫相关数据 --": "--- 小猫的名称、动画、图片、外出图片、拼图等---",
        "catType": ["cat-0", "cat-4", "cat-3", "cat-1", "cat-2"],
        "catTotal": ["catKey_0", "catKey_1", "catKey_2", "catKey_3", "catKey_4", "catKey_5", "catKey_6", "catKey_7", "catKey_8", "catKey_9"],
        "catData": {
            "cat-0": {
                "name": "波比",
                "catType": "cat-0",
                "cardPicture": "men_cat-0",
                "desc": "一切的源泉。",

                "-- 注释:动画 --": "这只小猫的所有动画, 所有猫咪都要这个顺序加入数组 !!! idx:0~6 为猫咪的日常状态; 7,8为外出时才能用到的",
                "-- 注释:动画名称 --": "1舔毛,2招手,3站立,4卧,5舔手,6面壁思过,7搞事情,8直立(点中),9外出",
                "actionArr": ["cat01", "cat02", "cat03", "cat04", "cat05", "cat06", "cat07", "cat08", "cat09"]
            },
            "cat-1": {
                "name": "森迪",
                "catType": "cat-1",
                "cardPicture": "men_cat-1",
                "desc": "找到让你欢乐",
                "actionArr": ["cat01", "cat02", "cat03", "cat04", "cat05", "cat06", "cat07", "cat08", "cat09"]
            },
            "cat-2": {
                "name": "塞勒姆",
                "catType": "cat-2",
                "cardPicture": "men_cat-2",
                "desc": "感受风吹在脸上。",
                "actionArr": ["cat01", "cat02", "cat03", "cat04", "cat05", "cat06", "cat07", "cat08", "cat09"]
            },
            "cat-3": {
                "name": "小樱",
                "catType": "cat-3",
                "cardPicture": "men_cat-3",
                "desc": "来抓我啊。",
                "actionArr": ["cat01", "cat02", "cat03", "cat04", "cat05", "cat06", "cat07", "cat08", "cat09"]
            },
            "cat-4": {
                "name": "托瑞",
                "catType": "cat-4",
                "cardPicture": "men_cat-4",
                "desc": "多么可爱的小猫咪。",
                "actionArr": ["cat01", "cat02", "cat03", "cat04", "cat05", "cat06", "cat07", "cat08", "cat09"]
            }
        }
    }

    //小猫动画的前缀名称
    catAnimation = {
        "cat-0": "tom_",
        "cat-1": "ben_",
        "cat-2": "ginger_",
        "cat-3": "angela_",
        "cat-4": "hank_",
        "cat-5": "tom_"
    }

    initData() {
        //版本比较 是否重置数据
        let reset = false;
        let version = cc.sys.localStorage.getItem("version");
        console.log("-- version -- " + version + " -- " + this.version);
        if (version != this.version) {
            reset = true;
            cc.sys.localStorage.setItem("version", this.version);
            this.resetData();

            //leadStep =0 ,表示是在 新手引导的阶段
            cc.dataMgr.userData.leadStep = 0;
        }
        console.log("--- initData ---");
        //判断违规
        if (cc.dataMgr.getTimeSecond_i() < this.beginTime) {
            console.log("--- 系统判定有 违规行为 ,  即将清除个人数据 ---");
            this.resetData();
            cc.dataMgr.userData.leadStep = 0;
        }

        //玩家openid
        let openid = cc.sys.localStorage.getItem("openid");
        if (!openid || reset)
            cc.sys.localStorage.setItem("openid", 0);
        cc.dataMgr.openid = cc.sys.localStorage.getItem("openid");
        console.log(cc.dataMgr.openid);

        //读取游戏进度
        let userDataStr = cc.sys.localStorage.getItem("userData");
        if (!userDataStr)
            cc.sys.localStorage.setItem("userData", JSON.stringify(this.userData));
        else
            this.userData = JSON.parse(userDataStr);

        //对 userData 中后来加入的变量进行检查
        if (this.userData.playBg == undefined) {
            this.userData.playBg = true;
            this.userData.playEffect = true;
            this.userData.showPos = true;
        }
        console.log(this.userData);

        let score = cc.sys.localStorage.getItem("bestScore");
        if (!score)
            cc.sys.localStorage.setItem("bestScore", 0);
        else
            this.userData.bestScore = score;

        //初始化 toolsQQ 
        console.log("-- initToolsQQ --");
        let toolsQQStr = cc.sys.localStorage.getItem("toolsQQ");
        console.log(toolsQQStr);
        if (!toolsQQStr) {
            cc.sys.localStorage.setItem("toolsQQ", JSON.stringify(toolsQQ));
        } else
            toolsQQ = JSON.parse(toolsQQStr);

        //加载图片资源
        // cc.loader.loadRes("cj01", cc.SpriteFrame, function (err, frame) {
        //     if (!err)
        //         cc.dataMgr.bgFrame["cj01"] = frame;
        // });

        //宝石狗狗检查
        this.refreshDog();
    }

    //重大改变之前 如扣钱口金币等 要保存数据 
    saveData() {
        cc.sys.localStorage.setItem("userData", JSON.stringify(this.userData));
        cc.sys.localStorage.setItem("toolsQQ", JSON.stringify(toolsQQ));
    }

    //重置数据 可以部分充值
    resetData() {
        cc.sys.localStorage.setItem("userData", "");
        cc.sys.localStorage.setItem("toolsQQ", "");
    }

    //isTake 是点击领取按钮
    refreshDog(isTake) {
        console.log("--- refreshDog dataMgr --");
        console.log(cc.dataMgr.userData.dogData);
        let timeNow = this.getTimeSecond_i();
        console.log(timeNow);
        if (isTake === true && cc.dataMgr.userData.dogData.canTake && timeNow > this.beginTime && timeNow > cc.dataMgr.userData.dogData.lastTakeTime) {
            cc.dataMgr.userData.dogData.canTake = false;
            cc.dataMgr.userData.dogData.lastTakeTime = timeNow;
            ++cc.dataMgr.userData.dogData.takeCount;
            if (cc.dataMgr.userData.dogData.takeCount == 7)
                this.changeGems_b(3);
            else
                this.changeGems_b(1);
        } else if (cc.dataMgr.userData.dogData.lastTakeTime + 23 * 60 * 60 <= timeNow) {
            cc.dataMgr.userData.dogData.canTake = true;
            if (cc.dataMgr.userData.dogData.takeCount >= 7)
                cc.dataMgr.userData.dogData.takeCount = 0;
        }
    }

    //购买一个房间(现在所有房间都是开放的 不存在购买)
    addOneRoom(roomIdx) {
        if (true)
            return;
        if (roomIdx < cc.dataMgr.userData.roomData.length) {
            let roomU = cc.dataMgr.userData.roomData[roomIdx];
            roomU.isHave = true;
            if (cc.dataMgr.userData.haveRoom.indexOf(roomU.name) >= 0)
                cc.dataMgr.userData.haveRoom.push(roomU.name);
            this.saveData();
        }
    }

    //添加一只猫咪 (猫咪的key,猫咪的名称,猫咪的类型(决定猫咪的图片))
    addOneCat(catKey, catName, catType) {
        console.log("-- addOnecat -- " + catKey);
        if (this.userData.haveCat.indexOf(catKey) < 0) {
            let atRoomIdx = this.userData.atRoomIdx;
            let atCatArr = this.getAtCat_arr(this.userData.atRoomIdx);
            if (atCatArr.length >= 4 && (this.userData.atRoomIdx == 0 || this.userData.atRoomIdx == 3))
                atRoomIdx = 1;
            this.userData.haveCat.push(catKey);
            let oneCatU = {
                name: catName,
                catType: catType, //小猫的 id
                hat: null, //小猫的帽子、头饰、头巾等
                face: null, //小猫的面具、眼镜、胡子等面部装饰
                tie: null, //小猫的领带
                boot: null, //小猫的靴子
                haveCard: [], //小猫的拼图

                inOut: 0, //0:没出去,1:出去了,2:出去已经回来了(外出时在屋里是不出现猫咪的)
                outTime: 0, //小猫出去的时间秒
                outBack: 200, //小猫多少秒之后 会回来
                outCount: 0, //小猫出去次数统计
                backTake: null, //回来带的礼物

                atRoomIdx: atRoomIdx, //这只小猫所在的房间下标
                atPosX: 0, //这是小猫当前的位置
                atPosY: 0,
                actionIdx: 0, //这是小猫当前的动画

                //后面再添加数据 包括 什么时候变换状态
                needStatus: "no", //需要什么状态 no:没有 eat:吃 touch:抚摸 shower:洗澡
            }
            this.userData.catData[catKey] = oneCatU;

            this.saveData();
        }
    }

    //返回是否改变成功
    changeCoins_b(changeNum) {
        let isChanged = true;
        if (cc.dataMgr.userData.coins + changeNum < 0)
            isChanged = false;
        else {
            cc.dataMgr.userData.coins += changeNum;
            this.saveData();
        }

        //刷新gems 控件
        let gameJs = cc.find("Canvas").getComponent("Game");
        if (gameJs)
            gameJs.refreshGemsAndCoins();
        return isChanged;
    }

    //返回是否改变成功
    changeGems_b(changeNum) {
        let isChanged = true;
        if (cc.dataMgr.userData.gems + changeNum < 0)
            isChanged = false;
        else {
            cc.dataMgr.userData.gems += changeNum;
            this.saveData();
        }

        //刷新gems 控件
        let gameJs = cc.find("Canvas").getComponent("Game");
        if (gameJs)
            gameJs.refreshGemsAndCoins();
        return isChanged;
    }

    //获取某个房间的 小猫的数量
    getAtCat_arr(roomIdx) {
        //console.log("--- 在房间里的猫咪 -- " + roomIdx);
        let atArr = [];
        if (this.userData && this.userData.haveCat) {
            for (let i = 0; i < this.userData.haveCat.length; ++i) {
                let catKey = this.userData.haveCat[i];
                let catU = this.userData.catData[catKey];
                //小猫 没有外出 、且在房间中才算。
                if (catU && catU.atRoomIdx == roomIdx && catU.inOut == 0)
                    atArr.push(catKey);
                if (typeof (catU.atRoomIdx) != "number")
                    catU.atRoomIdx = 1;
            }
        }
        //console.log(atArr);
        return atArr;
    }

    //获取所有外出的猫咪
    getOutCat_arr() {
        console.log("-- 外出小猫 名单 --");
        let outArr = [];
        if (this.userData && this.userData.haveCat) {
            for (let i = 0; i < this.userData.haveCat.length; ++i) {
                let catKey = this.userData.haveCat[i];
                let catU = this.userData.catData[catKey];
                if (catU && catU.inOut > 0) {
                    outArr.push(catKey);
                }
            }
        }
        console.log(outArr);
        return outArr;
    }

    //一只小猫走了 (判断是否消耗金币)
    oneCatOut_b(catKey) {
        console.log("-- 一直小猫即将外出 oneCatOut_b --" + catKey);
        let isOut = false;
        let cost = this.getCostCoins_i();
        if (cost >= 0 && this.userData.coins >= cost) {
            let catU = this.userData.catData[catKey];
            if (catU && catU.inOut == 0) {
                this.userData.coins -= cost;
                ++this.userData.countOutNum;
                catU.inOut = 1;
                catU.outTime = this.getTimeSecond_i();
                catU.outBack = this.getCatBackTime_i();
                catU.outCount = catU.outCount + 1;
                catU.backTake = this.getOneBackTake_o(catKey);

                //没四次外出 都要互动一次
                if (cc.dataMgr.userData.leadStep == -1) {
                    if (catU.outCount % 4 == 0) {
                        let randomIdx = Math.floor(Math.random() * 3);
                        let statusArr = ["eat", "shower", "touch"];
                        if (randomIdx >= 3)
                            randomIdx = 0;
                        catU.needStatus = statusArr[randomIdx];
                    }
                }
                isOut = true;
            }
            console.log(catU);
        }
        console.log("-- oneCatOut_b -- " + catKey + " -- " + cost + " -- " + isOut);
        return isOut;
    }

    //获取小猫多长时间回来
    getCatBackTime_i() {
        let time = 2000 + Math.ceil(Math.random() * 800);
        if (this.userData.countOutNum < 5)
            time = 2;
        else if (this.userData.countOutNum < this.gameData.baseThings.length)
            time = this.userData.countOutNum * 2;
        else if (this.userData.countOutNum < 10 + this.gameData.baseThings.length)
            time = 200 + Math.ceil(Math.random() * 800);
        else if (this.userData.countOutNum < 40 + this.gameData.baseThings.length)
            time = 1000 + Math.ceil(Math.random() * 800);
        return time;
    }

    // 返回值为-1 说明当前猫咪数已经是三只了,不能再出去了。
    getCostCoins_i() {
        let cost = -1;
        let allOutNum = 0;
        let outNum = 0;
        if (this.userData && this.userData.haveCat) {
            for (let i = 0; i < this.userData.haveCat.length; ++i) {
                let catKey = this.userData.haveCat[i];
                let catU = this.userData.catData[catKey];
                if (catU && catU.inOut > 0) {
                    ++allOutNum;
                    if (catU.outTime + catU.outBack > this.getTimeSecond_i())
                        ++outNum;
                }
            }
        }
        if (allOutNum < 3 && outNum < this.gameData.outCost.length) {
            cost = this.gameData.outCost[outNum];
        }
        //console.log("-- cost -- " + allOutNum + " -- " + outNum + " -- " + cost);
        return cost;
    }

    //点击猫咪外出的时候获取一项礼物 catKey(那一只小猫) 概率基础值 都在这里
    getOneBackTake_o(catKey) {
        // "-- 注释 result --": "--- 分为五种:things(物品),card(猫咪的卡片),coins(金币),gems(钻石),cat(新猫咪) ---",
        let backObj = {
            type: "coins",
            desc: 60 + parseInt(Math.random() * 50),
        }
        // if (true)
        //     return backObj;
        let random = Math.random();
        //随机 type base 是新手引导中的顺序,只有这个引导完成才能随机 其它的
        let catU = cc.dataMgr.userData.catData[catKey];
        if (this.userData.haveThings.length < this.gameData.baseThings.length) {
            backObj.type = "things";
            backObj.desc = this.gameData.baseThings[this.userData.haveThings.length];
        } else if (cc.dataMgr.userData.leadStep > 0 && cc.dataMgr.userData.leadStep < 25) {
            //为了防止新手引导出错
            console.log("--- 引导出错 恢复数据 error ----");
            cc.dataMgr.userData.leadStep = 25;
            cc.find("Canvas").getComponent("NodeLead").refreshLead();
        }

        // //保险箱出场了
        // if (this.userData.haveThings.length - 6 == this.gameData.baseThings.length) {
        //     backObj.type = "things";
        //     backObj.desc = "shack_020";
        // }

        if (backObj.type == "coins") {
            if (random > 0.8) {
                //这只猫的身份卡片
                if (catU.haveCard.length < this.gameData.cardNum) {
                    //找一一张剩余的卡片
                    let cardID = Math.ceil(Math.random() * 15);
                    if (cardID > this.gameData.cardNum) {
                        cardID = cardID - this.gameData.cardNum;
                    }
                    if (catU.haveCard.indexOf(cardID) < 0) {
                        backObj.type = "card";
                        backObj.desc = cardID;
                    }
                }
            } else if (random > 0.1) {
                //找到一个没有的 things
                let beginIdx = Math.floor(Math.random() * this.gameData.thingsTotal.length);
                if (beginIdx < this.gameData.thingsTotal.length) {
                    for (let i = 0; i < this.gameData.thingsTotal.length; ++i) {
                        let aimIdx = i + beginIdx;
                        if (aimIdx >= this.gameData.thingsTotal.length)
                            aimIdx -= this.gameData.thingsTotal.length;
                        let aimThings = this.gameData.thingsTotal[aimIdx];
                        if (this.userData.haveThings.indexOf(aimThings) < 0) {
                            backObj.type = "things";
                            backObj.desc = aimThings;
                            break;
                        }
                    }
                }
            }
        }
        console.log("-- 随机一项物品 -- " + backObj.type + " -- " + backObj.desc + " -- count : " + this.userData.haveThings.length);
        return backObj;
    }

    getTimeSecond_i() {
        return parseInt(Date.now() / 1000);
    }

    //比较储存历史最高纪录
    getBestScore_i(nowScore) {
        if (nowScore > parseInt(this.userData.bestScore)) {
            this.userData.bestScore = nowScore;
            cc.sys.localStorage.setItem("bestScore", nowScore);
        }
        return this.userData.bestScore;
    }

    //------ 玩家注册等 ------

    getBgFrame_sf(name) {
        if (!name)
            name = cc.dataMgr.gameBgName[cc.dataMgr.userData.gameBgIdx];
        return this.bgFrame[name];
    }

    getUerOpenID() {

    }

    //------ 分享奖励相关 ------

    //从服务器获得用户的推荐奖励，并刷新在界面上
    getShareReward() {
        let openid = cc.sys.localStorage.getItem("openid");
        console.log("--- 获取分享奖励 ---" + openid);
        if (CC_WECHATGAME && openid) {
            wx.request({
                url: 'https://bpw.blyule.com/game_2/public/index.php/index/index/getprise?userid=' + openid,
                data: {
                    userid: openid,
                },
                success: (obj, statusCode, header) => {
                    console.log("--- 获取分享奖励 success ---");
                    console.log(obj);
                    if (obj.data.code > 0) {
                        let num = obj.data.code;
                        cc.dataMgr.haveProp.countInvite += num;
                        cc.dataMgr.refreshInvite();
                    }
                },
            });
        }
    }
}