import UrlUtils from "./UrlUtils";

export enum EClientTypes {
    WEB = 'web',
    WAP = 'wap',
    ANDROID = 'android',
    IOS = 'ios',
    RN = 'rn',
    UNITY_WEBVIEW = 'uniWebView'
};

export class ExitUtils {

    private static _window: any = window.parent;

    /** 離開 */
    public static exit() {
        // http://localhost:7456/?t=5bf31ce7c2914f659ade023c998e5db5&gn=egyptian-mythology&l=zh-tw&ct=slot&gt=slot-erase-any-times-1&socket_url=socket.riversense.tw&ts=1690506987287&view_mode=landscape&p=atg&wv=1.2.32&gv=1.3.14&client_type=web&goback_url=https%3A%2F%2Fwww.google.com.tw%2F%3Fhl%3Dzh_TW
        // const url = UrlUtils.getUrlParams();
        // const deviceType = url.app || DeviceDetection.getDeviceType();
        // const isUniWebView = url.uniwebview || null;
        // const clientType = (isUniWebView !== null) ? clientTypes.UNITY_WEBVIEW : deviceType;
        const clientType: EClientTypes = UrlUtils.getParam('client_type') as EClientTypes;
        // 從網址列檢查是否有goback_url
        const goBackUrl = UrlUtils.getParam('goback_url');

        if (goBackUrl) {
            this.exitWeb(goBackUrl);
        } else {
            switch (clientType) {
                case EClientTypes.WEB:
                case EClientTypes.WAP:
                    this.exitWeb(goBackUrl);
                    break;
                case EClientTypes.ANDROID:
                    this.exitWVJB();
                    this.exitAndroid();
                    break;
                case EClientTypes.IOS:
                    this.exitWVJB();
                    this.exitIOS();
                    break;
                case EClientTypes.RN:
                    this.exitRN();
                    break;
                case EClientTypes.UNITY_WEBVIEW:
                    window.location.href = 'uniwebview://exit';
                    break;
                default:
                    break;
            }
        }

    }

    /** 離開web */
    private static exitWeb(goBackUrl: string) {
        if (goBackUrl) {
            this._window.location.href = goBackUrl;
        } else {
            this._window.close()
        }
        setTimeout(() => {
            this._window.open('error.html', '_self');
            this._window.close();
            // this._window.location.replace('error.html')
            // this._window.history.replaceState(null, '', '/')
            // window.history.go(0)
            // this._window.opener = null;
        }, 1000);
    }

    /** 關閉web */
    private static webClose() {
        const Browser = this._window.navigator.appName;

        const indexB = Browser.indexOf('Explorer');

        if (indexB < 0) {
            const indexV = navigator.userAgent.indexOf('MSIE') + 5;
            const Version = Number(navigator.userAgent.substring(indexV, indexV + 1));

            if (Version >= 7) {
                this._window.open('', '_self', '');
                this._window.close()
            } else if (Version == 6) {
                this._window.opener = null;
                this._window.close();
            } else {
                this._window.opener = '';
                this._window.close();

                // const location = this._window.location.href;
                // const self = this._window.open(location, '_self');
                // self.close();
                // this._window.open(location, '_self')
                // this._window.close();
            }
        } else {
            const location = this._window.location.href;
            this._window.open(location, '_self').close();
        }
    }

    // 退出 WebViewJavascriptBridge 環境
    private static exitWVJB() {
        const { WebViewJavascriptBridge } = this._window || {};
        if (WebViewJavascriptBridge) {
            WebViewJavascriptBridge.callHandler('UnityBack', { message: 'back' }, (resData: any) => {
                // 在 WebViewJavascriptBridge 中呼叫 UnityBack 處理程序
            });

            WebViewJavascriptBridge.callHandler('TwGameBack', { message: 'back' }, (resData: any) => {
                // 在 WebViewJavascriptBridge 中呼叫 TwGameBack 處理程序
            });
        }
    }

    // 在 Android 環境中觸發退出操作
    private static exitAndroid() {
        const { androidFunc } = this._window || {};
        androidFunc?.finish?.();
        // 在 Android 環境中執行退出操作
    }

    // 在 React Native 環境中觸發退出操作
    private static exitRN() {
        this._window?.postMessage?.(JSON.stringify({ type: 'iosback' }));
        // 在 React Native 環境中透過 postMessage 發送退出消息
    }

    // 在 iOS 環境中觸發退出操作
    private static exitIOS() {
        const { webkit } = this._window || {};

        if (webkit?.messageHandlers) {
            const handlers = webkit.messageHandlers;
            if (handlers.TwGameBack?.postMessage) {
                return handlers.TwGameBack.postMessage({ action: 'exit' });
                // 使用 TwGameBack.postMessage 發送退出消息
            } else if (handlers.UnityBack?.postMessage) {
                return handlers.UnityBack.postMessage({ action: 'exit' });
                // 使用 UnityBack.postMessage 發送退出消息
            }
        }
    }
}
