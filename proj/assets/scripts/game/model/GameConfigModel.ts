// ---------- 引用 ----------------------------------------------------------------
import { BaseModel } from "../../framework/core/event/BaseModel";

// ---------- 常數 ----------------------------------------------------------------
export interface IGameConfigModel {
    /* 檔案路徑 */
    filePaths: {
        horseMaterials: string;
    };
}

/**
 * Model 是用來儲存全部共用的資料 
 */
class GameConfigModel extends BaseModel<IGameConfigModel> {
    // ---------- 成員變數 --------------------------------------------------------
    private static _instance: GameConfigModel = null;
    public static Instance() { return this._instance || (this._instance = new GameConfigModel()); }

    constructor() {
        super();
        this.data = {
            filePaths: {
                horseMaterials: 'game/material',
            }
        };
    }

    // ---------- 框架呼叫 --------------------------------------------------------
    // public setData(GameModelVO: IGameConfigModel) {
    //     this.data = {
    //         value1: null,
    //     };
    // }

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

export default GameConfigModel.Instance();