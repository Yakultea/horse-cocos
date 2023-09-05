/**
 * @description 二進位制資料流解析
 */

import { Macro } from "../../../defines/Macros";
import { ByteArray } from "../../../plugin/ByteArray";
import { Net } from "../Net";
import { Message } from "./Message";

type BinaryStreamConstructor = typeof BinaryStream;
type NumberValueConstructor = typeof NumberValue;
type STRINGConstructor = typeof STRING;
type BOOLConstructor = typeof BOOL;

/**
 * @description 基礎資料型別裝飾器
 * @param key 序列化的Key
 * @param type 序列化的型別
 * @param byteSize 序列化指定位元組長度，只有 STRING 有效
 */
export function serialize(
    key: string,
    type: BinaryStreamConstructor | NumberValueConstructor | STRINGConstructor | BOOLConstructor,
    byteSize?: number
): Function;

/**
 * @description 陣列裝飾器
 * @param key 序列化的Key
 * @param type 序列化的型別
 * @param arrayType 陣列元素型別
 * @param byteSize 序列化字串指定位元組長度，當元素型別為 STRING 時且需要指定長度時有效，否則填 undefined 
 * @param dimension 陣列維數指定,不傳傳預設按一維陣列進行解析
 * @example @ser
 */
export function serialize(
    key: string,
    type: ArrayConstructor,
    arrayType: BinaryStreamConstructor | NumberValueConstructor | STRINGConstructor,
    byteSize?: number,
    dimension?: number): Function;
export function serialize(key: string, type: any, arrTypeOrByteSize?: any, byteSize?: any, dimension?: number) {
    return function (target: any, memberName: any) {
        if (Reflect.getOwnPropertyDescriptor(target, '__serialize__') === undefined) {
            let selfSerializeInfo: any = {};
            if ((<any>Reflect.getPrototypeOf(target))['__serialize__']) {
                // 父類擁有序列化資訊,並且自己沒有序列化資訊,則複製父類到當前類中來
                if (Reflect.getOwnPropertyDescriptor(target, '__serialize__') === undefined) {
                    let parentSerializeInfo = (<any>Reflect.getPrototypeOf(target))['__serialize__'];
                    let serializeKeyList = Object.keys(parentSerializeInfo);
                    for (let len = serializeKeyList.length, i = 0; i < len; i++) {
                        selfSerializeInfo[serializeKeyList[i]] = parentSerializeInfo[serializeKeyList[i]].slice(0);
                    }
                }
            }
            Reflect.defineProperty(target, '__serialize__', {
                value: selfSerializeInfo,
            });
        }
        if (target['__serialize__'][key]) {
            throw `SerializeKey has already been declared:${key}`;
        }
        target['__serialize__'][key] = [memberName, type, arrTypeOrByteSize, byteSize, dimension];
    }
}

/**@description 資料流介面 */
interface IStreamValue {
    data: any;
    read(byteArray: ByteArray): void;
    write(byteArray: ByteArray): void;
    littleEndian: string;
}

/**@description 資料流基類 */
class StreamValue<T> implements IStreamValue {
    data: T = null!;
    read(byteArray: ByteArray): void { }
    write(byteArray: ByteArray): void { }
    /**@description 網路資料全以大端方式進行處理 */
    get littleEndian() {
        return Macro.USING_LITTLE_ENDIAN;
    }
}

/**@description 數值型別 */
class NumberValue extends StreamValue<number>{
    data = 0;
}

/**@description 字串型別 */
export class BOOL extends StreamValue<boolean>{
    data = false;
    read(byteArray: ByteArray) {
        //先讀取字串長度
        this.data = byteArray.readBoolean();
    }

    write(byteArray: ByteArray) {
        byteArray.writeBoolean(this.data);
    }
}

/**@description 字串型別 */
export class STRING extends StreamValue<string> {
    data = "";
    /**@description 定長位元組數大小,注意不是字串的個數 */
    byteSize: number | undefined = undefined;
    read(byteArray: ByteArray) {
        //先讀取字串長度
        let size = this.byteSize;
        if (this.byteSize == undefined) {
            //不定長處理
            size = byteArray.readUnsignedInt();
        }
        this.data = byteArray.readUTFBytes(size as number);
    }

    write(byteArray: ByteArray) {
        let buffer = new ByteArray();
        buffer.writeUTFBytes(this.data, this.byteSize);
        if (this.byteSize == undefined) {
            //不定長處理
            byteArray.writeUnsignedInt(buffer.length);
        }
        byteArray.writeBytes(buffer);
    }
}

export class FLOAT extends NumberValue {
    read(byteArray: ByteArray) {
        this.data = byteArray.readFloat();
    }
    write(byteArray: ByteArray) {
        byteArray.writeFloat(this.data);
    }
}

export class DOUBLE extends NumberValue {
    read(byteArray: ByteArray) {
        this.data = byteArray.readDouble();
    }

    write(byteArray: ByteArray) {
        byteArray.writeDouble(this.data);
    }
}

export class BYTE extends NumberValue {
    read(byteArray: ByteArray) {
        this.data = byteArray.readByte();
    }

