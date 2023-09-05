import { Update } from "./Update";
import { native, sys, } from "cc";
import { JSB, PREVIEW } from "cc/env";
import { Macro } from "../../defines/Macros";
import { HttpPackage } from "../net/http/HttpClient";
import { UpdateItem } from "./UpdateItem";

const VERSION_FILENAME = "versions.json";
type VERSIONS = { [key: string]: { md5: string, version: string } };

/**
 * @description 熱更新元件
 */
export class UpdateManager implements ISingleton {
    isResident?: boolean = true;
    static module: string = "【更新管理器】";
    module: string = null!;

    /**@description 本地儲存熱更新檔案的路徑,注意，該路徑不能變動，Game.cpp中已經寫了，如果要變動，需要連C++層一起改 */
    get storagePath() {
        return native.fileUtils.getWritablePath() + "caches/";
    }

    /**@description 所有下載項 */
    private items: UpdateItem[] = [];
    /**@description 當前項 */
    private current: UpdateItem | null = null;

    private _hotUpdateUrl = "";
    /**@description 通用的熱更新地址，當在子游戲或大廳未指定熱更新地址時，都統一使用伺服器傳回來的預設全域性更新地址 */
    public get hotUpdateUrl(): string {
        Log.d(`當前熱更新地址為:${this._hotUpdateUrl}`);
        return this._hotUpdateUrl;
    }
    public set hotUpdateUrl(value) {
        this._hotUpdateUrl = value;
    }

    /**@description 是否路過熱更新 */
    public isSkipCheckUpdate = false;

    /**@description 資源管理器 */
    private assetsManagers: { [key: string]: Update.AssetsManager } = {};

    /**@description 預處理版本資訊 */
    private preVersions: VERSIONS = {};
    /**@description 遠端所有版本資訊 */
    private remoteVersions: VERSIONS = {};

    /**@description 預設版本 */
    readonly defaultVersion = "1.0";

    /**@description 預設md5 */
    readonly defaultMD5 = Macro.UNKNOWN;

    /**@description 是否是預覽或瀏覽器 */
    get isBrowser() {
        return sys.platform == sys.Platform.WECHAT_GAME || PREVIEW || sys.isBrowser;
    }

    /**@description 主包包含資源目錄,固定的，請勿修改 */
    readonly mainBundles: string[] = ["src", "jsb-adapter", "assets/resources", "assets/main", "main.js"];

    /**@description 是否使用了自动版本 */
    isAutoVersion: boolean = true;

    /**@description 獲取資源管理器，預設為hall 大廳的資源管理器 */
    getAssetsManager(item: UpdateItem) {
        //初始化資源管理器
        let name = item.convertBundle(item.bundle);
        if (JSB) {
            if (!this.assetsManagers[name]) {
                this.assetsManagers[name] = new Update.AssetsManager(name, this.storagePath);
                //設定下載併發量
                this.assetsManagers[name].manager.setPackageUrl(this.hotUpdateUrl);
                this.assetsManagers[name].manager.setMainBundles(this.mainBundles);
                //設定重新下載的標準
                this.assetsManagers[name].manager.setDownloadAgainZip(0.8);
            }
        }
        return this.assetsManagers[name];
    }

    /**@description 下載update項，以最新的為當前操作的物件 */
    dowonLoad(item: UpdateItem) {
        if (item.isSkipUpdate) {
            item.handler.onLoadBundle(item);
        } else {
            this.current = this.getItem(item);
            if (this.current) {
                if (this.current.isUpdating) {
                    Log.d(`${item.bundle} 正在更新中...`);
                    this.current.handler.onShowUpdating(this.current);
                } else {
                    Log.d(`${item.bundle} 不在更新狀態，進入更新...`);
                    this._dowonLoad(item);
                }
            } else {
                Log.d(`${item.bundle} 放入下載佇列中...`);
                this.items.push(item);
                this._dowonLoad(item);
            }
        }
    }

    private async _dowonLoad(item: UpdateItem) {
        this.current = item;
        let isOk = await this.loadVersions(this.current);
        if (isOk) {
            let status = this.getStatus(item.bundle);
            if (status == Update.Status.UP_TO_DATE) {
                item.state = Update.State.UP_TO_DATE;
                if (item.bundle == Macro.BUNDLE_HALL && this.isMd5Change(Update.MAIN_PACK)) {
                    //大廳已經是最新，需要檢測主包是否有更新
                    Log.d(`進入${item.bundle} 時，需要更新主包`);
                    item.handler.onNeedUpdateMain(item);
                } else {
                    Log.d(`${item.bundle} 已經是最新，直接進入...`);
                    item.handler.onLoadBundle(item);
                }
            } else {
                Log.d(`${item.bundle} 進入檢測更新...`);
                item.state = Update.State.READY_TO_UPDATE;
                item.checkUpdate();
            }
        }
    }

    getItem(item: UpdateItem | Update.Config) {
        if (item instanceof UpdateItem) {
            return this._getItem(item.bundle);
        } else {
            let temp = this._getItem(item.bundle);
            if (temp == null) {
                temp = new UpdateItem(item);
            }
            return temp;
        }
    }

