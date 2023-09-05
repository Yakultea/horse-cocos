/**@description Http相關列舉定義 */
export namespace Http {
    /**@description http錯誤型別 */
    export enum ErrorType {
        /**@description 錯誤的Url地地址*/
        UrlError,
        /**@description 請求超時 */
        TimeOut,
        /**@description 請求錯誤 */
        RequestError,
    }

    /**@description http 請求型別 */
    export enum Type {
        POST = "POST",
        GET = "GET",
    }
    /**@description http 錯誤 */
    export interface Error {
        type: ErrorType,
        reason: any,
    }

    export enum ServerStatus {
        SUCCESS = 200,
        REQUEST_ERROR = 400,
        BACKEND_ERROR = 500
    }
}