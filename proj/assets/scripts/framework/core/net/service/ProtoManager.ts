import { sys, TextAsset } from "cc";
import { DEBUG } from "cc/env";
import { Resource } from "../../asset/Resource";
import { Net } from "../Net";
export class ProtoManager implements ISingleton{
    
    /**@description 記錄已經載入過的目錄，載入過的proto將不會重新載入 */
    private _loadDir : {[key : string] : boolean} = {};

    private _root: protobuf.Root = null!;
    constructor() {
        this._root = new protobuf.Root();
    }
    static module: string = "【Protobuf協議管理器】";
    module: string = null!;

    destory(){
        this.unload();
    }

    /**
     * @description 載入所有bundle.path下的所有proto描述檔案
     * @param bundle 所在 bundle
     * @param path 相對 bundle 的 path proto資原始檔目錄,預設為bundle/proto目錄
     * @returns 
     */
    load(bundle: string, path: string = "proto") {
        return new Promise<boolean>((resolove, reject) => {
            if( this._loadDir[`${bundle}/${path}`] ){
                if ( DEBUG ){
                    Log.w(this.module,`${bundle}/${path}目錄下所有proto檔案已經存在，無需載入`);
                }
                resolove(true);
                return;
            }
            this._loadDir[`${bundle}/${path}`] = false;
            App.asset.loadDir(bundle, path, TextAsset, (finish, total, item) => { }, (cacheData) => {
                if (cacheData && cacheData.data && Array.isArray(cacheData.data)) {

                    //解析proto檔案
                    for (let i = 0; i < cacheData.data.length; i++) {
                        let asset = cacheData.data[i] as TextAsset;
                        protobuf.parse(asset.text, this._root)
                    }

                    //釋放proto資原始檔
                    let info = new Resource.Info;
                    info.url = path;
                    info.type = TextAsset;
                    info.data = cacheData.data;
                    info.bundle = bundle;
                    App.asset.releaseAsset(info);
                    this._loadDir[`${bundle}/${path}`] = true;
                    resolove(true);
                } else {
                    resolove(false);
                }
            });
        });
    }

    /**@description 當進入登入介面，不需要網路配置時，解除安裝proto的型別，以防止後面有更新，原有的proto型別還儲存在記憶體中 */
    unload(){
        this._loadDir = {};
        this._root = new protobuf.Root();
    }

    /**
     * @description 查詢 proto型別
     * @param className 型別名
     */
    lookup(className: string) : (protobuf.ReflectionObject | null) {
        if (this._root) {
            return this._root.lookup(className);
        }
        return null;
    }

    decode<ProtoType>(config: Net.Proto.decodeConfig): ProtoType | null {
        let protoType = this.lookup(config.className) as protobuf.Type;
        if (protoType) {
            return protoType.decode(config.buffer) as any;
        }
        return null;
    }

    debug(){
        Log.d(`-------Proto檔案載入資訊,所有proto檔案都載入在同一個root下,檔案載入完成後，資原始檔就會初釋放-------`);
        if (sys.isNative) {
            Log.dump(this._loadDir);
        } else {
            Log.d(this._loadDir);
        }
    }
}
