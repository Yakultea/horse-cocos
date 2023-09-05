import { Macro } from "../defines/Macros";

/**
 * @description 單例模板
 */
export class SingletonT<TYPE extends ISingleton> {
    protected _datas: Map<string, TYPE> = new Map();
    module: string = null!;
    /**
     * @description 獲取資料
     * @param typeOrkey 具體資料的實現型別或key
     * @param isCreate 
     */
    get<T extends TYPE>(typeOrkey: SingletonClass<T> | string, isCreate: boolean = true): T | null {
        let key = this.getKey(typeOrkey)
        if (key == Macro.UNKNOWN) {
            return null;
        }
        if (this._datas.has(key)) {
            return <T>(this._datas.get(key));
        }
        if (typeof typeOrkey != "string" && isCreate) {
            let data: T = null!;
            if (typeOrkey.instance) {
                data = typeOrkey.instance;
            } else {
                data = new typeOrkey();
            }
            data.module = typeOrkey.module;
            Log.d(`${data.module}初始化`);
            data.init && data.init();
            this._datas.set(typeOrkey.module, data);
            return data;
        }
        return null;
    }

    /**
     * @description 銷燬
     * @param typeOrkey 如果無引數時，則表示銷燬所有不常駐的單例
     */
    destory<T extends TYPE>(typeOrkey?: SingletonClass<T> | string) {
        if (typeOrkey) {
            let key = this.getKey(typeOrkey)
            if (this._datas.has(key)) {
                Log.d(`${key}銷燬`);
                let v = this._datas.get(key);
                if (v) {
                    v.destory && v.destory();
                }
                this._datas.delete(key);
                return true;
            }
            return false;
        } else {
            this._datas.forEach(v => {
                if (v.isResident) {
                    Log.d(`${v.module}為常駐單列，不做銷燬處理`);
                } else {
                    Log.d(`${v.module}銷燬`);
                    v.destory && v.destory();
                    this._datas.delete(v.module);
                }
            })
            return true;
        }
    }

    /**
     * @description 清空資料
     * @param exclude 排除項
     */
    clear<T extends TYPE>(exclude?: (SingletonClass<T> | string)[]) {
        if (exclude) {
            //需要排除指定資料型別
            this._datas.forEach((data, key) => {
                if (!this.isInExclude(data, exclude)) {
                    Log.d(`${data.module}清理`)
                    data.clear && data.clear();
                }
            });
        } else {
            this._datas.forEach((data, key) => {
                Log.d(`${data.module}清理`)
                data.clear && data.clear();
            });
        }
    }

    debug() {
        Log.d(`************************** ${this.module} 開始 **************************`);
        this._datas.forEach((data, key, source) => {
            if ( data.debug ){
                data.debug();
            }else{
                Log.d(`${data.module} : 未實現debug介面`);
            }
        });
        Log.d(`************************** ${this.module} 結束 **************************`);
    }

    /**
     * @description 判斷是滯在排除項中
     */
    protected isInExclude<T extends TYPE>(data: T, exclude?: (SingletonClass<T> | string)[]) {
        if (!exclude) return false;
        for (let i = 0; i < exclude.length; i++) {
            let key = this.getKey(exclude[i]);
            if (key == data.module) {
                return true;
            }
        }
        return false;
    }

    protected getKey<T extends TYPE>(data: SingletonClass<T> | string): string {
        let key = Macro.UNKNOWN;
        if (typeof data == "string") {
            key = data;
        } else {
            key = data.module;
        }
        return key;
    }
}