export default class UrlUtil {

    static ParseUrlDomain() : string {
        let stringParm = window.location.href.split("?");
        return stringParm[0];
    }

    // 解析href的token
    static ParserUrlToken() : string {
        let stringParm = window.location.href.split("?");
        if (stringParm.length != 2){
            console.warn("href error " + window.location.href);
            return "";
        }
        let szParm = stringParm[1].split("&"); // 解析所有参数
        for (let i=0; i<szParm.length; i++){ 
            let kv = szParm[i].split("=");
            if (kv[0].toLowerCase() == "token"){ // 找到token返回
                return kv[1];
            }
        }
        console.warn("parser token error");
        return "";
    }

    // 返回以/结尾的url
    static parserUrl(){
        let stringParm = window.location.href.split("?");
        if (stringParm.length != 2){
            return stringParm;
        }
        return stringParm[0];
    }

}


