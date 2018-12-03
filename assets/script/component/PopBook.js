const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class PopBook extends cc.Component {
    /*
    不需要拖拽空间 刷新信息的 全挂这个脚本(只处理按钮的响应事件)
        如:pop_game、pop_catList、pop_store、pop_box、pop_set、pop_dog
    需要单独创建脚本的有:
        pop_buy、pop_room、pop_things、pop_catUI、pop_catTake、pop_catData、pop_newCat、pop_gaming
    */

    //this.node.isWillHide = true;//几乎是和 active 保持一致(为了cutOut的显示和隐藏)

    _canRefreshDog = true;

    onLoad() {

    }

    start() {
        if (this.node.name == "pop_dog") {
            this.schedule(this.refreshTime, 1);
        }
    }

    //有几个简单的弹窗是共用这一个脚本的,有些地方需要单独处理
    showPop() {
        cc.audioMgr.playEffect("pop_open");
        this.node.isWillHide = false;
        //放大显示
        this.node.active = true;
        this.node.scale = 0;
        this.node.runAction(cc.scaleTo(0.4, 1));

        if (this.node.name == "pop_box") {
            let eidtBox = this.node.getChildByName("eidtBox");
            eidtBox.getComponent(cc.EditBox).string = "";
        } else if (this.node.name == "pop_catList") {
            //初始化 猫咪 列表
            let btn_newCat = this.node.getChildByName("btn_newCat");
            if (cc.dataMgr.atRoomIdx != 0 && cc.dataMgr.userData.haveCat.length < cc.dataMgr.gameData.catTotal.length) {
                let price = cc.dataMgr.gameData.buyCat[cc.dataMgr.userData.haveCat.length];
                btn_newCat.active = true;
                let str = cc.dataMgr.userData.gems + "\\" + price;
                btn_newCat.getChildByName("lab_gems").active = (price > 0);
                btn_newCat.getChildByName("lab_gems").getComponent(cc.Label).string = str;
            } else
                btn_newCat.active = false;

            let node_cat = this.node.getChildByName("page_view").getChildByName("view").getChildByName("content").getChildByName("node_cat");
            let haveCat = cc.dataMgr.userData.haveCat;
            if (haveCat && node_cat) {
                for (let i = 0; i < haveCat.length; ++i) {
                    let catKey = haveCat[i];
                    let catU = cc.dataMgr.userData.catData[catKey];
                    console.log("-- pop_catList --", catKey, catU);
                    let strNum = catU.haveCard.length + "/15";
                    if (i < node_cat.children.length) {
                        let nodeN = node_cat.children[i];
                        nodeN.getChildByName("lab_num").getComponent(cc.Label).string = strNum;
                        nodeN.getChildByName("lab_num").getChildByName("card").active = true;
                        nodeN.getChildByName("spr_effect").getComponent("NodeEffect").initEffect("catHead", catU.catType, 0);
                        nodeN.catKey = catKey;
                    }
                }
                this.node.getChildByName("lab_num").getComponent(cc.Label).string = (haveCat.length + "/" + cc.dataMgr.gameData.catTotal.length);
            }
        } else if (this.node.name == "pop_store") {
            //商店播放商店音效
            cc.audioMgr.playEffect("pop_store");
        } else if (this.node.name == "pop_dog") {
            //宝石狗狗播放宝石狗狗音效
            cc.audioMgr.playEffect("dog_call");
            this.refreshDog(true);
        } else if (this.node.name == "pop_set") {
            //设置界面初始化
            this.node.getChildByName("tog_bg").getComponent(cc.Toggle).isChecked = (cc.dataMgr.userData.playBg === true);
            this.node.getChildByName("tog_effect").getComponent(cc.Toggle).isChecked = (cc.dataMgr.userData.playEffect === true);
            this.node.getChildByName("tog_catPos").getComponent(cc.Toggle).isChecked = (cc.dataMgr.userData.showPos === true);
        } else if (this.node.name == "pop_name") {
            //给猫咪命名界面初始化
            let eidtBox = this.node.getChildByName("eidtBox");
            eidtBox.getComponent(cc.EditBox).string = "";
        } else if (this.node.name == "pop_game") {
            //小游戏界面初始化
            if (!toolsQQ.doubleGame) {
                let pop_adGame = cc.find("Canvas/pop_adGame");
                if (pop_adGame) {
                    pop_adGame.getComponent("PopBook").showPop();
                }
            }
        } else if (this.node.name == "pop_adGame") {

        }
    }

    hidePop() {
        this.node.isWillHide = true; //为了 catOut 显示
        this.node.runAction(cc.sequence(cc.scaleTo(0.2, 0), cc.callFunc(this.scaleEnd, this)));
    }

    scaleEnd() {
        this.node.active = false;
    }

    //刷新宝石狗狗界面
    refreshDog(isShow) {
        if (this.node.name == "pop_dog") {
            console.log(cc.dataMgr.userData);
            if (isShow) {
                let spr_dog = this.node.getChildByName("node_dog").getChildByName("store_gem_dog");
                spr_dog.y = 0;
                spr_dog.stopAllActions();
                spr_dog.runAction(cc.moveBy(0.8, cc.v2(0, 160)));
            }
            let lab_num = this.node.getChildByName("btn_getGems").getChildByName("lab_num");
            let lab_gems = this.node.getChildByName("btn_getGems").getChildByName("lab_gems");

            if (cc.dataMgr.userData.dogData.canTake)
                lab_num.getComponent(cc.Label).string = "免费";
            else
                lab_num.getComponent(cc.Label).string = "450";
            if (cc.dataMgr.userData.dogData.canTake && cc.dataMgr.userData.dogData.takeCount >= 6)
                lab_gems.getComponent(cc.Label).string = "3";
            else
                lab_gems.getComponent(cc.Label).string = "1";

            //进度条
            let layout_page = this.node.getChildByName("layout_page");
            for (let i = 0; i < layout_page.children.length; ++i) {
                let nodeN = layout_page.children[i];
                nodeN.getComponent(cc.Toggle).isChecked = (i < cc.dataMgr.userData.dogData.takeCount);
            }
        }
    }

    //刷新宝石狗狗倒计时
    refreshTime() {
        if (this.node.name == "pop_dog" && this.node.active) {
            let timeTake = cc.dataMgr.userData.dogData.lastTakeTime + 23 * 60 * 60 - cc.dataMgr.getTimeSecond_i();
            if (timeTake <= 0) {
                timeTake = 0;
                //保证每次到零 都只进入一次
                if (this._canRefreshDog) {
                    this._canRefreshDog = false;
                    cc.dataMgr.refreshDog();
                    this.refreshDog();
                }
            } else
                this._canRefreshDog = true;

            let strTime = "";
            if (timeTake >= 3600) {
                let hour = Math.floor(timeTake / 3600);
                if (hour > 0)
                    strTime = hour + "h";
            }
            let lastSecond = timeTake % 3600;
            let min = Math.floor(lastSecond / 60);

            lastSecond = lastSecond % 60;

            strTime = strTime + " " + min + "m " + lastSecond + "s";
            let lab_time = this.node.getChildByName("node_day").getChildByName("lab_time");
            if (lab_time)
                lab_time.getComponent(cc.Label).string = strTime;
        }
    }

    //不同界面的按钮进行分开处理
    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            console.log("-- onClickBtn -- " + this.node.name + " -- " + btnN);
            if (btnN == "ui_close" || btnN == "btn_bg") {
                this.hidePop();
                //固定页面返回在这里处理
                let gameJs = cc.find("Canvas").getComponent("Game");
                if (gameJs)
                    gameJs.moveCatOut();
            } else if (this.node.name == "pop_book") {
                if (btnN == "btn_build1") {
                    cc.dataMgr.userData.popType = "pop_catList";
                } else if (btnN == "btn_build2") {
                    cc.dataMgr.userData.popType = "pop_things";
                } else if (btnN == "btn_build3") {
                    cc.dataMgr.userData.popType = "pop_game";
                } else if (btnN == "btn_build4") {
                    cc.dataMgr.userData.popType = "pop_newCat";
                } else if (btnN == "btn_build5") {
                    cc.dataMgr.userData.popType = "pop_buy";
                } else if (btnN == "btn_build6") {
                    cc.dataMgr.userData.popType = "pop_store";
                } else if (btnN == "btn_build7") {
                    cc.dataMgr.userData.popType = "pop_room";
                } else if (btnN == "btn_build8") {
                    //分享
                    shareQQ("friend");
                } else if (btnN == "btn_build9") {
                    cc.dataMgr.userData.popType = "pop_box";
                } else if (btnN == "btn_build10") {
                    cc.dataMgr.userData.popType = "pop_set";
                } else
                    cc.dataMgr.userData.popType = null;

                //跳转页面了
                let gameJs = cc.find("Canvas").getComponent("Game");
                if (gameJs && cc.dataMgr.userData.popType)
                    gameJs.showPop();
            } else if (this.node.name == "pop_catList") {
                if (btnN == "cat") {
                    let catKey = event.target.catKey;
                    if (catKey) {
                        //弹出小猫的个人属性界面
                        cc.dataMgr.userData.touchCatName = catKey;
                        cc.dataMgr.userData.popType = "pop_catData";
                        let gameJs = cc.find("Canvas").getComponent("Game");
                        if (gameJs)
                            gameJs.showPop();
                    }
                }
            } else if (this.node.name == "pop_game") {
                let gameJs = cc.find("Canvas").getComponent("Game");
                if (gameJs) {
                    this.hidePop();
                    //getFish eatFood fishing boxing 四种小游戏模式
                    if (btnN == "getFish" || btnN == "eatFood" || btnN == "fishing" || btnN == "boxing") {
                        cc.dataMgr.userData.gameType = btnN;
                        cc.dataMgr.userData.popType = "pop_gaming";
                        gameJs.showPop();
                    }
                }
            } else if (this.node.name == "pop_box") {
                if (btnN == "btn_boxSure") {
                    //输入密码 是pop_box
                    let eidtBox = this.node.getChildByName("eidtBox");
                    if (eidtBox) {
                        let strEdit = eidtBox.getComponent(cc.EditBox).string;
                        console.log("--- 输入的是 -- " + strEdit);
                        if (strEdit) {
                            let strHint = "";
                            if (cc.dataMgr.userData.atRoomIdx < cc.dataMgr.gameData.roomData.length) {
                                let openedBox = cc.dataMgr.userData.roomData[cc.dataMgr.userData.atRoomIdx].openedBox;
                                let boxData = cc.dataMgr.gameData.roomData[cc.dataMgr.userData.atRoomIdx].boxData;
                                for (let i = 0; i < boxData.length; ++i) {
                                    let oneD = boxData[i];
                                    //满足打开的条件 密码正确 且 从未被打开过
                                    if (openedBox.indexOf(i) < 0) {
                                        if (!strHint)
                                            strHint = oneD.desc;
                                        if (cc.dataMgr.userData.haveThings.indexOf(oneD.needThings) >= 0 || oneD.needThings == "key") {
                                            if (strEdit == oneD.password) {
                                                //这里是可以领取奖励的
                                                console.log("-- 保险箱 open -- " + i + " -- " + oneD.password) + " -- " + oneD.result.type;
                                                console.log(oneD);
                                                console.log(cc.dataMgr.userData);
                                                let gameJs = cc.find("Canvas").getComponent("Game");
                                                if (gameJs) {
                                                    openedBox.push(i);
                                                    gameJs.addWaveEffect((oneD.result.type == "coins"), oneD.result.desc);

                                                    this.hidePop();
                                                    gameJs.moveCatOut();
                                                }
                                                break;
                                            } else
                                                strHint = oneD.desc;
                                        }
                                    }
                                }
                                if (!strHint)
                                    strHint = "所有箱子都已经打开了。";
                            } else
                                strHint = "miss >_<";
                            eidtBox.getComponent(cc.EditBox).string = strHint;
                        }
                    }
                }
            } else if (this.node.name == "pop_set") {
                if (btnN == "tog_bg") {
                    let isChecked = event.target.getComponent(cc.Toggle).isChecked;
                    cc.dataMgr.userData.playBg = isChecked;
                    if (!isChecked) {
                        cc.audioMgr.stopBg();
                    } else {
                        cc.audioMgr.playBg();
                    }
                } else if (btnN == "tog_effect") {
                    let isChecked = event.target.getComponent(cc.Toggle).isChecked;
                    cc.dataMgr.userData.playEffect = isChecked;
                } else if (btnN == "tog_catPos") {
                    let isChecked = event.target.getComponent(cc.Toggle).isChecked;
                    cc.dataMgr.userData.showPos = isChecked;
                    let gameJs = cc.find("Canvas").getComponent("Game");
                    if (gameJs)
                        gameJs.refreshCatPoint();
                }
            } else if (this.node.name == "pop_dog") {
                if (btnN == "btn_getGems") {
                    if (cc.dataMgr.userData.dogData.canTake) {
                        playQQAdVideo("adDog");
                    } else {
                        if (cc.dataMgr.userData.coins >= 450) {
                            cc.dataMgr.userData.coins -= 450;
                            cc.dataMgr.changeGems_b(1);
                        } else {
                            cc.dataMgr.userData.popType = "pop_store";
                            let gameJs = cc.find("Canvas").getComponent("Game");
                            if (gameJs)
                                gameJs.showPop();
                        }
                    }
                }
            } else if (this.node.name == "pop_store") {
                let goDog = false;
                if (btnN == "btn_goDog") {
                    goDog = true;
                } else if (btnN == "btn_getCoins") {
                    if (cc.dataMgr.userData.gems >= 1) {
                        cc.dataMgr.userData.gems -= 1;
                        cc.dataMgr.changeCoins_b(300);
                    } else
                        goDog = true;
                } else if (btnN == "btn_adCoins") {
                    playQQAdVideo("adCoins");
                } else if (btnN == "btn_adGame") {
                    playQQAdVideo("adGame");
                } else if (btnN == "btn_adClean") {
                    playQQAdVideo("adClean");
                }
                if (goDog) {
                    cc.dataMgr.userData.popType = "pop_dog";
                    let gameJs = cc.find("Canvas").getComponent("Game");
                    if (gameJs)
                        gameJs.showPop();
                }
            } else if (this.node.name == "pop_name") {
                if (btnN == "btn_sure") {
                    let eidtBox = this.node.getChildByName("eidtBox");
                    if (eidtBox) {
                        let strEdit = eidtBox.getComponent(cc.EditBox).string;
                        console.log("--- 输入的是 -- " + strEdit);
                        if (strEdit) {
                            //更改猫咪的昵称(一定是最后一只猫咪)
                            let catKey = cc.dataMgr.userData.haveCat[cc.dataMgr.userData.haveCat.length - 1];
                            let catU = cc.dataMgr.userData.catData[catKey];
                            console.log(catU);
                            if (catU) {
                                catU.name = strEdit;

                                let pop_newCat = cc.find("Canvas/panel_pop/pop_newCat");
                                if (pop_newCat && pop_newCat.active) {
                                    let PopNewCatJs = pop_newCat.getComponent("PopNewCat");
                                    if (PopNewCatJs) {
                                        PopNewCatJs.refreshCatName(strEdit);
                                    }
                                }
                            }

                            if (cc.dataMgr.userData.leadStep == 1000) {
                                cc.dataMgr.userData.leadStep = 1;
                                cc.find("Canvas").getComponent("NodeLead").refreshLead();
                            }
                            this.hidePop();
                        } else
                            eidtBox.getComponent(cc.EditBox).string = "";
                    }
                }
            } else if (this.node.name == "pop_adGame") {
                if (btnN == "btn_adGame") {
                    //播放广告
                    console.log("-- 小游戏 开始播放广告了 --");
                    playQQAdVideo("adGame");
                }
                this.hidePop();
            }
        }
    }
}