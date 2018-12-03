const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class PopCatData extends cc.Component {

    /**
     * 猫咪信息界面
     */

    @property(cc.Node) //卡片遮挡
    node_card = null;
    @property(cc.Node)
    spr_men = null;
    @property(cc.Node)
    lab_desc = null;

    @property(cc.Node) //名称相关
    dragon = null;
    @property(cc.Node)
    editBox = null;
    @property(cc.Node)
    lab_name = null;

    //this.node.isWillHide = true;//几乎是和 active 保持一致(为了cutOut的显示和隐藏)

    onLoad() {

    }

    start() {
        this.editBox.active = false;
    }

    showPop() {
        cc.audioMgr.playEffect("pop_open");
        this.node.isWillHide = false;
        //放大显示
        this.node.active = true;
        this.node.scale = 0;
        this.node.runAction(cc.scaleTo(0.4, 1));

        //初始化控件
        let catU = cc.dataMgr.userData.catData[cc.dataMgr.userData.touchCatName];
        if (catU) {
            let catD = cc.dataMgr.gameData.catData[catU.catType];

            let catAnimationName = cc.dataMgr.catAnimation[catU.catType];
            if (!catAnimationName)
                catAnimationName = "tom_";
            this.dragon.getComponent(cc.Animation).play(catAnimationName + "stand");
            //this.dragon.getComponent("NodeDragon").initDragon(catU.catType, "cat08", 0);

            this.spr_men.getComponent("NodeEffect").initEffect("catData", catU.catType, 0);

            this.lab_desc.getComponent(cc.Label).string = catD.desc;
            this.lab_name.getComponent(cc.Label).string = catU.name;
            let haveCard = catU.haveCard;
            for (let i = 0; i < this.node_card.children.length; ++i)
                this.node_card.children[i].active = (haveCard.indexOf(i) < 0);
        }
    }

    hidePop() {
        this.node.isWillHide = true; //为了 catOut 显示
        this.node.runAction(cc.sequence(cc.scaleTo(0.2, 0), cc.callFunc(this.scaleEnd, this)));
    }

    scaleEnd() {
        this.node.active = false;
    }

    onChangeEditBox() {
        console.log("--- onChangeEditBox ---");
        let editStr = this.editBox.getComponent(cc.EditBox).string;
        if (editStr) {
            let catU = cc.dataMgr.userData.catData[cc.dataMgr.userData.touchCatName];
            if (catU) {
                catU.name = editStr;
                this.editBox.active = false;
                this.lab_name.active = true;
                this.lab_name.getComponent(cc.Label).string = editStr;
            }
        } else {
            this.editBox.active = false;
            this.lab_name.active = true;
        }
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            let btnN = event.target.name;
            cc.audioMgr.playEffect("btn_click");
            console.log("-- onClickBtn -- " + this.node.name + " -- " + btnN);
            if (btnN == "ui_close" || btnN == "btn_bg") {
                this.hidePop();
                //固定页面返回在这里处理
                let gameJs = cc.find("Canvas").getComponent("Game");
                if (gameJs)
                    gameJs.moveCatOut();

                let nodeCatUI = cc.find("Canvas/root_cat/pop_catUI");
                if (nodeCatUI && nodeCatUI.active)
                    nodeCatUI.getComponent("PopCatUI").refreshCatUI();
                else
                    cc.dataMgr.userData.touchCatName = null;
            } else if (btnN == "btn_home") {
                cc.dataMgr.userData.popType = null;
                let gameJs = cc.find("Canvas").getComponent("Game");
                if (gameJs)
                    gameJs.showPop();
            } else if (btnN == "btn_edit") {
                if (this.editBox.active) {
                    this.onChangeEditBox();
                } else {
                    this.editBox.getComponent(cc.EditBox).string = "";
                    this.editBox.active = true;
                    this.lab_name.active = false;
                }
            }
        }
    }
}