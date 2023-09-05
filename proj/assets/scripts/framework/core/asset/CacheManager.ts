import UIView from "../ui/UIView";
import { DEBUG } from "cc/env";
import { Asset, isValid, js, SpriteAtlas, SpriteFrame, sp, Texture2D, ImageAsset } from "cc";
import { Resource } from "./Resource";
import { Macro } from "../../defines/Macros";
class ResourceCache {

    private _caches = new Map<string, Resource.CacheData>();
    private name = Macro.UNKNOWN;
    constructor(name: string) {
        this.name = name;
    }

    public get(path: string, isCheck: boolean) {
        if (this._caches.has(path)) {
            let cache = this._caches.get(path);
            if (isCheck && cache && cache.isInvalid) {
                //資源已經釋放
                Log.w(`資源載入完成，但已經被釋放 , 重新載入資源 : ${path}`);
                this.remove(path);
                return null;
            }
            return this._caches.get(path);
        }
        return null;
    }

    public set(path: string, data: Resource.CacheData) {
        this._caches.set(path, data);
    }

    public remove(path: string) {
        return this._caches.delete(path);
    }

    public removeUnuseCaches() {
        this._caches.forEach((value, key, origin) => {
            if (Array.isArray(value.data)) {
                let isAllDelete = true;
                for( let i = 0 ; i < value.data.length ; i++){
                    if( value.data[i] && value.data[i].refCount > 0 ){
                        isAllDelete = false;
                    }
                }
                if (isAllDelete) {
                    this._caches.delete(key);
                    if (DEBUG) Log.d(`刪除不使用的資源目錄 bundle : ${this.name} dir : ${key}`);
                }
            }else{
                if( value.data && value.data.refCount <= 0 ){
                    this._caches.delete(key);
                    if (DEBUG) Log.d(`刪除不使用的資源 bundle : ${this.name} url : ${key}`);
                }
            }
        });
    }

    public get size() {
        return this._caches.size;
    }

    debug(){
        let key = this.name;
        let caches = this._caches;
        if (DEBUG) Log.d(`----------------Bundle ${key} 資源快取資訊開始----------------`)
        let content: any[] = [];
        let invalidContent: any[] = [];
        caches.forEach((data, key, source) => {
            let itemContent = {
                url: data.info.url,
                isLoaded: data.isLoaded,
                isValid: isValid(data.data),
                assetType: js.getClassName(data.info.type),
                data: data.data ? js.getClassName(data.data) : null,
                status: data.status
            }
            let item = { url: key, data: itemContent };

            if (data.isLoaded && data.data && !isValid(data.data)) {
                invalidContent.push(item);
            } else {
                content.push(item);
            }
        });
        if (content.length > 0) {
            Log.d(`----------- 有效快取資訊 -----------`);
            Log.d(JSON.stringify(content));
        }
        if (invalidContent.length > 0) {
            Log.d(`----------- 無效快取資訊 -----------`);
            Log.d(JSON.stringify(invalidContent));
        }
        if (DEBUG) Log.d(`----------------Bundle ${key} 資源快取資訊結束----------------`)
    }
}

class CacheInfo {
    refCount = 0;
    url: string = "";
    /**@description 是否常駐於記憶體中 */
    retain: boolean = false;
}

class RemoteCaches {
    private _caches = new Map<string, Resource.CacheData>();
    private _spriteFrameCaches = new Map<string, Resource.CacheData>();
    private _resMap = new Map<string, CacheInfo>();
    /**
     * @description 獲取遠端快取資料
     * @param type 遠端獎狀型別
     * @param url 遠端地址
     */
    public get(url: string) {
        if (this._caches.has(url)) {
            return this._caches.get(url);
        }
        return null;
    }

    public getSpriteFrame(url: string) {
        if (this._spriteFrameCaches.has(url)) {
            let cache = this._spriteFrameCaches.get(url);
            let texture2D = this.get(url);
            if (texture2D) {
                return cache;
            } else {
                this.remove(url);
                return null;
            }
        }
        return null;
    }
    public setSpriteFrame(url: string, data: any): SpriteFrame | null {
        if (data && data instanceof ImageAsset) {
            //同一圖片載入兩次也會回撥到這裡，這裡如果當前精靈快取中有，不在重新建立
            let spriteFrame = this.getSpriteFrame(url);
            if (spriteFrame) {
                return <SpriteFrame>(spriteFrame.data);
            }
            let cache = new Resource.CacheData();
            let sp = new SpriteFrame();
            let texture = new Texture2D();
            texture.image = data
            sp.texture = texture;
            cache.data = sp;
            cache.isLoaded = true;
            cache.info.url = url;
            this._spriteFrameCaches.set(url, cache);
            return <SpriteFrame>(cache.data);
        }
        return null;
    }

