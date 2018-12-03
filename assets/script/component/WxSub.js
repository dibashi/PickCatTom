const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class RankingView extends cc.Component {

    @property(cc.Node) //显示微信子域排行
    sub_end = null;
    @property(cc.Node) //显示微信子域排行
    sub_list = null;

    @property(cc.Node) //结束界面
    node_end = null;
    @property(cc.Node) //好友列表和 群列表对应按钮
    node_list = null;
    @property(cc.Node) //查看群排行按钮
    btn_qun = null;

    _shareTicket = null;

    onLoad() {

    }

    start() {
        //微信子域相关
        this.initSubCanvas();
        this.schedule(this.updataSubCanvas, 0.5);

        console.log("--- 获取启动参数 ---");
        if (CC_WECHATGAME) {
            let obj = wx.getLaunchOptionsSync();
            console.log(obj);
            if (obj && obj.shareTicket) {
                this._shareTicket = obj.shareTicket;
                this.showGroup(this._shareTicket);
            }
        }
    }

    //end friend group 三个对应的层级
    showPanel(panelName) {
        if (panelName == "end") {
            this.node_end.active = true;
            this.node_list.active = false;
        } else if (panelName == "friend") {
            this.node_end.active = false;
            this.node_list.active = true;
            this.btn_qun.active = true;
            this.node_list.getChildByName("lab_friend").active = true;
            this.node_list.getChildByName("lab_qun").active = false;
        } else if (panelName == "group") {
            this.node_end.active = false;
            this.node_list.active = true;
            this.btn_qun.active = false;
            this.node_list.getChildByName("lab_friend").active = false;
            this.node_list.getChildByName("lab_qun").active = true;
        }
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            //cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            if (btnN == "btn_end") {
                cc.director.loadScene("game");
            } else if (btnN == "btn_friend") {
                this.subPostMessage("friend");
            } else if (btnN == "btn_qun") {
                this.shareGroup();
            } else if (btnN == "btn_backEnd") {
                this.subPostMessage("over");
            }
            else if (btnN == "btn_left") {
                this.subPostMessage("left");
            }
            else if (btnN == "btn_right") {
                this.subPostMessage("right");
            }
            else if (btnN == "") {
                //小游戏跳转 和 显示图片
                if (CC_WECHATGAME) {
                    wx.navigateToMiniProgram({
                        appId: 'wx93fc27bed64ce802',
                        path: '',
                        extraData: '',
                        success(res) {
                        },
                        fail() {
                            let str_imageUrl = cc.dataMgr.imageUrl.urlMore
                            wx.previewImage({
                                current: str_imageUrl, // 当前显示图片的http链接
                                urls: [str_imageUrl] // 需要预览的图片http链接列表
                            });
                        }
                    })
                }
            }
        }
    }

    //------ 微信子域游戏内所有操作 ------

    //初始化子域信息
    initSubCanvas() {
        this.tex = new cc.Texture2D();
        if (CC_WECHATGAME) {
            //console.log("-- WECHAT End.js initSubCanvas --");
            window.sharedCanvas.width = 720;
            window.sharedCanvas.height = 1280;
        }
    }

    updataSubCanvas() {
        if (CC_WECHATGAME) {
            //console.log("-- WECHAT End.js updataSubCanvas --");
            this.tex.initWithElement(window.sharedCanvas);
            this.tex.handleLoadedTexture();
            if (this.node_end.active) {
                this.sub_end.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(this.tex);
            } else {
                this.sub_list.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(this.tex);
            }
        }
    }

    //这里type: submit(提交个人数据)、end(结束界面)、friend(好友排行)
    subPostMessage(type) {
        if (CC_WECHATGAME) {
            //console.log("-- WECHAT End.js subPostMessage --" + type);
            if (type == "submit") {
                window.wx.postMessage({
                    messageType: "submit",
                    MAIN_MENU_NUM: "scoreNum",
                    myScore: cc.dataMgr.userData.countJump
                });
            } else if (type == "over") {
                window.wx.postMessage({
                    messageType: "over",
                    MAIN_MENU_NUM: "scoreNum",
                    myScore: cc.dataMgr.userData.countJump
                });
                this.showPanel("end")
            } else if (type == "friend") {
                window.wx.postMessage({
                    messageType: "friend",
                    MAIN_MENU_NUM: "scoreNum",
                    myScore: cc.dataMgr.userData.countJump
                });
                this.showPanel("friend");
            } else if (type == "left") {
                window.wx.postMessage({
                    messageType: "left",
                    MAIN_MENU_NUM: "scoreNum",
                    myScore: cc.dataMgr.userData.countJump
                });
            } else if (type == "right") {
                window.wx.postMessage({
                    messageType: "right",
                    MAIN_MENU_NUM: "scoreNum",
                    myScore: cc.dataMgr.userData.countJump
                });
            }
        }
    }

    //已经有 shareTicket 显示群排行
    showGroup(shareTicket) {
        if (CC_WECHATGAME) {
            window.wx.postMessage({
                messageType: "group",
                MAIN_MENU_NUM: "scoreNum",
                shareTicket: shareTicket
            });
            self.showPanel("group");
        }
    }

    //获取群排行 shareTicket( 先设置 withShareTicket: true)
    shareGroup() {
        let self = this;
        if (CC_WECHATGAME) {
            window.wx.updateShareMenu({
                withShareTicket: true,
                success() {
                    window.wx.shareAppMessage({
                        title: "我在这里，等你来超越。--境之边缘",
                        imageUrl: cc.dataMgr.imageUrl.urlGroup,
                        query: "otherID=" + cc.dataMgr.openid,
                        success: (res) => {
                            console.log("-- shareGroup success --");
                            console.log(res);
                            if (res.shareTickets != undefined && res.shareTickets.length > 0) {
                                self.showGroup(res.shareTickets[0]);
                                //cc.dataMgr.shareSuccess("end");
                            }
                        }
                    });
                }
            });
        } else {
            console.log("-- Not is wechatGame shareGroup --");
        }
    }

    //分享给好友
    shareFriend() {
        if (CC_WECHATGAME) {
            window.wx.shareAppMessage({
                title: "我在这里，等你来。--境之边缘",
                imageUrl: cc.dataMgr.imageUrl.urlFriend,
                query: "otherID=" + cc.dataMgr.openid,
                success: (res) => {
                    //cc.dataMgr.shareSuccess("end");
                }
            });
        } else {
            console.log("-- Not is wechatGame shareFriend --");
        }
    }
}