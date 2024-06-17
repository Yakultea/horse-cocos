
/**
 * @description 事件派發器，原生的，當前節點沒有在執行時，無法收到訊息
 */

import { DEBUG } from "cc/env";
import { Config } from "../../../common/config/Config";

interface IEvent {
    type: string, // 事件型別
    target: any, //事件target
    callback: Function;//事件回调
    once?: boolean;//是否只调用一次
}

export class Dispatcher implements ISingleton {

    protected static _instance: Dispatcher = null!;
    public static get instance() { return this._instance || (this._instance = new Dispatcher()); }
    protected _eventCaches: { [key: string]: Array<IEvent> } = null!;
    constructor() {
        this._eventCaches = {};
    }
    isResident?: boolean = true;
    static module: string = "【事件管理器】";
    module: string = null!;
    destory() {
        Dispatcher._instance = null as any;
    }
    /**
     * @description 新增事件
     * @param type 事件型別
     * @param callback 事件回撥
     * @param target target
     */
    public on(type: string, callback: Function, target: any, once?: boolean) {
        if (!type || !callback || !target) return;
        if (DEBUG) {
            Log.w(`==================== on ${type} end`);
        }
        let eventCaches: Array<IEvent> = this._eventCaches[type] || [];
        let hasSame = false;
        for (let i = 0; i < eventCaches.length; i++) {
            if (eventCaches[i].target === target) {
                hasSame = true;
                break;
            }
        }
        if (hasSame) {
            return;
        }
        let newEvent: IEvent = { type: type, callback: callback, target: target, once: once };
        eventCaches.push(newEvent);
        this._eventCaches[type] = eventCaches;
    }

    /**
     * @description 移除事件
     * @param type 事件型別
     * @param target 
     */
    public off(type: string, target: any) {
        if (!type || !target) {
            return;
        }
        let eventCaches: Array<IEvent> = this._eventCaches[type];
        if (!eventCaches) {
            return;
        }
        for (let i = 0; i < eventCaches.length; i++) {
            if (eventCaches[i].target === target) {
                eventCaches.splice(i, 1);
                break;
            }
        }
        if (eventCaches.length == 0) {
            delete this._eventCaches[type];
        }
    }

    /**
     * @description 派發事件
     * @param type 事件型別
     * @param data 事件資料
     */
    public dispatch() {
        if (arguments.length < 1) {
            return;
        }
        if (DEBUG && Config.NEED_DISPATCH_LOG) {
            // DEBUG使用 排除特定包含log
            const exclude: string[] = ['WrapperEvent:NOTIFY_JACKPOT_RESPONSE'];// ['G1001', 'Slot']
            if (!exclude.some(str => arguments[0].includes(str))) {
                Log.w(`==================== dispatch ${arguments[0]}`, arguments[1] !== undefined ? arguments[1] : '');
            }
        }

        let type = arguments[0];
        if (!type) return;
        Array.prototype.shift.apply(arguments);
        let eventCaches: Array<IEvent> = this._eventCaches[type];
        if (!eventCaches) return;
        let onceEvent: IEvent[] = [];
        for (let i = 0; i < eventCaches.length; i++) {
            let event = eventCaches[i];
            try {
                if (typeof Reflect == "object") {
                    Reflect.apply(event.callback, event.target, arguments);
                } else {
                    event.callback.apply(event.target, arguments);
                }
                if (event.once) {
                    onceEvent.push(event);
                }
            } catch (err) {
                Log.e(err);
            }
        }
        for (let i = 0; i < onceEvent.length; i++) {
            const ele = onceEvent[i];
            this.off(ele.type, ele.target);
        }
    }
}

// 在EventManager中做掉
window.dispatch = function () {
    //向自己封闭的管理器中也分发
    if (App) {
        Reflect.apply(App.dispatcher.dispatch, App.dispatcher, arguments);
    } else {
        Reflect.apply(Dispatcher.instance.dispatch, Dispatcher.instance, arguments);
    }
}