import DataMgr from 'DataMgr';
import AudioMgr from 'AudioMgr';
const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class Loading extends cc.Component {

    @property(cc.Node)
    spr_effect = null;

    @property(cc.Node)
    spr_loading = null;

    onLoad() {
    }

    start() {
        this.initData();

        let catType = cc.dataMgr.gameData.catType;
        let idx = Math.floor(Math.random() * catType.length);
        this.spr_effect.getComponent("NodeEffect").initEffect("catOut", catType[idx], 0);

        //进度条
        this.spr_loading.runAction(this.myRangeTo_act(8, 0, 0.4));

        cc.director.preloadScene("game", this.callLoadBack);
    }

    //预加载回调
    callLoadBack(ret) {
        console.log("--- loadBack ---");
        console.log(ret);
        let spr_loading = cc.find("Canvas/node_out/spr_loading");
        spr_loading.stopAllActions();
        let range = spr_loading.getComponent(cc.Sprite).fillRange;

        let rangeTo = function (timeT, beginRange, aimRange) {
            let action = cc.delayTime(timeT);
            action.beginRange = beginRange;
            action.aimRange = aimRange;
            action.update = function (dt) {
                let node = action.getTarget();
                if (node)
                    node.getComponent(cc.Sprite).fillRange = (this.beginRange + dt * (this.aimRange - this.beginRange));
            };
            return action;
        }

        spr_loading.runAction(cc.sequence(rangeTo(0.5, range, 0.5), cc.callFunc(function () {
            cc.director.loadScene("game");
        }, this)));
    }

    //字符串自动换行: 目标字符串、间隔多长换行
    getAutoChangeLine_str(aimStr, cutLength) {
        let strRet = null;
        if (typeof (aimStr) == "string") {
            let strLength = aimStr.length;
            for (let i = 0; i < Math.ceil(strLength / cutLength); ++i) {
                let strOne = aimStr.substr(i * cutLength, cutLength);
                if (strOne) {
                    if (!strRet)
                        strRet = strOne;
                    else
                        strRet = strRet + "\n" + strOne;
                }
            }
        }
        return strRet;
    }

    myRangeTo_act(timeT, beginRange, aimRange) {
        let action = cc.delayTime(timeT);
        action.beginRange = beginRange;
        action.aimRange = aimRange;
        action.update = function (dt) {
            let node = action.getTarget();
            if (node)
                node.getComponent(cc.Sprite).fillRange = (this.beginRange + dt * (this.aimRange - this.beginRange));
        };
        return action;
    }

    initData() {
        if (!cc.dataMgr) {
            //let DataMgr = require("DataMgr");
            cc.dataMgr = new DataMgr();
            cc.dataMgr.initData();

            //延迟一秒多,加载初始化广告
            // this.scheduleOnce(cc.dataMgr.initAD, 1.8);
        }
        if (!cc.audioMgr) {
            //let AudioMgr = require("AudioMgr");
            cc.audioMgr = new AudioMgr();
            cc.audioMgr.onLoad();
        }

        cc.dataMgr.canvasW = cc.find("Canvas").width;
        cc.dataMgr.canvasH = cc.find("Canvas").height;
    }

}