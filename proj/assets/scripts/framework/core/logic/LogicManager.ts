import { SingletonT } from "../../utils/SingletonT";
import { Logic } from "./Logic";

export class LogicManager extends SingletonT<Logic> implements ISingleton {
    static module: string = "【邏輯管理器】";
    module: string = null!;

    /**
     * @description 返回Logic
     * @param classOrBundle logic型別,如果傳入bundle,isCreate 無效
     * @param isCreate 找不到資料時，是否建立，預設為不建立
     */
    get<T extends Logic>(classOrBundle: ModuleClass<T> | string, isCreate: boolean = false): T | null {
        return super.get(classOrBundle,isCreate);
    }
}