import Routes from "../define/Routes";
import EventCenter from "../kernel/core/event/EventCenter";
import logger from "../kernel/core/logger";
import HttpUtil from "../kernel/core/net/HttpUtil";
import { EHttpResult } from "../kernel/core/net/NetDefine";
import Singleton from "../kernel/core/utils/Singleton";
import StringUtil from "../kernel/core/utils/StringUtil";

export default class HttpMgr extends Singleton {

    _domain = "http://127.0.0.1:8000"

    _hidePrints = {
        [Routes.req_heartbeat]: true
    }

    setDomain(url: string) {
        if (url === undefined || url === null || url == "") {
            return;
        }
        if (url.lastIndexOf("/") == url.length - 1) {
            url = url.substring(0, url.length - 1);
        }
        if (url.indexOf("localhost") == -1) {
            this._domain = url;
        }
    }

    post(route: string, data: any, callback?: (bSucc: boolean, data: any) => void) {
        let dataStr = JSON.stringify(data)
        HttpUtil.callPost(this._domain + "/" + route, dataStr, (iCode: EHttpResult, data: any) => {
            if (iCode !== EHttpResult.Succ) {
                if (callback) { callback(false, iCode); }
                logger.red("ERROR_TABLE: ", route, iCode);
            } else {
                let info = JSON.parse(data)

                if (!this._hidePrints[route]) {
                    // logger.green("[RESP]", addr, JSON.stringify(info, null, 2));
                    logger.blue("[===== RESP start ====]", route);
                    console.log(info)
                    logger.blue("[====== RESP end ======]", route);
                    // StringUtil.printLn(info);
                }
                if (info.error_code !== null && info.error_code !== undefined && info.error_code !== 0) {
                    logger.red("ERROR_CODE: ", info.error_code, route);
                    //ToastHelper.tip(info.error_msg);
                    logger.red(info.error_msg);
                    if (callback) { callback(false, info); }
                } else {
                    if (callback) { callback(true, info); }
                    EventCenter.getInstance().fire(route, info);
                }
            }
        });
    }
}