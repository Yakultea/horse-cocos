/**
 * @description 網路Service服務管理
 */

import { Macro } from "../../../defines/Macros";

export class ServiceManager implements GameEventInterface, ISingleton {
    static module: string = "【Service管理器】";
    module: string = null!;

    /**@description 所有的網路 */
    protected services: Service[] = [];

    /**@description 等級重連的網路 */
    protected waitReconnect: Service[] = [];

    /**@description 當前正在重連的Service */
    protected curReconnect: Service | undefined = undefined;

    /**@description 獲取service */
    get<T extends Service>(classOrModule: ServiceClass<T> | string, isCreate = false) {
        let module = this.getModule(classOrModule);
        if (module == Macro.UNKNOWN) {
            return null;
        }
        let service = this.getService(module);
        if (service) {
            return service;
        }
        if (typeof classOrModule != "string") {
            if (isCreate) {
                service = new classOrModule();
                service.module = module;
                this.services.push(service);
                return service;
            }
        }
        return null;
    }

    /**@description 銷燬Service */
    destory<T extends Service>(classOrName?: ServiceClass<T> | string) {
        if (classOrName) {
            let name = this.getModule(classOrName);
            let i = this.services.length;
            while (i--) {
                if (this.services[i].module == name) {
                    //銷燬前先關閉網路
                    this.services[i].close();
                    this.services[i].destory();
                    this.services.splice(i, 1);
                }
            }
        } else {
            this.clear();
        }

    }

    /**@description 清除Service */
    clear<T extends Service>(exclude?: (ServiceClass<T> | string)[]) {
        let i = this.services.length;
        while (i--) {
            if (!this.isInExclude(this.services[i], exclude)) {
                //銷燬前先關閉網路
                this.services[i].close();
                this.services[i].destory();
                this.services.splice(i, 1);
            }
        }
    }

    private isInExclude<T extends Service>(data: T, exclude?: (ServiceClass<T> | string)[]) {
        if (!exclude) return false;
        for (let i = 0; i < exclude.length; i++) {
            let name = this.getModule(exclude[i]);
            if (name == data.module) {
                return true;
            }
        }
        return false;
    }

    private getModule<T extends Service>(classOrModule: ServiceClass<T> | string) {
        let name = Macro.UNKNOWN;
        if (typeof classOrModule == "string") {
            name = classOrModule;
        } else {
            name = classOrModule.module;
        }
        return name;
    }

    onDestroy() {
        //場景被銷燬，清除掉所有連線
        this.clear();
    }

    update() {
        this.services.forEach((service) => {
            if (service) {
                service.handMessage();
            }
        });
    }

    close() {
        this.services.forEach((service) => {
            if (service) {
                service.close();
            }
        });
    }

    onLoad() {

    }

    onError(ev: Event, service: Service) {
        Log.d(`${service.module} 網路錯誤!!!`);
        //連線錯誤，如果有重連元件，且為允許重連情況下，放入到重連佇列中
        if (!this.isWaiReconnect(service) && service.reconnectHandler && service.reconnectHandler.enabled) {
            //在等級重連佇列中
            this.waitReconnect.push(service);
        }
        this.sortWait();
        //如果有正常連線的，直接返回
        if (this.curReconnect) {
            if (this.curReconnect == service && service.reconnectHandler && service.reconnectHandler.enabled) {
                service.reconnectHandler.onError(ev);
            }
            return;
        }
        //如果當前沒有正在重連的，取出第一個進入重連
        while (this.waitReconnect.length > 0) {
            if (!this.curReconnect) {
                this.curReconnect = this.waitReconnect.shift();
                if (this.curReconnect && this.curReconnect.reconnectHandler && this.curReconnect.enabled) {
                    this.curReconnect.reconnectHandler.onError(ev);
                    break;
                }
                //該連線物件不滿足重連條件，繼續找下一個
                this.curReconnect = undefined;
            }
        }
    }

    onClose(ev: Event, service: Service) {
        if (ev.type == Macro.ON_CUSTOM_CLOSE) {
            Log.d(`${service.module} 應用層主動關閉Socket`);
            return;
        }
        Log.d(`${service.module} 網路關閉!!!`);
        if (!this.isWaiReconnect(service) && service.reconnectHandler && service.reconnectHandler.enabled) {
            this.waitReconnect.push(service);
        }
        this.sortWait();
        //如果有正常連線的，直接返回
        if (this.curReconnect) {
            if (this.curReconnect == service && service.reconnectHandler && service.reconnectHandler.enabled) {
                service.reconnectHandler.onClose(ev);
            }
            return;
        }
        //如果當前沒有正在重連的，取出第一個進入重連
        while (this.waitReconnect.length > 0) {
            if (!this.curReconnect) {
                this.curReconnect = this.waitReconnect.shift();
                if (this.curReconnect && this.curReconnect.reconnectHandler && this.curReconnect.enabled) {
                    this.curReconnect.reconnectHandler.onClose(ev);
                    break;
                }
                //該連線物件不滿足重連條件，繼續找下一個
                this.curReconnect = undefined;
            }
        }
    }

