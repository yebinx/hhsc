import { _decorator, CCBoolean, Component, Node, Sprite, SpriteFrame, Tween, tween, UITransform, v3 } from 'cc';
import MathUtil from '../../kernel/core/utils/MathUtil';
const { ccclass, property } = _decorator;

@ccclass('MarqueeElement')
export default class MarqueeElement {
    @property(Node)
    nd: Node;
    @property(CCBoolean)
    isRoll: boolean = false;
}

@ccclass('Marquee')
export class Marquee extends Component {
    @property(MarqueeElement)
    element: MarqueeElement[] = [];
    @property(SpriteFrame)
    hhscIconTip: SpriteFrame[] = [];
    @property(Node)
    hhscElement: Node;
    @property(Node)
    hhscTip: Node;

    curShowNode: Node;

    curShowIdx: number = 0;

    start() {
        this.randomPlayPollingTip()
    }

    /**显示中奖虎虎生财文字提示 */
    showHHSCTip() {
        if (this.curShowNode) {
            Tween.stopAllByTarget(this.curShowNode)
            this.curShowNode.active = false;
        }
        this.curShowNode = this.hhscTip;
        this.curShowNode.active = true;
    }

    /**显示虎虎生财元素文字提示 */
    showHHSCElement(elementId: number) {
        if (this.curShowNode) {
            Tween.stopAllByTarget(this.curShowNode)
            this.curShowNode.active = false;
        }
        this.curShowNode = this.hhscElement;
        this.curShowNode.active = true;
        let w = this.curShowNode.getComponent(UITransform).contentSize.width
        let pW = this.curShowNode.parent.getComponent(UITransform).contentSize.width;
        let time = w / 80
        let x = (w - pW) / 2 + 50
        this.curShowNode.position = v3(x, 0, 0)
        tween(this.curShowNode)
            .delay(1)
            .to(time, { position: v3(x - w, 0, 0) })
            .call(() => {
                this.showHHSCElement(elementId)
            })
            .start()
        this.curShowNode.getChildByName("icon").getComponent(Sprite).spriteFrame = this.hhscIconTip[elementId - 1]
    }

    randomPlayPollingTip() {
        let idx = MathUtil.getRandomInt(0, this.element.length - 1);
        this.playPollingTip(idx)
    }

    /**播放轮询提示 */
    playPollingTip(showIdx: number) {
        if (this.curShowNode) {
            Tween.stopAllByTarget(this.curShowNode)
            this.curShowNode.active = false;
        }
        let el = this.element[showIdx];
        if (el) {
            this.curShowNode = el.nd;
            this.curShowNode.active = true;
            let w = el.nd.getComponent(UITransform).contentSize.width
            let pW = el.nd.parent.getComponent(UITransform).contentSize.width;
            let time = w / 80
            if (el.isRoll) {
                let x = (w - pW) / 2 + 30
                el.nd.position = v3(x, 0, 0)
                tween(el.nd)
                    .delay(1)
                    .to(time, { position: v3(x - w - 30, 0, 0) })
                    .call(() => {
                        showIdx++
                        if (showIdx >= this.element.length) {
                            showIdx = 0
                        }
                        this.playPollingTip(showIdx)
                    })
                    .start()
            } else {
                tween(el.nd)
                    .delay(time)
                    .call(() => {
                        showIdx++
                        if (showIdx >= this.element.length) {
                            showIdx = 0
                        }
                        this.playPollingTip(showIdx++)
                    })
                    .start()
            }
        }
    }

}


