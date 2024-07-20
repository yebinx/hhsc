//-------------------------------------
//-- 响应句柄
//-------------------------------------
import logger from "../logger";


export default class SingleDispatcher {
	private _observers:Array<{[key:string|number]:Function}> = [];

	public addObserver(observer:{[key:string|number]:Function}) : void
	{
		let idx = this._observers.indexOf(observer);
		if(idx < 0) {
			this._observers.push(observer);
		} else {
			this._observers[idx] = observer;
			logger.red("重复添加", observer);
		}
	}

	public removeObserver(observer:any) : void 
	{
		var idx = this._observers.indexOf(observer);
		if(idx>=0) {
			this._observers.splice(idx, 1);
		}
	}
	
	public fire(cmd:string|number, info:any) : void
	{
		if(cmd===null || cmd===undefined){
			logger.log("无效的cmd");
			return;
		}

		for(var i in this._observers) {
			if(this._observers[i][cmd]){
				this._observers[i][cmd](info);
			}
		}
	}
}