    write(byteArray: ByteArray) {
        byteArray.writeByte(this.data);
    }
}

export class SHORT extends NumberValue {
    read(byteArray: ByteArray) {
        this.data = byteArray.readShort();
    }

    write(byteArray: ByteArray) {
        byteArray.writeShort(this.data);
    }
}

export class INT extends NumberValue {
    read(byteArray: ByteArray) {
        this.data = byteArray.readInt();
    }

    write(byteArray: ByteArray) {
        byteArray.writeInt(this.data);
    }
}

export class UBYTE extends NumberValue {
    read(byteArray: ByteArray) {
        this.data = byteArray.readUnsignedByte();
    }

    write(byteArray: ByteArray) {
        byteArray.writeByte(this.data);
    }
}

export class USHORT extends NumberValue {
    read(byteArray: ByteArray) {
        this.data = byteArray.readUnsignedShort();
    }

    write(byteArray: ByteArray) {
        byteArray.writeUnsignedShort(this.data);
    }
}

export class UINT extends NumberValue {
    read(byteArray: ByteArray) {
        this.data = byteArray.readUnsignedInt();
    }

    write(byteArray: ByteArray) {
        byteArray.writeUnsignedInt(this.data);
    }
}

export abstract class BinaryStream extends Message {

    protected byteArray: ByteArray = null!;
    buffer: Uint8Array = null!;
    /**@description 將當前資料轉成buffer */
    encode(): boolean {
        this.byteArray = new ByteArray(this.buffer)
        this.byteArray.endian = Macro.USING_LITTLE_ENDIAN;
        this.serialize();
        this.buffer = this.byteArray.bytes;
        return true;
    }

    /**@description 是否是數值型別 */
    private isNumberValue(valueType: any) {
        return valueType == FLOAT || valueType == DOUBLE ||
            valueType == BYTE || valueType == SHORT || valueType == INT ||
            valueType == UBYTE || valueType == USHORT || valueType == UINT;
    }

    private isBoolValue(valueType: any) {
        return valueType == BOOL;
    }

    /**@description 是否是字串型別 */
    private isStringValue(valueType: any) {
        return valueType == STRING;
    }

    /**@description 序列化 */
    private serialize() {
        let __serialize__ = (<any>Reflect.getPrototypeOf(this))['__serialize__'];
        if (!__serialize__) return null;
        let serializeKeyList = Object.keys(__serialize__);
        for (let len = serializeKeyList.length, i = 0; i < len; i++) {
            let serializeKey = serializeKeyList[i];
            let [memberName, valueType, arrTypeOrByteSize, byteSize, dimension] = __serialize__[serializeKey];
            this.serializeMember((<any>this)[memberName], memberName, valueType, arrTypeOrByteSize, byteSize, dimension);
        }
    }

    /**
     * @description 序列化成員變數
     * @param value 該成員變數的值
     * */
    private serializeMember(value: any, memberName: string, valueType: any, arrTypeOrByteSize?: any, byteSize?: number, dimension?: number) {
        if (this.isNumberValue(valueType)) {
            this.serializeNumberStreamValue(value, valueType);
        } else if (this.isBoolValue(valueType)) {
            this.serializeBoolValue(value, valueType);
        } else if (this.isStringValue(valueType)) {
            this.serializeStringStreamValue(value, valueType, arrTypeOrByteSize);
        } else if (value instanceof Array) {
            this.serializeArray(value, memberName, valueType, arrTypeOrByteSize, byteSize, dimension);
        } else if (value instanceof BinaryStream) {
            value.byteArray = this.byteArray;
            value.serialize();
        } else {
            Log.e(`序列化成員 : ${memberName} 出錯!!`);
        }
    }

    private serializeNumberStreamValue(value: number, valueType: typeof NumberValue) {
        let type = new valueType();
        type.data = (value === undefined || value === null || value == Number.NaN) ? 0 : value;
        type.write(this.byteArray);
    }

    private serializeBoolValue(value: boolean, valueType: typeof BOOL) {
        let type = new valueType();
        type.data = (value === undefined || value === null) ? false : value;
        type.write(this.byteArray);
    }

    private serializeStringStreamValue(value: string, valueType: typeof STRING, byteSize: number | undefined) {
        let type = new valueType();
        type.byteSize = byteSize;
        type.data = (value === undefined || value === null) ? "" : value;
        type.write(this.byteArray);
    }

    /**@description 檢測當前陣列的維度是否有效 */
    private checkArrayDimension(value: Array<any>, dimension: number) {
        let count = 0;
        let temp = value;
        do {
            count++;
            temp = temp[0];
        } while (temp && Array.isArray(temp) && temp.length > 0)
        return count == dimension;
    }

    private serializeArray(value: Array<any>, memberName: string, valueType: any, arrType: any, byteSize?: number, dimension?: number) {
        //先寫入陣列的大小
        if (dimension == undefined) {
            dimension = 1;
        }
        if (!this.checkArrayDimension(value, dimension)) {
            Log.e(`${memberName} 定義陣列跟序列化的陣列維度不一致`)
            return;
        }

        this.byteArray.writeUnsignedInt(value.length);
        for (let i = 0; i < value.length; i++) {
            if (value[i] instanceof Array) {
                //多維的陣列
                this.serializeArray(value[i], `${memberName}[${i}]`, valueType, arrType, byteSize, dimension - 1);
            } else {
                this.serializeMember(value[i], `${memberName}[${i}]`, arrType, byteSize, undefined);
            }
        }
    }

