// ---------- 引用 ----------------------------------------------------------------
// ---------- 常數 ----------------------------------------------------------------

import { EventProcessor } from "../event/EventProcessor";

export interface ICommand {
    execute(...args: any[]): void;
    // undo(): void;
}

export default class CommandManager extends EventProcessor implements ISingleton {
    // ---------- 成員變數 -------------------------------------------------------------
    static module: string = "【command 命令管理】";
    module: string = null!;

    private commandMap: Map<string, ICommand> = new Map();

    // ---------- 生命週期 -------------------------------------------------------------

    // ---------- 框架呼叫 -------------------------------------------------------------
    // ---------- 內部呼叫 -------------------------------------------------------------
    // ---------- 外部部呼叫 -----------------------------------------------------------

    /** 註冊命令 */
    public addCommand(eventName: string, command: ICommand) {
        if (this.commandMap.has(eventName)) return;

        this.on(eventName, (event)=>{
            command.execute(event);
        })
        this.commandMap.set(eventName, command);
    }

    /** 移除命令  */
    public removeCommand(eventName: string) {
        this.off(eventName);
        this.commandMap.delete(eventName);
    }

    public debug() {
        Log.d(`-------command命令資訊-------`);
        this.commandMap.forEach((data, key) => {
            Log.d(key);
        });
    }
}