    private _getItem(bundle: string) {
        for (let i = 0; i < this.items.length; i++) {
            if (bundle == this.items[i].bundle) {
                return this.items[i];
            }
        }
        return null;
    }

    checkAllowUpdate(item: UpdateItem, code: number) {
        //非主包檢測更新
        //有新版本，看下是否與主包版本匹配
        let md5 = item.remoteMd5;
        let versionInfo = this.preVersions[item.updateName];
        if (versionInfo == undefined || versionInfo == null) {
            Log.e(`預處理版本未存在!!!!`);
            return Update.Code.PRE_VERSIONS_NOT_FOUND;
        } else {
            //先檢查主包是否需要更新
            if (versionInfo.md5 == md5) {
                //主包無需要更新
                Log.d(`${item.bundle} 將要下載版本 md5 與遠端版本 md5 相同，可以下載 version : ${versionInfo.version} md5:${versionInfo.md5}`);
            } else {
                if (item.bundle == Macro.BUNDLE_HALL) {
                    //如果是大廳更新，只要主包的md5不發生變化，則可以直接更新大廳
                    Log.d(`${item.bundle} 更新`);
                    if (this.isMd5Change(Update.MAIN_PACK)) {
                        Log.d(`更新${item.bundle}時，主包有更新，需要先更新主包`);
                        code = Update.Code.MAIN_PACK_NEED_UPDATE;
                    } else {
                        Log.d(`更新${item.bundle}時，主包無更新，直接更新進入`);
                    }
                } else {
                    //更新其它子包，只需要大廳的md5及主包md5沒有變化，即可直接更新進入bundle
                    if (this.isMd5Change(Update.MAIN_PACK) || this.isMd5Change(Macro.BUNDLE_HALL)) {
                        Log.d(`更新${item.bundle}時，主包與大廳有更新，下載 md5 :${md5} 與預處理md5不一致，需要對主包先進行更新`);
                        code = Update.Code.MAIN_PACK_NEED_UPDATE;
                    } else {
                        Log.e(`更新${item.bundle}時，主包與大廳無更新，可直接下載更新！！`);
                    }
                }
            }
            return code;
        }
    }
    /**@description 檢測主包md5 */
    checkMainMd5(item: UpdateItem, code: number) {
        Log.d(`${item.bundle} 無更新，檢測主包md5是否變化，如果變更，需要提示玩家更新主包`);
        if (this.isMd5Change(Update.MAIN_PACK)) {
            Log.d(`進入${item.bundle}時，主包有更新，需要先更新主包`);
            code = Update.Code.MAIN_PACK_NEED_UPDATE;
        }
        return code;
    }


    /**
     * @description 獲取當前bundle的狀態
     * @param bundle bundle名
     * @returns 
     */
    getStatus(bundle: string) {
        if (this.isBrowser || this.isSkipCheckUpdate) {
            //瀏覽器無更新
            return Update.Status.UP_TO_DATE;
        }
        bundle = this.convertBundle(bundle);
        let versionInfo = this.getVersionInfo(bundle);
        if (versionInfo) {
            if (versionInfo.md5 == this.remoteVersions[bundle].md5) {
                return Update.Status.UP_TO_DATE;
            }
            return Update.Status.NEED_UPDATE;
        } else {
            return Update.Status.NEED_DOWNLOAD;
        }
    }

    /**@description app 版本號 */
    get appVersion() {
        if (this.isBrowser) {
            return this.defaultVersion;
        } else {
            let path = `${Update.MANIFEST_ROOT}$apk.json`;
            let dataStr = this.getString(path);
            if (dataStr) {
                let data = JSON.parse(dataStr);
                return `v${data.version}`;
            } else {
                Log.e(`${this.module}無法讀取到${path}`);
                return this.defaultVersion;
            }
        }
    }

    /**
     * @description 返回當前bundle的md5
     * @param bundle 
     */
    getMd5(bundle: BUNDLE_TYPE) {
        if (this.isBrowser) {
            return this.defaultMD5;
        } else {
            bundle = this.convertBundle(bundle as string);
            let versionInfo = this.getVersionInfo(bundle);
            if (versionInfo) {
                return `${versionInfo.md5}`;
            } else {
                if (this.remoteVersions[bundle]) {
                    Log.w(`${this.module}本地無版本資訊,返回遠端版本${this.remoteVersions[bundle].md5}`);
                    return `${this.remoteVersions[bundle].md5}`;
                } else {
                    Log.e(`${this.module}遠端無版本資訊，返回預設版本${this.defaultMD5}`);
                    return this.defaultMD5;
                }
            }
        }
    }

