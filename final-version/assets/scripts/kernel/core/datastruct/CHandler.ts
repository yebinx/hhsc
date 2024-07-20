//---------------------------------
// 回调封装
//---------------------------------
export default class CHandler {
	private _fn:Function;
	private _thisObj:any;
	private _args:any[];
	private _autoClean:boolean = false;
	private _neverFirst:boolean = false;

	public constructor(target:any, fn:Function, ...args:any[]) 
	{
		this._fn = fn;
		this._thisObj = target;
		this._args = args;
	}

	public neverFirst() : CHandler {
		this._neverFirst = true;
		return this;
	}

	public invoke() : any
	{
		var ret:any;

		if(this._args && this._args.length > 0) {
			ret = this._fn.apply(this._thisObj, this._args);
		} else {
			ret = this._fn.call(this._thisObj);
		}

		if(this._autoClean) {
			this.clear();
		}

		return ret;
	}

	public invodeWithFirst(argInsert2first:any) : any {
		if(this._neverFirst) {
			return this.invoke();
		}
		
		var ret:any;

		if(this._args && this._args.length > 0) {
			ret = this._fn.apply(this._thisObj, [argInsert2first].concat(this._args));
		} else {
			ret = this._fn.call(this._thisObj, argInsert2first);
		}

		if(this._autoClean) {
			this.clear();
		}

		return ret;
	}

	public invokeWithExtra(...extra:any[]) : any
	{
		var ret:any;

		if(this._args && this._args.length>0){
			if(extra) {
				ret = this._fn.apply(this._thisObj, this._args.concat(extra));
			} else {
				ret = this._fn.apply(this._thisObj, this._args);
			}
		} else {
			if(extra) {
				ret = this._fn.apply(this._thisObj, extra);
			} else {
				ret = this._fn.call(this._thisObj);
			}
		}
		
		if(this._autoClean) {
			this.clear();
		}

		return ret;
	}

	public clear() : void
	{
		this._fn = null;
		this._thisObj = null;
		if(this._args) { this._args.length = 0; }
		this._args = null;
	}

	public setAutoClean(bFlag:boolean) : void 
	{
		this._autoClean = bFlag;
	}

	public getTarget() : any 
	{ 
		return this._thisObj; 
	}
	
}
