const {
    ccclass,
    property
} = cc._decorator;

@ccclass
export default class NodePool extends cc.Component {

    //小池塘 冒泡
    @property(cc.Prefab)
    pre_effect = null;

    onLoad() {

    }

    start() {
        this.schedule(this.createPool, 1);
    }

    //游泳池,创建泡泡
    createPool() {
        if (this.node.active) {
            let nodeN = cc.instantiate(this.pre_effect);
            this.node.addChild(nodeN);
            nodeN.getComponent("NodeEffect").initEffect("pool", null);
            nodeN.position = cc.v2(Math.random() * 120 - 60, 10);
        }
    }
}