import { Button, Font, Label, Node, ParticleAsset, ParticleSystem2D, Sprite, SpriteFrame, dragonBones, isValid, sp } from "cc";
import { EDITOR } from "cc/env";
import { CommonEvent } from "../../common/event/CommonEvent";
import { Resource } from "../core/asset/Resource";
import { Macro } from "../defines/Macros";
import {
    _loadDirRes, _loadRes,
    addExtraLoadResource,
    createNodeWithPrefab, getBundle,
    loadDragonDisplay,
    setButtonSpriteFrame,
    setLabelFont,
    setParticleSystemFile,
    setSkeletonSkeletonData,
    setSpriteSpriteFrame
} from "./CocosUtils";

/**@description 對cc.Node 擴充套件一個臨時儲存的使用者自定義資料 */
if (typeof Reflect == "object") {
    //在瀏覽器中已經有反射
    Reflect.defineProperty(Node.prototype, "userData", {
        value: null,
        writable: true,
    });
} else {
    Node.prototype.userData = null;
}

/**
 * @description 從網路載入圖片，推薦使用第二種方式
 * @param url 網路地址，如 : http://tools.itharbors.com/res/logo.png
 * @param complete 載入完成回撥
 * @param defaultSpriteFrame 載入圖片失敗後，使用的預設圖片,當傳入string時，會動態載入該預設圖片
 * @param isNeedCache 是否需要快取到本地,如果不需要，每次都會從網路拉取資源,預設都會快取到本地
 * @param config.retain 遠端載入的資源是否駐留在記憶體中,預設都不駐留記憶體
 * @example
 * 示例1：
 * let sprite = imageNode.getComponent(cc.Sprite);
 * sprite.loadRemoteImage({url :"http://tools.itharbors.com/res/logo.png", defaultSpriteFrame : HALL("textures/avatar_default_0.png"), view : this,complete : (data)=>{
 * 		if ( data ) { do something }
 * }});
 * 
 * 示例2:
 * let sprite = imageNode.getComponent(cc.Sprite);
 * sprite.loadRemoteImage({url :"http://tools.itharbors.com/res/logo.png", defaultSpriteFrame : HALL("textures/avatar_default_0.png"), view : this});
 * 
 * 示例3：
 * let sprite = imageNode.getComponent(cc.Sprite);
 * sprite.loadRemoteImage({url :"http://tools.itharbors.com/res/logo.png", view : this});
 * }
 */

//config : {url: string, view : any , complete?: (data: cc.SpriteFrame) => void, defaultSpriteFrame?: string , isNeedCache ?: boolean }
let prototype: any = Sprite.prototype;
prototype.loadRemoteImage = function (config: any) {
    let me = this;
    if (config.isNeedCache == undefined || config.isNeedCache == null) {
        config.isNeedCache = true;
    }
    let isRetain = false;
    if (config.retain) {
        isRetain = true;
    }
    let defaultBundle = getBundle({ bundle: config.defaultBundle, view: config.view })
    App.asset.remote.loadImage(config.url, config.isNeedCache).then((data) => {
        if (data) {
            setSpriteSpriteFrame(config.view, config.url, me, data, config.complete, Macro.BUNDLE_REMOTE, Resource.Type.Remote, isRetain);
        } else {
            if (config.defaultSpriteFrame) {
                if (typeof config.defaultSpriteFrame == "string") {
                    config.defaultSpriteFrame = config.defaultSpriteFrame + "/spriteFrame";
                    //动态加载了一张图片，把资源通知管理器
                    App.cache.getCacheByAsync(config.defaultSpriteFrame, SpriteFrame, defaultBundle).then((spriteFrame) => {
                        setSpriteSpriteFrame(config.view, config.defaultSpriteFrame, me, spriteFrame, config.complete, defaultBundle);
                    });
                }
            }
            if (config.complete && isValid(me)) config.complete(data);
        }
    });
};