    onOpen(ev: Event, service: Service) {
        //連線成功，從重連佇列中移除
        let isFind = false;
        for (let i = 0; i < this.waitReconnect.length; i++) {
            if (this.waitReconnect[i] == service) {
                if (service.reconnectHandler) {
                    service.reconnectHandler.onOpen(ev);
                }
                isFind = true;
                this.waitReconnect.splice(i, 1);
                break;
            }
        }
        if (!isFind && service && service.reconnectHandler && service.reconnectHandler.enabled) {
            service.reconnectHandler.onOpen(ev);
        }

        Log.d(`${service.module}重連成功...`);

        //每次只連線一個，這裡面直接把當前重連的賦值為undefined就可以了
        this.curReconnect = undefined;

        //如果當前沒有正在重連的，取出第一個進入重連
        while (this.waitReconnect.length > 0) {
            if (!this.curReconnect) {
                this.curReconnect = this.waitReconnect.shift();
                if (this.curReconnect && this.curReconnect.reconnectHandler && this.curReconnect.enabled) {
                    this.curReconnect.reconnectHandler.reconnect();
                    Log.d(`${this.curReconnect.module}進入重連...`);
                    break;
                }
                //該連線物件不滿足重連條件，繼續找下一個
                this.curReconnect = undefined;
            }
        }
        if (!this.curReconnect) {
            App.uiReconnect.hide();
        }
    }

    onEnterBackground(): void {
        this.services.forEach((service) => {
            service.onEnterBackground();
        });
    }

    onEnterForgeground(inBackgroundTime: number): void {
        this.services.forEach((service) => {
            service.onEnterForgeground(inBackgroundTime);
        });
    }

    /**@description 網路心跳超時 */
    reconnect(service: Service) {
        if (!this.isWaiReconnect(service) && service.reconnectHandler && service.reconnectHandler.enabled) {
            this.waitReconnect.push(service);
        }
        this.sortWait();
        //如果當前有正在連線的，直接返回
        if (this.curReconnect) {
            if (this.waitReconnect.length > 1) {
                if (this.waitReconnect[0] != this.curReconnect) {
                    //最佳化級低的正在連線中
                    if (this.curReconnect.reconnectHandler && this.curReconnect.reconnectHandler.enabled && this.curReconnect.reconnectHandler.isConnecting) {
                        Log.w(`優先順序低的網路正常連線中 : ${this.curReconnect.module},正在連線中，將不會按照優先順序進行重連`);
                        return;
                    } else {
                        //把當前的放入重連佇列重新排序
                        if (!this.isWaiReconnect(service) && service.reconnectHandler && service.reconnectHandler.enabled) {
                            this.waitReconnect.push();
                        }
                        this.sortWait();
                        Log.w(`當前網路:${this.curReconnect.module}不是優先順序最高的，將為您重新切換到優先順序高的網路進行重連!!!`);
                        this.curReconnect = undefined;

                        //如果當前沒有正在重連的，取出第一個進入重連
                        while (this.waitReconnect.length > 0) {
                            if (!this.curReconnect) {
                                this.curReconnect = this.waitReconnect.shift();
                                if (this.curReconnect && this.curReconnect.reconnectHandler && this.curReconnect.enabled) {
                                    Log.w(`已為您切換優先順序高的:${this.curReconnect.module}進行重連!!!`);
                                    this.curReconnect.reconnectHandler.reconnect();
                                    break;
                                }
                                //該連線物件不滿足重連條件，繼續找下一個
                                this.curReconnect = undefined;
                            }
                        }
                    }
                }
            }

            if (this.curReconnect == service && service.reconnectHandler && service.reconnectHandler.enabled) {
                service.reconnectHandler.reconnect();
            }
            return;
        }
        //如果當前沒有正在重連的，取出第一個進入重連
        while (this.waitReconnect.length > 0) {
            if (!this.curReconnect) {
                this.curReconnect = this.waitReconnect.shift();
                if (this.curReconnect && this.curReconnect.reconnectHandler && this.curReconnect.enabled) {
                    this.curReconnect.reconnectHandler.reconnect();
                    break;
                }
                //該連線物件不滿足重連條件，繼續找下一個
                this.curReconnect = undefined;
            }
        }
    }

    /**@description 返回最佳化級排序 */
    protected sortWait() {
        if (this.waitReconnect.length >= 1) {
            this.waitReconnect.sort((a, b) => {
                return b.priority - a.priority;
            });
        }
    }

    private getService(name: string): Service | null {
        for (let i = 0; i < this.services.length; i++) {
            if (this.services[i].module == name) {
                return this.services[i];
            }
        }
        return null;
    }

    private isWaiReconnect(service: Service) {
        if (this.waitReconnect.indexOf(service) != -1) {
            return true;
        }
        return false;
    }

    debug() {
        Log.d(`-----------網路管理器中相關網路資訊------------`);
        this.services.forEach((service) => {
            let content = `Module : ${service.module} , 進入後臺的最大允許時間 : ${service.maxEnterBackgroundTime} , 優先順序 : ${service.priority}`;
            Log.d(content);
            content = "重連資訊 : ";
            if (service.reconnectHandler) {
                content = `是否允許重連 : ${service.reconnectHandler.enabled}`;
            } else {
                content += "無重連Handler";
            }
            Log.d(content);
            content = `狀態資訊 , 是否允許連線網路 : ${service.enabled} 是否連線 : ${service.isConnected} 網路資料型別 : ${service.serviceType}`;
            Log.d(content);
        });
    }
}