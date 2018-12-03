const {
    ccclass,
    property
} = cc._decorator;

@ccclass
export default class Game extends cc.Component {
    @property(cc.Node) //场景的摄像机
    camera = null;

    @property(cc.Prefab) //猫咪的预置资源
    pre_cat = null;
    @property(cc.Prefab) //效果的预置资源 详见 NodeEffect 中,猫咪便便、金币、等都是用这个来实现的。
    pre_effect = null;

    @property(cc.SpriteAtlas) //物品的图集
    atlas_wupin = null;

    //房间相关
    @property(cc.Node) //房间界面的根节点
    panel_room = null;
    @property(cc.Node) //猫咪的根节点(之前pop_catUI 层级要求在选中的猫咪下,在其它猫咪之上,所以把pop_catUI 放到root_cat 中了)
    root_cat = null;

    //panel_room 中具体房间的根节点,[窝棚、庭院、大厅、房间]。
    @property(cc.Node) //为了层级显示方便,一个房间可能 在 panel_room、root_cat、panel_top,都有图片
    roomArr = [];

    //小猫相关
    @property(cc.Node)
    node_catPos = null;
    @property(cc.Node) //小猫外出显示的小窗口倒计时,根节点
    node_catOut = null;

    //游戏特殊效果 新手引导
    @property(cc.Node) //添加一些效果的根节点
    root_effect = null;
    @property(cc.Node) //金猫根节点
    node_goldCat = null;

    //弹出框
    @property(cc.Node) //以 pop_*** 格式的节点,都是弹窗。除了pop_name、pop_adGame、pop_catUI外,大部分都在这个节点下。 
    node_pop = null; //弹窗基本上只能显示一个,个别弹窗可同时显示两个,如:(pop_catUI和pop_catData)(pop_name和pop_newCat)(pop_adGame和pop_Game)

    @property(cc.Node) //播放切换动画
    node_action = null;

    //移动相关(决定移动的边界和速度)
    _beginPos = null; //开始滑动的节点
    _moveSpeed = 480;
    _roomWidth = 0; //房间的宽度
    _roomHeight = 0; //房间的高度

    _putThingsKey = null; //要放置的 物品名称
    _moveCatKey = null; //要移动到这只猫身上。

    onLoad() {
        this._roomWidth = cc.dataMgr.canvasW;
        this._roomHeight = cc.dataMgr.canvasH;
    }

