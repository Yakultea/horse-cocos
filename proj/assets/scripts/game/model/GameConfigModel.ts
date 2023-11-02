// ---------- 引用 ----------------------------------------------------------------
import { BaseModel } from "../../framework/core/event/BaseModel";

// ---------- 常數 ----------------------------------------------------------------
export interface IGameConfigModel {
    /* 檔案路徑 */
    filePaths: {
        horseMaterials: string;
        textures: string;
    };
    /* 是否loadResource完成 */
    isLoadResourcesCompleted: boolean;
    /* 是否socket initial成功回應 */
    isSocketInited: boolean;
    /* 每一幀的間隔時間 */
    framePerTime: number;
    /* 每一幀的時間倍數 (加快or變慢) */
    frameTimeRatio: number;
}

export enum EMusic { //音樂路徑
    CHEER = 'game/music/btm_cheer',
    RUNNING = 'game/music/btm_running',
    BRASS = 'game/music/btm_brass',
    GATE = 'game/music/btm_gate',
    GOAL = 'game/music/btm_goal',
    ACHIEVE = 'game/music/btm_achieve',
    BGM = 'game/music/bgm_mg',
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
            framePerTime: 0.055,
            frameTimeRatio: 1,
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

    public get frameTimeRatio() { return this.data.frameTimeRatio; }
}

export default GameConfigModel.Instance();