import { _decorator, Animation, AnimationClip, AnimationState, bezier, Button, Color, Component, dragonBones, easing, Event, EventTouch, Input, input, instantiate, KeyCode, Label, Node, NodeEventType, Prefab, sp, Sprite, sys, Tween, tween, UIOpacity, UITransform, v3, Vec2, Vec3 } from 'cc';
import { BaseView } from '../../kernel/compat/view/BaseView';
import { ElementCtrl } from './ElementCtrl';
import { EnterHHSCModeUIInfo, EPoint, GameMode, HHSCResultAwardUIInfo, InitUIInfo, ResultAwardUIInfo, ResultHHSCAwardUIInfo, ResultLineInfo, ResultNoAwardUIInfo, X10AnimationType } from '../../models/GameModel';
import { GameUI } from './GameUI';
import { ObjPoolCom } from './ObjPoolCom';
import CocosUtil from '../../kernel/compat/CocosUtil';
import GameCtrl from '../../ctrls/GameCtrl';
import GameEvent from '../../event/GameEvent';
import EventCenter from '../../kernel/core/event/EventCenter';
import { AwardElementCom } from './AwardElementCom';
import GameConst, { GameState } from '../../define/GameConst';
import { WinAwardNumAnimation } from './WinAwardNumAnimation';
import { ClickElementRateTip } from './ClickElementRateTip';
import { Marquee } from './Marquee';
import { ElementCom } from './ElementCom';
import { UIManager } from '../../kernel/compat/view/UImanager';
import { EViewNames } from '../../configs/UIConfig';
import { EDialogMenuId, EDialogType, EUILayer, ParamConfirmDlg } from '../../kernel/compat/view/ViewDefine';
import { ElementFullSceneXiaoChuEffect } from './ElementFullSceneXiaoChuEffect';
import { WdLightCollectEffect } from './WdLightCollectEffect';
import { AudioManager } from '../../kernel/compat/audio/AudioManager';
import LocalCache from '../../kernel/core/localcache/LocalCache';
import GameAudio, { BgmType } from '../../mgrs/GameAudio';
import { BaseEvent } from '../../kernel/core/event/BaseEvent';
import MathUtil from '../../kernel/core/utils/MathUtil';
import { NodeEx } from '../../../shared/script/lib/NodeEx';
import { CompNumberEx } from '../../kernel/compat/view/comps/CompNumberEx';
import MoneyUtil from '../../kernel/core/utils/MoneyUtil';
import Task from '../../kernel/compat/task/Task';
import logger from '../../kernel/core/logger';
const { ccclass, property } = _decorator;

/**通过元素ID 来播放对应的动画 做个映射 */
var RedPackOpenAnimationNames = {
    [2]: "h1_in",
    [3]: "h2_in",
    [4]: "h3_in",
    [5]: "l1_in",
    [6]: "l2_in",
    [7]: "l3_in",
}

//**贝塞尔曲线 */
var CtrlPoints = [
    [new Vec3(-500, 100, 0), new Vec3(-500, 150, 0), new Vec3(-500, 400, 0)],
    [new Vec3(-500, 100, 0), new Vec3(-500, 200, 0), new Vec3(-300, 250, 0)],
    [new Vec3(-500, 100, 0), new Vec3(-300, 200, 0), new Vec3(-100, 200, 0)]
]


@ccclass('GameView')
export class GameView extends BaseView {

    /**元素控制器 */
    @property(ElementCtrl)
    elementCtrl: ElementCtrl;

    @property(Node)
    effectLayer: Node;

    @property(Node)
    hhscElementtLayer: Node;

    @property(Animation)
    hhhscSceneAnimation: Animation;

    /**粒子特效层 */
    @property(Node)
    particleEffectLayer: Node;

    @property(Prefab)
    preElementFullSceneEffect: Prefab;



    @property(Marquee)
    marquee: Marquee;

    @property(Node)
    tigerObj: Node;

    @property(Node)
    common10Ani: Node;

    @property(Node)
    tigerLight: Node;

    @property(Node)
    specialBet: Node;

    @property(Node)
    specialBet2: Node;
    
    /**红包 打开动画*/
    @property(Node)
    hhscModeRadPackEffect: Node;

    /**进入虎虎生财  打开红包后出现的滚动特效*/
    @property(Node)
    hhscModeRollEffect: Node;
    /**进入虎虎生财  背景光特效*/
    @property(Node)
    hhscModeBgLightEffect: Node;
    /**进入虎虎生财  背景粒子特效*/
    @property(Node)
    hhscModeBgParticleEffect: Node;

    @property(Node)
    tigerCollecEffect: Node
    @property(Node)
    tigerCollecPartileEffect1: Node
    @property(Node)
    tigerCollecPartileEffect2: Node

    @property(Node)
    clickEffectFrame: Node;

    /**中奖线编号节点 */
    @property(Node)
    awardLineIdxs: Node[] = []

    @property(WinAwardNumAnimation)
    winNumAnimation: WinAwardNumAnimation

    @property(ClickElementRateTip)
    clickElementRateTip: ClickElementRateTip

    @property(Label)
    showLineWinLabel: Label

    @property(Node)
    showLineWinLabelBg: Node

    /**对象池 */
    static objPool: ObjPoolCom;

    /**初始化信息 */
    viewInfo: InitUIInfo;

    /**一条线的奖励元素列表 */
    lineAwardElements: AwardElementCom[][] = [];

    lineInfos: ResultLineInfo[] = [];

    state: GameState;

    resultAwardUIInfo: ResultAwardUIInfo

    hhscElementtNodes: Node[] = [];

    isFast: boolean = false;
    fastAnimaTime: number = 0;
    curMode: GameMode = GameMode.normal;
    isWin1 = false;

    /**遮罩黑透明节点 */
    mask_bg: Node;

    /**虎虎生财 回合计数 */
    hhscRoundCnt: number = 0;

    /**收集百搭个数 */
    collectWdCnt: number = 0;

    ndElementFullSceneEffect: Node;

    curRoundQuickStop: boolean = false;

    /**当前回合是否播放过出现百搭音效 */
    isCurRoundPlayWdElementAudio: boolean = false;

    hhscWaitTask: Task = new Task();

    /**当前需要显示的哪一轮结果 */
    // curShowResultRoundIdx: number = 0;

    onLoad() {
        CocosUtil.traverseNodes(this.node, this.m_ui)
        GameView.objPool = this.getComponent(ObjPoolCom)
        this.mask_bg = this.m_ui.mask_bg;
    }


    initData(viewInfo: InitUIInfo) {
        this.viewInfo = viewInfo;
    }

    start() {
        this.getComponent(GameUI).setBalanceAmount(this.viewInfo.balance)
        this.getComponent(GameUI).setBetAmount(this.viewInfo.curBetAmount)
        this.getComponent(GameUI).setWinAmount(this.viewInfo.lastWinAmount)
        this.initNetEvent();
        this.initUIEvent();
        this.onUpdateState(GameState.wait)
        this.awardLineIdxs.forEach(v => v.active = false);
        this.effectLayer.active = false;
        this.mask_bg.active = false;
        this.clickElementRateTip.hideTip();
        this.hhscModeRadPackEffect.active = false;
        this.hhscModeRollEffect.active = false;
        this.hhscModeBgLightEffect.active = false;
        this.refreshVoice();
        this.initFastState(GameCtrl.getIns().isFast);
        this.onUpdateOpenAutoRoll(false, 0)
        this.switchMenu(true, false);
        this.showTigerCollectWdParticle(0)
        this.winNumAnimation.hideWin()
        this.elementCtrl.init(this.viewInfo.elementList);
        this.initLastAwardResult(this.viewInfo.lastResultAwardUIInfo)
        this.m_ui.click_quick_stop_effect.active = false;
    }


