const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioMgr extends cc.Component {

    _audioSource_o = null;

    onLoad() {
        cc.game.on(cc.game.EVENT_HIDE, function () {
            console.log("cc.audioEngine.pauseAll");
            cc.audioEngine.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("cc.audioEngine.resumeAll");
            cc.audioEngine.resumeAll();

            cc.audioMgr.playBg();
        });

        this.init();
    }

    init() {
        this._audioSource_o = {};
        let node_sound = cc.find("Canvas/node_sound");
        if (node_sound) {
            for (let i = 0; i < node_sound.children.length; ++i) {
                let nodeN = node_sound.children[i];
                this._audioSource_o[nodeN.name] = nodeN.getComponent(cc.AudioSource);
            }
        }
    }

    //type_s 为这个音乐的名称
    playEffect(type_s) {
        if (cc.dataMgr.userData.playEffect) {
            let source = this._audioSource_o[type_s];
            if (source) {
                source.play();
            }
        }
    }

    stopEffect(type_s) {
        let source = this._audioSource_o[type_s];
        if (source) {
            source.stop();
        }
    }

    playBg() {
        if (cc.dataMgr.userData.playBg) {
            let source = this._audioSource_o["bg"];
            if (source) {
                source.play();
            }
        }
    }

    stopBg() {
        let source = this._audioSource_o.bg;
        if (source) {
            source.pause();
        }
    }

    pauseAll() {
        cc.audioEngine.pauseAll();
    }

    resumeAll() {
        cc.audioEngine.resumeAll();
    }
}