/**
 * @description 載入本地圖片
 * @param url 圖片路徑 {urls:string[],key:string} urls 為紋理名如果有此紋理會打包成多張，此時需要傳入所有紋理的地址，key指紋理中名字
 * @param view 所屬檢視，UIView的子類
 * @param complete 完成回撥
 * @example
 * 示例1：
 * sprite.getComponent(cc.Sprite).loadImage({url:{urls:["plist/fish_30","plist/fish_30_1","plist/fish_30_2"],key:"fishMove_030_28"},view:this});
 * 示例2：
 * sprite.getComponent(cc.Sprite).loadImage({url:"hall/a",view:this});
 */
//loadImage( config : { url : string | {urls:string[],key:string} , view : any , complete?:(data : SpriteFrame)=>void});
prototype.loadImage = function (config: any) {

    let me = this;
    let view = config.view;
    let url = config.url;
    let complete = config.complete;
    let bundle = getBundle(config);
    if (typeof url == "string") {
        url = url + "/spriteFrame";
        App.cache.getCacheByAsync(url, SpriteFrame, bundle).then((spriteFrame) => {
            setSpriteSpriteFrame(view, url, me, spriteFrame, complete, bundle);
        });
    } else {
        //在纹理图集中查找
        App.cache.getSpriteFrameByAsync(url.urls, url.key, view, addExtraLoadResource, bundle).then((data) => {
            if (data && data.isTryReload) {
                //來到這裡面程式已經崩潰了，無意義在處理了
            } else {
                setSpriteSpriteFrame(view, data.url, me, data.spriteFrame as SpriteFrame, complete, bundle, Resource.Type.Local, false, true);
            }
        });
    }
}

/**
 * @description 擴充套件方法
 * @param remotePath 遠端資源路徑
 * @param name 遠端Spine檔名，不再字尾
 * @param complete 完成回撥
 * @param isNeedCache 是否需要快取到本地,如果不需要，每次都會從網路拉取資源,預設都會快取到本地
 * @param config.retain 遠端載入的資源是否駐留在記憶體中,預設都不駐留記憶體
 * @example
 * var skeleton = node.addComponent(sp.Skeleton);
 *
 * let path = "https://bc-test1.oss-cn-shenzhen.aliyuncs.com/image/action";
 * let name = "nnoh_v4";
 * skeleton.loadRemoteSkeleton({view : this , path : path, name : name, complete : (data:sp.SkeletonData)=>{
 *    if (data) {
 *        skeleton.animation = 'loop';
 *        skeleton.premultipliedAlpha = false;
 *    }
 * }});
 */

prototype = sp.Skeleton.prototype;
prototype.loadRemoteSkeleton = function (config: any) {
    let me = this;
    if (config.isNeedCache == undefined || config.isNeedCache == null) {
        config.isNeedCache = true;
    }
    App.asset.remote.loadSkeleton(config.path, config.name, config.isNeedCache).then((data) => {
        setSkeletonSkeletonData(me, config, data as sp.SkeletonData, Resource.Type.Remote);
    });
}

/**
 * @description 載入動畫
 * @example
 * action.loadSkeleton({url:"hall/vip/vipAction/vip_10",view:this,complete:(data)=>{
 *	if ( data ){
 *		action.animation = "loop";
 *		action.loop = true;
 *		action.premultipliedAlpha = false;
 *	}
 * }});
 */
prototype.loadSkeleton = function (config: any) {
    let me = this;
    let url = config.url;
    let bundle = getBundle(config);
    App.cache.getCacheByAsync(url, sp.SkeletonData, bundle).then((data) => {
        setSkeletonSkeletonData(me, config, data);
    });
}

/**
 * @description 載入按鈕
 * @example
 * let button = cc.find("button",this.node);
 * button.getComponent(cc.Button).loadButton({normalSprite : "hall/a",view:this});
 * button.getComponent(cc.Button).loadButton({normalSprite : "hall/b",pressedSprite : "hall/c",view:this});
 */
prototype = Button.prototype;
prototype.loadButton = function (config: any) {
    setButtonSpriteFrame(this, config);
}

/**
 * @description 載入龍骨動畫
 */
dragonBones.ArmatureDisplay.prototype.loadDisplay = function (config) {
    loadDragonDisplay(this, config);
}

