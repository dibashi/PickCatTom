const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class NodeDragon extends cc.Component {
    /**已废弃不用了。 */

    @property(dragonBones.DragonBonesAsset)
    cat001_ske = null;
    @property(dragonBones.DragonBonesAtlasAsset)
    cat001_tex = null;

    @property(dragonBones.DragonBonesAsset)
    cat002_ske = null;
    @property(dragonBones.DragonBonesAtlasAsset)
    cat002_tex = null;

    @property(dragonBones.DragonBonesAsset)
    cat003_ske = null;
    @property(dragonBones.DragonBonesAtlasAsset)
    cat003_tex = null;

    @property(dragonBones.DragonBonesAsset)
    cat004_ske = null;
    @property(dragonBones.DragonBonesAtlasAsset)
    cat004_tex = null;

    @property(dragonBones.DragonBonesAsset)
    cat005_ske = null;
    @property(dragonBones.DragonBonesAtlasAsset)
    cat005_tex = null;

    _dragonSke = {
        "cat-0": "cat001_ske",
        "cat-1": "cat002_ske",
        "cat-2": "cat003_ske",
        "cat-3": "cat004_ske",
        "cat-4": "cat005_ske",
    }

    _dragonTex = {
        "cat-0": "cat001_tex",
        "cat-1": "cat002_tex",
        "cat-2": "cat003_tex",
        "cat-3": "cat004_tex",
        "cat-4": "cat005_tex",
    }

    _catType = null;

    onLoad() {

    }

    start() {

    }

    initDragon(catType, armature, times) {
        // console.log(armature + "-- 换肤了 --" + catType + "--" + this._catType);
        let dragSke = this._dragonSke[catType];
        let dragTex = this._dragonTex[catType];
        if (dragSke && dragTex && this._catKey != catType) {
            this._catType = catType;
            this.node.getComponent(dragonBones.ArmatureDisplay).dragonAsset = this[dragSke]
            this.node.getComponent(dragonBones.ArmatureDisplay).dragonAtlasAsset = this[dragTex];
        }
        this.node.getComponent(dragonBones.ArmatureDisplay).armatureName = armature;
        this.node.getComponent(dragonBones.ArmatureDisplay).playAnimation(armature, times);
    }
}