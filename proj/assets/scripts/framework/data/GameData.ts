import { Macro } from "../defines/Macros";

/**@description 遊戲內資料的公共原始基類 */
export abstract class GameData implements ISingleton {
    static module = Macro.UNKNOWN;
    /**@description 資料所有模組，由資料中心設定 */
    module: string = "";

    /**@description 初始化 */
    init(...args: any[]): any {

    }
    /**@description 銷燬(單列銷燬時呼叫) */
    destory(...args: any[]): any {

    }
    /**@description 清理資料 */
    clear(...args: any[]): any {

    }

    debug(){
        Log.d(`${this.module}`)
    }
}