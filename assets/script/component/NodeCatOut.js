const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class NodeCatOut extends cc.Component {
    /**
     * 最多只有三个猫咪外出,所以预先放置了三个控件
     */

    @property(cc.Prefab)
    pre_oneOut = null;

    onLoad() {

    }

    start() {

    }

    showOut() {
        this.node.active = true;
        this.node.stopAllActions();
        let posX = cc.dataMgr.canvasW / 2;
        this.node.runAction(cc.moveTo(0.3, cc.v2(posX, 0)));
    }

    downOut() {
        this.node.stopAllActions();
        let posX = cc.dataMgr.canvasW / 2 + 150;
        this.node.runAction(cc.moveTo(0.3, cc.v2(posX, 0)));
    }

    hideOut() {
        this.node.stopAllActions();
        let posX = cc.dataMgr.canvasW / 2 + 210;
        this.node.runAction(cc.sequence(cc.moveTo(0.4, cc.v2(posX, 0)), cc.callFunc(this.scaleEnd, this)));
    }

    //inOut 0:没出去,1:出去了,2:出去已经回来了
    addOneCatOut() {
        let outArr = cc.dataMgr.getOutCat_arr();
        console.log("-- addOneCatOut 新走一只猫 --");
        if (outArr && outArr.length > 0) {
            //找到那一只新出去的猫
            for (let i = 0; i < this.node.children.length; ++i) {
                let nodeN = this.node.children[i];
                if (nodeN.active && nodeN.catKey) {
                    let idx = outArr.indexOf(nodeN.catKey);
                    if (idx >= 0)
                        outArr.splice(idx, 1);
                }
            }
            console.log(outArr);
            for (let i = 0; i < outArr.length; ++i) {
                let catKey = outArr[i];
                // let nodeOne = cc.instantiate(this.pre_oneOut);
                // this.node.addChild(nodeOne);
                // nodeOne.getComponent("NodeOneOut").initOneOut(catKey);
                for (let j = 0; j < this.node.children.length; ++j) {
                    let nodeN = this.node.children[j];
                    if (!nodeN.active || !nodeN.catKey) {
                        nodeN.active = true;
                        nodeN.getComponent("NodeOneOut").initOneOut(catKey);
                        nodeN.catKey = catKey;
                        break;
                    }
                }
            }
        }
    }

    scaleEnd() {
        this.node.active = false;
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            let btnN = event.target.name;
            console.log("-- onClickBtn NodeCatOut --" + btnN);
            if (btnN == "") {

            }
        }
    }
}