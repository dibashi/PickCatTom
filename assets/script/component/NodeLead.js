const {
    ccclass,
    property
} = cc._decorator;

@ccclass
export default class NodeLead extends cc.Component {
    //744 -469 是免费小猫的位置

    @property(cc.Node) //顶部按钮
    node_top = null;
    @property(cc.Node) //新猫咪按钮
    btn_newCat = null;

    @property(cc.Node) //手指显示
    node_point = null;
    @property(cc.Node) //显示聊条话语
    node_talk = null;

    //其它相关
    @property(cc.Node)
    ui_lockShack = null;
    @property(cc.Node)
    node_card = null;

    _firstCatName = "瓜波";

    onLoad() {

    }

    start() {
        this.ui_lockShack.active = false;
        this.node_card.active = false;

        //如果在新手引导中,切换到新手引导
        if (cc.dataMgr.userData.leadStep >= 0) {
            this.node_top.active = false;
            this.btn_newCat.active = false;
            this.scheduleOnce(this.refreshLead, 0.5);

            //窝棚中🔒锁的显示和隐藏,现在不需要了
            //if (cc.dataMgr.userData.leadStep <= 11)
            //    this.ui_lockShack.active = true;
        }

        let catKey = cc.dataMgr.userData.haveCat[0];
        let catU = cc.dataMgr.userData.catData[catKey];
        if (catU) {
            this._firstCatName = catU.name;
        }
    }

    //切换到新手引导下一步
    changeToNextStep(stepNeed) {
        if (cc.dataMgr.userData.leadStep == stepNeed) {
            ++cc.dataMgr.userData.leadStep;
            this.refreshLead();
        }
    }

