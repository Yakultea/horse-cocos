export interface IInitGameState {
    action: string;
    currentWinnings: number;
    isFreeGameUp?: boolean;
    freespinWinnings: number;
    freespinWon: number;
    jpWon: number;
    numFreeSpins: number;
    totalStake: number;
    totalWinnings: number;
    view: number[][];
    win: number;
    spinId: string;
};

export interface ISpinGameState extends IInitGameState {
    freeTimesDenominator: number;
    multiple: number;
    selectedFgMultiple: number;
    wins: {
        id: string;
        payoutFactory: number;
        symbolPos: number[];
        type: string;
        winLine: number;
        winnings: number;
    }[];
}

export interface IInitialRes {
    status: number;
    message: string;
    token: string;
    engine: {
        definition: IDefinitionBase;
        gameState: IInitGameState;
    };
    posters: {
        startTime: number;
        endTime: number;
        title: string;
        poster: {
            portrait: string;
            portrait2: string;
            landscape: string;
            landscapeX2: string;
            link: string;
            portraitX2: string;
        };
        id: number;
    }[];
    platform: IPlatform,
    isResuming: boolean;
    eventName: string;
    code?: string, // 會出現的code 的時候 通常都是error的
}

export interface IPlatform {
    game: {
        stakeValues: number[];
        ratioValues: number[];
    };
    player: {
        name: string;
        id: number;
        uid: number;
        avatar: string;
        avatarUrl: string;
        balance: {
            currency: string;
            amount: number;
            gemAmount: number;
        };
        settings: ISettings;
        clientSettings: any;
        nameDisplayOn: boolean;
    };
    gemSystem: number;
    table?: { // 如果沒有此key，則表示後台關閉此功能。
        room: string,
        roomId: number,
        number: number;
    };
};
export interface ISettings {
    advancedSettings: {
        sounds: {
            background: boolean;
            backgroundVolume: number;
            effect: boolean;
            effectVolume: number;
        };
        notify: boolean;
        turbo: boolean;
    };
    autoPlay: {
        numberOfPlays: number[];
        stopOnWinMultiplier: boolean;
        stopOnBalance: boolean;
        stopOnFreeSpin: boolean;
        stopOnJackpot: boolean;  // 獲得JP彩金後停止
    };
    stakeIndex: number;
    ratioIndex: number;
};

export interface IDefinitionBase {
    viewDefs: {
        type: string;
        view: string[][];
    };
    symbolDefs: {
        symbol: string;
        isWild?: boolean; // 物件定義, erase-2 沒有 wild 物件
        displayName: string;
    }[];
    winlineDefs: {
        order: string;
        line: number[];
    }[];
    winDefs: {
        oak: string;
        type: string;
        symbol: string;
        freq: number;
        payoutFactor: number;
    }[];
    fgMultiple: number[];
    gameVersion: string;
    libraryVersion: string;
    gameClass: {
        gameClass: string;
        defaultStake: number;
        stakeValues: number[];
        defaultRatio: number;
        ratioValues: number[];
    }[];
    digital: number; // 小數點位數

};

export interface ISpinRes extends IResBase {
    engine: {
        gameState: ISpinGameState;
    };
    platform: {
        game: {
            stakeValues: number[];
            ratioValues: number[];
        };
        player: {
            uid: number;
            balance: {
                currency: string;
                amount: number;
            };
        };
    };
}

export interface ICloseSpinRes extends IResBase {
    platform: {
        player: {
            hasGem: number;
            balance: {
                amount: number;
                gemAmount: number;
            };
        };
    };
    engine: {
        gameState: {};
    };
    betRecord: {
        hasFree: boolean;
        win: number;
        totalStake: number;
        user: string;
        game: string;
        usedGoods: string;
    };
}

export interface IResBase {
    token: string;
    status: number;
    message: string;
    eventName: string;
    code?: string;
}

export interface IBetRecordsRes extends IResBase {
    data: IBetRecordsData[];
}
export interface IBetRecordsData {
    endTime: number;
    hasFree: false;
    id: number;
    name: string;
    profit: number;
    roomId: string;
    totalStake: number;
}
export interface ISlotTablesRes extends IResBase {
    data: {
        lock: ILock;
        tables?: ITables[];
        detail?: IDetail;
    };
}
export interface ILock {
    count: number;
    roomId: number;
    time: number;
    expiredDef?: number;
    resetDef?: number;
}
export interface ITables {
    bet: number;
    number: number;
    roomId: number;
    status: string; // "Empty"
    win: number;
    user?: {
        clientType: string;
        gameClass: number;
        ip: number;
        userId: number;
        username: string;
    };
    isLocked?:boolean;
}
export interface IDetail {
    win: number,
    bet: number;
}
export interface IUpdateSlotTableRes extends IResBase {
    data: {
        number: number;
        room?: string;
        roomId: number;
        tables: ITables[];
    };
}
export interface IUpdateAvatarRes extends IResBase {
    data: {
        avatarId: string;
        avatarUrl: string;
    };
}

export enum ENotifyTypes {
    JACKPOT_UPDATE = 'jackpotUpdate',
    LEGEND_WIN = 'legendWin',
}

export interface INotifyJackpotUpdate {
    data: {
        jp4?: number;
        jp5?: number,
        'jp-grand': number;
        'jp-major': number;
        'jp-mini': number;
        'jp-minor': number;
        [key: string]: number;
    }
    type: ENotifyTypes;
}
export interface INotifyLegendWin {
    data: {
        text: string;
        html: string;
    },
    expiredAt: number,
    shiftTime: number,
    type: ENotifyTypes;
}