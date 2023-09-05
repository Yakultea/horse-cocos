import { Dispatcher } from "./core/event/Dispatcher";
import { UIManager } from "./core/ui/UIManager";
import { LocalStorage } from "./core/storage/LocalStorage";
import { _AssetManager } from "./core/asset/AssetManager";
import { CacheManager } from "./core/asset/CacheManager";
import { NodePoolManager } from "./core/nodePool/NodePoolManager";
import { UpdateManager } from "./core/update/UpdateManager";
import { BundleManager } from "./core/asset/BundleManager";
import { CocosExtentionInit } from "./plugin/CocosExtention";
import { Language } from "./core/language/Language";
import { Macro } from "./defines/Macros";
import { ProtoManager } from "./core/net/service/ProtoManager";
import { EntryManager } from "./core/entry/EntryManager";
import { DataCenter } from "./data/DataCenter";
import { LogicManager } from "./core/logic/LogicManager";
import { LoggerImpl } from "./core/log/Logger";
import { ServiceManager } from "./core/net/service/ServiceManager";
import { ReleaseManager } from "./core/asset/ReleaseManager";
import { HttpClient } from "./core/net/http/HttpClient";
import Singleton  from "./utils/Singleton";
import { LayoutManager } from "./core/layout/LayoutManager";
import { SenderManager } from "./core/net/service/SenderManager";
import { HandlerManager } from "./core/net/service/HandlerManager";
import { Utils } from "./utils/Utils";
import { CanvasHelper } from "./utils/CanvasHelper";
import { Platform } from "./platform/Platform";

/**@description 框架層使用的各管理器單例的管理 */
export class Framewok {

    /**@description 資源是否懶釋放，true時，只有收到平臺的記憶體警告才會釋放資源，還有在更新時才分釋放,否則不會釋放資源 */
    get isLazyRelease() {
        return false;
    }

    /**@description 資源釋放管理 */
    get releaseManger() {
        return Singleton.instance.get(ReleaseManager) as ReleaseManager;
    }

    /**@description 網路Service管理器 */
    get serviceManager() {
        return Singleton.instance.get(ServiceManager) as ServiceManager;
    }

    /**@description 網路訊息傳送管理器 */
    get senderManager() {
        return Singleton.instance.get(SenderManager) as SenderManager;
    }

    /**@description 網路訊息處理管理器 */
    get handlerManager() {
        return Singleton.instance.get(HandlerManager) as HandlerManager;
    }

    /**@description 日誌 */
    get logger() {
        return Singleton.instance.get(LoggerImpl) as LoggerImpl;
    }

    /**@description 邏輯管理器 */
    get logicManager() {
        return Singleton.instance.get(LogicManager) as LogicManager;
    }

    /**@description 資料中心 */
    get dataCenter() {
        return Singleton.instance.get(DataCenter) as DataCenter;
    }

    /**@description 入口管理器 */
    get entryManager() {
        return Singleton.instance.get(EntryManager) as EntryManager;
    }

    get utils() {
        return Singleton.instance.get(Utils) as Utils;
    }

    /**@description protobuf型別管理 */
    get protoManager() {
        return Singleton.instance.get(ProtoManager) as ProtoManager;
    }

    /**@description bundle管理器 */
    get bundleManager() {
        return Singleton.instance.get(BundleManager) as BundleManager;
    }

    /**@description 熱更新管理器 */
    get updateManager() {
        return Singleton.instance.get(UpdateManager) as UpdateManager;
    }

    /**@description 常駐資源指定的模擬view */
    get retainMemory(): any {
        return this.uiManager.retainMemory;
    }

    /**@description 語言包 */
    get language() {
        return Singleton.instance.get(Language) as Language;
    }

    /**@description 事件派發器 */
    get dispatcher() {
        return Singleton.instance.get(Dispatcher) as Dispatcher;
    }

    /**@description 介面管理器 */
    get uiManager() {
        return Singleton.instance.get(UIManager) as UIManager;
    }

    /**
     * @description 本地倉庫 
     * @deprecated 該介面已經棄用，請用使用storage替換
     * */
    get localStorage() {
        return this.storage;
    }

    /**@description 本地倉庫 */
    get storage() {
        return Singleton.instance.get(LocalStorage) as LocalStorage;
    }

    /**
     * @description 資源管理器 
     * @deprecated 該介面已經棄用，請用使用asset替換
     * */
    get assetManager() {
        return this.asset;
    }

    /**@description 資源管理器 */
    get asset() {
        return Singleton.instance.get(_AssetManager) as _AssetManager;
    }

    /**
     * @description 資源快取管理器
     * @deprecated 該介面已經棄用，請用使用cache替換
     * */
    get cacheManager() {
        return this.cache;
    }

    /**@description 資源快取管理器 */
    get cache() {
        return Singleton.instance.get(CacheManager) as CacheManager;
    }

    /**
     * @description 物件池管理器 
     * @deprecated 該介面已經棄用，請用使用pool替換
     * */
    get nodePoolManager() {
        return this.pool;
    }

    /**@description 物件池管理器 */
    get pool() {
        return Singleton.instance.get(NodePoolManager) as NodePoolManager;
    }

    get http() {
        return Singleton.instance.get(HttpClient) as HttpClient;
    }

    /**@description 小提示 */
    get tips(): any {
        return null;
    }

    /**@description 介面載入時的全屏Loading,顯示載入進度 */
    get uiLoading(): any {
        return null;
    }

    /**@description websocket wss 證書url地址 */
    get wssCacertUrl() {
        return "";
    }

    get layout() {
        return Singleton.instance.get(LayoutManager) as LayoutManager;
    }

    get canvasHelper() {
        return Singleton.instance.get(CanvasHelper) as CanvasHelper;
    }

    /**
     * @description 區分平臺相關處理
     */
    get platform() {
        return Singleton.instance.get(Platform) as Platform;
    }
    /**@description 當前遊戲GameView, GameView進入onLoad賦值 */
    gameView: GameView | null = null;

    getGameView<T extends GameView>() {
        return <T>this.gameView;
    }

    /**
     * @description 獲取語言包 
     * 
     */
    getLanguage(key: string, params: (string | number)[], bundle: BUNDLE_TYPE | null): string;
    getLanguage<T extends string & keyof LanguageData["data"]>(key: T, params?: (string | number)[], bundle?: BUNDLE_TYPE | null): LanguageData["data"][T];
    getLanguage<T extends string & keyof LanguageData["data"]>(key: string | T, params?: (string | number)[], bundle?: BUNDLE_TYPE | null): LanguageData["data"][T] | string {
        if (!bundle) {
            bundle = Macro.BUNDLE_RESOURCES;
        }
        if (!params) {
            params = [];
        }
        let configs: (string | number)[] = [];
        configs.push(`${Macro.USING_LAN_KEY}${bundle}.${key}`);
        configs.push(...params);
        return this.language.get(configs);
    }

    init() {
        //引擎擴充套件初始化
        CocosExtentionInit();
    }

    onLowMemory() {
        this.releaseManger.onLowMemory();
    }
}
