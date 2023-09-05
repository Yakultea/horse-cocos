import { isValid, js, Node, Prefab, Widget, instantiate, director, Component, find, View, Camera } from "cc";
import { DEBUG } from "cc/env";
import { ViewStatus } from "../../defines/Enums";
import { Macro } from "../../defines/Macros";
import AdapterView from "../adapter/AdapterView";
import { Resource } from "../asset/Resource";
import UIView from "./UIView";

/**@description 動態載入垃圾資料名 */
const DYNAMIC_LOAD_GARBAGE = "DYNAMIC_LOAD_GARBAGE";
/**@description 動畫載入全域性資料名 */
const DYNAMIC_LOAD_RETAIN_MEMORY = "DYNAMIC_LOAD_RETAIN_MEMORY";
export class ViewDynamicLoadData {
    private local = new Map<string, Resource.Info>();
    private remote = new Map<string, Resource.Info>();
    public name: string | null;

    constructor(name: string | null = null) {
        this.name = name;
    }

    /**@description 新增動態載入的本地資源 */
    public addLocal(info: Resource.Info, className: string | null = null) {
        if (info && info.url) {
            if (this.name == DYNAMIC_LOAD_GARBAGE) {
                Log.e(`找不到資源持有者: ${info.url}`);
            }
            if (DEBUG) App.uiManager.checkView(info.url, className);
            if (!this.local.has(info.url)) {
                App.asset.retainAsset(info);
                this.local.set(info.url, info);
            }
        }
    }

    /**@description 新增動態載入的遠端資源 */
    public addRemote(info: Resource.Info, className: string | null = null) {
        if (info && info.data && !this.remote.has(info.url)) {
            if (this.name == DYNAMIC_LOAD_GARBAGE) {
                Log.e(`找不到資源持有者 : ${info.url}`);
            }
            if (DEBUG) App.uiManager.checkView(info.url, className);
            App.cache.remoteCaches.retainAsset(info);
            this.remote.set(info.url, info);
        }
    }

    /**@description 清除遠端載入資源 */
    public clear() {
        if (this.name == DYNAMIC_LOAD_GARBAGE) {
            //先輸出
            let isShow = this.local.size > 0 || this.remote.size > 0;
            if (isShow) {
                Log.e(`當前未能釋放資源如下:`);
            }
            if (this.local && this.local.size > 0) {
                Log.e("-----------local-----------");
                if (this.local) {
                    this.local.forEach((info) => {
                        Log.e(info.url);
                    });
                }
            }
            if (this.remote && this.remote.size > 0) {
                Log.e("-----------remote-----------");
                if (this.remote) {
                    this.remote.forEach((info, url) => {
                        Log.e(info.url);
                    });
                }
            }

        } else {
            //先清除當前資源的引用關係
            if (this.local) {
                this.local.forEach((info) => {
                    App.asset.releaseAsset(info);
                });
                this.local.clear();
            }
            if (this.remote) {
                this.remote.forEach((info, url) => {
                    App.cache.remoteCaches.releaseAsset(info);
                });
                this.remote.clear();
            }
        }

    }
}

/**@description 介面資料，這裡需要處理一個問題，當一個介面開啟，收到另一個人的關閉，此時如果介面未載入完成
 * 可能導致另一個人關閉無效，等介面載入完成後，又顯示出來
 */
class ViewData {
    /**@description 介面是否已經載入 */
    isLoaded: boolean = false;
    /**@description 介面當前等待操作狀態 */
    status: ViewStatus = ViewStatus.WAITTING_NONE;
    /**@description 實際顯示介面 */
    view: UIView = null!;
    /**@description 等待載入完成回撥 */
    finishCb: ((view: any) => void)[] = [];
    /**@description 等待獲取介面回撥 */
    getViewCb: ((view: any) => void)[] = [];
    /**是否預載入,不顯示出來，但會加到當前場景上 */
    isPreload: boolean = false;
    /**@description 是否透過預置建立 */
    isPrefab: boolean = true;
    /**@description 資源資訊 */
    info: Resource.Info = null!;
    /**@description 介面的型別 */
    viewType: UIClass<UIView> = null!;
    /**@description bundle */
    bundle: BUNDLE_TYPE = null!;

