//-------------------------------------
//-- 计时器
//-------------------------------------
import { Component, macro } from "cc";
import TimerMgr from "./TimerMgr";
import CHandler from "../../core/datastruct/CHandler";


export default class TimerManager {
	private static s_inited:boolean = false;
	private static g_Timer:TimerMgr = new TimerMgr();
	
	private constructor() {
		//
	}

	static destroy() {
		TimerManager.s_inited = false;
		TimerManager.g_Timer.destroy();
	}

	static start(node:Component) {
		if(TimerManager.s_inited) { return; }
		TimerManager.s_inited = true;
		node.schedule(TimerManager.update, 0, macro.REPEAT_FOREVER);
	}

	private static update(dt:number) {
		TimerManager.g_Timer.update(dt);
	}

	static amend(millSec:number) {
		TimerManager.g_Timer.amend(millSec);
	}

	static loopFrame(interval:number, looptimes:number, callback:CHandler) : number {
		callback.neverFirst();
		return TimerManager.g_Timer.loopFrame(interval, looptimes, callback);
	}

	static delayFrame(delay:number, callback:CHandler) : number {
		callback.neverFirst();
		return TimerManager.loopFrame(delay, 1, callback);
	}

	static loopSecond(interval:number, looptimes:number, callback:CHandler, callOnAdd:boolean=false, useFix:boolean=false) : number {
		return TimerManager.g_Timer.loopSecond(interval, looptimes, callback, callOnAdd, useFix);
	}

	static delaySecond(delay:number, callback:CHandler, useFix:boolean = false) : number {
		callback.neverFirst();
		return TimerManager.g_Timer.delaySecond(delay, callback, useFix);
	}

	static isValid(id:number) : boolean {
		return TimerManager.g_Timer.isValid(id);
	}

	static delTimer(id:number) : number {
		return TimerManager.g_Timer.delTimer(id);
	}

	static removeByTarget(target:any) {
		TimerManager.g_Timer.removeByTarget(target);
	}

	//-----------------------------------------------------------------------

	static delTimerMap(tb:{[key:number]:number}) {
		if(!tb) { return; }
		let mgr = TimerManager;
		for(let k in tb) {
			tb[k] = mgr.delTimer(tb[k]);
		}
	}

	static delTimerArr(arr:number[], fixLen:boolean = false) {
		if(!arr) { return; }
		let mgr = TimerManager;
		for(let i=0; i<arr.length; i++) {
			arr[i] = mgr.delTimer(arr[i]);
		}
		if(fixLen) {
			arr.length = 0;
		}
	}

	static addToArr(arr:number[], t:number) {
		if(!arr || t===null || t===undefined || t<=0) { return; }
		let mgr = TimerManager;
		for(let i=0; i<arr.length; i++) {
			if(!mgr.isValid(arr[i])) {
				arr[i] = t;
				return;
			}
		}
		arr.push(t);
	}

}
