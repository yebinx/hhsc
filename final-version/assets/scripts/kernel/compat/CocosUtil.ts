import { BlockInputEvents, Button, Component, Label, Node, Prefab, RichText, Size, Sprite, TweenEasing, UIOpacity, UITransform, Vec2, Vec3, bezier, color, find, game, instantiate, isValid, size, tween, v2, v3 } from "cc";
import { isNil } from "../core/Globals";
import CHandler from "../core/datastruct/CHandler";
import KernelEvent from "../core/defines/KernelEvent";
import EventCenter from "../core/event/EventCenter";
import logger from "../core/logger";
import TimerManager from "./timer/TimerManager";
import { AudioManager } from "./audio/AudioManager";
import { BlockComp } from "./view/BlockComp";
import { BaseEvent } from "../core/event/BaseEvent";


export default class CocosUtil {
	private static tmr_click = 0;

	//getComponent<T extends Component>(type: {prototype: T}): T
	public static initComponent<T extends Component>(node: Node, comp: { new(): T }): T {
		if (node.getComponent(comp)) {
			return node.getComponent(comp);
		}
		return node.addComponent(comp);
	}

	static wait(time) {
		return new Promise(res => {
			setTimeout(() => {
				res(null)
			}, time * 1000);
		})
	}

	static restartGame() {
		EventCenter.getInstance().fire(KernelEvent.Restart);
		TimerManager.removeByTarget(CocosUtil);
		this.tmr_click = 0;
		game.restart();
	}

	static isValid(obj: any) {
		return obj && isValid(obj);
	}

	static isInValid(obj: any) {
		return !(obj && isValid(obj));
	}

	//-------------------------------------------------------------------------------

	//遍历root节点，将挂在它身上的所有子层次节点根据名字索引到tbl表中
	public static traverseNodes(root: Node, tbl: { [key: string]: Node }) {
		if (!root || !root.children) { return; }
		var childlist = root.children;
		for (var i = 0; i < childlist.length; i++) {
			tbl[childlist[i].name] = childlist[i];
			CocosUtil.traverseNodes(childlist[i], tbl)
		}
	}

	public static traverseLabels(root: Node, tbl: { [key: string]: Label }) {
		if (!root) { return; }
		var comps = root.getComponentsInChildren(Label);
		for (var i in comps) {
			tbl[comps[i].node.name] = comps[i];
		}
	}

	public static findNode(root: Node, name: string): Node {
		if (!root) { return null; }
		if (root.name == name) { return root; }
		var childlist = root.children;
		for (var i = childlist.length - 1; i >= 0; i--) {
			let nd = CocosUtil.findNode(childlist[i], name);
			if (nd) { return nd; }
		}
		return null;
	}

	//-------------------------------------------------------------------------------

	//将obj节点设置为模态对话框
	public static setModal(obj: Node, bCloseWhenClickMask: boolean) {
		if (obj.getComponent(BlockInputEvents)) { return; }
		CocosUtil.initComponent(obj, BlockComp).closeWhenClick = bCloseWhenClickMask;
	}

	private static mark_click() { this.tmr_click = 0; }

	//点击事件
	public static addClickEvent(target: Node, callback: Function, thisObj?: any, arg?: any, zoomScale: number = 1.02) {
		if (isNil(target)) {
			logger.warn("fail addClickEvent as target is nil");
			return;
		}

		let btn = target.getComponent(Button);
		if (!btn) {
			//	logger.log("add cc.Button : ", target.name);
			btn = target.addComponent(Button);
			btn.transition = Button.Transition.SCALE;
			btn.duration = 0.06;
			btn.zoomScale = zoomScale;
		} else {
			if (btn.transition == Button.Transition.SCALE) {
				btn.zoomScale = zoomScale;
				btn.duration = 0.06;
			}
		}

		var cb = function () {
			if (TimerManager.isValid(CocosUtil.tmr_click)) {
				logger.log("频繁点击");
				return;
			}
			CocosUtil.tmr_click = TimerManager.delaySecond(0.1, new CHandler(CocosUtil, CocosUtil.mark_click));
			if (!btn.interactable) {
				return
			}
			if (arg !== null && arg !== undefined) {
				callback.call(thisObj, arg);
			} else {
				callback.call(thisObj);
			}
		}
		target.off(Node.EventType.TOUCH_END, cb, thisObj);
		target.on(Node.EventType.TOUCH_END, cb, thisObj);
	}

