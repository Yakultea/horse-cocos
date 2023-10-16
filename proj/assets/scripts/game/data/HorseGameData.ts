// ---------- 引用 ----------------------------------------------------------------

import { DEBUG } from "cc/env";
import { EOrientationType } from "../../framework/core/adapter/AdapterEvent";
import { GameDataBase } from "../../framework/data/GameDataBase";
import { Macro } from "../../framework/defines/Macros";
import { IHorseAnime, IFrameData } from "../types/res-type";
import { HorseGameEvent } from "../event/HorseGameEvent";
import { Asset, Material, SpriteFrame } from "cc";
import GameConfigModel from "../model/GameConfigModel";

// ---------- 常數 ----------------------------------------------------------------
interface IHorseGameData {
    frameData: IFrameData[];
    id: string;
    skin: number[];
    rider: number[];
    result: number[];
    periodId: string;
}

export default class HorseGameData extends GameDataBase<IHorseGameData> {
    // ---------- 成員變數 --------------------------------------------------------
    /** 資料所有模組，由資料中心設定 */
    static module = Macro.BUNDLE_RESOURCES; // 替換成WrapperData所屬 bundle

    /** 當前直橫式狀態 */
    public orientation: EOrientationType = null;

    public firstRankIndex: number = 0;
    public secondRankIndex: number = 0;
    public thirdRankIndex: number = 0;

    // ---------- 框架呼叫 ------------------------------------------------------
    /** 初始化 Enryt自動執行 */
    public init(...args: any[]): any {
        this.data = {
            frameData: [],
            id: '',
            skin: [],
            rider: [],
            result: [],
            periodId: '',
        };
    }

    // /** 銷燬(單列銷燬時呼叫) */
    // public onDestory(...args: any[]): any { }

    // /** 清理資料 */
    // public clear(...args: any[]): any { }

    // public debug() { Log.d(`${this.module}`); }

    // ---------- 內部呼叫 --------------------------------------------------------

    // ---------- 外部部呼叫 ------------------------------------------------------

    public setData(res: IHorseAnime) {
        if (!res) {
            console.warn('賽馬資料有問題', res);
            return;
        }

        this.data = res;

        for (let i = 0; i < res.frameData.length; i++) {
            if (res.frameData[i].goalNumbers.length) {
                this.firstRankIndex = i;
                break;
            }
        }

        dispatch(HorseGameEvent.PARSE_COMPLETED);

        if (DEBUG) {
            Log.d('*** setData *** ', this.data);
        }
    }

    public getHorseMaterial(fileName: string): Material {
        const { horseMaterials } = GameConfigModel.getData().filePaths;
        const data = App.cache.get(HorseGameData.module, horseMaterials);
        const materialData: Material = (data.data as Asset[]).find(sp => { return sp.name === fileName; }) as Material;
        if (!materialData) throw new Error(`NOT FIND 所需materialData ${fileName}`);
        return materialData;
    }

    public getGameTexture(fileName: string): SpriteFrame {
        const { textures } = GameConfigModel.getData().filePaths;
        const data = App.cache.get(HorseGameData.module, textures);
        const spriteFrameData: SpriteFrame = (data.data as Asset[]).find(sp => { return sp.name === fileName; }) as SpriteFrame;
        if (!spriteFrameData) throw new Error(`NOT FIND 所需spriteFrameData ${fileName}`);
        return spriteFrameData;
    }
}