import { Net } from "../Net";
import { Codec, Message } from "./Message";

/**
 * @description protobuf解析基類
 */
export abstract class ProtoMessage<T> extends Message {
    /**@description 傳送或接收的訊息流 */
    buffer: Uint8Array = null!;

    /**@description 直接把真正的Proto型別給賦值 */
    private type: any = null;

    /**@description 真空的Proto資料 */
    data: T = null!;

    constructor(protoType:any){
        super();
        this.type = protoType;
    }

    /**@description 打包資料 */
    encode(): boolean {
        this.buffer = this.type.encode(this.data).finish();
        if (this.buffer) {
            return true;
        }
        return false;
    }
    /**@description 解析資料 */
    decode(data: Uint8Array): boolean {
        if (data) {
            this.buffer = data;
            this.data = this.type.decode(this.buffer);
            return true;
        }
        return false;
    }
}

export abstract class ProtoCodec extends Codec {

}

export abstract class ProtoMessageHeartbeat extends Message{
    static type = Net.ServiceType.Proto;
}