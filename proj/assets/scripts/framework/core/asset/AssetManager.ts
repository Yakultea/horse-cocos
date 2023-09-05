import { Asset, assetManager, AssetManager, JsonAsset, TextAsset, Texture2D, sp, SpriteFrame, ImageAsset } from "cc";
import { DEBUG } from "cc/env";
import { Macro } from "../../defines/Macros";
import { Resource } from "./Resource";

class RemoteLoader {

    private _logTag = `[RemoteLoader] `;

    public loadImage(url: string, isNeedCache: boolean) {
        let me = this;
        return new Promise<SpriteFrame | null>((resolve) => {
            if (url == null || url == undefined || url.length <= 0) {
                resolve(null);
                return;
            }
            if (isNeedCache) {
                //如果存在缓存 ，直接取出
                let spCache = App.cache.remoteCaches.getSpriteFrame(url);
                if (spCache && spCache.data) {
                    // if (DEBUG) Log.d(this._logTag, `從快取精靈幀中獲取:${url}`);
                    resolve(<SpriteFrame>(spCache.data));
                    return;
                } else {
                    //錯誤處理
                    if (DEBUG) {
                        if ( spCache ) Log.d(this._logTag, `錯誤資源，刪除快取資訊，重新載入:${url}`);
                    }
                    App.cache.remoteCaches.remove(url);
                }
            } else {
                //不需要缓存，先删除之前的,再重新加载
                if (DEBUG) Log.d(this._logTag, `不需要缓存信息，删除缓存，重新加载${url}`);
                App.cache.remoteCaches.remove(url);
            }
            me._loadRemoteRes(url, Texture2D, isNeedCache).then((data: any) => {
                //改变缓存类型
                let cache = App.cache.remoteCaches.get(url);
                if (data && cache) {
                    if (DEBUG) Log.d(`${this._logTag}載入圖片完成${url}`);
                    cache.data = data;
                    (<Asset>cache.data).name = url;
                    let spriteFrame = App.cache.remoteCaches.setSpriteFrame(url, cache.data);
                    resolve(spriteFrame);
                } else {
                    if (DEBUG) Log.w(`${this._logTag}載入圖片錯誤${url}`);
                    resolve(null);
                }
            })
        });
    }

    public loadSkeleton(path: string, name: string, isNeedCache: boolean) {
        let me = this;
        return new Promise<sp.SkeletonData | null>((resolve) => {
            if (path && name) {
                let url = `${path}/${name}`;
                let spineAtlas = `${path}/${name}.atlas`;
                let spinePng = `${path}/${name}.png`;
                let spineJson = `${path}/${name}.json`;
                let res = App.releaseManger.getRemote(url);
                if (res) {
                    let cache = App.cache.remoteCaches.get(url);
                    if (cache) {
                        cache.isLoaded = true;
                        cache.data = res;
                        cache.info.data = res;
                        cache.info.url = url;
                        resolve(<sp.SkeletonData>(cache.data));
                        cache.doFinish(cache.data);
                    }else{
                        cache = new Resource.CacheData();
                        cache.info.resourceType = Resource.Type.Remote;
                        cache.info.type = sp.SkeletonData;
                        cache.info.bundle = Macro.BUNDLE_REMOTE;
                        cache.isLoaded = true;
                        cache.data = res;
                        cache.info.data = res;
                        cache.info.url = url;
                        App.cache.remoteCaches.set(url, cache);
                        resolve(<sp.SkeletonData>(cache.data));
                        cache.doFinish(cache.data);
                    }
                    return;
                }
                let cache = App.cache.remoteCaches.get(url);
                if (cache) {
                    if (cache.isLoaded) {
                        resolve(<sp.SkeletonData>(cache.data));
                    } else {
                        cache.finishCb.push(resolve);
                    }
                } else {
                    cache = new Resource.CacheData();
                    cache.info.resourceType = Resource.Type.Remote;
                    cache.info.type = sp.SkeletonData;
                    cache.info.bundle = Macro.BUNDLE_REMOTE;
                    App.cache.remoteCaches.set(url, cache);
                    me._loadRemoteRes(spinePng, Asset, isNeedCache).then((image: ImageAsset) => {
                        if (image) {
                            me._loadRemoteRes(spineJson, JsonAsset, isNeedCache).then((json: JsonAsset) => {
                                if (json) {
                                    me._loadRemoteRes(spineAtlas, JsonAsset, isNeedCache).then((atlas: TextAsset) => {
                                        if (atlas) {
                                            //生成SkeletonData資料
                                            let asset = new sp.SkeletonData;
                                            asset.skeletonJson = json.json;
                                            asset.atlasText = atlas.text;
                                            let texture = new Texture2D();
                                            texture.image = image;
                                            asset.textures = [texture];
                                            let pngName = name + ".png"
                                            asset.textureNames = [pngName];
                                            cache = cache as Resource.CacheData;
                                            cache.info.url = url;
                                            asset.name = url;
                                            cache.data = asset;
                                            cache.isLoaded = true;
                                            resolve(<sp.SkeletonData>(cache.data));
                                            cache.doFinish(cache.data);
                                        } else {
                                            resolve(null);
                                            cache = cache as Resource.CacheData;
                                            cache.doFinish(null);
                                            App.cache.remoteCaches.remove(url);
                                        }
                                    });
                                } else {
                                    resolve(null);
                                    cache = cache as Resource.CacheData;
                                    cache.doFinish(null);
                                    App.cache.remoteCaches.remove(url);
                                }
                            });
                        } else {
                            resolve(null);
                            cache = cache as Resource.CacheData;
                            cache.doFinish(null);
                            App.cache.remoteCaches.remove(url);
                        }
                    })
                }
            } else {
                resolve(null);
            }
        });
    }

