import { _decorator, CCInteger, Component, Node, Sprite, SpriteAtlas, SpriteFrame } from 'cc';
import CocosUtil from '../../CocosUtil';
import { createResInfo } from '../../load/ResInfo';
import SpriteHelper from '../../load/SpriteHelper';
import CHandler from '../../../core/datastruct/CHandler';
import CommonUtil from '../../../core/utils/CommonUtil';
const { ccclass, property } = _decorator;

@ccclass('CompFrameAni')
export class CompFrameAni extends Component {
    @property(CCInteger)
    loopTimes: number = -1;
    @property(CCInteger)
    finishOp: number = 1;  // 1:hide 2:destroy
    
    private _curFrame:number = 0;
    private _maxFrame:number = 0;

    private _respath:string;
    private _bundleName:string;

    private _looped:number = 0;

    setRespath(respath:string, bundleName:string, maxFrame:number) {
        this._respath = respath;
        this._bundleName = bundleName;
        this._curFrame = 0;
        this._maxFrame = maxFrame;
        CocosUtil.initComponent(this.node, Sprite);
        return this;
    }

    play(loopTimes:number, cbFinish:CHandler, speed:number = 0.03) {
        this.node.active = true;
        this._curFrame = 0;
        this.loopTimes = loopTimes;
        this.doPlay(cbFinish, speed);
    }

    private doPlay(cbFinish:CHandler, speed:number = 0.03) {
        let cpn = CocosUtil.initComponent(this.node, Sprite);
        this.unscheduleAllCallbacks();
        this.schedule((dt)=>{
            if(this._curFrame <= this._maxFrame) {
                SpriteHelper.setSprite(cpn, createResInfo(this._respath+this._curFrame, this._bundleName))
                this._curFrame++;
            }
            if(this._curFrame >= this._maxFrame) {
                this._looped++;

                if(this.loopTimes <= 0 || (this.loopTimes>0 && this._looped < this.loopTimes)) {
                    this._curFrame = 0;
                } else {
                    this.unscheduleAllCallbacks();
                    cbFinish && cbFinish.invoke();
                    if(this.finishOp == 1) {
                        this.node.active = false;
                    } else {
                        CommonUtil.safeDelete(this);
                    }
                }
            }
        }, speed);
    }
    
}


