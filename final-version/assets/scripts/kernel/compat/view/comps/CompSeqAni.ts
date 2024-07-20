import { _decorator, CCInteger, Component, Node, Sprite, SpriteAtlas, SpriteFrame } from 'cc';
import LoadHelper from '../../load/LoadHelper';
import { createResInfo } from '../../load/ResInfo';
import CocosUtil from '../../CocosUtil';
import CHandler from '../../../core/datastruct/CHandler';
import CommonUtil from '../../../core/utils/CommonUtil';

const { ccclass, property } = _decorator;

@ccclass('CompSeqAni')
export class CompSeqAni extends Component {
    @property(SpriteAtlas)
    sprAtlas: SpriteAtlas = null;

    @property(CCInteger)
    loopTimes: number = -1;
    @property(CCInteger)
    finishOp: number = 1;  // 1:hide 2:destroy

    private _curFrame:number = 0;
    private _totalFrames:number = 0;
    private _sprFrames:SpriteFrame[] = [];

    private _respath:string;
    private _bundleName:string;

    private _looped:number = 0;


    protected onLoad(): void {
        if(this.sprAtlas) {
            this._sprFrames = this.sprAtlas.getSpriteFrames();
            this._totalFrames = this._sprFrames.length;
            this.play(-1);
        }
    }

    setRespath(respath:string, bundleName:string) {
        this._respath = respath;
        this._bundleName = bundleName;
        return this;
    }

    play(loopTimes:number, cbFinish?:CHandler, speed:number = 0.03) {
        this._curFrame = 0;
        this.loopTimes = loopTimes;

        if(this._respath) {
            let slf = this;
            LoadHelper.loadRes(createResInfo(this._respath, this._bundleName), SpriteAtlas, (err, r:SpriteAtlas)=>{
                if(err || !CocosUtil.isValid(slf)) { return; }
                slf._sprFrames = r.getSpriteFrames();
                slf._totalFrames = slf._sprFrames.length;
                slf.doPlay(cbFinish, speed);
            });
        } else {
            this.doPlay(cbFinish, speed);
        }
    }

    private doPlay(cbFinish:CHandler, speed:number = 0.03) {
        let cpn = CocosUtil.initComponent(this.node, Sprite);
        this.unscheduleAllCallbacks();
        this.schedule((dt)=>{
            if(this._curFrame < this._totalFrames) {
                cpn.spriteFrame = this._sprFrames[this._curFrame];
                this._curFrame++;
            }
            if(this._curFrame >= this._totalFrames) {
                this._looped++;

                if(this.loopTimes <= 0 || (this.loopTimes>0 && this._looped>=this.loopTimes)) {
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


