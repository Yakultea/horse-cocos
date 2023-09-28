/**
 * @description 子游戲連線服務
 */
// ---------- 引用 ----------------------------------------------------------------
import { EBundles } from "../../common/data/Bundles";
import UrlModel from "../../common/model/UrlModel";
import { CommonService } from "../../common/net/CommonService";
import { HorseGameEvent } from "../event/HorseGameEvent";

// ---------- 常數 ----------------------------------------------------------------
export class WrapperService extends CommonService {
    // ---------- 成員變數 --------------------------------------------------------
    static module = EBundles[EBundles.horseGame];
    module = EBundles[EBundles.horseGame]; // 原則上 這邊不須指定 但因 init時 我需要知道此模組歸屬 故先指定。

    protected clientType = "socketIO";
    protected url = UrlModel.socket_url;

    // ---------- 生命週期 --------------------------------------------------------
    constructor() {
        super();
        this.init();
    }

    // ---------- 框架呼叫 ------------------------------------------------------
    /**@description 網路連線成功 */
    onOpen(ev: Event) {
        super.onOpen(ev);
        this.addSocketListeners();
        dispatch(HorseGameEvent.SERVICE_CONNECTED, this);
    }

    /**@description 網路關閉 */
    onClose(ev: Event) {
        super.onClose(ev);
        dispatch(HorseGameEvent.SERVICE_CLOSE, { data: { event: ev, _this: this } });
    }

    // ---------- 內部呼叫 --------------------------------------------------------
    /** 新增 Socket 監聽 */
    private addSocketListeners(): void {
        this.on("echo", (response) => {

        });

        this.on('warning', (response) => {
            dispatch(HorseGameEvent.WARN_RESPONSE, response);
        });

        this.on('error', (response) => {
            dispatch(HorseGameEvent.ERROR_RESPONSE, response);
        });

        this.on('horseAnime', (response) => {
            dispatch(HorseGameEvent.HORSE_ANIME_RESPONSE, { data: response });
        });
    }

    // ---------- 外部部呼叫 ------------------------------------------------------
}

