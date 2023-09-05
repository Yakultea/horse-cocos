import { Asset } from "cc";
import { DEBUG } from "cc/env";
import { Resource } from "./Resource";

/**
 * @description 資源載入器
 */
export default class ResourceLoader {

    /** @description 載入資源資料 */
    private _resources: Map<string, Resource.Data> = new Map<string, Resource.Data>();
    /**@description 當前已經載入的資源數量 */
    private _loadedCount: number = 0;

    /**@description 載入完成後的資料，為了方便釋放時精準釋放，沒載入成功的資源，不在做釋放的判斷 */
    private _loadedResource: Map<string, Resource.Info> = new Map<string, Resource.Info>();

    /**@description 當前是否正在載入資源 */
    private _isLoading: boolean = false;

    /**@description 標識 */
    private _tag: string = null!;
    public get tag() { return this._tag; }
    public set tag(tag: string) { this._tag = tag; }

    /**@description 載入完成回撥 */
    private _onLoadComplete?: (error: Resource.LoaderError) => void;
    public set onLoadComplete(cb) {
        this._onLoadComplete = cb;
    }
    public get onLoadComplete() {
        return this._onLoadComplete;
    }

    /**@description 載入進度 */
    public _onLoadProgress?: (loadedCount: number, total: number, data: Resource.CacheData) => void;
    public set onLoadProgress(value) {
        this._onLoadProgress = value;
    }
    public get onLoadProgress() {
        return this._onLoadProgress;
    }


    /**
     * @description 實現類必須給個需要載入資源
     */
    private _getLoadResource?: () => Resource.Data[];
    public set getLoadResources(func) {
        this._getLoadResource = func;
    }
    public get getLoadResources() {
        return this._getLoadResource;
    }

    /**
     * @description 載入資源
     */
    public loadResources() {

        if (!this.getLoadResources) {
            if (DEBUG) Log.e("未指定 getLoadResources 函式");
            this.onLoadComplete && this.onLoadComplete(Resource.LoaderError.NO_FOUND_LOAD_RESOURCE);
            return;
        }

        let res = this.getLoadResources();
        if (!res) {
            if (DEBUG) Log.e(`未指定載入資源`);
            this.onLoadComplete && this.onLoadComplete(Resource.LoaderError.NO_FOUND_LOAD_RESOURCE);
            return;
        }
        if (res.length <= 0) {
            if (DEBUG) Log.w(`載入的資源為空`);
            this.onLoadComplete && this.onLoadComplete(Resource.LoaderError.NO_FOUND_LOAD_RESOURCE);
            return;
        }

        //如果正在載入中，防止重複呼叫
        if (this._isLoading) {
            if (DEBUG) Log.w(`資源載入中，未完成載入`);
            this.onLoadComplete && this.onLoadComplete(Resource.LoaderError.LOADING);
            return;
        }

        if (this._resources.size > 0 && this.isLoadComplete()) {
            if (DEBUG) Log.w(`資源已經載入完成，使用已經載入完成的資源`);
            this.onLoadComplete && this.onLoadComplete(Resource.LoaderError.SUCCESS);
            this.onLoadResourceComplete();
            return;
        }

        this._isLoading = true;
        //為防止重複，這裡把資源放在一個map中
        res.forEach((value, index) => {
            if (value.url) {
                this._resources.set(value.url, value);
            } else if (value.dir) {
                this._resources.set(value.dir, value);
            } else {
                if (value.preloadView) this._resources.set(value.preloadView.getPrefabUrl(), value);
            }
        });

        this._loadedCount = 0;
        this._resources.forEach((value, key, source) => {
            if (value.preloadView) {
                App.uiManager.preload(value.preloadView, value.bundle as BUNDLE_TYPE).then((view) => {
                    let cache = new Resource.CacheData();
                    cache.isLoaded = true;
                    cache.data = <any>view;
                    if (value.preloadView) cache.info.url = value.preloadView.getPrefabUrl();
                    cache.info.bundle = value.bundle as BUNDLE_TYPE;
                    this._onLoadResourceComplete(cache);
                });
            } else if (value.dir) {
                App.asset.loadDir(value.bundle as BUNDLE_TYPE, value.dir, <any>(value.type), <any>null, this._onLoadResourceComplete.bind(this));
            } else {
                App.asset.load(value.bundle as BUNDLE_TYPE, value.url as string, <any>(value.type), <any>null, this._onLoadResourceComplete.bind(this));
            }
        });
    }

    /**
     * @description 解除安裝已經載入資源資源
     */
    public unLoadResources() {
        this._unLoadResources();
    }

    private _unLoadResources() {
        if (this._isLoading || this._resources.size <= 0) {
            //當前正在載入中
            if (this._isLoading) {
                Log.d("resources is loading , waiting for unload!!!");
            }
            return;
        }
        if (this._resources.size > 0) {
            this._resources.forEach((value) => {
                if (value.url) {
                    if (this._loadedResource.has(value.url)) {
                        let data = this._loadedResource.get(value.url);
                        if (data) {
                            App.asset.releaseAsset(data);
                        }
                        this._loadedResource.delete(value.url);
                    }
                } else if (value.dir) {
                    if (this._loadedResource.has(value.dir)) {
                        let data = this._loadedResource.get(value.dir);
                        if (data) {
                            App.asset.releaseAsset(data);
                        }
                        this._loadedResource.delete(value.dir);
                    }
                }
            });
        }
        //重置標記
        this._isLoading = false;
        this._loadedCount = 0;
        this._resources.clear();
    }

    private _onLoadResourceComplete(data: Resource.CacheData) {
        this._loadedCount++;

        if (this._onLoadProgress) {
            if (this._loadedCount > this._resources.size) {
                this._loadedCount = this._resources.size;
            }
            //cc.log(`----------loadprogress ${this._loadedCount} / ${this._resources.length}--------------`);
            this._onLoadProgress(this._loadedCount, this._resources.size, data);
        }

        if (data && (Array.isArray(data.data) || data.data instanceof Asset)) {
            //排除掉介面管理器
            let info = new Resource.Info;
            info.url = data.info.url;
            info.type = data.info.type;
            info.data = data.data;
            info.bundle = data.info.bundle;
            App.asset.retainAsset(info);
            this._loadedResource.set(info.url, info);
        }

        this.checkLoadResourceComplete();
    }
    /**
     * @description 資源載入完成
     */
    protected checkLoadResourceComplete() {
        //丟擲事件給業務邏輯處理
        if (this.isLoadComplete()) {
            //載入完成
            this._isLoading = false;

            this.onLoadComplete && this.onLoadComplete(Resource.LoaderError.SUCCESS);
            this.onLoadResourceComplete();
        }
    }

    /**@description 載入資源完成 */
    protected onLoadResourceComplete() {

    }

    public isLoadComplete(): boolean {
        return this._loadedCount >= this._resources.size;
    }

}