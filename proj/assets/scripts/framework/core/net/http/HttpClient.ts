import { Http } from "./Http";

/**
 * @description http網路請求
 */

import { sys } from "cc";
import { DEBUG, JSB, PREVIEW } from "cc/env";

class HttpPackageData {
    data: any = null;
    url: string = null!;
    /**@description 超時設定 預設為10s*/
    timeout: number = 10000;
    /**@description 請求型別 預設為GET請求*/
    type: Http.Type = Http.Type.GET;
    /**@description 是否同步 */
    async : boolean = true;
    requestHeader: { name: string, value: string }[] | { name: string, value: string } | null = null;
    /**@description 傳送介面時，預設為false 僅瀏覽器端生效
     * 自動附加當前時間的引數欄位
     * 但如果伺服器做了介面引數效驗，可能會導致介面無法透過伺服器驗證，返回錯誤資料
     * @example 
     * 請求地址為http:www.baidu.com 當isAutoAttachCurrentTime 為 true為
     * 實際的請求介面為http:www.baidu.com?cur_loc_t=當前時間
     * 請求地址為http:www.baidu.com?uid=123 當isAutoAttachCurrentTime 為 true為
     * 實際的請求介面為http:www.baidu.com?uid=123&cur_loc_t=當前時間
     *  */
    isAutoAttachCurrentTime = false;
    private _responseType: XMLHttpRequestResponseType = "";
    public set responseType(type: XMLHttpRequestResponseType) {
        this._responseType = type;
    }
    public get responseType() {
        if (JSB) {
            if (this._responseType == "") {
                this._responseType = "text";
            }
        }
        return this._responseType;
    }
}

/**
 * @description http 請求包
 */
export class HttpPackage {

    /**@description 跨域代理 */
    public static crossProxy: any = {};
    /**@description 當前主機地址 */
    public static location = { host: "", pathname: "", protocol: "" };

    private _data: HttpPackageData = new HttpPackageData();
    public set data(data: HttpPackageData) {
        this._data = data;
    }
    public get data(): HttpPackageData {
        return this._data;
    }

    private _params: Object = null!;
    /**
     * @description 傳入的請求引數會拼在data.url 
     * @example params = { a : 10 , b : 20 }
     * 最終的url 為data.url?&a=10&b=20
     */
    public set params(value: Object) {
        this._params = value;
    }
    public get params() {
        return this._params;
    }
    /**
     * @description 傳送請求包
     * @param cb 
     * @param errorcb 
     */
    public send(cb?: (data: any) => void, errorcb?: (errorData: Http.Error) => void) {
        App.http.request(this, cb, errorcb);
    }
}

export class HttpClient implements ISingleton{
    static module: string = "【Http管理器】";
    module: string = null!;
    protected crossProxy(url: string): string {
        //瀏覽器，非除錯模式下
        if (sys.isBrowser && !PREVIEW && HttpPackage.crossProxy) {
            let config = HttpPackage.crossProxy;
            let location = HttpPackage.location;
            let keys = Object.keys(config);

            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let value = config[key];

                if (url.indexOf(key) > -1) {
                    if (value.protocol && value.api) {
                        if (location.protocol != value.protocol) {
                            //所有跨域的都從當前伺服器的代理轉發，把https也得轉化成http:
                            url = url.replace(value.protocol, location.protocol);
                        }
                        return url.replace(key, `${location.host}/${value.api}`);
                    }
                }
            }
            return url;
        } else {
            return url;
        }
    }

    protected convertParams(url: string, params: Object): string {
        if (params == null || params == undefined) {
            return url;
        }
        let result = "&";
        if (url.indexOf("?") < 0) {
            result = "?";
        }
        let keys = Object.keys(params)
        for (let i = 0; i < keys.length; i++) {
            if (i == 0) {
                result += `${keys[i]}=${(<any>params)[keys[i]]}`;
            } else {
                result += `&${keys[i]}=${(<any>params)[keys[i]]}`
            }
        }
        result = url + result;
        return result;
    }

    protected convertData( data : any ){
        return data;
    }

    request(httpPackage: HttpPackage, cb?: (data: any) => void, errorcb?: (errorData: Http.Error) => void) {

        let url = httpPackage.data.url;
        if (!url) {
            if ( DEBUG ){
                Log.e(`reuqest url error`);
            }
            if (errorcb) errorcb({ type: Http.ErrorType.UrlError, reason: "錯誤的Url地址" });
            return;
        }

        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if ((xhr.status >= 200 && xhr.status < 300)) {
                    if (xhr.responseType == "arraybuffer" || xhr.responseType == "blob") {
                        if (cb) cb(xhr.response);
                    } else {
                        if ( DEBUG) Log.d(`htpp res(${xhr.responseText})`);
                        if (cb) cb(xhr.responseText);
                    }
                } else {
                    let reason = `請求錯誤,錯誤狀態:${xhr.status}`;
                    Log.e(`request error status : ${xhr.status} url : ${url} `);
                    if (errorcb) errorcb({ type: Http.ErrorType.RequestError, reason: reason });
                }
            }
            else {
                //cc.log(`readyState ${xhr.readyState}`);
            }
        };

        xhr.responseType = httpPackage.data.responseType;

        xhr.timeout = httpPackage.data.timeout;
        xhr.ontimeout = () => {
            xhr.abort();//網路超時，斷開連線
            if ( DEBUG) Log.w(`request timeout : ${url}`);
            if (errorcb) errorcb({ type: Http.ErrorType.TimeOut, reason: "連線超時" });
        };

        xhr.onerror = () => {
            Log.e(`request error : ${url} `);
            if (errorcb) errorcb({ type: Http.ErrorType.RequestError, reason: "請求錯誤" });
        };

        if ( DEBUG ) Log.d(`[send http request] url : ${url} request type : ${httpPackage.data.type} , responseType : ${xhr.responseType}`);

        url = this.crossProxy(url);
        url = this.convertParams(url,httpPackage.params);

        if ( httpPackage.data.isAutoAttachCurrentTime ){
            if ( url.indexOf("?") >=0 ){
                url = `${url}&cur_loc_t=${Date.timeNow()}`;
            }else{
                url = `${url}?cur_loc_t=${Date.timeNow()}`;
            }
        }

        if (sys.isBrowser && !PREVIEW) {
            if ( DEBUG) Log.d(`[send http request] corss prox url : ${url} request type : ${httpPackage.data.type} , responseType : ${xhr.responseType}`);
        }

        if (httpPackage.data.type === Http.Type.POST) {
            xhr.open(Http.Type.POST, url,httpPackage.data.async);
            if (httpPackage.data.requestHeader) {
                if( httpPackage.data.requestHeader instanceof Array ){
                    httpPackage.data.requestHeader.forEach((header)=>{
                        xhr.setRequestHeader(header.name, header.value);
                    });
                }else{
                    let header : { name: string, value: string } = httpPackage.data.requestHeader;
                    xhr.setRequestHeader(header.name,header.value);
                }
            }
            else {
                xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
            }
            xhr.send( this.convertData(httpPackage.data.data) );
        }
        else {
            xhr.open(Http.Type.GET, url, httpPackage.data.async);
            if( httpPackage.data.requestHeader ){
                if( httpPackage.data.requestHeader instanceof Array ){
                    httpPackage.data.requestHeader.forEach((header)=>{
                        xhr.setRequestHeader(header.name, header.value);
                    });
                }else{
                    let header : { name: string, value: string } = httpPackage.data.requestHeader;
                    xhr.setRequestHeader(header.name,header.value);
                }
            }
            xhr.send();
        }
    }
}
