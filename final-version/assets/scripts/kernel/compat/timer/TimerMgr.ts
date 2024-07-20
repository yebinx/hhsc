//-------------------------------------
//-- 计时器
//-------------------------------------
import CHandler from "../../core/datastruct/CHandler";
import logger from "../../core/logger";
import { BaseTimer, TimerType } from "./BaseTimer";


export default class TimerMgr {
    private static autoId:number = 0;
	private s_updating:boolean = false;
	private willAment = false;
	private amentMillSec = 0;
    private _timers:BaseTimer[] = [];

	destroy() {
		this._timers = [];
		this.s_updating = false;
	}

    update(dt:number) {
		this.s_updating = true;
		for(var i=0, len=this._timers.length; i<len; i++) {
			let curTmr = this._timers[i];
			try{
				curTmr.tick(dt);
			} catch(err) {
				logger.error(i, err);
				curTmr.stop();
			}

			if(curTmr.isStoped()) {
				curTmr.stop();
				this._timers.splice(i, 1);
				i--;
				len--;
			}
		}
		this.s_updating = false;
		
		if(this.willAment) {
			this.amend(this.amentMillSec);
		}
	}

	amend(millSec:number) {
		if(!millSec || millSec < 100) {
			this.willAment = false;
			this.amentMillSec = 0;
			return;
		}
		if(this.s_updating) { 
			this.willAment = true;
			this.amentMillSec = millSec;
			return; 
		}

		this.willAment = false;
		this.amentMillSec = 0;

		let dt = 0.05;
		let total = millSec / 1000;
		this.s_updating = true;
		while(total > 0) {
			total -= dt;
			let hasFix = false;
			for(var i=0, len=this._timers.length; i<len; i++) {
				let curTmr = this._timers[i];
				try{
					if(curTmr.isUseFix()) {
						hasFix = true;
						curTmr.tick(dt);
					}
				} catch(err) {
					curTmr.stop();
					logger.log(err);
				}
	
				if(curTmr.isStoped()) {
					curTmr.stop();
					this._timers.splice(i, 1);
					i--;
					len--;
				}
			}
			if(!hasFix) {
				break;
			}
		}
		this.s_updating = false;
	}

	private getIndex(callback:CHandler) : number {
		var tmrlist = this._timers;
		for(var i=tmrlist.length-1; i>=0; i--) {
			if(tmrlist[i] && tmrlist[i].isSame(callback) && !tmrlist[i].isStoped()) {
				return i;
			}
		}
		return -1;
	}

	loopFrame(interval:number, looptimes:number, callback:CHandler) : number {
		var tmp = this.getIndex(callback);
		if(tmp >= 0) {
			logger.log("already exist this timer handler");
			return this._timers[tmp].getId();
		}
		TimerMgr.autoId++;
		let id = TimerMgr.autoId;
		var tmr = new BaseTimer;
	//	var tmr = this._pool.get();
		tmr.reset(TimerType.frame, id, interval, looptimes, callback, false, false);
		this._timers.push(tmr);
		return id;
	}

	delayFrame(delay:number, callback:CHandler) : number {
		return this.loopFrame(delay, 1, callback);
	}

	private loop(interval:number, looptimes:number, callback:CHandler, callOnAdd:boolean=false, useFix:boolean=false) : number {
		var tmp = this.getIndex(callback);
		if(tmp >= 0) {
			// logger.log("already exist this timer handler");
			return this._timers[tmp].getId();
		}
		TimerMgr.autoId++;
		let id = TimerMgr.autoId;
		var tmr = new BaseTimer;
	//	var tmr = this._pool.get();
		tmr.reset(TimerType.second, id, interval, looptimes, callback, callOnAdd, useFix);
		this._timers.push(tmr);
		return id;
	}

	loopSecond(interval:number, looptimes:number, callback:CHandler, callOnAdd:boolean=false, useFix:boolean=false) : number {
		return this.loop(interval, looptimes, callback, callOnAdd, useFix);
	}

	delaySecond(delay:number, callback:CHandler, useFix:boolean = false) : number {
		return this.loop(delay, 1, callback, false, useFix);
	}

	isValid(id:number) : boolean {
		if(id===null || id===undefined || id <= 0){ return false; }
		for(var i=this._timers.length-1; i>=0; i--) {
			if(this._timers[i] && this._timers[i].getId()===id) {
				return !this._timers[i].isStoped();
			}
		}
		return false;
	}

	delTimer(id:number) : number {
		if(id===null || id===undefined || id <= 0){ return -1; }
		for(var i=this._timers.length-1; i>=0; i--) {
			if(this._timers[i] && this._timers[i].getId()===id) {
				this._timers[i].stop();
				if(!this.s_updating) {
					//this._pool.put(mgr._timers[i]);
					this._timers.splice(i, 1);
				}
				break;
			}
		}
		return -1;
	}

	removeByTarget(target:any) {
		for(var i=this._timers.length-1; i>=0; i--) {
			if(this._timers[i] && this._timers[i].getTarget()===target) {
				this._timers[i].stop();
				if(!this.s_updating) {
					//this._pool.put(mgr._timers[i]);
					this._timers.splice(i, 1);
				}
			}
		}
	}

}

