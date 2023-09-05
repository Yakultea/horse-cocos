import { DEBUG, EDITOR } from "cc/env";
import { BitEncrypt } from "../../plugin/BitEncrypt";

/**
 * @description 本地資料儲存，為了後面可能需要對資料進入加密儲存等，把cocos的封閉一層
 */

type StorageVauleType = "number" | "string" | "boolean" | "object";
interface StorageData {
    type: StorageVauleType,
    value: string | number | boolean | object;
}

export class LocalStorage implements ISingleton {
    static module: string = "【本地倉庫】";
    module: string = null!;
    public key = "VuxiAKihQ0VR9WRe";

    private encrypt(obj: {}) {
        return BitEncrypt.encode(JSON.stringify(obj), this.key);
    }

    private decryption(word: any) {
        return BitEncrypt.decode(word, this.key);
    }

    public getItem(key: string, defaultValue: any = null) {
        if( EDITOR ){
            return defaultValue;
        }
        let value = this.storage.getItem(key);
        if (value) {
            //解析
            try {
                let data = this.decryption(value);
                let result: StorageData = JSON.parse(data);
                if (result.type) {
                    return result.value;
                } else {
                    return value;
                }
            } catch (error) {
                return value;
            }
        }
        else {
            return defaultValue;
        }
    }

    public setItem(key: string, value: string | number | boolean | object) {
        if( EDITOR ){
            return;
        }
        let type = typeof value;
        if (type == "number" || type == "string" || type == "boolean" || type == "object") {
            let saveObj: StorageData = { type: type, value: value };
            //加密
            try {
                let data = this.encrypt(saveObj);
                this.storage.setItem(key, data);
            } catch (err) {
                if (DEBUG) Log.e(err);
            }
        } else {
            if (DEBUG) Log.e(`儲存資料型別不支援 當前的儲存型別: ${type}`);
        }
    }

    public removeItem(key: string) {
        if( EDITOR ) return;
        this.storage.removeItem(key);
    }

    public clear() {
        window.localStorage.clear()
    }

    private get storage(){
        return window.localStorage;
    }
}