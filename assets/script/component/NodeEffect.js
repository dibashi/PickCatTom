const {
    ccclass,
    property
} = cc._decorator;

@ccclass
export default class NodeEffect extends cc.Component {

    /*
    一些效果 type(单个精灵实现可以实现的):
        -- 需要代码控制的飞行等效果 --
        flyGold:一个金币飞到左上角
        flyGems:一个宝石飞到左上角
        takeGold:点击之后变成飞的飞到上边  需要加单点触摸
        touch:触摸小猫产生的 心型

        -- 结束时需播放的效果
        shower:小猫洗澡 (结束时替换为 showerEnd)
        pool:气泡 (结束时替换为 poolEnd)    需要加单点触摸
        goldCat:金色小猫    需要加单点触摸

        -- 一直播放的效果 --
        clean:小猫产生的金币(一个图集)  需要加单点触摸
        catData:小猫来源图片
        catHead:小猫头像
        goldCatBg:金色小猫背景
        catOut:小猫外出  
    */

    @property(cc.SpriteFrame) //金币图片(飞向金币UI的图片)
    flyGold = null;
    @property(cc.SpriteFrame) //宝石图片
    flyGems = null;
    @property(cc.SpriteFrame) //金币图片
    takeGold = null;
    @property(cc.SpriteFrame) //💗心,触摸小猫的效果
    touch = null;

    @property(cc.SpriteFrame) //洗澡泡泡
    shower = null;
    @property(cc.SpriteFrame) //洗澡泡泡爆炸的图片
    showerEnd = null;
    @property(cc.SpriteFrame) //泡泡图片
    pool = null;
    @property(cc.SpriteFrame) //泡泡爆炸的图片
    poolEnd = null;
    @property(cc.SpriteFrame) //金猫图片
    goldCat = null;
    @property(cc.SpriteFrame) //金猫被触摸时的图片
    goldCatTouch = null;

    @property(cc.SpriteAtlas) //便便所在图集
    clean = null;

    _type = null; //这个效果的类型
    _isAlive = true; //这个控件是否活着
    _data = 0; //附加数据 金币时数量

    _isTouch = false; //是否点中了( 水池中用到了)

    _aimPos = cc.v2(-250, 500);

    onLoad() {
        if (this.node.name == "spr_goldCat") {
            this.initEffect("goldCat", 1, 0);
        }
    }

    start() {
        this._aimPos = cc.v2(-cc.dataMgr.canvasW / 2 + 160, cc.dataMgr.canvasH / 2 - 90 - 60);
    }

