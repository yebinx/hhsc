import TimerManager from "../../compat/timer/TimerManager";
import EventCenter from "../event/EventCenter";


export default abstract class ModelBase {
	private m_dtor_listeners:{ callback:Function, target:any }[] = null;

    protected abstract on_dtor() : void;

	do_dtor(): void {
		EventCenter.untarget(this);
		TimerManager.removeByTarget(this);
		if(this.m_dtor_listeners) {
            for(let i=0, len=this.m_dtor_listeners.length; i<len; i++){
                this.m_dtor_listeners[i].callback.call(this.m_dtor_listeners[i].target);
            }
            this.m_dtor_listeners.length = 0;
            this.m_dtor_listeners = null;
        }
		this.on_dtor();
	}

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
	
}
