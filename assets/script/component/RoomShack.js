const {
    ccclass,
    property
} = cc._decorator;

@ccclass
export default class RoomShack extends cc.Component {
    @property(cc.Node)
    node_wupin = null;
    @property(cc.Node) //初始-90
    node_light = null;

    _roomIdx = 0; //这是那个房间

    _isAddThings = false;

    onLoad() {

    }

    initRoom() {
        if (this.node_light.active) {
            this.node_light.stopAllActions();
            let rota1 = cc.rotateTo(2.4, -75);
            //rota1.easing(cc.easeBackIn());
            let rota2 = cc.rotateTo(2.4, -105);
            //rota2.easing(cc.easeBackIn());
            this.node_light.runAction(cc.repeatForever(cc.sequence(rota1, rota2)));
        }
    }
}