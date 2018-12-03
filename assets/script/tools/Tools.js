//(导入以插件的脚本中)this 即是 window, 脚本中的函数 如: openLog等这样的函数 即为 window.openLog。
//cc、CC_WECHATGAME、CC_DEBUG 等,都是 window下的属性和对象。

(function () {
    console.log("-- load Tools --");

    //------ 基础信息相关 ------
    window.canvasW = 720;
    window.canvasH = 1280;


    //------ log 输出相关  ------
    window.canFind = false; //游戏场景加载后 置为true
    window.isLabel = false; //显示 label 输出
    window.isConsole = false; //显示 console 输出(控制台输出)
    window.countLog = 0; //log 计数
    window.logArr = []; //当前未打印的 log 输出
    window.beginY = 0; //移动log 的初始 Y 值

    //label显示log,右侧 150 像素内为 滑动区域
    window.openLog = function (isConsoleLog, isLabelLog) {
        canFind = true;
        isLabel = isLabelLog;
        isConsole = isConsoleLog;

        //toolsLog(this);
        //toolsLog(window);
        //toolsLog(console);

        canvasW = cc.find("Canvas").width;
        canvasH = cc.find("Canvas").height;

        toolsLog("-- openLog -- " + isConsole + " -- " + isLabel + " -- " + countLog);
    };

    window.toolsLog = function () {
        if (logArr.length > 40)
            return;
        if (canFind && isLabel) {
            let root_log = cc.find("Canvas/root_log");
            //如果没有控件 就添加 root_log
            if (!root_log) {
                let canvasN = cc.find("Canvas");
                if (canvasN) {
                    //这里存在 canvas 但不存在 root_log 要添加
                    let rootN = new cc.Node();
                    canvasN.addChild(rootN, 1500, "root_log");
                    //设置 rootN 的锚点 和 滑动事件
                    rootN.anchorX = 1;
                    rootN.anchorY = 1;
                    rootN.width = 150;
                    rootN.position = cc.v2(canvasW / 2, canvasH / 2);

                    rootN.addComponent(cc.Layout);
                    rootN.getComponent(cc.Layout).type = cc.Layout.Type.VERTICAL;
                    rootN.getComponent(cc.Layout).resizeMode = cc.Layout.ResizeMode.CONTAINER;
                    rootN.getComponent(cc.Layout).paddingTop = 20;
                    rootN.getComponent(cc.Layout).verticalDirection = cc.Layout.VerticalDirection.TOP_TO_BOTTOM;

                    rootN.on(cc.Node.EventType.TOUCH_MOVE, function (touch) {
                        let touchPos = touch.getLocation();
                        if (beginY != 0) {
                            let moveDis = touchPos.y - beginY;
                            if (Math.abs(moveDis) < 20) {
                                //移动 log
                                let heightR = rootN.height;
                                let rootY = rootN.y;
                                rootN.y += moveDis;
                                // if (rootY + moveDis < canvasH / 2)
                                //     rootN.y = canvasH / 2;
                                // if (heightR > canvasH && rootY > heightR - canvasH / 2)
                                //     rootY = heightR - canvasH / 2;
                            }
                        }
                        beginY = touchPos.y;
                    }, rootN);

                    rootN.addComponent(cc.Button);
                    root_log = rootN;
                }
            }
            //之前没有输出的 要输出
            if (root_log && logArr.length > 0) {
                let addNum = logArr.length;
                for (let i = 0; i < addNum; ++i) {
                    if (logArr.length > 0) {
                        let desc = logArr.shift();
                        addOneLog(desc + " arr:" + logArr.length);
                    }
                }
            }
        }
        if (arguments && arguments.length > 0) {
            //整理数据
            ++countLog;
            let logStr = countLog + ": ";
            for (let i = 0; i < arguments.length; ++i) {
                let desc = arguments[i];
                if (typeof (desc) == "string")
                    logStr = logStr + desc + " ";
                else if (typeof (desc) == "object")
                    logStr = logStr + JSON.stringify(desc) + " ";
                else
                    logStr = logStr + typeof (desc) + " ";
            }
            //添加 log 和 label 显示
            if (isConsole)
                console.log(logStr);

            addOneLog(logStr);
        }
    };

    window.addOneLog = function (desc) {
        let isAdd = false;
        if (canFind && isLabel) {
            let root_log = cc.find("Canvas/root_log");
            if (root_log) {
                isAdd = true;
                let nodeN = new cc.Node();
                nodeN.addComponent(cc.Label);

                root_log.addChild(nodeN);
                nodeN.x = -canvasW / 2;
                nodeN.getComponent(cc.Label).fontSize = 35;
                nodeN.getComponent(cc.Label).lineHeight = 40;
                nodeN.getComponent(cc.Label).fontFamily = "SimHei";
                nodeN.color = cc.Color.WHITE;

                nodeN.getComponent(cc.Label).string = getAutoChangeLine_str(desc, 30, false);
            }
        }
        if (!isAdd) {
            logArr.push(desc);
        }
    };

    //字符串自动换行: 目标字符串、间隔多长换行、第一句是否留空格(保持段落缩进)
    window.getAutoChangeLine_str = function (aimStr, cutLength, isBlank) {
        let strRet = null;
        if (typeof (aimStr) == "object")
            aimStr = JSON.stringify(aimStr);
        if (typeof (aimStr) == "string") {
            let strLength = aimStr.length;
            for (let i = 0; i < Math.ceil(strLength / cutLength); ++i) {
                let strOne = null;
                if (isBlank) {
                    //英文 -4 汉字 -2
                    if (i == 0)
                        strOne = "    " + aimStr.substr(i * cutLength, cutLength - 4);
                    else
                        strOne = aimStr.substr(i * cutLength - 4, cutLength);
                } else
                    strOne = aimStr.substr(i * cutLength, cutLength);
                if (strOne)
                    if (!strRet)
                        strRet = strOne;
                    else
                        strRet = strRet + "\n" + strOne;
            }
        }
        return strRet;
    };

    //------ 基础函数 ------

    //获取当前秒数
    window.getTimeSecond_i = function () {
        return parseInt(Date.now() / 1000);
    };

    //获取当前所在的 周 0~6 剩余日期
    window.getTimeWeek_i = function () {
        let dayNum = parseInt(Date.now() / (1000 * 3600 * 24));
        let weekNum = parseInt((dayNum - 4) / 7);
        return weekNum;
    };


    //------ jsb 交互相关 ------

    window.tools_login = function () {
        console.log("-- tools_login -- ");
        //jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "showAlertDialog", "(Ljava/lang/String;Ljava/lang/String;)V", "title", "hahahahha");

        //java 调用 js
        // public static void login(String desc){
        //     Log.i("-- AppActivity -- ",desc);
        //    // 一定要在 GL 线程中执行
        //    sObj.runOnGLThread(new Runnable() {
        //        @Override
        //        public void run() {
        //            Cocos2dxJavascriptJavaBridge.evalString("tools_respLogin(\"Javascript Java bridge!\")");
        //        }
        //    });
        // }

        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "login", "(Ljava/lang/String;)V", " ** ");
        } else if (cc.sys.os == cc.sys.OS_IOS) {

        }
    }

    window.tools_respLogin = function (data) {
        console.log("-- java 返回 --" + data);
    }
}());