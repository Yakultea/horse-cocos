/**
 * Server
 */

import { BaseModel } from "../../framework/core/event/BaseModel";


export enum EServerMode {
    STATIC,
    ONLINE
}

interface IServerConfig {
    mode: EServerMode,
}

class ServerModel extends BaseModel<IServerConfig> {
    private static _instance: ServerModel = null;
    public static Instance() { return this._instance || (this._instance = new ServerModel()); }

    constructor() {
        super();
        this.data = {
            mode: EServerMode.ONLINE
        }
    }

    /** mode */
    public get mode() { return this.data.mode; }
    public set mode(mode: EServerMode) { this.data.mode = mode; }
}

export default ServerModel.Instance();
