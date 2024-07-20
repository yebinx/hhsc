import { _decorator, Component, Node, sp } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WdLightCollectEffect')
export class WdLightCollectEffect extends Component {
    playerEffect() {
        return new Promise(res => {
            this.getComponent(sp.Skeleton).setAnimation(0, "wd_collect1", false)
            this.scheduleOnce(res, 0.8)
        })
    }
}


