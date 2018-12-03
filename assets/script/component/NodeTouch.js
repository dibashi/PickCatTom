const {
    ccclass,
    property
} = cc._decorator;

@ccclass
export default class NodeTouch extends cc.Component {
    /**
     * 触摸猫咪的小手,喂食的鱼,🛀洗澡的澡巾 等绑定的都是这个脚本
     */

    _touchBegin = null;

    _beginTime = null;

    onLoad() {

    }

    start() {
        let self = this;
        this.node.on(cc.Node.EventType.TOUCH_START, function (touch) {
            self._touchBegin = touch.getLocation();
            self._beginTime = cc.dataMgr.getTimeSecond_i();
        }, this.node);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (touch) {
            let touchPos = touch.getLocation();
            if (self._touchBegin) {
                let disX = touchPos.x - self._touchBegin.x;
                let disY = touchPos.y - self._touchBegin.y;
                self.node.setPosition(cc.v2(self.node.x + disX, self.node.y + disY));
            }
            self._touchBegin = touchPos;

            //如果是在吃东西,间隔一秒改变一次图片
            if (self.node.name == "node_eat") {
                let disTime = cc.dataMgr.getTimeSecond_i() - self._beginTime;
                for (let i = 0; i < self.node.children.length; ++i) {
                    let nodeN = self.node.children[i];
                    if (nodeN.name - disTime > 0)
                        nodeN.active = true;
                    else {
                        if (nodeN.active) {
                            cc.audioMgr.playEffect("cat_eat");
                        }
                        nodeN.active = false;
                    }
                }
            }
        }, this.node);
        this.node.on(cc.Node.EventType.TOUCH_END, function (touch) {
        }, this.node);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function (touch) {

        }, this.node);
    }
}