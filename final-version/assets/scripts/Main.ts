import { _decorator, Component, input, Input, KeyCode, Node, sys, System } from 'cc';
import { UIManager } from './kernel/compat/view/UImanager';
import logger from './kernel/core/logger';
import { EViewNames, g_uiMap } from './configs/UIConfig';
import Adaptor from './kernel/compat/view/Adaptor';
import PlatformUtil from './kernel/core/utils/PlatformUtil';
import ScreenHelper from './kernel/compat/view/ScreenHelper';
import UrlUtil from './kernel/core/utils/UrlUtil';
import HttpMgr from './mgrs/HttpMgr';
import LoginCtrl from './ctrls/LoginCtrl';
import TimerManager from './kernel/compat/timer/TimerManager';
import EventCenter from './kernel/core/event/EventCenter';
import GameEvent from './event/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {

    onLoad() {
        UIManager.setUIRoot(this.node);
        UIManager.setUIMap(g_uiMap);
        Adaptor.listenScreen()
        TimerManager.start(this);
        // PlatformUtil.setOrientation(false);
        Adaptor.adaptScreen();
        Adaptor.deepUpdateAlignment(this.node);
        logger.enableLogger(sys.os == sys.OS.WINDOWS)
        input.on(Input.EventType.KEY_DOWN, this.onKeyDwon, this);
        input.on(Input.EventType.KEY_PRESSING, this.onPreesing, this);
        console.log("game_version", '15')
    }

    parseUrl() {
        let token = UrlUtil.ParserUrlToken();
        if (token) {
            LoginCtrl.getIns().getModel().setToken(token);
            let domain = UrlUtil.ParseUrlDomain();
            if (domain) {
                HttpMgr.getIns().setDomain(domain)
            }
        }
    }


    onKeyDwon(event) {
        switch (event.keyCode) {
            case KeyCode.SPACE:
                EventCenter.getInstance().fire(GameEvent.key_down_space)
                break;
        }
    }


    onPreesing(event) {
        switch (event.keyCode) {
            case KeyCode.SPACE:
                EventCenter.getInstance().fire(GameEvent.key_pressing_space)
                break;
        }
    }

    start() {
        this.parseUrl()
        UIManager.showView(EViewNames.LoadinView)
    }


}

// ScreenHelper.changeHbkg()