    /**@description 介面動態載入的資料 */
    loadData: ViewDynamicLoadData = new ViewDynamicLoadData();

    node: Node = null!;

    private doGet(view: UIView | null, className: string, msg: string) {
        for (let i = 0; i < this.getViewCb.length; i++) {
            let cb = this.getViewCb[i];
            if (cb) {
                cb(view);
                if (DEBUG) Log.w(`ViewData do get view : ${className} msg : ${msg}`);
            }
        }

        this.getViewCb = [];
    }

    private doFinish(view: UIView | null, className: string, msg: string) {
        for (let i = 0; i < this.finishCb.length; i++) {
            let cb = this.finishCb[i];
            if (cb) {
                cb(view);
                if (DEBUG) Log.w(`ViewData do finish view : ${className} msg : ${msg}`);
            }
        }
        this.finishCb = [];
    }

    doCallback(view: UIView | null, className: string, msg: string) {
        this.doFinish(view, className, msg);
        this.doGet(view, className, msg);
    }
}

export class UIManager implements ISingleton {
    isResident?: boolean = true;
    static module: string = "【UI管理器】";
    module: string = null!;
    /**@description 檢視 */
    private _viewDatas: Map<string, ViewData> = new Map<string, ViewData>();
    private getViewData(className: string): ViewData;
    private getViewData<T extends UIView>(uiClass: UIClass<T>): ViewData;
    private getViewData(data: any): ViewData | undefined {
        let className = this.getClassName(data);
        if (!className) return undefined;
        let viewData = this._viewDatas.has(className) ? this._viewDatas.get(className) : undefined;

        return viewData;
    }

    /** 當前是否只開啟GameView */
    public IsOnlyGameViewOpen(className: string): boolean {
        if (this._viewDatas.has(className) && this._viewDatas.size == 1) {
            return true;
        }
        return false;
    }


    /**
     * @description 通過當前檢視，獲取檢視的型別
     * @param view 
     * @returns 
     */
    public getViewType<T extends UIView>(view: UIView): GameViewClass<T> {
        if (!isValid(view)) {
            return null as any;
        }

        let className = view.className;
        if (!className) return null as any;
        let viewData = this._viewDatas.get(className);
        if (viewData) {
            return viewData.viewType as any;
        } else {
            return null as any;
        }
    }

    private getClassName(className: string): string;
    private getClassName<T extends UIView>(uiClass: UIClass<T>): string;
    private getClassName(data: any): string | undefined {
        if (!data) return undefined;
        let className = undefined;
        if (typeof data == "string") {
            className = data;
        }
        else {
            className = js.getClassName(data);
        }
        return className;
    }

    /**@description 無主資源 */
    public garbage = new ViewDynamicLoadData(DYNAMIC_LOAD_GARBAGE);
    /**@description 駐留記憶體資源 */
    public retainMemory = new ViewDynamicLoadData(DYNAMIC_LOAD_RETAIN_MEMORY);

    private defaultOpenOption(options: OpenOption) {
        let out: DefaultOpenOption = {
            bundle: Macro.BUNDLE_RESOURCES,
            delay: options.delay,
            name: options.name,
            zIndex: 0,
            preload: false,
            type: options.type,
            args: options.args,
        };
        if (options.bundle != undefined) {
            out.bundle = options.bundle;
        }
        if (options.zIndex != undefined) {
            out.zIndex = options.zIndex;
        }
        if (options.preload != undefined) {
            out.preload = options.preload;
        }
        return out;
    }

    /**
     * @description 預載入檢視
     * @param uiClass 
     * @param bundle 
     * @returns 
     */
    public preload<T extends UIView>(uiClass: UIClass<T>, bundle: BUNDLE_TYPE) {
        return this.open({ type: uiClass, preload: true, bundle: bundle });
    }

    private parsePrefabUrl(url: string): { isPrefab: boolean, url: string; } {
        if (url[0] == "@") {
            return { isPrefab: false, url: url.substr(1) };
        } else {
            return { isPrefab: true, url: url };
        }
    }

