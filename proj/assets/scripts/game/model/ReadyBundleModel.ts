// ---------- 引用 ----------------------------------------------------------------
import { EBundles } from "../../common/data/Bundles";
import { BaseModel } from "../../framework/core/event/BaseModel";

// ---------- 常數 ----------------------------------------------------------------
export interface IReadyBundleModel {
    loadCompleteMap: Map<EBundles, boolean>;
    status: EReadyStatus;
}

export enum EReadyStatus{
    'init',
    'loading',
    'complete',
}
/**
 * Model 是用來儲存全部共用的資料 
 */
class ReadyBundleModel extends BaseModel<IReadyBundleModel> {
    // ---------- 成員變數 --------------------------------------------------------
    private static _instance: ReadyBundleModel = null;
    public static Instance() { return this._instance || (this._instance = new ReadyBundleModel()); }

    constructor() {
        super();
        this.data = {
            // expectedBundles: [],
            loadCompleteMap: new Map(),
            status: null
        }
    }

    // ---------- 內部呼叫 --------------------------------------------------------

    /** 檢查是否都載入完畢 */
    private checkComplete(): boolean {
        // 取得 Map 中的所有值並轉為陣列
        const values = Array.from(this.data.loadCompleteMap.values());
        // 檢查是否所有值都為 true
        const allTrue = values.every((value) => value === true);
        return allTrue;
    }
    // ---------- 外部部呼叫 ------------------------------------------------------

    /** 初始化 */
    public init(bundles: EBundles[]) {
        this.data.status = EReadyStatus.init;
        bundles.forEach(key => {
            this.data.loadCompleteMap.set(key, false);
        });
    }

    /** 設置完成bundle */
    public setComplete(bundle: EBundles) {
        this.data.status = EReadyStatus.loading;
        this.data.loadCompleteMap.set(bundle, true);
        if(this.checkComplete()){
            this.data.status = EReadyStatus.complete;
        }
    }

    /** 是否都完成 */
    public isComplete() {
        return this.data.status === EReadyStatus.complete;
    }

    /** 重置 */
    public reset() {
        this.data = {
            // expectedBundles: [],
            loadCompleteMap: new Map(),
            status: null
        };
    }
}

export default ReadyBundleModel.Instance();