import { Node, Asset, AssetManager, Prefab, Sprite, SpriteFrame, Texture2D, assetManager, resources, sp } from "cc";
import CpnRemoteSprite from "./CpnRemoteSprite";
import { genResKey, ResInfo } from "./ResInfo";
import CocosUtil from "../CocosUtil";
import CpnSpine from "./CpnSpine";
import { isEmpty, isNil } from "../../core/Globals";
import EventCenter from "../../core/event/EventCenter";
import PlatformUtil from "../../core/utils/PlatformUtil";


// 加载进度回调
export type ProcessCallback = (completedCount: number, totalCount: number, item: any) => void;
// 加载完成回调
export type CompletedCallback = (error: Error, resource: any | any[]) => void;


interface hv {
	h:string;
	v:string;
}

export default class LoadHelper {
	private static _orientationMap:{[key:string]:hv} = {};

	private static orientationUrl(info: ResInfo) : string {
		if(!info) { return null; }
		let res_key = genResKey(info);

		if(!this._orientationMap[res_key]) {
			let res_path = info.respath;
			this._orientationMap[res_key] = {
				h: res_path.replace("{0}", "landscape"),
				v: res_path.replace("{0}", "portrait"),
			}
		}
		
		if(PlatformUtil.isLandscape()) {
			return this._orientationMap[res_key].h;
		} else {
			return this._orientationMap[res_key].v;
		}
	}

	//-------------------------------------------------------------------------
	//-------------------------------------------------------------------------
	
	static getBundle(bundleName:string) : AssetManager.Bundle {
		if(isEmpty(bundleName)) { return resources; }
		return assetManager.getBundle(bundleName);
	}

	static loadBundle(bundleName:string, options: Record<string, any>, cb:(err: Error, bundle: AssetManager.Bundle)=>void) {
		let bun = this.getBundle(bundleName);
		if(bun) {
			if(cb) { cb(null, bun); }
			return;
		}

		console.log("======> load bundle begin ", bundleName);
		
		if(isNil(options)) {
			assetManager.loadBundle(bundleName, (err: Error, bundle: AssetManager.Bundle)=>{
				if(err) {
					console.warn("load bundle fial: ", bundleName, err);
				} else {
					console.log("======> load bundle end ", bundleName);
				}
				if(cb) { cb(err, bundle); }
			});
		} else {
			assetManager.loadBundle(bundleName, options, (err: Error, bundle: AssetManager.Bundle)=>{
				if(err) {
					console.warn("load bundle fial: ", bundleName, err);
				} else {
					console.log("======> load bundle end ", bundleName);
				}
				if(cb) { cb(err, bundle); }
			});
		}
	}

	static releaseBungle(bundleName:string) {
		if(bundleName===null || bundleName===undefined || bundleName=="" || bundleName === "resources") {
			return;
		}
		let bundle = assetManager.getBundle(bundleName);
        if (bundle) {
            bundle.releaseAll();
            assetManager.removeBundle(bundle);
			console.log("======> release bundle: ", bundleName);
        }
	}

	//-------------------------------------------------------------------------

	static getBundleRes(respath:string, type:typeof Asset, bundleName?:string) : any {
		let url = this.orientationUrl({respath:respath, bundleName:bundleName});
		if(isEmpty(url)){ return null; }
		let bubble = this.getBundle(bundleName);
		if(!bubble) { return null; }
		return bubble.get(url, type);
	}

	static getRes(info:ResInfo, type:typeof Asset) : any {
		let url = this.orientationUrl(info);
		if(isEmpty(url)){ return null; }
		let bubble = this.getBundle(info.bundleName);
		if(!bubble) { return null; }
		return bubble.get(url, type);
	}

	static loadRaw(url:string, cbComplete:CompletedCallback) {
		if(isEmpty(url)) {
			if(cbComplete) { cbComplete(new Error("url is invalid"), null); }
			return;
		}
		resources.load(url, cbComplete);
	}

