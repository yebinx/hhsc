//---------------------------------
// Http
//---------------------------------
import logger from "../logger";
import { isEmpty } from "../Globals";
import { EHttpResult } from "./NetDefine";


class HttpDownTask {
	state:EHttpResult = EHttpResult.Idle;
	data:any = null;
}


export default class HttpUtil {
	private static _timeout:number = 15000;		//超时
	

	private static createXHR() : XMLHttpRequest {
		return new XMLHttpRequest();
	}

	private static commonHead(xhr:XMLHttpRequest) 
	{
		// if (cc.sys.isNative){
		// 	xhr.setRequestHeader("Accept-Encoding","gzip,deflate","text/html;charset=UTF-8");
		// }
		//xhr.setRequestHeader("Content-Type", "application/json");
		//跨域访问
		// xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
		// xhr.setRequestHeader("Access-Control-Allow-Headers", "X-Requested-With");
		// xhr.setRequestHeader("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
		// xhr.setRequestHeader("X-Powered-By",' 3.2.1')
		xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
	}

	public static callGet(url:any, params:any, callback:(iCode:EHttpResult, data:any)=>void, headinfo?:{[key:string]:string}) 
	{
		var finalUrl = url;

		if(params && params != "") {
			finalUrl = finalUrl + "?" + params;
		}

		var xhr = this.createXHR();

		xhr.onabort = function() {
			logger.orange('[onabort]', finalUrl);
			callback(EHttpResult.Aborted, xhr.responseText);
		}
		xhr.onerror = function() {
			logger.orange('[onerror]', finalUrl);
			callback(EHttpResult.Error, xhr.responseText);
		}
		xhr.ontimeout = function() {
			logger.orange('[ontimeout]', finalUrl);
			callback(EHttpResult.Timeout, xhr.responseText);
		}
		xhr.onreadystatechange = function () {
			if ( xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 207) ) {
				logger.green("[RESP]", finalUrl);
			//	logger.log(xhr.responseText);
				callback(EHttpResult.Succ, xhr.responseText);
			}
		};

		logger.green("[GET]: ", finalUrl, params);
		xhr.open("GET", finalUrl, true);
		xhr.timeout = this._timeout;
		this.commonHead(xhr);
		if(headinfo) {
			for(let k in headinfo) {
				xhr.setRequestHeader(k, headinfo[k]);
			}
		}
		xhr.send();
	}

	public static callPost(url:any, param:any, callback:(iCode:EHttpResult, data:any)=>void) 
	{
		var xhr = this.createXHR();

		xhr.onabort = function() {
			logger.orange('[onabort]', url);
			callback(EHttpResult.Aborted, xhr.responseText);
		}
		xhr.onerror = function() {
			logger.orange('[onerror]', url);
			callback(EHttpResult.Error, xhr.responseText);
		}
		xhr.ontimeout = function() {
			logger.orange('[ontimeout]', url);
			callback(EHttpResult.Timeout, xhr.responseText);
		}
		xhr.onreadystatechange = function () {
			if ( xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 207) ) {
			//	logger.green("[RESP]", url, xhr.responseText);
				callback(EHttpResult.Succ, xhr.responseText);
			}
		};

		// logger.green("[POST]: ", url, param);
		xhr.open("POST", url, true);
		xhr.timeout = this._timeout;
		this.commonHead(xhr);
		xhr.send(param);
	}

	// blob: files[0]
	public static callUpload(url:string, key:string, blob:Blob|string, formInfo:any, finishCallback?:Function, heads?:{[key:string]:string}) {
		if(isEmpty(blob) || isEmpty(url)) {
			logger.warn("无效的上传参数", blob, url);
			return;
		}
		logger.log("开始上传......", url);

		var fd = new FormData();
		fd.append(key, blob);
		if(formInfo) {
			for(var k in formInfo) {
				fd.append(k, formInfo[k]);
			}
		}
		
		var xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", function(ev1) {
			logger.log("上传进度", ev1.loaded/ev1.total*100+"/100");
		}, false);
        xhr.addEventListener("load", function(ev2){
			logger.log("上传完毕", url);
		}, false);
        xhr.addEventListener("error", function(ev3) {
			logger.error("error: ", ev3);
		}, false);
        xhr.addEventListener("abort", function(ev4) {
			logger.error("abort: ", ev4);
		}, false);
		xhr.onreadystatechange = function () {
			logger.log("上传状态: ", xhr.readyState, xhr.status, xhr.responseText);
			if ( xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 207) ) {
				logger.log("[RESP]", xhr.responseText);
				if(finishCallback) {
					finishCallback(xhr.responseText);
				}
			}
		};
		xhr.open("POST", url);

		if(heads) {
			for(let k in heads) {
				xhr.setRequestHeader(k, heads[k]);
			}
		}

        xhr.send(fd);
	}
	
}

