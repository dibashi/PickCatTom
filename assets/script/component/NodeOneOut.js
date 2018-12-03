const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class NodeOneOut extends cc.Component {
    @property(cc.SpriteFrame)
    frame_roll = [];

    @property(cc.Node) //小猫出去
    node_out = null;
    @property(cc.Node)//滚动的两个背景
    spr_bg1 = null;
    @property(cc.Node)
    spr_bg2 = null;
    @property(cc.Node) //时间倒计时
    lab_time = null;
    @property(cc.Node) //召回小猫按钮
    ui_btn_green = null;
    @property(cc.Node) //小猫行走动画
    spr_cat = null;

    @property(cc.Node) //小猫返回
    node_back = null;
    @property(cc.Node)
    ani_cat = null;

    // out 和 back 弹出时的目标X值
    _baseOutX = -195;
    _baseBackX = -140;

    _catKey = null;//猫咪的 key
    _isTake = false; //保证领取按钮只能点一次

    _isCallBack = false; //保证只召回一次

    onLoad() {

    }

    start() {

    }

    //一只小猫外出
    initOneOut(catKey) {
        console.log("-- oneOut initOneOut --" + catKey);

        this.node_back.x = 0;
        this.node_out.x = 0;
        this.node_back.active = true;
        this.node_out.active = true;

        this.node_out.getChildByName("btn_ad").active = (cc.dataMgr.userData.leadStep < 0);

        let catU = cc.dataMgr.userData.catData[catKey];
        if (catU) {
            if (!this._catKey) {
                this._catKey = catKey;
                //判断小猫现在是在外面, 还是已经带着礼物返回了
                if (catU.outTime + catU.outBack > cc.dataMgr.getTimeSecond_i()) {
                    //倒计时
                    let backTime = catU.outTime + catU.outBack - cc.dataMgr.getTimeSecond_i();
                    let repeat = cc.repeat(cc.sequence(cc.delayTime(1), cc.callFunc(this.callChangeTime, this)), backTime + 1);
                    this.lab_time.stopAllActions();
                    this.lab_time.runAction(cc.sequence(repeat, cc.callFunc(this.callCatBack, this)));
                    this.callChangeTime();
                    //顶部召回按钮
                    this.node_out.stopAllActions();
                    this.node_out.runAction(cc.sequence(cc.show(), cc.moveTo(0.4, cc.v2(this._baseOutX, 0))));
                    this.ui_btn_green.active = true;
                    this.ui_btn_green.stopAllActions();
                    this.ui_btn_green.runAction(cc.repeatForever(cc.sequence(cc.moveTo(0.6, cc.v2(this.ui_btn_green.x, 100)), cc.moveTo(0.4, cc.v2(this.ui_btn_green.x, 110)))));
                    //改变顶部按钮的文字显示
                    if (cc.dataMgr.userData.leadStep >= 0) {
                        if (cc.dataMgr.userData.leadStep == 21 || cc.dataMgr.userData.leadStep == 22 || cc.dataMgr.userData.leadStep == 23) {
                            this.ui_btn_green.getChildByName("lab_num").getComponent(cc.Label).string = "免费";
                            this.ui_btn_green.active = true;
                        } else
                            this.ui_btn_green.active = false;
                    } else
                        this.ui_btn_green.getChildByName("lab_num").getComponent(cc.Label).string = "300";

                    //小猫动画播放 让小猫执行走动动画 让场景滚动
                    this.spr_cat.getComponent("NodeEffect").initEffect("catOut", catU.catType, 0);

                    let catAnimationName = cc.dataMgr.catAnimation[catU.catType];
                    if (!catAnimationName)
                        catAnimationName = "tom_";
                    this.ani_cat.getComponent(cc.Animation).play(catAnimationName + "stand");

                    //随机滚动背景
                    let idx = Math.floor(Math.random() * this.frame_roll.length);
                    this.spr_bg1.getComponent(cc.Sprite).spriteFrame = this.frame_roll[idx];
                    this.spr_bg2.getComponent(cc.Sprite).spriteFrame = this.frame_roll[idx];
                } else if (catU.inOut == 2 || catU.outTime + catU.outBack <= cc.dataMgr.getTimeSecond_i()) {
                    this.callCatBack();
                    //播放小猫站立动画
                    let catAnimationName = cc.dataMgr.catAnimation[catU.catType];
                    if (!catAnimationName)
                        catAnimationName = "tom_";
                    this.ani_cat.getComponent(cc.Animation).play(catAnimationName + "stand");
                } else {
                    //都不是的话,隐藏这个控件
                    this.toDie();
                }

            }
        } else
            this.toDie();
    }

    //这里是小猫回来
    callCatBack() {
        if (!this._isCallBack) {
            this._isCallBack = true;
            console.log("-- NodeOneOut callCatBack --" + this._catKey);
            this.node_out.stopAllActions();
            this.node_out.runAction(cc.sequence(cc.show(), cc.moveTo(0.4, cc.v2(0, 0)), cc.hide()));
            this.node_back.stopAllActions();
            this.node_back.runAction(cc.sequence(cc.delayTime(0.4), cc.moveTo(0.4, cc.v2(this._baseBackX, 0))));

            //显示手指
            if (cc.dataMgr.userData.leadStep == 2)
                cc.find("Canvas").getComponent("NodeLead").changeToNextStep(2);
        }
    }

    //改变时间显示
    callChangeTime() {
        let catU = cc.dataMgr.userData.catData[this._catKey];
        if (catU) {
            let backTime = catU.outTime + catU.outBack - cc.dataMgr.getTimeSecond_i();
            if (backTime <= 0) {
                backTime = 0;
                this.lab_time.stopAllActions();
                this.callCatBack();
            }
            this.lab_time.getComponent(cc.Label).string = backTime;
        }
    }

    //领取这只猫的礼物
    callTakeGift() {
        //隐藏手指
        if (cc.dataMgr.userData.leadStep == 3)
            cc.find("Canvas").getComponent("NodeLead").hidePoint();

        let gameJs = cc.find("Canvas").getComponent("Game");
        if (gameJs) {
            if (this._catKey)
                cc.dataMgr.userData.showCatTake = this._catKey;
            gameJs.showCatTake();
        }
        this.toDie();
    }

    //隐藏当前控件
    toDie() {
        this._catKey = null;
        this._isTake = false;
        this._isCallBack = false;

        this.node.catKey = null;
        this.node.active = false;
        this.node.stopAllActions();
        //this.node.runAction(cc.sequence(cc.removeSelf(true), cc.callFunc(this.callDestory, this)));
    }

    callDestory() {
        if (cc.isValid(this.node)) {
            //this.node.destroy();
        }
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            let btnN = event.target.name;
            cc.audioMgr.playEffect("btn_click");
            console.log("-- onClickBtn NodeOneOut -- " + btnN + " -- " + this._catKey + " -- " + cc.dataMgr.userData.showCatTake + " -- " + cc.dataMgr.userData.popType);
            if (btnN == "btn_backCat") {
                //召回小猫(新手引导的时候召回是不扣金币的)
                if (cc.dataMgr.userData.coins >= 300 || cc.dataMgr.userData.leadStep > 0) {
                    let catU = cc.dataMgr.userData.catData[this._catKey];
                    if (catU) {
                        if (catU.outTime + catU.outBack > cc.dataMgr.getTimeSecond_i()) {
                            if (cc.dataMgr.userData.leadStep < 0)
                                cc.dataMgr.changeCoins_b(-300);
                            catU.outBack = 0;
                            this.callCatBack();
                        }
                    }
                } else {
                    //金币不足显示商店弹窗
                    cc.dataMgr.userData.popType = "pop_store";
                    let gameJs = cc.find("Canvas").getComponent("Game");
                    if (gameJs)
                        gameJs.showPop();
                }
            } else if (btnN == "node_back" && !this._isTake) {
                //当前没有在显示 小猫获得的物品(一次只能显示一个)
                if (cc.dataMgr.userData.leadStep >= 0)
                    cc.find("Canvas").getComponent("NodeLead").hideTalk();
                if (!cc.dataMgr.userData.showCatTake && cc.dataMgr.userData.popType != "pop_catTake") {
                    //获取礼物
                    let catU = cc.dataMgr.userData.catData[this._catKey];
                    console.log(catU);
                    if (catU && catU.outTime + catU.outBack <= cc.dataMgr.getTimeSecond_i()) {
                        this._isTake = true;
                        cc.dataMgr.userData.showCatTake = this._catKey;
                        this._catKey = null;
                        this.node_back.stopAllActions();
                        this.node_back.runAction(cc.sequence(cc.moveTo(0.4, cc.v2(0, 0)), cc.callFunc(this.callTakeGift, this)));
                    }
                }
            } else if (btnN == "btn_ad") {
                //播放广告
                toolsQQ.cutTimeCatKey = this._catKey;
                playQQAdVideo("adSpeed");
            }
        }

        //隐藏手指
        if (cc.dataMgr.userData.leadStep > 0)
            cc.find("Canvas").getComponent("NodeLead").hidePoint();
    }
}