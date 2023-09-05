// ---------- 引用 ----------------------------------------------------------------
import { sys } from "cc";
import { GameAlertConfig } from "../../../common/component/GameAlert";
import { ViewZOrder } from "../../../common/config/Config";
import { EBundles } from "../../../common/data/Bundles";
import ServerModel, { EServerMode } from "../../../common/model/ServerModel";
import { ExitUtils } from "../../../common/utils/ExitUtils";
import { Http } from "../../../framework/core/net/http/Http";
import { Sender } from "../../../framework/core/net/service/Sender";
import { WrapperEvent } from "../event/WrapperEvent";
import DefinitionModel from "../model/DefinitionModel";
import GameStateModel from "../model/GameStateModel";
import PlatformModel from "../model/PlatformModel";
import SettingsModel from "../model/SettingsModel";
import SlotTableModel from "../model/SlotTableModel";
import SocketModel from "../model/SocketModel";
import { IBetRecordsRes, ICloseSpinRes, ISlotTablesRes as IGetSlotTablesRes, IInitialRes, IResBase, ISpinRes, ITables, IUpdateAvatarRes, IUpdateSlotTableRes } from "../types/res-type";
import { ESocketRequestName } from "../types/type";
import { IRequest } from "./WrapperHandler";
import { WrapperService } from "./WrapperService";
import UrlUtils from "../../../common/utils/UrlUtils";

// ---------- 常數 ----------------------------------------------------------------
// 文件 https://gitlab.riversense.tw/egames/slot-worker-nodejs-2020/-/blob/feat/erase2/docs/data-model/erase-2/cheat.md
export interface ISpinCheatPayload {
    type: number, // 1,2,3,4, 6:MG空轉
    lowerLimit?: number, // 50 指定出現目標範圍內的贏分倍數下限
    upperLimit?: number; // 200 指定出現目標範圍內的贏分倍數上限
    timesSymbol?: number; // 指定要出現哪一個稀有倍數
    targetTimes?: number;// 期望出現的目標倍數
    timesIndex?: number; // 0 指定該稀有倍數的倍數從哪裡開始
    category?: string; // jp, jp-mini, jp-minor, jp-major, jp-grand
    prize?: number; //jackpot的totalWinnigs
    addScatter?: boolean; //FG中再得到FG, 帶了ture才會有，false或不帶就是普通FG
    scatterCount?: number; // 指定 scatter 數量
    twoSteps?: boolean; //scatter在天降後才湊滿
}

export interface ISettingsVO {
    type: "game" | "client";
    data: {
        notify?: boolean;
        turbo?: boolean;
        stopOnJackpot?: boolean;
        backgroundVolume?: number;
        effectVolume?: number;
        stakeIndex?: number;
        ratioIndex?: number;
    };
}
export interface IGetSlotTablesVO {
    roomId?: number;
}

export interface IBetRecordsVO {
    lt?: number;
    rows: number;
}
export interface IUpdateSlotTableVO {
    table: ITables;
}
export interface IStakeVO {
    ratioIndex: number,
    ratioValue: number,
    stakeIndex: number,
    stakeValue: number,
}

export class WrapperSender extends Sender {
    // ---------- 成員變數 --------------------------------------------------------
    static module = EBundles[EBundles.wrapper];
    protected get service() { return App.serviceManager.get(WrapperService); }

    // ---------- 生命週期 --------------------------------------------------------
    // ---------- 框架呼叫 ------------------------------------------------------
    // ---------- 內部呼叫 --------------------------------------------------------
    protected setToken(response: IInitialRes | ISpinRes | ICloseSpinRes | IResBase) {
        if (response.token) {
            SocketModel.currentToken = response.token;
        }
    }

    /** 顯示彈窗 */
    private showAlert(message: string, options?: { needCloseAlert?: boolean,code?:string, callback?: Function; }) {
        const config: GameAlertConfig = {
            text: message,
            confirmCb() { exit(); },
            bbrCb() { exit(); },
            needCloseAlert: options?.needCloseAlert,
            tag: ViewZOrder.TopErrorAlert,
            code: options?.code
        };

        const exit = () => {
            options?.callback && options.callback();
            ExitUtils.exit();
        };
        App.gameAlert.show(config, ViewZOrder.TopErrorAlert);
    }



