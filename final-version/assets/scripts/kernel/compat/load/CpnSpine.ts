import { Component, _decorator, sp, tween } from "cc";
import CocosUtil from "../CocosUtil";
import LoadHelper from "./LoadHelper";
import { ResInfo, genResKey } from "./ResInfo";
import EventCenter from "../../core/event/EventCenter";
import logger from "../../core/logger";



const {ccclass, property} = _decorator;

@ccclass
export default class CpnSpine extends Component {
    private _playing:boolean = false;

    private _respath:ResInfo;

    private _trackIndex: number = 0;
    private _aniName: string = "";
    private _loopTimes: number = -1;
    private _onPlayFinish:(sk:sp.Skeleton)=>void = null;

    protected onDestroy(): void {
        EventCenter.resInstance().removeByTarget(this);
        this._onPlayFinish = null;
    }

    protected onDisable(): void {
        EventCenter.resInstance().removeByTarget(this);
        this._onPlayFinish = null;
    }


    loadSkeletonData(info:ResInfo) {
        this._respath = info;
        tween(this.node).hide().start();
        if(info===undefined || info===null || info.respath === "") {
            logger.error("respath is empty");
            return;
        }

        let uikey = genResKey(info);
        EventCenter.resInstance().remove(uikey, this.onResLoaded, this);
        EventCenter.resInstance().listen(uikey, this.onResLoaded, this);

		LoadHelper.loadRes(info, sp.SkeletonData, function(err, rsc){
			if(err) { 
				logger.log('载入spine失败:' + err);
				return;
			}
            if(!rsc) {
                logger.log("资源为空", info);
                return;
            }
            EventCenter.resInstance().fire(uikey, rsc);
		});
    }

	setAnimation(trackIndex: number, aniName: string, loopTimes: number, bSkipIfPlaying:boolean, onPlayFinish:(sk:sp.Skeleton)=>void) {
        if(this._respath===undefined || this._respath===null || this._respath.respath === "") {
            logger.error("respath not set");
        }
        
        if(bSkipIfPlaying && this._playing) {
            if(this._trackIndex == trackIndex && aniName == this._aniName && loopTimes == this._loopTimes) {
                return;
            }
        }

        this._trackIndex = trackIndex;
        this._aniName = aniName;
        this._loopTimes = loopTimes;
        this._onPlayFinish = onPlayFinish;

        this.loadSkeletonData(this._respath);
    }


    private getSkeleton() : sp.Skeleton {
        return CocosUtil.initComponent(this.node, sp.Skeleton);
    }

    private onResLoaded(rsc: sp.SkeletonData) {
        if(this._aniName===null || this._aniName===undefined || this._aniName==="") {
            return;
        }

        tween(this.node).show().start();
        this._playing = true;

        let sk = this.getSkeleton();
        sk.skeletonData = rsc;
        sk.premultipliedAlpha = false;

        let loopTimes = this._loopTimes;

        if(loopTimes==1) {
			sk.setAnimation(this._trackIndex, this._aniName, false);
		} else {
			sk.setAnimation(this._trackIndex, this._aniName, true);
		}

        if(loopTimes > 0) {
			sk.setCompleteListener(this.onComplete.bind(this));
		} else {
            sk.setCompleteListener(null);
        }
    }

    private onComplete(trackEntry) {
        if(this._loopTimes > 0) {
            let loopCount = Math.floor(trackEntry.trackTime / trackEntry.animationEnd);
            if(loopCount >= this._loopTimes) {
                this._playing = false;
                if(this._onPlayFinish) {
                    this._onPlayFinish(this.getSkeleton());
                }
            }
        }
    }

}