    private _loadRemoteRes(url: string, type: typeof Asset, isNeedCache: boolean) {
        return new Promise<any>((resolve) => {
            let cache = App.cache.remoteCaches.get(url);
            if (cache) {
                //有快取,檢視是否已經載入
                if (cache.isLoaded) {
                    //如果已經載入完成
                    resolve(cache.data);
                } else {
                    //正在載入中
                    cache.finishCb.push(resolve);
                }
            } else {
                //沒有快取存在,生成載入快取
                cache = new Resource.CacheData();
                cache.info.resourceType = Resource.Type.Remote;
                cache.info.type = type;
                App.cache.remoteCaches.set(url, cache);
                let res = App.releaseManger.getRemote(url);
                if (res) {
                    cache.isLoaded = true;
                    cache.data = res;
                    (<Asset>cache.data).addRef();
                    //把再載入過程裡，雙載入同一資源的回撥都回調回去
                    cache.doFinish(res);
                    resolve(cache.data);
                    return;
                }
                assetManager.loadRemote(url, { cacheAsset: true, reloadAsset: !isNeedCache }, (error, data) => {
                    if (cache) {
                        cache.isLoaded = true;
                        if (data) {
                            cache.data = data;
                            (<Asset>cache.data).addRef();
                            if (DEBUG) Log.d(`${this._logTag}載入遠端資源完成:${url}`);
                        }
                        else {
                            if (DEBUG) Log.w(`${this._logTag}載入本地資源異常:${url}`);
                        }
                        //把再載入過程裡，雙載入同一資源的回撥都回調回去
                        cache.doFinish(data);
                        resolve(cache.data)
                    }
                })
            }
        });
    }

    /**@description 由主遊戲控制器驅動，在下載遠端資源時，設定一個上限下載任務資料，以免同一時間任務數量過大 */
    update() {

    }
}


export class _AssetManager implements ISingleton{
    isResident?: boolean = true;
    static module: string = "【AssetManager】";
    module: string = null!;
    private _remote = new RemoteLoader();
    public get remote() { return this._remote; }
    /**
     * @description 獲取Bundle
     * @param bundle Bundle名|Bundle
     */
    private getBundle(bundle: BUNDLE_TYPE) {
        return App.bundleManager.getBundle(bundle);
    }

