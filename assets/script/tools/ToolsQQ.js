(function () {
    console.log("-- load ToolsQQ --");
    
    //广告相关数据
    window.toolsQQ = {
        inAd: false, //当前正在播放广告
        adType: null, //当前广告的类型 “adDog(宝石狗免费领取),adGoldCat(观看广告可点金猫),adClean(清理奖励加倍),adGame(游戏奖励加倍),adSpeed(外出小猫时间缩短),addGold(广告加金币),freeCat(看广告得猫咪)”

        doubleGame: false, //是否加倍奖励

        cleaneTimeBegin: 0, //加速清理的开始时间

        cutTimeCatKey: false, //那只猫可以 加速回来

        showGoldCatAd: false, //金猫的 video 图标是否显示过(没显示 在开始点十秒之后要显示)
        goldCatBegin: 0, //开始点金猫的时间

        freeCatKey: null, //价格为零的猫咪
        freeCatType: null,
        freeCatName: "波比",

        shareType: null
    };

    //------ 激励视频广告相关 ------

    //播放激励视频
    window.playQQAdVideo = function (adType) {
        //console.log("-- playQQAdVideo -- " + adType);
        if (CC_QQPLAY) {
            toolsQQ.inAd = true;
            toolsQQ.adType = adType;

            //console.log("-- QQ video create --");

            var videoAd = BK.Advertisement.createVideoAd();
            videoAd.onLoad(function () {
                //加载成功
                BK.Script.log(1, 1, "-- QQ onLoad --");
            });

            videoAd.onPlayStart(function () {
                //开始播放
                BK.Script.log(1, 1, "-- QQ onPlayStart --");
            });

            videoAd.onPlayFinish(function () {
                //播放结束
                BK.Script.log(1, 1, "-- onPlayFinish --");
                adQQSuccess();
            });

            videoAd.onError(function (err) {
                //加载失败
                BK.Script.log(1, 1, "onError code:" + err.code + " msg:" + err.msg);
            });

            videoAd.show();

            //第一只猫无论如何都让玩家得到
            if (toolsQQ.adType == "freeCat") {
                adQQSuccess();
            }
        } else {
            //console.log("-- playQQAdVideo err -- " + typeof (BK) + " -- inAd " + toolsQQ.inAd + " -- " + CC_QQPLAY);
        }
        //网页测试用 之后可以屏蔽
        if (!CC_QQPLAY) {
            toolsQQ.inAd = true;
            toolsQQ.adType = adType;
            adQQSuccess();
        }
    };

    //广告成功 开始加奖励
    window.adQQSuccess = function () {
        //console.log("-- 一次广告成功 adQQSuccess -- " + toolsQQ.adType);
        // console.log(toolsQQ);
        if (toolsQQ.adType == "adDog") {
            cc.dataMgr.refreshDog(true);
            let pop_dog = cc.find("Canvas/panel_pop/pop_dog");
            if (pop_dog) {
                pop_dog.getComponent("PopBook").refreshDog(false);
            }
        } else if (toolsQQ.adType == "adGoldCat") {
            toolsQQ.showGoldCatAd = true;
            toolsQQ.goldCatBegin = getTimeSecond_i();
            //隐藏金猫小图标
            let ui_adVideo = cc.find("Canvas/node_effect/node_goldCat/ui_adVideo");
            if (ui_adVideo) {
                ui_adVideo.active = false;
            }
        } else if (toolsQQ.adType == "adClean") {
            toolsQQ.cleaneTimeBegin = getTimeSecond_i();
        } else if (toolsQQ.adType == "adGame") {
            toolsQQ.doubleGame = true;
        } else if (toolsQQ.adType == "adSpeed") {
            if (cc.dataMgr) {
                let catU = cc.dataMgr.userData.catData[toolsQQ.cutTimeCatKey];
                if (catU) {
                    let cutTime = 600;
                    if (catU.outBack > 1800) {
                        cutTime = Math.ceil(catU.outBack / 3);
                    }
                    catU.outBack -= cutTime;
                    if (catU.outBack < 0)
                        catU.outBack = 0;
                }
            }
        } else if (toolsQQ.adType == "adGold") {
            cc.dataMgr.changeCoins_b(100);
        } else if (toolsQQ.adType == "freeCat") {
            cc.dataMgr.addOneCat(toolsQQ.freeCatKey, toolsQQ.freeCatName, toolsQQ.freeCatType);
            //刷新组建
            let pop_newCat = cc.find("Canvas/panel_pop/pop_newCat");
            if (pop_newCat) {
                pop_newCat.getComponent("PopNewCat").buyOneCat();
            }
        }

        //还原数据
        toolsQQ.inAd = false;
        toolsQQ.adType = null;
    };

    //------ 分享 和 分享奖励相关 ------

    window.shareQQ = function (type) {
        toolsQQ.shareType = type;

        let qqImgUrl = "https://bpw.blyule.com/qqPickCat/cat_forward.png";
        let summaryStr = "我家懒猫离家出走了，你能帮我找回嘛。";
        if (type == "friend") {
            qqImgUrl = "https://bpw.blyule.com/qqPickCat/cat_friend.png";
            summaryStr = "这里有一群可爱的小猫咪，一起来玩吧。";
        } else if (type == "reward") { //放置东西时分享 会奖励金币
            qqImgUrl = "https://bpw.blyule.com/qqPickCat/cat_reward.png";
            summaryStr = "勤快的小猫有吃的。";
        }
        if (CC_QQPLAY) {
            BK.Share.share({
                qqImgUrl: qqImgUrl,
                socialPicPath: 'GameRes://localImage.png',
                title: '一起学喵叫',
                summary: summaryStr,
                extendInfo: '',
                success: function (succObj) {
                    BK.Console.log('分享成功', succObj.code, JSON.stringify(succObj.data));
                    shareQQSuccess();
                },
                fail: function (failObj) {
                    BK.Console.log('分享失败', failObj.code, JSON.stringify(failObj.msg));
                },
                complete: () => {
                    BK.Console.log('分享完成，不论成功失败');
                }
            });
        }
    };

    window.shareQQSuccess = function () {
        if (toolsQQ.shareType == "reward") {
            //奖励10 金币
            let gameJs = cc.find("Canvas").getComponent("Game");
            if (gameJs) {
                for (let i = 0; i < 10; ++i)
                    gameJs.addOneEffect("flyGold", 1, -150 + (Math.random() - 0.5) * 20, -400 + (Math.random() - 0.5) * 20, i);
            }
        }
    };
}());