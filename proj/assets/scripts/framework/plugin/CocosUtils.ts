import { Asset, AssetManager, BUNDLE_TYPE, Component, instantiate, isValid, Sprite, SpriteFrame, Node, Button, ParticleSystem2D, ParticleAsset, Label, Font, sp, Prefab, dragonBones, sys } from "cc";
import { Resource } from "../core/asset/Resource";
import UIView from "../core/ui/UIView";
import { ButtonSpriteType } from "../defines/Enums";
import { Macro } from "../defines/Macros";

/**@description 新增載入本地的資源 */
export function addExtraLoadResource(view: UIView, info: Resource.Info) {
    let uiManager = App.uiManager;
    if (view == <any>(uiManager.retainMemory)) {
        uiManager.retainMemory.addLocal(info);
    }
    else if (view && view instanceof UIView) {
        uiManager.addLocal(info, view.className);
    } else {
        uiManager.garbage.addLocal(info);
    }
}

/**@description 新增載入遠端的資源 */
export function addRemoteLoadResource(view: UIView, info: Resource.Info) {
    let uiManager = App.uiManager;
    if (view == <any>(uiManager.retainMemory)) {
        uiManager.retainMemory.addRemote(info);
    }
    else if (view && view instanceof UIView) {
        uiManager.addRemote(info, view.className);
    } else {
        uiManager.garbage.addRemote(info);
    }
}

/**@description 獲取Bundle,如果沒有傳入，會預設指定當前View開啟時的bundle,否則批定resources */
export function getBundle(config: { bundle?: BUNDLE_TYPE, view?: UIView }) {
    let bundle: BUNDLE_TYPE = config.bundle as BUNDLE_TYPE;
    if (config.bundle == undefined || config.bundle == null) {
        bundle = Macro.BUNDLE_RESOURCES;
        if (config.view) {
            bundle = config.view.bundle;
        }
    }
    return bundle;
}

function isValidComponent(component: Component): boolean {
    if (isValid(component) && component.node && isValid(component.node)) {
        return true;
    }
    return false;
}

/**
 * @description 設定cc.Sprite元件精靈幀
 * @param {*} view 持有檢視
 * @param {*} url url
 * @param {*} sprite Sprite元件
 * @param {*} spriteFrame 新的精靈幀
 * @param {*} complete 完成回撥(data: cc.SpriteFrame) => void
 * @param {*} resourceType 資源型別 預設為ResourceType.Local
 * @param {*} retain 是否常駐記憶體 預設為false
 * @param {*} isAtlas 是否是大紋理圖集載入 預設為false
 */
export function setSpriteSpriteFrame(
    view: UIView,
    url: string,
    sprite: Sprite,
    spriteFrame: SpriteFrame,
    complete: (data: SpriteFrame | null) => void,
    bundle: BUNDLE_TYPE,
    resourceType: Resource.Type = Resource.Type.Local,
    retain: boolean = false,
    isAtlas: boolean = false) {

    if (!isAtlas) {
        //紋理只需要把紋理單獨新增引用，不需要把spirteFrame也新增引用
        let info = new Resource.Info;
        info.url = url;
        info.type = SpriteFrame;
        info.data = spriteFrame;
        info.retain = retain;
        info.bundle = bundle;
        if (resourceType == Resource.Type.Remote) {
            addRemoteLoadResource(view, info);
        } else {
            addExtraLoadResource(view, info);
        }
    }

    if (spriteFrame && isValidComponent(sprite)) {
        let oldSpriteFrame = sprite.spriteFrame;
        let replaceData = isValid(spriteFrame) ? spriteFrame : null;
        try {
            if (replaceData) sprite.spriteFrame = replaceData;
            if (complete) complete(replaceData);
        } catch (err) {
            let temp = isValid(oldSpriteFrame) ? oldSpriteFrame : null;
            sprite.spriteFrame = temp;
            if (complete) complete(null);
            //把資料放到全域性的垃圾回收中 //好像有點不行，
            Log.e(`${url} : ${err ? err : "replace spriteframe error"}`);
        }
    } else {
        //完成回撥
        if (complete && isValidComponent(sprite)) complete(spriteFrame);
    }
}

/**
 * @description 設定按鈕精靈幀
 * @param view 持有檢視
 * @param url url 
 * @param button 
 * @param spriteFrame 新的spriteFrame
 * @param memberName 替換成員變數名
 * @param complete 完成回撥
 * @param isAtlas 是否是從大紋理圖集中載入的
 */
