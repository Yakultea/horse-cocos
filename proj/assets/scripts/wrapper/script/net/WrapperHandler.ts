/**
 * @description 大厅网络逻辑流程控制器  
*/
// ---------- 引用 ----------------------------------------------------------------
import { EBundles } from "../../../common/data/Bundles";
import { Handler } from "../../../framework/core/net/service/Handler";
import { WrapperEvent } from "../event/WrapperEvent";
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
    static module = EBundles[EBundles.wrapper];
    protected get service() { return App.serviceManager.get(WrapperService); }
    // ---------- 生命週期 -------------------------------------------------------------
    onLoad() {
        super.onLoad();
        this.addListeners();

        // this.addWrapperEventListeners();
        // this.addRequestListeners();
        // this.addUIListeners();

    }

    // ---------- 框架呼叫 -------------------------------------------------------------
    // ---------- 內部呼叫 -------------------------------------------------------------


    private addListeners(): void {
        this.on(WrapperEvent.SEND_SPIN_REQUEST, (data: { data: any; }) => {
            const { spinId, stakeVO, cheat, updateStake } = data?.data;
            App.senderManager.get(WrapperSender).spin(stakeVO, spinId, cheat, updateStake);
        });
        this.on(WrapperEvent.SEND_CLOSE_REQUEST, (data: { data: any; }) => {
            const spinId = data.data;
            App.senderManager.get(WrapperSender).closeSpin(spinId);
        });

    }

    // private addWrapperEventListeners(): void {
    //     this.on(WrapperEvent.WRAPPER_SERVICE_CONNECTED, () => {
    //     });
    // }

    // private addRequestListeners(): void { }

    // private addUIListeners(): void {
    // this.on(WrapperEvent.OPEN_PANEL, (panel: any) => { // EWrapperPanel
    // BxWrapper.Signals.openPanel.dispatch(panel);
    // });

    // BxWrapper.Signals.updateSettings.add((settings: IGameSettingsUpdate) => {
    //     dispatch(EWrapperEvent.SETTINGS_UPDATE, settings);
    // });

    // BxWrapper.Signals.autoPlaySelected.add((autoPlay: number) => {
    //     dispatch(AutoplayEvent.AUTOPLAY_STARTED, autoPlay);
    // });

    // BxWrapper.Signals.updateAvatar.add((avatarId: number) => {
    //     dispatch(EWrapperEvent.UPDATE_USER_AVATAR, avatarId);
    // });

    // BxWrapper.Signals.updateStake.add((stake: TStakeKey) => {
    //     dispatch(EWrapperEvent.UPDATE_STAKE, stake);
    // });
    // }

    // ---------- 外部部呼叫 -----------------------------------------------------------

}
