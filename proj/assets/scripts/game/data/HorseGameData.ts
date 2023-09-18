// ---------- 引用 ----------------------------------------------------------------

import { DEBUG } from "cc/env";
import { EOrientationType } from "../../framework/core/adapter/AdapterEvent";
import { GameDataBase } from "../../framework/data/GameDataBase";
import { Macro } from "../../framework/defines/Macros";
import { IDrawNotify, IFrameData } from "../types/res-type";

// ---------- 常數 ----------------------------------------------------------------
interface IHorseGameData {
    frameData: IFrameData[];
    skin: number[];
    rider: number[];
}

export default class HorseGameData extends GameDataBase<IHorseGameData> {
    // ---------- 成員變數 --------------------------------------------------------
    /** 資料所有模組，由資料中心設定 */
    static module = Macro.BUNDLE_RESOURCES; // 替換成WrapperData所屬 bundle

    /** 當前直橫式狀態 */
    public orientation: EOrientationType = null;

    // ---------- 框架呼叫 ------------------------------------------------------
    /** 初始化 Enryt自動執行 */
    public init(...args: any[]): any {
        this.data = {
            frameData: [],
            skin: [],
            rider: [],
        };
    }

    // /** 銷燬(單列銷燬時呼叫) */
    // public onDestory(...args: any[]): any { }

    // /** 清理資料 */
    // public clear(...args: any[]): any { }

    // public debug() { Log.d(`${this.module}`); }

    // ---------- 內部呼叫 --------------------------------------------------------

    // ---------- 外部部呼叫 ------------------------------------------------------

    public setData(res: IDrawNotify) {
        const { frameData, skin, rider } = res.horseAnime;

        this.data.frameData = frameData;
        this.data.skin = skin;
        this.data.rider = rider;

        if (DEBUG) {
            Log.d('*** setData *** ', this.data);
        }
    }
}