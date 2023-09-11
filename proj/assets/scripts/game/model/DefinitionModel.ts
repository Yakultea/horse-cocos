// ---------- 引用 ----------------------------------------------------------------

import { BaseModel } from "../../framework/core/event/BaseModel";
import { IDefinitionBase } from "../types/res-type";


// ---------- 常數 ----------------------------------------------------------------
export interface IDefinitionModel {
    value1: number;
}

/**
 * Proxy 是用來儲存全部共用的資料 
 */
class DefinitionModel extends BaseModel<IDefinitionBase> {
    // ---------- 成員變數 --------------------------------------------------------
    private static _instance: DefinitionModel = null;
    public static Instance() { return this._instance || (this._instance = new DefinitionModel()); }

    constructor() {
        super();
        this.data = {
            viewDefs: {
                type: null,
                view: null,
            },
            symbolDefs: [],
            winlineDefs: [],
            winDefs: [],
            fgMultiple: null,
            gameVersion: null,
            libraryVersion: null,
            gameClass: [],
            digital:null
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

export default DefinitionModel.Instance();