    //类型、数据、第几个(这一波中的第几个)
    initEffect(type, data, indexNum) {
        // console.log("-- initEffect -- " + type + "--" + data + "--" + indexNum);
        this._type = type;
        if (type != "catHead")
            this._data = data;

        if (type == "flyGold") {
            this.node.scale = 0.72;
            this.node.getComponent(cc.Sprite).spriteFrame = this.flyGold;

            if (indexNum > 0)
                this.node.runAction(cc.sequence(cc.hide(), cc.delayTime(indexNum * 0.14), cc.show(), cc.moveTo(0.2 + Math.random() * 0.5, this._aimPos), cc.callFunc(this.callShowEnd, this)));
            else
                this.node.runAction(cc.sequence(cc.moveTo(0.2 + Math.random() * 0.5, this._aimPos), cc.callFunc(this.callShowEnd, this)));
        } else if (type == "flyGems") {
            this.node.scale = 0.4;
            this.node.getComponent(cc.Sprite).spriteFrame = this.flyGems;

            let delayT = 0.1;
            if (indexNum > 0)
                delayT = 0.1 * indexNum + 0.1;
            this.node.runAction(cc.sequence(cc.delayTime(delayT), cc.moveTo(0.2 + Math.random() * 0.5, this._aimPos), cc.callFunc(this.callShowEnd, this)));
        } else if (type == "takeGold") {
            this.node.getComponent(cc.Sprite).spriteFrame = this.takeGold;
            this.addTouch();
            this.node.scale = 0.7;
        } else if (type == "touch") {
            this.node.scale = (Math.random() * 0.4 + 0.2);

            this.node.getComponent(cc.Sprite).spriteFrame = this.touch;

            let aimY = Math.random() * 500 + 180;
            this.node.runAction(cc.sequence(cc.moveBy(aimY / 240 + Math.random(), cc.v2(0, aimY)), cc.callFunc(this.callShowEnd, this)));

            // 猫的 大小是 160 * 160  设置位置
            this.node.position = cc.v2(Math.random() * 160 - 80, Math.random() * 160 - 40);
        } else if (type == "shower") {
            this.node.scale = (Math.random() * 0.4 + 0.2);

            this.node.getComponent(cc.Sprite).spriteFrame = this.shower;
            this.node.runAction(cc.sequence(cc.delayTime(0.4 + Math.random() * 1.2), cc.callFunc(this.callShowEnd, this)));

            // 猫的 大小是 160 * 160  设置位置
            this.node.position = cc.v2(Math.random() * 160 - 80, Math.random() * 80);
        } else if (type == "pool") {
            this.node.getComponent(cc.Sprite).spriteFrame = this.pool;
            let aimY = Math.random() * 500 + 450;
            this.node.runAction(cc.sequence(cc.moveBy(aimY / (80 + Math.random() * 100), cc.v2(0, aimY)), cc.callFunc(this.callShowEnd, this)));
            this.addTouch();
        } else if (type == "goldCat") {
            this.node.getComponent(cc.Sprite).spriteFrame = this.goldCat;
            this.addTouch();
        } else if (type == "clean") {
            //播放 effect_clean 动画 1~9 (点中后变成 flyGold)
            let index = parseInt(Math.random() * 9) + 1;
            let sf = this.clean.getSpriteFrame("poop_sprites_0" + index);
            if (!sf)
                sf = this.clean.getSpriteFrame("poop_sprites_06");
            this.node.getComponent(cc.Sprite).spriteFrame = sf;
            this.node.getComponent(cc.Animation).play("effect_clean");
            this.addTouch();
        } else if (type == "catData") {
            let catD = cc.dataMgr.gameData.catData[this._data];
            if (catD) {
                let frameN = catD.cardPicture;
                let sf = this.clean.getSpriteFrame(frameN);
                if (!sf)
                    sf = this.clean.getSpriteFrame("men_cat-0");
                this.node.getComponent(cc.Sprite).spriteFrame = sf;
            }
        } else if (type == "catHead") {
            if (!this._data || this._data != data) {
                this._data = data;
                //plist 文件这个两个弄反了，要交换一下
                if (this._data == "cat-2")
                    this._data = "cat-3";
                else if (this._data == "cat-3")
                    this._data = "cat-2";
                let frameN = "list_" + this._data;
                let sf = this.clean.getSpriteFrame(frameN);
                if (!sf)
                    sf = this.clean.getSpriteFrame("list_cat");
                this.node.getComponent(cc.Sprite).spriteFrame = sf;
            }
        } else if (type == "goldCatBg") {
            //播放 effect_goldCatBg
            this.node.getComponent(cc.Animation).play("effect_goldCatBg");
        } else if (type == "catOut") {
            //根据 data 播放不同的 动画 暂时只做了一只猫咪的动画
            if (this._data && cc.dataMgr.gameData.catType.indexOf(this._data) >= 0)
                this.node.getComponent(cc.Animation).play("effect_" + this._data);
            else
                this.node.getComponent(cc.Animation).play("effect_cat-0");
        }
    }

