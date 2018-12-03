const {
    ccclass,
    property
} = cc._decorator;

@ccclass
export default class NodeRollBg extends cc.Component {
    /*
        无缝衔接滚动脚本
     */

    @property(cc.Node)
    spr_bg1 = null;
    @property(cc.Node)
    spr_bg2 = null;

    @property(Number)
    speed = 240;//滚动的速度
    @property(Number)
    spr_height = 1280;

    onLoad() {
        this.beginRoll();
    }

    beginRoll() {
        this.spr_bg1.stopAllActions();
        this.spr_bg2.stopAllActions();

        //如果是1280 就是 canvasH
        if (this.spr_height >= 1280)
            this.spr_height = cc.dataMgr.canvasH;
        this.spr_bg1.height = this.spr_height;
        this.spr_bg2.height = this.spr_height;

        //-1为了保证无缝
        let width = this.spr_bg1.width - 1;
        this.spr_bg1.x = 0;
        this.spr_bg2.x = width;
        this.spr_bg1.runAction(cc.sequence(cc.moveTo(width / this.speed, cc.v2(-width, this.spr_bg1.y)), cc.callFunc(this.callBackBegin1, this)));
        this.callBackBegin2();
    }

    callBackBegin1() {
        let width = this.spr_bg1.width - 1;
        this.spr_bg1.x = width;
        this.spr_bg1.runAction(cc.sequence(cc.moveTo(width * 2 / this.speed, cc.v2(-width, this.spr_bg1.y)), cc.callFunc(this.callBackBegin1, this)));
    }

    callBackBegin2() {
        let width = this.spr_bg2.width - 1;
        this.spr_bg2.x = width;
        this.spr_bg2.runAction(cc.sequence(cc.moveTo(width * 2 / this.speed, cc.v2(-width, this.spr_bg2.y)), cc.callFunc(this.callBackBegin2, this)));
    }
}