    start() {
        //初始化音乐组件
        cc.audioMgr.init();

        //清空小猫的一些状态
        cc.dataMgr.userData.popType = null;
        cc.dataMgr.userData.touchCatName = null;
        cc.dataMgr.userData.onTouchCat = null;

        let self = this;
        this.node.on(cc.Node.EventType.TOUCH_START, function (touch) {
            let touchPos = touch.getLocation();
            self._beginPos = touchPos;

            //新手引导 有些需点击屏幕才能进入下一步,有些是获得具体某些物品进入下一步
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
            }
        }, this.node);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (touch) {
            if (self._beginPos) {
                let movePos = touch.getLocation();
                let addX = movePos.x - self._beginPos.x;
                let addY = movePos.y - self._beginPos.y;

                //移动相机 (没有和猫咪互动、没有显示pop弹窗)才能移动摄像机
                if (!cc.dataMgr.userData.touchCatName && !cc.dataMgr.userData.showCatTake && !cc.dataMgr.userData.popType) {
                    let addPos = self.getAddPosition_v2(-addX, -addY)
                    self.camera.setPosition(cc.v2(self.camera.x + addPos.x, self.camera.y + addPos.y));
                    self._beginPos = movePos;
                }

                //和 小猫互动(添加一些效果 如:💗, 气泡等)
                if (cc.dataMgr.userData.onTouchCat) {
                    //这里是在和小猫互动
                    let disPos = cc.v2(addX, addY);
                    if (disPos.mag() > 10) {
                        self._beginPos = movePos
                        self.addTouchEffect();
                    }
                } else
                    self.refreshCatPoint();
            }

        }, this.node);
        this.node.on(cc.Node.EventType.TOUCH_END, function (touch) {
            //没有和小猫互动的时候才会 隐藏菜单 和 满足这些条件才隐藏 pop
            if (!cc.dataMgr.userData.onTouchCat && cc.dataMgr.userData.leadStep != 10 && cc.dataMgr.userData.leadStep != 100) {
                if (!cc.dataMgr.userData.showCatTake && cc.dataMgr.userData.popType != "pop_catTake") {
                    console.log("-- game touch end --");
                    cc.dataMgr.userData.popType = null;
                    self.showPop();
                    cc.dataMgr.userData.touchCatName = null;
                }
            }
        }, this.node);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function (touch) {}, this.node);

        //初始化房间
        this.showRoom();

        //这种情况可能时 放置物品途中退游戏了
        if (cc.dataMgr.userData.showCatTake)
            this.showCatTake();

        //小猫带回礼物后退游戏了  
        this.callOutOver();

        //每隔一段时间就刷新一下猫咪💩
        this.schedule(this.refreshCleanNum, cc.dataMgr.userData.addOneClean);

        //播放背景音乐
        cc.audioMgr.playBg();

        console.log("--- 试验区 ---");
        // console.log(cc.dataMgr.getTimeSecond_i());
        // console.log(parseInt("0"));
        // openLog(true, true);
    }

    //显示不同的房间(shack(窝棚)、yard(庭院)、hall(大厅)、room(房间))
    showRoom() {
        console.log("-- showRoom --" + cc.dataMgr.userData.atRoomIdx);

        //设置照相机的位置
        this.camera.setPosition(cc.v2(0, 0));

        //校验 atRoomIdx(当前所在房间) 是否合法。
        if (cc.dataMgr.userData.atRoomIdx >= this.roomArr.length || typeof (cc.dataMgr.userData.atRoomIdx) != "number")
            cc.dataMgr.userData.atRoomIdx = 0;

        //显示所在的房间, i== atRoomIdx 的房间。其它房间隐藏
        for (let i = 0; i < this.roomArr.length; ++i) {
            let nodeN = this.roomArr[i];

            //房间上层的遮挡物 如电灯等
            let roomTop = this.node.getChildByName("panel_top").getChildByName(nodeN.name);
            if (roomTop)
                roomTop.active = (i == cc.dataMgr.userData.atRoomIdx);
            //猫咪根节点上也有
            let roomTop2 = this.root_cat.getChildByName(nodeN.name);
            if (roomTop2) {
                roomTop2.active = (i == cc.dataMgr.userData.atRoomIdx);
                roomTop2.zIndex = -roomTop2.y;
            }

            //房间中的东西
            if (i == cc.dataMgr.userData.atRoomIdx) {
                nodeN.active = true;
                let nodeJs = nodeN.getComponent(nodeN.name);
                if (nodeJs) {
                    nodeJs.initRoom();
                    this._roomHeight = nodeN.height;
                    this._roomWidth = nodeN.width;

                    //加载物品, 且 只加载一次
                    if (!nodeJs._isAddThings) {
                        let roomD = cc.dataMgr.userData.roomData[i];
                        nodeJs._isAddThings = true;
                        //找到物品的根节点
                        let node_wupin = nodeN.getChildByName("node_wupin");
                        for (let k = 0; k < cc.dataMgr.userData.haveThings.length; ++k) {
                            let thingsKey = cc.dataMgr.userData.haveThings[k];
                            //根据thingsKey 创建物品,并设置到固定位置
                            if (thingsKey.indexOf(roomD.name) >= 0 && !node_wupin.getChildByName(thingsKey)) {
                                let sprite = new cc.Node();
                                sprite.addComponent(cc.Sprite);
                                sprite.getComponent(cc.Sprite).spriteFrame = this.getThingsFrame_sf(thingsKey);
                                sprite.anchorY = 0;
                                node_wupin.addChild(sprite);
                                let pos = cc.dataMgr.gameData.thingsPos[thingsKey];
                                if (!pos)
                                    pos = cc.v2(0, 0);
                                sprite.position = pos;
                                sprite.zIndex = -pos.y;
                            }
                        }
                    }
                }
            } else
                nodeN.active = false;
        }

        //每次切换房间 都要刷新: 房间的猫咪、外出的猫咪、金币显示、猫咪的💩
        this.scheduleOnce(function () {
            this.refreshCat();
            this.moveCatOut();
            this.refreshGemsAndCoins();
            this.refreshCleanNum();
            this.refreshCatPoint();
            this.refreshBtnNewCat();
        }, 0.2);
    }

    //显示不同的弹出界面,一定要提前设置 cc.dataMgr.userData.popType
    showPop() {
        console.log("-- Game showPop --" + cc.dataMgr.userData.showCatTake + " -- " + cc.dataMgr.userData.popType);
        //如果时 放置小猫物品时 截断所有弹窗
        if (cc.dataMgr.userData.showCatTake && cc.dataMgr.userData.popType != "pop_catTake") {
            this.showCatTake();
            return;
        }

        //先把显示的界面隐藏掉
        let isResetCamera = false; //这是是否缩放摄像机,pop_catUI 显示的时候摄像机ZoomRatio 变大,同理隐藏 pop_catUI时,要把ZoomRatio 变为1.
        let type = cc.dataMgr.userData.popType;
        for (let i = 0; i < this.node_pop.children.length; ++i) {
            let nodeN = this.node_pop.children[i];
            //name == type 这是需要操作的弹窗
            if (nodeN.name == type) {
                if (type == "pop_room") {
                    //再点一次会隐藏的需要单独处理
                    if (nodeN.active) {
                        nodeN.getComponent("PopRoom").hidePop();
                    } else {
                        nodeN.active = true;
                        nodeN.getComponent("PopRoom").showPop();
                    }
                } else if (type == "pop_things")
                    nodeN.getComponent("PopThings").showPop();
                else if (type == "pop_catTake" && cc.dataMgr.userData.showCatTake)
                    nodeN.getComponent("PopCatTake").showPop();
                else if (type == "pop_catData")
                    nodeN.getComponent("PopCatData").showPop();
                else if (type == "pop_newCat")
                    nodeN.getComponent("PopNewCat").showPop();
                else if (type == "pop_gaming")
                    nodeN.getComponent("PopGaming").showPop();
                else if (type == "pop_book") {
                    //再点一次会隐藏的需要单独处理
                    if (nodeN.active) {
                        nodeN.getComponent("PopBook").hidePop();
                    } else {
                        nodeN.active = true;
                        nodeN.getComponent("PopBook").showPop();
                    }
                }
                //这些不需要特殊处理 pop_game pop_store pop_box pop_set
                else if (type == "pop_game" || type == "pop_catList" ||
                    type == "pop_store" || type == "pop_box" ||
                    type == "pop_set" || type == "pop_dog") {
                    nodeN.active = true;
                    nodeN.getComponent("PopBook").showPop();
                }
            } else if (nodeN.active) {
                //如果不是需要操作的弹窗 且 这个弹窗还显示着,要把它隐藏掉。
                if (nodeN.name == "pop_room")
                    nodeN.getComponent("PopRoom").hidePop();
                else if (nodeN.name == "pop_things")
                    nodeN.getComponent("PopThings").hidePop();
                else if (nodeN.name == "pop_catTake")
                    nodeN.getComponent("PopCatTake").hidePop();
                else if (nodeN.name == "pop_catData")
                    nodeN.getComponent("PopCatData").hidePop();
                else if (nodeN.name == "pop_newCat")
                    nodeN.getComponent("PopNewCat").hidePop();
                else if (nodeN.name == "pop_gaming")
                    nodeN.getComponent("PopGaming").hidePop();
                else if (nodeN.name == "pop_book")
                    nodeN.getComponent("PopBook").hidePop();
                //这些不许特殊处理 pop_game、pop_store、pop_box、pop_set
                else if (nodeN.name == "pop_game" || nodeN.name == "pop_catList" ||
                    nodeN.name == "pop_store" || nodeN.name == "pop_box" ||
                    nodeN.name == "pop_set" || nodeN.name == "pop_dog") {
                    nodeN.getComponent("PopBook").hidePop();
                }
            }
        }

        //单独处理 pop_catUI 它不再在 nodePop 节点下
        let nodeCatUI = this.node.getChildByName("root_cat").getChildByName("pop_catUI");
        if (type == "pop_catUI") {
            if (nodeCatUI.active) {
                nodeCatUI.getComponent("PopCatUI").hidePop();
                isResetCamera = true;
            } else {
                nodeCatUI.active = true;
                nodeCatUI.getComponent("PopCatUI").showPop();
            }
        } else if (nodeCatUI.active) {
            //猫咪信息好猫咪 UI 可以同时显示
            if (!(type == "pop_catData")) {
                nodeCatUI.getComponent("PopCatUI").hidePop();
                isResetCamera = true;
            }
        }

        //小猫UI显示的时候镜头是拉近的 当小猫UI 隐藏的时候要控制镜头拉远
        if (isResetCamera) {
            this.scaleCamera(false, 0.4);
        }

        //刷新 node_top 中 btn_adClean
        let showClean = (getTimeSecond_i() - 3600 < toolsQQ.cleaneTimeBegin);
        this.node.getChildByName("node_top").getChildByName("btn_adClean").active = !showClean;

        //金猫显示
        this.showGoldCat();
        this.moveCatOut();
        this.refreshCatPoint();
        this.refreshBtnNewCat();
    }

    //底部小猫在外的移入移出
    moveCatOut() {
        //判断当前是否有显示的 pop 弹窗
        let haveOne = false;
        for (let i = 0; i < this.node_pop.children.length; ++i) {
            if (this.node_pop.children[i].active && !this.node_pop.children[i].isWillHide)
                haveOne = true;
        }
        //pop_catUI 单独处理(因其不再 node_pop 中)
        let pop_catUI = this.node.getChildByName("root_cat").getChildByName("pop_catUI")
        if (pop_catUI.active && !pop_catUI.isWillHide)
            haveOne = true;

        //底部外出猫的动作(如果有显示的pop 右侧猫咪外出小窗口是要缩回去的)
        if (this.node_catOut.active) {
            if (haveOne)
                this.node_catOut.getComponent("NodeCatOut").downOut();
            else
                this.node_catOut.getComponent("NodeCatOut").showOut();
        }

        //一个都没有 清空 popType
        if (!haveOne)
            cc.dataMgr.userData.popType = null;
    }

    //放置物品步骤:切换到物品房间->摄像机移动到物品所在位置->放置物品
    putOneThings(thingsKey) {
        //确定物品所在的房间
        let roomIdx = 0;
        for (let i = 0; i < cc.dataMgr.gameData.roomTotal.length; ++i) {
            let roomN = cc.dataMgr.gameData.roomTotal[i];
            if (thingsKey.indexOf(roomN) >= 0) {
                roomIdx = i;
                break;
            }
        }
        console.log("-- 放置物品 -- " + thingsKey + " -- " + roomIdx);
        if (roomIdx >= this.roomArr.length || typeof (roomIdx) != "number")
            return;

        this._putThingsKey = thingsKey;

        //如果物品不在当前房间 要先切换到物品所在房间。
        if (roomIdx != cc.dataMgr.userData.atRoomIdx) {
            //设置要切换到的房间
            cc.dataMgr.userData.atRoomIdx = roomIdx;
            //changeAction_i 播放切换房间动画,动画播放完成会 调用 showRoom();返回的是切换房间花费的时间
            let timeC = this.chageAction_i();
            this.node.runAction(cc.sequence(cc.delayTime(timeC), cc.callFunc(this.callMoveCamera, this)));
        } else {
            this.callMoveCamera();
        }
        //刷新小猫位置
        this.refreshCat();
    }

    //移动摄像机到物品所在位置
    callMoveCamera() {
        console.log("-- callMoveCamera --" + this._putThingsKey);
        //确定物品位置
        let aimPos = cc.dataMgr.gameData.thingsPos[this._putThingsKey];
        if (!aimPos)
            aimPos = cc.v2(0, 0);
        if (aimPos) {
            //加入到自己的 数据中 并改变房间的 haveThingsNum
            cc.dataMgr.userData.haveThings.push(this._putThingsKey);
            cc.dataMgr.userData.roomData[cc.dataMgr.userData.atRoomIdx].haveThingsNum++;
            cc.dataMgr.userData.roomData[cc.dataMgr.userData.atRoomIdx].cleanNum++

            //移动摄像机到指定位置,移动完成后 显示物品。
            let timeM = this.moveCameraTo_i(aimPos.x, aimPos.y); //返回的是移动摄像机花费的时间
            this.node.runAction(cc.sequence(cc.delayTime(timeM), cc.callFunc(this.callPutThings, this)));

            //保存数据
            cc.dataMgr.saveData();
        }
    }

    //显示一个物品 物品key 是 this._putThingsKey
    callPutThings() {
        console.log("-- Game.js callPutThings 新增一个物品 --");
        cc.audioMgr.playEffect("put_things");

        //新加一个物品
        let roomD = cc.dataMgr.gameData.roomData[cc.dataMgr.userData.atRoomIdx];
        let roomN = this.roomArr[cc.dataMgr.userData.atRoomIdx];
        let node_wupin = roomN.getChildByName("node_wupin");
        let thingsKey = this._putThingsKey;
        if (thingsKey.indexOf(roomD.name) >= 0 && !node_wupin.getChildByName(thingsKey)) {
            let sprite = new cc.Node();
            sprite.addComponent(cc.Sprite);
            sprite.getComponent(cc.Sprite).spriteFrame = this.getThingsFrame_sf(thingsKey);
            sprite.anchorY = 0;
            node_wupin.addChild(sprite);
            let pos = cc.dataMgr.gameData.thingsPos[thingsKey];
            if (!pos)
                pos = cc.v2(0, 0);
            sprite.position = pos;
            sprite.zIndex = -pos.y;
        }

        //新手引导,小猫获得指定的物品后,可以进入下一步。
        if (cc.dataMgr.userData.leadStep >= 0) {
            if (this._putThingsKey == "shack_023") {
                cc.dataMgr.userData.leadStep = 4;
                cc.find("Canvas").getComponent("NodeLead").refreshLead();
            } else if (this._putThingsKey == "shack_005") {
                cc.dataMgr.userData.leadStep = 6;
                cc.find("Canvas").getComponent("NodeLead").refreshLead();
            } else if (this._putThingsKey == "shack_007") {
                cc.dataMgr.userData.leadStep = 7;
                cc.find("Canvas").getComponent("NodeLead").refreshLead();
            } else if (this._putThingsKey == "shack_011") {
                cc.dataMgr.userData.leadStep = 8;
                cc.find("Canvas").getComponent("NodeLead").refreshLead();
            } else if (this._putThingsKey == "shack_006") {
                cc.dataMgr.userData.leadStep = 11;
                cc.find("Canvas").getComponent("NodeLead").refreshLead();
            } else if (this._putThingsKey == "yard_050") {
                cc.dataMgr.userData.leadStep = 18;
                cc.find("Canvas").getComponent("NodeLead").refreshLead();
            } else if (this._putThingsKey == "yard_060") {
                cc.dataMgr.userData.leadStep = 20;
                cc.find("Canvas").getComponent("NodeLead").refreshLead();
            } else if (this._putThingsKey == "yard_036") {
                cc.dataMgr.userData.leadStep = 21;
            } else if (this._putThingsKey == "yard_006") {
                cc.dataMgr.userData.leadStep = 24;
                cc.find("Canvas").getComponent("NodeLead").refreshLead();
            }
        }
        this._putThingsKey = null;
    }

    //刷新金币 和 宝石显示
    refreshGemsAndCoins() {
        let node_coins = this.node.getChildByName("node_top").getChildByName("node_coins");
        if (node_coins) {
            node_coins.getChildByName("lab_coins").getComponent(cc.Label).string = cc.dataMgr.userData.coins;
            node_coins.getChildByName("lab_gems").getComponent(cc.Label).string = cc.dataMgr.userData.gems;
        }
        if (cc.dataMgr.userData.showCatTake) {
            let pop_catTake = this.node_pop.getChildByName("pop_catTake");
            if (pop_catTake && pop_catTake.active) {
                let pop_coins = pop_catTake.getChildByName("node_coins");
                if (pop_coins) {
                    pop_coins.getChildByName("lab_coins").getComponent(cc.Label).string = cc.dataMgr.userData.coins;
                    pop_coins.getChildByName("lab_gems").getComponent(cc.Label).string = cc.dataMgr.userData.gems;
                }
            }
        }
    }

    //刷新需要打扫的便便个数
    refreshCleanNum() {
        let node_room = this.roomArr[cc.dataMgr.userData.atRoomIdx];
        let node_clean = node_room.getChildByName("node_clean");
        let roomU = cc.dataMgr.userData.roomData[cc.dataMgr.userData.atRoomIdx];

        if (node_clean && roomU) {
            let willAddNum = parseInt((cc.dataMgr.getTimeSecond_i() - cc.dataMgr.userData.addCleanTime) / cc.dataMgr.userData.addOneClean);
            if (willAddNum > 60)
                willAddNum = 60;
            //如果 addNum >15 每个房间平均 分配(不然就 只加到当前房间)
            if (willAddNum > 0) {
                if (willAddNum > 15) {
                    let canAdd = Math.ceil(willAddNum / cc.dataMgr.userData.haveRoom.length);
                    for (let i = 0; i < cc.dataMgr.userData.roomData.length; ++i) {
                        let oneRoomU = cc.dataMgr.userData.roomData[i];
                        if (oneRoomU.isHave)
                            oneRoomU.cleanNum += canAdd;
                    }
                } else
                    roomU.cleanNum += willAddNum;
                cc.dataMgr.userData.addCleanTime = cc.dataMgr.getTimeSecond_i()
            }
            //有可能玩家一直不清理 cleanNum 过大舍弃
            if (roomU.cleanNum > 60)
                roomU.cleanNum = 60;
            let cleanNum = roomU.cleanNum;
            let addNum = cleanNum - node_clean.children.length;
            if (node_clean.children.length < 15 && addNum > 0) {
                if (node_clean.children.length + addNum > 15)
                    addNum = 15 - node_clean.children.length;
                for (let j = 0; j < addNum; ++j) {
                    let pos = this.getOneCleanPos_v2();
                    let nodeCN = cc.instantiate(this.pre_effect);
                    node_clean.addChild(nodeCN);
                    nodeCN.setPosition(pos.x, pos.y);
                    nodeCN.getComponent("NodeEffect").initEffect("clean", 1);
                }
                roomU.cleanNum -= addNum;
            }
        }
    }

    refreshBtnNewCat() {
        //新猫咪按钮单独处理
        let btn_newCat = this.panel_room.getChildByName("btn_newCat");
        if (cc.dataMgr.userData.atRoomIdx != 0 && cc.dataMgr.userData.haveCat.length < cc.dataMgr.gameData.catTotal.length) {
            let price = cc.dataMgr.gameData.buyCat[cc.dataMgr.userData.haveCat.length];

            btn_newCat.active = true;
            let str = cc.dataMgr.userData.gems + "\\" + price;
            btn_newCat.getChildByName("lab_gems").active = (price > 0);
            btn_newCat.getChildByName("lab_gems").getComponent(cc.Label).string = str;

            //新手引导时箱子箱子靠中间放点
            if (cc.dataMgr.userData.leadStep >= 0) {
                btn_newCat.position = cc.v2(-150, 0);
                btn_newCat.scale = 0.6;
            } else if (cc.dataMgr.userData.atRoomIdx == 1) {
                btn_newCat.position = cc.v2(-520, 180);
                btn_newCat.scale = 0.6;
            } else {
                btn_newCat.position = cc.v2(-520, -540);
                btn_newCat.scale = 0.8;
            }
        } else
            btn_newCat.active = false;
    }

    //------ 小猫菜单 小猫外出 和 刷新小猫指针相关 ------

    //刷新当前房间的猫咪
    refreshCat() {
        //隐藏所有猫咪
        let rootLength = this.root_cat.children.length;
        for (let i = 0; i < rootLength; ++i) {
            let nodeN = this.root_cat.children[i];
            if (nodeN.name == "node_cat")
                nodeN.active = false;
        }
        //显示这个房间中的猫咪
        let atArr = cc.dataMgr.getAtCat_arr(cc.dataMgr.userData.atRoomIdx);
        for (let i = 0; i < atArr.length; ++i) {
            let catKey = atArr[i];
            let nodeCat = null;
            let pos = this.getOneCatPos_v2();

            for (let i = 0; i < rootLength; ++i) {
                let nodeN = this.root_cat.children[i];
                if (nodeN.name == "node_cat" && !nodeN.active)
                    nodeCat = nodeN;
            }
            if (!nodeCat) {
                nodeCat = cc.instantiate(this.pre_cat);
                this.root_cat.addChild(nodeCat);
            }
            nodeCat.active = true;
            //新手引导的时候,第一只猫咪的坐标是确定的。
            if (cc.dataMgr.userData.leadStep >= 24 && catKey == "catKey_0" && cc.dataMgr.userData.atRoomIdx == 2)
                nodeCat.position = cc.v2(0, 0);
            else
                nodeCat.position = pos;
            //刷新猫咪数据
            nodeCat.catKey = catKey;
            nodeCat.getComponent("NodeCat").initCat(catKey);
            nodeCat.zIndex = -nodeCat.y;
        }
        this.refreshCatPoint();
    }

    //刷新所有小猫的状态。(如需要喂食等)
    refreshCatStatus() {
        for (let i = 0; i < this.root_cat.children.length; ++i) {
            let nodeN = this.root_cat.children[i];
            if (nodeN.name == "node_cat" && nodeN.active && nodeN.getComponent("NodeCat"))
                nodeN.getComponent("NodeCat").refreshCat();
        }
    }

    //刷新指向猫咪的指针
    refreshCatPoint() {
        let atArr = cc.dataMgr.getAtCat_arr(cc.dataMgr.userData.atRoomIdx);
        for (let i = 0; i < this.node_catPos.children.length; ++i)
            this.node_catPos.children[i].active = false;
        if (cc.dataMgr.userData.showPos) {
            for (let i = 0; i < atArr.length; ++i) {
                let catKey = atArr[i];
                let pos = this.getPointPos_v2(catKey);
                if ((pos.x != 0) && (i < this.node_catPos.children.length)) {
                    let nodeN = this.node_catPos.children[i];
                    nodeN.active = true;
                    nodeN.position = pos;
                    nodeN.catKey = catKey;
                    let catU = cc.dataMgr.userData.catData[catKey];
                    //根据 catKey 初始 portal_mask 和 mask_guapo
                    nodeN.scaleX = (pos.x > 0 ? 1 : -1);
                    nodeN.getChildByName("spr_effect").getComponent("NodeEffect").initEffect("catHead", catU.catType, 0);
                }
            }
        }
    }

    //显示小猫 操作界面 (外出、抚摸等),里面还是用 showPop 只是showPop 之前做了特殊处理 
    showCatUI(aimX, aimY) {
        let timeD = this.moveCameraTo_i(aimX, aimY);
        this.scaleCamera(true, (timeD > 0.4 ? timeD : 0.4));
        cc.dataMgr.userData.popType = "pop_catUI";
        this.node.runAction(cc.sequence(cc.delayTime(timeD), cc.callFunc(this.showPop, this)));
    }

    //显示小猫带回物品 并放置物品
    showCatTake() {
        if (cc.dataMgr.userData.showCatTake) {
            //判断小猫是存在的 且身上带的有礼物
            let catU = cc.dataMgr.userData.catData[cc.dataMgr.userData.showCatTake];
            if (catU && catU.backTake) {
                cc.dataMgr.userData.popType = "pop_catTake";
                this.showPop();
            } else
                cc.dataMgr.userData.showCatTake = null;
        }
    }

    //一直小猫 外出了 需要再这里隐藏外出小猫、刷新下面寻找
    oneCatOut(catKey) {
        for (let i = 0; i < this.root_cat.children.length; ++i) {
            let nodeN = this.root_cat.children[i];
            if (nodeN.name == "node_cat" && nodeN.active && nodeN.catKey) {
                if (nodeN.catKey == catKey) {
                    //出去的就是这只猫
                    nodeN.getComponent("NodeCat").catOut();
                    break;
                }
            } else
                nodeN.action = false;
        }

        //0.8 秒后 隐藏catUI; 刷新catOut
        this.root_cat.runAction(cc.sequence(cc.delayTime(0.4), cc.callFunc(this.callOutOver, this)));
        cc.dataMgr.saveData();
    }

    callOutOver() {
        cc.dataMgr.userData.popType = null;
        this.showPop();
        this.node_catOut.getComponent("NodeCatOut").addOneCatOut();
    }

    //移动镜头到小猫的位置
    moveToCatPos(catKey) {
        let catU = cc.dataMgr.userData.catData[catKey];
        if (catU) {
            if (catU.atRoomIdx != cc.dataMgr.userData.atRoomIdx) {
                this._moveCatKey = catKey;
                cc.dataMgr.userData.atRoomIdx = catU.atRoomIdx;
                let time = this.chageAction_i();
                this.node.runAction(cc.sequence(cc.delayTime(time), cc.callFunc(this.callMoveToCat, this)));
            } else {
                let posCat = this.getCatPosNow_v2(catKey);
                if (posCat) {
                    let timeT = this.moveCameraTo_i(posCat.x, posCat.y);
                    this.node.runAction(cc.sequence(cc.delayTime(timeT), cc.callFunc(this.refreshCatPoint, this)));
                }
            }
        }
    }

    callMoveToCat() {
        if (this._moveCatKey) {
            this.moveToCatPos(this._moveCatKey);
            this._moveCatKey = null;
        }
    }

    //添加 触摸小猫的效果
    addTouchEffect() {
        //找到 那只猫 
        let node_cat = null;
        for (let i = 0; i < this.root_cat.children.length; ++i)
            if (this.root_cat.children[i].catKey == cc.dataMgr.userData.touchCatName)
                node_cat = this.root_cat.children[i];
        if (node_cat && (cc.dataMgr.userData.onTouchCat == "shower" || cc.dataMgr.userData.onTouchCat == "touch")) {
            // 猫的 大小是 160 * 160 
            let nodeN = cc.instantiate(this.pre_effect);
            node_cat.addChild(nodeN);
            nodeN.getComponent("NodeEffect").initEffect(cc.dataMgr.userData.onTouchCat, null);
        }
    }

    //添加一波 金币 或 宝石
    addWaveEffect(isGold, num) {
        if (typeof (num) != "number")
            num = 1;
        if (isGold) {
            let addNum = parseInt(num / 10);
            if (addNum > 30)
                addNum = 30
            for (let i = 0; i < addNum; ++i)
                this.addOneEffect("flyGold", 10, Math.random() * 200 - 100, Math.random() * 200 - 100, i);
            this.addOneEffect("flyGold", num - addNum * 10, Math.random() * 200 - 100, Math.random() * 200 - 100, addNum);
        } else {
            let addNum = num;
            if (addNum > 30) {
                this.addOneEffect("flyGems", addNum - 30, Math.random() * 200 - 100, Math.random() * 200 - 100, 0);
                addNum = 30;
            }
            for (let i = 0; i < addNum; ++i)
                this.addOneEffect("flyGems", 1, Math.random() * 200 - 100, Math.random() * 200 - 100, i);
        }
    }

    //添加一个特殊 效果
    addOneEffect(type, num, posX, posY, index) {
        let nodeN = cc.instantiate(this.pre_effect);
        if (type == "takeGold") {
            let nodeRoot = this.roomArr[cc.dataMgr.userData.atRoomIdx];
            if (nodeRoot)
                nodeRoot.addChild(nodeN);
        } else
            this.root_effect.addChild(nodeN);
        nodeN.setPosition(posX, posY);
        nodeN.getComponent("NodeEffect").initEffect(type, num, index);
    }

    //显示金猫
    showGoldCat() {
        if (cc.dataMgr.userData.leadStep < 0) {
            let showCat = false;
            let secondNow = cc.dataMgr.getTimeSecond_i();
            //金猫现实 和 隐藏
            if (cc.dataMgr.userData.goldCat.atRoomIdx == cc.dataMgr.userData.atRoomIdx) {
                if (cc.dataMgr.userData.goldCat.nextBeginTime < secondNow || getTimeSecond_i() - toolsQQ.goldCatBegin < 12) {
                    showCat = true;
                }
            }
            if (!this.node_goldCat.active && showCat) {
                this.node_goldCat.position = cc.v2((Math.random() - 0.5) * 720, Math.random() * -360);
                //广告
                this.node_goldCat.getChildByName("ui_adVideo").active = false;
                toolsQQ.showGoldCatAd = false;
            }
            this.node_goldCat.active = showCat;

            if (toolsQQ.goldCatBegin <= getTimeSecond_i() - 12 && toolsQQ.goldCatBegin != 0) {
                this.callGoldCatHide();
            }
        } else
            this.node_goldCat.active = false;
    }

    //判断金猫出现 和 消失
    goldCatTouched() {
        //判断非法时间
        if (cc.dataMgr.userData.leadStep < 0) {
            console.log("-- goldCatTouch -- " + typeof (toolsQQ.goldCatBegin) + " -- " + toolsQQ.goldCatBegin);
            //记录第一次点的时间
            if (this.node_goldCat.active && toolsQQ.goldCatBegin == 0) {
                toolsQQ.goldCatBegin = getTimeSecond_i();
            }

            let adVideoAct = this.node_goldCat.getChildByName("ui_adVideo").active;
            if (adVideoAct && !toolsQQ.showGoldCatAd) {
                //这里要看广告了
                playQQAdVideo("adGoldCat");
            }
            //满足这个条件加金币
            else if (this.node_goldCat.active && cc.dataMgr.userData.atRoomIdx == cc.dataMgr.userData.goldCat.atRoomIdx && getTimeSecond_i() - toolsQQ.goldCatBegin < 12)
                this.addOneEffect("flyGold", 1, this.node_goldCat.x - this.camera.x + (Math.random() - 0.5) * 180, this.node_goldCat.y + this.camera.y + (Math.random() - 0.5) * 180, 0);

            //显示广告 小图标
            if (getTimeSecond_i() - toolsQQ.goldCatBegin > 9 && !toolsQQ.showGoldCatAd)
                this.node_goldCat.getChildByName("ui_adVideo").active = true;

            this.showGoldCat();
        }
    }

    callGoldCatHide() {
        //随机 下一次开始的时间
        if (toolsQQ.goldCatBegin != 0) {
            toolsQQ.goldCatBegin = 0;
            cc.dataMgr.userData.goldCat.nextBeginTime = getTimeSecond_i() + 7200;
            cc.dataMgr.userData.goldCat.atRoomIdx = Math.floor(Math.random() * cc.dataMgr.userData.haveRoom.length);
            cc.dataMgr.saveData();
        }
        this.node_goldCat.active = false;
    }

    //------ 镜头 和 移动镜头相关 ------

    //缩放镜头
    scaleCamera(isScale, timeT) {
        let beginZoom = this.camera.getComponent(cc.Camera).zoomRatio;
        let changeZoom = 0;
        if (isScale) {
            //changeZoom = 1.64 - beginZoom;
            changeZoom = 1.28 - beginZoom;
        } else {
            changeZoom = 1 - beginZoom;
            //在拉远镜头的时候 把那只站立的猫 趴下
            for (let i = 0; i < this.root_cat.children.length; ++i) {
                let nodeN = this.root_cat.children[i];
                let nodeJs = nodeN.getComponent("NodeCat");
                if (nodeJs && nodeJs._actType == "stand")
                    nodeJs.changeCatAct("random");
            }
        }
        let action = cc.delayTime(timeT);
        action.changeZoom = changeZoom;
        action.beginZoom = beginZoom;
        action.update = function (dt) {
            let node = action.getTarget();
            if (node && node.getComponent(cc.Camera)) {
                node.getComponent(cc.Camera).zoomRatio = this.beginZoom + dt * this.changeZoom;
            }
        };
        this.camera.runAction(action);
    }

    //移动到具体位置返回一个延时便于 放置物品的顺序执行
    moveCameraTo_i(aimX, aimY) {
        let addPos = this.getAddPosition_v2(aimX - this.camera.x, aimY - this.camera.y);
        let timeT = addPos.mag() / this._moveSpeed;
        this.camera.stopAllActions();
        this.camera.runAction(cc.moveTo(timeT, cc.v2(this.camera.x + addPos.x, this.camera.y + addPos.y)));
        return timeT;
    }

    //返回一个延时便于 放置物品的顺序执行
    chageAction_i() {
        let delayT = 0.6;
        this.node_action.active = true;
        let node_mask = this.node_action.getChildByName("node_mask");
        node_mask.stopAllActions();
        //mask 原生平台不能用 cc.show() 和 cc.hide();
        node_mask.runAction(cc.sequence(this.mySizeTo_act(delayT, cc.dataMgr.canvasH), cc.callFunc(this.showRoom, this)));

        let spr_cat = this.node_action.getChildByName("spr_cat");
        spr_cat.scale = 0;
        spr_cat.stopAllActions();
        spr_cat.runAction(cc.sequence(cc.delayTime(delayT - 0.2), cc.scaleTo(0.4, 1.5), cc.delayTime(0.5), cc.scaleTo(0.3, 0), cc.callFunc(this.callActionOver, this)));

        return delayT + 0.4 + 0.5 + 0.3;
    }

    callActionOver() {
        let node_mask = this.node_action.getChildByName("node_mask");
        node_mask.width = cc.dataMgr.canvasH;
        node_mask.height = cc.dataMgr.canvasH;

        this.node_action.active = false;
    }

    mySizeTo_act(timeT, sizeBase) {
        let action = cc.delayTime(timeT);
        action.sizeBase = sizeBase;
        action.update = function (dt) {
            let node = action.getTarget();
            if (cc.isValid(node)) {
                node.width = cc.dataMgr.canvasH * (1 - dt);
                node.height = cc.dataMgr.canvasH * (1 - dt);
            }
        };
        return action;
    }

    //------ 获取一些位置 和 位置约束相关 ------

    //对目标距离进行约束
    getAddPosition_v2(addX, addY) {
        if (addX < -this._roomWidth / 2 + cc.dataMgr.canvasW / 2 - this.camera.x)
            addX = -this._roomWidth / 2 + cc.dataMgr.canvasW / 2 - this.camera.x;
        if (addX > this._roomWidth / 2 - cc.dataMgr.canvasW / 2 - this.camera.x)
            addX = this._roomWidth / 2 - cc.dataMgr.canvasW / 2 - this.camera.x;
        if (addY < -this._roomHeight / 2 + cc.dataMgr.canvasH / 2 - this.camera.y)
            addY = -this._roomHeight / 2 + cc.dataMgr.canvasH / 2 - this.camera.y;
        if (addY > this._roomHeight / 2 - cc.dataMgr.canvasH / 2 - this.camera.y)
            addY = this._roomHeight / 2 - cc.dataMgr.canvasH / 2 - this.camera.y;
        return cc.v2(addX, addY);
    }

    //获取显示的point 的位置
    getPointPos_v2(catKey) {
        let pos = cc.v2(0, 0);
        let posCat = this.getCatPosNow_v2(catKey);
        if (posCat && (posCat.x < this.camera.x - cc.dataMgr.canvasW / 2 - 100 || posCat.x > this.camera.x + cc.dataMgr.canvasW / 2 + 100)) {
            pos.x = (this.camera.x > posCat.x ? -1 : 1) * (cc.dataMgr.canvasW / 2 - 60);
            pos.y = posCat.y / (this._roomWidth / 2) * 480;
        }
        return pos;
    }

    //对小猫出现位置进行约束
    getOneCatPos_v2() {
        let pos = cc.v2(0, 0);
        if (cc.dataMgr.userData.atRoomIdx < this.roomArr.length) {
            //第一只免费的猫咪
            if (cc.dataMgr.userData.leadStep >= 0) {
                pos = cc.v2(0, -80);
                return pos;
            }
            let roomD = cc.dataMgr.gameData.roomData[cc.dataMgr.userData.atRoomIdx];
            if (roomD) {
                let posD = roomD.catPos;
                let length = posD.length;
                console.log("-- getOneCatPos_v2 --" + length);

                let randomB = Math.floor(Math.random() * length);
                if (randomB >= length)
                    randomB -= length;

                for (let i = 0; i < length; ++i) {
                    let idx = i + randomB;
                    if (idx >= length)
                        idx -= length;
                    let posN = posD[idx];
                    let noCat = true;
                    for (let j = 0; j < this.root_cat.children.length; ++j) {
                        let nodeN = this.root_cat.children[j];
                        if (nodeN.active && nodeN.name == "node_cat") {
                            let disPos = cc.v2(posN.x - nodeN.x, posN.y - nodeN.y);
                            if (disPos.mag() < 100) {
                                noCat = false;
                                break;
                            }
                        }
                    }
                    if (noCat) {
                        pos.x = posN.x;
                        pos.y = posN.y;
                        break;
                    }
                }
            }
        }
        // console.log("-- 获得一个pos -- " + pos.x + " -- " + pos.y);
        return pos;
    }

    //获取一只猫咪当前的位置
    getCatPosNow_v2(catKey) {
        let posCat = null;
        for (let i = 0; i < this.root_cat.children.length; ++i) {
            let nodeN = this.root_cat.children[i];
            if (nodeN.active && nodeN.catKey && nodeN.catKey == catKey) {
                posCat = nodeN.position;
                break;
            }
        }
        return posCat;
    }

    //获取一个 clean 的位置。
    getOneCleanPos_v2() {
        let pos = cc.v2(0, 0);
        let maxY = 300;
        if (cc.dataMgr.userData.atRoomIdx == 0)
            maxY = 0;

        pos.x = (Math.random() - 0.5) * this._roomWidth;
        pos.y = -Math.random() * this._roomHeight / 2 + Math.random() * maxY;
        return pos;
    }

    getThingsFrame_sf(thingsKey) {
        //console.log("-- 获取 frame -- " + thingsKey)
        let sf = this.atlas_wupin.getSpriteFrame(thingsKey);
        if (!sf)
            sf = this.atlas_wupin.getSpriteFrame("miss");
        return sf;
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            let btnN = event.target.name;
            console.log("-- onClickBtn Game --" + btnN);
            if (!cc.dataMgr.userData.onTouchCat) {
                cc.audioMgr.playEffect("btn_click");
                if (btnN == "node_coins") {
                    //点了更多金币
                    cc.dataMgr.userData.popType = "pop_store";
                    this.showPop();
                } else if (btnN == "btn_house") {
                    cc.dataMgr.userData.popType = "pop_room";
                    this.showPop();

                    tools_login();
                } else if (btnN == "btn_book") {
                    cc.dataMgr.userData.popType = "pop_book";
                    this.showPop();
                } else if (btnN == "node_pos") {
                    let catKey = event.target.catKey;
                    console.log("-- camera 移到 -- " + catKey);
                    if (catKey) {
                        this.moveToCatPos(catKey);
                    }
                    cc.audioMgr.playEffect("btn_click");
                } else if (btnN == "yard_070" || btnN == "hall_056") {
                    //这里是点到了宝石狗狗
                    cc.dataMgr.userData.popType = "pop_dog";
                    this.showPop();
                } else if (btnN == "btn_newCat") {
                    if (cc.dataMgr.userData.leadStep == 14)
                        cc.find("Canvas").getComponent("NodeLead").changeToNextStep(14);
                    else {
                        cc.dataMgr.userData.popType = "pop_newCat";
                        this.showPop();

                        if (cc.dataMgr.userData.leadStep == 15 || cc.dataMgr.userData.leadStep == 14)
                            cc.find("Canvas").getComponent("NodeLead").hideTalk();

                    }
                } else if (btnN == "shack_020") {
                    //保险箱
                    cc.dataMgr.userData.popType = "pop_box";
                    this.showPop();
                } else if (btnN == "btn_adClean") {
                    this.node.getChildByName("node_top").getChildByName("btn_adClean").active = false;
                    playQQAdVideo("adClean");
                }
            }
        }
    }
}