    public load(
        bundle: BUNDLE_TYPE,
        path: string,
        type: typeof Asset,
        onProgress: (finish: number, total: number, item: AssetManager.RequestItem) => void,
        onComplete: (data: Resource.CacheData) => void): void {
        if (DEBUG) {
            Log.d(`load bundle : ${bundle} path : ${path}`)
        }
        let cache = App.cache.get(bundle, path);
        if (cache) {
            //存在快取資訊
            if (cache.isLoaded) {
                //已經載入完成
                if (DEBUG && cache.status == Resource.CacheStatus.WAITTING_FOR_RELEASE) {
                    Log.w(this.module, `資源:${path} 等待釋放，但資源已經載入完成，此時有人又重新載入，不進行釋放處理`);
                }
                //載入完成
                onComplete(cache);
            } else {
                if (DEBUG && cache.status == Resource.CacheStatus.WAITTING_FOR_RELEASE) {
                    Log.w(this.module, `資源:${path}等待釋放，但資源處理載入過程中，此時有人又重新載入，不進行釋放處理`);
                }
                cache.finishCb.push(onComplete);
            }
            //重新復位資源狀態
            cache.status = Resource.CacheStatus.NONE;
        } else {
            //無快取資訊
            cache = new Resource.CacheData();
            cache.info.url = path;
            cache.info.type = type;
            cache.info.bundle = bundle;
            App.cache.set(bundle, path, cache);
            console.time(`加载资源 : ${cache.info.url}`);

            //先到释放管理器中查找 
            let res = App.releaseManger.get(bundle, path);
            if (res) {
                this._onLoadComplete(cache, onComplete, null, res);
                return;
            }
            let _bundle = this.getBundle(bundle);
            if (!_bundle) {
                //如果bundle不存在
                let error = new Error(`${this.module} ${bundle} 沒有載入，請先載入`);
                this._onLoadComplete(cache, onComplete, error, null);
                return;
            }
            res = _bundle.get(path, type);
            if (res) {
                this._onLoadComplete(cache, onComplete, null, res);
            } else {
                if (onProgress) {
                    _bundle.load(path, type, onProgress, this._onLoadComplete.bind(this, cache, onComplete));
                } else {
                    _bundle.load(path, type, this._onLoadComplete.bind(this, cache, onComplete));
                }
            }
        }
    }

    private _onLoadComplete(cache: Resource.CacheData, complete: (data: Resource.CacheData) => void, err: Error | null, data: Asset | Asset[] | null) {
        cache.isLoaded = true;
        //新增引用關係
        let tempCache = cache;
        if (err) {
            Log.e(`${this.module}載入資源失敗:${cache.info.url} 原因:${err.message ? err.message : "未知"}`);
            cache.data = null;
            tempCache.data = null;
            App.cache.remove(cache.info.bundle, cache.info.url);
            complete(cache);
        }
        else {
            if (DEBUG) Log.d(`${this.module}載入資源成功:${cache.info.url}`);
            cache.data = data;
            tempCache.data = data;
            complete(cache);
        }

        //載入過程，有不同地方呼叫過來載入同一個資源的地方，都回調回去
        cache.doFinish(tempCache);
        cache.doGet(tempCache.data);

        if (cache.status == Resource.CacheStatus.WAITTING_FOR_RELEASE) {
            if (DEBUG) Log.w(this.module, `資源:${cache.info.url}載入完成，但快取狀態為等待銷燬，銷燬資源`);
            if (cache.data) {
                cache.status = Resource.CacheStatus.NONE;
                let info = new Resource.Info;
                info.url = cache.info.url;
                info.type = cache.info.type;
                info.data = cache.data;
                info.bundle = cache.info.bundle;
                this.releaseAsset(info);
            }
        }
        if (DEBUG){
            console.timeEnd(`載入資源 : ${cache.info.url}`);
        }
    }

