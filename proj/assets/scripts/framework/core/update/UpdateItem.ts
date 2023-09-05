import { game, native, sys } from "cc";
import { Macro } from "../../defines/Macros";
import { Update } from "./Update";

/**@description 更新項處理者代理 */
export interface UpdateHandlerDelegate {
    /**@description 發現新版本*/
    onNewVersionFund(item: UpdateItem): void;
    /**@description 更新失敗 */
    onUpdateFailed(item: UpdateItem): void;
    /**@description 載入遠端版本資訊失敗 */
    onPreVersionFailed(item: UpdateItem): void;
    /**@description 正在更新或檢測更新中 */
    onShowUpdating(item: UpdateItem): void;
    /**@description 需要更新主包 */
    onNeedUpdateMain(item: UpdateItem): void;
    /**@description 其它狀態 */
    onOther(item: UpdateItem): void;
    /**@description 下載進度 */
    onDownloading(item: UpdateItem, info: Update.DownLoadInfo): void;
    /**@description 已經是最新版本或跳過熱更新 */
    onAreadyUpToData(item: UpdateItem): void;
    /**@description 下載更新完成 */
    onDownloadComplete(item: UpdateItem): void;
    /**@description 開始測試更新 */
    onStarCheckUpdate(item: UpdateItem): void;

    /**@description 載入bundle */
    onLoadBundle(item: UpdateItem): void
    /**@description 開始載入bundle */
    onStartLoadBundle(item: UpdateItem): void;
    /**@description 載入bundle錯誤 */
    onLoadBundleError(item: UpdateItem, err: Error | null): void;
    /**@description 載入bundle完成 */
    onLoadBundleComplete(item: UpdateItem): void;

    /**
     * @description 更新完成，需要重启 
     * @param onComplete 完成回调，收到此消息，玩家必须重启App，为了比较友好，结玩家一个提示
     * */
    onNeedRestartApp(item : UpdateItem , onComplete : (isDelayRestart : boolean)=>void): void;
}

export class UpdateItem {
    /**@description 更新項名字,如果大廳 */
    private _name = "";
    get name() {
        return App.getLanguage(this._name as any);
    };
    /**@description 更新項bundle名 */
    bundle: string = "";
    /**@description 處理者,統一指定，具體實現由內部的代理來處理 */
    handler: UpdateHandlerDelegate = null!;
    /**@description 更新使用者自定義資料,多次點選，以最新資料為主 */
    userData: any = null;

    /**@description 是否已经加载完成过 */
    isLoaded: boolean = false;

    /**@description 下载管理器，请不要从外面进行设置,管理器专用 */
    private get assetsManager() {
        return App.updateManager.getAssetsManager(this);
    }

    private _code: Update.Code = Update.Code.UNINITED;
    get code() {
        if (this.isBrowser) {
            return Update.Code.ALREADY_UP_TO_DATE;
        }
        return this._code;
    }
    set code(v) {
        this._code = v;
    }

    private _state: Update.State = Update.State.UNINITED;
    get state() {
        if (this.isBrowser) {
            return Update.State.UP_TO_DATE;
        }
        return this._state;
    }
    set state(v) {
        this._state = v;
    }

    constructor(config: Update.Config) {
        this._name = config.name;
        this.bundle = config.bundle;
    }

    /**@description 熱更新bundle名 */
    get updateName() {
        return this.assetsManager.name;
    }

    /**@description 是否是預覽或瀏覽器 */
    private get isBrowser() {
        return App.updateManager.isBrowser;
    }

    /**@description 是否跳過熱更新 */
    get isSkipUpdate() {
        if (this.isBrowser) {
            //預覽及瀏覽器下，不需要有更新的操作
            return true;
        } else {
            return App.updateManager.isSkipCheckUpdate;
        }
    }


    /**
     * @description 重置
     */
    reset() {
        this.state = Update.State.UNINITED;
        this.code = Update.Code.UNINITED;
        Log.d(`${this.bundle} AssetsManager 重置`);
        this.assetsManager.manager.reset();
    }

    /**
     * @description 轉換成熱更新bundle
     * @param bundle 
     * @returns 
     */
    convertBundle(bundle: string) {
        return App.updateManager.convertBundle(bundle);
    }

