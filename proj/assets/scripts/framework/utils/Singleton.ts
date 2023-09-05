import { SingletonT } from "./SingletonT";

/**
 * @description 單列管理
 */
export default class Singleton extends SingletonT<ISingleton> implements ISingleton {
    module: string = "【單列管理器】";
    protected static _instance: Singleton = null!;
    public static get instance() { return this._instance || (this._instance = new Singleton()); }
}

/** 參考例子 */
// export class Singleton {
//     /** 取得單一實例 */
//     public static getInstance<T extends {}>(this: new () => T): T {
//         if (!(<any>this)._instance) {
//             (<any>this)._instance = new this();
//         }
//         return (<any>this)._instance;
//     }

//     /** 刪除單一實例 */
//     public static deleteInstance(): void {
//         (<any>this)._instance = null;
//     }
// }