    /**
     * @description 獲取版本號,此版本號只是顯示用，該熱更新跟版本號無任何關係
     * @param bundle
     */
    getVersion(bundle: BUNDLE_TYPE) {
        if (this.isBrowser) {
            return this.defaultVersion;
        } else {
            bundle = this.convertBundle(bundle as string);
            if (this.isAutoVersion) {
                ///如果使用了自动版本，所有的版本号都是一致的,都使用主包版本号
                bundle = Macro.MAIN_PACK_BUNDLE_NAME;
            }
            let versionInfo = this.getVersionInfo(bundle);
            if (versionInfo) {
                return `${versionInfo.version}`;
            } else {
                if (this.remoteVersions[bundle]) {
                    Log.w(`${this.module}本地無版本資訊,返回遠端版本${this.remoteVersions[bundle].version}`);
                    return `${this.remoteVersions[bundle].version}`;
                } else {
                    Log.e(`${this.module}遠端無版本資訊，返回預設版本${this.defaultVersion}`);
                    return this.defaultVersion;
                }
            }
        }
    }

    /**
     * @description md5是否發生變化
     * @param bundle 
     */
    private isMd5Change(bundle: string) {
        bundle = this.convertBundle(bundle);
        if (this.preVersions[bundle] && this.remoteVersions[bundle] && this.preVersions[bundle].md5 != this.remoteVersions[bundle].md5) {
            return true
        }
        return false
    }

    private getString(path: string) {
        //下載快取中
        let cachedPath = `${this.storagePath}${path}`;
        if (native.fileUtils.isFileExist(cachedPath)) {
            return native.fileUtils.getStringFromFile(cachedPath);
        } else {
            //包內
            if (native.fileUtils.isFileExist(path)) {
                return native.fileUtils.getStringFromFile(path);
            } else {
                return undefined;
            }
        }
    }

    private getVersionString(bundle: string) {
        bundle = this.convertBundle(bundle);
        let path = `${Update.MANIFEST_ROOT}${bundle}_version.json`;
        return this.getString(path);
    }

    getProjectString(bundle: string) {
        bundle = this.convertBundle(bundle);
        let path = `${Update.MANIFEST_ROOT}${bundle}_project.json`;
        return this.getString(path);
    }

    private getVersionInfo(bundle: string): { md5: string, version: string } | undefined {
        let content = this.getVersionString(bundle);
        if (content) {
            let obj = JSON.parse(content);
            return obj;
        }
        return undefined;
    }

    /**
     * @description 熱更新初始化,先讀取本地的所有版本資訊，再拉取遠端所有的版本資訊
     * */
    private loadVersions(item: UpdateItem) {
        return new Promise<boolean>(async (resolove, reject) => {
            if (this.isBrowser) {
                resolove(true);
                return;
            }
            item.state = Update.State.PREDOWNLOAD_VERSION;
            item.handler.onShowUpdating(item);
            Log.d(`${this.module} 請求遠端版本資訊`);
            let data = await this.readRemoteVersions();
            if (data) {
                this.remoteVersions = JSON.parse(data);
                let bundle = item.convertBundle(item.bundle);
                if (bundle == Update.MAIN_PACK && this.getStatus(bundle) == Update.Status.UP_TO_DATE) {
                    Log.d(`${this.module} 主包已經是最新，寫入遠端的版本資訊`);
                    this.savePreVersions();
                    //主包更新完成，清除路徑快取資訊;
                    native.fileUtils.purgeCachedEntries();
                }
                Log.d(`${this.module} 載入${item.bundle}時，載入遠端版本資訊成功...`);
                item.state = Update.State.VERSION_LOADED;
                resolove(true);
            } else {
                this.remoteVersions = {};
                item.state = Update.State.FAIL_TO_UPDATE;
                item.code = Update.Code.PRE_VERSIONS_NOT_FOUND;
                item.handler.onPreVersionFailed(item);
                Log.e(`${this.module} 載入${item.bundle}時，載入遠端版本資訊失敗...`);
                resolove(false);
            }
        });
    }

    /**
     * @description 轉換成熱更新bundle
     * @param bundle 
     * @returns 
     */
    convertBundle(bundle: string) {
        if (bundle == Macro.BUNDLE_RESOURCES) {
            return Update.MAIN_PACK;
        }
        return bundle;
    }

    /**@description 讀取遠端版本檔案 */
    private readRemoteVersions() {
        return new Promise<string | null>((resolove) => {
            let httpPackage = new HttpPackage;
            httpPackage.data.url = `${this.hotUpdateUrl}/${Update.MANIFEST_ROOT}${VERSION_FILENAME}`;
            httpPackage.data.isAutoAttachCurrentTime = true;
            httpPackage.send((data) => {
                resolove(data);
            }, (err) => {
                Log.dump(err);
                resolove(null);
            });
        })
    }

    savePreVersions() {
        // 到了這個位置，說明 this.remoteVersions 已經有資料了
        if (Object.keys(this.remoteVersions).length > 0) {
            Log.d(`${this.module} 儲存遠端版本資訊如下:`);
            let versions = JSON.stringify(this.remoteVersions);
            Log.d(versions);
            this.preVersions = JSON.parse(versions);
        } else {
            Log.e(`${this.module} 致命更新錯誤,無法讀取到遠端版本資訊!!!`);
        }
    }

    debug() {
        Log.d(`-----------熱火更新管理器中相關資訊------------`);
        Log.dump({ name: "預處理版本資訊", data: this.preVersions });
        Log.dump({ name: "遠端版本資訊", data: this.remoteVersions });
    }
}