/**
 * @description 載入特效檔案 view 為null時，載入之前不會釋
 * @example
 * let node = new cc.Node();
 * let par = node.addComponent(cc.ParticleSystem);
 * par.loadFile({url:GAME_RES( "res/action/DDZ_win_lizi" ),view:null});
 * this.node.addChild(node);
 */
prototype = ParticleSystem2D.prototype;
prototype.loadFile = function (config: any) {
    let me = this;
    let url = config.url;
    let bundle = getBundle(config);
    App.cache.getCacheByAsync(url, ParticleAsset, bundle).then((data) => {
        setParticleSystemFile(me, config, data);
    });
}

prototype = Label.prototype;
/**@description 強制label在當前幀進行繪製 */
prototype.forceDoLayout = function () {
    //2.2.0
    if (this._forceUpdateRenderData) {
        this._forceUpdateRenderData();
    }
    //2.2.0以下版本
    else if (this._updateRenderData) {
        this._updateRenderData(true);
    } else if (this.updateRenderData) {
        this.updateRenderData(true);
    }
}

/**
 * @description 載入字型
 * @example
 * let content = cc.find("content",this.node); 
 * content.getComponent(cc.Label).loadFont({font:roomPath + dfFont,view:this});
 */
prototype.loadFont = function (config: any) {
    let font = config.font;
    let me = this;
    let bundle = getBundle(config);
    App.cache.getCacheByAsync(font, Font, bundle).then((data) => {
        setLabelFont(me, config, data);
    });
}

/**@description 透過預置體路徑建立節點 
 * @param config 配置資訊
 * @param config.url 預置體路徑
 * @param config.view 預置檢視資源管理器，繼承自UIView
 * @param config.complete 建立完成回撥 
 * @example 
 * cc.createPrefab({url :GAME_RES("res/animations/shzDealerCommon"),view:this,complete:(node)=>{
 *     if ( node ){
 *         // to do 
 *     }
 * }});
 */
window.createPrefab = function (config: any) {
    createNodeWithPrefab(config);
}

/**
 * @description 擴充套件一個在介面中載入指定目錄的介面
 * @param config 配置資訊
 * @param config.url 資源路徑
 * @param config.view 資源持有者,繼承自UIView
 * @param config.onComplete 載入完成回撥 data為ResourceCacheData，用之前先判斷當前返回的data.data是否是陣列
 * @param config.onProgress 載入進度
 * @param config.bundle 可不填，預設為view指向的bundle
 * @param config.type 載入的資源型別
 * */
window.loadDirRes = function (config: any) {
    _loadDirRes(config)
}

/**
 * @description 擴充套件一個在介面載入指定資源介面
 * @param config 配置資訊
 * @param config.bundle 可不填，預設為view指向的bundle
 * @param config.url 資源路徑
 * @param config.type 載入的資源型別
 * @param config.onProgress 載入進度
 * @param config.onComplete 載入完成回撥 data為ResourceCacheData
 * @param config.view 資源持有者,繼承自UIView
 */
window.loadRes = function (config: any) {
    _loadRes(config);
}

let _cc = (<any>window)["cc"]
/**@description 臨時的替換方案，效率太底 */
_cc.updateZIndex = function (node: Node) {
    if (node.children.length > 1) {
        node.children.sort((a, b) => {
            return a.zIndex - b.zIndex;
        });
        node._updateSiblingIndex();
    }
}
/**@description 臨時的替換方案，效率太底 */
export function updateZIndex(node: Node) {
    _cc.updateZIndex(node);
}

Reflect.defineProperty(Node.prototype, "zIndex", {
    get: function () {
        let self: any = this;
        if (typeof self._zIndex == "number") {
            return self._zIndex;
        }
        else {
            self._zIndex = 0;
            return self._zIndex;
        }
    },
    set: function (v) {
        let self: any = this;
        self._zIndex = v;
    }
});

export function CocosExtentionInit() {
    if (!EDITOR) {
        Log.d("Cocos擴充套件初始化");
    }
}

window.restart = function () {
    dispatch(CommonEvent.RESTART_HORSE_GAME);
}