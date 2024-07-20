import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HisElementItem')
export class HisElementItem extends Component {
    @property(Sprite)
    element: Sprite;
    @property(SpriteFrame)
    frames: SpriteFrame[] = []
    @property(Node)
    awardEffect: Node;
    @property(Node)
    lightEffect: Node;


    protected onLoad(): void {
        // this.awardEffect.active = false;
    }

    setId(id: number) {
        if (id == 0) {
            this.element.node.active = false;
            return
        }
        this.element.spriteFrame = this.frames[id - 1]
    }

    setIsAward(type: number) {
        this.awardEffect.active = (type == 1);
        this.lightEffect.active = (type == 2);
    }
}


