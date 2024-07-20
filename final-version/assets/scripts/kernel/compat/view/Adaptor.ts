//-------------------------------------
//-- 屏幕适配
//-------------------------------------
import { ResolutionPolicy, sys, view, Node, Widget, screen, size, Camera, find, Size } from "cc";
import { UIManager } from "./UImanager";
import ScreenHelper from "./ScreenHelper";
import logger from "../../core/logger";
import { SHOT_SCREEN, LONG_SCREEN, DESIGN_SIZE } from "./ViewDefine";


export default class Adaptor {

	private static s_is_full_screen: boolean = false;

	//监听屏幕尺寸变化
	public static listenScreen() {
		console.log("操作系统: ", sys.os);

		screen.on("window-resize", () => {
			logger.log("......窗口事件 window-resize");
			// Adaptor.adaptScreen();
		});

		window.addEventListener("resize", () => {
			logger.log("......窗口事件 resize");
			ScreenHelper.hideCocosToolbar();
			// ScreenHelper.onWindowResize();
			Adaptor.adaptScreen();
		});

		ScreenHelper.hideCocosToolbar();
	}

	//监听到横竖屏切换时
	static onOrientation(bLandscape: boolean) {
		Adaptor.swapDesiginDefine(bLandscape);
		ScreenHelper.onWindowResize();
		Adaptor.adaptScreen();
		Adaptor.deepUpdateAlignment(UIManager.getUIRoot());
	}


	//全屏适配
	//调用时机：在监听到窗口大小变化时 + 场景onLoad时
	static isF: boolean = false;
	public static adaptScreen() {
		var fs = view.getFrameSize();
		console.log("fs", fs)

		let targetScale0 = 1.2
		let targetScale1 = 1.77
		let targetScale2 = 1.9
		// let minRatio = SHOT_SCREEN.height / SHOT_SCREEN.width;
		let maxRatio = DESIGN_SIZE.height / DESIGN_SIZE.width;
		
		// console.log("maxRatio", maxRatio)
		// console.log("minRatio", minRatio)
		var bb = window.innerHeight / window.innerWidth
		console.log("f1", bb)
		console.log("screenWid", window.innerWidth)
		console.log("screenHei", window.innerHeight)
		console.log("screenSize", window.innerHeight/window.innerWidth)
		let minWidth = 650
		let scale = targetScale1/bb
		console.log("scal",scale)
		if (bb <= targetScale1) {
			console.log("方案2")
			view.setFrameSize(window.innerWidth/scale, window.innerHeight)
		} else{
			console.log("方案3")
			if (window.innerWidth < minWidth) {
				view.setFrameSize(window.innerWidth, window.innerHeight)
			} else {
				view.setFrameSize(minWidth, window.innerHeight)
			}
			// view.setDesignResolutionSize(756, 1668, ResolutionPolicy.FIXED_WIDTH);
		}

	}

	private static adaptScreen1() {
		var fs = view.getFrameSize();
		var aa = DESIGN_SIZE.width / DESIGN_SIZE.height;
		var bb = fs.width / fs.height;

		if (aa === bb) {
			console.log("SHOW_ALL");
			view.setDesignResolutionSize(DESIGN_SIZE.width, DESIGN_SIZE.height, ResolutionPolicy.SHOW_ALL);
		}
		else if (aa > bb) {
			console.log("FIXED_WIDTH");
			view.setDesignResolutionSize(DESIGN_SIZE.width, DESIGN_SIZE.height * (fs.height / fs.width), ResolutionPolicy.FIXED_WIDTH);
		}
		else {
			console.log("FIXED_HEIGHT");
			view.setDesignResolutionSize(DESIGN_SIZE.width * bb, DESIGN_SIZE.height, ResolutionPolicy.FIXED_HEIGHT);
		}
	}

	//与adaptScreen是一样的
	private static adaptScreen2() {
		var fs = view.getFrameSize();
		var scaleX = fs.width / DESIGN_SIZE.width;
		var scaleY = fs.height / DESIGN_SIZE.height;
		var fitScale = Math.min(scaleX, scaleY);
		var width = Math.floor(fs.width / fitScale);
		var height = Math.floor(fs.height / fitScale);
		view.setDesignResolutionSize(width, height, ResolutionPolicy.SHOW_ALL);
	}


	//横竖屏切换时，调整设计尺寸
	private static swapDesiginDefine(bLandscape: boolean) {
		let bigger = Math.max(DESIGN_SIZE.width, DESIGN_SIZE.height);
		let smaller = Math.min(DESIGN_SIZE.width, DESIGN_SIZE.height);
		if (bLandscape) {
			DESIGN_SIZE.width = bigger;
			DESIGN_SIZE.height = smaller;
		} else {
			DESIGN_SIZE.width = smaller;
			DESIGN_SIZE.height = bigger;
		}
	}

	//即时更新widget
	public static deepUpdateAlignment(node: Node) {
		if (!node) { return; }
		let wgt = node.getComponent(Widget)
		if (wgt) {
			wgt.updateAlignment();
		}
		for (const child of node.children) {
			Adaptor.deepUpdateAlignment(child);
		}
	}


	//全屏
	public static isFullScreen(): boolean {
		return this.s_is_full_screen;
	}

	//全屏
	public static setFullScreen(bFull: boolean) {
		if (sys.isNative) { return; }
		if (bFull === Adaptor.s_is_full_screen) {
			return;
		}

		Adaptor.s_is_full_screen = bFull;

		if (bFull) {
			var de = document && document.documentElement;
			if (de) {
				if (de.requestFullscreen) {
					de.requestFullscreen();
				} else if (de["mozRequestFullScreen"]) {
					de["mozRequestFullScreen"]();
				} else if (de["webkitRequestFullScreen"]) {
					de["webkitRequestFullScreen"]();
				}
			}
		}
		else {
			var dc = document;
			if (dc) {
				if (dc.exitFullscreen) {
					dc.exitFullscreen();
				} else if (dc["mozCancelFullScreen"]) {
					dc["mozCancelFullScreen"]();
				} else if (dc["webkitCancelFullScreen"]) {
					dc["webkitCancelFullScreen"]();
				}
			}
		}
	}

}