    //添加触摸效果
    addTouch() {
        let self = this;
        this.node.on(cc.Node.EventType.TOUCH_START, function (touch) {
            if (self._isAlive) {
                self._isTouch = true;
                if (self._type == "takeGold") {
                    self.changeToFly();
                } else if (self._type == "pool") {
                    cc.audioMgr.playEffect("pop_close");
                    self.callShowEnd();
                } else if (self._type == "goldCat") {
                    //点了一下金猫 要出金币了
                    self.node.getComponent(cc.Sprite).spriteFrame = self.goldCatTouch;
                } else if (self._type == "clean") {
                    self.node.getComponent(cc.Animation).stop("effect_clean");
                    self.changeToFly();
                    cc.dataMgr.userData.countClean++;
                }
            }
        }, this.node);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (touch) {

        }, this.node);
        this.node.on(cc.Node.EventType.TOUCH_END, function (touch) {
            if (self._type == "goldCat") {
                self.node.getComponent(cc.Sprite).spriteFrame = self.goldCat;
                let gameJs = cc.find("Canvas").getComponent("Game");
                if (gameJs)
                    gameJs.goldCatTouched();
            }
        }, this.node);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function (touch) {
            if (self._type == "goldCat") {
                self.node.getComponent(cc.Sprite).spriteFrame = self.goldCat;
            }
        }, this.node);
    }

    //变成飞翔的金币
    changeToFly() {
        cc.audioMgr.playEffect("coins");

        //看广告一个小时内金币加倍
        if (this._type == "clean") {
            if (getTimeSecond_i() - 3600 < toolsQQ.cleaneTimeBegin)
                this._data = 2;
        }

        this._isAlive = true;
        this._type = "flyGold";
        if (this._data <= 0)
            this._data = 1;
        this.node.scale = 0.72;

        let aimPos = cc.v2(this._aimPos.x, this._aimPos.y);
        let camera = cc.find("Canvas/camera");
        if (camera) {
            let cameraPos = camera.position;
            let disPos = cc.v2(cameraPos.x - this.node.parent.x, cameraPos.y - this.node.parent.y)
            aimPos.x += disPos.x;
            aimPos.y += disPos.y;
        }
        this.node.stopAllActions();
        this.node.getComponent(cc.Sprite).spriteFrame = this.flyGold;
        this.node.runAction(cc.sequence(cc.moveTo(0.2 + Math.random() * 0.5, aimPos), cc.callFunc(this.callShowEnd, this)));
    }

    //显示结束 需要加金币的加金币 和 一些特殊效果处理
    callShowEnd() {
        if (this._isAlive) {
            this._isAlive = false;
            if (this._type == "shower") {
                this.node.getComponent(cc.Sprite).spriteFrame = this.showerEnd;
                this.node.runAction(cc.sequence(cc.delayTime(0.1), cc.removeSelf(), cc.callFunc(this.callDestory, this)));
            } else if (this._type == "pool") {
                if (this._isTouch)
                    ++cc.dataMgr.userData.countPool;
                //所有 统计 用的都是这一个变量, 需要区分
                if (cc.dataMgr.userData.countPool >= 4 && !cc.dataMgr.userData.gameType) {
                    cc.dataMgr.userData.countPool = 0;
                    this.changeToFly();
                    return;
                } else {
                    this.node.getComponent(cc.Sprite).spriteFrame = this.poolEnd;
                    this.node.runAction(cc.sequence(cc.delayTime(0.1), cc.removeSelf(), cc.callFunc(this.callDestory, this)));
                }
            } else
                this.node.runAction(cc.sequence(cc.removeSelf(), cc.callFunc(this.callDestory, this)));

            if (this._type == "flyGold") {
                if (this._data > 0)
                    cc.dataMgr.changeCoins_b(this._data);
                if (this._data > 5) {
                    //这里是 小猫得到的金币
                    cc.audioMgr.playEffect("coins");
                }
            } else if (this._type == "flyGems") {
                if (this._data > 0)
                    cc.dataMgr.changeGems_b(this._data);
                cc.audioMgr.playEffect("coins");
            }
        }
    }

    //销毁节点
    callDestory() {
        if (cc.isValid(this.node)) {
            this.node.destroy();
        }
    }
}