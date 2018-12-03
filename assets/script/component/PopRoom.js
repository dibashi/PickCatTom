const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class PopRoom extends cc.Component {

    @property(cc.Node)
    node_top = null;

    @property(cc.Node)//翻页
    pageView = null;
    @property(cc.Node)
    node_content = null;

    @property(cc.Node)//保险箱
    node_box = null;
    @property(cc.Node)//当前房间猫的数目
    node_cat = null;
    @property(cc.Node)//当前已收集数么
    node_things = null;

    @property(cc.Node)//选择界面
    node_select = null;
    @property(cc.Node)//选择的是那个房间
    toggle = null;

    @property(cc.Node)
    btn_go = null;
    @property(cc.Node)
    btn_build = null;

    _selectIdx = null;

    //this.node.isWillHide = true;//几乎是和 active 保持一致(为了cutOut的显示和隐藏)

    onLoad() {

    }

    start() {

    }

    showPop() {
        cc.audioMgr.playEffect("pop_open");
        this.node.isWillHide = false;
        //确定当前再那个场景
        this._selectIdx = cc.dataMgr.userData.atRoomIdx;
        console.log("-- showPop -- " + cc.dataMgr.userData.atRoomIdx);

        //放大显示
        this.node.active = true;
        this.node.scale = 0;
        this.node.runAction(cc.scaleTo(0.4, 1));
        this.scheduleOnce(function () {
            this.refreshRoom(this._selectIdx);
        }, 0.2);
    }

    hidePop() {
        this.node.isWillHide = true;
        this.node.runAction(cc.sequence(cc.scaleTo(0.2, 0), cc.callFunc(this.scaleEnd, this)));
    }

    scaleEnd() {
        this.node.active = false;
    }

    refreshRoom(roomIdx) {
        console.log("-- refreshRoom --" + roomIdx);
        this._selectIdx = roomIdx;
        //矫正 _selectIdx 的值
        let pageNum = this.node_content.children.length;
        if (this._selectIdx >= pageNum)
            this._selectIdx = pageNum - 1;
        else if (this._selectIdx < 0)
            this._selectIdx = 0;
        this.pageView.getComponent(cc.PageView).scrollToPage(this._selectIdx, 0.2);
        //小猫滑动层
        for (let i = 0; i < this.node_content.children.length; ++i) {
            let nodeN = this.node_content.children[i];
            let isHave = false;
            if (i < cc.dataMgr.userData.roomData.length) {
                let roomU = cc.dataMgr.userData.roomData[i];
                isHave = roomU.isHave;
            }
            nodeN.getChildByName("room").active = isHave;
        }

        //获得相应数据
        let roomD = cc.dataMgr.gameData.roomData[this._selectIdx];
        let roomU = cc.dataMgr.userData.roomData[this._selectIdx];
        let isHave = roomU.isHave;

        this.node_top.getChildByName("lab_room").getComponent(cc.Label).string = roomD.desc;
        for (let i = 0; i < this.node_box.children.length; ++i) {
            let nodeN = this.node_box.children[i];
            nodeN.active = (i < roomD.boxNum);
            nodeN.getChildByName("box").active = (i < roomU.openedBox.length);
        }

        let thingsStr = "";
        let pageN = this.node_content.children[this._selectIdx];
        pageN.getChildByName("room").active = isHave;
        if (isHave) {
            this.node_cat.active = true;
            this.node_things.active = true;
            this.node_things.x = 140;
            this.btn_build.active = false;
            this.btn_go.active = true;
            this.node_top.getChildByName("spr_huizhang").active = true;
            this.node_top.getChildByName("spr_lock").active = false;
            this.node_things.getChildByName("spr_huizhang").active = true;

            if (roomU.haveThingsNum > roomD.thingsNum)
                roomU.haveThingsNum = roomD.thingsNum;
            thingsStr = roomU.haveThingsNum + "/" + roomD.thingsNum;
            //猫咪数量 
            let atCatArr = cc.dataMgr.getAtCat_arr(this._selectIdx);
            this.node_cat.getChildByName("lab_num").getComponent(cc.Label).string = atCatArr.length;
        }
        else {
            this.node_cat.active = false;
            this.node_things.active = true;
            this.node_things.x = 0;
            this.btn_build.active = true;
            this.btn_go.active = false;
            this.node_top.getChildByName("spr_huizhang").active = false;
            this.node_top.getChildByName("spr_lock").active = true;
            this.node_things.getChildByName("spr_huizhang").active = false;

            thingsStr = roomD.thingsNum;

            //最后一个是敬请期待
            if (roomD.name == "miss") {
                this.btn_build.getChildByName("ui_coin").active = false;
                this.btn_build.getChildByName("lab_num").getComponent(cc.Label).string = "敬请期待";

            }
            else {
                this.btn_build.getChildByName("ui_coin").active = true;
                this.btn_build.getChildByName("lab_num").getComponent(cc.Label).string = ("修建房间" + roomD.price);
            }
        }
        //数目还初始化。
        this.node_things.getChildByName("lab_num").getComponent(cc.Label).string = thingsStr;
    }

    // 监听 翻页事件
    onPageEvent(sender, eventType) {
        if (eventType !== cc.PageView.EventType.PAGE_TURNING) {
            return;
        }
        let pageIdx = sender.getCurrentPageIndex();
        this.refreshRoom(pageIdx);
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            console.log("-- onClickBtn NodeRoom --" + btnN);
            if (btnN == "ui_close" || btnN == "btn_bg") {
                this.hidePop();
                let gameJs = cc.find("Canvas").getComponent("Game");
                if (gameJs)
                    gameJs.moveCatOut();
            }
            else if (btnN == "btn_select") {
                if (this.node_select.active) {
                    this.node_select.active = false;
                }
                else {
                    this.node_select.active = true;
                    for (let i = 0; i < this.toggle.children.length; ++i) {
                        let nodeN = this.toggle.children[i];
                        if (nodeN && nodeN.getComponent(cc.Toggle)) {
                            nodeN.getComponent(cc.Toggle).isChecked = (this._selectIdx == i);
                        }
                    }
                }
            }
            else if (btnN == "select") {
                //选择了
                if (typeof (parseInt(customeData)) == "number") {
                    this.refreshRoom(parseInt(customeData));
                    this.node_select.active = false;
                }
            }
            else if (btnN == "btn_left") {
                this.refreshRoom(this._selectIdx - 1);
            }
            else if (btnN == "btn_right") {
                this.refreshRoom(this._selectIdx + 1);
            }
            else if (btnN == "btn_go") {
                console.log("-- 换房间 --" + this._selectIdx);
                //切换房间了(有的房间才可以切换)
                let isHave = false;
                if (this._selectIdx < cc.dataMgr.userData.roomData.length) {
                    let roomU = cc.dataMgr.userData.roomData[this._selectIdx];
                    isHave = roomU.isHave;
                }
                if (isHave) {
                    cc.dataMgr.userData.atRoomIdx = this._selectIdx;
                    let gameJs = cc.find("Canvas").getComponent("Game");
                    if (gameJs)
                        gameJs.chageAction_i();
                    this.node.active = false;
                }
            }
            else if (btnN == "btn_build") {
                if (this._selectIdx < cc.dataMgr.gameData.roomData.length) {
                    let roomD = cc.dataMgr.gameData.roomData[this._selectIdx];
                    if (roomD.name != "miss") {
                        console.log("-- 可以买 --" + roomD.name + " -- " + roomD.price + " -- " + cc.dataMgr.userData.coins);
                        if (cc.dataMgr.userData.coins - roomD.price >= 0) {
                            cc.dataMgr.changeCoins_b(- roomD.price);
                            cc.dataMgr.addOneRoom(this._selectIdx);
                            this.refreshRoom(this._selectIdx);
                        }
                    }
                }
            }
        }
    }
}