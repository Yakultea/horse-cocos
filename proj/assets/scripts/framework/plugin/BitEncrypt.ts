
/**
 * @description 位加密,不增加資料本身大小進行位置加密
 */

import { DEBUG } from "cc/env";

class _BitEncrypt {

    private readonly logTag = `[BitEncrypt]:`;
    private _encryptKey: string = "EskKbMvzZBILhcTv";
    public set encryptKey( value : string ){
        this._encryptKey = value;
    }
    /**@description 加密解密 金鑰 */
    public get encryptKey( ){
        return this._encryptKey;
    }
    /**
     * @description 解密
     * @param content 加密的內容
     * @param key 解密的key 加密/解密的key保持一致，如果不傳可透過設定encryptKey
     */
    public decode(content: string, key?: string): string {
        return this._code(content, key);
    }

    /**
     * @description 加密
     * @param content 未加密內容
     * @param key 加密的key 加密/解密的key保持一致 如果不傳可透過設定encryptKey
     */
    public encode(content: string, key?: string): string {
        return this._code(content, key);
    }

    private _code(content: string, key?: string): string {
        let result = this._check(content, key);
        if (result.isOK) {

            let contentCharCode: number[] = [];
            for (let i = 0; i < content.length; i++) {
                contentCharCode.push(content.charCodeAt(i));
            }

            let index = 0;
            let ch = "";
            //對中文，及以下的其它字串進行位加密
            let regex = /[\w\d_-`~#!$%^&*(){}=+;:'"<,>,/?|\\\u4e00-\u9fa5]/g;
            for (let i = 0; i < contentCharCode.length; i++) {

                //只有子母，數字，
                let matchs = content[i].match(regex);
                if (matchs && matchs.length > 0) {
                    //替換字元
                    contentCharCode[i] ^= result.key.charCodeAt(index);
                    ch = String.fromCharCode(contentCharCode[i]);
                    matchs = ch.match(regex);
                    if (matchs && matchs.length) {
                        //轉換後仍然是可顯示字元
                    } else {
                        //轉成了不能顯示的字元，把它恢復原樣
                        contentCharCode[i] ^= result.key.charCodeAt(index);
                    }

                    index++;
                    if (index >= result.key.length) {
                        index = 0;
                    }
                } else {
                    //不替換字元
                }
            }

            let newContent = "";
            for (let i = 0; i < contentCharCode.length; i++) {
                newContent += String.fromCharCode(contentCharCode[i]);
            }
            return newContent;

        } else {
            if (DEBUG) Log.e(BitEncrypt.logTag, `encode/decode error content : ${content} key : ${key}`);
            return content;
        }
    }

    private _check(content: string, key?: string): { isOK: boolean, key: string } {
        if (content && content.length > 0) {
            if (key && key.length > 0) {
                //使用傳的key進行加解密
                return { isOK: true, key: key };
            } else {
                if (this.encryptKey && this.encryptKey.length > 0) {
                    return { isOK: true, key: this.encryptKey };
                } else {
                    return { isOK: false, key: "" };
                }
            }
        } else {
            return { isOK: false, key: "" };
        }
    }
}

export let BitEncrypt = new _BitEncrypt();
//window[`BitEncrypt`] = BitEncrypt;