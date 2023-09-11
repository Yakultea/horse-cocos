/**
 * @description 大厅网络逻辑流程控制器  
*/
// ---------- 引用 ----------------------------------------------------------------

import { EBundles } from "../../common/data/Bundles";
import { Handler } from "../../framework/core/net/service/Handler";
import { HorseGameEvent } from "../event/HorseGameEvent";
import { ESocketRequestName } from "../types/type";
import { WrapperSender } from "./WrapperSender";
import { WrapperService } from "./WrapperService";

// ---------- 常數 ----------------------------------------------------------------

export interface IRequest {
    request: ESocketRequestName;
    params?: ISpinVO | any;
    spinId?: string;
    cheat?: any;
    updateStake?: boolean; // 告訴後端 壓住額是否有改變 有改變的話 後端會協助儲存 
}
export interface ISpinVO {
    ratioIndex: number,
    ratioValue: number,
    stakeIndex: number,
    stakeValue: number,
}

export default class WrapperHandler extends Handler {
    // ---------- 成員變數 -------------------------------------------------------------

    static module = EBundles[EBundles.horseGame];
    protected get service() { return App.serviceManager.get(WrapperService); }

    // ---------- 生命週期 -------------------------------------------------------------

    onLoad() {
        super.onLoad();
        this.addListeners();
    }

    // ---------- 框架呼叫 -------------------------------------------------------------

    // ---------- 內部呼叫 -------------------------------------------------------------

    private addListeners(): void {
        this.on(HorseGameEvent.SEND_SPIN_REQUEST, (data: { data: any; }) => {
            const { spinId, stakeVO, cheat, updateStake } = data?.data;
            App.senderManager.get(WrapperSender).spin(stakeVO, spinId, cheat, updateStake);
        });

        this.on(HorseGameEvent.SEND_CLOSE_REQUEST, (data: { data: any; }) => {
            const spinId = data.data;
            App.senderManager.get(WrapperSender).closeSpin(spinId);
        });
    }

    // ---------- 外部部呼叫 -----------------------------------------------------------

}
