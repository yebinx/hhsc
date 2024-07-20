//---------------------------------
// 将过程组织成树形结构，自根往叶播放
//---------------------------------

import TimerManager from "../../compat/timer/TimerManager";
import { BEHAVIOR_STATE } from "../defines/KernelDefine";
import logger from "../logger";
import CHandler from "./CHandler";


export default class Procedure {
	protected _name:string = "unknown";

	private _cur_state:BEHAVIOR_STATE = BEHAVIOR_STATE.READY;
	protected _auto_clean:boolean = false;

	protected _procFunc:CHandler = null;
	protected _stopFunc:CHandler = null;
	protected _paramData:any = null;

	protected _nextNode:Procedure = null;
	protected _groupNode:Procedure = null;
	protected _partList:Array<Procedure> = null;
	
	protected _tmrduration:number = 0;
	protected _duration:number = null;


	static removeDeadNodes(proce:Procedure, bRecreate:boolean) : Procedure {
		if(proce) {
			if(proce.isDone()) {
				if(bRecreate) {
					proce = new Procedure(null);
				} else {
					proce = null;
				}
			} else {
				while(proce.isSelfDone() && proce.isPartsDone()) {
					if(proce._nextNode) {
						proce = proce._nextNode;
					} else {
						break;
					}
				}
			}
		} else {
			if(bRecreate) {
				proce = new Procedure(null);
			} else {
				proce = null;
			}
		}
		return proce;
	}

	constructor(param?:any, name?:string) {
		this._paramData = param;
		if(name !== undefined && name !== null && name !== "") {
			this._name = name;
		}
	}

	public setName(name:string) : Procedure {
		this._name = name;
		return this;
	}

	public setParamData(data:any) : Procedure {
		this._paramData = data;
		return this;
	}

	public setStopFunc(stop_func:CHandler) : Procedure {
		this._stopFunc = stop_func;
		return this;
	}

	public setProcFunc(proc_func:CHandler) : Procedure {
		this._procFunc = proc_func;
		return this;
	}

	public addPart(part:Procedure) : Procedure {
		part._groupNode = this;
		if(!this._partList) { this._partList = []; }
		this._partList.push(part);
		return part;
	}

	public addPartCaller(procFunc:CHandler, stopFunc:CHandler=null) : Procedure {
		var part = new Procedure(null);
		part.setProcFunc(procFunc);
		part.setStopFunc(stopFunc);
		return this.addPart(part);
	}

	public then(nextNode:Procedure) : Procedure {
		var last = this.getLast();
		last._nextNode = nextNode;
		nextNode._groupNode = last._groupNode;
		return nextNode;
	}

	public thenCaller(procFunc:CHandler, stopFunc:CHandler|null=null) : Procedure {
		var nextNode = new Procedure(null);
		nextNode.setProcFunc(procFunc);
		nextNode.setStopFunc(stopFunc);
		return this.then(nextNode);
	}


	protected fixedName() :string {
		if(this._groupNode) {
			return "[" + this._groupNode._name + "." + this._name + "]";
		} else {
			return "[null."+this._name+"]";
		}
	}

	public getParamData() : any {
		return this._paramData;
	}

	public getLast() : Procedure {
		var last:Procedure = this;
		while(last._nextNode) {
			last = last._nextNode;
		}
		return last;
	}

	public getNext() : Procedure {
		return this._nextNode;
	}

	//----------------------------------------------------------------------------
	//----------------------------------------------------------------------------

	private cleanSelf() {
		this._procFunc = null;
		this._stopFunc = null;
		this._paramData = null;
	}

	public clean() {
		this.cleanSelf();
		if(this._partList) {
			for(var i in this._partList) {
				this._partList[i].clean();
			}
		}
		if(this._nextNode) { 
			this._nextNode.clean(); 
		}
	}

	protected setCurState(st:BEHAVIOR_STATE) {
		this._cur_state = st;

		switch (st) {
			case BEHAVIOR_STATE.READY:
				logger.orange("ready", this.fixedName());
				break;
			case BEHAVIOR_STATE.RUNNING:
				logger.orange("runing", this.fixedName());
				break;
			case BEHAVIOR_STATE.STOPED:
				logger.orange("stoped", this.fixedName());
				break;
			case BEHAVIOR_STATE.SUCC:
				logger.orange("succ", this.fixedName());
				break;
			case BEHAVIOR_STATE.FAIL:
				logger.orange("fail", this.fixedName());
				break;
			default:
				logger.warn("error", this.fixedName());
				break;
		}
	}

	public setDuration(duration:number) : Procedure {
		if(duration < 0) { 
			logger.error("duration must >= 0");
			duration = 0;
		}
		this._duration = duration;
		if(this._cur_state == BEHAVIOR_STATE.RUNNING) {
			if(this._duration <= 0) {
				this.setCurState(BEHAVIOR_STATE.SUCC);
			} else {
				this._tmrduration = TimerManager.delaySecond(this._duration, new CHandler(this, this.resolve_succ), false);
			}
		}
		return this;
	}