function _setSpriteFrame(
    view: UIView,
    url: string,
    button: Button,
    spriteFrame: SpriteFrame,
    memberName: string,
    complete: (type: string, data: SpriteFrame | null) => void,
    isAtlas: boolean,
    bundle: BUNDLE_TYPE) {

    if (!isAtlas) {
        let info = new Resource.Info;
        info.url = url;
        info.type = SpriteFrame;
        info.data = spriteFrame;
        info.bundle = bundle;
        addExtraLoadResource(view, info);
    }

    if (spriteFrame && isValidComponent(button)) {
        let oldSpriteFrame: SpriteFrame = (<any>button)[memberName];
        try {
            let replaceData = isValid(spriteFrame) ? spriteFrame : null;
            if (replaceData) (<any>button)[memberName] = replaceData;
            if (complete) complete(memberName, replaceData);
        } catch (err) {
            let temp = isValid(oldSpriteFrame) ? oldSpriteFrame : null;
            (<any>button)[memberName] = temp;
            if (complete) complete(memberName, null);
            //把資料放到全域性的垃圾回收中 //好像有點不行，
            Log.e(`${url} : ${err ? err : "replace spriteframe error"}`);
        }
    } else {
        if (complete && isValidComponent(button)) complete(memberName, spriteFrame);
    }

};

/**
 * @description 設定按鈕精靈幀
 * @param button 按鈕元件 
 * @param memberName 成員變數名 
 * @param view 持有檢視
 * @param url url
 * @param spriteFrame 待替換的精靈幀 
 * @param complete 完成回撥
 * @param isAtlas 是否是從大紋理圖集中載入的 預設為false
 */
function _setButtonSpriteFrame(
    button: Button,
    memberName: ButtonSpriteType,
    view: UIView,
    url: string,
    spriteFrame: SpriteFrame,
    complete: (type: string, data: SpriteFrame | null) => void,
    bundle: BUNDLE_TYPE,
    isAtlas: boolean = false) {

    if (spriteFrame && isValidComponent(button)) {
        _setSpriteFrame(view, url, button, spriteFrame, memberName, complete, isAtlas, bundle);
    } else {
        //完成回撥
        if (complete && isValidComponent(button)) complete(memberName, spriteFrame);
    }
}

/**
 * @description 根據型別設定按鈕
 * @param button 
 * @param memberName 成員變數名
 * @param view 
 * @param url 
 * @param complete 
 */
function _setButtonWithType(
    button: Button,
    memberName: ButtonSpriteType,
    view: UIView,
    url: string | { urls: string[], key: string },
    complete?: (type: string, spriteFrame: SpriteFrame | null) => void,
    bundle?: BUNDLE_TYPE
) {
    if (url) {
        if (typeof url == "string") {
            url = url + "/spriteFrame";
            App.cache.getCacheByAsync(url, SpriteFrame, bundle as BUNDLE_TYPE).then((spriteFrame) => {
                _setButtonSpriteFrame(button, memberName, view, url as string, spriteFrame, complete as any, bundle as BUNDLE_TYPE);
            });
        } else {
            //在纹理图集中查找
            App.cache.getSpriteFrameByAsync(url.urls, url.key, view, addExtraLoadResource, bundle as BUNDLE_TYPE).then((data) => {
                if (data && data.isTryReload) {
                    //來到這裡面，程式已經崩潰，無意義在處理
                } else {
                    _setButtonSpriteFrame(button, memberName, view, data.url, data.spriteFrame as SpriteFrame, complete as any, bundle as BUNDLE_TYPE, true);
                }
            });
        }
    }
}

/**
 * @description 設定按鈕精靈
 * @param button 按鈕元件
 * @param config 配置資訊
 */
export function setButtonSpriteFrame(button: Button, config: {
    normalSprite?: string | { urls: string[], key: string },
    view: any,//UIView的子類
    pressedSprite?: string | { urls: string[], key: string },
    hoverSprite?: string | { urls: string[], key: string },
    disabledSprite?: string | { urls: string[], key: string },
    complete?: (type: string, spriteFrame: SpriteFrame | null) => void,
    bundle?: BUNDLE_TYPE
}) {
    let bundle = getBundle(config);
    _setButtonWithType(button, ButtonSpriteType.Norml, config.view, config.normalSprite as any, config.complete, bundle);
    _setButtonWithType(button, ButtonSpriteType.Pressed, config.view, config.pressedSprite as any, config.complete, bundle);
    _setButtonWithType(button, ButtonSpriteType.Hover, config.view, config.hoverSprite as any, config.complete, bundle);
    _setButtonWithType(button, ButtonSpriteType.Disable, config.view, config.disabledSprite as any, config.complete, bundle);
}