    public loadDir(
        bundle: BUNDLE_TYPE,
        path: string,
        type: typeof Asset,
        onProgress: (finish: number, total: number, item: AssetManager.RequestItem) => void,
        onComplete: (data: Resource.CacheData) => void): void {
        if (DEBUG) {
            Log.d(`load bundle : ${bundle} path : ${path}`)
        }
        let cache = App.cache.get(bundle, path);
        if (cache) {
            //存在快取資訊
            if (cache.isLoaded) {
                //已經載入完成
                if (DEBUG && cache.status == Resource.CacheStatus.WAITTING_FOR_RELEASE) {
                    Log.w(this.module, `資源:${path} 等待釋放，但資源已經載入完成，此時有人又重新載入，不進行釋放處理`);
                }
                //載入完成
                onComplete(cache);
            } else {
                if (DEBUG && cache.status == Resource.CacheStatus.WAITTING_FOR_RELEASE) {
                    Log.w(this.module, `資源:${path}等待釋放，但資源處理載入過程中，此時有人又重新載入，不進行釋放處理`);
                }
                cache.finishCb.push(onComplete);
            }
            //重新復位資源狀態
            cache.status = Resource.CacheStatus.NONE;
        } else {
            //無快取資訊
            cache = new Resource.CacheData();
            cache.info.url = path;
            cache.info.type = type;
            cache.info.bundle = bundle;
            App.cache.set(bundle, path, cache);
            console.time(`加载资源 : ${cache.info.url}`);

            let res = App.releaseManger.get(bundle, path);
            if (res) {
                this._onLoadComplete(cache, onComplete, null, res);
                return;
            }

            let _bundle = this.getBundle(bundle);
            if (!_bundle) {
                //如果bundle不存在
                let error = new Error(`${this.module} ${bundle} 沒有載入，請先載入`);
                this._onLoadComplete(cache, onComplete, error, null);
                return;
            }
            if (onProgress) {
                _bundle.loadDir(path, type, onProgress, this._onLoadComplete.bind(this, cache, onComplete));
            } else {
                _bundle.loadDir(path, type, this._onLoadComplete.bind(this, cache, onComplete));
            }
        }
    }

    public releaseAsset(info: Resource.Info) {
        if (info && info.bundle) {
            let cache = App.cache.get(info.bundle, info.url, false);
            if (!cache) {
                return;
            } else {
                if (cache.isInvalid) {
                    if (DEBUG) Log.w(`資源已經釋放 url : ${info.url}`);
                    return;
                }
            }
            if (cache.isLoaded) {
                if (cache.info.retain) {
                    if (DEBUG) Log.d(`常駐資源 url : ${cache.info.url}`);
                    return;
                }

                if (App.cache.removeWithInfo(info)) {
                    App.releaseManger.release(info);
                } else {
                    if (DEBUG) {
                        if (Array.isArray(info.data)) {
                            for (let i = 0; i < info.data.length; i++) {
                                if (info.data[i].refCount > 0) {
                                    Log.w(`資源bundle : ${info.bundle} url : ${info.url}/${info.data[i].name} 被其它介面引用 refCount : ${info.data[i].refCount}`)
                                }
                            }
                        } else {
                            Log.w(`資源bundle : ${info.bundle} url : ${info.url} 被其它介面引用 refCount : ${info.data.refCount}`)
                        }
                    }
                }
            } else {
                cache.status = Resource.CacheStatus.WAITTING_FOR_RELEASE;
                if (DEBUG) Log.w(`${cache.info.url} 正在載入，等待載入完成後進行釋放`);
            }

        }
    }

    public retainAsset(info: Resource.Info) {
        if (info) {
            let cache = App.cache.get(info.bundle, info.url)
            if (cache) {
                if (DEBUG) {
                    if (info.data != cache.data) {
                        Log.e(`錯誤的retainAsset :${info.url}`);
                    }
                }
                if (!cache.info.retain) {
                    cache.info.retain = info.retain;
                }
                if (Array.isArray(cache.data)) {
                    //裡面是陣列 
                    for (let i = 0; i < cache.data.length; i++) {
                        cache.data[i] && cache.data[i].addRef();
                    }
                } else {
                    cache.data && cache.data.addRef();
                }
            } else {
                if (DEBUG) Log.e(`retainAsset cache.data is null`);
            }
        } else {
            if (DEBUG) Log.e(`retainAsset info is null`);
        }
    }

    /**
     * @description 新增常駐資源
     * @param prefab 
     */
    public addPersistAsset(url: string, data: Asset, bundle: BUNDLE_TYPE) {
        let info = new Resource.Info;
        info.url = url;
        info.data = data;
        info.bundle = bundle;
        info.retain = true;
        this.retainAsset(info);
    }
}