    // ---------- 外部部呼叫 ------------------------------------------------------
    /** initial */
    public initial(): Promise<void> {
        if (ServerModel.mode === EServerMode.STATIC) {
            // return new Promise((resolve, reject) => {
            // dispatch(WrapperEvent.INIT_RESPONSE, StaticFakeCmd.getInitial());
            //     resolve()
            // })
            return;
        }

        // Log.d('sys: ', sys);
        const requestVO = {
            token: SocketModel.currentToken,
            clientType: 'web', // sys.browserType //DeviceDetection.getDeviceType(),
            deviceInfo: {
                browser: {
                    name: sys.BrowserType,//"Chrome",
                    version: sys.browserVersion,//"112.0.0.0"
                },
                os: {
                    name: sys.OS,//"Windows",
                    version: sys.osVersion,//"NT 10.0",
                    versionName: sys.osMainVersion,//"10"
                },
                platform: {
                    type: sys.platform,//"desktop"
                },
                engine: {
                    name: "cocos 無法辨識引擎"
                }
            },
        };
        return new Promise((resolve, reject) => {
            this.send('initial', requestVO, (response: IInitialRes) => {
                if (response.status == Http.ServerStatus.SUCCESS) {
                    if (response.code) { // 須知:有code 就是錯的 
                        Log.e('NETWORK_ERROR: ', response);
                        this.showAlert(response.message, { needCloseAlert: false, code: response?.code });
                        return;
                    }
                    Log.d('*** 後端來的資料 ***', response);
                    this.setToken(response);
                    DefinitionModel.setData(response.engine.definition);
                    GameStateModel.setData(response.engine.gameState);
                    PlatformModel.setData(response.platform);
                    SettingsModel.setData(response.platform.player.settings);
                    dispatch(WrapperEvent.INIT_RESPONSE, response);
                    resolve();
                } else {
                    Log.e('NETWORK_ERROR: ', response);
                    this.showAlert(response.message, { needCloseAlert: false, code: response?.code });
                    // reject();
                }
            });
        });
    }

    /** spin */
    public spin(stakeVO: IStakeVO, spinId?: string, cheatPayload?: ISpinCheatPayload, updateStake?: boolean) {
        if (ServerModel.mode === EServerMode.STATIC) {
            // dispatch(WrapperEvent.SPIN_RESPONSE, StaticFakeCmd.getSpin());
            return;
        }

        const requestVO: IRequest = {
            request: ESocketRequestName.SPIN,
            params: { ...stakeVO, updateStake },
            spinId,
        };

        if (cheatPayload) {
            requestVO.cheat = cheatPayload;
        }

        this.send(requestVO.request, requestVO, (response: ISpinRes) => {
            if (response.status == Http.ServerStatus.SUCCESS) {
                Log.d('*** 後端來的資料 ***', response);
                this.setToken(response);
                GameStateModel.setData(response.engine.gameState);
                PlatformModel.amount = response.platform.player.balance.amount;
                dispatch(WrapperEvent.SPIN_RESPONSE, response);
            } else {
                Log.e('NETWORK_ERROR: ', response);
                this.showAlert(response.message, { needCloseAlert: false, code: response.code });
            }
        });
    }

    /** close spin */
    public closeSpin(spinId: string) {
        const requestVO: IRequest = {
            request: ESocketRequestName.CLOSE_SPIN,
            spinId: spinId
        };

        this.send(requestVO.request, requestVO, (response: ICloseSpinRes) => {
            if (response.status == Http.ServerStatus.SUCCESS) {
                this.setToken(response);
                PlatformModel.amount = response.platform.player.balance.amount;
                dispatch(WrapperEvent.CLOSE_RESPONSE, response);
            } else {
                Log.e('NETWORK_ERROR: ', response);
                this.showAlert(response.message, { needCloseAlert: false, code: response.code });
            }
        });
    }

    /** setting */
    public setting(dataVO: ISettingsVO) {
        const requestVO: IRequest = {
            request: ESocketRequestName.UPDATE_SETTINGS,
            params: {
                ...dataVO
            }
        };
        this.send(requestVO.request, requestVO, (response) => {
            if (response.status == Http.ServerStatus.SUCCESS) {
                this.setToken(response);
            } else {
                Log.e('NETWORK_ERROR: ', response);
                this.showAlert(response.message, { needCloseAlert: false, code: response.code });
            }
        });
    }

    /** 投注紀錄 */
    public getBetRecords(dataVO: IBetRecordsVO) {
        const requestVO: IRequest = {
            request: ESocketRequestName.GET_BET_RECORDS,
            params: {
                ...dataVO
            }
        };
        this.send(requestVO.request, requestVO, (response: IBetRecordsRes) => {
            if (response.status == Http.ServerStatus.SUCCESS) {
                this.setToken(response);
                dispatch(WrapperEvent.BET_RECORDS_RESPONSE, response);
            } else {
                Log.e('NETWORK_ERROR: ', response);
                this.showAlert(response.message, { needCloseAlert: false, code: response.code });
            }
        });
    }