    /**
     * @description 開啟檢視
     * @param type UIView檢視型別
     * @param OpenOption 開啟設定
     * @param viewOption 檢視顯示設定引數，即UIView.show引數
     * @returns 
     */
    public open<T extends UIView>(openOption: OpenOption): Promise<T> {
        let _OpenOption = this.defaultOpenOption(openOption);
        return this._open(_OpenOption);
    }

    private _open<T extends UIView>(openOption: DefaultOpenOption) {
        return new Promise<T>((reslove, reject) => {
            if (!openOption.type) {
                if (DEBUG) Log.d(`${this.module}open ui class error`);
                reslove(<any>null);
                return;
            }
            let className = js.getClassName(openOption.type);

            let root = this.viewRoot;
            if (!root) {
                if (DEBUG) Log.e(`${this.module}找不到場景的Canvas節點`);
                reslove(<any>null);
                return;
            }
            let viewData = this.getViewData(openOption.type);
            if (viewData) {
                viewData.isPreload = openOption.preload;
                //已經載入
                if (viewData.isLoaded) {
                    viewData.status = ViewStatus.WAITTING_NONE;
                    if (!openOption.preload) {
                        if (viewData.view && isValid(viewData.node)) {
                            viewData.node.zIndex = openOption.zIndex;
                            if (!viewData.node.parent) {
                                this.addView(viewData.node, openOption.zIndex);
                            }
                            viewData.view.show(openOption.args);
                        }
                    }
                    reslove(<T>viewData.view);
                    return;
                }
                else {
                    viewData.status = ViewStatus.WAITTING_NONE;
                    if (!openOption.preload) {
                        App.uiLoading.show(openOption.delay, openOption.name);
                    }
                    //正在載入中
                    if (DEBUG) Log.w(`${this.module}${className} 正在載入中...`);
                    viewData.finishCb.push(reslove);
                    return;
                }
            }
            else {
                viewData = new ViewData();
                viewData.loadData.name = className;
                let prefabUrl = openOption.type.getPrefabUrl();
                let result = this.parsePrefabUrl(prefabUrl);
                viewData.isPreload = openOption.preload;
                viewData.isPrefab = result.isPrefab;
                viewData.viewType = openOption.type;
                viewData.bundle = openOption.bundle;
                this._viewDatas.set(className, viewData);
                if (!result.isPrefab) {
                    //說明存在於主場景中
                    viewData.info = new Resource.Info;
                    viewData.info.url = result.url;
                    viewData.info.type = Prefab;
                    viewData.info.data = this.getScenePrefab(result.url) as any;
                    viewData.info.bundle = openOption.bundle;
                    this.createNode(viewData, reslove, openOption);
                    return;
                }
                let progressCallback: (completedCount: number, totalCount: number, item: any) => void = null!;

                if (!openOption.preload) {
                    App.uiLoading.show(openOption.delay, openOption.name);
                    //预加载界面不显示进度
                    progressCallback = (completedCount: number, totalCount: number, item: any) => {
                        let progress = Math.ceil((completedCount / totalCount) * 100);
                        App.uiLoading.updateProgress(progress);
                    };
                }
                this.loadPrefab(openOption.bundle, prefabUrl, progressCallback)
                    .then((prefab) => {
                        viewData.info = new Resource.Info;
                        viewData.info.url = prefabUrl;
                        viewData.info.type = Prefab;
                        viewData.info.data = prefab;
                        viewData.info.bundle = openOption.bundle;
                        App.asset.retainAsset(viewData.info);
                        this.createNode(viewData, reslove, openOption);
                        App.uiLoading.hide();
                    }).catch((reason) => {
                        viewData.isLoaded = true;
                        Log.e(reason);
                        this.close(openOption.type);
                        viewData.doCallback(null, className, "開啟介面異常");
                        reslove(<any>null);
                        let uiName = "";
                        if (DEBUG) {
                            uiName = className;
                        }
                        if (openOption.name) {
                            uiName = openOption.name;
                        }
                        App.tips.show(`加载界面${uiName}失败，请重试`);
                        App.uiLoading.hide();
                    });
            }
        });
    }

