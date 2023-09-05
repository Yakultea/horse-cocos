import { instantiate, isValid, Node } from "cc";
import { Macro } from "../../defines/Macros";

export class NodePool {
    name: string = Macro.UNKNOWN;
    private pool: Array<Node> = [];
    /**@description 用來克隆的節點 */
    private node: Node | null = null;
    /**
     * @description 用來克隆的節點，在get時，如果發現物件池中不存在，會直接用此節點進行克隆
     * 注意，設定的克隆物件會從父節點移除，但不會進行cleanup操作
     * 在clear時，對該克隆節點進行釋放操作
     * */
    public get cloneNode() {
        return this.node;
    }
    public set cloneNode(node: Node | null) {
        if (node && isValid(node)) {
            this.node = node;
            this.node.removeFromParent();
        }
    }


    constructor(name: string) {
        this.name = name;
    }

    /**@description 當前物件池資料大小 */
    get size() {
        return this.pool.length;
    }

    /**@description 銷燬物件池中快取的所有節點 */
    clear() {
        let count = this.pool.length;
        for (let i = 0; i < count; ++i) {
            this.pool[i].destroy();
        }
        this.pool = [];
        if (this.node && isValid(this.node)) {
            this.node.destroy();
        }
        this.node = null;
    }

    /**
     * @description 向緩衝池中存入一個不需要的節點物件
     * 這個函式會自動將目標節點從父節點移除，但不會進行 cleanup 操作
     * 
     */
    put(obj: Node) {
        if (obj && this.pool.indexOf(obj) === -1) {
            //從父節點移除，但不會對進入 cleanup 操作
            obj.removeFromParent();
            this.pool.push(obj);
        }
    }

    /**
     * @description 從物件池中取緩衝節點
     * */
    get() {
        if (this.pool.length <= 0) {
            if (this.node) {
                let node = instantiate(this.node);
                return node;
            }
            return null;
        }
        let last = this.pool.length - 1;
        let obj = this.pool[last];
        this.pool.length = last;
        return obj;
    }

}
/**
 * 物件池管理器
 */
export class NodePoolManager implements ISingleton {
    static module: string = "【物件池】";
    module: string = null!;
    private pools: Map<string, NodePool> = new Map();

    /**
     * @description 建立物件池
     * @param type 物件池型別
     */
    createPool(type: string) : NodePool | null{
        if (!this.pools.has(type)) {
            this.pools.set(type, new NodePool(type));
        }
        return this.pools.get(type) as NodePool;
    }

    /**
     * @description 刪除物件池 
     * @param type 物件池型別
     * */
    deletePool(type: string | NodePool | null) {
        if (typeof (type) == "string") {
            if (this.pools.has(type)) {
                let pool = this.pools.get(type);
                //清除物件池資料
                pool && pool.clear();
                //刪除物件池
                this.pools.delete(type);
            }
        } else if (type && type instanceof NodePool) {
            this.deletePool(type.name);
        }
    }

    /**
     * @description 獲取物件池
     * @param type 物件池型別 
     * @param isCreate 當找不到該物件池時，會預設建立一個物件池
     * */
    getPool(type: string, isCreate = true) {
        if (this.pools.has(type)) {
            return this.pools.get(type) as NodePool;
        } else {
            if (isCreate) {
                return this.createPool(type);
            } else {
                return null;
            }
        }
    }

    debug(){
        Log.d(`-------物件池節點快取資訊-------`);
        this.pools.forEach((data, key) => {
            Log.d(key);
        })
    }

}
