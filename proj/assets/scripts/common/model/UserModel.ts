// ---------- 引用 ----------------------------------------------------------------
import { BaseModel } from "../../framework/core/event/BaseModel";

// ---------- 常數 ----------------------------------------------------------------
export interface IUserModel {
    balance: number;
    token: string;
}

interface ITokenVO {
    token: string;
    timeStamp: number;
}

/**
 * Proxy 是用來儲存全部共用的資料 
 */
class UserModel extends BaseModel<IUserModel> {
    // ---------- 成員變數 --------------------------------------------------------
    private static _instance: UserModel = null;
    public static Instance() { return this._instance || (this._instance = new UserModel()); }

    constructor() {
        super();
        this.data = {
            balance: null,
            token: null
        };
    }

    // ---------- 內部呼叫 --------------------------------------------------------

    // ---------- 外部部呼叫 ------------------------------------------------------

    /** balance */
    public get balance() { return this.data.balance; }
    public set balance(balance: number) { this.data.balance = balance; }

    public reset() {
        this.data = {
            balance: null,
            token: null,
        };
    }
}

export default UserModel.Instance();