    /** 取得機台列表 */
    public getAllSlotTables(dataVO?: IGetSlotTablesVO) {
        const requestVO: IRequest = {
            request: ESocketRequestName.GET_SLOT_TABLES,
            params: {
                ...dataVO
            }
        };
        this.send(requestVO.request, requestVO, (response: IGetSlotTablesRes) => {
            if (response.status == Http.ServerStatus.SUCCESS) {
                this.setToken(response);
                SlotTableModel.setData(response.data);
                dispatch(WrapperEvent.ALL_SLOT_TABLES_RESPONSE, response);
            } else {
                Log.e('NETWORK_ERROR: ', response);
                this.showAlert(response.message, { needCloseAlert: false, code: response.code });
            }
        });
    }

    /** 取得單一機台資訊 */
    public getSlotTable(dataVO: IGetSlotTablesVO) {
        const requestVO: IRequest = {
            request: ESocketRequestName.GET_SLOT_TABLES,
            params: {
                ...dataVO
            }
        };
        this.send(requestVO.request, requestVO, (response: IGetSlotTablesRes) => {
            if (response.status == Http.ServerStatus.SUCCESS) {
                this.setToken(response);
                SlotTableModel.setData(response.data);
                dispatch(WrapperEvent.SLOT_TABLE_RESPONSE, response);
            } else {
                Log.e('NETWORK_ERROR: ', response);
                this.showAlert(response.message, { needCloseAlert: false, code: response.code });
            }
        });
    }

    /** 選擇機台 */
    public updateSlotTable(dataVO: IUpdateSlotTableVO) {
        const requestVO: IRequest = {
            request: ESocketRequestName.UPDATE_SLOT_TABLE,
            params: {
                ...dataVO
            }
        };
        this.send(requestVO.request, requestVO, (response: IUpdateSlotTableRes) => {
            if (response.status == Http.ServerStatus.SUCCESS) {
                this.setToken(response);

                // 新增 query 參數 table=1
                const urlSearchParams = new URLSearchParams(window.parent.location.search);
                urlSearchParams.set('table', '1');
                const newUrl = window.parent.location.pathname + '?' + urlSearchParams.toString();

                // 重整網頁
                window.parent.location.href = newUrl;

                // // 重整網頁
                // window.parent.location.reload();
            } else {
                Log.e('NETWORK_ERROR: ', response);
                this.showAlert(response.message, { needCloseAlert: false, code: response.code });
            }
        });
    }

    /** 鎖定機台 */
    public lockSlotTable(dataVO: IGetSlotTablesVO) {
        const requestVO: IRequest = {
            request: ESocketRequestName.LOCK_SLOT_TABLE,
            params: {
                ...dataVO
            }
        };
        this.send(requestVO.request, requestVO, (response: IUpdateSlotTableRes) => {
            if (response.status == Http.ServerStatus.SUCCESS) {
                this.setToken(response);
                dispatch(WrapperEvent.LOCK_SLOT_TABLE_RESPONSE, response);
            } else {
                Log.e('NETWORK_ERROR: ', response);
                this.showAlert(response.message, { needCloseAlert: false, code: response.code });
            }
        });
    }

    /** 買免遊 */
    public buyFeature(stakeVO: IStakeVO) {
        const requestVO: IRequest = {
            request: ESocketRequestName.SPIN,
            params: {
                action: "buyFeature",
                clientType: 'web',
                featureIndex: 0,
                featureValue: "freeGame",
                ...stakeVO,
            }
        };
        this.send(requestVO.request, requestVO, (response: any) => {
            if (response.status == Http.ServerStatus.SUCCESS) {
                this.setToken(response);
                dispatch(WrapperEvent.BUY_FEATURE_RESPONSE, { data: response.engine.gameState.spinId });
            } else {
                Log.e('NETWORK_ERROR: ', response);
                App.gameAlert.show({
                    text: response.message,
                    confirmCb() { },
                    bbrCb() { }
                });
            }
        });
    }

    /** 更新頭像 */
    public updateAvatar(avatarId: string) {
        const requestVO: IRequest = {
            request: ESocketRequestName.UPDATE_AVATAR,
            params: {
                avatarId
            }
        };

        this.send(requestVO.request, requestVO, (response: IUpdateAvatarRes) => {
            if (response.status == Http.ServerStatus.SUCCESS) {
                this.setToken(response);
                const { avatarId, avatarUrl } = response.data;
                PlatformModel.getData().player.avatar = avatarId;
                PlatformModel.getData().player.avatarUrl = avatarUrl;
                dispatch(WrapperEvent.UPDATE_AVATAR_COMPLETED_RESPONSE);
            } else {
                Log.e('NETWORK_ERROR: ', response);
                // App.gameAlert.show({
                //     text: response.message,
                //     confirmCb() { },
                //     bbrCb() { }
                // });
            }
        });
    }
}
