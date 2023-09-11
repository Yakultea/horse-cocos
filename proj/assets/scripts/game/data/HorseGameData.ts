// ---------- 引用 ----------------------------------------------------------------

import { EOrientationType } from "../../framework/core/adapter/AdapterEvent";
import { GameDataBase } from "../../framework/data/GameDataBase";
import { Macro } from "../../framework/defines/Macros";

// ---------- 常數 ----------------------------------------------------------------
interface IWrapperData {
    user: any;
}

// TODO: 色系之後要移除 改使用ColorModel
export interface IColorConfig {
    /** 主色 */
    main: string;
    /** 輔助色 */
    second: string;
    /** 禁用色 */
    disable: string

    /** 主色 normal */
    main_normal: string;
    /** 主色 pressed */
    main_pressed: string;
    /** 主色 disable */
    main_disable: string;

    // 按鈕1 底圖
    btn_bg_normal: string;
    btn_bg_hover: string;
    btn_bg_pressed: string;
    btn_bg_disable: string;
    // 按鈕1 文字
    btn_label_normal: string;
    btn_label_hover: string;
    btn_label_pressed: string;
    btn_label_disable: string;
}

export default class HorseGameData extends GameDataBase<IWrapperData> {
    // ---------- 成員變數 --------------------------------------------------------
    /** 資料所有模組，由資料中心設定 */
    static module = Macro.BUNDLE_RESOURCES; // 替換成WrapperData所屬 bundle

    /** 進入 slot framework view */
    public readonly ENTER_SLOT_VIEW: boolean = false;

    /** 當前直橫式狀態 */
    public orientation: EOrientationType = null;

    /** 主色 設定檔 TODO: 色系之後要移除 改使用ColorModel */
    private _colorConfig: IColorConfig = {
        main: '#FFD680',
        main_normal: '#FFD53A',
        main_pressed: '#FFDD61',
        main_disable: '#A18E4C',
        second: '#876A00',
        disable: '#56596F',

        btn_bg_normal: '#56596F',
        btn_bg_hover: '#696C7F',
        btn_bg_pressed: '#FFD53A',
        btn_bg_disable: '#4C5067',

        btn_label_normal: '#AAACB7',
        btn_label_hover: '#AAACB7',
        btn_label_pressed: '#876A00',
        btn_label_disable: '#76798B'
    };
    // ---------- 框架呼叫 ------------------------------------------------------
    /** 初始化 Enryt自動執行 */
    // public init(...args: any[]): any {
    //     this.data = {
    //         user: {
    //             name: 'JOJO',
    //             age: 66
    //         }
    //     };
    // }

    // /** 銷燬(單列銷燬時呼叫) */
    // public onDestory(...args: any[]): any { }

    // /** 清理資料 */
    // public clear(...args: any[]): any { }

    // public debug() { Log.d(`${this.module}`); }

    // ---------- 內部呼叫 --------------------------------------------------------
    // ---------- 外部部呼叫 ------------------------------------------------------
    /** user */
    public set colorConfig(value: IColorConfig) { this._colorConfig = value; }
    public get colorConfig(): IColorConfig { return this._colorConfig; }

}