	//移除节点上到点击事件
	public static delClickEvent(target: Node, callback: Function, thisObj?: any) {
		target.off(Node.EventType.TOUCH_END, callback, thisObj);
	}



	public static getRichWidth(rich: RichText): number {
		if (!rich) { return 0; }
		//@ts-ignore
		var lineswid = rich._linesWidth;
		var maxW = 0;
		if (lineswid) {
			for (var i = 0, len = lineswid.length; i < len; i++) {
				if (lineswid[i] > maxW) {
					maxW = lineswid[i];
				}
			}
		}
		return maxW;
	}

	public static getTemplateSize(template: Prefab): Size {
		if (!template) {
			return null;
		}
		let sz = size(0, 0);

		if (template instanceof Prefab && template.data) {
			sz.width = template.data.getComponent(UITransform).width;
			sz.height = template.data.getComponent(UITransform).height;
		} else {
			var nd = instantiate(template);
			sz.width = nd.getComponent(UITransform).contentSize.width;
			sz.height = nd.getComponent(UITransform).contentSize.height;
			nd.destroy();
		}
		return sz;
	}

	//坐标空间转换（原点为锚点）
	//返回srcObj在dstObj坐标空间的位置
	public static convertSpaceAR(srcObj: Node, dstObj: Node, x: number = 0, y: number = 0): Vec3 {
		var pt = srcObj.getComponent(UITransform).convertToWorldSpaceAR(v3(x, y));
		return dstObj.getComponent(UITransform).convertToNodeSpaceAR(pt);
	}

	public static setNodeOpacity(target: Node, alpha: number) {
		if (!target) { return; }
		let comp = target.getComponent(Sprite);
		if (comp) {
			comp.color = color(comp.color.r, comp.color.g, comp.color.b, alpha);
		}
		let lab = target.getComponent(Label);
		if (lab) {
			lab.color = color(lab.color.r, lab.color.g, lab.color.b, alpha);
		}
		for (let child of target.children) {
			this.setNodeOpacity(child, alpha);
		}
	}

	static getNodeOpacity(target: Node): number {
		if (!target) { return 0; }
		let comp = target.getComponent(Sprite);
		if (comp) {
			return comp.color.a;
		}
		let lab = target.getComponent(Label);
		if (lab) {
			return lab.color.a;
		}
	}

	static playTween(fruit: Node, playTime: number, startPos: Vec3, midPos: Vec3, endPos: Vec3, callback:Function, easing: TweenEasing | ((k: number) => number)) {
		let ft = tween(startPos);

		const mixY = midPos.y;
		const maxY = endPos.y;
		const mixX = midPos.x;
		const maxX = endPos.x;
		let progressX = function (start: number, end: number, current: number, t: number) {
			current = bezier(start, mixX, maxX, end, t);
			return current;
		}
		let progressY = function (start: number, end: number, current: number, t: number) {
			current = bezier(start, mixY, maxY, end, t);
			return current;
		}

		ft.parallel(
			tween().to(playTime, { x: endPos.x }, {
				progress: progressX, easing: easing, onUpdate: (target, ratio) => {
					fruit.setPosition(startPos);
				}
			}),
			tween().to(playTime, { y: endPos.y }, {
				progress: progressY, easing: easing, onUpdate: (target, ratio) => {
					fruit.setPosition(startPos);
				}
			})
		).call(() => {
			callback && callback()
		})
			.start();
	}

}
