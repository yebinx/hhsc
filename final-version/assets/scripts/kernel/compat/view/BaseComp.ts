import { _decorator, Component, Label, Node } from 'cc';
import TimerManager from '../timer/TimerManager';
import { UIManager } from './UImanager';
import EventCenter from '../../core/event/EventCenter';

const { ccclass, property } = _decorator;

@ccclass('BaseComp')
export class BaseComp extends Component {
    
    protected m_ui:{[key:string]:Node} = {};
    private m_dtor_listeners:{ callback:Function, target:any }[] = null;

    listenDestory(listener:Function, selfObj:any) {
        if(!listener) { return; }
        if(!this.m_dtor_listeners) { this.m_dtor_listeners = []; }
        for(let info of this.m_dtor_listeners) {
            if(info.callback === listener && info.target === selfObj) {
                return;
            }
        }
        this.m_dtor_listeners.push({ callback:listener, target:selfObj });
    }

    protected onDestroy(): void {
        EventCenter.untarget(this);
        TimerManager.removeByTarget(this);
        this.On_Destroy();
        if(this.m_dtor_listeners){
            for(let i=0, len=this.m_dtor_listeners.length; i<len; i++){
                this.m_dtor_listeners[i].callback.call(this.m_dtor_listeners[i].target);
            }
            this.m_dtor_listeners.length = 0;
            this.m_dtor_listeners = null;
        }
        UIManager.onViewClose(this.node);
    }

    protected On_Destroy() {

    }

}


