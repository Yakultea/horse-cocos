// ---------- 引用 ----------------------------------------------------------------
import { sys } from "cc";
import { BaseModel } from "../../framework/core/event/BaseModel";
import { ENV } from "../config/env";
import UrlUtils from "../utils/UrlUtils";
// ---------- 常數 ----------------------------------------------------------------
export interface IUrlModel {
    base_api: string;
    base_url: string;
    socket_url: string;
    searchParams: ISearchParams;
}

export interface ISearchParams {
    t: string;
    gn: string;
    l: string;
    ct: string;
    gt: string;
    ts: string;
    view_mode: string;
    p: string;
    wv: string;
    gv: string;
    client_type: string;
    goback_url?: string;
    table?: string; // 沒有的話 代表 第一次選擇機台 1: 已選過機台
}

class UrlModel extends BaseModel<IUrlModel> {
    private static _instance: UrlModel = null;
    public static Instance() { return this._instance || (this._instance = new UrlModel()); }

    constructor() {
        super();
        this.data = {
            base_api: ENV.apiUrl,
            base_url: ENV.baseUrl,
            socket_url: ENV.socketUrl,
            searchParams: null
        };
    }

    public getData() { return this.data; }
    // private data: IUrlModel;

    /** base_api */
    public get base_api() { return this.data.base_api; }

    /** base_url */
    public get base_url() { return this.data.base_url; }

    /** socket_url */
    public get socket_url() { return this.data.socket_url; }

    /** searchParams */
    public get searchParams() { return this.data.searchParams; }
    public setSearchParams() {
        if (sys.isNative) return;

        const socketUrl = UrlUtils.getParam("socket_url");

        this.data.searchParams = {
            t: UrlUtils.getParam("t"),
            gn: UrlUtils.getParam("gn"),
            l: UrlUtils.getParam("l"),
            ct: UrlUtils.getParam("ct"),
            gt: UrlUtils.getParam("gt"),
            ts: UrlUtils.getParam("ts"),
            view_mode: UrlUtils.getParam("view_mode"),
            p: UrlUtils.getParam("p"),
            wv: UrlUtils.getParam("wv"),
            gv: UrlUtils.getParam("gv"),
            client_type: UrlUtils.getParam("client_type"),
            goback_url: UrlUtils.getParam("goback_url"),
            table: UrlUtils.getParam("table"),
        };

        if (socketUrl) {
            let protocol = UrlUtils.getUrlProtocol();
            this.data.socket_url = `https://${socketUrl}`;
        } else {
            // 開發用 直接寫死
            // this.data.socket_url = `https://socket-lottery.riversense.tw`;
            this.data.socket_url = `https://socket-lottery.atg-qat.com`;
        }

        Log.d("url data ==> ", this.data);
    }

    /** socket token */
    public get socket_token() { return this.data.searchParams.t; }
    public set socket_token(token) {
        this.data.searchParams.t = token;
    }
}

export default UrlModel.Instance();
