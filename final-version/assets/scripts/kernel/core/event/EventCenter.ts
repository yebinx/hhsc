//---------------------------------
// 全局事件中心
//---------------------------------
import logger from "../logger";


interface EventItem {
	callBack : Function;
	target : any;
}


export default class EventCenter {
	private static _instance:EventCenter = null;
	private static _resInstance:EventCenter = null;
	private static _otherInstances:{[key:string]:EventCenter} = {};

	public static getInstance() : EventCenter {
		if(!EventCenter._instance){ EventCenter._instance = new EventCenter(); }
		return EventCenter._instance;
	}
	public static resInstance() : EventCenter {
		if(!EventCenter._resInstance){ EventCenter._resInstance = new EventCenter(); }
		return EventCenter._resInstance;
	}
	public static otherInstance(name:string) : EventCenter {
		if(!EventCenter._otherInstances[name]) {
			EventCenter._otherInstances[name] = new EventCenter();
		}
		return EventCenter._otherInstances[name];
	}
	
	public static untarget(thisObj:any) {
		EventCenter.getInstance().removeByTarget(thisObj);
		EventCenter.resInstance().removeByTarget(thisObj);
		for(let k in EventCenter._otherInstances) {
			EventCenter._otherInstances[k].removeByTarget(thisObj);
		}
	}

	//---------------------------------------------------------
	
	private _hooks:{[key:string|number]:EventItem} = {};
	private _events:{[key:string|number]:Array<EventItem>} = {};

	private _fireings:{[key:string|number]:boolean} = {};

	private getHook(evtName:string|number, cbFunc:Function, thisObj:any) : boolean {
		let hookObj = this._hooks[evtName];
		if(!hookObj) { return false; }
		return hookObj.callBack === cbFunc && hookObj.target === thisObj;
	}

	private getEvent(evtName:string|number, cbFunc:Function, thisObj:any) : number
	{
		var evtList = this._events[evtName];
		if(!evtList) { return -1; }

		for(let i=evtList.length-1; i>=0; i--) {
			let listener = evtList[i];
			if(listener.callBack === cbFunc && listener.target === thisObj) {
				return i;
			}
		}

		return -1;
	}

	private canAdd(evtName:string|number, cbFunc:Function, thisObj:any) : boolean {
		if(evtName===null || evtName===undefined || !cbFunc) {
			logger.error("hook error! event name or callback is null!", evtName, typeof evtName, typeof cbFunc);
			return false;
		}
		if(this.getEvent(evtName, cbFunc, thisObj) >= 0) {
			logger.warn("already registed this event: ", evtName);
			return false;
		}
		if(this.getHook(evtName, cbFunc, thisObj)) {
			logger.warn("already hooked this event: ", evtName);
			return false;
		}
		return true;
	}

	//监听事件
	public hook(evtName:string|number, cbFunc:Function, thisObj:any) {
		if(this.canAdd(evtName, cbFunc, thisObj)) {
			this._hooks[evtName] = { callBack : cbFunc, target : thisObj };
		}
	}

	//监听事件
	public listen(evtName:string|number, cbFunc:Function, thisObj:any, bCall:boolean=false)
	{
		if(!this.canAdd(evtName, cbFunc, thisObj)) {
			return;
		}

		var evtList = this._events[evtName];
		if(!evtList) {
			evtList = [];
			this._events[evtName] = evtList;
		}

		evtList.push({ callBack : cbFunc, target : thisObj });

		if(bCall) {
			cbFunc.call(thisObj);
		}
	}

	//移除监听
	public remove(evtName:string, cbFunc:Function, thisObj:any)
	{
		let evtList = this._events[evtName];
		if(evtList) {
			for(let i=evtList.length-1; i>=0; i--) {
				let listener = evtList[i];
				if(listener.callBack === cbFunc && listener.target === thisObj)
				{
					if(this._fireings[evtName]) {
						listener.callBack = null;
						listener.target = null;
						logger.log("==== delay del as fireing: ", evtName, i);
					} else {
						evtList.splice(i, 1);
					}
					break;
				}
			}
		}

		let hookObj = this._hooks[evtName];
		if(hookObj && hookObj.callBack === cbFunc && hookObj.target === thisObj) {
			this._hooks[evtName] = null;
			delete this._hooks[evtName];
		}
	}

	//移除监听
	public removeByTarget(thisObj:any)
	{
		for(let evtName in this._events) {
			let evtList = this._events[evtName];
			if(evtList) {
				for(let i=evtList.length-1; i>=0; i--) {
					let listener = evtList[i];
					if(listener.target === thisObj) {
						if(this._fireings[evtName]) {
							listener.callBack = null;
							listener.target = null;
							logger.log("==== delay del as fireing: ", evtName, i);
						} else {
							evtList.splice(i, 1);
						}
					}
				}
			}
		}

		for(let evtName in this._hooks) {
			let hookObj = this._hooks[evtName];
			if(hookObj && hookObj.target === thisObj) {
				this._hooks[evtName] = null;
			}
		}
	}

	//触发
	public fire(evtName:string|number, ...arglist:any[]) : void
	{
		if(arglist && arglist.length > 0) {
			this.onHasArgs(evtName, arglist);
		} else {
			this.onNoArgs(evtName);
		}
	}

	//触发
	public trigerOnce(evtName:string|number, ...arglist:any[]) : void
	{
		this.fire(evtName, arglist);

		if(this._hooks[evtName]) {
			this._hooks[evtName] = null;
			delete this._hooks[evtName];
		}
		
		if(this._events[evtName]) {
			this._events[evtName].length = 0;
		}
	}

	private onNoArgs(evtName:string|number) {
		//先hook
		var hookObj = this._hooks[evtName];
		if(hookObj) {
			try {
				hookObj.callBack.call(hookObj.target);
			} catch(e1) {
				logger.error(e1);
			}
		}

		//再事件
		var evtList = this._events[evtName];
		if(evtList && evtList.length > 0) {
			this._fireings[evtName] = true;
			for(let i = 0; i < evtList.length; i++) {
				try{
					let listener = evtList[i];
					if(listener.callBack) {
						listener.callBack.call(listener.target);
					} else {
						evtList.splice(i, 1);
						i--;
					}
				} catch(e2) {
					logger.error(e2);
				}
			}
			this._fireings[evtName] = false;
		}
	}

	private onHasArgs(evtName:string|number, arglist:any[]) {
		//先hook
		var hookObj = this._hooks[evtName];
		if(hookObj) {
			try {
				hookObj.callBack.apply(hookObj.target, arglist);
			} catch(e1) {
				logger.error(e1);
			}
		}

		//再事件
		var evtList = this._events[evtName];
		if(evtList && evtList.length > 0) {
			this._fireings[evtName] = true;
			for(let i = 0; i < evtList.length; i++) {
				try{
					let listener = evtList[i];
					if(listener.callBack) {
						listener.callBack.apply(listener.target, arglist);
					} else {
						evtList.splice(i, 1);
						i--;
					}
				} catch(e2) {
					logger.error(e2);
				}
			}
			this._fireings[evtName] = false;
		}
	}
	
}

