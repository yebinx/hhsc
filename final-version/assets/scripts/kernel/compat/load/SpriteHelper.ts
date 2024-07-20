import { Sprite, SpriteFrame, Node } from "cc";
import CpnSprite from "./CpnSprite";
import LoadHelper from "./LoadHelper";
import { genResKey, ResInfo } from "./ResInfo";
import { isNil, isEmpty } from "../../core/Globals";
import EventCenter from "../../core/event/EventCenter";
import logger from "../../core/logger";


export default class SpriteHelper {

	static setSprite(spr:Sprite, info:ResInfo) : boolean {
		if(isNil(spr) || isNil(info)) { return; }

		let sprCpn = spr.node.getComponent(CpnSprite);
		if(!sprCpn) {
			sprCpn = spr.node.addComponent(CpnSprite);
		} else {
			EventCenter.resInstance().removeByTarget(sprCpn);
		}

		if(isEmpty(info.respath)) {
			logger.log("respath is nil");
			spr.spriteFrame = null;
			return true;
		}

		var rsc = LoadHelper.getRes(info, SpriteFrame);
        if(rsc) {
			spr.spriteFrame = rsc;
			return true;
		}

		let evtName = genResKey(info);

		EventCenter.resInstance().listen(evtName, sprCpn.onResLoaded, sprCpn);

		LoadHelper.loadSpriteFrame(info, (err, r)=>{
			if(err){ 
				logger.error(evtName, err); 
				return; 
			}
			EventCenter.resInstance().fire(evtName, r);
		});

		return false;
	}

	public static setNodeSprite(nd:Node, info:ResInfo) : boolean {
		if(!nd) { return; }
		if(!nd.getComponent(Sprite)) { nd.addComponent(Sprite); }
		return SpriteHelper.setSprite(nd.getComponent(Sprite), info);
	}
	
}
