import { MessageStruct } from "../../framework/core/net/message/DefaultCodec";
import { ProtoMessage } from "../../framework/core/net/message/ProtoMessage";

/**@description 根據自己專案擴充套件 */
export class CmmProto<T> extends ProtoMessage<T> implements MessageStruct{
    cmd : string | number = "";
    mainCmd: number = 0;
    subCmd: number = 0;
}