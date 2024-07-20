import KernelEvent from "../defines/KernelEvent";
import EventCenter from "../event/EventCenter";
import logger from "../logger";
import CommonUtil from "../utils/CommonUtil";


//模块管理器
export default class LogicCenter {
    private static _instance:LogicCenter = null;

    public static getInstance() : LogicCenter {
        if(!LogicCenter._instance){ LogicCenter._instance = new LogicCenter; }
        return LogicCenter._instance;
    }
    public static delInstance() : void {
		if(LogicCenter._instance) {
			LogicCenter._instance.clear();
			LogicCenter._instance = null;
		}
    }


    private _managers:any[] = [];

    private constructor() {
        //解包出错则提示更新版本
        EventCenter.getInstance().listen(KernelEvent.ERR_UNPACK_NETDATA, function(){
            
        }, this);
    }

    public clear() {
        for(var i=0; i<this._managers.length; i++){
            logger.log("unregist model ", i+1, CommonUtil.getClsName(this._managers[i].getInstance()));
            this._managers[i].getInstance().do_dtor();
            this._managers[i].delInstance();
        }
        this._managers.length = 0;
        this._managers = [];
    }

    
    public registModel(cls:any) {
        if(!cls){ return; };
        if(!cls.delInstance) { logger.error("no delInstance", cls); return; }
        if(!cls.getInstance) { logger.error("no getInstance", cls); return; }

        cls.getInstance();

        if(this._managers.indexOf(cls) < 0){
            this._managers.push(cls);
            logger.log("regist model ", this._managers.length, CommonUtil.getClsName(cls.getInstance()));
        }
    }

    public unregistModel(cls:any) {
        var idx = this._managers.indexOf(cls);
        if(idx >= 0) {
            logger.log("unregist model ", this._managers.length, CommonUtil.getClsName(cls.getInstance()));
            this._managers.splice(idx,1);
            cls.getInstance().do_dtor();
            cls.delInstance();
        }
    }
    
}