    /**@description 從二進位制資料中取資料 */
    decode(data: Uint8Array): boolean {
        this.buffer = data;
        this.byteArray = new ByteArray(data);
        this.byteArray.endian = Macro.USING_LITTLE_ENDIAN;
        this.deserialize();
        return true;
    }

    /**
     * @description 從json壓縮物件資訊 反序列化為實體類欄位資訊
     * @param data json壓縮物件
     * */
    protected deserialize() {
        let __serializeInfo = (<any>Reflect.getPrototypeOf(this))['__serialize__'];
        if (!__serializeInfo) return true;
        let serializeKeyList = Object.keys(__serializeInfo);
        for (let len = serializeKeyList.length, i = 0; i < len; i++) {
            let serializeKey = serializeKeyList[i];
            let [memberName, valueType, arrTypeOrByteSize, byteSize, dimension] = __serializeInfo[serializeKey];
            this.deserializeMember(memberName, valueType, arrTypeOrByteSize, byteSize, dimension);
        }
    }

    /**
     * @description 反序列化成
     * @param memberName 成員變數名
     * @param memberType 成員變數型別
     * @param arrTypeOrByteSize 陣列值型別/Map的key型別
     * @param byteSize Map的值型別
     * @param value json壓縮物件
     */
    private deserializeMember(memberName: any, memberType: any, arrTypeOrByteSize: any, byteSize?: number, dimension?: number) {
        try {
            let originValue = (<any>this)[memberName];
            if (this.isNumberValue(memberType)) {
                (<any>this)[memberName] = this.deserializeNumberStreamValue(memberName, memberType);
            } else if (this.isBoolValue(memberType)) {
                (<any>this)[memberName] = this.deserializeBoolValue(memberName, memberType);
            } else if (this.isStringValue(memberType)) {
                (<any>this)[memberName] = this.deserializeStringStreamValue(memberName, memberType, arrTypeOrByteSize);
            } else if (originValue instanceof Array) {
                this.deserializeArray(memberName, memberType, arrTypeOrByteSize, byteSize, dimension);
            } else if (originValue instanceof BinaryStream) {
                originValue.byteArray = this.byteArray;
                originValue.deserialize();
            } else {
                Log.e(`deserializeMember ${memberName} error!!!`);
            }
        } catch (err: any) {
            Log.w(err.message);
            Log.e(`deserializeMember ${memberName} error!!!`);
        }
    }

    private deserializeNumberStreamValue(memberName: any, memberType: typeof NumberValue) {
        let value = new memberType();
        value.read(this.byteArray);
        return value.data;
    }

    private deserializeBoolValue(memberName: any, memberType: typeof BOOL) {
        let value = new memberType();
        value.read(this.byteArray);
        return value.data;
    }

    private deserializeStringStreamValue(memberName: any, memberType: typeof STRING, arrTypeOrMapKeyType: number) {
        let value = new memberType();
        value.byteSize = arrTypeOrMapKeyType;
        value.read(this.byteArray);
        return value.data;
    }

    private _deserializeArray(originValue: Array<any>, memberName: any, memberType: any, arrTypeOrByteSize: any, byteSize?: number, dimension: number = 1) {
        if (dimension <= 0) {
            return;
        }
        //先讀陣列大小
        let size = this.byteArray.readUnsignedInt();
        let index = 0;
        for (let i = 0; i < size; i++) {
            if (dimension > 1) {
                originValue.push([]);
                this._deserializeArray(originValue[index], `${memberName}[${index}]`, memberType, arrTypeOrByteSize, byteSize, dimension - 1);
                index++;
            } else {
                let type = new arrTypeOrByteSize();
                if (type instanceof BinaryStream) {
                    type.byteArray = this.byteArray;
                    originValue[i] = type.deserialize();
                } else if (type instanceof STRING) {
                    type.byteSize = byteSize;
                    type.read(this.byteArray);
                    originValue[i] = type.data;
                } else {
                    type.read(this.byteArray);
                    originValue[i] = type.data;
                }
            }
        }
    }

    private deserializeArray(memberName: any, memberType: any, arrTypeOrByteSize: any, byteSize?: number, dimension?: number) {
        //重新解析，初始化時可能已經賦值，需要先清空物件
        (<any>this)[memberName] = [];

        //用初始化型別資料來判斷是否是多維陣列
        //先取取陣列大小
        if (dimension == undefined) {
            //未指定維度，按一維處理
            dimension = 1;
        }

        this._deserializeArray((<any>this)[memberName], memberName, memberType, arrTypeOrByteSize, byteSize, dimension);
    }
}

export abstract class BinaryStreamHeartbeat extends BinaryStream {
    static type = Net.ServiceType.BinaryStream;
}