    public set(url: string, data: Resource.CacheData) {
        data.info.url = url;
        this._caches.set(url, data);
    }

    private _getCacheInfo(info: Resource.Info, isNoFoundCreate: boolean = true) {
        if (info && info.url && info.url.length > 0) {
            if (!this._resMap.has(info.url)) {
                if (isNoFoundCreate) {
                    let cache = new CacheInfo;
                    cache.url = info.url;
                    this._resMap.set(info.url, cache);
                }
                else {
                    return null;
                }
            }
            return this._resMap.get(info.url);
        }
        return null;
    }

    public retainAsset(info: Resource.Info) {
        if (info && info.data) {
            let cache = this._getCacheInfo(info);
            if (cache) {
                if (cache.retain) {
                    if (!info.retain) {
                        if (DEBUG) Log.w(`資源 : ${info.url} 已經被設定成常駐資源，不能改變其屬性`);
                    }
                } else {
                    cache.retain = info.retain;
                }

                (<Asset>info.data).addRef();
                cache.refCount++;
                if (cache.retain) {
                    cache.refCount = 999999;
                }
            }
        }
    }

    public releaseAsset(info: Resource.Info) {
        if (info && info.data) {
            let cache = this._getCacheInfo(info, false);
            if (cache) {
                if (cache.retain) {
                    //常駐記憶體中
                    return;
                }
                cache.refCount--;
                if (cache.refCount <= 0) {
                    this.remove(cache.url);
                }
            }
        }
    }

    public remove(url: string) {
        this._resMap.delete(url);

        //先刪除精靈幀
        if (this._spriteFrameCaches.has(url)) {
            //先釋放引用計數
            (<Asset>(this._spriteFrameCaches.get(url) as Resource.CacheData).data).decRef(false);
            this._spriteFrameCaches.delete(url);
            if (DEBUG) Log.d(`remove remote sprite frames resource url : ${url}`);
        }

        let cache = this._caches.has(url) ? this._caches.get(url) : null;
        if (cache && cache.data instanceof sp.SkeletonData) {
            //這裡面需要刪除載入進去的三個檔案快取 
            this.remove(`${cache.info.url}.atlas`);
            this.remove(`${cache.info.url}.png`);
            this.remove(`${cache.info.url}.json`);
        }
        if (cache && cache.data instanceof Asset) {
            if (DEBUG) Log.d(`釋放載入的本地遠端資源:${cache.info.url}`);
            cache.data.decRef(false);
            cache.info.data = cache.data;
            App.releaseManger.releaseRemote(cache.info);
        }
        if (DEBUG) Log.d(`remove remote cache url : ${url}`);
        return this._caches.delete(url);
    }

    debug(){
        let spCaches = this._spriteFrameCaches;
        let caches = this._caches;
        let infos = this._resMap;
        Log.d(`---- 遠端載入資源快取資訊 ----`);

        let content: any[] = [];
        let invalidContent: any[] = [];
        spCaches.forEach((data, key, source) => {
            let itemContent = { url: data.info.url, isLoaded: data.isLoaded, isValid: isValid(data.data), assetType: js.getClassName(data.info.type), data: data.data ? js.getClassName(data.data) : null, status: data.status };
            let item = { url: key, data: itemContent };
            if (data.isLoaded && ((data.data && !isValid(data.data)) || !data.data)) {
                invalidContent.push(item);
            } else {
                content.push(item);
            }
        });

        if (content.length > 0) {
            Log.d(`----------------有效 spriteFrame 快取資訊------------------`);
            Log.d(JSON.stringify(content));
        }
        if (invalidContent.length > 0) {
            Log.d(`----------------無效 spriteFrame 快取資訊------------------`);
            Log.d(JSON.stringify(invalidContent));
        }


        content = [];
        invalidContent = [];
        caches.forEach((data, key, source) => {
            let itemContent = { url: data.info.url, isLoaded: data.isLoaded, isValid: isValid(data.data), assetType: js.getClassName(data.info.type), data: data.data ? js.getClassName(data.data) : null, status: data.status }
            let item = { url: key, data: itemContent };
            if (data.isLoaded && data.data && !isValid(data.data)) {
                invalidContent.push(item);
            } else {
                content.push(item);
            }
        });
        if (content.length > 0) {
            Log.d(`----------------有效快取資訊------------------`);
            Log.d(JSON.stringify(content));
        }
        if (invalidContent.length > 0) {
            Log.d(`----------------無效快取資訊------------------`);
            Log.d(JSON.stringify(invalidContent));
        }

        if (infos.size > 0) {
            Log.d(`----------------當前資源引用計數資訊------------------`);
            content = [];
            infos.forEach((value, key) => {
                let item = { url: key, data: { refCount: value.refCount, url: value.url, retain: value.retain } };
                content.push(item);
            });
            Log.d(JSON.stringify(content));
        }
    }
}

