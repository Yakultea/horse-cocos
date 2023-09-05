
export abstract class IMessage {
    /**@description 傳送或接收的位元組資料流 */
    abstract buffer: SocketBuffer;
    /**@description 訊息命令碼 */
    abstract get cmd(): string | number
}

export abstract class Codec extends IMessage {
    //編碼資料
    abstract pack(data: IMessage): boolean
    //解碼資料
    abstract unPack(data: MessageEvent): boolean
}


export abstract class Message extends IMessage {
    //編碼資料
    abstract encode(): boolean
    //解碼資料
    abstract decode(data: SocketBuffer): boolean
}