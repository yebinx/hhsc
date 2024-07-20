import { _decorator, Component, Node, NodeEventType, Sprite, SpriteFrame, UITransform } from 'cc';
import EventCenter from '../../kernel/core/event/EventCenter';
import GameEvent from '../../event/GameEvent';
import GameConst from '../../define/GameConst';
const { ccclass, property } = _decorator;

@ccclass('ElementCom')
export class ElementCom extends Component {

    @property(SpriteFrame)
    frames: SpriteFrame[] = [];//正常
    @property(SpriteFrame)
    dimFrames: SpriteFrame[] = [];//模糊
    @property(Node)
    hhscAward: Node;
    @property(Sprite)
    icon: Sprite;
    @property(Node)
    wdAnimation:Node;

    id: number = 0;

    /*顺序编号 0-8 用于获取该元素悬浮提示面板位置信息 */
    posIdx: number = -1;


    init(id: number) {
        this.id = id
        this.posIdx = -1;
        this.hhscAward.active = false;
    }

    addClickEvent() {
        this.node.on(NodeEventType.TOUCH_START, this.onClick, this)
    }

    onClick() {
        EventCenter.getInstance().fire(GameEvent.click_element, this.posIdx, this.id)
    }

    updateIcon(isDim: boolean) {
        this.icon.node.active = this.id != 0;
        this.wdAnimation.active = false;
        if (this.id) {
            if (isDim) {
                this.icon.spriteFrame = this.dimFrames[this.id - 1]
            } else {
                if(this.id != GameConst.WDElementId){
                    this.icon.node.active = true;
                    this.wdAnimation.active = false
                    if(this.id == 1){
                        this.icon.node.setScale(0.7,0.7,0.7)
                    }else{
                        this.icon.node.setScale(1,1,1)
                    }
                    this.icon.spriteFrame = this.frames[this.id - 1]
                }else{
                    this.icon.node.active = false;
                    this.wdAnimation.active = true
                }
            }
        }
    }

    showHhscAward() {
        this.hhscAward.active = true;
    }

    /**添加粒子特效 */
    addEffect(node: Node) {
        this.node.addChild(node);
    }

    setId(id: number, isDim: boolean = false) {
        this.init(id);
        this.updateIcon(isDim)
    }

    getSize() {
        return this.node.getComponent(UITransform).contentSize
    }


}