    private initUIEvent() {
        this.m_ui.click_quick_stop_layer.on(NodeEventType.TOUCH_START, this.onClickQuickStop, this)
        CocosUtil.addClickEvent(this.m_ui.btn_show_menu, this.onBtnMenu, this);
        CocosUtil.addClickEvent(this.m_ui.btn_closemnu, this.onCloseBtnMenu, this);
        CocosUtil.addClickEvent(this.m_ui.btn_spin, this.onSpin, this)
        CocosUtil.addClickEvent(this.m_ui.btn_fast, this.onCloseFast, this)
        CocosUtil.addClickEvent(this.m_ui.close_fast, this.onOpenFast, this)
        CocosUtil.addClickEvent(this.m_ui.btn_auto, this.onOpenUIAuto, this)
        CocosUtil.addClickEvent(this.m_ui.sb_auto, this.onCancelAutoRoll, this)
        CocosUtil.addClickEvent(this.m_ui.open_setting_bet, this.onOpenSettingBet, this)
        CocosUtil.addClickEvent(this.m_ui.open_banlace, this.onOpenBanlance, this)
        CocosUtil.addClickEvent(this.m_ui.open_history, this.onOpenHistory, this)
        CocosUtil.addClickEvent(this.m_ui.btn_history, this.onOpenHistory, this)
        CocosUtil.addClickEvent(this.m_ui.btn_minus, this.onReduceBetAmount, this)
        CocosUtil.addClickEvent(this.m_ui.btn_add, this.onAddBetAmount, this)
        CocosUtil.addClickEvent(this.m_ui.btn_voice, this.onBtnVoice, this);
        CocosUtil.addClickEvent(this.m_ui.btn_quit, this.onBtnQuit, this);
        this.m_ui.btn_spin.on(NodeEventType.MOUSE_ENTER, this.onMouseEnterSpin, this)
        this.m_ui.btn_spin.on(NodeEventType.MOUSE_LEAVE, this.onMouseLeaveSpin, this)
        this.m_ui.sb_auto.on(NodeEventType.MOUSE_ENTER, this.onMouseEnterSpin, this)
        this.m_ui.sb_auto.on(NodeEventType.MOUSE_LEAVE, this.onMouseLeaveSpin, this)
        CocosUtil.addClickEvent(this.m_ui.btn_peifu, () => {
            UIManager.showView(EViewNames.UIpeifubiao)
        }, this)
        CocosUtil.addClickEvent(this.m_ui.btn_rule, () => {
            UIManager.showView(EViewNames.UIRule)
        }, this)
        this.m_ui.spine_spin_effect.getComponent(sp.Skeleton).setCompleteListener((t) => {
            if (t.animation.name == "anniu_click") {
                if (this.state == GameState.roll) {
                    this.m_ui.spine_spin_effect.getComponent(sp.Skeleton).setAnimation(0, "rolate", true)
                }
            }
        })
        this.clickEffectFrame.getComponent(sp.Skeleton).setCompleteListener((t) => {
            if (t.animation.name == "animation") {
                this.clickEffectFrame.active = false;
            }
        })

        this.hhscModeRollEffect.getComponent(sp.Skeleton).setCompleteListener((t) => {
            this.hhscModeRollEffect.active = false
        })

        this.hhscModeBgLightEffect.getComponent(sp.Skeleton).setCompleteListener((t) => {
            if (t.animation.name == "in") {
                this.hhscModeBgLightEffect.getComponent(sp.Skeleton).setAnimation(0, "idle", true)
            }
        })
        this.hhscModeBgParticleEffect.getComponent(sp.Skeleton).setCompleteListener((t) => {
            if (t.animation.name == "in") {
                this.hhscModeBgParticleEffect.getComponent(sp.Skeleton).setAnimation(0, "idle", true)
            }
        })
        this.tigerCollecEffect.getComponent(sp.Skeleton).setCompleteListener((t) => {
            if (t.animation.name != "idle_light") {
                this.tigerCollecEffect.getComponent(sp.Skeleton).setAnimation(0, "idle_light", true)
            }
        })
        this.m_ui.click_quick_stop_effect.getComponent(sp.Skeleton).setCompleteListener((t) => {
            this.m_ui.click_quick_stop_effect.active = false;
        })
        // this.m_ui.wai_light_manual.getComponent(sp.Skeleton).setCompleteListener((t) => {
        //     this.m_ui.wai_light_manual.active = false;
        // })
        // this.m_ui.wai_light_auto.getComponent(sp.Skeleton).setCompleteListener((t) => {
        //     this.m_ui.wai_light_auto.active = false;
        // })

        this.tigerObj.getComponent(sp.Skeleton).setCompleteListener((t) => {
            switch (t.animation.name) {
                case "tiger_win":
                // case "tiger_x10":
                case "tiger_collect":
                case "tiger_respin_x10_end":
                case "tiger_bigwin":
                case "tiger_respin_end_idle":
                case "tiger_reduce_miss":
                case "rs_win_idle":
                    this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "idle", true)//播放虎虎生财准备进入模式动画 
                break
                case "fx_wild_collect":
                    if(this.isWin1){
                        this.isWin1 = false;
                        this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "idle", true)//播放虎虎生财准备进入模式动画 
                    }
                    break
                case "win":
                    this.tigerObj.setPosition(0,593,0)
                    this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "idle", true)//播放虎虎生财准备进入模式动画
                    break;    
                case "win2":
                    this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "fx_wild_collect", true)//播放虎虎生财准备进入模式动画
                    break;
                case "rs_win_exit":
                // this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "idle", true)//播放虎虎生财准备进入模式动画
                    break;
                case "rs_start":
                    //this.playSpecialBet();
                    this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "rs_idle", true)//播放虎虎生财准备进入模式动画
                    break;
                case "rs_win":
                    this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "rs_win_idle", true)
                    break;
                case "bg_respin2":
                    this.hhscModeBgParticleEffect.active = true;
                    this.hhscModeRadPackEffect.children.forEach(v => v.active = true)
                    this.hhscModeBgParticleEffect.getComponent(sp.Skeleton).setAnimation(0, "in", false)
                    GameAudio.redPackEffect()
                    break;
                case "zo_exit":
                    this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "idle", true)
                    // this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "rs_idle", true)//播放虎虎生财准备进入模式动画
                    break
                case "idle1":
                    this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "idle", true)
                    break  
                    case "idle2":
                        this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "idle", true)
                        break  
                        case "idle3":
                            this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "idle", true)
                            break  
                            case "idle4":
                                this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "idle", true)
                                break    
                default:
                    break;
            }
        })
        

        // this.tigerObj.getComponent(sp.Skeleton).setStartListener((t) => {
        //     // if (t.animation.name == "tiger_idle") {
        //     //     this.tigerAvater.getComponent(UIOpacity).opacity = 255
        //     //     this.tigerObj.getComponent(UIOpacity).opacity = 0
        //     // } else {
        //     //     this.tigerAvater.getComponent(UIOpacity).opacity = 0
        //     //     this.tigerObj.getComponent(UIOpacity).opacity = 255
        //     // }
        // })


        // this.tigerObj.getComponent(sp.Skeleton).setEventListener((t, event: sp.spine.Event) => {
        //     if (event.data.name == "bg_respin2") {
        //         this.hhscModeBgParticleEffect.active = true;
        //         this.hhscModeRadPackEffect.children.forEach(v => v.active = true)
        //         this.hhscModeBgParticleEffect.getComponent(sp.Skeleton).setAnimation(0, "in", false)
        //         GameAudio.redPackEffect()
        //     }
        // })

    }

    private initNetEvent() {
        EventCenter.getInstance().listen(GameEvent.game_start_roll, this.onStartRoll, this);
        EventCenter.getInstance().listen(GameEvent.key_down_space, this.onClickSpace, this);
        EventCenter.getInstance().listen(GameEvent.key_pressing_space, this.onClickSpace, this);
        EventCenter.getInstance().listen(GameEvent.game_sleep, this.onSleep, this);
        EventCenter.getInstance().listen(BaseEvent.click_mouse, this.onClickMouse, this)
        EventCenter.getInstance().listen(GameEvent.update_game_state, this.onUpdateState, this);
        EventCenter.getInstance().listen(GameEvent.game_start_stop_roll, this.onStartStopRoll, this);
        EventCenter.getInstance().listen(GameEvent.enter_hhsc_mode, this.onEnterHHSCMode, this);
        EventCenter.getInstance().listen(GameEvent.game_roll_complete, this.onRollComplete, this);
        EventCenter.getInstance().listen(GameEvent.game_show_award_result, this.onShowAwardResult, this);
        EventCenter.getInstance().listen(GameEvent.game_show_no_award_result, this.onShowNoAwardResult, this);
        EventCenter.getInstance().listen(GameEvent.game_show_hhsc_enter_next_round, this.onShowHHSCEnterNextRound, this);
        EventCenter.getInstance().listen(GameEvent.game_show_hhsc_round_award_result, this.onShowHHSCRoundAwardResult, this);
        EventCenter.getInstance().listen(GameEvent.game_show_hhsc_award_result, this.onShowHHSCAwardResult, this);
        EventCenter.getInstance().listen(GameEvent.game_clear_award_result, this.onClearAwardResultInfo, this);
        EventCenter.getInstance().listen(GameEvent.click_element, this.onShowElementRateInfo, this);
        EventCenter.getInstance().listen(GameEvent.close_bigreward, this.onCloseBigAward, this);
        EventCenter.getInstance().listen(GameEvent.update_game_change_bet_amount, this.onChangeBetAmount, this);
        // EventCenter.getInstance().listen(GameEvent.check_game_change_bet_is_border, this.onUpdateBetBtnState, this);
        EventCenter.getInstance().listen(GameEvent.game_update_player_blance, this.onUpdatePlayerBlance, this);
        EventCenter.getInstance().listen(GameEvent.game_switch_fast, this.onSwitchFast, this);
        EventCenter.getInstance().listen(GameEvent.game_update_open_auto_roll, this.onUpdateOpenAutoRoll, this);
        EventCenter.getInstance().listen(GameEvent.game_axis_ready_roll_end, this.onGameAxisReadyRoll, this);
    }


    /**检测休息 */
    checkSleep() {
        this.unschedule(this.sendSleepEvent)
        this.scheduleOnce(this.sendSleepEvent, 30)
    }

    stopCheckSleep() {
        this.unschedule(this.sendSleepEvent)
    }

    sendSleepEvent() {
        EventCenter.getInstance().fire(GameEvent.game_sleep);
    }

    onCloseBigAward() {
        UIManager.closeView(EViewNames.ResultBigAward);
        this.playerLastResultAward()
    }

    /**初始化上局中奖结果 */
    initLastAwardResult(data: ResultAwardUIInfo) {
        if (data) {
            this.resultAwardUIInfo = data;
            for (let index = 0; index < this.hhscElementtNodes.length; index++) {
                const element = this.hhscElementtNodes[index];
                ObjPoolCom.objPoolMgr.delElement(element)
            }
            this.mask_bg.active = true;
            this.effectLayer.active = true;
            this.lineAwardElements.length = 0;
            let lineInfos = data.lineInfos;
            this.lineInfos = lineInfos;
            for (let index = 0; index < lineInfos.length; index++) {
                const lineInfo = lineInfos[index];
                for (let i = 0; i < lineInfo.ePoint.length; i++) {
                    const element = lineInfo.ePoint[i];
                    let elAward = this.addAwardElement(element.col, element.row);
                    if (elAward) {
                        if (!this.lineAwardElements[index]) {
                            this.lineAwardElements[index] = []
                        }
                        this.lineAwardElements[index].push(elAward);
                    }
                }
            }
            this.winNumAnimation.initWin(data.lastWin, data.lastshowAwardAnimationLevel);
            this.loopPlayElementAniamtion()
        }
    }

    async onShowHHSCAwardResult(data: HHSCResultAwardUIInfo) {
        this.elementCtrl.changeElementId(data.showElementResult);
        GameAudio.hhscEnd()
        await CocosUtil.wait(0.5)
        await this.onShowAwardResult(data.resultAwardUIInfo, true)
    }


    async onShowNoAwardResult(data: ResultNoAwardUIInfo) {
        if (data) {
            if (data.wdElementPosList.length > 0) {
                await this.playCollectWD(data.wdElementPosList,false);
            }
        }
        this.onUpdateState(GameState.delay)
        await CocosUtil.wait(0.5)
        if (this.state == GameState.delay) {//防止按了空格键 重新旋转改变了状态
            this.onUpdateState(GameState.wait)
            GameCtrl.getIns().checkAutoRoll()
        }
    }

    async onShowAwardResult(data: ResultAwardUIInfo, isHhsc: boolean = false) {
        this.resultAwardUIInfo = data;
        for (let index = 0; index < this.hhscElementtNodes.length; index++) {
            const element = this.hhscElementtNodes[index];
            ObjPoolCom.objPoolMgr.delElement(element)
        }
        this.hhscElementtNodes.length = 0;
        if (data.wdElementPosList.length > 0 && !isHhsc && data.x10Type == X10AnimationType.none) { //虎虎生财模式 x10 不播放收集动画
            await this.playCollectWD(data.wdElementPosList, true);
        }
        this.mask_bg.active = true;
        this.effectLayer.active = true;
        this.lineAwardElements.length = 0;
        let lineInfos = data.lineInfos;
        this.lineInfos = lineInfos;
        for (let index = 0; index < lineInfos.length; index++) {
            const lineInfo = lineInfos[index];
            for (let i = 0; i < lineInfo.ePoint.length; i++) {
                const element = lineInfo.ePoint[i];
                let elAward = this.addAwardElement(element.col, element.row);
                if (elAward) {
                    if (!this.lineAwardElements[index]) {
                        this.lineAwardElements[index] = []
                    }
                    this.lineAwardElements[index].push(elAward);
                }
            }
        }

        if (data.x10Type == X10AnimationType.none) {//普通结算动画
            await Promise.all([
                new Promise(async res => {
                    this.playTigerWinAniamtion(data.showAwardAnimationLevel)
                    await this.winNumAnimation.showWin(data.win, data.showAwardAnimationLevel);
                    res(null)
                }),
                new Promise(async res => {
                    await this.loopPlayElementAniamtion(-1, false)
                    res(null)
                }),
                new Promise(async res => {
                    if (isHhsc) {
                        await this.playTigerResultAniamtion(data)
                    }
                    res(null)
                }),
            ])
        } else { //x10结算动画
            await Promise.all([
                new Promise(async res => {
                    this.winNumAnimation.showWin(data.win, data.showAwardAnimationLevel);
                    res(null)
                }),
                new Promise(async res => {
                    if (data.x10Type == X10AnimationType.x10_quanxiao) {
                        await this.loopPlayElementAniamtion(-1, false)
                        await this.play1ElemenX10tAniamtion(data);
                    } else if (data.x10Type == X10AnimationType.hhscx10_quanxiao) {
                        this.loopPlayElementAniamtion(-1, false, false)
                        await this.play1ElemenX10tAniamtion(data);
                    } else {
                        await this.loopPlayElementAniamtion(-1, false)
                    }
                    res(null)
                }),
                new Promise(async res => {
                    let isHide = data.x10Type == X10AnimationType.x10 || data.x10Type == X10AnimationType.x10_quanxiao
                    if (isHide) {
                        this.showTigerCollectWdParticle(-1);
                        this.playFlyX10Audio();
                    }
                    await this.playTigerResultAniamtion(data)
                    // if (isHide) {
                    //     this.showTigerCollectWdParticle(this.collectWdCnt, false)
                    // }
                    res(null)
                }),
            ])
        }
        if (data.x10Type != X10AnimationType.none) {//清空收集百搭效果
            this.collectWdCnt = 0;
        }
        if (data.bigAwardNums.length > 0) {
            await UIManager.showView(EViewNames.ResultBigAward, EUILayer.Panel, { amounts: data.bigAwardNums });
            return
        }
        await this.playerLastResultAward()
    }


    async playFlyX10Audio() {
        await CocosUtil.wait(1.8)
        GameAudio.x10Fly()
    }

    onChangeBetAmount(amount: number, isShowTip: boolean = true) {
        this.getComponent(GameUI).setBetAmount(amount, true);
        let data = GameCtrl.getIns().getBetAmountState(amount)
        if (isShowTip) {
            if (data.isMax) {
                UIManager.toast("Aposta máxima")
            }
            if (data.isMin) {
                UIManager.toast("Aposta mínima")
            }
        }
        this.updateChangeBetBtnState(data)
    }

    /**更新2个按钮状态 */
    updateChangeBetBtnState(data: { isMax: boolean, isMin: boolean }) {
        CocosUtil.setNodeOpacity(this.m_ui.btn_add, data.isMax == true ? 125 : 255)
        CocosUtil.setNodeOpacity(this.m_ui.btn_minus, data.isMin == true ? 125 : 255)
    }

    onUpdatePlayerBlance(amount: number) {
        this.getComponent(GameUI).setBalanceAmount(amount);
    }

    private playFastAnima(){
        let fastAnima = this.m_ui.btn_fast.getChildByName("fastAnima");
        fastAnima.setScale(0.7,0.7,1);
        fastAnima.getComponent(UIOpacity).opacity = 255;
        this.m_ui.btn_fast.getChildByName("light").getComponent(dragonBones.ArmatureDisplay).playAnimation("newAnimation",1);
        tween(fastAnima)
            .to(1.5, { scale: v3(1.2, 1.2, 1)})
            .start()
        tween(fastAnima.getComponent(UIOpacity))
        .to(1.5, { opacity: 0})
        .start()    
    }

    private setFastOnOff(isFast: boolean) {
        // this.m_ui.btn_fast.getChildByName("ic").active = isFast;
        // this.m_ui.btn_fast.getChildByName("on").active = isFast;
        // this.m_ui.btn_fast.getChildByName("off").active = !isFast;
        let fast_tip = this.m_ui.fast_tip;
        fast_tip.active = true;
        let sp: Node
        if (isFast) {
            sp = fast_tip.getChildByName("faston")
            sp.active = true;
            fast_tip.getChildByName("fastoff").active = false;
            fast_tip.getChildByName("Label").getComponent(Label).string = "Rodada turbo ativada";
            this.m_ui.btn_fast.getChildByName("light").active = true;
            this.m_ui.btn_fast.getChildByName("light").getComponent(dragonBones.ArmatureDisplay).playAnimation("newAnimation",1);
        } else {
            sp = fast_tip.getChildByName("fastoff")
            fast_tip.getChildByName("faston").active = false;
            sp.active = true;
            fast_tip.getChildByName("Label").getComponent(Label).string = "Rodada turbo desativada";
        }

        sp.getComponent(Sprite).enabled = false;
        Tween.stopAllByTarget(fast_tip);
        fast_tip.scale = v3(1.1, 1.1, 1);
        tween(fast_tip)
            .to(0.1, { scale: v3(1.3, 1.3, 1) })
            .to(0.1, { scale: v3(1.1, 1.1, 1) })
            .call(() => {
                sp.getComponent(Sprite).enabled = true;
            })
            .delay(3)
            .call(() => {
                fast_tip.active = false;
            })
            .start();
    }

    /**播放全屏元素渐变 */
    playElementFullSceneOpacityEffect() {
        return new Promise((res) => {
            tween(this.ndElementFullSceneEffect.getComponent(UIOpacity))
                .to(1.2, { opacity: 0 })
                .call(() => {
                    this.ndElementFullSceneEffect.destroy();
                    this.ndElementFullSceneEffect = null;
                    res(null)
                })
                .start()
        })
    }

    /**播放最后的结算动画 */
    async playerLastResultAward() {
        this.elementCtrl.rollAxisList.forEach(v => v.elementList.forEach(e => e.node.active = true))//这个是可能之前播放X10元素大特效 把元素隐藏了 现在要重置回来

        let showWinFrame: boolean = false;
        if (this.ndElementFullSceneEffect) {
            this.loopPlayElementAniamtion(-1, false)
            await Promise.all([
                new Promise(async res => {
                    await CocosUtil.wait(0.1)
                    if (this.resultAwardUIInfo.x10Type != X10AnimationType.none) {
                        showWinFrame = true
                        this.winNumAnimation.showWin(this.resultAwardUIInfo.lastWin, this.resultAwardUIInfo.lastshowAwardAnimationLevel);
                    }
                    res(null)
                }),
                this.playElementFullSceneOpacityEffect(),
                this.playHhscEndSceneAnimation(),
            ])
            await CocosUtil.wait(0.5)
        } else if (this.curMode == GameMode.hhsc) {
            await this.playHhscEndSceneAnimation()
        }
        if (!showWinFrame) {
            if (this.resultAwardUIInfo.x10Type != X10AnimationType.none) {
                this.winNumAnimation.showWin(this.resultAwardUIInfo.lastWin, this.resultAwardUIInfo.lastshowAwardAnimationLevel);
            }
        }
        if(!this.isWin1){
            this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "idle", true)
        }
        //
        this.showTigerCollectWdParticle(this.collectWdCnt, false)
        this.curMode = GameMode.normal;
        GameAudio.switchBgm(BgmType.normal);
        this.hhscModeBgLightEffect.active = false;
        this.hhscModeBgParticleEffect.active = false;
        this.playAddWinAnimation()//播放加钱奖金
        this.onUpdateState(GameState.delay)
        await CocosUtil.wait(0.7)
        if (this.state == GameState.delay) {//防止按了空格键 重新旋转改变了状态
            this.onUpdateState(GameState.wait)
            GameCtrl.getIns().checkAutoRoll()
            await this.loopPlayElementAniamtion()
        }
    }

    playAddWinAnimation() {
        this.getComponent(GameUI).playAddWinAnimation(this.resultAwardUIInfo.lastWin)
        this.getComponent(GameUI).playAddBlanceAnimation(this.resultAwardUIInfo.balance)
    }

    /**显示当前一轮虎虎生财结果 */
    onShowHHSCRoundAwardResult(data: ResultHHSCAwardUIInfo) {
        this.effectLayer.active = true;
        data.awardLines.forEach(v => {
            this.awardLineIdxs[v].active = true;
        })
        if (data.isNewLine) {
            GameAudio.hhscRoundEndWinLine(this.hhscRoundCnt);
            this.hhscRoundCnt++;
        }
        data.allElements.forEach(v => {
            let elCom = this.elementCtrl.getElementNode(v.col, v.row);
            if (elCom.id) {
                let elm = ObjPoolCom.objPoolMgr.createElement()
                let com = elm.getComponent(ElementCom)
                com.init(elCom.id);
                com.updateIcon(false)
                if (v.isAward) {
                    com.showHhscAward();
                }
                let pos = CocosUtil.convertSpaceAR(elCom.node, this.hhscElementtLayer);
                elm.position = pos;
                this.hhscElementtNodes.push(elm)
                this.hhscElementtLayer.addChild(elm)
                elCom.init(0)
                elCom.updateIcon(false)
            }
        })
        GameCtrl.getIns().checkHHSCNextRoundAward()
    }

    /**播放百搭元素收集身上光特效 */
    async playerWdLightEffect(elCom: ElementCom) {
        let wdLightCollectEffec = ObjPoolCom.objPoolMgr.createWdLightCollectEffect()
        elCom.addEffect(wdLightCollectEffec)
        wdLightCollectEffec.getComponent(WdLightCollectEffect).playerEffect();
        await CocosUtil.wait(0.5)
        ObjPoolCom.objPoolMgr.delWdLightCollect1Effect(wdLightCollectEffec)
    }

    /**播放百搭粒子飞行特效 */
    async playWdParticleFlyEffect(col, row, i) {
        return new Promise(async res => {
            let elCom = this.elementCtrl.getElementNode(col, row);
            if (i == 0) {
                GameAudio.wdCollect1()
            }
            this.playerWdLightEffect(elCom)
            let elm = ObjPoolCom.objPoolMgr.createWdParticle()
            let pos = CocosUtil.convertSpaceAR(elCom.node, this.m_ui.other_effect);
            let bone = this.getTigerCollgetParticlePos()
            let targetPos = CocosUtil.convertSpaceAR(this.tigerObj, this.m_ui.other_effect, bone.x, bone.y);
            let startPos = pos.add3f(-40, 0, 0);
            elm.position = startPos;
            let ctrlPoint = CtrlPoints[col][row];
            let endPoint = targetPos;
            CocosUtil.playTween(elm, 0.5, startPos, ctrlPoint, endPoint, () => {
                GameAudio.wdCollect2()
                ObjPoolCom.objPoolMgr.delWdParticle(elm)
                res(null)
            }, "linear")
            this.m_ui.other_effect.addChild(elm)
        })
    }

    /**显示 老虎身上的粒子特效类型*/
    showTigerCollectWdParticle(collecWdCnt: number, isPlay: boolean = true) {
        this.tigerCollecPartileEffect1.active = false;
        this.tigerCollecPartileEffect2.active = false;
        if (collecWdCnt == 0) {
            this.tigerCollecEffect.active = true;
            this.tigerCollecEffect.getComponent(sp.Skeleton).setAnimation(0, "idle_light", true)
        } else if (collecWdCnt >= 10) {
            if (isPlay) {
                let effect = ObjPoolCom.objPoolMgr.createWdCollectBoom();
                this.particleEffectLayer.addChild(effect)
                effect.getComponent(sp.Skeleton).setAnimation(0, "getwild1", false)
                effect.getComponent(sp.Skeleton).setCompleteListener(() => {
                    ObjPoolCom.objPoolMgr.delWdCollectBoom(effect)
                })
            }
            this.tigerCollecPartileEffect2.active = true;
        } else if (collecWdCnt > 0) {
            if (isPlay) {
                let effect = ObjPoolCom.objPoolMgr.createWdCollectBoom();
                this.particleEffectLayer.addChild(effect)
                effect.getComponent(sp.Skeleton).setAnimation(0, "getwild2", false)
                effect.getComponent(sp.Skeleton).setCompleteListener(() => {
                    ObjPoolCom.objPoolMgr.delWdCollectBoom(effect)
                })
            }
            this.tigerCollecPartileEffect1.active = true;
        } else {
            this.tigerCollecEffect.active = false;
        }
    }

    /**播放收集百搭粒子特效 */
    async playCollectWD(wdElementPosList: Array<EPoint>,isWin) {
        wdElementPosList.sort((t1, t2) => {
            if (t2.row == t1.row) {
                return t1.col - t2.col
            } else {
                return t2.row - t1.row
            }
        })
        await Promise.all(wdElementPosList.map((v, i) => new Promise(async res => {
            await CocosUtil.wait(0.2 * i)
            await this.playWdParticleFlyEffect(v.col, v.row, i)
            this.collectWdCnt++
            this.showTigerCollectWdParticle(this.collectWdCnt)
            this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "wild_collect", false)
            res(null)
        })))
        if(!isWin){
            await CocosUtil.wait(0.2 * wdElementPosList.length + 0.5)
            this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "idle", true)
        }
    }

    getTigerCollgetParticlePos() {
        for (let index = 0; index < this.tigerObj.getComponent(sp.Skeleton).sockets.length; index++) {
            const element = this.tigerObj.getComponent(sp.Skeleton).sockets[index];
            if (element.path == "root/zong/hongbao/put_light") {
                return element.target.position;
            }
        }
    }

    /**播放老虎赢钱动画 */
    playTigerWinAniamtion(showAwardAnimationLevel: number) {
        if (showAwardAnimationLevel == 1) {
            this.isWin1 = true;
            this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "win", false)
            tween(this.tigerObj)
            .to(0.1, { position: v3(0,602,0) })
            .start();
        } else {
            this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "win2", false)
            GameAudio.bigPlayerAward()
        }
    }

    async playRsIdle(){
        await CocosUtil.wait(2)
        this.specialBet.getComponent(UIOpacity).opacity = 0;
        this.specialBet.active = true;
        this.specialBet.setPosition(0,695);
        tween(this.specialBet)
        .to(0.5, { scale: v3(1,1,1) })
        .to(0.5, { scale: v3(0.4,0.4,0.4) })
        .start();
        tween(this.specialBet.getComponent(UIOpacity))
        .to(0.5, { opacity: 255 })
        .delay(1)
        .call(() => {
            tween(this.specialBet)
            .to(0.5, { position: v3(0, 655, 0) }, { easing: easing.smooth })
            .start()
        })
        .start();
    }

    /**进入虎虎生财模式 */
    async onEnterHHSCMode(data: EnterHHSCModeUIInfo) {
        this.hhscRoundCnt = 1;
        this.curMode = GameMode.hhsc;
        AudioManager.inst.pauseBGM()
        this.marquee.showHHSCTip()
        this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "zo_idle", false)//播放虎虎生财准备进入模式动画
        tween(this.tigerObj)
            .delay(1.3)
            .call(() => {
                this.tigerLight.active = true;
                this.hhhscSceneAnimation.resume()
                let clip = this.hhhscSceneAnimation.clips[4];
                this.hhhscSceneAnimation.play(clip.name)
                this.playRsIdle();
                this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "rs_idle", true)//播放虎虎生财准备进入模式动画
            })
            .start()
        //this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "tiger_respin", false)//播放虎虎生财准备进入模式动画
        this.playHhscStartSceneAnimation()
        this.hideTigerCollectWdParticle()
        this.switchHhscBgm()
        this.onUpdateState(GameState.hhsc_roll_start)
        await this.playHHSCModeRedPackRaffle(data.elementId);
        this.playHHSCModeRollEffect()
        this.elementCtrl.setRandomElementList([0, 1])//控制接下来的滚动只出现空元素与百搭
        this.onUpdateState(GameState.hhsc_roll)
        await this.hhscWaitTask.wait(2)
        this.marquee.showHHSCElement(data.elementId)
        this.onStartStopRoll({ data: data.showElementResult })
        this.elementCtrl.setRandomElementList([0, 1, data.elementId])//控制接下来的滚动只出现空元素与百搭
    }


    /**进入下一轮虎虎生财模式 */
    async onShowHHSCEnterNextRound(datas) {
        this.onUpdateState(GameState.hhsc_roll)
        this.onStartRoll(false)
        await this.hhscWaitTask.wait(2)
        this.onStartStopRoll(datas)
    }

    /**快速停止虎虎生财一回合 */
    quickStopHhsc() {
        if (this.curMode != GameMode.hhsc) {
            return;
        }
        this.hhscWaitTask.cancel()
        this.onUpdateState(GameState.cancel_roll)
    }

    async switchHhscBgm() {
        await CocosUtil.wait(1)
        GameAudio.switchBgm(BgmType.hhsc);
    }

    //隐藏红包粒子
    async hideTigerCollectWdParticle() {
        await CocosUtil.wait(2.5)//等待几秒与红包同步
        this.showTigerCollectWdParticle(-1)
    }

    /**播放红包抽奖动画 
     * id 是抽中哪个元素
    */
    playHHSCModeRedPackRaffle(id: number) {
        return new Promise(res => {
            this.hhscModeRadPackEffect.active = true
            this.hhscModeRadPackEffect.children.forEach(v => v.active = false)
            this.hhscModeRadPackEffect.getComponent(sp.Skeleton).setAnimation(0, RedPackOpenAnimationNames[id], false)
            this.hhscModeRadPackEffect.getComponent(sp.Skeleton).setCompleteListener((t) => {
                this.hhscModeRadPackEffect.active = false;
                res(null)
            })
        })
    }


    /**播放虎虎身材 元素滚动光效动画 */
    playHHSCModeRollEffect() {
        this.hhscModeRollEffect.active = true;
        this.hhscModeRollEffect.getComponent(sp.Skeleton).setAnimation(0, "animation", false)
        GameAudio.hhscJuanZhouLigth()
    }

    /**播放 老虎结算动画 */
    playTigerResultAniamtion(data: ResultAwardUIInfo) {
        return new Promise(async res => {
            let time: number = 0;
            let aniName = "win2"
            if (data.x10Type == X10AnimationType.x10 || data.x10Type == X10AnimationType.x10_quanxiao) {
                time = 2.8
                aniName = "win2"
                this.playCommon10Ani()
            } else if (data.x10Type == X10AnimationType.hhscx10_quanxiao) {
                time = 1.5
                aniName = "rs_win"
                this.play10WinEnd();
            } else if (data.x10Type == X10AnimationType.none) {
                time = 0
                aniName = "rs_win"
                this.playWinEnd();
            } else {
                res(null)
            }
            this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, aniName, false)
            await CocosUtil.wait(time)
            res(null)
        })
    }

    playSpecialBet(){//
        this.specialBet.getComponent(UIOpacity).opacity = 0;
        tween(this.specialBet.getComponent(UIOpacity))
        .to(0.3, {opacity: 255 })
        .start();
         tween(this.specialBet)
        .to(0.3, { scale: v3(1.2,1.2,1.2)})
        .delay(0.3)
        .set({ active: true })
        .call(() => {
            
        })
        .to(0.1, { scale: v3(0.5,0.5,0.5), position: v3(0, 695, 0) })
        .to(0.1, { scale: v3(0.6,0.6,0.6) })
        .to(0.5, { scale: v3(0.8,0.8,0.8), position: v3(0, 95, 0) })
        .call(() => {
            this.specialBet!.active = false;
            this.specialBet?.setPosition(0, 680, 0);
            this.specialBet.setScale(0.4,0.4,0.4)
        })
        .start();
    }

    async playWinEnd(){
        await CocosUtil.wait(0.5)
        tween(this.specialBet)
        .to(0.1, { position: v3(2, 657, 0)})
        .to(0.1, { position: v3(-2, 653, 0)})
        .to(0.1, { position: v3(2, 657, 0)})
        .to(0.1, { position: v3(-2, 653, 0)})
        .delay(0.3)
        .call(() => {
            tween(this.specialBet.getComponent(UIOpacity))
            .to(0.5, {opacity: 0 })
            .call(() => {
                this.tigerLight.active = false;
            })
            .start()
        })
        .start()
    }

    async play10WinEnd(){
        this.specialBet.active = false;
        this.specialBet.getComponent(UIOpacity).opacity = 0;
        this.specialBet2.setPosition(0,655,0);
        this.specialBet2.active = true;
        tween(this.specialBet2)
        .to(0.3, { position: v3(0, 695, 0), scale: v3(1,1,1)})
        .to(0.1, { position: v3(0, 695, 0), scale: v3(0.9,0.9,0.9)})
        .delay(0.2)
        .to(0.5, { position: v3(0, 95, 0)})
        .call(() => {
            this.specialBet2!.active = false;
            this.tigerLight.active = false;
        })
        
        .start()
    }

    async playCommon10Ani(){
        await CocosUtil.wait(0.5)
        tween(this.common10Ani)
                .delay(0.3)
                //.set({ active: true })
                .to(0.3, { scale: v3(1.2,1.2,1.2)})
                .to(0.1, { scale: v3(1,1,1) })
                .to(0.6, { scale: v3(0.8,0.8,0.8), position: v3(0, -290, 0) }, { easing: easing.smooth })
                .call(() => {
                    this.common10Ani.setScale(0,0);
                    this.common10Ani?.setPosition(-213, 524, 0);
                })
                .start();
    }

    /**播放虎虎身材 背景光效动画 */
    playHHSCModeBgLightEffect() {
        this.hhscModeBgLightEffect.active = true;
        this.hhscModeBgLightEffect.getComponent(sp.Skeleton).setAnimation(0, "in", false)
    }

    /**播放单元素x10动画*/
    async play1ElemenX10tAniamtion(data: ResultAwardUIInfo) {
        //await CocosUtil.wait(1.2)//等待元素播放一定时间后再播放大动效
        let node = instantiate(this.preElementFullSceneEffect)
        this.m_ui.other_effect.addChild(node)
        this.lineAwardElements.forEach(e => e.forEach(v => v.node.active = false))
        this.awardLineIdxs.forEach((v, k) => v.active = false)
        this.elementCtrl.rollAxisList.forEach(v => v.elementList.forEach(e => e.node.active = false))
        this.ndElementFullSceneEffect = node;
        node.getComponent(ElementFullSceneXiaoChuEffect).player(data.x10ElementId);
        GameAudio.x10Element()
    }

    /**通过编号播放对应的元素动画 默认0*/
    async loopPlayElementAniamtion(idx: number = 0, isLoop: boolean = true, isPlayAward: boolean = true) {
        if (this.lineAwardElements.length == 0) {
            return
        }
        GameAudio.winLine()
        this.awardLineIdxs.forEach((v, k) => v.active = idx != -1 ? this.lineInfos[idx].idx - 1 == k : this.lineInfos.some(v1 => v1.idx - 1 == k))
        this.lineAwardElements.forEach(e => e.forEach(v => v.node.active = false))
        this.showLineWinLabel.node.active = false;
        this.showLineWinLabelBg.active = false;
        let showAwards: AwardElementCom[] = [];
        if (idx == -1) {
            this.lineAwardElements.forEach(e => e.forEach(v => {
                showAwards.push(v)
            }))
        } else {
            this.lineAwardElements[idx]?.forEach((v, i) => {
                showAwards.push(v)
                if (i == 1) {
                    this.showLineWinLabel.node.active = true;
                    this.showLineWinLabelBg.active = true;
                    if (this.lineInfos[idx].idx == 3) {
                        // v.showWinNum(this.lineInfos[idx].win, -20)
                        let pos = CocosUtil.convertSpaceAR(v.node, this.m_ui.other_effect, 0, -20)
                        this.showLineWinLabelBg.position = pos;
                        this.showLineWinLabel.node.position = pos;
                        this.showLineWinLabel.string = MoneyUtil.rmbStr(this.lineInfos[idx].win)
                    } else {
                        let pos = CocosUtil.convertSpaceAR(v.node, this.m_ui.other_effect, 0, -66)
                        this.showLineWinLabelBg.position = pos;
                        this.showLineWinLabel.node.position = pos;
                        this.showLineWinLabel.string = MoneyUtil.rmbStr(this.lineInfos[idx].win)
                    }
                }
            })
        }
        showAwards.forEach((v) => v.node.active = true)
        if (isLoop) {
            if (isPlayAward) {
                await Promise.all(showAwards.map(v => v.playAward()))
            }
            if (idx >= this.lineAwardElements.length - 1) {
                idx = -1;
            } else {
                idx++;
            }
            await this.loopPlayElementAniamtion(idx)
        } else {
            await CocosUtil.wait(0.3)
            if (isPlayAward) {
                showAwards.forEach(v => v.playAward())
            }
        }
    }

    onClearAwardResultInfo() {
        this.showLineWinLabel.node.active = false;
        this.showLineWinLabelBg.active = false;
        this.isCurRoundPlayWdElementAudio = false;
        this.getComponent(GameUI).setWinAmount(0)
        this.awardLineIdxs.forEach(v => v.active = false)
        this.lineAwardElements.forEach(e => e.forEach(v => GameView.objPool.delAwardElement(v.node)))
        this.lineAwardElements.length = 0;
        this.effectLayer.active = false;
        this.mask_bg.active = false;
        this.elementCtrl.restRandomElementList();
        this.winNumAnimation.hideWin()
        this.marquee.randomPlayPollingTip()
    }

    /**显示元素赔率提示 */
    onShowElementRateInfo(idx: number, id: number) {
        if (this.state != GameState.wait || id == 0) {
            return;
        }
        this.clickElementRateTip.showTip(idx, id)
        GameAudio.clickShowRateTip()
    }

    addAwardElement(col: number, row: number) {
        let elCom = this.elementCtrl.getElementNode(col, row);
        if (elCom?.id) {
            let awardElement = GameView.objPool.createAwardElement();
            let com = awardElement.getComponent(AwardElementCom)
            com.init(elCom.id);
            let pos = CocosUtil.convertSpaceAR(elCom.node, this.effectLayer);
            awardElement.position = pos;
            this.effectLayer.addChild(awardElement)
            return com
        }
    }


    /**滚动完成 */
    onRollComplete() {
        GameCtrl.getIns().showResultAward()
        AudioManager.inst.stopMusic()
        if (this.curRoundQuickStop) {
            GameAudio.quickStopSpin()
        }
    }

    async onStartStopRoll(info: { data: any, isTriggerHHSCAnimation?: boolean, isFast?: boolean }) {
        let datas = info.data
        if (info.isTriggerHHSCAnimation) { //客户端触发虎虎生财动画
            this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "zo_idle", true)
            tween(this.tigerObj)
            .delay(1.8)
            .call(() => {
                this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "zo_exit", false)//播放虎虎生财准备进入模式动画
            })
            .start()
            await Promise.all([
                this.playHhscStartSceneAnimation1(),
                new Promise(async res => {
                    await CocosUtil.wait(1.5)
                    res(null)
                })
            ])
            GameAudio.hhscMiss()
            this.playHhscEndSceneAnimation1()
        }
        this.curRoundQuickStop = info.isFast;
        this.elementCtrl.stopRoll(datas, info.isFast)
    }



    onClickMouse(name: string) {
        if (name != "btn_spine") {
            GameAudio.clickSystem();
        }
    }

    onStartRoll(isFast: boolean) {
        this.clickElementRateTip.hideTip();
        this.elementCtrl.startRoll(isFast)
        GameAudio.juanzhouRoll()
    }

    enabledButton(button: Button, enabled: boolean) {
        button.interactable = enabled;
        CocosUtil.setNodeOpacity(button.node, enabled ? 255 : 110)
    }

    onUpdateState(state: GameState) {
        if (this.state == state) {
            return;
        }
        if (!this.m_ui.sb_auto.active) {
            this.enabledButton(this.m_ui.btn_auto.getComponent(Button), state == GameState.wait)
        } else {
            this.m_ui.btn_auto.getComponent(Button).interactable = state == GameState.wait
        }
        this.enabledButton(this.m_ui.btn_minus.getComponent(Button), state == GameState.wait)
        this.enabledButton(this.m_ui.btn_add.getComponent(Button), state == GameState.wait)
        this.enabledButton(this.m_ui.btn_show_menu.getComponent(Button), state == GameState.wait)
        this.m_ui.btn_spin.getComponent(Button).interactable = (state == GameState.wait || state == GameState.roll)
        this.m_ui.open_setting_bet.getComponent(Button).interactable = state == GameState.wait
        this.m_ui.open_banlace.getComponent(Button).interactable = state == GameState.wait
        this.m_ui.open_history.getComponent(Button).interactable = state == GameState.wait
        switch (state) {
            case GameState.wait:
                let amount = GameCtrl.getIns().getModel().getCurBetAmount()
                let data = GameCtrl.getIns().getBetAmountState(amount);
                this.updateChangeBetBtnState(data);
                this.checkSleep();
                this.getComponent(GameUI).setLabelColor(true)
                this.m_ui.spine_spin_effect.getComponent(sp.Skeleton).setAnimation(0, "anniu_idle", true)
                break;
            case GameState.roll:
                this.stopCheckSleep();
                this.getComponent(GameUI).setLabelColor(false)
                this.clickEffectFrame.active = true;
                this.clickEffectFrame.getComponent(sp.Skeleton).setAnimation(0, "animation", false)
                break;
            case GameState.show_result:
                this.stopCheckSleep();
                this.m_ui.spine_spin_effect.getComponent(sp.Skeleton).setAnimation(0, "stop", true)
                break;
            case GameState.cancel_roll:
                this.stopCheckSleep();
                this.m_ui.spine_spin_effect.getComponent(sp.Skeleton).setAnimation(0, "click_speed", false)
                break;
            default:
                this.stopCheckSleep();
                break;
        }
        this.state = state;
    }

    onSpin() {
        if (this.state == GameState.wait) {
            GameAudio.startSpin()
            this.m_ui.spine_spin_effect.getComponent(sp.Skeleton).setAnimation(0, "anniu_click", false)
            GameCtrl.getIns().reqRoll();
        } else if (this.state == GameState.roll) {
            GameCtrl.getIns().cancelDelayShowResult()
        }
    }

    /**空格键 */
    onClickSpace() {
        if (this.state == GameState.wait || this.state == GameState.delay) {
            if (this.m_ui.sb_auto.active) {
                GameCtrl.getIns().cancelAutoRoll()
            } else {
                GameAudio.startSpin()
                this.m_ui.spine_spin_effect.getComponent(sp.Skeleton).setAnimation(0, "anniu_click", false)
                GameCtrl.getIns().reqRoll();
            }
        } else if (this.state == GameState.roll) {
            GameCtrl.getIns().cancelDelayShowResult()
        } else if (this.state == GameState.hhsc_roll) {
            this.quickStopHhsc()
        }
    }


    onOpenFast() {
        GameCtrl.getIns().switchFast(true)
        GameAudio.clickSystem()
    }

    onCloseFast() {
        GameCtrl.getIns().switchFast(false)
        GameAudio.clickSystem()
    }

    /**播放虎虎生财场景缩放 虚晃一下 开始动画 */
    playHhscStartSceneAnimation1() {
        return new Promise(res => {
            GameAudio.scaleJuanZhou()
            this.hhhscSceneAnimation.resume()
            let clip = this.hhhscSceneAnimation.clips[2];
            this.hhhscSceneAnimation.play(clip.name)
            this.hhhscSceneAnimation.once(Animation.EventType.FINISHED, (eName, obj: AnimationState) => {
                if (obj.name == clip.name) {
                    res(null)
                }
            }, this)
        })
    }

    /**播放虎虎生财场景缩放 开始动画 */
    playHhscStartSceneAnimation() {
        return new Promise(res => {
            GameAudio.scaleJuanZhou()
            this.hhhscSceneAnimation.resume()
            let clip = this.hhhscSceneAnimation.clips[0];
            this.hhhscSceneAnimation.play(clip.name)
            this.hhhscSceneAnimation.once(Animation.EventType.FINISHED, (eName, obj: AnimationState) => {
                if (obj.name == clip.name) {
                    res(null)
                }
            }, this)
        })
    }

    /**播放虎虎生财场景缩放 结束动画 */
    playHhscEndSceneAnimation1() {
        return new Promise(res => {
            this.hhhscSceneAnimation.resume()
            let clip = this.hhhscSceneAnimation.clips[3];
            this.hhhscSceneAnimation.play(clip.name)
            this.hhhscSceneAnimation.once(Animation.EventType.FINISHED, (eName, obj: AnimationState) => {
                if (obj.name == clip.name) {
                    res(null)
                }
            }, this)
        })
    }
    /**播放虎虎生财场景缩放 结束动画 */
    playHhscEndSceneAnimation() {
        return new Promise(res => {
            this.hhhscSceneAnimation.resume()
            let clip = this.hhhscSceneAnimation.clips[1];
            this.hhhscSceneAnimation.play(clip.name)
            this.hhhscSceneAnimation.once(Animation.EventType.FINISHED, (eName, obj: AnimationState) => {
                if (obj.name == clip.name) {
                    res(null)
                }
            }, this)
        })
    }

    onOpenUIAuto() {
        GameCtrl.getIns().openUIAuto();
        GameAudio.clickSystem()
    }

    onCancelAutoRoll() {
        GameCtrl.getIns().cancelAutoRoll();
    }

    onOpenSettingBet() {
        GameCtrl.getIns().openUISettingBet();
        this.switchMenu(true, false);
        GameAudio.clickSystem()
    }

    onOpenBanlance() {
        GameCtrl.getIns().openUIBanlance();
        this.switchMenu(true, false);
        GameAudio.clickSystem()
    }

    onOpenHistory() {
        GameCtrl.getIns().openUIHistory();
        this.switchMenu(true, false);
        GameAudio.clickSystem()
    }

    onBtnMenu() {
        this.switchMenu(false, true);
        GameAudio.clickSystem()
    }

    onCloseBtnMenu() {
        this.switchMenu(true, true);
        GameAudio.clickSystem()
    }

    initFastState(isOpen: boolean) {
        this.m_ui.btn_fast.active = isOpen;
        this.m_ui.close_fast.active = !isOpen
    }

    /**设置急速按钮状态 */
    onSwitchFast(isOpen: boolean) {
        this.m_ui.btn_fast.active = isOpen;
        this.m_ui.close_fast.active = !isOpen
        this.setFastOnOff(isOpen)
    }


    onGameAxisReadyRoll(idx: number) {
        if (this.curMode == GameMode.hhsc) {
            return
        }
        if (!this.isCurRoundPlayWdElementAudio) {
            let isContainWdElement = GameCtrl.getIns().isContainWdElementByCol(idx)
            if (isContainWdElement) {
                this.isCurRoundPlayWdElementAudio = true
                GameAudio.wdChuxian()
                return;
            }
        }
        GameAudio.stopAxisRoll()
    }

    onUpdateOpenAutoRoll(isOpen: boolean, cnt: number = 0) {
        this.m_ui.btn_spin.active = !isOpen
        this.m_ui.sb_auto.active = isOpen
        if (isOpen) {
            this.m_ui.ui_zidong.getComponent(sp.Skeleton).setAnimation(0, "zidong_b", false)
        } else {
            this.enabledButton(this.m_ui.btn_auto.getComponent(Button), this.state == GameState.wait)
            this.m_ui.ui_zidong.getComponent(sp.Skeleton).setAnimation(0, "zidong_a", false)
        }
        this.m_ui.sb_auto.getChildByName("auto_cnt").getComponent(Label).string = cnt + "";
    }


    onSleep() {
        this.scheduleOnce(() => {
            this.checkSleep()
        }, 0)
        let idx = MathUtil.getRandomInt(1, 4);
        this.tigerObj.getComponent(sp.Skeleton).setAnimation(0, "idle" + idx, false)
        if (idx == 1) {
            GameAudio.sleep()
        }
    }

    onStop() {
        // this.elementCtrl.stopRoll()
    }

    onAddBetAmount() {
        GameCtrl.getIns().addBetAmount();
    }


    private onBtnVoice() {
        GameAudio.clickSystem()
        let bEnable = !AudioManager.inst.musicEnable;
        GameCtrl.getIns().switchAudio(bEnable).then(() => {
            this.refreshVoice();
        })
    }

    onBtnQuit() {
        let info = new ParamConfirmDlg("quit_game", "Você tem certeza que deseja sair do jogo?", EDialogType.ok_cancel, (menuId: EDialogMenuId) => {
            if (menuId == EDialogMenuId.ok) {
                location.reload();
            }
        });
        UIManager.showView(EViewNames.UIConfirmDialog, EUILayer.Dialog, info);
        GameAudio.clickSystem()
    }

    /**快速停止 */
    onClickQuickStop(event: EventTouch) {
        event.preventSwallow = true
        if (this.state == GameState.roll) {
            GameCtrl.getIns().cancelDelayShowResult()
        } else if (this.state == GameState.hhsc_roll) {
            let pos1 = v3(event.touch.getUILocationX(), event.touch.getUILocationY(), 0)
            let pos2 = this.m_ui.click_quick_stop_effect.parent.getComponent(UITransform).convertToNodeSpaceAR(pos1);
            this.m_ui.click_quick_stop_effect.setPosition(pos2)
            this.m_ui.click_quick_stop_effect.active = true;
            this.m_ui.click_quick_stop_effect.getComponent(sp.Skeleton).setAnimation(0, "animation", false)
            this.quickStopHhsc()
        }
    }

    onMouseEnterSpin() {
        if (this.state != GameState.wait) {
            return;
        }
        this.m_ui.wai_light_manual.getComponent(sp.Skeleton).setToSetupPose()
        this.m_ui.wai_light_auto.getComponent(sp.Skeleton).setToSetupPose()
        this.m_ui.wai_light_manual.active = true;
        this.m_ui.wai_light_auto.active = true;
        this.m_ui.wai_light_manual.getComponent(sp.Skeleton).setAnimation(0, "auto", true)
        this.m_ui.wai_light_auto.getComponent(sp.Skeleton).setAnimation(0, "manual", true)
    }

    onMouseLeaveSpin() {
        this.m_ui.wai_light_manual.active = false;
        this.m_ui.wai_light_auto.active = false;
    }

    private refreshVoice() {
        let bEnable = GameCtrl.getIns().getModel().isOpenAudio()
        this.m_ui.ic_soundoff_off.active = !bEnable
        AudioManager.inst.setAllEnabled(bEnable);
        this.m_ui.btn_voice.getChildByName("btn_voice_on").active = bEnable;
        this.m_ui.btn_voice.getChildByName("btn_voice_off").active = !bEnable;
        if (this.curMode == GameMode.hhsc) {
            GameAudio.switchBgm(BgmType.hhsc);
        } else {
            GameAudio.switchBgm(BgmType.normal);
        }
    }

    onReduceBetAmount() {
        GameCtrl.getIns().reduceBetAmount();
    }

    private switchMenu(bOp: boolean, bAni: boolean = true) {
        this.m_ui.main_btn.active = bOp;
        let moveY = 30
        Tween.stopAllByTarget(this.m_ui.main_anim);
        Tween.stopAllByTarget(this.m_ui.menu2);
        if (!bAni) {
            this.m_ui.menu2.getComponent(UIOpacity).opacity = 255
            this.m_ui.main_anim.getComponent(UIOpacity).opacity = 255
            this.m_ui.main_anim.active = bOp;
            this.m_ui.menu2.active = !bOp
            this.m_ui.main_anim.position = v3(0, 0, 0)
            this.m_ui.menu2.position = v3(0, bOp ? -moveY : moveY, 0)
            this.m_ui.main_anim.position = v3(0, bOp ? 0 : -moveY, 0)
            return
        }
        let moveY1 = 150
        this.m_ui.main_anim.active = true
        this.m_ui.menu2.active = true
        this.m_ui.menu2.getComponent(UIOpacity).opacity = bOp ? 255 : 0
        this.m_ui.main_anim.getComponent(UIOpacity).opacity = bOp ? 0 : 255
        tween(this.m_ui.main_anim)
            .by(0.2, { position: v3(0, bOp ? moveY1 : -moveY1, 0) })
            .start()
        tween(this.m_ui.main_anim.getComponent(UIOpacity))
            .to(0.2, { opacity: bOp ? 255 : 0 })
            .call(() => {
                this.m_ui.main_anim.active = bOp;
            })
            .start()
        tween(this.m_ui.menu2)
            .by(0.2, { position: v3(0, bOp ? -moveY1 : moveY1, 0) })
            .call(() => {
                this.m_ui.menu2.active = !bOp
            })
            .start()

        tween(this.m_ui.menu2.getComponent(UIOpacity))
            .to(0.2, { opacity: bOp ? 0 : 255 })
            .start()
    }

    protected update(dt: number): void {
        if(GameCtrl.getIns().isFast){
            this.fastAnimaTime += dt;
            if(this.fastAnimaTime > 3){
                this.fastAnimaTime = 0;
                this.playFastAnima();
            }
        }
    }
}


