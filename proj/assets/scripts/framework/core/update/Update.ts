import { native } from "cc";
import { Macro } from "../../defines/Macros";

/**@description 熱更新相關*/
export namespace Update {
    export const MAIN_PACK = Macro.MAIN_PACK_BUNDLE_NAME;
    export const MANIFEST_ROOT = "manifest/";
    /**@description 下載資訊 */
    export interface DownLoadInfo {
        /**@description 下載當前資料大小 */
        downloadedBytes: number,
        /**@description 下載資料總大小 */
        totalBytes: number,
        /**@description 當前下載檔案數量 */
        downloadedFiles: number,
        /**@description 當前下載的總檔案數量 */
        totalFiles: number,
        /**@description 下載總進入 */
        percent: number,
        /**@description 下載當前檔案的進度 */
        percentByFile: number,
        /**@description 下載Code */
        code: Code,
        /**@description 下載State */
        state: State,
        /**@description 是否需要重啟 */
        needRestart: boolean;
        /**@description bundle */
        bundle: string;
        /**@description 資源id */
        assetId: string;
        /**@description 總下載進度 0 ~ 1 >1 為下載完成 */
        progress: number;
    }
    export enum Code {
        /**@description 找不到本地mainfest檔案*/
        ERROR_NO_LOCAL_MANIFEST,
        /**@description 下載manifest檔案錯誤 */
        ERROR_DOWNLOAD_MANIFEST,
        /**@description 解析manifest檔案錯誤 */
        ERROR_PARSE_MANIFEST,
        /**@description 找到新版本 */
        NEW_VERSION_FOUND,
        /**@description 當前已經是最新版本 */
        ALREADY_UP_TO_DATE,
        /**@description 更新下載進度中 */
        UPDATE_PROGRESSION,
        /**@description 資源更新中 */
        ASSET_UPDATED,
        /**@description 更新錯誤 */
        ERROR_UPDATING,
        /**@description 更新完成 */
        UPDATE_FINISHED,
        /**@description 更新失敗 */
        UPDATE_FAILED,
        /**@description 解壓資源失敗 */
        ERROR_DECOMPRESS,

        //以下是js中擴充套件的欄位，上面是引擎中已經有的欄位

        /**@description 主包版本不匹配，需要升級主包 */
        MAIN_PACK_NEED_UPDATE,
        /**@description 預處理版本檔案不存在 */
        PRE_VERSIONS_NOT_FOUND,
        /**@description 未初始化 */
        UNINITED,
    }
    export enum State {
        /**@description 未初始化 */
        UNINITED,
        /**@description 找到manifest檔案 */
        UNCHECKED,
        /**@description 準備下載版本檔案 */
        PREDOWNLOAD_VERSION,
        /**@description 下載版本檔案中 */
        DOWNLOADING_VERSION,
        /**@description 版本檔案下載完成 */
        VERSION_LOADED,
        /**@description 準備載入project檔案 */
        PREDOWNLOAD_MANIFEST,
        /**@description 下載project檔案中 */
        DOWNLOADING_MANIFEST,
        /**@description 下載project檔案完成 */
        MANIFEST_LOADED,
        /**@description 需要下載更新 */
        NEED_UPDATE,
        /**@description 準備更新 */
        READY_TO_UPDATE,
        /**@description 更新中 */
        UPDATING,
        /**@description 解壓中 */
        UNZIPPING,
        /**@description 已經是最新版本 */
        UP_TO_DATE,
        /**@description 更新失敗 */
        FAIL_TO_UPDATE,
    }

    /**
     * @description 熱更新狀態，
     */
    export enum Status {
        /**@description 需要下載 */
        NEED_DOWNLOAD,
        /**@description 已經是最新版本 */
        UP_TO_DATE,
        /**@description 需要下載更新 */
        NEED_UPDATE,
    }

    export class Config {
        /**@description Bundle名 如:hall*/
        bundle: string = "";
        /**@description Bundle名 如:大廳  */
        name: string = "";
        /**
         * 
         * @param name bundle名 如：大廳
         * @param bundle Bundle名 如:hall
         */
        constructor(
            name: string,
            bundle: string) {
            this.name = name;
            this.bundle = bundle;
        }

        clone() {
            return new Config(this.name, this.bundle);
        }
    }

    export class AssetsManager {

        constructor(name: string, storagePath: string) {
            this.name = name;
            this.type = `type.${name}`;
            this.storagePath = storagePath;
            this.create();
        }

        /**@description 當前資源管理器的名稱 */
        name: string = "";

        private _manager: native.AssetsManager = null!;
        /**@description 當前資源管理器的實體 jsb.AssetsManager */
        get manager() {
            if (!this._manager) {
                this.create();
            }
            return this._manager;
        }
        set manager(v) {
            this._manager = v;
        }

        private type: string = "";

        private storagePath: string = "";

        reset() {
            this.manager.reset();
        }

        private create() {
            Log.d(`建立 ${this.name} AssetsManager`);
            this.manager = new native.AssetsManager(this.type, this.storagePath);
        }
    }
}