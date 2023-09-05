import { Macro } from "../defines/Macros";
import { GameData } from "./GameData";

/** 
 * 遊戲內資料基類 同ProxyBase
 * 4/12 新增 getData、setData
 */
export abstract class GameDataBase<T> extends GameData {
    static module = Macro.UNKNOWN;
    /** 資料所有模組，由資料中心設定 */
    module: string = "";

    protected data: T;

    /** 設定資料 */
    public setData(value: T | any) { this.data = value; }

    /** 取得資料 */
    public getData(): T { return this.data; }

    /** 初始化 */
    public init(...args: any[]): any { }

    /** 銷燬(單列銷燬時呼叫) 很少使用 */
    public onDestory(...args: any[]): any { }

    /** 清理資料 */
    public clear(...args: any[]): any { }

    public debug() {
        Log.d(`${this.module}`);
    }
}