/**
 * @description 設定特效
 * @param component 特效元件
 * @param config 配置資訊
 * @param data 特效資料
 */
export function setParticleSystemFile(
    component: ParticleSystem2D,
    config: { url: string, view: any, complete?: (file: ParticleAsset | null) => void, bundle: BUNDLE_TYPE },
    data: ParticleAsset
) {
    let info = new Resource.Info;
    info.url = config.url;
    info.type = ParticleAsset;
    info.data = data;
    info.bundle = getBundle(config);
    addExtraLoadResource(config.view, info);
    if (data && isValidComponent(component)) {
        let oldFile = component.file;
        try {
            let replaceData = isValid(data) ? data : null;
            if (replaceData) component.file = replaceData;
            if (config.complete) config.complete(replaceData);
        } catch (err) {
            let temp = isValid(oldFile) ? oldFile : null;
            component.file = temp;
            if (config.complete) config.complete(null);
            //把資料放到全域性的垃圾回收中 //好像有點不行，
            Log.e(`${config.url} : ${err ? err : "replace file error"}`);
        }
    } else {
        //完成回撥
        if (config.complete && isValidComponent(component)) config.complete(data);
    }
}

/**
 * @description 設定字型
 * @param component 字型元件
 * @param config 配置資訊
 * @param data 字型資料
 */
export function setLabelFont(
    component: Label,
    config: { font: string, view: any, complete?: (font: Font | null) => void, bundle: BUNDLE_TYPE },
    data: Font) {
    let info = new Resource.Info;
    info.url = config.font;
    info.type = Font;
    info.data = data;
    info.bundle = getBundle(config);
    addExtraLoadResource(config.view, info);
    if (data && isValidComponent(component)) {
        let oldFont = component.font;
        try {
            let replaceData = isValid(data) ? data : null;
            if (replaceData) component.font = replaceData;
            if (config.complete) config.complete(replaceData);
        } catch (err) {
            let temp = isValid(oldFont) ? oldFont : null;
            component.font = temp;
            if (config.complete) config.complete(null);
            //把資料放到全域性的垃圾回收中 //好像有點不行，
            Log.e(`${config.font} : ${err ? err : "replace font error"}`);
        }
    } else {
        //完成回撥
        if (config.complete && isValidComponent(component)) config.complete(data);
    }
}

/**
 * @description 設定spine動畫資料
 * @param component spine元件
 * @param config 配置資訊
 * @param data 動畫資料
 */
export function setSkeletonSkeletonData(
    component: sp.Skeleton,
    config: { url: string, view: any, complete: (data: sp.SkeletonData | null) => void, bundle: BUNDLE_TYPE } |
    { view: any, path: string, name: string, complete: (data: sp.SkeletonData | null) => void, bundle: BUNDLE_TYPE, isNeedCache?: boolean, retain?: boolean },
    data: sp.SkeletonData,
    resourceType: Resource.Type = Resource.Type.Local) {
    let url = "";
    let retain = false;
    if (resourceType == Resource.Type.Remote) {
        let realConfig: { view: any, path: string, name: string, complete: (data: sp.SkeletonData | null) => void, isNeedCache?: boolean, retain?: boolean } = <any>config;
        url = `${realConfig.path}/${realConfig.name}`;
        retain = realConfig.retain ? true : false;
    } else {
        let realConfig: { url: string, view: any, complete: (data: sp.SkeletonData | null) => void } = <any>config;
        url = realConfig.url;
    }
    let info = new Resource.Info;
    info.url = url;
    info.type = sp.SkeletonData;
    info.data = data;
    info.retain = retain;
    info.bundle = getBundle(config);
    if (resourceType == Resource.Type.Remote) {
        info.bundle = Macro.BUNDLE_REMOTE;
        addRemoteLoadResource(config.view, info);
    } else {
        addExtraLoadResource(config.view, info);
    }
    if (data && isValidComponent(component)) {
        let oldSkeletonData = component.skeletonData;
        try {
            let replaceData = isValid(data) ? data : null;
            if (replaceData) component.skeletonData = replaceData;
            if (config.complete) config.complete(replaceData);
        } catch (err) {
            let temp = isValid(oldSkeletonData) ? oldSkeletonData : null;
            component.skeletonData = temp as sp.SkeletonData;
            if (config.complete) config.complete(null);
            //把資料放到全域性的垃圾回收中 //好像有點不行，
            Log.e(`${url} : ${err ? err : "replace skeletonData error"}`);
        }
    } else {
        //完成回撥
        if (config.complete && isValidComponent(component)) config.complete(data);
    }
}

