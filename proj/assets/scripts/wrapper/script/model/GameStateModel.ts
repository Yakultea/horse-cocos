// ---------- 引用 ----------------------------------------------------------------
import { BaseModel } from "../../../framework/core/event/BaseModel";
import { IInitGameState, ISpinGameState } from "../types/res-type";


// ---------- 常數 ----------------------------------------------------------------
export interface IGameStateModel {
    value1: number;
}

/**
 * Proxy 是用來儲存全部共用的資料 
 */
class GameStateModel extends BaseModel<ISpinGameState | IInitGameState> {
    // ---------- 成員變數 --------------------------------------------------------
    private static _instance: GameStateModel = null;
    public static Instance() { return this._instance || (this._instance = new GameStateModel()); }

    constructor() {
        super();
        this.data = {
            action: null,
            currentWinnings: null,
            isFreeGameUp: null,
            freespinWinnings: null,
            freespinWon: null,
            jpWon: null,
            numFreeSpins: null,
            totalStake: null,
            totalWinnings: null,
            view: null,
            win: null,
            freeTimesDenominator: null,
            multiple: null,
            selectedFgMultiple: null,
            spinId: null,
            wins: []
        };
    }

    // ---------- 內部呼叫 --------------------------------------------------------

    // ---------- 外部部呼叫 ------------------------------------------------------

    /** value1 */
    // public get value1() { return this.data.value1; }
    // public set value1(value: number) { this.data.value1 = value; }

    // public reset() {
    //     this.data = {
    //         value1: null,
    //     };
    // }
}

export default GameStateModel.Instance();