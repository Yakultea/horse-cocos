/**
 * @description 事件處理元件
 */

import { Component, Node, NodeEventType, _decorator, __private } from "cc";
import { IEventProcessor, EventAgrs, EventProcessor, EventCallback } from "../core/event/EventProcessor";
import { AdapterEvent, EOrientationType } from "../core/adapter/AdapterEvent";

const { ccclass, property } = _decorator;

@ccclass
export default class EventComponent extends Component implements IEventProcessor {

    private _eventProcessor = new EventProcessor;

    /** 監聽 */
    on(eventName: string, callback: EventCallback): void {
        this._on({
            bind: "Dispatcher",
            type: eventName,
            cb: callback
        });
    }

    /** 監聽一次 */
    once(eventName: string, callback: EventCallback): void {
        this._once({
            bind: "Dispatcher",
            type: eventName,
            cb: callback,
        });
    }

    /** 關閉監聽 */
    off(eventName: string): void {
        this._off({
            bind: "Dispatcher",
            type: eventName,
        });
    }

    /** 框架的on */
    _on(args: EventAgrs): void {
        if (!args.target) {
            args.target = this;
        }
        this._eventProcessor._on(args);
    }
    /** 框架的once */
    _once(args: EventAgrs): void {
        if (!args.target) {
            args.target = this;
        }
        this._eventProcessor._once(args);
    }
    /** 框架的off */
    _off(args: EventAgrs): void {
        if (!args.target) {
            args.target = this;
        }
        this._eventProcessor._off(args);
    }

    onD(eventName: string, func: EventCallback): void {
        this._on({
            bind: "Dispatcher",
            type: eventName,
            cb: func,
        });
    }

    onceD(eventName: string, func: EventCallback): void {
        this._once({
            bind: "Dispatcher",
            type: eventName,
            cb: func,
        });
    }

    offD(eventName: string): void {
        this._off({
            bind: "Dispatcher",
            type: eventName,
        });
    }

    onG(type: string, cb: EventCallback): void {
        this._on({
            bind: "Game",
            type: type,
            cb: cb
        });
    }
    onceG(type: string, cb: EventCallback): void {
        this._once({
            bind: "Game",
            type: type,
            cb: cb
        });
    }
    offG(type: string, cb: EventCallback): void {
        this._off({
            bind: "Game",
            type: type,
            cb: cb
        });
    }

    onI<K extends keyof __private._cocos_input_input__InputEventMap>(eventType: K, cb: EventCallback): void {
        this._on({
            bind: "Input",
            type: eventType,
            cb: cb
        });
    }
    onceI<K extends keyof __private._cocos_input_input__InputEventMap>(eventType: K, cb: EventCallback): void {
        this._once({
            bind: "Input",
            type: eventType,
            cb: cb
        });
    }
    offI<K extends keyof __private._cocos_input_input__InputEventMap>(eventType: K, cb: EventCallback): void {
        this._off({
            bind: "Input",
            type: eventType,
            cb: cb
        });
    }

    onN(node: Node, type: string | NodeEventType, cb: EventCallback, target?: unknown, useCapture?: any): void {
        this._on({
            bind: "Node",
            type: type,
            cb: cb,
            target: target,
            useCapture: useCapture,
            node: node
        });
    }
    onceN(node: Node, type: string | NodeEventType, cb: EventCallback, target?: unknown, useCapture?: any): void {
        this._once({
            bind: "Node",
            type: type,
            cb: cb,
            target: target,
            useCapture: useCapture,
            node: node
        });
    }
    offN(node: Node, type: string | NodeEventType, cb: EventCallback, target?: unknown, useCapture?: any): void {
        this._off({
            bind: "Node",
            type: type,
            cb: cb,
            target: target,
            useCapture: useCapture,
            node: node
        });
    }

    /** 註冊監聽事件 */
    public addEvents() {
        this.on(AdapterEvent.ORIENTATION, (type: EOrientationType) => {
            this.setAdapter(type);
        });
    }

    onLoad() {
        this.addEvents();
    }

    onDestroy() {
        this._eventProcessor.onDestroy();
    }

    /** 設定適配器 */
    protected setAdapter(type: EOrientationType){
    }

}

