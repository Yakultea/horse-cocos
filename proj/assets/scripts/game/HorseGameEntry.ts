/**
 * @description 登入流程 , 不用匯出
 */
// ---------- 引用 ----------------------------------------------------------------
import { CmmEntry } from "../common/entry/CmmEntry";
import UrlModel from "../common/model/UrlModel";
import UrlUtils from "../common/utils/UrlUtils";
import { Entry } from "../framework/core/entry/Entry";
import { registerEntry } from "../framework/defines/Decorators";
import { Macro } from "../framework/defines/Macros";
import HorseGameData from "./data/HorseGameData";
import { HorseGameLanguage } from "./data/HorseGameLanguage";
import SocketModel from "./model/SocketModel";
import WrapperHandler from "./net/WrapperHandler";
import { WrapperSender } from "./net/WrapperSender";
import { WrapperService } from "./net/WrapperService";
import HorseGameView from "./view/HorseGameView";

// ---------- 常數 ----------------------------------------------------------------

@registerEntry("HorseGameEntry", Macro.BUNDLE_RESOURCES, HorseGameView)
class HorseGameEntry extends Entry {
    // ---------- 成員變數 -------------------------------------------------------------
    protected language = new HorseGameLanguage;
    get data() { return App.dataCenter.get(HorseGameData); }

    /**@description 是否是主包入口，只能有一個主包入口 */
    isMain = true;

    private delegate: CmmEntry = new CmmEntry();
    // ---------- 生命週期 -------------------------------------------------------------

    // ---------- 框架呼叫 -------------------------------------------------------------

    /** 新增該模組網路事件 */
    protected addNetHandler(): void {
        App.handlerManager.get(WrapperHandler);

    }

    /** 移除本模組網路事件 */
    protected removeNetHandler(): void {
        // App.handlerManager.destory(WrapperHandler);
    }

    /** 載入模組資源 */
    protected loadResources(completeCb: () => void): void {
        completeCb();
    }

    protected openGameView(userData?: any): void {
        super.openGameView();
        App.entryManager.onCheckUpdate();
    }

    /** 初始化遊戲資料 */
    protected initData(): void {
        // 初始化urlF
        this.initUrlConfig();
        // 初始化 wrapper socket
        App.serviceManager.get(WrapperService, true);
    }

    protected pauseMessageQueue(): void {

    }

    protected resumeMessageQueue(): void {

    }

    /**@description 管理器通知自己進入GameView */
    onEnter(userData?: any) {
        super.onEnter(userData);
        Log.d(`--------------onEnterLogin--------------`);
    }

    /**@description 這個位置說明自己GameView 進入onLoad完成 */
    onEnterGameView(gameView: GameView) {
        super.onEnterGameView(gameView);
        //關閉除登入之外的介lo面

        App.uiManager.closeExcept([HorseGameView]);
    }

    /**@description 解除安裝bundle,即在自己bundle刪除之前最後的一條訊息 */
    onUnloadBundle() {
        //移除本模組網路事件
        this.removeNetHandler();
        //解除安裝資源
        this.unloadResources();
    }

    // ---------- 內部呼叫 -------------------------------------------------------------

    /** 初始化Url設定 取得網址URL 解析後存到UrlModel */
    private initUrlConfig() {
        UrlModel.setSearchParams();
        const urlToken = UrlUtils.getTokenFromUrl();
        const localStorageToken = localStorage.getItem(urlToken);

        if (localStorageToken) {
            SocketModel.currentToken = localStorageToken;
        } else {
            localStorage.clear();
            SocketModel.currentToken = urlToken;
        }
    }

    // ---------- 外部部呼叫 -----------------------------------------------------------
}
// App.entryManager.register(WrapperEntry);
