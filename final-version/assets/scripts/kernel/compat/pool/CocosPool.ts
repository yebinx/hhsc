import { Node, NodePool, Tween } from 'cc';
import CocosUtil from '../CocosUtil';

export default class CocosPool {
	private _pool:NodePool;
	private _createFunc:()=>Node;

	public constructor(creatFunc:()=>Node){
		this._createFunc = creatFunc;
		this._pool = new NodePool;
	}

	public newObject() : Node {
		if(this._pool.size() <= 0) {
			return this._createFunc();
		} else {
			var obj = this._pool.get();
			Tween.stopAllByTarget(obj);
			return obj;
		}
	}

	public delObject(obj:Node) {
		if(!CocosUtil.isValid(obj)) { return; }
        this._pool.put(obj);
	}

	public clear() : void {
		this._pool.clear();
	}

}


