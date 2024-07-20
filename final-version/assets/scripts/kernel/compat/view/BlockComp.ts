import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BlockComp')
export class BlockComp extends Component {
    closeWhenClick: boolean = true;

    protected onEnable(): void {
        // console.log("block enable", this.node.name);
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
		this.node.on(Node.EventType.TOUCH_END, this.doBlock, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.doBlock, this);

        this.node.on(Node.EventType.MOUSE_DOWN, this.doBlock, this);
        this.node.on(Node.EventType.MOUSE_MOVE, this.doBlock, this);
        this.node.on(Node.EventType.MOUSE_UP, this.doBlock, this);
        this.node.on(Node.EventType.MOUSE_ENTER, this.doBlock, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.doBlock, this);
        this.node.on(Node.EventType.MOUSE_WHEEL, this.doBlock, this);
    }

    protected onDisable(): void {
        // console.log("block disable", this.node.name);
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
		this.node.off(Node.EventType.TOUCH_END, this.doBlock, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.doBlock, this);

        this.node.off(Node.EventType.MOUSE_DOWN, this.doBlock, this);
        this.node.off(Node.EventType.MOUSE_MOVE, this.doBlock, this);
        this.node.off(Node.EventType.MOUSE_UP, this.doBlock, this);
        this.node.off(Node.EventType.MOUSE_ENTER, this.doBlock, this);
        this.node.off(Node.EventType.MOUSE_LEAVE, this.doBlock, this);
        this.node.off(Node.EventType.MOUSE_WHEEL, this.doBlock, this);
    }

    private onTouchStart(evt:any) {
        evt.propagationStopped = true;
        if(this.closeWhenClick){
            this.node.destroy();
        }
    }

    private doBlock(evt:any) {
        evt.propagationStopped = true;
    }
}


