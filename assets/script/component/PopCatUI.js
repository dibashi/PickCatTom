const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class PopCatUI extends cc.Component {
    /**
     * 猫咪的互动按钮界面
     */

    //this.node.isWillHide = true;//几乎是和 active 保持一致(为了cutOut的显示和隐藏)

    _touchType = null;

    onLoad() {

    }

    start() {

    }

    showPop() {
        this.node.active = true;
        this.node.isWillHide = false;
        this.node.zIndex = 3000;

        this.refreshCatUI();

        //放大显示
        if (this.node.name == "pop_catUI") {
            this.node.getChildByName("btn_find").scale = 0;
            this.node.getChildByName("node_cost").scale = 0;
            this.node.getChildByName("btn_desc").scale = 0;
            this.node.getChildByName("node_btn").scale = 0;

            this.node.getChildByName("btn_find").stopAllActions();
            this.node.getChildByName("node_cost").stopAllActions();
            this.node.getChildByName("btn_desc").stopAllActions();
            this.node.getChildByName("node_btn").stopAllActions();

            this.node.getChildByName("btn_find").runAction(cc.scaleTo(0.4, 1));
            this.node.getChildByName("node_cost").runAction(cc.scaleTo(0.4, 1));
            this.node.getChildByName("node_btn").runAction(cc.scaleTo(0.4, 1));
            if (cc.dataMgr.userData.leadStep < 0)
                this.node.getChildByName("btn_desc").runAction(cc.scaleTo(0.4, 1));

            if (cc.dataMgr.userData.leadStep == 1)
                cc.find("Canvas").getComponent("NodeLead").changeToNextStep(1);
            else if (cc.dataMgr.userData.leadStep == 4)
                cc.find("Canvas").getComponent("NodeLead").changeToNextStep(4);
            else if (cc.dataMgr.userData.leadStep == 8)
                cc.find("Canvas").getComponent("NodeLead").changeToNextStep(8);

            if (cc.dataMgr.userData.leadStep == 6 ||
                cc.dataMgr.userData.leadStep == 7 ||
                cc.dataMgr.userData.leadStep == 17 ||
                cc.dataMgr.userData.leadStep == 18 ||
                cc.dataMgr.userData.leadStep == 20)
                cc.find("Canvas").getComponent("NodeLead").hideTalk();

        } else {
            this.node.scale = 0;
            this.node.runAction(cc.scaleTo(0.4, 1));
        }
    }

    hidePop() {
        this.node.isWillHide = true; //为了 catOut 显示

        if (this.node.name == "pop_catUI") {
            this.node.runAction(cc.sequence(cc.delayTime(0.2), cc.callFunc(this.scaleEnd, this)));
            this.node.getChildByName("btn_find").runAction(cc.scaleTo(0.4, 0));
            this.node.getChildByName("node_cost").runAction(cc.scaleTo(0.4, 0));
            this.node.getChildByName("btn_desc").runAction(cc.scaleTo(0.4, 0));
            this.node.getChildByName("node_btn").runAction(cc.scaleTo(0.4, 0));
        } else
            this.node.runAction(cc.sequence(cc.scaleTo(0.2, 0), cc.callFunc(this.scaleEnd, this)));
        cc.dataMgr.userData.onTouchCat = null;
    }

    scaleEnd() {
        this.node.active = false;
    }

    //显示按钮 
    showBtn(type) {
        let node_btn = this.node.getChildByName("node_btn");
        for (let i = 0; i < node_btn.children.length; ++i) {
            let nodeN = node_btn.children[i];
            if (type == nodeN.name || type == "all")
                nodeN.active = true;
            else
                nodeN.active = false;
        }
    }

    //pop_catUI 的刷新函数
    refreshCatUI() {
        //小猫的名称等 需要的操作
        cc.dataMgr.userData.onTouchCat = null; //这里是在和小猫互动
        let cost = cc.dataMgr.getCostCoins_i();
        console.log("-- popCatUI 小猫外出花费金币 --" + cost);
        this.node.getChildByName("btn_find").active = (cost != -1);

        this.node.getChildByName("node_cost").active = (cost > 0);
        this.node.getChildByName("node_cost").runAction(cc.scaleTo(0.4, 1));

        if (cost > 0)
            this.node.getChildByName("node_cost").getChildByName("lab_num").getComponent(cc.Label).string = cost;

        let catU = cc.dataMgr.userData.catData[cc.dataMgr.userData.touchCatName];
        if (catU && catU.name) {
            this.node.getChildByName("btn_desc").getChildByName("lab_name").getComponent(cc.Label).string = catU.name;

            //上边如果花费金币为 -1 也不显示
            if (this.node.getChildByName("btn_find").active)
                this.node.getChildByName("btn_find").active = (catU.needStatus == "no");
            //如果显示花费金币 保证他两个一致
            if (this.node.getChildByName("node_cost").active)
                this.node.getChildByName("node_cost").active = this.node.getChildByName("btn_find").active;

            if (cc.dataMgr.userData.leadStep >= 0) {
                //cc.dataMgr.userData.leadStep =9 时是不显示 抚摸按钮的
                if (catU.needStatus != "no" && cc.dataMgr.userData.leadStep >= 10) {
                    this.node.getChildByName("node_btn").stopAllActions();
                    this.node.getChildByName("node_btn").scale = 1;
                    this.showBtn(catU.needStatus);
                } else
                    this.showBtn(null);
            } else
                this.showBtn("all");
        }
    }

    //开始 触摸 喂鱼 洗澡等
    beginTouch(type) {
        this._touchType = type;
        cc.dataMgr.userData.onTouchCat = this._touchType;

        this.node.getChildByName("btn_find").active = false;
        this.node.getChildByName("node_cost").active = false;
        this.node.getChildByName("btn_desc").active = false;
        this.node.getChildByName("node_btn").active = false;

        let node_touch = cc.find("Canvas/node_effect/node_" + this._touchType);
        if (node_touch) {
            node_touch.active = true;
            for (let i = 0; i < node_touch.children.length; ++i) {
                let nodeN = node_touch.children[i];
                nodeN.active = true;
                nodeN.x = 0;
                nodeN.y = 0;
            }
        }

        this.node.stopAllActions();
        this.node.runAction(cc.sequence(cc.delayTime(4), cc.callFunc(this.endTouch, this)));

        if (type != "eat") {
            cc.audioMgr.playEffect("cat_touch");
        }
    }

    //互动结束了
    endTouch() {
        this.node.getChildByName("btn_find").active = true;
        this.node.getChildByName("node_cost").active = true;
        this.node.getChildByName("btn_desc").active = true;
        this.node.getChildByName("node_btn").active = true;

        this.showPop();

        let node_touch = cc.find("Canvas/node_effect/node_" + this._touchType);
        if (node_touch)
            node_touch.active = false;
        this.scheduleOnce(this.callTouchOver, 0.1);
    }

    callTouchOver() {
        cc.dataMgr.userData.onTouchCat = null;
        this._touchType = null;
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");

            if (cc.dataMgr.userData.leadStep > 0)
                cc.find("Canvas").getComponent("NodeLead").hidePoint();

            let btnN = event.target.name;
            console.log("-- onClickBtn -- " + this.node.name + " -- " + btnN + "-- cat:" + cc.dataMgr.userData.touchCatName);
            if (btnN == "ui_close" || btnN == "btn_bg") {
                this.hidePop();
                //固定页面返回在这里处理
                let gameJs = cc.find("Canvas").getComponent("Game");
                if (gameJs)
                    gameJs.moveCatOut();
                cc.audioMgr.playEffect("pop_close");
            } else if (this.node.name == "pop_catUI") {
                let gameJs = cc.find("Canvas").getComponent("Game");
                if (gameJs) {
                    cc.audioMgr.playEffect("btn_click");
                    if (btnN == "btn_find") {
                        //让小猫出去找东西
                        if (cc.dataMgr.userData.leadStep == 18)
                            cc.find("Canvas").getComponent("NodeLead").changeToNextStep(18);
                        if (cc.dataMgr.userData.leadStep == 21) {
                            cc.dataMgr.userData.leadStep = 22;
                            cc.find("Canvas").getComponent("NodeLead").refreshLead();
                        }

                        //小猫出去觅食了
                        let isOut = cc.dataMgr.oneCatOut_b(cc.dataMgr.userData.touchCatName);
                        if (isOut)
                            gameJs.oneCatOut(cc.dataMgr.userData.touchCatName);
                    } else if (btnN == "btn_desc") {
                        //弹出小猫的个人属性界面
                        cc.dataMgr.userData.popType = "pop_catData";
                        gameJs.showPop();
                    } else if (btnN == "touch" || btnN == "eat" || btnN == "shower") {
                        if (cc.dataMgr.userData.leadStep == 10)
                            cc.find("Canvas").getComponent("NodeLead").refreshLead();
                        else {
                            this.beginTouch(btnN);
                            let catU = cc.dataMgr.userData.catData[cc.dataMgr.userData.touchCatName];
                            if (catU && catU.needStatus == btnN) {
                                catU.needStatus = "no";
                                gameJs.refreshCatStatus();
                            }
                        }
                    }
                }
            }
        }
    }
}