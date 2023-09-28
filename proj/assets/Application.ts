import { Node } from "cc";
import { DEBUG } from "cc/env";
import Alert from "./scripts/common/component/Alert";
import GameAlert from "./scripts/common/component/GameAlert";
import GlobalAudio from "./scripts/common/component/GlobalAudio";
import Loading from "./scripts/common/component/Loading";
import Tips from "./scripts/common/component/Tips";
import UILoading from "./scripts/common/component/UILoading";
import { UIReconnect } from "./scripts/common/component/UIReconnect";
import UpdateLoading from "./scripts/common/component/UpdateLoading";
import { Config } from "./scripts/common/config/Config";
import { EBundles } from "./scripts/common/data/Bundles";
import { StageData } from "./scripts/common/data/StageData";
import { CmmEntry } from "./scripts/common/entry/CmmEntry";
import { CommonLanguage } from "./scripts/common/language/CommonLanguage";
import { CmmUtils } from "./scripts/common/utils/CmmUtils";
import { Framewok } from "./scripts/framework/Framework";
import CommandManager from "./scripts/framework/core/command/CommandManager";
import { FlowManager } from "./scripts/framework/core/flow/FlowManager";
import { LogLevel } from "./scripts/framework/defines/Enums";
import Singleton from "./scripts/framework/utils/Singleton";
import GameLoading from "./scripts/common/component/GameLoading";

/**@description 游戏所有运行单例的管理 */
export class Application extends Framewok implements GameEventInterface {

    get isLazyRelease() {
        return true;
    }

    get Bundles() {
        return EBundles;
    }

    /**@description 是否開啟自動釋放長時間未使用資源 */
    get isAutoReleaseUnuseResources() {
        return true;
    }

    /**@description 當isLazyRelease 為true時有效，當資源長時間未使用時自動釋放 */
    get autoReleaseUnuseResourcesTimeout() {
        return 5 * 60;
    }

    get utils() {
        return Singleton.instance.get(CmmUtils) as CmmUtils;
    }

    /**@description 進入後臺的時間 */
    private _enterBackgroundTime = 0;

    /**@description 重連專用提示UI部分 */
    get uiReconnect() {
        return Singleton.instance.get(UIReconnect) as UIReconnect;
    }

    /**@description 小提示 */
    get tips() {
        return Singleton.instance.get(Tips) as Tips;
    }

    /**@description 介面載入時的全屏Loading,顯示載入進度 */
    get uiLoading(): UILoading {
        return Singleton.instance.get(UILoading) as UILoading;
    }

    /**@description 遊戲載入時的全屏Loading,顯示載入進度 */
    get gameLoading(): GameLoading {
        return Singleton.instance.get(GameLoading) as GameLoading;
    }

    /**@description 彈出提示框,帶一到兩個按鈕 */
    get alert() {
        return Singleton.instance.get(Alert) as Alert;
    }

    /** @description 彈出提示框,帶一到兩個按鈕 */
    get gameAlert() {
        return Singleton.instance.get(GameAlert) as GameAlert;
    }

    /**@description 公共loading */
    get loading() {
        return Singleton.instance.get(Loading) as Loading;
    }

    get updateLoading() {
        return Singleton.instance.get(UpdateLoading) as UpdateLoading;
    }

    /**@description 獲取Stage資料 */
    get stageData() {
        return this.dataCenter.get(StageData) as StageData;
    }

    /**@description Flow管理器 半成品 可以優化更好 */
    get flowManager() {
        return Singleton.instance.get(FlowManager) as FlowManager;
    }

    /**@description command管理器 */
    get commandManager() {
        return Singleton.instance.get(CommandManager) as CommandManager;
    }

    private _wssCacertUrl = "";
    /**@description websocket wss 證書url地址 */
    set wssCacertUrl(value) {
        this._wssCacertUrl = value;
    }
    get wssCacertUrl() {
        return this._wssCacertUrl;
    }

    /**@description 全域性網路播放聲音元件，如播放按鈕音效，彈出框音效等 */
    private _globalAudio: GlobalAudio = null!;
    get globalAudio() {
        if (this._globalAudio) {
            return this._globalAudio;
        }
        this._globalAudio = this.uiManager.canvas.getComponent(GlobalAudio) as GlobalAudio;
        return this._globalAudio;
    }

    init() {
        super.init();
        this.updateManager.hotUpdateUrl = Config.HOT_UPDATE_URL;
        this.updateManager.isAutoVersion = Config.USE_AUTO_VERSION;
        this.updateManager.isSkipCheckUpdate = Config.isSkipCheckUpdate;
        
        //初始化自定主entry代理
        this.entryManager.delegate = new CmmEntry();

        //語言包初始化
        //cc.log("language init");
        this.language.addDelegate(new CommonLanguage);
    }

    onLoad(node: Node) {
        //预先加载下loading预置体
        App.uiManager.onLoad(node);
        //Service onLoad
        App.serviceManager.onLoad();
        //入口管理器
        App.entryManager.onLoad(node);
        //释放管理器
        App.releaseManger.onLoad(node);
    }

    update(node: Node) {
        //Service 网络调试
        App.serviceManager.update();

        //远程资源下载任务调度
        App.asset.remote.update();
    }

    onDestroy(node: Node) {
        App.serviceManager.onDestroy();
        //入口管理器
        App.entryManager.onDestroy(node);
        //释放管理器
        App.releaseManger.onDestroy(node);
    }

    onEnterBackground(): void {
        this._enterBackgroundTime = Date.timeNow();
        Log.d(`[MainController]`, `onEnterBackground ${this._enterBackgroundTime}`);
        App.globalAudio.onEnterBackground();
        App.serviceManager.onEnterBackground();
    }
    onEnterForgeground(): void {
        let now = Date.timeNow();
        let inBackgroundTime = now - this._enterBackgroundTime;
        Log.d(`[MainController]`, `onEnterForgeground ${now} background total time : ${inBackgroundTime}`);
        App.globalAudio.onEnterForgeground(inBackgroundTime);
        App.serviceManager.onEnterForgeground(inBackgroundTime);
    }
}

let app = new Application();
const level = DEBUG ? LogLevel.ALL : LogLevel.ERROR;
app.logger.level = level;
(<any>window)["App"] = app;
app.init();