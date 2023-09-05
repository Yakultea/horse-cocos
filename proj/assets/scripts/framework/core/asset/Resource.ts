import { Asset, isValid } from "cc";

/**@description 資源相關 */
export namespace Resource {
    /**@description 資源載入器錯誤 */
    export enum LoaderError {
        /**@description 載入中 */
        LOADING,
        /** @description 未找到或設定載入資源*/
        NO_FOUND_LOAD_RESOURCE,
        /**@description 完美載入 */
        SUCCESS,
    }
    /**@description 資源快取型別 */
    export enum CacheStatus {
        /**@description 無狀態 */
        NONE,
        /**@description 等待釋放 */
        WAITTING_FOR_RELEASE,
    }
    /**@description 資源型別 */
    export enum Type {
        /**@description 本地 */
        Local,
        /**@description 遠端資源 */
        Remote,
    }
    /**@description 資源資訊 */
    export class Info {
        url: string = "";
        type: typeof Asset = null!;
        data: Asset | Asset[] = null!;
        /**@description 是否常駐記憶體，遠端載入資源有效 */
        retain: boolean = false;
        bundle: BUNDLE_TYPE = null!;
        /**@description 預設為本地資源 */
        resourceType: Type = Type.Local;
        /**@description 加入釋放資源的時間戳 */
        stamp : number | null = null;
    }
    export class CacheData {
        /**@description 是否已經載入完成 */
        isLoaded: boolean = false;
        /**@description 載入完成資料 
         * cc.Prefab 
         * cc.SpriteAtlas 
         * cc.SpriteFrame 
         * cc.AudioClip 
         * cc.Font 
         * sp.SkeletonData 
         * cc.ParticleAsset 
         * cc.Texture2D
         * cc.JsonAsset
         * */
        data: Asset | Asset[] | null = null;

        info: Info = new Info();

        status: CacheStatus = CacheStatus.NONE;

        /**@description 在載入過程中有地方獲取,載入完成後再回調 */
        getCb: ((data: any) => void)[] = [];

        /**@description 完成回撥，在資源正在載入過程中，又有其它地方呼叫載入同一個資源，此時需要等待資源載入完成，統一回調 */
        finishCb: ((data: any) => void)[] = [];

        public doGet(data:any) {
            for (let i = 0; i < this.getCb.length; i++) {
                if (this.getCb[i]) this.getCb[i](data);
            }
            this.getCb = [];
        }

        public doFinish(data:any) {
            for (let i = 0; i < this.finishCb.length; i++) {
                if (this.finishCb[i]) this.finishCb[i](data);
            }
            this.finishCb = [];
        }

        public get isInvalid() {
            return this.isLoaded && this.data && !isValid(this.data);
        }
    }

    export interface Data {
        /**@description resources 目錄url 與 type 必須成對出現*/
        url?: string,
        /**@description 資源型別 與 url 必須成對出現 目前支援預載入的資源有cc.Prefab | cc.SpriteFrame | sp.SkeletonData*/
        type?: typeof Asset,
        /**
         * @description 預載入介面，不需要對url type賦值 
         * 如GameView遊戲介面，需要提前直接載入好介面，而不是隻載入預置體，
         * 在網路訊息來的時間，用預置體載入介面還是需要一定的時間，
         * 從而會造成訊息處理不是順序執行 
         * */
        preloadView?: UIClass<UIView>,
        bundle?: BUNDLE_TYPE,
        /**@description 如果是載入的目錄，請用dir欄位 */
        dir?: string,
    }
}