    //根据引导的步骤 初始化显示东西(每一步都特殊处理)
    refreshLead() {
        //谈话: 你好,瓜波。 
        //点一下任意位置,谈话:你能帮我离开这里吗？ 同时显示 手指 (指向猫咪,且猫咪在屏幕中央)
        //点中猫咪出现外出框,同时让猫咪外出。 之后 谈话:等一下。刚刚发生了什么？
        //这时小猫回来 带的有礼物,显示手指 指向礼物。
        //点击 展示礼物 (收音机 shack_023)。 引导时不显示分享。
        //点击放置 然后,谈话:天啊！这项特殊能力太惊人了！可以再来一次吗？ 同时 出现手指 指向猫咪。
        //点击猫咪 出现外出框,并且手指指向 外出框。
        //点框小猫外出 (2秒) 带回礼物
        //点中礼物显示 (面具 shack_005), 点击放置。
        //谈话:太好了,你确实可以帮助到我了！你可以拿回来一些能帮助我们离开的东西吗？  这里是无提示的。(玩家点猫外出觅食)
        //带回 (老鼠 shack_007)  谈话:我该说谢谢吗...其实是在想有什么有用的东西,比如打开这把锁的钥匙。  这里是无提示的。(玩家点猫外出觅食)
        //带回 (斧头 shack_011)  谈话:钥匙！我们需要钥匙！好孩子,去找吧。
        //点击 小猫生气了(站了起来)。 谈话:哎呀...抱歉。我忘了,你并不是狗狗。我不会再这样了。我该怎样做才能让你开心呢？
        //点击 出现抚摸小猫的 按钮(并出现手指)。
        //点击抚摸按钮,抚摸小猫。 然后出现 外出框。
        //带回 (钥匙 shack_006) 谈话:就是这样！我们终于可以离开了。

        //点击任意 锁消失。并切换到大厅。 谈话:我们离开那个地方了。但我仍然不知道我们身在何处。
        //点击 谈话:等一下...瓜波,你在哪里？藏在那个箱子里了吗？
        //点击箱子,出现新猫咪。
        //谈话:啊，你不是瓜波...我要叫你小樱。
        //点击任意 谈话:那房子里也许会有些线索。你像瓜波一样有特殊能力吗？让我们试试进到里面。
        //(无提示) 让玩家自己想点猫 (只有外出框)
        //带回 (风车 yard_050) 谈话:嗯...不太行。我们需要一样东西来打开那扇门。
        //点击屏幕 移到猫咪的位置。
        //点猫外出。然后  谈话:我想知道这些入口通往哪里...
        //带回 (小鱼干 yard_060)  谈话:这是给你的食物吗？好,我会喂你的。但是,喂完后,你必须帮我进到里面。 提示:小猫饿了。
        //点击小猫 只出现 喂食 按钮。
        //喂食后出现外出框。 带回 (铃铛 yard_036) 。
        //点猫外出(55 秒), 谈话:小樱 好久没有回来。这个铃铛也许可以将它召回。 (同时显示外出界面上的召回 按钮 并免费)
        //带回 (钥匙 yard_006) 谈话:就是这样！现在，让我们看看房子里有什么。

        //点击任意 进入房间。
        //瓜波站在桌子上, 旁边是手册  谈话:瓜波,你在这儿！这是给我的吗？
        //点击任意 展示(身份证) 谈话:嗯...我想我现在是房间的主人了。
        //换一个相册  谈话:这本相册太空可。我要记录一下我们的全部冒险。
        //点击任意 出现 top 三个按钮 ,并且地上有一大堆金币。 谈话:这个房子又大又空！你愿意使用你的特殊能力,帮我填满这个房子吗？

        //新增步骤会 打1000 开始

        console.log("---- refreshLead --" + cc.dataMgr.userData.leadStep);
        let gameJs = this.node.getComponent("Game");
        if (cc.dataMgr.userData.leadStep == 0) {
            this.showTalk("我有一只小喵喵，给它取个名字吧。");
            //移动屏幕 使猫咪再屏幕中央  并 显示手指 指向 talk
            this.delayMoveToCat();
        } else if (cc.dataMgr.userData.leadStep == 1000) {
            this.hideTalk();
            this.hidePoint();
            this.node.getChildByName("pop_name").getComponent("PopBook").showPop();
        }
        if (cc.dataMgr.userData.leadStep == 1) {
            //猫咪名字刷新
            let catKey = cc.dataMgr.userData.haveCat[0];
            let catU = cc.dataMgr.userData.catData[catKey];
            if (catU) {
                this._firstCatName = catU.name;
            }

            this.showTalk(this._firstCatName + "，仓库里好空呀，你能帮我找些东西回来吗？");
            //显示手指 指向 猫咪
            this.showPoint(0, 0);
        } else if (cc.dataMgr.userData.leadStep == 2) {
            //点中小猫后 小猫觅食 同时显示这个
            this.showTalk("等一下。刚刚发生了什么？", "top");
            let isOut = cc.dataMgr.oneCatOut_b(cc.dataMgr.userData.haveCat[0]);
            if (isOut)
                gameJs.oneCatOut(cc.dataMgr.userData.haveCat[0]);
            this.hidePoint();
        } else if (cc.dataMgr.userData.leadStep == 3) {
            //小猫回来后 显示手指
            this.hideTalk();
            this.showPoint(cc.dataMgr.canvasW / 2 - 100, 0);
        } else if (cc.dataMgr.userData.leadStep == 4) {
            //放置 收音机后显示 同时 出现手指 指向猫咪。
            this.showTalk("天啊！这项特殊能力太惊人了！可以再来一次吗？");

            this.delayMoveToCat();
            this.showPoint(0, 0);
        } else if (cc.dataMgr.userData.leadStep == 5) {
            //点击猫咪 出现外出框,并且手指指向 外出框。
            this.hideTalk();
            this.showPoint(0, 300);
        } else if (cc.dataMgr.userData.leadStep == 6) {
            //放置 面具后 显示
            this.hidePoint();
            this.showTalk("太好了,你真是太厉害了！好想出去玩，你可以找一些海边能用的东西吗？");
            this.delayMoveToCat();
        } else if (cc.dataMgr.userData.leadStep == 7) {
            //放置 老鼠后 显示
            this.showTalk("我该说谢谢吗...其实是在想有什么有用的东西,比如泳圈。");
            this.delayMoveToCat();
        } else if (cc.dataMgr.userData.leadStep == 8) {
            //放置 斧头后 显示
            this.showTalk("不对的！我想要个泳圈！");
            this.delayMoveToCat();

            //更改小猫的状态 使其 需要抚摸
            let catU = cc.dataMgr.userData.catData[cc.dataMgr.userData.haveCat[0]];
            if (catU)
                catU.needStatus = "touch";
        } else if (cc.dataMgr.userData.leadStep == 9) {
            //同时小猫站起来
            this.showTalk("哎呀...抱歉。我忘了,你并不是狗狗。我不会再这样了。我该怎样做才能让你开心呢？");
            ++cc.dataMgr.userData.leadStep;
            this.showPoint(250, cc.dataMgr.canvasH / 2 - 320);
        } else if (cc.dataMgr.userData.leadStep == 10) {
            //出现抚摸小猫的 按钮(并出现手指)
            this.hideTalk();

            this.showPoint(-130, -250);
            //这里随意给了一个不一样的 值 为了不重复达到这一步
            cc.dataMgr.userData.leadStep = 100;

            cc.dataMgr.userData.popType = "pop_catUI";
            let pop_catUI = this.node.getChildByName("root_cat").getChildByName("pop_catUI");
            pop_catUI.scale = 0.64;
            pop_catUI.zIndex = 3000;
            pop_catUI.position = cc.v2(0, 0);
            pop_catUI.getComponent("PopCatUI").showPop();
        } else if (cc.dataMgr.userData.leadStep == 11) {
            //放置 钥匙后 显示
            this.showPoint(this.node_talk.x + 250, cc.dataMgr.canvasH / 2 - 320);
            this.showTalk("就是这样！我们终于可以离开了。");
        } else if (cc.dataMgr.userData.leadStep == 12) {
            //点击任意 锁消失。
            this.ui_lockShack.active = false;
            cc.dataMgr.userData.leadStep = 13;
            this.scheduleOnce(this.refreshLead, 0.6);
        } else if (cc.dataMgr.userData.leadStep == 13) {
            //切换到庭院。
            this.hideTalk();

            cc.dataMgr.userData.atRoomIdx = 1;
            if (gameJs) {
                cc.dataMgr.userData.leadStep = 14;
                let time = gameJs.chageAction_i();
                this.node.runAction(cc.sequence(cc.delayTime(time), cc.callFunc(this.refreshLead, this)));
            }
        } else if (cc.dataMgr.userData.leadStep == 14) {
            this.showPoint(this.node_talk.x + 250, cc.dataMgr.canvasH / 2 - 320);
            this.showTalk("海滩好美呀，不过还是应该好好整理一下，让更多的小伙伴来玩。");
            //显示箱子 并把视角移动到箱子上
            this.btn_newCat.active = true;
            this.btn_newCat.position = cc.v2(-220, 130);
        } else if (cc.dataMgr.userData.leadStep == 15) {
            this.hidePoint();

            //把相机移动到 箱子的位置
            let timeD = 0.8;
            if (gameJs)
                timeD = gameJs.moveCameraTo_i(-220, 130);
            this.showTalk("等一下..." + this._firstCatName + ",你在哪里？藏在那个箱子里了吗？");
            this.node.runAction(cc.sequence(cc.delayTime(timeD), cc.callFunc(this.showPoint, this)));
        } else if (cc.dataMgr.userData.leadStep == 16) {
            //小猫放置后
            //this.showTalk("啊，你不是瓜波...我要叫你小樱。");
            this.showTalk("啊，你不是" + this._firstCatName + "...");

            this.btn_newCat.active = true;
        } else if (cc.dataMgr.userData.leadStep == 17) {
            this.showTalk("你像" + this._firstCatName + "一样有特殊能力吗？");
            this.delayMoveToCat();
        } else if (cc.dataMgr.userData.leadStep == 18) {
            //放置 风车后显示 同时移动到猫的位置
            this.showTalk("嗯…好棒呀。还有更好的东西吗？");
            this.delayMoveToCat();
        } else if (cc.dataMgr.userData.leadStep == 19) {
            //点猫外出。然后  
            this.showTalk("这里真的是好美呀，要是好好布置一下，就更棒了！", "top");
        } else if (cc.dataMgr.userData.leadStep == 20) {
            //放置 小鱼干后显示 同时提示小猫饿了
            this.showTalk("这是给你的食物吗？好,我会喂你的。但是,喂完后,你可以帮再出去找点好玩的东西吗？");

            let catKey = cc.dataMgr.userData.haveCat[cc.dataMgr.userData.haveCat.length - 1];
            let catU = cc.dataMgr.userData.catData[catKey];
            if (catU)
                catU.needStatus = "eat";
            if (gameJs) {
                gameJs.refreshCatStatus();
                this.delayMoveToCat();
            }
        } else if (cc.dataMgr.userData.leadStep == 21) {
            //带回铃铛 后 leadStep++ 不做处理
            this.hideTalk();
            this.delayMoveToCat();
        } else if (cc.dataMgr.userData.leadStep == 22) {
            //点小猫外出后  四秒后显示对话
            cc.dataMgr.userData.leadStep = 23;
            this.scheduleOnce(this.refreshLead, 2);
        } else if (cc.dataMgr.userData.leadStep == 23) {
            this.showTalk("猫咪好久没有回来。这个铃铛也许可以将它召回。", "top");
            this.showPoint(cc.dataMgr.canvasW / 2 - 100, +100);
        } else if (cc.dataMgr.userData.leadStep == 24) {
            //放置 钥匙后显示
            this.showTalk("就是这样！让我们去甜点屋看看有什么更好的东西吧？");
            this.showPoint(250, cc.dataMgr.canvasH / 2 - 320);
        } else if (cc.dataMgr.userData.leadStep == 25) {
            //切换到大厅。
            this.hideTalk();
            this.hidePoint();
            let catU = cc.dataMgr.userData.catData[cc.dataMgr.userData.haveCat[0]];
            if (catU)
                catU.atRoomIdx = 2;

            if (gameJs) {
                cc.dataMgr.userData.leadStep = 26;
                cc.dataMgr.userData.atRoomIdx = 2;
                gameJs.chageAction_i();
                this.node.runAction(cc.sequence(cc.delayTime(1.6), cc.callFunc(this.refreshLead, this)));
            }
        } else if (cc.dataMgr.userData.leadStep == 26) {
            //瓜波站在桌子上, 旁边是手册
            this.node_card.active = true;
            this.showTalk(this._firstCatName + "，你在这儿！这是给我的吗？");
            if (gameJs)
                gameJs.moveToCatPos(cc.dataMgr.userData.haveCat[0]);
        } else if (cc.dataMgr.userData.leadStep == 27) {
            //展示(身份证)
            this.node_card.getChildByName("sprite2").active = true;
            this.showTalk("嗯...我想我现在是房间的主人了。");
        } else if (cc.dataMgr.userData.leadStep == 28) {
            //换一个相册
            this.node_card.getChildByName("sprite3").active = true;
            this.showTalk("这本相册太空可。我要记录一下我们的全部冒险。");
        } else if (cc.dataMgr.userData.leadStep == 29) {
            //点任意出现 top_btn
            this.node_top.active = true;
            this.node_card.active = false;
            this.showTalk("这个房子又大又空！你愿意使用你的特殊能力,帮我填满这个房子吗？");
        } else if (cc.dataMgr.userData.leadStep == 30) {
            //点任意 结束引导
            this.hideTalk();
            cc.dataMgr.userData.leadStep = -1;

            this.scheduleOnce(function () {
                //再地上创建一大堆金币
                let num = 10 + Math.ceil(Math.random() * 40);
                for (let i = 0; i < num; ++i) {
                    let posX = (Math.random() - 0.5) * 500 - 400;
                    let posY = (Math.random() - 0.5) * 200 - 200;
                    if (gameJs)
                        gameJs.addOneEffect("takeGold", 5, posX, posY, 0);
                }
            }, 2.4);
        }
        console.log("---- refreshLead end --" + cc.dataMgr.userData.leadStep);
    }

    //延迟移到猫咪所在位置
    delayMoveToCat() {
        this.scheduleOnce(function () {
            let gameJs = cc.find("Canvas").getComponent("Game");
            if (gameJs)
                gameJs.moveToCatPos(cc.dataMgr.userData.haveCat[cc.dataMgr.userData.haveCat.length - 1]);
            this.node.runAction(cc.sequence(cc.delayTime(0.8), cc.callFunc(this.showPoint, this)));
        }, 0.6);
    }

    //显示 talk 
    showTalk(desc, pos) {
        this.node_talk.active = true;
        this.node_talk.getChildByName("lab_name").getComponent(cc.Label).string = desc;
        if (true || pos == "top")
            this.node_talk.y = cc.dataMgr.canvasH / 2 - 320;
        else
            this.node_talk.y = -cc.dataMgr.canvasH / 2 + 160;
    }

    hideTalk() {
        this.node_talk.active = false;
    }

    //显示手指
    showPoint(posX, posY) {
        posX = typeof (posX) == "number" ? posX : 0;
        posY = typeof (posY) == "number" ? posY : 0;
        this.node_point.active = true;
        this.node_point.position = cc.v2(posX, posY);
    }

    hidePoint() {
        this.node_point.active = false;
    }
}