    private getProjectString() {
        return App.updateManager.getProjectString(this.bundle);
    }

    /**@description 檢測更新 */
    checkUpdate() {
        this.handler.onStarCheckUpdate(this);
        this.checkBundleUpdate();
    }

    /**@description 只有assetsManager有值時有效 */
    private get isMain() {
        return this.assetsManager.name == Update.MAIN_PACK;
    }

    get remoteMd5() {
        return this.assetsManager.manager.getRemoteManifest().getMd5();
    }

    private get storagePath() {
        return App.updateManager.storagePath;
    }

    private get hotUpdateUrl() {
        return App.updateManager.hotUpdateUrl;
    }

    /**@description 當前是否正在檢測更新或更新過程中 */
    get isUpdating() {
        let state = this.assetsManager.manager.getState() as any;
        let _isUpdating = (state: Update.State) => {
            if (state == Update.State.PREDOWNLOAD_VERSION) {
                Log.d(`${this.bundle} 準備下載版本檔案`)
                return true;
            } else if (state == Update.State.DOWNLOADING_VERSION) {
                Log.d(`${this.bundle} 下載版本檔案中`)
                return true;
            } else if (state == Update.State.PREDOWNLOAD_MANIFEST) {
                Log.d(`${this.bundle} 準備下載project檔案`)
                return true;
            } else if (state == Update.State.DOWNLOADING_MANIFEST) {
                Log.d(`${this.bundle} 下載project檔案中`);
                return true;
            } else if (state == Update.State.VERSION_LOADED) {
                Log.d(`${this.bundle} 下載版本檔案完成，下一步驟會解析版本檔案，也算在更新過程中`)
                return true;
            } else if (state == Update.State.MANIFEST_LOADED) {
                Log.d(`${this.bundle} 下載project檔案完成,下載步驟會解析project檔案，也算在更新過程中`)
                return true;
            } else if (state == Update.State.UPDATING) {
                Log.d(`${this.bundle} 正在更新中`);
                return true;
            }
        }
        //C++更新狀態
        if (_isUpdating(state)) {
            Log.d(`${this.bundle} C++層更新中`);
            return true;
        }

        //ts更新狀態
        if (_isUpdating(this.state)) {
            Log.d(`${this.bundle} TS層更新中`);
            return true;
        }

        return false;
    }

    /**@description bundle更新 */
    private checkBundleUpdate() {
        if (this.assetsManager.manager.getLocalManifest()) {
            Log.d(`${this.bundle} 本地檔案已經載入完成,直接進入更新流程`);
            if (this.isUpdating) {
                Log.d(`${this.bundle} 正在檢測更新中...`);
                this.handler.onShowUpdating(this);
                return;
            }
        }
        let content = this.getProjectString();
        //先檢測本地是否已經存在子游戲版本控制檔案 
        if (content) {
            //存在版本控制檔案 
            let jsbGameManifest = new native.Manifest(content, this.storagePath, this.hotUpdateUrl);
            Log.d(`${this.bundle} --存在本地版本控制檔案checkUpdate--`);
            // Log.d(`${this.bundle} mainifestUrl : ${content}`);
            this.assetsManager.manager.loadLocalManifest(jsbGameManifest, "");
            this._checkUpdate();
        } else {
            //不存在版本控制檔案 ，生成一個初始版本
            let gameManifest = {
                version: "0",
                bundle: this.convertBundle(this.bundle),
                md5: Macro.UNKNOWN,
            };
            let gameManifestContent = JSON.stringify(gameManifest);
            let jsbGameManifest = new native.Manifest(gameManifestContent, this.storagePath, this.hotUpdateUrl);
            Log.d(`${this.bundle} 檢測更新`);
            Log.d(`${this.bundle} 版本資訊 : ${gameManifestContent}`);
            this.assetsManager.manager.loadLocalManifest(jsbGameManifest, "");
            this._checkUpdate();
        }
    }


    private _checkUpdate() {
        Log.d(`${this.bundle} 進入檢測更新`);
        this.state = Update.State.UPDATING;
        this.assetsManager.manager.setEventCallback(this.checkCb.bind(this));
        this.assetsManager.manager.checkUpdate();
    }