    private _addComponent(uiNode: Node, viewData: ViewData, openOption: DefaultOpenOption): UIView | null {
        if (uiNode) {
            let className = this.getClassName(viewData.viewType);
            //掛載指令碼
            let view = uiNode.getComponent(viewData.viewType);
            if (!view) {
                view = uiNode.addComponent(viewData.viewType);
                if (!view) {
                    if (DEBUG) Log.e(`${this.module}掛載指令碼失敗 : ${className}`);
                    return null;
                }
                else {
                    if (DEBUG) Log.d(`${this.module}掛載指令碼 : ${className}`);
                }
            }

            view.className = className;
            view.bundle = openOption.bundle;
            viewData.view = view;
            view.args = openOption.args;

            //介面顯示在螢幕中間
            let widget = view.getComponent(Widget);
            if (widget) {
                if (DEBUG) Log.e(`${this.module}請不要在根節點掛載cc.Widget元件`);
                widget.destroy();
            }
            if (!view.getComponent(AdapterView)) {
                view.addComponent(AdapterView);
            }
            if (!viewData.isPreload) {
                this.addView(uiNode, openOption.zIndex);
            }
            return view;
        }
        else {
            return null;
        }
    }

    private createNode(viewData: ViewData, reslove: any, openOptions: DefaultOpenOption) {
        viewData.isLoaded = true;
        let className = this.getClassName(viewData.viewType);
        if (viewData.status == ViewStatus.WAITTING_CLOSE) {
            //載入過程中有人關閉了介面
            reslove(null);
            if (DEBUG) Log.w(`${this.module}${className}正等待關閉`);
            //如果此時有地方正在獲取介面，直接返回空
            viewData.doCallback(null, className, "獲取界內已經關閉");
            return;
        }

        let uiNode: Node = instantiate(viewData.info.data as Prefab);
        viewData.node = uiNode;
        let view = this._addComponent(uiNode, viewData, openOptions);
        if (!view) {
            reslove(null);
            return;
        }

        if (viewData.status == ViewStatus.WATITING_HIDE) {
            //載入過程中有人隱藏了介面
            view.hide();
            if (DEBUG) Log.w(`${this.module}載入過程隱藏了介面${className}`);
            reslove(view);
            viewData.doCallback(view, className, "載入完成，但載入過程中被隱藏");
        }
        else {
            if (DEBUG) Log.d(`${this.module}open view : ${className}`);

            if (!viewData.isPreload) {
                view.show(openOptions.args);
            }
            reslove(view);
            viewData.doCallback(view, className, "載入完成，回撥之前載入中的介面");
        }
    }

    private loadPrefab(bundle: BUNDLE_TYPE, url: string, progressCallback: (completedCount: number, totalCount: number, item: any) => void) {
        return new Promise<Prefab>((resolove, reject) => {
            App.asset.load(bundle, url, Prefab, progressCallback, (data) => {
                if (data && data.data && data.data instanceof Prefab) {
                    resolove(data.data);
                }
                else {
                    reject(`載入prefab : ${url} 失敗`);
                }
            });
        });
    }

    private _canvas: Node = null!;

    private _viewRoot: Node = null!;
    private get viewRoot() {
        if (!this._viewRoot && !isValid(this._viewRoot)) {
            this._viewRoot = find("viewRoot", this.canvas) as Node;
        }
        return this._viewRoot;
    }

    private _componentRoot: Node = null!;
    get componentRoot() {
        if (!this._componentRoot && !isValid(this._componentRoot)) {
            this._componentRoot = find("componentRoot", this.canvas) as Node;
        }
        return this._componentRoot;
    }

    private _mainController: Component | null = null;
    /*獲取當前canvas的元件 */
    public get mainController(): Component | null {
        if (!this._mainController && !isValid(this._mainController)) {
            return this._mainController;
        }
        let canvas = this.canvas;
        if (canvas) {
            this._mainController = canvas.getComponent("MainController");
            return this._mainController;
        }
        return null;
    }

