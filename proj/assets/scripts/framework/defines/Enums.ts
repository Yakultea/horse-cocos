
/**
 * @description 專案內所有常用列舉定義，請忽引入其它模組
 */

/**@description 日誌等級 */
export enum LogLevel {
    DEBUG = 0X00000001,
    DUMP = 0X00000010,
    WARN = 0X00000100,
    ERROR = 0X00001000,
    ALL = DEBUG | DUMP | WARN | ERROR,
}

/**
 * @description 介面檢視狀態
 */
export enum ViewStatus {
    /**@description 等待關閉 */
    WAITTING_CLOSE,
    /**@description 等待隱藏 */
    WATITING_HIDE,
    /**@description 無狀態 */
    WAITTING_NONE,
}

export enum ButtonSpriteType {
    Norml = "normalSprite",
    Pressed = "pressedSprite",
    Hover = "hoverSprite",
    Disable = "disabledSprite",
}