    private checkCb(event: any) {
        let code = event.getEventCode();
        let state = this.assetsManager.manager.getState() as any;
        Log.d(`${this.bundle} checkCb event code : ${code} state : ${state}`);

        switch (code) {
            case Update.Code.ERROR_NO_LOCAL_MANIFEST:
                Log.d(`${this.bundle} No local manifest file found, hot update skipped.`);
                break;
            case Update.Code.ERROR_DOWNLOAD_MANIFEST:
            case Update.Code.ERROR_PARSE_MANIFEST:
                Log.d(`${this.bundle} Fail to download manifest file, hot update skipped.`);
                break;
            case Update.Code.ALREADY_UP_TO_DATE:
                Log.d(`${this.bundle} Already up to date with the latest remote version.`);
                if (this.isMain) {
                    App.updateManager.savePreVersions();
                } else if (this.bundle == Macro.BUNDLE_HALL) {
                    //如果大厅已经没有更新，但此时主包有更新，需要检测升级主包
                    code = App.updateManager.checkMainMd5(this, code);
                }
                break;
            case Update.Code.NEW_VERSION_FOUND:
                Log.d(`${this.bundle} New version found, please try to update.`);
                if (!this.isMain) {
                    code = App.updateManager.checkAllowUpdate(this, code);
                }
                break;
            default:
                return;
        }
        this.state = state;
        this.code = code;
        if (code == Update.Code.NEW_VERSION_FOUND) {
            this.handler.onNewVersionFund(this);
        } else if (code == Update.Code.ALREADY_UP_TO_DATE) {
            this.handler.onAreadyUpToData(this);
        } else if (code == Update.Code.ERROR_DOWNLOAD_MANIFEST ||
            code == Update.Code.ERROR_NO_LOCAL_MANIFEST ||
            code == Update.Code.ERROR_PARSE_MANIFEST) {
            this.handler.onUpdateFailed(this);
        } else if (code == Update.Code.MAIN_PACK_NEED_UPDATE || code == Update.Code.PRE_VERSIONS_NOT_FOUND) {
            this.handler.onNeedUpdateMain(this);
        } else {
            this.handler.onOther(this);
        }

    }

    /**@description 執行更新 */
    doUpdate() {
        Log.d(`${this.bundle} 即將熱更新, updating : ${this.isUpdating}`);
        if (!this.isUpdating) {
            Log.d(`${this.bundle} 執行更新 `);
            this.assetsManager.manager.setEventCallback(this.updateCb.bind(this));
            this.assetsManager.manager.update();
        }
    }

