// ---------- 引用 ----------------------------------------------------------------

import { _decorator } from "cc";
import { Config } from "../../common/config/Config";
import { HeartbeatJson } from "../../common/protocol/HeartbetJson";
import GameView from "../../framework/core/ui/GameView";
import HorseGameData from "../data/HorseGameData";
import { HorseGameLogic } from "../logic/HorseGameLogic";
import { WrapperService } from "../net/WrapperService";

// ---------- 常數 ----------------------------------------------------------------

const { ccclass, property } = _decorator;

@ccclass
export default class HorseGameView extends GameView {

    // ---------- 成員變數 --------------------------------------------------------
    get data() { return App.dataCenter.get(HorseGameData) as HorseGameData; };

    // 邏輯
    private get service() { return App.serviceManager.get(WrapperService); }

    // ---------- 生命週期 --------------------------------------------------------
    onLoad() {
        super.onLoad();
    }

    start() {
        this.init();
        this.serviceInit();
    }

    onDestroy() {

    }

    // ---------- 框架呼叫 ------------------------------------------------------

    static logicType = HorseGameLogic;
    static getPrefabUrl() {
        // return `@WrapperView`; // 呼應到 main.scene > prefabs(node)
        return 'game/prefabs/HorseGameView';
    }

    // ---------- 內部呼叫 --------------------------------------------------------

    /** 初始化 */
    private init() {

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

    // ---------- 外部部呼叫 ------------------------------------------------------

    // ---------- 監聽事件 --------------------------------------------------------

    /** 框架onLoad呼叫 */
    public addEvents() {
        super.addEvents();
    }
}

