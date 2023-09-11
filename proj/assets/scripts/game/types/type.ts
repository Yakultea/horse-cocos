/** Socket Req事件 */
export enum ESocketRequestName {
    INITIAL = 'initial',
    SPIN = 'spin',
    CLOSE_SPIN = 'closeSpin',
    UPDATE_SETTINGS = 'updateSettings',
    GET_BET_RECORDS = 'getBetRecords',
    GET_SLOT_TABLES = 'getSlotTables',
    UPDATE_SLOT_TABLE = 'updateSlotTable',
    LOCK_SLOT_TABLE = 'lockSlotTable',
    BUY_FEATURE = 'buyFeature',
    UPDATE_AVATAR = 'updateAvatar',
}

export enum responseStatus {
    SUCCESS = 200,
    INSUFFICIENT_FUND_ERROR = 400,
    TOKEN_EXPIRED = 401,
    CLIENT_ERROR = 403,
    SERVER_PROBLEM = 500
};

export enum ESpinStatus {
    IDLE = 'idle',
    SPINING = 'spining',
    // STOP = 'stop'

}