    private _prefabs: Node = null!;
    private get prefabs() {
        if (!this._prefabs && !isValid(this._prefabs)) {
            this._prefabs = find("prefabs", this.canvas) as Node;
        }
        return this._prefabs;
    }

    private _root3D: Node = null;
    /**@description 3d根節點 */
    public get root3D() {
        return find("3d", this.canvas.parent as Node) as Node;
    }

    /**@description 3d相機 */
    public get camera3d() {
        return find("Camera3D", this.canvas.parent as Node)?.getComponent(Camera) as Camera;
    }

    /**@description 截圖cavans */
    public get screenShotCamera() {
        return find("ScreenShotCamera", this.canvas as Node)?.getComponent(Camera) as Camera;
    }

    public get uiCamera() {
        return find("UICamera", this.canvas as Node)?.getComponent(Camera) as Camera;
    }

    /**@description 獲取主場景預置節點 */
    getScenePrefab(name: string) {
        return find(name, this.prefabs);
    }

    onLoad(node: Node) {
        this._canvas = node;
    }

    get canvas(): Node {
        return this._canvas;
    }

    public addView(node: Node, zOrder: number) {
        this.viewRoot.addChild(node);
        node.zIndex = zOrder;
        (<any>window)["cc"].updateZIndex(this.viewRoot);
    }

    /**@description 新增動態載入的本地資源 */
    public addLocal(info: Resource.Info, className: string) {
        if (info) {
            let viewData = this.getViewData(className);
            if (viewData) {
                viewData.loadData.addLocal(info, className);
            }
        }
    }



    /**@description 新增動態載入的遠端資源 */
    public addRemote(info: Resource.Info, className: string) {
        if (info) {
            let viewData = this.getViewData(className);
            if (viewData) {
                viewData.loadData.addRemote(info, className);
            }
        }
    }

    public close<T extends UIView>(uiClass: UIClass<T>): void;
    public close(className: string): void;
    public close(data: any): void {
        //當前所有介面都已經載入完成
        let viewData = this.getViewData(data);
        if (viewData) {
            viewData.status = ViewStatus.WAITTING_CLOSE;
            let className = this.getClassName(data);
            if (viewData.view && isValid(viewData.node)) {
                viewData.node.removeFromParent();
                viewData.node.destroy();
            }
            viewData.loadData.clear();
            if (viewData.isPrefab) {
                App.asset.releaseAsset(viewData.info);
            }
            this._viewDatas.delete(className);
            Log.d(`${this.module} close view : ${className}`);
        }
    }

    /**@description 關閉除傳入引數以外的所有其它介面,不傳入，關閉所有介面 */
    public closeExcept(views: (UIClass<UIView> | string | UIView)[]) {
        let self = this;
        if (views == undefined || views == null || views.length == 0) {
            //關閉所有介面
            if (DEBUG) Log.e(`請檢查引數，至少需要保留一個介面，不然就黑屏了，大兄弟`);
            this._viewDatas.forEach((viewData: ViewData, key: string) => {
                self.close(key);
            });
            return;
        }

        let viewClassNames = new Set<string>();

        for (let i = 0; i < views.length; i++) {
            viewClassNames.add(this.getClassName(views[i] as any));
        }

        this._viewDatas.forEach((viewData: ViewData, key: string) => {
            if (viewClassNames.has(key)) {
                //如果包含，不做處理，是排除項
                return;
            }
            self.close(key);
        });
    }

    /**@description 關閉指定bundle的檢視 */
    public closeBundleView(bundle: BUNDLE_TYPE) {
        let self = this;
        this._viewDatas.forEach((viewData, key) => {
            if (viewData.bundle == bundle) {
                self.close(key);
            }
        });
    }
    public hide(className: string): void;
    public hide<T extends UIView>(uiClass: UIClass<T>): void;
    public hide(data: any): void {
        let viewData = this.getViewData(data);
        if (viewData) {
            if (viewData.isLoaded) {
                //已經載入完成，說明已經是直實存在的介面，按照正常遊戲進行刪除
                if (viewData.view && isValid(viewData.view.node)) {
                    viewData.view.hide();
                }
                if (DEBUG) Log.d(`${this.module}hide view : ${viewData.loadData.name}`);
            }
            else {
                //沒有載入寫成，正常載入中
                viewData.status = ViewStatus.WATITING_HIDE;
            }
        }
    }