/**
 * @description 透過預置體建立Node
 * @param config 配置資訊
 */
export function createNodeWithPrefab(config: { bundle: BUNDLE_TYPE, url: string, view: any, complete: (node: Node | null) => void }) {

    let url = config.url;
    let bundle = getBundle(config);
    let cache = App.cache.get(bundle, url);
    App.cache.getCacheByAsync(url, Prefab, bundle).then((data) => {
        if (!cache) {
            let info = new Resource.Info;
            info.url = config.url;
            info.type = Prefab;
            info.data = data;
            info.bundle = getBundle(config);
            addExtraLoadResource(config.view, info);
        }
        if (data && isValidComponent(config.view) && config.complete) {
            let node = instantiate(data);
            config.complete(node);
        } else if (isValidComponent(config.view) && config.complete) {
            config.complete(null);
        }
    });
}

export function _loadDirRes(config: {
    bundle?: BUNDLE_TYPE,
    url: string,
    type: typeof Asset,
    view: any,
    onProgress?: (finish: number, total: number, item: AssetManager.RequestItem) => void,
    onComplete: (data: Resource.CacheData) => void
}) {
    let bundle = getBundle(config);
    let cache = App.cache.get(bundle, config.url);
    //这里要做一个防止重复加载操作，以免对加载完成后的引用计数多加次数
    App.asset.loadDir(bundle, config.url, config.type, config.onProgress as any, (data) => {

        if (!cache) {
            //如果已經有了，可能是從logic中載入過來的，不在進行引用計數操作
            let info = new Resource.Info;
            info.url = config.url;
            info.type = config.type;
            info.data = data.data as any;
            info.bundle = bundle;
            addExtraLoadResource(config.view, info)
        }

        if (config.onComplete) {
            config.onComplete(data);
        }
    });
}

export function _loadRes(config: {
    bundle?: BUNDLE_TYPE,
    url: string,
    type: typeof Asset,
    onProgress?: (finish: number, total: number, item: AssetManager.RequestItem) => void,
    onComplete: (data: any) => void,
    view: any,
}) {
    let bundle = getBundle(config);
    let cache = App.cache.get(bundle, config.url);
    App.asset.load(
        bundle,
        config.url,
        config.type,
        config.onProgress as any,
        (data) => {
            if (!cache) {
                let info = new Resource.Info;
                info.url = config.url;
                info.type = config.type;
                info.data = data.data as any;
                info.bundle = bundle;
                addExtraLoadResource(config.view, info);
            }
            if (config.onComplete) {
                config.onComplete(data);
            }
        }
    )
}

export function loadDragonDisplay(comp: dragonBones.ArmatureDisplay, config: { assetUrl: string, atlasUrl: string, view: UIView, complete: (asset: dragonBones.DragonBonesAsset | null, atlas: dragonBones.DragonBonesAtlasAsset | null) => void, bundle?: BUNDLE_TYPE }) {
    let bundle = getBundle(config);
    App.cache.getCacheByAsync(config.assetUrl, dragonBones.DragonBonesAsset, bundle).then((asset) => {
        if (asset) {
            let info = new Resource.Info;
            info.url = config.assetUrl;
            info.type = dragonBones.DragonBonesAsset;
            info.data = asset;
            info.bundle = getBundle(config);
            addExtraLoadResource(config.view, info);
            App.cache.getCacheByAsync(config.atlasUrl, dragonBones.DragonBonesAtlasAsset, bundle).then((atlas) => {
                if (atlas) {
                    if (sys.isBrowser) {
                        let info = new Resource.Info;
                        info.url = config.atlasUrl;
                        info.type = dragonBones.DragonBonesAtlasAsset;
                        info.data = atlas;
                        info.bundle = getBundle(config);
                        addExtraLoadResource(config.view, info);
                    }

                    comp.dragonAsset = asset;
                    comp.dragonAtlasAsset = atlas;
                    if (config.complete) {
                        config.complete(asset, atlas);
                    }
                } else {
                    if (config.complete) {
                        config.complete(asset, null);
                    }
                }
            });
        } else {
            if (config.complete) {
                config.complete(null, null);
            }
        }
    });
}