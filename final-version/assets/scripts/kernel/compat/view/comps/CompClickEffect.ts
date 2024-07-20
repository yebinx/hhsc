import { _decorator, Component, EventTouch, isValid, Node, sp, UITransform, v2, v3 } from 'cc';
import { createResInfo } from '../../load/ResInfo';
import LoadHelper from '../../load/LoadHelper';
import EventCenter from '../../../core/event/EventCenter';
import { BaseEvent } from '../../../core/event/BaseEvent';

const { ccclass, property } = _decorator;

@ccclass('CompClickEffect')
export class CompClickEffect extends Component {

    protected onLoad(): void {
        this.initSpineClick();
    }
    
    protected onEnable(): void {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchBegin, this);
		this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
		this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
		this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    protected onDisable(): void {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchBegin, this);
		this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
		this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
		this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }
	
	onTouchBegin(evt:EventTouch) {
        evt.propagationStopped = false;
		evt.preventSwallow = true;
        EventCenter.getInstance().fire(BaseEvent.click_mouse, evt.getUILocation());
    }

    addClickEffect(localPos){
        var clickEff = this.initSpineClick();
        if(clickEff) { 
            clickEff.active = true;
            // let localPos = evt.getLocation();
            // var tempPt = clickEff.parent.getComponent(UITransform).convertToNodeSpaceAR(v3(worldPos.x,worldPos.y,0));
            // let localPos = evt.getUILocation();
            let uiPos = this.node.getComponent(UITransform).convertToNodeSpaceAR(v3(localPos.x,localPos.y,0))
            // let uiPos = this.node.getComponent(UITransform).convertToNodeSpaceAR(worldPos)
            let sz = this.node.getComponent(UITransform).contentSize;
            clickEff.setPosition(v3(uiPos.x, uiPos.y, 0));
            // clickEff.setPosition(v3(uiPos.x-sz.width/2, uiPos.y-sz.height/2, 0));
            clickEff.getComponent(sp.Skeleton).setAnimation(0, "animation", false);
        }
    }

    onTouchMove(evt:EventTouch) {
        evt.propagationStopped = false;
		evt.preventSwallow = true;
    }

    onTouchEnd(evt:EventTouch) {
        evt.propagationStopped = false;
		evt.preventSwallow = true;
    }

    onTouchCancel(evt:EventTouch) {
        evt.propagationStopped = false;
		evt.preventSwallow = true;
    }

    initSpineClick() {
		let effParent = this.node;
		let ndName = "_mouse_click_eff_";

		if(effParent.getChildByName(ndName)) {
			return effParent.getChildByName(ndName);
		}

		let nd = new Node(ndName);
		nd.addComponent(sp.Skeleton);
		effParent.addChild(nd);
		nd.active = true;
        nd.name = ndName;
        
        LoadHelper.loadRes(createResInfo("spines/click/dianji", null), sp.SkeletonData, (e: Error, r: any | any[]) => {
            if(e) { console.log(e); return; }
			if(!r) { console.log("nil res"); return; }
            let sk = nd.getComponent(sp.Skeleton);
            sk.skeletonData = r;
            sk.premultipliedAlpha = false;

            sk.setCompleteListener((trackEntry) => {
				sk.node.active = false;
			});

            sk.setAnimation(0, "animation", false);
        });

		return nd;
	}

}


