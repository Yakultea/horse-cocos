/**
 * @description 登入流程 , 不用匯出
 */
// ---------- 引用 ----------------------------------------------------------------
import { Material, Prefab, SpriteFrame, sys } from "cc";
import { BUILD } from "cc/env";
import { Config } from "../common/config/Config";
import UrlModel from "../common/model/UrlModel";
import { HeartbeatJson } from "../common/protocol/HeartbetJson";
import UrlUtils from "../common/utils/UrlUtils";
import { Resource } from "../framework/core/asset/Resource";
import { Entry } from "../framework/core/entry/Entry";
import { registerEntry } from "../framework/defines/Decorators";
import { Macro } from "../framework/defines/Macros";
import HorseGameData from "./data/HorseGameData";
import { HorseGameLanguage } from "./data/HorseGameLanguage";
import { HorseGameEvent } from "./event/HorseGameEvent";
import GameConfigModel, { ERecordMode, ERenderMode } from "./model/GameConfigModel";
import SocketModel from "./model/SocketModel";
import WrapperHandler from "./net/WrapperHandler";
import { WrapperService } from "./net/WrapperService";
import HorseGameView from "./view/HorseGameView";

// ---------- 常數 ----------------------------------------------------------------

@registerEntry("HorseGameEntry", Macro.BUNDLE_RESOURCES, HorseGameView)
class HorseGameEntry extends Entry {
    // ---------- 成員變數 -------------------------------------------------------------
    protected language = new HorseGameLanguage;
    get data() { return App.dataCenter.get(HorseGameData); }
    get service() { return App.serviceManager.get(WrapperService); }

    /**@description 是否是主包入口，只能有一個主包入口 */
    isMain = true;

    private checkInterval: number = null;

    // ---------- 生命週期 -------------------------------------------------------------

    // ---------- 框架呼叫 -------------------------------------------------------------

    /** 新增該模組網路事件 */
    protected addNetHandler(): void {
        App.handlerManager.get(WrapperHandler);
    }

    /** 移除本模組網路事件 */
    protected removeNetHandler(): void {
        App.handlerManager.destory(WrapperHandler);
    }

    /** 載入模組資源 */
    protected loadResources(completeCb: () => void) {
        const { horseMaterials, textures, clodParticle, dustParticle } = GameConfigModel.getData().filePaths;

        // // 設定載入資源
        this.loader.getLoadResources = () => {
            let res: Resource.Data[] = [
                { dir: horseMaterials, bundle: this.bundle, type: Material },
                { dir: textures, bundle: this.bundle, type: SpriteFrame },
                { url: clodParticle, bundle: this.bundle, type: Prefab },
                { url: dustParticle, bundle: this.bundle, type: Prefab },
            ];

            return res;
        };

        this.loader.onLoadProgress = (loadedCount, total, data) => {
            App.gameLoading.setLoading(loadedCount, total, data);
        };

        // 載入資源complete
        this.loader.onLoadComplete = (err) => {
            if (err = Resource.LoaderError.SUCCESS) {
                GameConfigModel.isLoadResourcesCompleted = true;
            }
        };

        // 執行載入動作
        this.loader.loadResources();
        this.checkCompleted(completeCb);
    }

    /** 初始化遊戲資料 */
    protected initData(): void {
        // GameConfigModel.isSocketInited = true; //測試用
        if (BUILD) { //打包後的不連socket
            GameConfigModel.isSocketInited = true;
            console.warn('直接不連socket');
        } else {
            // 初始化 wrapper socket
            this.initUrlConfig();
            App.serviceManager.get(WrapperService, true);
            this.serviceInit();
        }
    }

    protected pauseMessageQueue(): void {

    }

    protected resumeMessageQueue(): void {

    }

    /**@description 管理器通知自己進入GameView */
    onEnter(userData?: any) {
        super.onEnter(userData);

        Log.d(`--------------onEnterLogin--------------`);
        App.gameLoading.show();
    }

    /**@description 這個位置說明自己GameView 進入onLoad完成 */
    onEnterGameView(gameView: GameView) {
        super.onEnterGameView(gameView);
        //關閉除登入之外的介lo面

        App.uiManager.closeExcept([HorseGameView]);
        App.gameLoading.complete();
        console.warn('version', GameConfigModel.getData().version);

        GameConfigModel.renderMode = (<any>window)?.renderMode || (<any>window.parent)?.renderMode || ERenderMode.Default;
        // GameConfigModel.isRecordMode = true; //測試用
        if (typeof (<any>window)?.ready == 'function') {
            (<any>window)?.ready();
            dispatch(HorseGameEvent.RECORD_MODE);
            GameConfigModel.isRecordMode = true;
            GameConfigModel.recordMode = (<any>window)?.recordMode || ERecordMode.Default;
            console.warn('遊戲已準備就緒 錄影模式 (window.ready())');
        } else if (typeof (<any>window.parent)?.ready == 'function') {
            (<any>window.parent)?.ready();
            console.warn('遊戲已準備就緒 遊戲模式 (window.parent.ready())');
        }

        dispatch(HorseGameEvent.ON_ENTER_GAME);
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
            console.warn('initUrlConfig')
        }
    }

    /** 網路組件 */
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

    private checkCompleted(callback: Function) {
        this.checkInterval = setInterval(() => {
            if (GameConfigModel.isLoadResourcesCompleted && GameConfigModel.isSocketInited) {
                callback();
                clearInterval(this.checkInterval);
            }
        }, 100);
    }

    // ---------- 外部部呼叫 -----------------------------------------------------------
}