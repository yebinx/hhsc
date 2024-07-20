export class ResInfo {
    readonly respath: string;
    readonly bundleName: string;
    uikey?: string;
    readonly options?: Record<string, any>;
}

export function createResInfo(respath:string, bundleName:string) : ResInfo {
    return {
        respath: respath,
        bundleName: bundleName,
    }
}

export function genResKey(info:ResInfo) : string {
    if(info.uikey===undefined || info.uikey===null || info.uikey=="") {
        info.uikey = (info.bundleName || "") + info.respath;
    }
    return info.uikey;
}
