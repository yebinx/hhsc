import { _decorator, Component, Node, sp } from 'cc';
const { ccclass, property } = _decorator;


/**通过元素ID 来播放对应的动画 做个映射 */
var AnimationNames = {
    [2]: "h1",
    [3]: "h2",
    [4]: "h3",
    [5]: "l1",
    [6]: "l2",
    [7]: "l3",
}

@ccclass('ElementFullSceneXiaoChuEffect')
export class ElementFullSceneXiaoChuEffect extends Component {

    @property(sp.Skeleton)
    spinElement: sp.Skeleton;
    player(elementId: number) {
        return new Promise(res => {
            let animationName = AnimationNames[elementId]
            if (animationName) {
                this.spinElement.setCompleteListener((t) => {
                    this.spinElement.setAnimation(0, animationName + "_big_idle", true)
                    res(null)
                })
                this.spinElement.setAnimation(0, animationName + "_big_in", false)
            } else {
                res(null)
            }
        })
    }


}


