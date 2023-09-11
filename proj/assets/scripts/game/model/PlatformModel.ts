// ---------- 引用 ----------------------------------------------------------------
import { BaseModel } from "../../framework/core/event/BaseModel";
import { IPlatform } from "../types/res-type";

// ---------- 常數 ----------------------------------------------------------------
export interface IPlatformModel {
    value1: null;
}

/**
 * Proxy 是用來儲存全部共用的資料 
 */
class PlatformModel extends BaseModel<IPlatform> {
    // ---------- 成員變數 --------------------------------------------------------
    private static _instance: PlatformModel = null;
    public static Instance() { return this._instance || (this._instance = new PlatformModel()); }

    constructor() {
        super();
        this.data = {
            game: {
                stakeValues: [],
                ratioValues: [],
            },
            player: {
                name: null,
                id: null,
                uid: null,
                avatar: null,
                avatarUrl: null,
                balance: {
                    currency: null,
                    amount: null,
                    gemAmount: null,
                },
                settings: {
                    advancedSettings: {
                        sounds: {
                            background: null,
                            backgroundVolume: null,
                            effect: null,
                            effectVolume: null,
                        },
                        notify: null,
                        turbo: null,
                    },
                    autoPlay: {
                        numberOfPlays: [],
                        stopOnWinMultiplier: null,
                        stopOnBalance: null,
                        stopOnFreeSpin: null,
                        stopOnJackpot: null,
                    },
                    stakeIndex: null,
                    ratioIndex: null,
                },
                clientSettings: null,
                nameDisplayOn: null,
            },
            gemSystem: null,
            table: {
                room: null,
                roomId: null,
                number: null
            }
        };

    }

    // ---------- 內部呼叫 --------------------------------------------------------

    // ---------- 外部部呼叫 ------------------------------------------------------

    /** value1 */
    public get amount() { return this.data.player.balance.amount; }
    public set amount(value: number) { this.data.player.balance.amount = value; }

    // public reset() {
    //     this.data = {
    //         value1: null,
    //     };
    // }
}

export default PlatformModel.Instance();