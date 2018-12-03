const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class PopThings extends cc.Component {

    @property(cc.SpriteFrame)
    frame_noThings = null;

    @property(cc.Node) //顶部选择切换房间按钮
    node_top = null;
    @property(cc.Node)//数量
    lab_num = null;
    @property(cc.Node)//下拉选择按钮
    node_select = null;
    @property(cc.Node)//选择的是那个房间
    toggle = null;

    //展示物品的根节点
    @property(cc.Node)
    node_one = null;
    @property(cc.Node)
    node_two = null;

    @property(cc.Node)//底部 标识 当前是第几页
    node_layout = null;

    @property(cc.Node)//底部晚间展示选中物品的信息介绍
    node_things = null;

    _maxWH = 145; // 物品可显示的最大宽高

    _selectIdx = null;

    _thingsNum = 0;//当前选中房间的所有物品数量
    _pageMax = null;  //向前房间一共有多少页
    _pageIdx = null;  //当前显示的是第几页
    _thingsArr = null; //当前房间的 物品信息 arr

    _isOnMoving = false;//是否在移动

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

        this.refreshRoom(this._selectIdx);
    }

    hidePop() {
        this.node.isWillHide = true;
        this.node.runAction(cc.sequence(cc.scaleTo(0.2, 0), cc.callFunc(this.scaleEnd, this)));
    }

    scaleEnd() {
        this.node.active = false;
    }

    refreshRoom(roomIdx) {
        this._selectIdx = roomIdx;
        let roomMax = cc.dataMgr.userData.haveRoom.length;
        if (this._selectIdx < 0)
            this._selectIdx = roomMax - 1;
        else if (this._selectIdx >= roomMax)
            this._selectIdx = 0;

        //获得相应数据 和 初始化
        let roomD = cc.dataMgr.gameData.roomData[this._selectIdx];
        let roomU = cc.dataMgr.userData.roomData[this._selectIdx];
        if (roomD && roomU) {
            this._thingsNum = roomD.thingsNum;
            this._pageMax = Math.ceil(this._thingsNum / 9);
            this._pageIdx = 0;
            //统计物品
            this._thingsArr = [];
            for (let i = 0; i < cc.dataMgr.userData.haveThings.length; ++i) {
                let thingsKey = cc.dataMgr.userData.haveThings[i];
                if (thingsKey.indexOf(roomD.name) >= 0)
                    this._thingsArr.push(thingsKey);
            }

            //顶部信息初始化
            this.node_top.getChildByName("lab_room").getComponent(cc.Label).string = roomD.desc;

            let strNum = (this._thingsArr.length + "/" + this._thingsNum);
            this.node_top.getChildByName("lab_num").getComponent(cc.Label).string = strNum;

            this.refreshPage(this._pageIdx, false);
        }
    }

    //isMove 是否滑动
    refreshPage(nowPageIdx, isMove) {
        this._pageIdx = nowPageIdx;
        if (this._pageIdx < 0)
            this._pageIdx = this._pageMax - 1;
        else if (this._pageIdx >= this._pageMax)
            this._pageIdx = 0;

        //初始化页面标识 宽度 36
        for (let i = 0; i < this.node_layout.children.length; ++i) {
            let nodeN = this.node_layout.children[i];
            nodeN.active = (i < this._pageMax);
            nodeN.getComponent(cc.Toggle).isChecked = (this._pageIdx == i);
        }
        this.node_layout.x = -(36 * this._pageMax / 2);

        //移动的距离是 560
        if (false) {

        }
        else {
            this.node_one.x = 0;
            this.node_two.x = 560;
            this.node_one.stopAllActions();
            this.node_two.stopAllActions();

            this.refreshOne(this.node_one, this._pageIdx);
            this.refreshOne(this.node_two, this._pageIdx + 1);

            this._isOnMoving = false;
        }
    }

    refreshOne(nodeRoot, pageIdx) {
        if (pageIdx < 0)
            pageIdx = this._pageMax - 1;
        else if (pageIdx >= this._pageMax)
            pageIdx = 0;

        //初始化控件开始了
        for (let i = 0; i < nodeRoot.children.length; ++i) {
            let nodeN = nodeRoot.children[i];
            let thingsIdx = pageIdx * 9 + i;
            if (thingsIdx < this._thingsArr.length) {
                let thingsKey = this._thingsArr[thingsIdx];
                nodeN.thingsKey = thingsKey;
                nodeN.getChildByName("spr_bg").opacity = 255;
                this.setThingsFrame(nodeN.getChildByName("spr_things"), thingsKey);
            }
            else {
                nodeN.thingsKey = null;
                nodeN.getChildByName("spr_bg").opacity = 180;
                nodeN.getChildByName("spr_things").scale = 1;
                nodeN.getChildByName("spr_things").getComponent(cc.Sprite).spriteFrame = this.frame_noThings;
            }
        }
    }

    refreshDesc(thingsKey) {
        let desc = cc.dataMgr.gameData.thingsData[thingsKey];
        if (desc) {
            this.node_things.getChildByName("lab_desc").getComponent(cc.Label).string = desc;
            this.setThingsFrame(this.node_things.getChildByName("spr_things"), thingsKey);
        }
    }

    setThingsFrame(nodeN, thingsName) {
        let gameJs = cc.find("Canvas").getComponent("Game");
        if (nodeN && nodeN.active && gameJs) {
            let sf = gameJs.getThingsFrame_sf(thingsName);
            if (sf)
                nodeN.getComponent(cc.Sprite).spriteFrame = sf;
            let max = nodeN.width > nodeN.height ? nodeN.width : nodeN.height;
            if (max > this._maxWH - 10)
                nodeN.scale = (this._maxWH - 10) / max;
        }
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
                this.refreshPage(this._pageIdx - 1, true);
            }
            else if (btnN == "btn_right") {
                this.refreshPage(this._pageIdx + 1, true);
            }
            else if (btnN == "things") {
                let thingsKey = event.target.thingsKey;
                if (thingsKey) {
                    this.refreshDesc(thingsKey);
                }
            }
        }
    }
}