	static loadRes(info:ResInfo, type:typeof Asset, cbComplete:CompletedCallback, cbProgress?: ProcessCallback){
		if(isNil(info)) {
			if(cbComplete) { cbComplete(new Error("info is invalid"), null); }
			return;
		}
		
		let url = this.orientationUrl(info);
		if(isEmpty(url)) {
			if(cbComplete) { cbComplete(new Error("url is invalid"), null); }
			return;
		}

		if(type == SpriteFrame) {
			url += "/spriteFrame";
		}

		this.loadBundle(info.bundleName, info.options, (err, bundle)=>{
			if(err) {
				if(cbComplete) cbComplete(err, null);
				return;
			}

			var rsc = bundle.get(url, type);
			if(rsc) {
				if(cbComplete) { cbComplete(null, rsc); }
				return;
			}

			if(cbComplete) {
				if(cbProgress) {
					bundle.load(url, type, cbProgress, (e,r)=>{
						cbComplete(e,r);
					});
				} else {
					bundle.load(url, type, (e,r)=>{
						cbComplete(e,r);
					});
				}
			}
		});
	}

	static loadResArray(bundleName:string, urls: string[], type: typeof Asset, cbProgress: ProcessCallback, cbComplete: CompletedCallback) {
		if(!urls || urls.length <= 0) {
			cbComplete(new Error("invalid urls",), null);
			return;
		}

		let tmps:string[] = [];
		for(let s of urls) {
			tmps.push(this.orientationUrl({respath:s, bundleName:bundleName}));
		}

		this.loadBundle(bundleName, null, (err, bundle)=>{
			if(err) { 
				cbComplete(err, null);
				return;
			}
			if(!cbProgress) {
				bundle.load(tmps, type, cbComplete);
			} else {
				bundle.load(tmps, type, cbProgress, cbComplete);
			}
		})
	}

	static loadPrefab(info:ResInfo, cbComplete:CompletedCallback, cbProgress?:ProcessCallback) {
		this.loadRes(info, Prefab, cbComplete, cbProgress);
	}

	static loadSpriteFrame(info:ResInfo, cbComplete:CompletedCallback) {
		this.loadRes(info, SpriteFrame, cbComplete);
	}

	static playSpineAni(nd:Node, respath:ResInfo, trackIndex:number, aniName:string, loopTimes:number, onPlayFinish:(sk:sp.Skeleton)=>void) {
		if(!nd) { return; }
		// let cpn = CocosUtil.initComponent(nd, CpnSpine);
		// cpn.loadSkeletonData(respath);
		// cpn.setAnimation(trackIndex, aniName, loopTimes, false, onPlayFinish);
		// return cpn;
	}

	//-------------------------------------------------------------------------

	//根据超链接下载网络图片
	private static _remoteTexCache:{[key:string]:Texture2D} = {};

	public static loadWebImg(nd:Node, url:string, fitStyle:number): void {
		if(isNil(nd) || isEmpty(url) || "http" !== url.substring(0, 4)) { return; }
		if(!nd.getComponent(Sprite)) { return; }

		let cpn = nd.getComponent(CpnRemoteSprite) || nd.addComponent(CpnRemoteSprite);
		let needReload = cpn.setRemoteSprite(url, fitStyle);
		
		if(!needReload) { 
			return; 
		}

		if(LoadHelper._remoteTexCache[url]) {
			EventCenter.getInstance().fire("remote_tex_loaded", url, LoadHelper._remoteTexCache[url]);
			return;
		}

		assetManager.loadRemote(url, function (err, tex:Texture2D) {
			if (err) {
				console.log('加载图片出错了' + err);
				EventCenter.getInstance().fire("remote_tex_loaded", url, null);
				return;
			}
			console.log("loaded web img: ", url);
			LoadHelper._remoteTexCache[url] = tex;
			EventCenter.getInstance().fire("remote_tex_loaded", url, tex);
		});
	}
	
}
