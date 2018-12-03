const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class PopNewCat extends cc.Component {
    /**
     * 购买一只新猫咪
     */

    @property(cc.Node) //裁剪显示的
    node_mask = null;

    @property(cc.Node) //用于跳跃的小猫
    node_cat = null;

    @property(cc.Node)
    box_open = null;
    @property(cc.Node)
    box_close = null;

    @property(cc.Node)
    btn_buy = null;
    @property(cc.Node)
    btn_close = null;
    @property(cc.Node)
    btn_put = null;

    //this.node.isWillHide = true;//几乎是和 active 保持一致(为了cutOut的显示和隐藏)

    _catKey = null; //小猫的catKey 唯一不重复
    _catType = null; //小猫的 type (决定图片等信息)
    _catPrice = -1;
    _catName = "丢失";

    _buyCatKey = null; //已经买到的 CatKey
    onLoad() {

    }

    start() {

    }

    //开始显示礼物之路
    showPop() {
        this.node.isWillHide = false;
        this.node.active = true;

        this.node_mask.height = 20;
        this.node_mask.runAction(this.myChangeHeightTo_act(0.3, 20, 480));

        cc.audioMgr.playEffect("pop_catTake");

        //找到一只没有购买的小猫
        let catAll = cc.dataMgr.gameData.catTotal;
        let catHave = cc.dataMgr.userData.haveCat;
        if (catAll && catHave) {
            //找到一个 catKey 
            for (let i = 0; i < catAll.length; ++i) {
                let catKey = catAll[i];
                if (catHave.indexOf(catKey) < 0) {
                    this._catKey = catKey;
                    break;
                }
            }
            //随机 catType 优先找没有的
            for (let i = 0; i < cc.dataMgr.gameData.catType.length; ++i) {
                let notHave = true;
                let catType = cc.dataMgr.gameData.catType[i];
                for (let obj in cc.dataMgr.userData.catData) {
                    if (cc.dataMgr.userData.catData.hasOwnProperty(obj)) {
                        let oneCatU = cc.dataMgr.userData.catData[obj];
                        if (oneCatU && oneCatU.catType && catType == oneCatU.catType)
                            notHave = false;
                    }
                }
                if (notHave) {
                    this._catType = catType;
                    break;
                }
            }
            if (!this._catType) {
                let idx = Math.floor(Math.random() * cc.dataMgr.gameData.catType.length);
                this._catType = cc.dataMgr.gameData.catType[idx];
            }

            let catD = cc.dataMgr.gameData.catData[this._catType];
            if (catD) {
                this._catName = catD.name;
            }
            this._catPrice = cc.dataMgr.gameData.buyCat[catHave.length];
        }
        console.log("-- newCat 要购买 -- " + this._catKey + "--" + this._catType + "--" + this._catName + "--" + this._catPrice);

        this.box_close.active = true;
        this.btn_buy.active = true;
        this.btn_close.active = true;

        this.box_open.active = false;
        this.node_cat.active = false;
        this.btn_put.active = false;

        this.box_close.scale = 0;
        this.btn_buy.scale = 0;
        this.btn_close.scale = 0;

        this.box_close.runAction(cc.scaleTo(0.4, 1));
        this.btn_close.runAction(cc.scaleTo(0.4, 1));

        if (this._catKey && this._catName) {
            this.btn_buy.runAction(cc.scaleTo(0.4, 1));

            if (this._catPrice > 0) {
                this.btn_buy.getChildByName("spr_ad").active = false;
                this.btn_buy.getChildByName("spr_gems").active = true;
                this.btn_buy.getChildByName("label").getComponent(cc.Label).string = this._catPrice;
            } else {
                this.btn_buy.getChildByName("spr_ad").active = true;
                this.btn_buy.getChildByName("spr_gems").active = false;
                this.btn_buy.getChildByName("label").getComponent(cc.Label).string = "立即领养";
                this.btn_close.active = false;
            }
        }
    }

    hidePop() {
        this.node.isWillHide = true; //为了 catOut 显示

        this._catKey = null;
        this._catType = null;
        this._catName = "未知";
        this._catPrice = -1;

        this.box_close.runAction(cc.scaleTo(0.4, 0));
        this.btn_close.runAction(cc.scaleTo(0.4, 0));
        this.btn_buy.runAction(cc.scaleTo(0.4, 0));
        this.btn_put.runAction(cc.scaleTo(0.4, 0));
        this.node_cat.runAction(cc.scaleTo(0.4, 0));

        this.node_mask.runAction(cc.sequence(cc.delayTime(0.2), this.myChangeHeightTo_act(0.4, this.node_mask.height, 0), cc.callFunc(this.scaleEnd, this)));
    }

    refreshCatName(name) {
        console.log("-- PopNewCat refreshCatName -- " + name);
        this.btn_put.active = true;
        this.btn_put.runAction(cc.scaleTo(0.4, 1));
        this._catName = name;
        this.btn_put.getChildByName("lab_name").getComponent(cc.Label).string = this._catName;
    }

    scaleEnd() {
        this.node.active = false;

        if (cc.dataMgr.userData.leadStep == 15 && cc.dataMgr.userData.haveCat.length == 2)
            cc.find("Canvas").getComponent("NodeLead").changeToNextStep(15);
    }


    buyOneCat() {
        this.box_close.active = false;
        this.btn_buy.active = false;
        this.btn_close.active = false;

        this.box_open.active = true;
        this.node_cat.active = true;
        this.btn_put.active = true;

        this.node_cat.scale = 0;
        this.btn_put.scale = 0;

        let catAnimationName = cc.dataMgr.catAnimation[this._catType];
        if (!catAnimationName)
            catAnimationName = "tom_";
        this.node_cat.getComponent(cc.Animation).play(catAnimationName + "stand");
        //this.node_cat.getComponent("NodeDragon").initDragon(this._catType, "cat08", 0);

        this.node_cat.y = 23;
        this.node_cat.runAction(cc.scaleTo(0.2, 1.6));
        this.node_cat.runAction(cc.sequence(cc.moveBy(0.2, cc.v2(0, 30)), cc.moveBy(0.2, cc.v2(0, -90))));

        this.node_mask.runAction(cc.sequence(this.myChangeHeightTo_act(0.3, 480, cc.dataMgr.canvasH), cc.callFunc(this.buyEnd, this)));

        this._buyCatKey = this._catKey;
        this._catKey = null;
    }

    buyEnd() {
        this.box_open.active = false;
        this.btn_put.active = false;
        this.btn_put.getChildByName("lab_name").getComponent(cc.Label).string = this._catName;

        let pop_name = cc.find("Canvas/pop_name");
        if (pop_name) {
            pop_name.getComponent("PopBook").showPop();
        }
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
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            console.log("-- onClickBtn -- " + this.node.name + " -- " + btnN);
            if (btnN == "btn_close" && !this.btn_put.active) {
                this.hidePop();
                //固定页面返回在这里处理
                let gameJs = cc.find("Canvas").getComponent("Game");
                if (gameJs)
                    gameJs.moveCatOut();
            } else if (btnN == "btn_buy") {
                if (this._catKey && !this.btn_put.active) {
                    let isBuy = true;
                    if (this._catPrice > 0) {
                        if (cc.dataMgr.userData.gems >= this._catPrice) {
                            cc.dataMgr.changeGems_b(-this._catPrice);
                            cc.dataMgr.addOneCat(this._catKey, this._catName, this._catType);
                            this.buyOneCat();
                        } else
                            isBuy = false;
                    } else {
                        //这里播放广告 的免费的猫咪 catPrice <= 0;
                        toolsQQ.freeCatKey = this._catKey;
                        toolsQQ.freeCatName = this._catName;
                        toolsQQ.freeCatType = this._catType;
                        playQQAdVideo("freeCat");
                    }

                    if (cc.dataMgr.userData.leadStep == -1 && !isBuy) {
                        cc.dataMgr.userData.popType = "pop_dog";
                        let gameJs = cc.find("Canvas").getComponent("Game");
                        if (gameJs)
                            gameJs.showPop();
                    }
                }
            } else if (btnN == "btn_put") {
                this.hidePop();
                let gameJs = cc.find("Canvas").getComponent("Game")
                if (gameJs) {
                    gameJs.refreshCat();
                    if (this._buyCatKey)
                        gameJs.moveToCatPos(this._buyCatKey);
                    gameJs.moveCatOut();
                }
            }
        }
    }
}