export class CacheManager implements ISingleton{
    isResident?: boolean = true;
    static module: string = "【快取管理器】";
    module: string = null!;
    private _bundles = new Map<string, ResourceCache>();
    private _remoteCaches = new RemoteCaches();
    public get remoteCaches() { return this._remoteCaches; }

    public getBundleName(bundle: BUNDLE_TYPE) {
        return App.bundleManager.getBundleName(bundle);
    }

    /**
     * @description 同步獲取資源快取，此介面不會檢查資源的狀態，只要建立了快取，就會立即返回
     * @param bundle bundle名
     * @param path 資源路徑
     * @param isCheck 是否檢查資源有效性，當為ture時，會檢查資源是否有效，如果有效直接返回，如果無效，則返回nll
     * @returns 
     */
    public get(bundle: BUNDLE_TYPE, path: string, isCheck: boolean = true) {
        let bundleName = this.getBundleName(bundle);
        if (bundleName && this._bundles.has(bundleName)) {
            return (this._bundles.get(bundleName) as ResourceCache).get(path, isCheck);
        }
        return null;
    }

    public set(bundle: BUNDLE_TYPE, path: string, data: Resource.CacheData) {
        let bundleName = this.getBundleName(bundle);
        if (bundleName) {
            if (!this._bundles.has(bundleName)) {
                let cache = new ResourceCache(bundleName);
                cache.set(path, data);
                this._bundles.set(bundleName, cache);
            } else {
                (this._bundles.get(bundleName) as ResourceCache).set(path, data);
            }
        }
    }

    /**
     * @description 
     * @param bundle bundle
     * @param path path
     */
    public remove(bundle: BUNDLE_TYPE, path: string) {
        let bundleName = this.getBundleName(bundle);
        if (bundleName && this._bundles.has(bundleName)) {
            return (this._bundles.get(bundleName) as ResourceCache).remove(path);
        }
        return false;
    }

    public removeWithInfo(info: Resource.Info) {
        if (info) {
            if (info.data) {
                if (Array.isArray(info.data)) {
                    let isAllDelete = true;
                    for (let i = 0; i < info.data.length; i++) {
                        info.data[i].decRef(false);
                        if (info.data[i].refCount != 0) {
                            isAllDelete = false;
                        }
                    }
                    if (isAllDelete) {
                        this.remove(info.bundle, info.url);
                        return true;
                    }
                } else {
                    info.data.decRef(false);
                    if (info.data.refCount == 0) {
                        this.remove(info.bundle, info.url);
                        return true;
                    }
                }
            } else {
                Log.e(`info.data is null , bundle : ${info.bundle} url : ${info.url}`);
            }
        } else {
            Log.e(`info is null`);
        }
        return false;
    }

    public removeBundle(bundle: BUNDLE_TYPE) {
        let bundleName = this.getBundleName(bundle);
        if (bundleName && this._bundles.has(bundleName)) {
            if (DEBUG) {
                Log.d(`移除bundle cache : ${bundleName}`)
                let data = this._bundles.get(bundleName);
                this._removeUnuseCaches();
                if (data && data.size > 0) {
                    Log.e(`移除bundle ${bundleName} 還有未釋放的快取`);
                }
            }
            this._bundles.delete(bundleName);
        }
    }

    private _removeUnuseCaches() {
        this._bundles.forEach((value, key, origin) => {
            if (value) {
                value.removeUnuseCaches();
            }
        });
    }

    private _getGetCacheByAsyncArgs(): { url: string, type: typeof Asset, bundle: BUNDLE_TYPE } | null {
        if (arguments.length < 3) {
            if (DEBUG) Log.e(`${this.module}引數傳入有誤，必須兩個引數`);
            return null;
        }
        if (typeof arguments[0] != "string") {
            if (DEBUG) Log.e(`${this.module}傳入第一個引數有誤,必須是string`);
            return null;
        }

        if (!js.isChildClassOf(arguments[1], Asset)) {
            if (DEBUG) Log.e(`${this.module}傳入的第二個引數有誤,必須是cc.Asset的子類`);
            return null;
        }
        return { url: arguments[0], type: arguments[1], bundle: arguments[2] };
    }

