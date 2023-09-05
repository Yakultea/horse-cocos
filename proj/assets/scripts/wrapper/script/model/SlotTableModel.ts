// ---------- 引用 ----------------------------------------------------------------

import { BaseModel } from "../../../framework/core/event/BaseModel";
import { ITables } from "../types/res-type";


// ---------- 常數 ----------------------------------------------------------------
// export interface ISlotTableModel extends ITables {

// }

/**
 * Model 是用來儲存全部共用的資料 
 */
class SlotTableModel extends BaseModel<ITables> {
    // ---------- 成員變數 --------------------------------------------------------
    private static _instance: SlotTableModel = null;
    public static Instance() { return this._instance || (this._instance = new SlotTableModel()); }

    constructor() {
        super();
        this.data = {
            bet: null,
            number: null,
            roomId: null,
            status: null,
            win: null,

        };
    }

    // ---------- 內部呼叫 --------------------------------------------------------

    // ---------- 外部部呼叫 ------------------------------------------------------

    /** value1 */
    // public get value1() { return this.data.value1; }
    // public set value1(value: number) { this.data.value1 = value; }

    // public reset() {
    //     this.data = {
    //         value1: null,
    //     };
    // }
}

export default SlotTableModel.Instance();