    public getView(className: string): Promise<any>;
    public getView<T extends UIView>(uiClass: UIClass<T>): Promise<T>;
    public getView(data: any): any {
        return new Promise<any>((resolove, reject) => {
            if (data == undefined || data == null) {
                resolove(null);
                return;
            }
            let viewData = this.getViewData(data);
            if (viewData) {
                if (viewData.isPreload) {
                    //如果只是預載入，返回空，讓使用者用open的方式開啟
                    resolove(null);
                } else {
                    if (viewData.isLoaded) {
                        resolove(viewData.view);
                    }
                    else {
                        //載入中
                        viewData.getViewCb.push(resolove);
                    }
                }
            }
            else {
                resolove(null);
            }
        });
    }

    public checkView(url: string, className: string | null) {
        if (DEBUG && className) {
            this.getView(className).then((view) => {
                if (!view) {
                    let viewData = this.getViewData(className);
                    if (viewData) {
                        //預置載入返回的view是空
                        //排除掉這種方式的
                        if (!viewData.isPreload) {
                            Log.e(`資源 : ${url} 的持有者必須由UIManager.open方式開啟`);
                        }
                    } else {
                        Log.e(`資源 : ${url} 的持有者必須由UIManager.open方式開啟`);
                    }
                }
            });
        }
    }

    public isShow(className: string): boolean;
    public isShow<T extends UIView>(uiClass: UIClass<T>): boolean;
    public isShow(data: any) {
        let viewData = this.getViewData(data);
        if (!viewData) {
            return false;
        }
        if (viewData.isLoaded && viewData.status == ViewStatus.WAITTING_NONE) {
            if (viewData.view) return viewData.view.node.active;
        }
        return false;
    }

    public addComponent<T extends Component>(type: { new(): T; }): T;
    public addComponent(className: string): any;
    public addComponent(data: any) {
        let root = this.componentRoot;
        if (root) {
            let component = root.getComponent(data);
            if (component) {
                if (typeof data == "string") {
                    if (DEBUG) Log.w(`${this.module}已經存在 Component ${component}`);
                }
                else {
                    if (DEBUG) Log.w(`${this.module}已經存在 Component ${js.getClassName(data)}`);
                }
                return component;
            }
            else {
                return root.addComponent(data);
            }
        }
        return null;
    }

    public removeComponent(component: string | Component) {
        let root = this.componentRoot;
        if (root) {
            let comp = root.getComponent(component as any);
            if (comp) {
                comp.destroy();
            }
        }
    }

    debug(config: { showViews?: boolean, showChildren?: boolean, showComp?: boolean; }) {
        if (!config) {
            config = {};
            config.showChildren = true;
            config.showComp = true;
            config.showViews = true;
        }
        if (config.showViews) {
            Log.d(`-----------當前所有檢視------------`);
            this._viewDatas.forEach((value, key) => {
                Log.d(`[${key}] isLoaded : ${value.isLoaded} status : ${value.status} view : ${js.getClassName(value.view)} active : ${value.view && value.view.node ? value.view.node.active : false}`);
            });
        }
        if (config.showChildren) {
            let root = this.viewRoot;
            if (root) {
                Log.d(`-----------當前所有節點資訊------------`);
                let children = root.children;
                for (let i = 0; i < children.length; i++) {
                    let data = children[i];
                    Log.d(`${data.name} active : ${data.active}`);
                }
            }
        }
        if (config.showComp) {
            let root: any = this.componentRoot;
            if (root) {
                Log.d(`-----------當前所有元件資訊------------`);
                let comps: any[] = root._components;
                for (let i = 0; i < comps.length; i++) {
                    Log.d(js.getClassName(comps[i]));
                }
            }
        }
    }
}