    /**
     * @description 如果資源正在載入中，會等待資源載入完成後返回，否則直接返回null
     * @param url 
     * @param type 資源型別
     * @param bundle
     */
    public getCache<T extends Asset>(url: string, type: { prototype: T }, bundle: BUNDLE_TYPE): Promise<T>;
    public getCache() {
        let args = arguments;
        let me = this;
        return new Promise<any>((resolve) => {
            let _args = me._getGetCacheByAsyncArgs.apply(me, args as any);
            if (!_args) {
                resolve(null);
                return;
            }
            let cache = me.get(_args.bundle, _args.url);
            if (cache) {
                if (cache.isLoaded) {
                    //已經載入完成
                    if (_args.type) {
                        if (cache.data instanceof _args.type) {
                            resolve(cache.data);
                        } else {
                            if (DEBUG) Log.e(`${this.module}傳入型別:${js.getClassName(_args.type)}與資源實際型別: ${js.getClassName(cache.data as any)}不同 url : ${cache.info.url}`);
                            resolve(null);
                        }
                    } else {
                        resolve(cache.data);
                    }
                } else {
                    //載入中
                    cache.getCb.push(resolve);
                }
            } else {
                resolve(null);
            }
        });
    }

    /**
     * @description 非同步獲取資源，如果資源未載入，會載入完成後返回
     * @param url 
     * @param type 
     * @param bundle 
     */
    public getCacheByAsync<T extends Asset>(url: string, type: { prototype: T }, bundle: BUNDLE_TYPE): Promise<T>;
    public getCacheByAsync() {
        let me = this;
        let args = this._getGetCacheByAsyncArgs.apply(this, <any>arguments);
        return new Promise<any>((resolve) => {
            if (!args) {
                resolve(null);
                return;
            }
            me.getCache(args.url, args.type, args.bundle).then((data) => {
                args = args as { url: string, type: typeof Asset, bundle: BUNDLE_TYPE };
                if (data && data instanceof args.type) {
                    resolve(data);
                } else {                    
                    //加载资源
                    App.asset.load(args.bundle, args.url, args.type, <any>null, (cache) => {
                        args = args as { url: string, type: typeof Asset, bundle: BUNDLE_TYPE };
                        
                        if (cache && cache.data && cache.data instanceof args.type) {
                            resolve(cache.data);
                        } else {
                            Log.e(`${this.module}載入失敗 : ${args.url}`);
                            resolve(null);
                        }
                    });
                }
            });
        });
    }

    public getSpriteFrameByAsync(urls: string[], key: string, view: UIView, addExtraLoadResource: (view: UIView, info: Resource.Info) => void, bundle: BUNDLE_TYPE) {
        let me = this;
        return new Promise<{ url: string, spriteFrame: SpriteFrame | null, isTryReload?: boolean }>((resolve) => {
            let nIndex = 0;
            let getFun = (url: string) => {
                me.getCacheByAsync(url, SpriteAtlas, bundle).then((atlas) => {
                    let info = new Resource.Info;
                    info.url = url;
                    info.type = SpriteAtlas;
                    info.data = atlas;
                    info.bundle = bundle;
                    addExtraLoadResource(view, info);
                    if (atlas) {
                        let spriteFrame = atlas.getSpriteFrame(key);
                        if (spriteFrame) {
                            if (isValid(spriteFrame)) {
                                resolve({ url: url, spriteFrame: spriteFrame });
                            } else {
                                //来到这里面，其实程序已经崩溃了，已经没什么意思，也不知道写这个有啥用，尽量安慰,哈哈哈
                                Log.e(`精灵帧被释放，释放当前无法的图集资源 url ：${url} key : ${key}`);
                                App.asset.releaseAsset(info);
                                resolve({ url: url, spriteFrame: null, isTryReload: true });
                            }
                        } else {
                            nIndex++;
                            if (nIndex >= urls.length) {
                                resolve({ url: url, spriteFrame: null });
                            } else {
                                getFun(urls[nIndex]);
                            }
                        }
                    } else {
                        resolve({ url: url, spriteFrame: null });
                    }
                })
            };

            getFun(urls[nIndex]);
        });
    }

    debug(){
        this._bundles.forEach(v => {
            v.debug();
        });

        this.remoteCaches.debug();
    }
}