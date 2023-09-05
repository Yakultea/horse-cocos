// ---------- 引用 ----------------------------------------------------------------

import { Label, Node, NodeEventType, Tween, _decorator, assetManager, find, tween } from "cc";
import { inject } from "../../../framework/defines/Decorators";
import { Config } from "../../../common/config/Config";
import { EBundles } from "../../../common/data/Bundles";
import { HeartbeatJson } from "../../../common/protocol/HeartbetJson";
import { CmmUtils } from "../../../common/utils/CmmUtils";
import GameView from "../../../framework/core/ui/GameView";
import { WrapperService } from "../net/WrapperService";
import WrapperData from "../data/WrapperData";
import { WrapperLogic } from "../logic/WrapperLogic";
// ---------- 常數 ----------------------------------------------------------------
const { ccclass, property } = _decorator;

@ccclass
export default class WrapperView extends GameView {

    // ---------- 成員變數 --------------------------------------------------------
    get data() { return App.dataCenter.get(WrapperData) as WrapperData; };


    @inject("content/bbr", Node)
    private bbr: Node;

    // View
    private title: Label = null;
    private btnContent: Node = null;
    private lobbyBtn: Node = null;
    private gamebtn: Node = null;

    // 邏輯
    private get service() { return App.serviceManager.get(WrapperService); }

    private tween: Tween<any> = null;


    // ---------- 生命週期 --------------------------------------------------------
    onLoad() {
        super.onLoad();

        this.setNode();
        this.setEventTouch();
    }

    start() {
        this.enableBBR(true);
        this.init();

        this.serviceInit();
        this.coundown(() => {
            this.setBtnContentActive(true);
        });

        if (this.data.ENTER_SLOT_VIEW) {

        } else {
            this.enterBundle(EBundles[EBundles.g1001]);
        }
    }

    onDestroy() {
        // Tween.stopAllByTarget(this.tween);
        // Tween.stopAllByTag(1);
        // Tween.stopAllByTarget()
        // Tween.stopAll()
        this.tween.stop()
    }

    // ---------- 框架呼叫 ------------------------------------------------------

    static logicType = WrapperLogic;
    static getPrefabUrl() {
        return `@WrapperView`; // 呼應到 main.scene > prefabs(node)
    }
    // ---------- 內部呼叫 --------------------------------------------------------
    /** 初始化 */
    private init() {
        this.setBtnContentActive(false);
    }

    /** 設置Node綁定 */
    private setNode() {
        this.title = find("content/title", this.node).getComponent(Label);
        this.btnContent = find("content/btnContent", this.node);
        this.lobbyBtn = find('lobbyBtn', this.btnContent);
        this.gamebtn = find('gameBtn', this.btnContent);
    }

    /** 設置觸摸事件 */
    private setEventTouch() {
        this.lobbyBtn.on(NodeEventType.TOUCH_END, () => {
            this.enterBundle(EBundles[EBundles.slotFramework]);
        });

        this.gamebtn.on(NodeEventType.TOUCH_END, () => {
            this.enterBundle(EBundles[EBundles.g1001]);
        });
    }

    private setTitle(time: number) {
        this.title.string = `
        Wrapper
        ${time}s 
        go to G1001View
        Game 前往 G1001
        `;
    }

    private setBtnContentActive(active: boolean) {
        this.btnContent.active = active;
    }

    /** 倒數 */
    private coundown(callback: Function) {
        const time = 2;
        const timeVO = {
            time: time,
            totalTime: time
        };
        this.tween = tween(timeVO)
            .to(timeVO.totalTime, { time: 0 }, {
                onUpdate: () => {
                    timeVO.totalTime = timeVO.time;
                    this.setTitle(CmmUtils.roundDecimal(timeVO.totalTime, 0));
                },
                onComplete: (target) => {
                    callback && callback(target);
                },
            }).start();
    }

    // 網路組件
    private serviceInit() {
        //初始化网络类型设置
        this.service.heartbeat = HeartbeatJson; // 設定心跳包 框架做法 保留但不使用

        // !!!進入後臺的最大允許時間，超過了最大值，則進入網路重連
        this.service.maxEnterBackgroundTime = Config.MIN_INBACKGROUND_TIME;

        //连接网络 
        this.service.connect();

        //是否启用网络
        this.service.enabled = true;
    }

    /** 是否啟用 bbr */
    private enableBBR(boolean: boolean) {
        this.bbr.active = boolean;
    }


    // ---------- 外部部呼叫 ------------------------------------------------------



    // ---------- 監聽事件 --------------------------------------------------------
    /** 框架onLoad呼叫 */
    public addEvents() {
        super.addEvents();
    }

}

