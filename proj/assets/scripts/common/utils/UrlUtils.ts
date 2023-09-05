import { sys } from "cc";
import UrlModel from "../model/UrlModel";

export default class UrlUtils {
    /**
     * 取search param
    * @param key 键
    */
    public static getParam(key: string) {
        if (sys.isNative) return;
        return new URL(window.parent.location.href).searchParams.get(key);
    }

    public static getSearchString() {
        if (sys.isNative) return;
        return new URL(window.parent.location.href).searchParams.toString();
    }

    static getUrlProtocol() {
        if (sys.isNative) return;
        const protocol = new URL(window.parent.location.href).protocol;

        return protocol;
    }

    static getBaseUrl() {
        if (sys.isNative) return;
        const origin = new URL(window.parent.location.href).origin;
        const pathname = new URL(window.parent.location.href).pathname;

        return origin + pathname;
    }

    /** 取得 url token */
    static getTokenFromUrl() {
        const wUrl = new window.URL(window.parent.location.href);

        return wUrl.searchParams.get("t");
    }

    public static GetAvatarUrl(avatar: string): string {
        if (!avatar) return;
        if (!avatar.includes("http")) {
            avatar = `${UrlModel.base_url}/avatars/${avatar}.png`;
        } else {
            const splitUrl = avatar.split('.');
            if (!splitUrl.includes("png") && !splitUrl.includes("jpg")) {
                avatar = `${avatar}.png`;  // 加個圖片副檔名
            }
        }
        return avatar;
    }

    public static GetDealerAvatarUrl(avatar: string): string {
        if (!avatar) return;
        if (!avatar.includes("http")) {
            avatar = `${UrlModel.base_url}/images/aio/${avatar}.png`;
        } else {
            const splitUrl = avatar.split('.');
            if (!splitUrl.includes("png") && !splitUrl.includes("jpg")) {
                avatar = `${avatar}.png`;  // 加個圖片副檔名
            }
        }
        return avatar;
    }

    // /**
    //  * Extract parameters from URL and return them in an object
    //  * @returns {Object}
    //  */
    // public static getUrlParams() {

    //     new URLSearchParams
    //     const wUrl = new window.URL(window.parent.location.href);
    //     // return href.query;
    // }
}