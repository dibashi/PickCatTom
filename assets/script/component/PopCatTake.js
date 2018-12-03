const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class PopCatTake extends cc.Component {

    @property(cc.Node) //裁剪显示的
    node_mask = null;

    @property(cc.Node) //礼物展示
    node_spr = null;

    //三种礼物类型 物品、卡片、金币
    @property(cc.Node)//带回物品
    take_things = null;
    @property(cc.Node) //需要替换为找到的东西
    spr_things = null;

    @property(cc.Node)//带回卡片
    take_card = null;
    @property(cc.Node) //小猫画像 card 东西的根节点
    node_card = null;
    @property(cc.Node) //需要根据小猫替换的东西
    spr_men = null;
    @property(cc.Node) //描述
    lab_desc = null;

    @property(cc.Node) //带回金币
    take_gold = null;

    @property(cc.Node)//带回东西的描述
    node_desc = null;
    @property(cc.Node)//分享按钮
    btn_share = null;
    @property(cc.Node)//放置按钮
    btn_put = null;

    @property(cc.Node)//金币 钻石显示控件
    node_coins = null;

    //显示的是哪个控件 类型的东西
    _takeActiveNode = null;

    _takeType = null;//带回的东西的类型
    _takeDesc = null;//带回的东西的描述

    _jumpTime = 0.6; //小猫弹跳时间

    //this.node.isWillHide = true;//几乎是和 active 保持一致(为了cutOut的显示和隐藏)

    onLoad() {

    }

    start() {

    }

    //开始显示礼物之路(显示展示不同的箱子)
    showPop() {
        this.node.isWillHide = false;
        this.node.active = true;

        this.node_mask.height = 20;
        this.node_mask.runAction(cc.sequence(this.myChangeHeightTo_act(this._jumpTime, 20, 480), cc.delayTime(this._jumpTime / 2), this.myChangeHeightTo_act(this._jumpTime, 480, cc.dataMgr.canvasH)));

        this.node_desc.active = false;
        this.btn_share.active = false;
        this.btn_put.active = false;

        this.node_card.active = false;
        this.node_coins.active = false;
        
        //初始化数据
        let catU = cc.dataMgr.userData.catData[cc.dataMgr.userData.showCatTake];
        if (catU && catU.backTake) {
            //临显示之前再随机一次，放置 两只猫带回的东西重复
            catU.backTake = cc.dataMgr.getOneBackTake_o(cc.dataMgr.userData.showCatTake);
            this._takeType = catU.backTake.type;
            this._takeDesc = catU.backTake.desc;

            console.log("-- 显示礼物 -- " + this._takeType + " -- " + this._takeDesc);

            //礼物展示 相关
            this.node_spr.active = true;
            for (let i = 0; i < this.node_spr.children.length; ++i)
                this.node_spr.children[i].active = (catU.backTake.type == this.node_spr.children[i].name);
            this.node_spr.x = -cc.dataMgr.canvasW / 2 - 240;
            this.node_spr.runAction(cc.sequence(cc.fadeIn(0.1), cc.jumpTo(0.6, cc.v2(0, 0), 150, 1), cc.delayTime(0.3), cc.callFunc(this.openBoxBegin, this), cc.fadeOut(0.1)));

            this.take_things.active = false;
            this.take_card.active = false;
            this.take_gold.active = false;

            //物品在放置的时候加入到玩家数据 卡片在本函数
            if (this._takeType == "card") {
                if (catU.haveCard.indexOf(this._takeDesc) < 0)
                    catU.haveCard.push(this._takeDesc);
            }
        } else
            this.hidePop();
        cc.audioMgr.playEffect("pop_catTake");
    }

    hidePop() {
        this.node.isWillHide = true; //为了 catOut 显示
        let gameJs = cc.find("Canvas").getComponent("Game");
        if (gameJs)
            gameJs.moveCatOut();

        this.node_mask.runAction(cc.sequence(cc.delayTime(0.2), this.myChangeHeightTo_act(0.4, this.node_mask.height, 0), cc.callFunc(this.scaleEnd, this)));
        this.take_things.runAction(cc.scaleTo(0.3, 0));
        this.take_card.runAction(cc.scaleTo(0.3, 0));
        this.take_gold.runAction(cc.scaleTo(0.3, 0));
        this.node_card.runAction(cc.scaleTo(0.3, 0));
        this.node_desc.runAction(cc.scaleTo(0.3, 0));
        this.btn_share.runAction(cc.scaleTo(0.3, 0));
        this.btn_put.runAction(cc.scaleTo(0.3, 0));

        this._takeDesc = null;
        this._takeType = null;
    }

    //打开箱子,展示礼物
    openBoxBegin() {
        this.node_spr.active = false;
        this.take_things.active = (this._takeType == "things");
        this.take_card.active = (this._takeType == "card");
        this.take_gold.active = (this._takeType == "coins");

        let takeN = null;
        let timeEnd = 0.1;
        if (this._takeType == "things") {
            takeN = this.take_things;
            takeN.getChildByName("ui_shine_bg").active = false;
            takeN.getChildByName("ui_shine_cross").active = false;
            timeEnd = 0.1;

            //初始化 物品 frame
            let gameJs = cc.find("Canvas").getComponent("Game");
            let frame = gameJs.getThingsFrame_sf(this._takeDesc);
            if (frame)
                this.take_things.getChildByName("spr_desc").getComponent(cc.Sprite).spriteFrame = frame;
        } else if (this._takeType == "card") {
            takeN = this.take_card;
            timeEnd = 0.6;
        } else {
            //这里是金币
            takeN = this.take_gold;
            timeEnd = 0.1
        }
        takeN.scale = 1;
        takeN.getChildByName("ui_shine").scale = 0.5;
        takeN.getChildByName("ui_shine").runAction(cc.sequence(cc.fadeIn(0.1), cc.scaleTo(0.4, 3), cc.delayTime(timeEnd), cc.callFunc(this.openBoxEnd, this), cc.fadeOut(0.4)));

        let spr_desc = takeN.getChildByName("spr_desc");
        if (spr_desc) {
            spr_desc.stopAllActions();
            spr_desc.scale = 0;
            spr_desc.runAction(cc.scaleTo(0.4, 1));
            spr_desc.position = cc.v2(0, 0)
            spr_desc.runAction(cc.repeatForever(cc.sequence(cc.moveBy(0.6, cc.v2(0, -12)), cc.moveBy(0.4, cc.v2(0, 12)))));
        }
    }

    //打开箱子结束,显示放置 和 描述
    openBoxEnd() {
        this.node_desc.active = true;
        this.btn_share.active = true;
        this.btn_put.active = true;

        this.node_desc.scale = 0;
        this.btn_share.scale = 0;
        this.btn_put.scale = 0;

        //显示按钮 介绍之类的东西
        let strDesc = "好大一波金币";
        if (this._takeType == "things") {
            this.take_things.getChildByName("ui_shine_bg").active = true;
            let spr_cross = this.take_things.getChildByName("ui_shine_cross");
            spr_cross.active = true;
            spr_cross.stopAllActions();
            spr_cross.runAction(cc.repeatForever(cc.rotateBy(1.2, 120)));

            this.btn_put.getChildByName("label").getComponent(cc.Label).string = "放置";
            strDesc = cc.dataMgr.gameData.thingsData[this._takeDesc];
            if (!strDesc)
                strDesc = "神秘的东西";

        } else if (this._takeType == "card") {
            this.take_card.active = false;
            strDesc = "不错的卡片";
            this.btn_put.getChildByName("label").getComponent(cc.Label).string = "酷";

            //初始化卡片 信息
            this.node_card.active = true;
            this.node_card.scale = 0;
            this.node_card.runAction(cc.scaleTo(0.4, 1));

            let catU = cc.dataMgr.userData.catData[cc.dataMgr.userData.showCatTake];
            if (catU) {
                let catD = cc.dataMgr.gameData.catData[catU.catType];
                this.spr_men.getComponent("NodeEffect").initEffect("catData", catU.catType, 0);
                this.lab_desc.getComponent(cc.Label).string = catD.desc;
                let haveCard = catU.haveCard;
                let node_card = this.node_card.getChildByName("node_card");
                for (let i = 0; i < node_card.children.length; ++i)
                    node_card.children[i].active = (haveCard.indexOf(i) < 0);
            }
        } else {
            this.btn_put.getChildByName("label").getComponent(cc.Label).string = "真棒";
            let gameJs = cc.find("Canvas").getComponent("Game");
            if (gameJs)
                gameJs.addWaveEffect(true, this._takeDesc);
        }


        this.node_coins.active = (cc.dataMgr.userData.leadStep == -1);
        this.btn_share.active = (cc.dataMgr.userData.leadStep == -1);
        if (this.node_coins.active) {
            this.node_coins.getChildByName("lab_coins").getComponent(cc.Label).string = cc.dataMgr.userData.coins;
            this.node_coins.getChildByName("lab_gems").getComponent(cc.Label).string = cc.dataMgr.userData.gems;
        }

        this.node_desc.runAction(cc.scaleTo(0.4, 1));
        this.btn_share.runAction(cc.scaleTo(0.4, 1));
        this.btn_put.runAction(cc.scaleTo(0.4, 1));

        this.node_desc.getChildByName("label").getComponent(cc.Label).string = strDesc;
    }

    scaleEnd() {
        this.node.active = false;
    }

    myChangeHeightTo_act(timeT, heightBegin, heightAim) {
        let action = cc.delayTime(timeT);
        action.heightBegin = heightBegin;
        action.heightAim = heightAim;
        action.update = function (dt) {
            let node = action.getTarget();
            if (node) {
                node.height = heightBegin + dt * (this.heightAim - this.heightBegin);
            }
        };
        return action;
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            let btnN = event.target.name;
            console.log("-- onClickBtn -- " + this.node.name + " -- " + btnN);
            if (btnN == "ui_close") {
                this.hidePop();
                //固定页面返回在这里处理
                cc.audioMgr.playEffect("pop_close");
            } else if (btnN == "btn_put") {
                cc.audioMgr.playEffect("btn_click");
                //这里需要处理 点击放置后的显示,包括数据更新
                let catU = cc.dataMgr.userData.catData[cc.dataMgr.userData.showCatTake];
                if (catU) {
                    catU.backTake = null;
                    catU.inOut = 0;
                    //在这里改变一下 小猫的所在房间。
                    if (this._takeType == "things") {
                        let roomIdx = -1;
                        for (let i = 0; i < cc.dataMgr.gameData.roomTotal.length; ++i) {
                            let roomN = cc.dataMgr.gameData.roomTotal[i];
                            if (this._takeDesc.indexOf(roomN) >= 0) {
                                roomIdx = i;
                                break;
                            }
                        }
                        if (roomIdx >= 0) {
                            let atRoomIdx = roomIdx;
                            let atCatArr = cc.dataMgr.getAtCat_arr(cc.dataMgr.userData.atRoomIdx);
                            if (atCatArr.length >= 4 && (cc.dataMgr.userData.atRoomIdx == 0 || cc.dataMgr.userData.atRoomIdx == 3))
                                atRoomIdx = 1;
                            catU.atRoomIdx = atRoomIdx;
                        }
                    }
                }

                cc.dataMgr.userData.showCatTake = null;
                let gameJs = cc.find("Canvas").getComponent("Game");
                if (gameJs) {
                    //如果是物品,要加到场景中
                    if (this._takeType == "things")
                        //显示放置 这个物品
                        gameJs.putOneThings(this._takeDesc);
                    else
                        gameJs.refreshCat();

                }
                this.hidePop();
            } else if (btnN == "btn_share") {
                shareQQ("reward");
                //奖励金币 10
                event.target.active = false;
            }
        }
    }
}