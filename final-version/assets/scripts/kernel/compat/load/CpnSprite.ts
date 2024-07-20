import { _decorator, Component, isValid, Sprite, Node, SpriteFrame } from 'cc';
import EventCenter from '../../core/event/EventCenter';


const { ccclass, property } = _decorator;

@ccclass('CpnSprite')
export default class CpnSprite extends Component {

	protected onDestroy(): void {
		EventCenter.resInstance().removeByTarget(this);
	}

	onResLoaded(sf:SpriteFrame) {
		if(!isValid(this) || !isValid(this.node)) { return; }
		let theSpr = this.node.getComponent(Sprite);
		if(!theSpr || !isValid(theSpr)) { return; }
		theSpr.spriteFrame = sf;
	}
    
}
