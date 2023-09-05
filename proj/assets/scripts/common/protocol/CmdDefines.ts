export const MainCmd = { // 目前未使用
    /**@description 系統類 */
    CMD_SYS: 1,
    /**@description 遊戲類 */
    CMD_GAME: 2,
    /**@description 大廳類 */
    CMD_LOBBY: 3,
    /**@description 支付類 */
    CMD_PAY: 4,
    /**@description 聊天類 */
    CMD_CHAT: 5,
};
export enum EMainCmd {
    /**@description WRAPPER類 */
    CMD_WRAPPER = 'WRAPPER',
    /**@description 系統類 */
    CMD_SYS = 'SYS',
    /**@description 遊戲類 */
    CMD_GAME = 'GAME',
    /**@description 大廳類 */
    CMD_LOBBY = 'LOBBY',
    /**@description 支付類 */
    CMD_PAY = 'PAY',
    /**@description 聊天類 */
    CMD_CHAT = 'CHAT',
}
export const SUB_CMD_SYS = { // 目前未使用
    /** 心跳 -- 客戶端、伺服器使用 **/
    CMD_SYS_HEART: 1,
};