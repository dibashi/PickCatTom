const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class PopGaming extends cc.Component {

    /**
     * 四个小游戏全在这里处理
     */

    //显示相关
    @property(cc.Node)
    lab_title = null;
    @property(cc.Node)
    lab_coins = null;
    @property(cc.Node)
    lab_gems = null;

    //fishing 中的小猫需要替换 图片
    @property(cc.SpriteFrame)
    frame_fishingCat1 = null;
    @property(cc.SpriteFrame)
    frame_fishingCat2 = null;

    @property(cc.Node)
    spr_fishCat = null;
    @property(cc.Node)//鱼线及鱼符
    fish_bobber = null;

    //boxing 中相关数据
    @property(cc.Node)//手臂
    node_arm = null;
    @property(cc.Node)//身体
    node_body = null;
    @property(cc.Node)//左右打击
    node_hit = null;

    //计数显示
    @property(cc.Node)
    node_count = null;

    //实现金币的 飞上
    @property(cc.Node)
    spr_coins = null;

    @property(cc.Node)//所有小游戏的根节点
    root_game = null;
    @property(cc.Node)//游戏的提示信息
    node_hint = null;

    _gameName = {
        "getFish": "轻松捕鱼",
        "eatFood": "贪食猫",
        "fishing": "钩鱼",
        "boxing": "拳击"
    }

    //getFish 相关 数据
    _posArr = [-140, 0, 140];
    _atPosIdx = 0;//小猫所在位置
    _canMoveCat = true;

    //eatFood 相关 数据
    _eatCatDir = 1; //1右 2左 3上 4下 
    _eatCatSpeed = 160; //移动小猫的速度
    _beginPos = null;//开始滑动位置

    //fishing 相关 数据
    _canFishing = false;//是否有鱼上钩

    //拳击相关数据
    _canHitType = 0;//0 打不中 1左边能打 2右边能打

    onLoad() {

    }

    start() {
        let self = this;
        this.node.on(cc.Node.EventType.TOUCH_START, function (touch) {
            let posTouch = touch.getLocation();
            if (cc.dataMgr.userData.gameType == "getFish") {
                if (self._canMoveCat) {
                    let spr_cat = self.root_game.getChildByName("getFish").getChildByName("spr_cat");
                    if (posTouch.x < cc.dataMgr.canvasW / 2) {
                        --self._atPosIdx;
                        if (self._atPosIdx < 0)
                            self._atPosIdx = 0;
                    }
                    else {
                        ++self._atPosIdx;
                        if (self._atPosIdx >= self._posArr.length)
                            self._atPosIdx = self._posArr.length - 1;
                    }
                    self._canMoveCat = false;
                    spr_cat.stopAllActions();
                    spr_cat.runAction(cc.sequence(cc.moveTo(0.2, cc.v2(self._posArr[self._atPosIdx], spr_cat.y)), cc.callFunc(self.refreshCatAct, self)));
                }
            }
            else if (cc.dataMgr.userData.gameType == "eatFood")
                self._beginPos = posTouch;
            else if (cc.dataMgr.userData.gameType == "fishing") {
                if (self._canFishing)
                    self.getOneFishBegin();
            }
            else if (cc.dataMgr.userData.gameType == "boxing") {
                if (posTouch.x < cc.dataMgr.canvasW / 2) {
                    if (self._canHitType == 1) {
                        cc.dataMgr.userData.countPool += (toolsQQ.doubleGame ? 2 : 1);
                        cc.audioMgr.playEffect("pop_close");
                        self.refreshNum();
                        self.node_body.getChildByName("box_face_hit").active = true;
                        self.node_body.getChildByName("box_face_normal").active = false;
                        self.node_body.getChildByName("box_face_hit").scaleX = 1
                    }
                    else {
                        self.node_hit.getChildByName("box_hit-particle").active = true;
                        self.node_hit.getChildByName("box_hit-particle").scaleX = 1;
                    }
                    self.node_hit.getChildByName("box_hit_left").active = true;
                    self.node_hit.getChildByName("box_hit_right").active = false;
                }
                else {
                    if (self._canHitType == 2) {
                        cc.dataMgr.userData.countPool += (toolsQQ.doubleGame ? 2 : 1);
                        cc.audioMgr.playEffect("pop_close");
                        self.refreshNum();
                        self.node_body.getChildByName("box_face_hit").active = true;
                        self.node_body.getChildByName("box_face_normal").active = false;
                        self.node_body.getChildByName("box_face_hit").scaleX = -1
                    }
                    else {
                        self.node_hit.getChildByName("box_hit-particle").active = true;
                        self.node_hit.getChildByName("box_hit-particle").scaleX = -1;
                    }
                    self.node_hit.getChildByName("box_hit_left").active = false;
                    self.node_hit.getChildByName("box_hit_right").active = true;
                }
            }
        }, this.node);
        this.node.on(cc.Node.EventType.TOUCH_END, function (touch) {
            let posTouch = touch.getLocation();
            if (cc.dataMgr.userData.gameType == "eatFood" && self._beginPos) {
                let disX = posTouch.x - self._beginPos.x;
                let disY = posTouch.y - self._beginPos.y;
                let nodeGame = self.root_game.getChildByName("eatFood");
                let spr_cat = nodeGame.getChildByName("spr_cat");
                let aimDir = 1;
                if (Math.abs(disX) > Math.abs(disY))
                    aimDir = (disX > 0 ? 1 : 2);
                else
                    aimDir = (disY > 0 ? 3 : 4);
                if (Math.abs(spr_cat.y) < 250 && (aimDir == 1 || aimDir == 2) && (self._eatCatDir == 3 || self._eatCatDir == 4)) {
                    self._eatCatDir = aimDir;
                    self.changeEatCatDir();
                }
                else if (Math.abs(spr_cat.x) < 250 && (aimDir == 3 || aimDir == 4) && (self._eatCatDir == 1 || self._eatCatDir == 2)) {
                    self._eatCatDir = aimDir;
                    self.changeEatCatDir();
                }
                else if (aimDir + self._eatCatDir == 3) {
                    self._eatCatDir = aimDir;
                    self.changeEatCatDir();
                }
                else if (aimDir + self._eatCatDir == 7) {
                    self._eatCatDir = aimDir;
                    self.changeEatCatDir();
                }
                self._beginPos = null
            }
            else if (cc.dataMgr.userData.gameType == "boxing") {
                self.node_hit.getChildByName("box_hit_left").active = false;
                self.node_hit.getChildByName("box_hit_right").active = false;
                self.node_hit.getChildByName("box_hit-particle").active = false;
            }
        }, this.node);

        this.node_arm.getComponent(cc.Animation).on("play", function () {
            let currentClip = self.node_arm.getComponent(cc.Animation).currentClip;
            if (currentClip.name == "game_boxingArmR") {
                self._canHitType = 2;
            }
            else if (currentClip.name == "game_boxingArmL") {
                self._canHitType = 1;
            }
        }, this);

        this.node_arm.getComponent(cc.Animation).on("finished", function () {
            let currentClip = self.node_arm.getComponent(cc.Animation).currentClip;
            if (currentClip.name == "game_boxingArmR" || currentClip.name == "game_boxingArmL") {
                self._canHitType = 0;
                self.playAnimationNormal();
            }
        }, this);
    }

    showPop() {
        cc.audioMgr.playEffect("pop_open");
        this.node.isWillHide = false;
        this.node.active = true;
        this.node.opacity = 0;

        let gameJs = cc.find("Canvas").getComponent("Game");
        if (gameJs)
            gameJs.chageAction_i();

        this.spr_coins.active = false;
        this.node.runAction(cc.sequence(cc.delayTime(0.4), cc.callFunc(this.callShow, this)));
    }

    hidePop() {
        this.node.isWillHide = true;//为了 catOut 显示
        this.node.active = false;
        cc.dataMgr.userData.gameType = null;
        this.unschedule(this.showOneFood);
    }

    callShow() {
        this.node.opacity = 255;
        //根据模式刷新信息 getFish eatFood fishing boxing 四种小游戏模式 cc.dataMgr.userData.gameType
        for (let i = 0; i < this.root_game.children.length; ++i) {
            let nodeN = this.root_game.children[i];
            nodeN.active = (nodeN.name == cc.dataMgr.userData.gameType);
        }
        for (let i = 0; i < this.node_hint.children.length; ++i) {
            let nodeN = this.node_hint.children[i];
            nodeN.active = (nodeN.name == cc.dataMgr.userData.gameType);
        }

        this.refreshNum();
        this.lab_coins.getComponent(cc.Label).string = cc.dataMgr.userData.coins;
        this.lab_gems.getComponent(cc.Label).string = cc.dataMgr.userData.gems;
        this.lab_title.getComponent(cc.Label).string = this._gameName[cc.dataMgr.userData.gameType];

        //显示加倍不加倍
        this.node.getChildByName("node_double").active = toolsQQ.doubleGame;

        //根据不同类型 进行初始化
        let nodeGame = this.root_game.getChildByName(cc.dataMgr.userData.gameType);
        if (nodeGame) {
            if (cc.dataMgr.userData.gameType == "getFish") {
                nodeGame.getChildByName("spr_fish").active = false;
                nodeGame.getChildByName("spr_coins").active = false;

                this._atPosIdx = 0;
                this.root_game.getChildByName("getFish").getChildByName("spr_cat").x = this._posArr[this._atPosIdx];

                this.refreshCatAct();

                //创建第一条鱼
                this.createFish();
            }
            else if (cc.dataMgr.userData.gameType == "eatFood") {
                this._eatCatDir = 1;
                this.changeEatCatDir();
                this.schedule(this.showOneFood, 1);
            }
            else if (cc.dataMgr.userData.gameType == "fishing") {
                this._canFishing = false;
                let nodeGame = this.root_game.getChildByName("fishing");
                nodeGame.getChildByName("fisher_icon").active = false;
                nodeGame.getChildByName("spr_fish").active = false;
                this.fish_bobber.opacity = 255;

                nodeGame.getChildByName("node_boat").getComponent(cc.Animation).play("game_fishBoat");
                this.spr_fishCat.getComponent(cc.Sprite).spriteFrame = this.frame_fishingCat1;

                this.nextCanFishing();
            }
            else if (cc.dataMgr.userData.gameType == "boxing") {
                this.playAnimationNormal();

                this.node_body.getChildByName("box_face_hit").active = false;
                this.node_body.getChildByName("box_face_normal").active = true;
            }
        }
    }

    refreshNum() {
        for (let i = 0; i < this.node_count.children.length; ++i) {
            let nodeN = this.node_count.children[i];
            nodeN.getComponent(cc.Toggle).isChecked = (i < cc.dataMgr.userData.countPool);
        }
        //凑够数目 加金币
        if (cc.dataMgr.userData.countPool >= 6) {
            cc.dataMgr.userData.countPool = 0;
            this.addOneCoins(187, 402);
            this.refreshNum();
        }
    }

    //添加一个金币
    addOneCoins(posX, posY) {
        this.spr_coins.active = true;
        this.spr_coins.position = cc.v2(posX, posY);
        let aimPos = cc.v2(-cc.dataMgr.canvasW / 2 + 160, cc.dataMgr.canvasH / 2 - 90 - 60);
        this.spr_coins.runAction(cc.sequence(cc.moveTo((aimPos.y - posY) / 800, aimPos), cc.callFunc(this.coinsEnd, this)));

        cc.audioMgr.playEffect("coins");
    }

    coinsEnd() {
        this.spr_coins.active = false;
        cc.dataMgr.changeCoins_b(toolsQQ.doubleGame ? 2 : 1);

        this.lab_coins.getComponent(cc.Label).string = cc.dataMgr.userData.coins;
        this.lab_gems.getComponent(cc.Label).string = cc.dataMgr.userData.gems;
    }

    //------ getFish 相关 函数 ------
    refreshCatAct() {
        this._canMoveCat = true;
        let nodeGame = this.root_game.getChildByName("getFish");
        nodeGame.getChildByName("spr_cat").getComponent(cc.Animation).play("game_getFish1");
        nodeGame.getChildByName("spr_cat").getChildByName("spr_fish").active = false;
        nodeGame.getChildByName("spr_cat").getChildByName("spr_coins").active = false;
    }

    createFish() {
        if (!this.isWillHide) {
            let spr_fish = this.root_game.getChildByName("getFish").getChildByName("spr_fish");
            let spr_coins = this.root_game.getChildByName("getFish").getChildByName("spr_coins");
            spr_fish.stopAllActions();
            spr_coins.stopAllActions();
            spr_coins.y = 270;
            spr_fish.y = 270;

            let randNum = Math.random();
            let posIdx = Math.floor(Math.random() * 3);
            let posX = this._posArr[posIdx];
            if (randNum > 0.8) {
                spr_coins.active = true;
                spr_coins.x = posX;
                let time = 0.8 + Math.random();
                spr_coins.runAction(cc.sequence(cc.delayTime(time - 0.1), cc.callFunc(this.callCheckTouch, this)));
                spr_coins.runAction(cc.sequence(cc.moveTo(time, cc.v2(posX, -230)), cc.callFunc(this.callFishEnd, this)));
            }
            else {
                spr_fish.active = true;
                spr_fish.x = posX;
                let time = 1.2 + Math.random() * 1.2;
                spr_fish.runAction(cc.sequence(cc.delayTime(time - 0.1), cc.callFunc(this.callCheckTouch, this)));
                spr_fish.runAction(cc.sequence(cc.moveTo(time, cc.v2(posX, -230)), cc.callFunc(this.callFishEnd, this)));
            }
        }
    }

    callFishEnd() {
        this.callCheckTouch();
        this.createFish();
    }

    callCheckTouch() {
        let spr_fish = this.root_game.getChildByName("getFish").getChildByName("spr_fish");
        let spr_coins = this.root_game.getChildByName("getFish").getChildByName("spr_coins");
        let spr_cat = this.root_game.getChildByName("getFish").getChildByName("spr_cat");

        if (spr_coins.y < -150 && Math.abs(spr_coins.x - this._posArr[this._atPosIdx]) < 10) {
            this.addOneCoins(spr_coins.x, -180);
            spr_coins.x = -cc.dataMgr.canvasW;

            this._canMoveCat = false;
            spr_cat.getChildByName("spr_fish").active = false;
            spr_cat.getChildByName("spr_coins").active = true;
            spr_cat.getComponent(cc.Animation).play("game_getFish2");
            spr_cat.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(this.refreshCatAct, this)));
        }
        else if (spr_fish.y < -150 && Math.abs(spr_fish.x - this._posArr[this._atPosIdx]) < 10) {
            cc.dataMgr.userData.countPool += (toolsQQ.doubleGame ? 2 : 1);
            cc.audioMgr.playEffect("cat_eat");
            this.refreshNum();
            spr_fish.x = -cc.dataMgr.canvasW;

            this._canMoveCat = false;
            spr_cat.getChildByName("spr_fish").active = true;
            spr_cat.getChildByName("spr_coins").active = false;
            spr_cat.getComponent(cc.Animation).play("game_getFish2");
            spr_cat.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(this.refreshCatAct, this)));
        }
    }

    //------ eatFood 相关 函数 ------

    changeEatCatDir() {
        let nodeGame = this.root_game.getChildByName("eatFood");
        let spr_cat = nodeGame.getChildByName("spr_cat");
        if (this._eatCatDir == 1 || this._eatCatDir == 2) {
            spr_cat.rotation = 0;
        }
        else if (this._eatCatDir == 3) {
            //暂时替代以后 不会旋转角度
            spr_cat.scaleX = 1;
        }
        else if (this._eatCatDir == 4) {
            spr_cat.scaleX = 1;
        }
    }

    showOneFood() {
        let nodeGame = this.root_game.getChildByName("eatFood");
        let randNum = Math.random();
        if (randNum > 0.9 && !nodeGame.getChildByName("spr_coins").active) {
            nodeGame.getChildByName("spr_coins").active = true;
            nodeGame.getChildByName("spr_coins").position = cc.v2((Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400);
        }
        else {
            let nodeFood = nodeGame.getChildByName("node_food");
            for (let i = 0; i < nodeFood.children.length; ++i) {
                let nodeN = nodeFood.children[i];
                if (!nodeN.active) {
                    nodeN.active = true;
                    nodeN.position = cc.v2((Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400);
                    nodeN.scale = 0;
                    nodeN.runAction(cc.scaleTo(0.2, 1));
                    break;
                }
            }
        }
    }

    //------ fishing 相关函数 ------

    nextCanFishing() {
        let nodeGame = this.root_game.getChildByName("fishing");
        nodeGame.stopAllActions();
        nodeGame.runAction(cc.sequence(cc.delayTime(0.5 + Math.random() * 2), cc.callFunc(this.callCanFishing, this), cc.delayTime
            (0.5), cc.callFunc(this.callCanFishingOver, this)));
    }

    getOneFishBegin() {
        this._canFishing = false;
        let nodeGame = this.root_game.getChildByName("fishing");
        nodeGame.getChildByName("fisher_icon").active = false;
        this.fish_bobber.opacity = 0;

        nodeGame.stopAllActions();

        let spr_fish = nodeGame.getChildByName("spr_fish");
        spr_fish.active = true;

        spr_fish.position = cc.v2(18, -139);
        spr_fish.runAction(cc.sequence(cc.moveTo(0.5, cc.v2(-100, 65)), cc.callFunc(this.getOneFishOver, this)));
        this.spr_fishCat.getComponent(cc.Sprite).spriteFrame = this.frame_fishingCat2;
    }

    getOneFishOver() {
        //显示鱼符
        this._canFishing = false;
        let nodeGame = this.root_game.getChildByName("fishing");
        nodeGame.getChildByName("fisher_icon").active = false;
        this.fish_bobber.opacity = 255;
        nodeGame.getChildByName("spr_fish").active = false;
        this.spr_fishCat.getComponent(cc.Sprite).spriteFrame = this.frame_fishingCat1;

        cc.dataMgr.userData.countPool += (toolsQQ.doubleGame ? 2 : 1);
        this.refreshNum();
        this.nextCanFishing();
        cc.audioMgr.playEffect("cat_eat");
    }

    callCanFishing() {
        this._canFishing = true;
        let nodeGame = this.root_game.getChildByName("fishing");
        nodeGame.getChildByName("fisher_icon").active = true;
    }

    callCanFishingOver() {
        this._canFishing = false;
        let nodeGame = this.root_game.getChildByName("fishing");
        nodeGame.getChildByName("fisher_icon").active = false;

        //随机下一次 钩鱼
        this.nextCanFishing();
    }

    //------ 拳击动画 ------


    playAnimationNormal() {
        this.node_hit.getChildByName("box_hit-particle").active = false;
        this.node_hit.getChildByName("box_hit_left").active = false;
        this.node_hit.getChildByName("box_hit_right").active = false;

        this.node_body.getChildByName("box_face_hit").active = false;
        this.node_body.getChildByName("box_face_normal").active = true;

        this.node_arm.getComponent(cc.Animation).play("game_boxingArmN");
        this.node_arm.stopAllActions();
        let randNum = Math.random();
        if (randNum > 0.5)
            this.node_arm.runAction(cc.sequence(cc.delayTime(1.2 + Math.random() * 1.2), cc.callFunc(this.playAnimationLeft, this)));
        else
            this.node_arm.runAction(cc.sequence(cc.delayTime(1.2 + Math.random() * 1.2), cc.callFunc(this.playAnimationRight, this)));
    }

    playAnimationLeft() {
        let state = this.node_arm.getComponent(cc.Animation).play("game_boxingArmL");
        state.speed = 0.6 + Math.random() * 2;
    }

    playAnimationRight() {
        let state = this.node_arm.getComponent(cc.Animation).play("game_boxingArmR");
        state.speed = 0.6 + Math.random() * 2;
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            console.log("-- onClickBtn -- " + this.node.name + " -- " + btnN);
            if (btnN == "ui_close" || btnN == "btn_bg") {
                this.hidePop();
                //固定页面返回在这里处理
                let gameJs = cc.find("Canvas").getComponent("Game");
                if (gameJs) {
                    gameJs.moveCatOut();
                    gameJs.chageAction_i();
                    gameJs.moveCatOut();

                    this.node.runAction(cc.sequence(cc.delayTime(0.4), cc.callFunc(this.hidePop, this)));
                }

                toolsQQ.doubleGame = false;
            }
        }
    }

    update(dt) {
        if (cc.dataMgr.userData.gameType == "eatFood") {
            let nodeGame = this.root_game.getChildByName("eatFood");
            let spr_cat = nodeGame.getChildByName("spr_cat");
            let node_food = nodeGame.getChildByName("node_food");
            let spr_coins = nodeGame.getChildByName("spr_coins");
            //移动猫咪
            let dis = dt * this._eatCatSpeed;
            if (this._eatCatDir == 1) {
                spr_cat.x += dis;
                if (spr_cat.x > 256 + spr_cat.width)
                    spr_cat.x = -256 - spr_cat.width;
            }
            else if (this._eatCatDir == 2) {
                spr_cat.x -= dis;
                if (spr_cat.x < -256 - spr_cat.width)
                    spr_cat.x = 256 + spr_cat.width;
            }
            else if (this._eatCatDir == 3) {
                spr_cat.y += dis;
                if (spr_cat.y > 256 + spr_cat.width)
                    spr_cat.y = -256 - spr_cat.width;
            }
            else if (this._eatCatDir == 4) {
                spr_cat.y -= dis;
                if (spr_cat.y < -256 - spr_cat.width)
                    spr_cat.y = 256 + spr_cat.width;
            }
            //判断是否碰到
            if (spr_coins.active && cc.v2(spr_coins.x - spr_cat.x, spr_coins.y - spr_cat.y).mag() < 90) {
                spr_coins.active = false;
                this.addOneCoins(spr_coins.x, spr_coins.y - this.root_game.y);
            }

            for (let i = 0; i < node_food.children.length; ++i) {
                let nodeN = node_food.children[i];
                if (nodeN.active && cc.v2(nodeN.x - spr_cat.x, nodeN.y - spr_cat.y).mag() < 60) {
                    nodeN.active = false;
                    cc.audioMgr.playEffect("cat_eat");
                    cc.dataMgr.userData.countPool += (toolsQQ.doubleGame ? 2 : 1);
                    this.refreshNum();
                }
            }
        }
    }
}