	private Proc() {
		if(this._procFunc) {
			this._procFunc.invodeWithFirst(this);

			if(this._auto_clean) {
				this.cleanSelf();
			}

			if(this._duration !==null && this._duration!==undefined) {
				if(this._duration <= 0) {
					this.setCurState(BEHAVIOR_STATE.SUCC);
				} else {
					if(!TimerManager.isValid(this._tmrduration)) {
						this._tmrduration = TimerManager.delaySecond(this._duration, new CHandler(this, this.resolve_succ), false);
					}
				}
			}
		} else {
			if(this._duration !== null && this._duration !== undefined) {
				if(this._duration <= 0) {
					this.setCurState(BEHAVIOR_STATE.SUCC);
				} else {
					if(!TimerManager.isValid(this._tmrduration)) {
						this._tmrduration = TimerManager.delaySecond(this._duration, new CHandler(this, this.resolve_succ), false);
					}
				}
			} else {
				this.setCurState(BEHAVIOR_STATE.SUCC);
			}
		}
	}

	public run() : BEHAVIOR_STATE {
		if(this._cur_state == BEHAVIOR_STATE.READY) {
			this.setCurState(BEHAVIOR_STATE.RUNNING);
			if(this._partList) {
				for(var i in this._partList) {
					this._partList[i].setCurState(BEHAVIOR_STATE.RUNNING);
				}
			}

			this.Proc();
			if(this._partList) {
				for(var i in this._partList) {
					this._partList[i].Proc();
				}
			}
		}

		return this.checkDone();
	}

	private resolve(rlt:BEHAVIOR_STATE) {
		this._tmrduration = TimerManager.delTimer(this._tmrduration);
		if(this.isSelfDone()) { return; }
		this.setCurState(rlt);
		this.checkDone();
	}

	public resolve_fail() {
		this.resolve(BEHAVIOR_STATE.FAIL);
	}

	public resolve_succ() {
		this.resolve(BEHAVIOR_STATE.SUCC);
	}

	private checkDone() : BEHAVIOR_STATE {
		var bSelfDone = this.isSelfDone();
		var bPartsDone = this.isPartsDone();

		if (bSelfDone && bPartsDone) {
			if(this._nextNode && !this._nextNode.isDone()) {
				this._nextNode._groupNode = this._groupNode;
				return this._nextNode.run();
			}

			if(this._groupNode){
				if(this._groupNode.isSelfDone()&&this._groupNode.isPartsDone()){
					logger.orange("group ", this._groupNode.fixedName(), "finished when", this.fixedName(), "finished");
					return this._groupNode.checkDone();
				} else {
					logger.orange(this.fixedName(), "finished  but ", this._groupNode.fixedName(), "is waiting parts");
					return this._groupNode.run();
				}
			}

			logger.orange(this.fixedName(), "执行完成，整个Procedure执行完成", this._cur_state);
			return this._cur_state;

		} else if(bSelfDone){
			logger.orange(this.fixedName(), "self done, pasts runnig");

		} else if(bPartsDone) {
			logger.orange(this.fixedName(), "self running, pasts done");

		}

		return BEHAVIOR_STATE.RUNNING;
	}

	protected onStop() {
		//
	}

	public stop() {
		this._tmrduration = TimerManager.delTimer(this._tmrduration);

		if( !this.isSelfDone() ) {
			this.setCurState(BEHAVIOR_STATE.STOPED);
			if(this._stopFunc){
				this._stopFunc.invodeWithFirst(this);
			}
			this.onStop();
		}

		if(this._auto_clean) {
			this.cleanSelf();
		}

		if(this._partList) {
			for(var i in this._partList) {
				this._partList[i].stop();
			}
		}
		
		if(this._nextNode) { 
			this._nextNode.stop(); 
		}
	}

	//待测试
	protected recover() {
		this.setCurState(BEHAVIOR_STATE.READY);

		if(this._partList) {
			for(var i in this._partList) {
				this._partList[i].recover();
			}
		}

		if(this._nextNode) { 
			this._nextNode.recover(); 
		}
	}


	public isSelfDone() : boolean {
		return this._cur_state > BEHAVIOR_STATE.RUNNING;
	}

	public isPartsDone() : boolean {
		if(this._partList) {
			for(var i in this._partList) {
				if(!this._partList[i].isDone()){
					return false;
				}
			}
		}
		return true;
	}
	
	public isDone() : boolean {
		if(!this.isSelfDone()) { return false; }
		if(!this.isPartsDone()) { return false; }
		if(this._nextNode) { 
			if(!this._nextNode.isDone()) { 
				return false; 
			} 
		}
		return true;
	}

	public getSelfResult() : BEHAVIOR_STATE {
		if(this._cur_state===BEHAVIOR_STATE.FAIL || this._cur_state===BEHAVIOR_STATE.STOPED){
			return BEHAVIOR_STATE.FAIL;
		} else {
			return this._cur_state;
		}
	}

	public getPartsResult() : BEHAVIOR_STATE {
		if(this._partList) {
			for(var i in this._partList) {
				if(!this._partList[i].isDone()){
					return this._partList[i]._cur_state;
				}
			}
		}
		return BEHAVIOR_STATE.SUCC;
	}

	public getResult() : BEHAVIOR_STATE {
		if(!this.isSelfDone()) { return this._cur_state; }
		if(!this.isPartsDone()) { return BEHAVIOR_STATE.RUNNING; }
		if(this._nextNode) { 
			if(!this._nextNode.isDone()) { 
				return BEHAVIOR_STATE.RUNNING; 
			} 
		}
		return BEHAVIOR_STATE.SUCC;
	}

	public isPlaying() : boolean {
		return this.getResult() == BEHAVIOR_STATE.RUNNING;
	}
	
}
