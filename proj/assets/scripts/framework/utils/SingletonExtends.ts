
/** 參考例子 */
export class SingletonExtends {
    /** 取得單一實例 */
    public static instance<T extends {}>(this: new () => T): T {
        if (!(<any>this)._instance) {
            (<any>this)._instance = new this();
        }
        return (<any>this)._instance;
    }

    /** 刪除單一實例 */
    public static destory(): void {
        (<any>this)._instance = null;
    }
}