    /**@description 熱更新回撥 */
    private updateCb(event: any) {
        let isUpdateFinished = false;
        let failed = false;
        let code = event.getEventCode();
        let state = this.assetsManager.manager.getState() as any;
        Log.d(`${this.bundle} --update cb code : ${code} state : ${state}`);
        switch (code) {
            case Update.Code.ERROR_NO_LOCAL_MANIFEST:
                Log.d(`${this.bundle} No local manifest file found, hot update skipped.`);
                failed = true;
                break;
            case Update.Code.UPDATE_PROGRESSION:
                Log.d(`${this.bundle} ${event.getDownloadedBytes()} / ${event.getTotalBytes()}`);
                Log.d(`${this.bundle} ${event.getDownloadedFiles()} / ${event.getTotalFiles()}`);
                Log.d(`${this.bundle} percent : ${event.getPercent()}`);
                Log.d(`${this.bundle} percent by file : ${event.getPercentByFile()}`);
                Log.d(`${this.bundle} assetId : ${event.getAssetId()}`)
                var msg = event.getMessage();
                if (msg) {
                    Log.d(`${this.bundle} Updated file: ${msg}`);
                }
                break;
            case Update.Code.ERROR_DOWNLOAD_MANIFEST:
            case Update.Code.ERROR_PARSE_MANIFEST:
                Log.d(`${this.bundle} Fail to download manifest file, hot update skipped.`);
                failed = true;
                break;
            case Update.Code.ALREADY_UP_TO_DATE:
                Log.d(`${this.bundle} Already up to date with the latest remote version`);
                failed = true;
                if (this.isMain) {
                    App.updateManager.savePreVersions();
                }
                break;
            case Update.Code.UPDATE_FINISHED:
                Log.d(`${this.bundle} Update finished. ${event.getMessage()}`);
                isUpdateFinished = true;
                if (this.isMain) {
                    App.updateManager.savePreVersions();
                }
                break;
            case Update.Code.UPDATE_FAILED:
                Log.d(`${this.bundle} Update failed. ${event.getMessage()}`);
                break;
            case Update.Code.ERROR_UPDATING:
                Log.d(`${this.bundle} Asset update error: ${event.getAssetId()} , ${event.getMessage()}`);
                break;
            case Update.Code.ERROR_DECOMPRESS:
                Log.d(`${this.bundle} ${event.getMessage()}`);
                break;
            default:
                break;
        }
        if (failed) {
            this.assetsManager.manager.setEventCallback(null as any);
        }

        let isRestartApp = false;
        if (this.isMain) {
            if (isUpdateFinished) {
                this.assetsManager.manager.setEventCallback(null as any);
                //下載數量大於0，才有必要進入重啟，在如下這種情況下，並不會發生下載
                //當只提升了版本號，而並未對程式碼進行修改時，此時的只下載了一個project.manifest檔案，
                //不需要對遊戲進行重啟的操作
                if (event.getDownloadedFiles() > 0) {
                    isRestartApp = true;
                }
            }
        } else {
            //子游戲更新
            if (isUpdateFinished) {
                Log.d(`${this.bundle} 更新前是否加载过 : ${this.isLoaded}`)
                if (this.isLoaded && event.getDownloadedFiles() > 0) {
                    Log.d(`${this.bundle} 已经加载过，需要重启`)
                    isRestartApp = true;
                }
            }
        }

        this.state = state;
        this.code = code;

        let info: Update.DownLoadInfo = {
            downloadedBytes: event.getDownloadedBytes(),
            totalBytes: event.getTotalBytes(),
            downloadedFiles: event.getDownloadedFiles(),
            totalFiles: event.getTotalFiles(),
            percent: event.getPercent(),
            percentByFile: event.getPercentByFile(),
            code: event.getEventCode(),
            state: state as any,
            needRestart: isRestartApp,
            bundle: this.bundle,
            assetId: event.getAssetId(),
            progress: 0
        };

        if (info.code == Update.Code.UPDATE_FINISHED) {
            info.progress = 1.1;
            this.handler.onDownloading(this, info);
        } else if (info.code == Update.Code.UPDATE_PROGRESSION) {
            if (info.totalBytes <= 0) {
                info.progress = 0;
            } else {
                info.progress = info.percent == Number.NaN ? 0 : info.percent;
            }
            this.handler.onDownloading(this, info);
        } else if (info.code == Update.Code.ALREADY_UP_TO_DATE) {
            info.progress = 1;
            this.handler.onDownloading(this, info);
        } else if (info.code == Update.Code.UPDATE_FAILED ||
            info.code == Update.Code.ERROR_NO_LOCAL_MANIFEST ||
            info.code == Update.Code.ERROR_DOWNLOAD_MANIFEST ||
            info.code == Update.Code.ERROR_PARSE_MANIFEST ||
            info.code == Update.Code.ERROR_DECOMPRESS) {
            info.progress = -1;
            Log.e(`更新${this.name}失敗`);
            this.handler.onUpdateFailed(this);
        }
        if (isUpdateFinished) {
            Log.d(`${this.bundle} 更新完成,下载资源数 : ${event.getDownloadedFiles()}`)
            if (isRestartApp) {
                Log.d(`${this.bundle} 更新完成，需要重启游戏`)
                this.handler.onNeedRestartApp(this,(isDelayRestart : boolean)=>{
                    native.fileUtils.purgeCachedEntries();
                    let delay = 0.5;
                    if ( isDelayRestart ){
                        delay = 1;
                    }
                    setTimeout(() => {
                        Log.d(`${this.bundle} 重启游戏`);
                        game.restart();
                    }, delay);
                })
            }else{
                //清除搜索路径缓存
                native.fileUtils.purgeCachedEntries();
                //下载完成 重置热更新管理器，在游戏期间如果有发热更新，可以再次检测
                this.reset();
                this.handler.onDownloadComplete(this);
            }
        }
        Log.d(`${this.bundle}update cb  failed : ${failed}  , isRestartApp : ${isRestartApp} isUpdateFinished : ${isUpdateFinished} , updating : ${this.isUpdating}`);

        
    }
}

