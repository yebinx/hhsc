import { _decorator, Color, Component, Node } from 'cc';
import CHandler from '../../../core/datastruct/CHandler';
import CocosUtil from '../../CocosUtil';
import TimerManager from '../../timer/TimerManager';
import { BaseComp } from '../BaseComp';

const { ccclass, property } = _decorator;

@ccclass('CompColorBlur')
export class CompColorBlur extends BaseComp {

    blurAlpha(totalFrame:number, fromAlpha:number, toAlpha:number,callback?) {
        totalFrame = Math.floor(totalFrame);
        if(totalFrame < 1) {
            totalFrame = 1;
        }
        if(fromAlpha===undefined || fromAlpha===null) {
            fromAlpha = CocosUtil.getNodeOpacity(this.node);
        }
        let alpha = fromAlpha;
        CocosUtil.setNodeOpacity(this.node, alpha);

        let tick = Math.abs(toAlpha-fromAlpha)/totalFrame;
        if(toAlpha < fromAlpha) {
            tick = -tick;
        }
        
        TimerManager.removeByTarget(this);
        TimerManager.loopFrame(1, -1, new CHandler(this, function(){
            alpha += tick;
            if( (tick > 0 && alpha >= toAlpha) || (tick < 0 && alpha <= toAlpha) ) {
                alpha = toAlpha;
                CocosUtil.setNodeOpacity(this.node, alpha);
                TimerManager.removeByTarget(this);
                if(callback){
                    callback()
                }
                return;
            }
            CocosUtil.setNodeOpacity(this.node, alpha);
        }))
    }

    blurColor(fromColor:Color, toColor:Color) {
        
    }

    protected onDisable(): void {
        TimerManager.removeByTarget(this);
    }

}


