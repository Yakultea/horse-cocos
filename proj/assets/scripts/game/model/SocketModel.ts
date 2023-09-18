// ---------- 引用 ----------------------------------------------------------------
import UrlUtils from "../../common/utils/UrlUtils";
import { BaseModel } from "../../framework/core/event/BaseModel";

// ---------- 常數 ----------------------------------------------------------------
export interface ISocketModel {
    currentToken: string,
    requestVO: {}, // temperary storage for requestVO
    resendTimes: number,
    resendMaximumTimes: number,
    hasInitRes: boolean,
    waitInitRes: boolean,
    showLoading: boolean,
    pauseGame: boolean,
    reqTime: number;
}

/**
 * Proxy 是用來儲存全部共用的資料 
 */
class SocketModel extends BaseModel<ISocketModel> {
    // ---------- 成員變數 --------------------------------------------------------
    private static _instance: SocketModel = null;
    public static Instance() { return this._instance || (this._instance = new SocketModel()); }

    constructor() {
        super();
        this.data = {
            currentToken: '',
            requestVO: null, // temperary storage for requestVO
            resendTimes: 0,
            resendMaximumTimes: 3,
            hasInitRes: false,
            waitInitRes: false,
            showLoading: false,
            pauseGame: false,
            reqTime: null
        };
    }

    // ---------- 內部呼叫 --------------------------------------------------------

    // ---------- 外部部呼叫 ------------------------------------------------------
    /** currentToken */
    public get currentToken() { return this.data.currentToken; }

    public set currentToken(token: string) {
        let urlToken = UrlUtils.getParam('t');

        localStorage.setItem(urlToken, token);
        this.data.currentToken = token;
    }
}

export default SocketModel.Instance();