/**
* @description 任務隊列管理器 
* 1. 傳入任務，進入隊列順序執行
* 2. 支持優先級（從小到大排序，priority越小優先級越高）
* 3. 支持隊列Tag，允許多個互不影響的隊列執行
* 4. 支持清理任務隊列
* 5. 一個任務隻能完成一次，避免代碼的原因多次調用完成，導緻後續任務提前執行
* 6. 調試模式下記錄了每個Task添加時的堆棧，方便調試（可以快速查看哪個任務冇有結束）
*/

import { EventTarget, log, warn } from "cc";
import { SingletonExtends } from "../../utils/SingletonExtends";

// 任務結束回調
export type TaskCompleteCallback = () => void;
// 任務執行回調
export type TaskCallback = (TaskCompleteCallback: Function) => void;

class TaskInfo {
    public task: TaskCallback;
    public priority: number;
    public constructor(task: TaskCallback, priority: number) {
        this.task = task;
        this.priority = priority;
    }
}

export enum ETaskTag {
    GAME_UPDATED = 1,
}

export interface ITaskConfig {
    tag: number,
    priority: number;
}

export class TaskQueue extends SingletonExtends {
    private _curTask: TaskInfo | null = null;
    private _taskQueue: TaskInfo[] = Array<TaskInfo>();

    public eventTarget: EventTarget = new EventTarget();
    private _isCompleted: boolean = false;

    // 添加一個任務，如果當前冇有任務在執行，該任務會立即執行，否則進入隊列等待
    public pushTask(task: TaskCallback, priority: number = 0): void {

        let taskInfo = new TaskInfo(task, priority);
        
        if (this._taskQueue.length > 0) {
            for (var i: number = this._taskQueue.length - 1; i >= 0; --i) {
                if (this._taskQueue[i].priority <= priority) {
                    this._taskQueue.splice(i + 1, 0, taskInfo);
                    return;
                }
            }
        }
        // 插到頭部
        this._taskQueue.splice(0, 0, taskInfo);
        
        if (this._curTask == null) {
            this.executeNextTask();
        }
    }

    public clearTask(): void {
        this._curTask = null;
        this._taskQueue = [];
    }

    public getCurTaskPriority(): number {
        return (this._curTask as TaskInfo).priority;
    }

    private executeNextTask(): void {
        let taskInfo = this._taskQueue.shift() || null;
        this._curTask = taskInfo;
        if (taskInfo) {
            taskInfo.task(() => {
                if (taskInfo === this._curTask) {
                    // log('executeNextTask this completed', taskInfo);
                    this.eventTarget.emit('completed');
                    this.executeNextTask();
                } else {
                    warn("your task finish twice!");
                }
            });
        } else {
            // if(!this._isCompleted) {
            //     this.eventTarget.emit('completed');
            //     this._isCompleted = true
            // }
        }
    }
}

export class TaskManager {
    private static _instance: TaskManager | null = null;
    public static Instance() { return this._instance || (this._instance = new TaskManager()); }
    private _taskQueues: { [key: number]: TaskQueue; } = {};

    public count: number = 0;
    public eventTarget: EventTarget = new EventTarget();

    public static destory(): void {
        this._instance = null;
    }

    constructor() { }

    public pushTask(task: TaskCallback, priority: number = 0): void {
        return this.getTaskQueue().pushTask(task, priority);
    }

    public pushTaskByTag(task: TaskCallback, tag: number, priority: number = 0): void {

        // log('pushTaskByTag', tag);

        return this.getTaskQueue(tag).pushTask(task, priority);
    }

    public clearTaskQueue(tag: number = 0): void {
        let taskQueue = this._taskQueues[tag];
        if (taskQueue) {
            taskQueue.clearTask();
        }
    }

    public clearAllTaskQueue(): void {
        for (let queue in this._taskQueues) {
            this._taskQueues[queue].clearTask();
        }
        this._taskQueues = {};
    }

    private getTaskQueue(tag: number = 0): TaskQueue {
        let taskQueue = this._taskQueues[tag];

        if (taskQueue == null) {
            taskQueue = new TaskQueue();
            this._taskQueues[tag] = taskQueue;
            if (this.count !== undefined) {
                taskQueue.eventTarget.on('completed', () => {
                    const config: ITaskConfig = {
                        tag: tag,
                        priority: this._taskQueues[tag].getCurTaskPriority()
                    };
                    this.count -= 1;
                    this.eventTarget.emit('curTaskConfig', config);

                    // warn('completed', this.count);
                    if (this.count === 0) {
                        this.eventTarget.emit('completed');
                    }
                }, this, false);
            }
        }
        return taskQueue;
    }

    public setEventCount(count: number) {
        this.count = count;
    }
}

// export default TaskQueue.instance();

/* 測試用例：
* 1. 測試多個任務的執行順序 + 優先級
* 2. 測試在執行任務的過程中動態添加新任務

export function testQueue() {
    let creatTask = (idx, pri): TaskCallback => {
        return (finish) => {
            log(`execute task ${idx} priority ${pri}`);
            finish();
        };
    };
    let tag = 0;
    let begin = (finish) => {
        for (var i = 0; i < 100; ++i) {
            let priority = 0;
            if (i % 10 == 0) {
                priority = -1;
            } else if (i == 88) {
                priority = 1;
            } else if (i == 22) {
                let task = creatTask(1.1, priority);
                TaskManager.getInstance().pushTaskByTag(task, tag, priority);
                task = creatTask(1.2, priority);
                TaskManager.getInstance().pushTaskByTag(task, tag, priority);
                task = creatTask(1.3, priority);
                TaskManager.getInstance().pushTaskByTag(task, tag, priority);
            } else if (i == 51 && tag == 2) {
                // 清理之後，添加的任務會立即執行...
                TaskManager.getInstance().clearTaskQueue(tag);
            }
            let task = creatTask(i, priority);
            Object.defineProperty(task, "idx", { value: i });
            TaskManager.getInstance().pushTaskByTag(task, tag, priority);
        }
        log("add task finish, start test");
        finish();
        // 測試重複調用結束
        finish();
        // tag為2時的finish兩次都會報警告，因為begin已經被清理了
    }
    TaskManager.getInstance().pushTaskByTag(begin, tag);
    tag = 2;
    TaskManager.getInstance().pushTaskByTag(begin, tag);

}*/
