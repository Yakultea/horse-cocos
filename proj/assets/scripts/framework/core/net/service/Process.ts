import { DefaultCodec } from "../message/DefaultCodec";
import { Codec, Message } from "../message/Message";
import { Net } from "../Net";

export type MessageHandleFunc = (handleTypeData: any) => number;

export class Process {
    public Codec: new () => Codec = DefaultCodec;

    /** 監聽集合*/
    protected _listeners: { [key: string]: Net.ListenerData[] } = {};
    /** 訊息處理佇列 */
    protected _masseageQueue: Array<Net.ListenerData[]> = new Array<Net.ListenerData[]>();


    /** 是否正在處理訊息 ，訊息佇列處理訊息有時間，如執行一個訊息需要多少秒後才執行一下個*/
    protected _isDoingMessage: boolean = false;

    /** @description 可能後面有其它特殊需要，特定情況下暫停訊息佇列的處理, true為停止訊息佇列處理 */
    public isPause: boolean = false;
    serviceType: Net.ServiceType = null!;

    /**
     * @description 暫停訊息佇列訊息處理
     */
    public pauseMessageQueue() { this.isPause = true }

    /**
     * @description 恢復訊息佇列訊息處理
     */
    public resumeMessageQueue() { this.isPause = false }


    public handMessage() {

        //如果當前暫停了訊息佇列處理，不再處理訊息佇列
        if (this.isPause) return;

        //如果當前有函式正在處理
        if (this._isDoingMessage) return;
        //如果當前執行佇列為空
        if (this._masseageQueue.length == 0) return;

        let datas = this._masseageQueue.shift();
        if (datas == undefined) return;
        if (datas.length == 0) return;

        this._isDoingMessage = true;
        let handleTime = 0;
        for (let i = 0; i < datas.length; i++) {
            let data = datas[i];
            if (data.func instanceof Function) {
                try {
                    let tempTime = data.func.call(data.target, data.data);
                    if (typeof tempTime == "number") {
                        handleTime = Math.max(handleTime, tempTime);
                    }
                } catch (err) {
                    Log.e(err);
                }
            }
        }

        if (handleTime == 0) {
            //立即進行處理
            this._isDoingMessage = false;
        }
        else {
            App.uiManager.mainController?.scheduleOnce(() => {
                this._isDoingMessage = false;
            }, handleTime);
        }
    }

    public onMessage(code: Codec) {
        Log.d(`recv data main cmd : ${code.cmd}`);
        let key = String(code.cmd);
        if (!this._listeners[key]) {
            Log.w(`no find listener data main cmd : ${code.cmd}`);
            return;
        }
        if (this._listeners[key].length <= 0) {
            return;
        }

        this.addMessageQueue(key, code, true)
    }

    /**
     * @description 重置
     */
    public reset() {
        this._isDoingMessage = false;
        this._listeners = {};
        this._masseageQueue = [];
        this.resumeMessageQueue();
    }

    public close() {
        this._masseageQueue = [];
        this._isDoingMessage = false;
    }

    public addListener(cmd: string, handleType: any, handleFunc: MessageHandleFunc, isQueue: boolean, target: any) {
        let key = cmd;

        if (this._listeners[key]) {
            let hasSame = false;
            for (let i = 0; i < this._listeners[key].length; i++) {
                if (this._listeners[key][i].target === target) {
                    hasSame = true;
                    break;
                }
            }
            if (hasSame) {
                return;
            }
            this._listeners[key].push({
                cmd: cmd,
                func: handleFunc,
                type: handleType,
                isQueue: isQueue,
                target: target
            });
        }
        else {
            this._listeners[key] = [];
            this._listeners[key].push({
                cmd: cmd,
                func: handleFunc,
                type: handleType,
                isQueue: isQueue,
                target: target
            });
        }
    }

    public removeListeners(target: any, eventName?: string) {
        if (eventName) {
            let self = this;
            Object.keys(this._listeners).forEach((value) => {
                let datas = self._listeners[value];
                let i = datas.length;
                while (i--) {
                    if (datas[i].target == target && datas[i].cmd == eventName) {
                        datas.splice(i, 1);
                    }
                }
                if (datas.length == 0) {
                    delete self._listeners[value];
                }
            });

            //移除網路佇列中已經存在的訊息
            let i = this._masseageQueue.length;
            while (i--) {
                let datas = this._masseageQueue[i];
                let j = datas.length;
                while (j--) {
                    if (datas[j].target == target && datas[i].cmd == eventName) {
                        datas.splice(j, 1);
                    }
                }
                if (datas.length == 0) {
                    this._masseageQueue.splice(i, 1);
                }
            }

        } else {
            let self = this;
            Object.keys(this._listeners).forEach((value: string, index: number, arr: string[]) => {
                let datas = self._listeners[value];

                let i = datas.length;
                while (i--) {
                    if (datas[i].target == target) {
                        datas.splice(i, 1);
                    }
                }

                if (datas.length == 0) {
                    delete self._listeners[value];
                }
            })

            //移除網路佇列中已經存在的訊息
            let i = this._masseageQueue.length;
            while (i--) {
                let datas = this._masseageQueue[i];
                let j = datas.length;
                while (j--) {
                    if (datas[j].target == target) {
                        datas.splice(j, 1);
                    }
                }
                if (datas.length == 0) {
                    this._masseageQueue.splice(i, 1);
                }
            }
        }
    }

    protected decode(o: Net.ListenerData, header: Codec): Message | null {
        let obj: Message = null!;
        if ( this.serviceType == Net.ServiceType.Proto ){
            if ( o.type && typeof o.type == "string" ){
                let type = App.protoManager.lookup(o.type) as protobuf.Type;
                if( type ){
                    obj = App.protoManager.decode({
                        className : o.type,
                        buffer : header.buffer as Uint8Array,
                    }) as any;
                }else{
                    obj = header.buffer as any;
                }
            }else{
                obj = header.buffer as any;
            }
            return obj;
        }else{
            if (o.type && typeof o.type != "string") {
                obj = new o.type();
                //解包
                obj.decode(header.buffer);
            } else {
                //把資料放到裡面，讓後面使用都自己解析,資料未解析，此訊息推後解析
                obj = header.buffer as any;
            }
            return obj
        }
    }

    public addMessageQueue(key: string, data: any, encode: boolean) {
        if (this._listeners[key].length <= 0) { return }
        let listenerDatas = this._listeners[key];
        let queueDatas = [];

        for (let i = 0; i < listenerDatas.length; i++) {
            let obj: Message = data
            if (encode) {
                obj = this.decode(listenerDatas[i], data) as Message
            }

            if (listenerDatas[i].isQueue) {
                //需要加入佇列處理
                queueDatas.push(this.copyListenerData(listenerDatas[i], obj));
            }
            else {
                //不需要進入佇列處理
                try {
                    listenerDatas[i].func && listenerDatas[i].func.call(listenerDatas[i].target, obj);
                } catch (err) {
                    Log.e(err);
                }

            }
        }
        if (queueDatas.length > 0) {
            this._masseageQueue.push(queueDatas);
        }
    }

    /**
     * @description 複製proto協議監聽資料
     * @param input 
     * @param data 
     */
    private copyListenerData(input: Net.ListenerData, data: any): Net.ListenerData {
        return {
            type: input.type,
            func: input.func,
            isQueue: input.isQueue,
            data: data,
            target: input.target,
            cmd: input.cmd
        };
    }
}