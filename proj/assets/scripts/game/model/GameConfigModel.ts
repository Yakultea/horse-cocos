// ---------- 引用 ----------------------------------------------------------------
import { BaseModel } from "../../framework/core/event/BaseModel";

// ---------- 常數 ----------------------------------------------------------------
export interface IGameConfigModel {
    /* 檔案路徑 */
    filePaths: {
        horseMaterials: string;
        textures: string;
    };
    isLoadResourcesCompleted: boolean;
    isSocketInited: boolean;
    framePerTime: number;
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
                textures: 'game/texture',
            },
            isLoadResourcesCompleted: false,
            isSocketInited: false,
            framePerTime: 0.06,
        };
    }

    // ---------- 框架呼叫 --------------------------------------------------------

    // ---------- 內部呼叫 --------------------------------------------------------

    // ---------- 外部部呼叫 ------------------------------------------------------

    public get isLoadResourcesCompleted() { return this.data.isLoadResourcesCompleted; }
    public set isLoadResourcesCompleted(value: boolean) { this.data.isLoadResourcesCompleted = value; }

    public get isSocketInited() { return this.data.isSocketInited; }
    public set isSocketInited(value: boolean) { this.data.isSocketInited = value; }

    public get framePerTime() { return this.data.framePerTime; }
}

export default GameConfigModel.Instance();