//---------------------------------
// 平台相关接口导出
//---------------------------------
import { isEmpty, isNil } from "../Globals";
import LocalCache from "../localcache/LocalCache";
import { director, game, macro, sys, view, Node, screen, size, Sprite, SpriteFrame } from "cc";
import logger from "../logger";
import KernelEvent from "../defines/KernelEvent";
import EventCenter from "../event/EventCenter";
import PlatformH5 from "./PlatfromH5";
import Adaptor from "../../compat/view/Adaptor";


export default class PlatformUtil {
	private static _curOrientation;
	private static externalPath = null;
	static MaxUploadSize = 30 * 1024 * 1024;

	static isNative() {
		return sys.isNative;
	}

	//退出APP
	public static exitApp() {
		director.end();
		game.end();
	}

	//打开浏览器并跳转到指定链接
	static openBrowser(url:string) {
		if(isEmpty(url)){ return; }
		sys.openURL(url);
	}

	//是否支持webp
	public static isSupportWebp() : boolean {
		return sys.capabilities.webp;
	}
	
	//获取设备ID
	public static getDeviceId() : string {
		return "622892525";
	}

	public static isPortrait() : boolean {
		return !this._curOrientation;
	}

	public static isLandscape() : boolean {
		return this._curOrientation;
	}

	public static getOrientation() : boolean {
		return PlatformUtil._curOrientation;
	}

	public static swapOrientation() {
		if(this.isLandscape()) {
			this.setOrientation(false);
		} else {
			this.setOrientation(true);
		}
		//SceneManager.force2Scene(SceneManager.curSceneName(), LoadingUIStyleEnum.spr_bg);
	}

	//手动设置横竖屏
	public static setOrientation(bLandscape:boolean, bSave:boolean = true) {
		logger.log("---change orientation", bLandscape);

		if(sys.isNative) {
			
		} else {

			let bChanged = PlatformUtil._curOrientation !== bLandscape;
			PlatformUtil._curOrientation = bLandscape;
			if(bSave) {
				LocalCache.getInstance("screen").write("orientation", bLandscape && 1 || 0);
			}

			if("Android" == sys.os || "iOS" == sys.os) {
				if (bLandscape) {
					view.setOrientation(macro.ORIENTATION_LANDSCAPE);
				} else {
					view.setOrientation(macro.ORIENTATION_PORTRAIT);
				}
			} else {
				let frameSize = view.getFrameSize();
				if (bLandscape) {
					view.setOrientation(macro.ORIENTATION_LANDSCAPE);
					if (frameSize.height > frameSize.width) {
						view.setFrameSize(frameSize.height, frameSize.width);
					}
				} else {
					view.setOrientation(macro.ORIENTATION_PORTRAIT);
					if (frameSize.width > frameSize.height) {
						view.setFrameSize(frameSize.height, frameSize.width);
					}
				}
			}

			Adaptor.onOrientation(bLandscape);
			if(bChanged) {
				EventCenter.getInstance().fire(KernelEvent.OrientationChanged);
			}
		}
	}

	//复制到粘贴板
	public static copy(content:string) {
		if(!sys.isNative) {
			PlatformH5.webCopyString(content);
			console.log("copy: ", content);
			return;
		}
	}

	//粘贴(获取粘贴板上的内容)
	public static paste() : string {
		return "";
	}
	
}
