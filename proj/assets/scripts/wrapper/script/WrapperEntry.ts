/**
 * @description 登入流程 , 不用匯出
 */
// ---------- 引用 ----------------------------------------------------------------
import { EBundles } from "../../common/data/Bundles";
import { CmmEntry } from "../../common/entry/CmmEntry";
import UrlModel from "../../common/model/UrlModel";
import UrlUtils from "../../common/utils/UrlUtils";
import { Entry } from "../../framework/core/entry/Entry";
import { registerEntry } from "../../framework/defines/Decorators";
import { Macro } from "../../framework/defines/Macros";
import WrapperData from "./data/WrapperData";
import { WrapperLanguage } from "./data/WrapperLanguage";
import ReadyBundleModel from "./model/ReadyBundleModel";
import SocketModel from "./model/SocketModel";
import WrapperHandler from "./net/WrapperHandler";
import { WrapperService } from "./net/WrapperService";
import WrapperView from "./view/WrapperView";
// ---------- 常數 ----------------------------------------------------------------

@registerEntry("WrapperEntry", Macro.BUNDLE_RESOURCES, WrapperView)
class WrapperEntry extends Entry {
    // ---------- 成員變數 -------------------------------------------------------------
    protected language = new WrapperLanguage;
    get data() { return App.dataCenter.get(WrapperData); }

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
        App.entryManager.enterBundle(EBundles[EBundles.slotFramework]);
        completeCb();
    }
    protected openGameView(userData?: any): void {
        super.openGameView();
        App.entryManager.onCheckUpdate();
    }
    /** 初始化遊戲資料 */
    protected initData(): void {
        // 初始化url
        this.initUrlConfig();
        // 在這邊決定 載入 要檢查的 bundles
        ReadyBundleModel.init([EBundles.slotFramework, EBundles.g1001]);
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

        App.uiManager.closeExcept([WrapperView]);
        // Singleton.instance.destory(); // 移除所有單例
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

        // 開發用
        // SocketModel.currentToken = urlToken;
    }

    // ---------- 外部部呼叫 -----------------------------------------------------------
}
// App.entryManager.register(WrapperEntry);
