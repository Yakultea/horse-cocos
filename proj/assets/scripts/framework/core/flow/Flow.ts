import { TaskCallback, TaskManager } from './TaskQueue';
import { FlowEvent, FlowEventConfig } from './FlowEvent';
import { Tween, tween } from 'cc';
import Singleton from '../../utils/Singleton';
import { SingletonExtends } from '../../utils/SingletonExtends';

export interface TaskVO {
    eventName: string;
    eventData?: any;
    config?: FlowEventConfig;
}

export enum FlowTrigger {
    AFTER_PREVIOUS,
    AFTER_ALL,
    CONCURRENT,
    WITH_FLAGS,
}

export default class Flow extends SingletonExtends {
    public flowId: string = '';

    private _idx: number = 0;
    private _tag: number = 0;
    private _priority: number = 0;
    private _curPriority: number = 0;
    private _curTag: number = 0;
    private _taskManger: TaskManager;

    private afterAllTasks: TaskVO[] = [];

    private _flowMap: Map<string, { firstTrigger: FlowTrigger; data: (FlowTrigger | FlowEvent<any>)[]; }> = new Map();

    constructor(flowID: string) {
        super();
        this.flowId = flowID;
        this._taskManger = new TaskManager();
        this._taskManger.eventTarget.once('completed', this.taskCompleted, this);
        this._taskManger.eventTarget.on(
            'curTaskConfig',
            this.setCurTaskConfig,
            this,
            false
        );
    }

    public add(firstTrigger: FlowTrigger, ...data: (FlowTrigger | FlowEvent<any>)[]): void {
        this._idx += 1;
        this._flowMap.set(`${this.flowId}_${this._idx}`, { firstTrigger, data });

        // data.forEach((item, index) => {
        //     if (item instanceof FlowEvent) {
        //         const task: TaskVO = {
        //             eventName: item.name,
        //             eventData: item.data,
        //             config: {
        //                 autoComplete: item.autoComplete,
        //                 delay: item.delay
        //             }
        //         };
        //         switch (tasksTrigger) {
        //             case FlowTrigger.CONCURRENT:
        //                 this.addTaskQueue(task, index);
        //                 break;
        //             case FlowTrigger.AFTER_PREVIOUS:
        //                 this.addTaskQueue(task, this._tag);
        //                 break;
        //             case FlowTrigger.AFTER_ALL:
        //                 this.addAfterAll(task);
        //                 break;
        //             case FlowTrigger.WITH_FLAGS:
        //                 this.addWithFlags(task);
        //                 break;
        //             default:
        //                 break;
        //         }
        //     } else {
        //         tasksTrigger = item as FlowTrigger;
        //         this._priority += 1;
        //     }
        // });
    }

    public start(): void {
        this._flowMap.forEach((flowData) => {
            const { firstTrigger, data } = flowData;
            let tasksTrigger: FlowTrigger = firstTrigger;

            this.setTasksCount(firstTrigger, ...data);

            data.forEach((item, index) => {
                if (item instanceof FlowEvent) {
                    const task: TaskVO = {
                        eventName: item.name,
                        eventData: item.data,
                        config: {
                            autoComplete: item.autoComplete,
                            delay: item.delay,
                        },
                    };
                    switch (tasksTrigger) {
                        case FlowTrigger.CONCURRENT:
                            this.addTaskQueue(task, index);
                            break;
                        case FlowTrigger.AFTER_PREVIOUS:
                            this.addTaskQueue(task, this._tag);
                            break;
                        case FlowTrigger.AFTER_ALL:
                            this.addAfterAll(task);
                            break;
                        case FlowTrigger.WITH_FLAGS:
                            this.addWithFlags(task);
                            break;
                        default:
                            break;
                    }
                } else {
                    tasksTrigger = item as FlowTrigger;
                    this._priority += 1;
                }
            });
        });
    }

    private setTasksCount(
        firstTrigger: FlowTrigger,
        ...data: (FlowTrigger | FlowEvent<any>)[]
    ): void {
        let tasksTrigger: FlowTrigger = firstTrigger;
        let taskCount: number = 0;

        // Log.d('add', firstTrigger, data);

        data.forEach((item) => {
            if (item instanceof FlowEvent) {
                switch (tasksTrigger) {
                    case FlowTrigger.CONCURRENT:
                    case FlowTrigger.AFTER_PREVIOUS:
                        taskCount += 1;
                        break;
                }
            } else {
                tasksTrigger = item as FlowTrigger;
            }
        });

        // Log.d('eventCount', taskCount);
        this._taskManger.setEventCount(taskCount);
    }

    public addTask(tasksVO: TaskVO): TaskCallback {
        return (complete) => {
            const executeTask = () => {
                let { eventName, eventData } = tasksVO;
                let data = {
                    name: '',
                    data: null as any,
                    complete: complete,
                };
                if (eventName) {
                    data.name = eventName;
                }
                if (eventData) {
                    data.data = eventData;
                }
                dispatch(eventName, data);
                // Log.d(eventName, data);
            };

            if (tasksVO.config) {
                const { delay, autoComplete } = tasksVO.config;
                if (delay) {
                    tween(this)
                        .delay(delay)
                        .call(() => {
                            // Log.d('in call');
                            executeTask();
                            if (autoComplete) {
                                complete();
                            }
                        })
                        .start();
                } else {
                    executeTask();
                    if (autoComplete) {
                        complete();
                    }
                }
            } else {
                executeTask();
            }
        };
    }

    public addTaskQueue(item: TaskVO, tag: number, priority?: number): void {
        let task = this.addTask(item);
        if (priority === undefined) {
            if (this._priority === undefined) {
                this._priority = 0;
            } else {
                this._priority += 1;
            }
            priority = this._priority;
        }

        this._tag = tag;

        this._taskManger.pushTaskByTag(task, this._tag, priority);
    }

    public addAfterAll(item: TaskVO): void {
        if (!this.afterAllTasks) {
            this.afterAllTasks = [];
        }
        this.afterAllTasks.push(item);
    }

    public addWithFlags(item: TaskVO): void {
        this._curPriority += 0.01;
        this.addTaskQueue(item, this._curTag, this._priority);
    }

    public taskCompleted(): void {
        // Log.d('taskCompleted', this.afterAllTasks);
        if (this.afterAllTasks?.length > 0) {
            this._taskManger.setEventCount(this.afterAllTasks.length);
            this.afterAllTasks.forEach((task) => {
                this.addTaskQueue(task, this._tag);
            });
            this.afterAllTasks = [];
        }
    }

    public setCurTaskConfig(e: { priority: number; tag: number; }): void {
        this._curPriority = e.priority;
        this._curTag = e.tag;
    }

    public kill(): void {
        Tween.stopAllByTarget(this);
        this._taskManger.clearAllTaskQueue();
    }
}
