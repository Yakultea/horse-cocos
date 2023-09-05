/**
 * @description bundle管理器
 */

import { AssetManager, assetManager } from "cc";
import { Macro } from "../../defines/Macros";
import { UpdateItem } from "../update/UpdateItem";

export class BundleManager implements ISingleton{
   static module: string = "【Bundle管理器】";
   module: string = null!;
   isEngineBundle(key: string) {
      if (key == AssetManager.BuiltinBundleName.MAIN ||
         key == AssetManager.BuiltinBundleName.RESOURCES || 
         key == AssetManager.BuiltinBundleName.START_SCENE ||
         key == AssetManager.BuiltinBundleName.INTERNAL ) {
         return true;
      }
      return false;
   }

   /**@description 刪除已經載入的bundle */
   public removeLoadedBundle(excludeBundles: string[]) {
      let loaded: string[] = [];
      assetManager.bundles.forEach((bundle, key) => {
         //引擎內建包不能刪除
         if (!this.isEngineBundle(key)) {
            loaded.push(key);
         }
      });
      let i = loaded.length;
      while (i--) {
         let bundle = loaded[i];
         if (excludeBundles.indexOf(bundle) == -1) {
            //在排除bundle中找不到，直接删除
            if ( !App.releaseManger.isExistBunble(bundle) ){
               App.entryManager.onUnloadBundle(bundle);
            }
            
            let result = this.getBundle(bundle);
            if (result) {
               App.cache.removeBundle(bundle);
               App.releaseManger.removeBundle(result);
            }
         }
      }
   }

   /**
    * @description 獲取Bundle
    * @param bundle Bundle名|Bundle
    **/
   public getBundle(bundle: BUNDLE_TYPE) {
      if (bundle) {
         if (typeof bundle == "string") {
            return assetManager.getBundle(bundle);
         }
         return bundle;
      }
      return null;
   }

   public getBundleName(bundle: BUNDLE_TYPE): string {
      if (bundle) {
         if (typeof bundle == "string") {
            return bundle;
         } else {
            return bundle.name;
         }
      }
      Log.e(`輸入引數錯誤 : ${bundle}`);
      return Macro.UNKNOWN;
   }

   /**
    * 外部介面 進入Bundle
    * @param config 配置
    */
   public enterBundle(config: UpdateItem | null) {
      if ( config ){
         App.updateManager.dowonLoad(config);
      }else{
         Log.e(`無效的入口資訊`);
      }
   }

   public loadBundle(item:UpdateItem) {
      let bundle = this.getBundle(item.bundle);
      if (bundle) {
         Log.d(`${item.bundle}已经加载在缓存中，直接使用`);
         App.releaseManger.onLoadBundle(item.bundle);
         item.handler.onLoadBundleComplete(item);
         return;
      }
      item.handler.onStartLoadBundle(item);
      Log.d(`loadBundle : ${item.bundle}`);
      this._loadBundle(item.bundle, (err, bundle) => {
         if (err) {
            Log.e(`load bundle : ${item.bundle} fail !!!`);
            item.handler.onLoadBundleError(item,err);
         } else {
            App.releaseManger.onLoadBundle(item.bundle);
            Log.d(`load bundle : ${item.bundle} success !!!`);
            item.handler.onLoadBundleComplete(item);
         }
      });
   }

   public _loadBundle(bundle:BUNDLE_TYPE,onComplete: (err: Error, bundle: AssetManager.Bundle) => void){
      assetManager.loadBundle(bundle as string,onComplete);
   }

   debug(){
      Log.d(`-------Bundle管理器狀態資訊-------`);
      let loaded: string[] = [];
      assetManager.bundles.forEach((bundle, key) => {
            loaded.push(bundle.name);
      });
      Log.d(`當前所有載入完成的bundle : ${loaded.toString()}`);
   }
}
