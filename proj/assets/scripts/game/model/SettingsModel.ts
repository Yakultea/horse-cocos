// ---------- 引用 ----------------------------------------------------------------
import { BaseModel } from "../../framework/core/event/BaseModel";
import { ISettings } from "../types/res-type";

// ---------- 常數 ----------------------------------------------------------------
export interface ISettingsModel {
    backgroundVolume: number;
    effectVolume: number;
    notify: boolean;
    stopOnJackpot: boolean;  // 獲得JP彩金後停止
    turbo: boolean;
    stakeIndex: number;
    ratioIndex: number;
}

/**
 * SettingsModel 設定相關資料
 */
class SettingsModel extends BaseModel<ISettingsModel> {
    // ---------- 成員變數 --------------------------------------------------------
    private static _instance: SettingsModel = null;
    public static Instance() { return this._instance || (this._instance = new SettingsModel()); }

    constructor() {
        super();
        this.data = {
            backgroundVolume: null,
            effectVolume: null,
            notify: null,
            stopOnJackpot: null,
            turbo: null,
            stakeIndex: null,
            ratioIndex: null,
        };
    }

    // ---------- 框架呼叫 -------------------------------------------------------------
    public setData(settingsVO: ISettings) {
        const { sounds, notify, turbo } = settingsVO.advancedSettings;
        const { autoPlay, stakeIndex, ratioIndex } = settingsVO;
        this.data = {
            backgroundVolume: sounds.backgroundVolume,
            effectVolume: sounds.effectVolume,
            notify: notify,
            stopOnJackpot: autoPlay.stopOnJackpot,
            turbo: turbo,
            stakeIndex: stakeIndex,
            ratioIndex: ratioIndex,
        };
    }

    // ---------- 內部呼叫 --------------------------------------------------------

    // ---------- 外部部呼叫 ------------------------------------------------------



    /** backgroundVolume */
    public get backgroundVolume() { return this.data.backgroundVolume; }
    public set backgroundVolume(value: number) { this.data.backgroundVolume = value; }

    /** effectVolume */
    public get effectVolume() { return this.data.effectVolume; }
    public set effectVolume(value: number) { this.data.effectVolume = value; }

    /** notify */
    public get notify() { return this.data.notify; }
    public set notify(value: boolean) { this.data.notify = value; }

    /** stopOnJackpot */
    public get stopOnJackpot() { return this.data.stopOnJackpot; }
    public set stopOnJackpot(value: boolean) { this.data.stopOnJackpot = value; }

    /** turbo */
    public get turbo() { return this.data.turbo; }
    public set turbo(value: boolean) { this.data.turbo = value; }

    /** stakeIndex */
    public get stakeIndex() { return this.data.stakeIndex; }
    public set stakeIndex(value: number) { this.data.stakeIndex = value; }

    /** ratioIndex */
    public get ratioIndex() { return this.data.ratioIndex; }
    public set ratioIndex(value: number) { this.data.ratioIndex = value; }

    public reset() {
        this.data = {
            backgroundVolume: null,
            effectVolume: null,
            notify: null,
            stopOnJackpot: null,
            turbo: null,
            stakeIndex: null,
            ratioIndex: null,
        };
    }
}

export default SettingsModel.Instance();