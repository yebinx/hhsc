import { _decorator, Component, EventTouch, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CpnInnerScroll')
export class CpnInnerScroll extends Component {
    onEnable() {
		this.node.on(Node.EventType.TOUCH_START, this.onTouchEvt, this);
		this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchEvt, this);
		this.node.on(Node.EventType.TOUCH_END, this.onTouchEvt, this);
		this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEvt, this);
	}

	onDisable() {
		this.node.off(Node.EventType.TOUCH_START, this.onTouchEvt, this);
		this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchEvt, this);
		this.node.off(Node.EventType.TOUCH_END, this.onTouchEvt, this);
		this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEvt, this);
	}

	private onTouchEvt(evt:EventTouch) {
		evt.propagationStopped = false;
		evt.preventSwallow = false;
	}
}


