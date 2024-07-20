import ICodec from "../codec/ICodec";
import EventCenter from "../event/EventCenter";
import logger from "../logger";
import StringUtil from "../utils/StringUtil";
import HttpUtil from "./HttpUtil";
import { EHttpResult } from "./NetDefine";

export default class HttpChanel {
    private _domain:string = "";			//域名
    private _coder:ICodec = null;			//编码解码器
	private _hidePrints: {[key:string]:boolean} = {};
	

	constructor(domain:string, coder:ICodec) {
		this._domain = domain;
		this._coder = coder;
	}

	setDomain(url:string) {
        if(url===undefined || url===null || url=="") {
            return;
        }
        if(url.lastIndexOf("/") == url.length-1) {
			url = url.substring(0, url.length-1);
		}
		this._domain = url;
    }

	hidePrint(addrlist:string[]) {
		for(let addr of addrlist) {
			this._hidePrints[addr] = true;
		}
	}

	Post(addr:string, data:any, callback?:(bSucc:boolean, data:any)=>void) {
		if(!this._hidePrints[addr]) {
			logger.blue("[POST]: ", addr, " ", JSON.stringify(data));
		}
		
		HttpUtil.callPost(this._domain + "/" + addr, this._coder.encode(data), (iCode: EHttpResult, data: any)=>{
			if(iCode !== EHttpResult.Succ) {
				if(callback) { callback(false, null); }
				logger.red("ERROR_TABLE: ", addr, iCode);
			} else {
				let info = this._coder.decode(data);

				if(!this._hidePrints[addr]) {
					// logger.green("[RESP]", addr, JSON.stringify(info, null, 2));
					logger.blue("[RESP]", addr);
					StringUtil.printLn(info);
				}

				if(info.error_code !== null && info.error_code !== undefined && info.error_code !== 0) {
					logger.red("ERROR_CODE: ", info.error_code, addr);
					//ToastHelper.tip(info.error_msg);
					logger.red(info.error_msg);
					if(callback) { callback(false, info); }
				} else {
					if(callback) { callback(true, info); }
					EventCenter.getInstance().fire(addr, info);
				}
			}
		});
	}


}


