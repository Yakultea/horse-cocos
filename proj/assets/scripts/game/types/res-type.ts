export interface IInitialRes extends IResBase {
    engine: any;
}

export interface IResBase {
    eventName: string;
    message: string;
    status: number;
    token: string;
}

export interface IFrameData {
    goalNumbers: string[];
    rankNumbers: string[];
    horses: IHorses[];
}

export interface IHorses {
    horseNumber: number;
    rotation: number;
    x: number;
    y: number;
}

export interface IDrawNotify {
    horseAnime: {
        frameData: IFrameData[];
        skin: number[];
        rider: number[];
    };
}