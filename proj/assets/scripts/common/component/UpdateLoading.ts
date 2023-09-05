import Loading from "./Loading";
/**
 * @description 載入動畫
 */

export default class UpdateLoading extends Loading {
    static module = "【UpdateLoading】";
    module: string = null!;
    /**
     * @description 顯示Loading
     * @param content 提示內容
     * @param timeOutCb 超時回撥
     * @param timeout 顯示超時時間
     */
    public show( content : string | string[] , timeOutCb?:()=>void,timeout?:number ) {
        this.timeOutCb = undefined;
        this._show(999);
        this._content = [];
        if ( typeof content == "string"){
            this._content.push(content);
        }
        return this;
    }

    protected startShowContent( ){
        this.text.string = this._content[0];
    }

    public updateProgress(progress: number) {
        if (this.text) {
            if (progress == undefined || progress == null || Number.isNaN(progress) || progress < 0) {
                this.hide();
                return;
            }
            if (progress >= 0 && progress <= 100) {
                this.text.string = App.getLanguage("loadingProgress",[progress]);
            }
        }
    }
}
