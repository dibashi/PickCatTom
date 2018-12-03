const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class NodeCat extends cc.Component {
    @property(cc.Node) //播放猫咪动画的节点
    spr_cat = null;

    @property(cc.Node) //猫咪需要的提示,如:抚摸、吃饭、洗澡
    node_need = null;

    _catKey = null; //猫咪的key
    _catType = null; //猫咪的类型
    _actType = null; //猫咪当前动画的状态

    _moveSpeed = 90; //猫咪的移动速度

    _beginX = 0; //猫咪的初始 X值

    onLoad() {

    }

    start() {

    }

    initCat(catKey) {
        console.log("-- 初始化小猫 --");
        this._catKey = catKey;
        this.node.active = true;

        let catU = cc.dataMgr.userData.catData[catKey];
        console.log(catU);
        this._catType = catU.catType;
        this._beginX = this.node.x;

        this.changeCatAct("random");

        /*替换骨骼尝试 未达到理想效果
        this._armatureDisplay = this.dragon.getComponent(dragonBones.ArmatureDisplay);
        this._armature = this._armatureDisplay.armature();
        console.log(this._armature);

        //只有这一种方法能换骨骼 其它的暂未找到方法
        let slot = this._armature.getSlot("Skin000_Stand2Paws_body");//获取一个 slot ,this._armature._slots 则是slot 的数组
        slot.childArmature = this._armatureDisplay.buildArmature("cat04");

        let slots = this._armature._slots;
        if (slots && slots.length > 0) {
            for (let i = 0; i < slots.length; ++i) {
                console.log(i + " -- " + slots[i].name);
            }
        }
        */
    }

    //刷新小猫状态
    refreshCat() {
        let catU = cc.dataMgr.userData.catData[this._catKey];
        let needStatus = "no";
        if (catU) {
            needStatus = catU.needStatus;
        }
        this.node_need.opacity = 0;
        for (let i = 0; i < this.node_need.children.length; ++i) {
            let nodeN = this.node_need.children[i];
            if (nodeN.name == needStatus) {
                nodeN.active = true;
                this.node_need.opacity = 255;
            } else
                nodeN.active = false;
        }

        //如果小猫什么都不需要,显示 btn_game 指引玩家去玩小游戏
        let showBtnGame = false;
        if (needStatus == "no" && cc.dataMgr.userData.leadStep < 0 && Math.random() < 0.5)
            showBtnGame = true;
        this.node.getChildByName("btn_game").active = showBtnGame;
    }

    //这只小猫外出
    catOut() {
        cc.audioMgr.playEffect("cat_call2");
        this.node.stopAllActions();
        this.changeCatAct("out");
        this.spr_cat.scaleX = Math.abs(this.spr_cat.scaleX);
        this.node.runAction(cc.sequence(cc.moveBy(3.6, cc.v2(cc.dataMgr.canvasW, 0)), cc.callFunc(this.hideCat, this)));
    }

    hideCat() {
        this.node.active = false;
    }

    //改变小猫播放的动画(eat、run、walk、stand)
    changeCatAct(type) {
        let catAnimationName = cc.dataMgr.catAnimation[this._catType];
        if (!catAnimationName)
            catAnimationName = "tom_";

        this._actType = type;
        console.log("-- NodeCat changeCatAct -- " + catAnimationName + " -- " + this._catType + "--" + type);

        if (type == "out") {
            this.spr_cat.getComponent(cc.Animation).play(catAnimationName + "run");
        } else if (type == "stand") {
            this.node.stopAllActions();
            this.callStand();
        } else {
            this.spr_cat.getComponent(cc.Animation).play(catAnimationName + "eat");
            this.refreshCat();

            this.callRandom();
        }
    }

    //随机状态开始
    callRandom() {
        console.log("-- callRandom --");
        this.node.stopAllActions();
        if (Math.random() > 0.8)
            this.callEat();
        else
            this.callWalk();
    }

    callStand() {
        let catAnimationName = cc.dataMgr.catAnimation[this._catType];
        if (!catAnimationName)
            catAnimationName = "tom_";
        this.spr_cat.getComponent(cc.Animation).play(catAnimationName + "stand");
    }

    callWalk() {
        let catAnimationName = cc.dataMgr.catAnimation[this._catType];
        if (!catAnimationName)
            catAnimationName = "tom_";
        this.spr_cat.getComponent(cc.Animation).play(catAnimationName + "walk");
        let aimMove = this._beginX + 80;
        if (this.node.x > this._beginX)
            aimMove = this._beginX - 80;
        let time = Math.abs(aimMove - this.node.x) / this._moveSpeed;

        //新手引导的时候,是不让🐱猫咪到处跑。
        if (cc.dataMgr.userData.leadStep >= 0) {
            aimMove = this._beginX;
            time = 5;
        }

        //自动结束后让小猫站到那,吃东西
        this.spr_cat.scaleX = (this.node.x > this._beginX ? -1 : 1) * Math.abs(this.spr_cat.scaleX);
        this.node.runAction(cc.sequence(cc.moveTo(time, cc.v2(aimMove, this.node.y)), cc.callFunc(this.callEat, this)));
    }

    callEat() {
        let catAnimationName = cc.dataMgr.catAnimation[this._catType];
        if (!catAnimationName)
            catAnimationName = "tom_";
        this.spr_cat.getComponent(cc.Animation).play(catAnimationName + "eat");
        //各段时间后 重新随机小猫状态
        this.node.runAction(cc.sequence(cc.delayTime(3 + Math.random() * 7), cc.callFunc(this.callRandom, this)));
    }

    onClickBtn(event, customeData) {
        if (event.target && !cc.dataMgr.userData.onTouchCat) {
            let btnN = event.target.name;
            console.log("-- onClickBtn -- " + this.node.name + " -- " + btnN);

            //如果这只小猫已经被派出 点击无效
            let catArr = cc.dataMgr.getOutCat_arr();
            if (catArr && catArr.indexOf(this._catKey) >= 0)
                return;

            if (btnN == "node_cat" || btnN == "node_need") {
                cc.audioMgr.playEffect("cat_call1");
                this.refreshCat();
                //没有和 小猫互动的才显示或隐藏菜单
                console.log("-- 点中猫咪 --" + cc.dataMgr.userData.onTouchCat);
                if (cc.dataMgr.userData.leadStep >= 0) {
                    if (cc.dataMgr.userData.leadStep == 0) {
                        cc.dataMgr.userData.leadStep = 1000;
                        cc.find("Canvas").getComponent("NodeLead").refreshLead();
                    } else if (cc.dataMgr.userData.leadStep == 10)
                        cc.find("Canvas").getComponent("NodeLead").refreshLead();
                    else if (cc.dataMgr.userData.leadStep == 11)
                        cc.find("Canvas").getComponent("NodeLead").changeToNextStep(11);
                    else if (cc.dataMgr.userData.leadStep == 14)
                        cc.find("Canvas").getComponent("NodeLead").changeToNextStep(14);
                    else if (cc.dataMgr.userData.leadStep == 16)
                        cc.find("Canvas").getComponent("NodeLead").changeToNextStep(16);
                    else if (cc.dataMgr.userData.leadStep == 24)
                        cc.find("Canvas").getComponent("NodeLead").changeToNextStep(24);
                    else if (cc.dataMgr.userData.leadStep == 26)
                        cc.find("Canvas").getComponent("NodeLead").changeToNextStep(26);
                    else if (cc.dataMgr.userData.leadStep == 27)
                        cc.find("Canvas").getComponent("NodeLead").changeToNextStep(27);
                    else if (cc.dataMgr.userData.leadStep == 28)
                        cc.find("Canvas").getComponent("NodeLead").changeToNextStep(28);
                    else if (cc.dataMgr.userData.leadStep == 29)
                        cc.find("Canvas").getComponent("NodeLead").changeToNextStep(29);
                    else if (!cc.dataMgr.userData.onTouchCat) {
                        //小猫被选中了
                        cc.dataMgr.userData.touchCatName = this._catKey;
                        let gameJs = cc.find("Canvas").getComponent("Game");
                        if (gameJs) {
                            this.changeCatAct("stand");
                            gameJs.showCatUI(this.node.x, this.node.y);
                            if (cc.dataMgr.userData.leadStep > 0)
                                cc.find("Canvas").getComponent("NodeLead").hidePoint();
                        }
                    }
                } else {
                    this.node.getChildByName("btn_game").active = false;
                    //小猫被选中了
                    cc.dataMgr.userData.touchCatName = this._catKey;
                    let gameJs = cc.find("Canvas").getComponent("Game");
                    if (gameJs) {
                        this.changeCatAct("stand");
                        gameJs.showCatUI(this.node.x, this.node.y + 70);
                    }
                }

                //设置猫咪层级
                let root_cat = cc.find("Canvas/root_cat");
                if (root_cat) {
                    let pop_catUI = root_cat.getChildByName("pop_catUI");
                    pop_catUI.position = cc.v2(this.node.x, this.node.y + 70);
                    pop_catUI.scale = 0.64;
                    pop_catUI.zIndex = 3000;
                }
            } else if (btnN == "btn_game") {
                //切到小游戏
                cc.dataMgr.userData.popType = "pop_game";
                let gameJs = cc.find("Canvas").getComponent("Game");
                if (gameJs)
                    gameJs.showPop();
                this.node.getChildByName("btn_game").active = false;
            }
        }
    }
}