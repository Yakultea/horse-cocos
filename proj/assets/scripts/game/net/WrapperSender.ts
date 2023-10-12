// ---------- 引用 ----------------------------------------------------------------
import { sys } from "cc";
import { GameAlertConfig } from "../../common/component/GameAlert";
import { ViewZOrder } from "../../common/config/Config";
import { EBundles } from "../../common/data/Bundles";
import { ExitUtils } from "../../common/utils/ExitUtils";
import { Http } from "../../framework/core/net/http/Http";
import { Sender } from "../../framework/core/net/service/Sender";
import { HorseGameEvent } from "../event/HorseGameEvent";
import SocketModel from "../model/SocketModel";
import { IInitialRes, IResBase } from "../types/res-type";
import { WrapperService } from "./WrapperService";

// ---------- 常數 ----------------------------------------------------------------

export class WrapperSender extends Sender {
    // ---------- 成員變數 --------------------------------------------------------
    static module = EBundles[EBundles.horseGame];
    protected get service() { return App.serviceManager.get(WrapperService); }

    // ---------- 生命週期 --------------------------------------------------------
    // ---------- 框架呼叫 ------------------------------------------------------
    // ---------- 內部呼叫 --------------------------------------------------------
    protected setToken(response: IInitialRes | IResBase) {
        if (response.token) {
            SocketModel.currentToken = response.token;
        }
    }

    /** 顯示彈窗 */
    private showAlert(message: string, options?: { needCloseAlert?: boolean, code?: string, callback?: Function; }) {
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
                    name: "cocos creator 3.7.2"
                }
            },
        };

        return new Promise((resolve, reject) => {
            this.send('initial', requestVO, (response: IInitialRes) => {
                console.warn('IIIIIIIII', response)
                if (response.status == Http.ServerStatus.SUCCESS) {
                    Log.d('*** 後端來的資料 ***', response);
                    this.setToken(response);
                    dispatch(HorseGameEvent.INIT_RESPONSE, response);
                    resolve();
                } else {
                    Log.e('NETWORK_ERROR: ', response);
                    reject();
                }
            });
        });
    }
}
