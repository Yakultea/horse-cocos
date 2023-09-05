/**
 * @description 事件處理元件
 */
export default class OnlyEventComponent {

    private _events: Map<string, Function> = new Map();

    /**
     * 註冊事件 ，在onLoad中註冊，在onDestroy自動移除
     * @param name 
     * @param func 
     */
    protected on(name: string, func: Function) {
        if (this._events.has(name)) {
            Log.e(`${name} 重複註冊`);
            return;
        }
        App.dispatcher.on(name, func, this);
        this._events.set(name, func);
    }

    protected off(eventName: string) {
        if (this._events.has(eventName)) {
            //事件移除
            App.dispatcher.off(eventName, this);
            //刪除本地事件
            this._events.delete(eventName);
        }
    }
    public addEvents() {

    }

    onLoad( ...args : any[] ) {
        this.addEvents();
    }

    onDestroy(...args : any[]) {
        this._events.forEach((func, name) => {
            App.dispatcher.off(name, this);
        });
        this._events.clear();
    }
}
