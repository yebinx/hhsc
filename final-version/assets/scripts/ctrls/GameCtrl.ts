import { game } from "cc";
import { EViewNames } from "../configs/UIConfig";
import GameConst, { GameState } from "../define/GameConst";
import Routes from "../define/Routes";
import GameEvent from "../event/GameEvent";
import { THhscBetReq, THhscBetRsp } from "../interface/bet";
import { ServerResult } from "../interface/common";
import { THhscRecordDetailReq, THhscRecordDetailRsp } from "../interface/recorddetail";
import { THhscRecordListReq, THhscRecordListRsp } from "../interface/recordlist";
import { THhscGameInfo, THhscUserInfoRsp } from "../interface/userinfo";
import CocosUtil from "../kernel/compat/CocosUtil";
import { UIManager } from "../kernel/compat/view/UImanager";
import { EDialogMenuId, EDialogType, EUILayer, ParamConfirmDlg } from "../kernel/compat/view/ViewDefine";
import EventCenter from "../kernel/core/event/EventCenter";
import logger from "../kernel/core/logger";
import { EHttpResult } from "../kernel/core/net/NetDefine";
import MathUtil from "../kernel/core/utils/MathUtil";
import HttpMgr from "../mgrs/HttpMgr";
import RecordMgr from "../mgrs/RecordMgr";
import GameModel, { GameMode, HHSCResultAwardUIInfo, X10AnimationType } from "../models/GameModel";
import BaseCtrl from "./BaseCtrl";
import LoginCtrl from "./LoginCtrl";
import { THhscMuteReq, THhscMuteRsp } from "../interface/mute";




export default class GameCtrl extends BaseCtrl<GameModel>{

    //isTest:boolean = false;
    isTest: boolean = true;

    delayHandlerId: number = 0;
    delayHHSCHandlerId: number = 0;

    delayTime: number = 0;

    /**极速模式 */
    isFast: boolean = false;


    static isFristReqRecord: boolean = false;

    /**自动旋转次数 */
    autoRollCnt: number = 0;

    /* lirun  */
    loseMoney: number = 0;

    winMoney: number = 0;

    maxMoney: number = 0;

    rollState = [];

    /**当前需要显示的哪一轮结果 */
    curShowResultRoundIdx: number = 0;

    init() {
        this.setModel(new GameModel())
    }

    async enterGame() {
        this.register()
        let viewInfo = this.getModel().getInitViewInfo()
        await UIManager.showView(EViewNames.GameView, EUILayer.Panel, viewInfo);
        UIManager.closeView(EViewNames.LoadinView);
    }

    private register() {
        EventCenter.getInstance().listen(GameEvent.reconnect_tip, this.onShowReconnect, this)
    }

    onShowReconnect(cnt: number) {
        if (!UIManager.getView(EViewNames.ReconnectTip)) {
            UIManager.showView(EViewNames.ReconnectTip, EUILayer.Tip, cnt)
        }
    }

    getIdempotent() {
        return LoginCtrl.getIns().getModel().getPlayerInfo().id + Date.now() + ""
    }

    switchAudio(isOpen: boolean) {
        return new Promise((res) => {
            let params: THhscMuteReq = {
                token: LoginCtrl.getIns().getModel().getToken(),
                mute: isOpen ? 0 : 1
            }
            HttpMgr.getIns().post(Routes.req_switch_audio, params, (bSucc: boolean, info: ServerResult<THhscMuteRsp>) => {
                this.getModel().setAudioStae(info.data.player_info.mute == 0)
                res(null)
            })
        })
    }


    _reqBet(params: THhscBetReq, req_cnt: number = 0) {
        if (GameCtrl.getIns().isTest) {
            let betInfo: THhscBetRsp;

            // betInfo = {
            //     "result": {
            //         "round_list": [
            //             {
            //                 "item_type_list": [
            //                     7,
            //                     4,
            //                     5,
            //                     6,
            //                     7,
            //                     5,
            //                     3,
            //                     6,
            //                     1
            //                 ],
            //                 "round_rate": 11,
            //                 "round": 1,
            //                 "multi_time": 1,
            //                 "prize_list": [
            //                     {
            //                         "win_pos_list": [
            //                             2,
            //                             5,
            //                             8
            //                         ],
            //                         "index": 3,
            //                         "level": 3,
            //                         "item_type": 5,
            //                         "rate": 8,
            //                         "win_item_list": [
            //                             5,
            //                             5,
            //                             1
            //                         ],
            //                         "multi_time": 0,
            //                         "win": 48000,
            //                         "level_s": "3星连珠",
            //                         "item_type_s": "红包",
            //                         "rate_s": "图标倍数8",
            //                         "multi_time_s": "",
            //                         "win_s": "4.80"
            //                     },
            //                     {
            //                         "win_pos_list": [
            //                             0,
            //                             4,
            //                             8
            //                         ],
            //                         "index": 4,
            //                         "level": 3,
            //                         "item_type": 7,
            //                         "rate": 3,
            //                         "win_item_list": [
            //                             7,
            //                             7,
            //                             1
            //                         ],
            //                         "multi_time": 0,
            //                         "win": 18000,
            //                         "level_s": "3星连珠",
            //                         "item_type_s": "橙子",
            //                         "rate_s": "图标倍数3",
            //                         "multi_time_s": "",
            //                         "win_s": "1.80"
            //                     }
            //                 ],
            //                 "next_list": null,
            //                 "drop_list": null,
            //                 "win_pos_list": [
            //                     0,
            //                     2,
            //                     4,
            //                     5,
            //                     8
            //                 ],
            //                 "balance": 100036000,
            //                 "free_play": 0,
            //                 "win": 66000,
            //                 "free_mode_type": 0,
            //                 "item_type_list_append": null,
            //                 "all_win_item": 0,
            //                 "balance_s": "10003.60",
            //                 "win_s": "6.60"
            //             }
            //         ],
            //         "rate": 11
            //     },
            //     "round_id": "0371739662",
            //     "order_id": "9-1702880172-CCD0411WX",
            //     "balance": 100036000,
            //     "bet": 30000,
            //     "prize": 66000,
            //     "player_win_lose": 36000,
            //     "is_enter_free_game": false,
            //     "chooseItem": 0,
            //     "balance_s": "10003.60",
            //     "bet_s": "3.00",
            //     "prize_s": "6.60",
            //     "player_win_lose_s": "360",
            //     "free_game_total_win_s": "0.00",
            //     "dbg": []
            // }

            // betInfo = {
            //     "result": {
            //         "round_list": [
            //             {
            //                 "item_type_list": [7, 5, 5, 1, 7, 2, 7, 6, 5],
            //                 "round_rate": 0,
            //                 "round": 1,
            //                 "multi_time": 0,
            //                 "prize_list": [
            //                     {
            //                         "win_pos_list": null,
            //                         "index": 2,
            //                         "level": 3,
            //                         "item_type": 7,
            //                         "rate": 0,
            //                         "win_item_list": [7, 1, 7],
            //                         "multi_time": 0,
            //                         "win": 0,
            //                         "level_s": "3星连珠",
            //                         "item_type_s": "橙子",
            //                         "rate_s": "",
            //                         "multi_time_s": "",
            //                         "win_s": "0.00"
            //                     }
            //                 ],
            //                 "next_list": null,
            //                 "drop_list": null,
            //                 "win_pos_list": null,
            //                 "balance": 650000,
            //                 "free_play": 0,
            //                 "win": 0,
            //                 "free_mode_type": 1,
            //                 "item_type_list_append": [7, 0, 0, 1, 7, 0, 7, 0, 0],
            //                 "all_win_item": 0,
            //                 "balance_s": "65.00",
            //                 "win_s": "0.00",
                            
            //             },
            //             {
            //                 "item_type_list": [7, 7, 0, 1, 7, 0, 7, 0, 0],
            //                 "round_rate": 0,
            //                 "round": 2,
            //                 "multi_time": 0,
            //                 "prize_list": [
            //                     {
            //                         "win_pos_list": null,
            //                         "index": 2,
            //                         "level": 3,
            //                         "item_type": 7,
            //                         "rate": 0,
            //                         "win_item_list": [7, 1, 7],
            //                         "multi_time": 0,
            //                         "win": 0,
            //                         "level_s": "3星连珠",
            //                         "item_type_s": "橙子",
            //                         "rate_s": "",
            //                         "multi_time_s": "",
            //                         "win_s": "0.00"
            //                     }
            //                 ],
            //                 "next_list": null,
            //                 "drop_list": null,
            //                 "win_pos_list": null,
            //                 "balance": 650000,
            //                 "free_play": 0,
            //                 "win": 0,
            //                 "free_mode_type": 1,
            //                 "item_type_list_append": [0, 7, 0, 0, 0, 0, 0, 0, 0],
            //                 "all_win_item": 0,
            //                 "balance_s": "65.00",
            //                 "win_s": "0.00",
                            
            //             },
            //             {
            //                 "item_type_list": [7, 7, 0, 1, 7, 0, 7, 0, 0],
            //                 "round_rate": 3,
            //                 "round": 3,
            //                 "multi_time": 1,
            //                 "prize_list": [
            //                     {
            //                         "win_pos_list": [0, 3, 6],
            //                         "index": 2,
            //                         "level": 3,
            //                         "item_type": 7,
            //                         "rate": 3,
            //                         "win_item_list": [7, 1, 7],
            //                         "multi_time": 0,
            //                         "win": 3000,
            //                         "level_s": "3星连珠",
            //                         "item_type_s": "橙子",
            //                         "rate_s": "图标倍数3",
            //                         "multi_time_s": "",
            //                         "win_s": "0.30"
            //                     }
            //                 ],
            //                 "next_list": null,
            //                 "drop_list": null,
            //                 "win_pos_list": [0, 3, 6],
            //                 "balance": 653000,
            //                 "free_play": 0,
            //                 "win": 3000,
            //                 "free_mode_type": 1,
            //                 "item_type_list_append": [0, 0, 0, 0, 0, 0, 0, 0, 0],
            //                 "all_win_item": 0,
            //                 "balance_s": "65.30",
            //                 "win_s": "0.30",
                           
            //             }
            //         ],
            //         "rate": 3
            //     },
            //     "round_id": "9467247474",
            //     "order_id": "9-1708352936-WPV0HUQ6C",
            //     "balance": 653000,
            //     "bet": 5000,
            //     "prize": 3000,
            //     "player_win_lose": -2000,
            //     "is_enter_free_game": true,
            //     "chooseItem": 7,
            //     "balance_s": "65.30",
            //     "bet_s": "0.50",
            //     "prize_s": "0.30",
            //     "player_win_lose_s": "-0.20",
            //     "free_game_total_win_s": "0.00",
            //     "dbg": [
            //         "目前的类型是=[普通模式]",
            //         "基础投注=[5], 投注倍数=[1], 投注大小=[1000], 必杀盈利率=[2.50]",
            //         "下注总额=[0.50], 用户余额=[65.50]",
            //         "使用数组=[3], 权重(10/290)",
            //         "本轮是否进免费游戏=true, 随机值=0, 权重(10/290)",
            //         "采用数组=3, 随机结果上下浮动=[0~0], 随机值=0",
            //         "随机无结果, 采用不中奖结果",
            //         "玩家本次下注=0.50, 中奖=0.30, 输赢=-0.20",
            //         "倍率=3"
            //     ]
            // }
            betInfo = {
                "result": {
                    "round_list": [
                        {
                            "item_type_list": [
                                2,
                                1,
                                7,
                                5,
                                5,
                                6,
                                4,
                                7,
                                5
                            ],
                            "round_rate": 0,
                            "round": 1,
                            "multi_time": 1,
                            "prize_list": null,
                            "next_list": null,
                            "drop_list": null,
                            "win_pos_list": null,
                            "balance": 100006000,
                            "free_play": 0,
                            "win": 0,
                            "free_mode_type": 0,
                            "item_type_list_append": null,
                            "all_win_item": 0,
                            "balance_s": "10000.60",
                            "win_s": "0.00"
                        }
                    ],
                    "rate": 0
                },
                "round_id": "0079685487",
                "order_id": "9-1702880184-29P1FXX7R",
                "balance": 100006000,
                "bet": 30000,
                "prize": 0,
                "player_win_lose": -30000,
                "is_enter_free_game": false,
                "chooseItem": 0,
                "balance_s": "10000.60",
                "bet_s": "3.00",
                "prize_s": "0.00",
                "player_win_lose_s": "-3.00",
                "free_game_total_win_s": "0.00",
                "dbg": []
            }

            
            // betInfo = {
            //     "result": {
            //         "round_list": [
            //             {
            //                 "item_type_list": [
            //                     7,
            //                     4,
            //                     5,
            //                     6,
            //                     7,
            //                     5,
            //                     3,
            //                     6,
            //                     1
            //                 ],
            //                 "round_rate": 11,
            //                 "round": 1,
            //                 "multi_time": 1,
            //                 "prize_list": [
            //                     {
            //                         "win_pos_list": [
            //                             2,
            //                             5,
            //                             8
            //                         ],
            //                         "index": 3,
            //                         "level": 3,
            //                         "item_type": 5,
            //                         "rate": 8,
            //                         "win_item_list": [
            //                             5,
            //                             5,
            //                             1
            //                         ],
            //                         "multi_time": 0,
            //                         "win": 48000,
            //                         "level_s": "3星连珠",
            //                         "item_type_s": "红包",
            //                         "rate_s": "图标倍数8",
            //                         "multi_time_s": "",
            //                         "win_s": "4.80"
            //                     },
            //                     {
            //                         "win_pos_list": [
            //                             0,
            //                             4,
            //                             8
            //                         ],
            //                         "index": 4,
            //                         "level": 3,
            //                         "item_type": 7,
            //                         "rate": 3,
            //                         "win_item_list": [
            //                             7,
            //                             7,
            //                             1
            //                         ],
            //                         "multi_time": 0,
            //                         "win": 18000,
            //                         "level_s": "3星连珠",
            //                         "item_type_s": "橙子",
            //                         "rate_s": "图标倍数3",
            //                         "multi_time_s": "",
            //                         "win_s": "1.80"
            //                     }
            //                 ],
            //                 "next_list": null,
            //                 "drop_list": null,
            //                 "win_pos_list": [
            //                     0,
            //                     2,
            //                     4,
            //                     5,
            //                     8
            //                 ],
            //                 "balance": 100036000,
            //                 "free_play": 0,
            //                 "win": 66000,
            //                 "free_mode_type": 0,
            //                 "item_type_list_append": null,
            //                 "all_win_item": 0,
            //                 "balance_s": "10003.60",
            //                 "win_s": "6.60"
            //             }
            //         ],
            //         "rate": 11
            //     },
            //     "round_id": "0371739662",
            //     "order_id": "9-1702880172-CCD0411WX",
            //     "balance": 100036000,
            //     "bet": 30000,
            //     "prize": 66000,
            //     "player_win_lose": 36000,
            //     "is_enter_free_game": false,
            //     "chooseItem": 0,
            //     "balance_s": "10003.60",
            //     "bet_s": "3.00",
            //     "prize_s": "6.60",
            //     "player_win_lose_s": "3.60",
            //     "free_game_total_win_s": "0.00",
            //     "dbg": []
            // }

            this.onBetResult(betInfo)
            return
        }


        HttpMgr.getIns().post(Routes.req_bet, params, (bSucc: boolean, info: ServerResult<THhscBetRsp>) => {
            if (bSucc) {
                this.onBetResult(info.data)
            } else if (typeof (info) == "number") {
                if (info == EHttpResult.Error) {
                    this.onShowReqError(params)
                } else {
                    req_cnt++;
                    if (req_cnt <= 5) {
                        EventCenter.getInstance().fire(GameEvent.reconnect_tip, req_cnt)
                        setTimeout(() => {
                            this._reqBet(params, req_cnt)
                        }, 1000);
                    } else {
                        this.onShowReqError(params);
                    }
                }
            } else if (info.error_code == 136) {
                let params: ParamConfirmDlg = {
                    callback: () => {
                    },
                    title: "未能完成交易",
                    content: `下注额错误\n(错误代码:${info.error_code})`,
                }
                UIManager.showView(EViewNames.UIConfirmTip, EUILayer.Popup, params)
            } else if (info.error_code == 154) {//金额不足
                let params: ParamConfirmDlg = {
                    callback: () => {
                        this.cancelAutoRoll()
                        let datas = this.getModel().getTestElementList();
                        this.getModel().curBetResultRoundList = [];
                        EventCenter.getInstance().fire(GameEvent.game_start_stop_roll, { data: datas })
                    },
                    title: "未能完成交易",
                    content: `Pontuação insuficiente. Por favor, tente mudar o valor da aposta。(错误代码:${info.error_code})`,
                    okTxt: "Confirmar"
                }
                UIManager.showView(EViewNames.UIConfirmTip, EUILayer.Popup, params)
            } else {
                req_cnt++;
                if (req_cnt <= 5) {
                    EventCenter.getInstance().fire(GameEvent.reconnect_tip, req_cnt)
                    setTimeout(() => {
                        this._reqBet(params, req_cnt)
                    }, 1000);
                } else {
                    this.onShowReqError(params);
                }
            }
        })
    }

    onShowReqError(params: any) {
        let info = new ParamConfirmDlg("net_error", "网络连接错误", EDialogType.ok_cancel, (menuId: EDialogMenuId) => {
            if (menuId == EDialogMenuId.ok) {
                setTimeout(() => {
                    this._reqBet(params)
                }, 100);
            } else if (menuId == EDialogMenuId.cancel) {
                if (document.referrer.length > 0) { // 后退
                    window.history.back();
                    return;
                }
                game.end();
            }
        });
        info.thisObj = this;
        info.title = "未能成功交易"
        info.okTxt = "重试"
        info.cancelTxt = "Saída"
        UIManager.showView(EViewNames.UIConfirmDialog, EUILayer.Dialog, info)
    }

    /**下注 */
    reqBet() {
        let params: THhscBetReq = {
            token: LoginCtrl.getIns().getModel().getToken(),
            id: this.getModel().getCurBetId(),
            idempotent: this.getIdempotent(),
        }
        this._reqBet(params)
    }

    /**请求转动 */
    reqRoll() {
        let betAmount = this.getModel().getCurBetAmount()
        let balance = this.getModel().balance;
        this.reqBet()
        if (this.isFast) {
            this.delayTime = 0
        } else {
            this.delayTime = 1000
        }
        if (balance > betAmount) {
            EventCenter.getInstance().fire(GameEvent.game_update_player_blance, balance - betAmount);//客户端手动扣除下注金额
        }
        EventCenter.getInstance().fire(GameEvent.update_game_state, GameState.roll)
        EventCenter.getInstance().fire(GameEvent.game_clear_award_result);
        EventCenter.getInstance().fire(GameEvent.game_start_roll, this.isFast);
    }

    setRollData(num){
        if(this.loseMoney > 0){
            this.loseMoney += num;
        }
        if(this.winMoney > 0){
            this.winMoney -= num;
        }
        if(this.maxMoney > 0){
            if(num >=this.maxMoney){
                this.maxMoney = -1
            }
        }
    }

    /**下注返回 */
    private onBetResult(data: THhscBetRsp) {
        let player_win_lose_s = data.player_win_lose / 10000;
        this.setRollData(player_win_lose_s)
        this.curShowResultRoundIdx = 0;
        this.getModel().setBetResult(data);
        if (data.is_enter_free_game) {
            this.getModel().mode = GameMode.hhsc
            this.enterHHSCMode()
        } else {
            this.getModel().mode = GameMode.normal
            //@ts-ignore
            this.delayHandlerId = setTimeout(() => {
                this.startRoll(this.isFast)
            }, this.delayTime);
        }
    }

    /**进入虎虎生财模式 */
    enterHHSCMode() {
        let uiInfo = this.getModel().getEnterHHSCModeUIInfo(0)
        EventCenter.getInstance().fire(GameEvent.enter_hhsc_mode, uiInfo)
    }

    /**普通模式下开始滚动 */
    private startRoll(isFast: boolean) {
        clearInterval(this.delayHandlerId)
        this.delayHandlerId = 0;
        let datas = this.getModel().getResultElementDatas(0);
        let isTriggerHHSCAnimation = this.randomTriggerHHSCAnimation()
        EventCenter.getInstance().fire(GameEvent.game_start_stop_roll, { data: datas, isTriggerHHSCAnimation: isTriggerHHSCAnimation, isFast: isFast })
    }

    /**客户端 假的 随机触发虎虎生财动画 */
    private randomTriggerHHSCAnimation() {
        return MathUtil.getRandomInt(1, 100) > 90
    }

    openAutoRoll(idx: number, loseMoney: number,winMoney: number,maxMoney: number, rollState) {
        console.error(loseMoney,winMoney,maxMoney,rollState)
        let cnt: number = this.getModel().getAutoRollCntByIdx(idx);
        if (cnt) {
            this.autoRollCnt = cnt;
            this.loseMoney = loseMoney;
            this.winMoney = winMoney;
            this.maxMoney = maxMoney;
            this.rollState = rollState;
            EventCenter.getInstance().fire(GameEvent.game_update_open_auto_roll, true, this.autoRollCnt)
            setTimeout(() => {
                this.autoRollCnt--
                EventCenter.getInstance().fire(GameEvent.game_update_open_auto_roll, true, this.autoRollCnt)
                this.reqRoll()
            }, 500);
        }
    }

    cancelAutoRoll() {
        this.autoRollCnt = 0;
        EventCenter.getInstance().fire(GameEvent.game_update_open_auto_roll, false, 0)
    }

    isStopRoll(){
        if(this.rollState[0] && this.loseMoney <= 0){
           return false
        }
        if(this.rollState[1] && this.winMoney <= 0){
            return false
        }
        if(this.rollState[2] && this.maxMoney <= 0){
            return false
        }
        return true
    }

    /**检测是否需要自动旋转 */
    checkAutoRoll() {
        if (this.autoRollCnt > 0 && this.isStopRoll()) {
            this.autoRollCnt--
            EventCenter.getInstance().fire(GameEvent.game_update_open_auto_roll, true, this.autoRollCnt)
            this.reqRoll();
        } else {
            this.loseMoney = -1;
            this.winMoney = -1;
            this.maxMoney = -1;
            this.rollState = [false,false,false];
            EventCenter.getInstance().fire(GameEvent.game_update_open_auto_roll, false, 0)
        }
    }


    /**播放下一轮奖励 */
    async checkHHSCNextRoundAward() {
        this.curShowResultRoundIdx++;
        let datas = this.getModel().getHHSCResultElementDatas(this.curShowResultRoundIdx);
        if (datas) {
            EventCenter.getInstance().fire(GameEvent.game_show_hhsc_enter_next_round, { data: datas });
        } else {
            this.curShowResultRoundIdx--
            let resultAwardUIInfo = this.getModel().getHHSCResultAwardUIDatas(this.curShowResultRoundIdx);
            if (resultAwardUIInfo) {//有结果需要展示
                EventCenter.getInstance().fire(GameEvent.update_game_state, GameState.show_result)
                EventCenter.getInstance().fire(GameEvent.game_show_hhsc_award_result, resultAwardUIInfo)
            } else {
                EventCenter.getInstance().fire(GameEvent.update_game_state, GameState.wait)
            }
        }
    }

    /**开关快速模式 */
    switchFast(isOpen: boolean) {
        this.isFast = isOpen;
        EventCenter.getInstance().fire(GameEvent.game_switch_fast, this.isFast);
    }

    /**展示中奖结果 */
    showResultAward() {
        if (this.getModel().mode == GameMode.hhsc) {
            this.showHHSCModeResultAward()
        } else if (this.getModel().mode == GameMode.normal) {
            this.showNormalModeResultAward();
        }
    }

    /** 虎虎生财模式 下一轮展示结算*/
    showHHSCModeResultAward() {
        let uiData = this.getModel().getHHSCAwardUIDatas(this.curShowResultRoundIdx);
        if (this.curShowResultRoundIdx == 0) {//第一次停止滚轮动画转动
            EventCenter.getInstance().fire(GameEvent.update_game_state, GameState.show_result)
        }
        EventCenter.getInstance().fire(GameEvent.game_show_hhsc_round_award_result, uiData)
    }

    /**当前回合下指定列是否包含百搭元素 */
    isContainWdElementByCol(col: number) {
        let arrays = this.getModel().getResultElementDatas(this.curShowResultRoundIdx);
        if (arrays) {
            let elementList = arrays[col];
            return elementList.some(v => v == GameConst.WDElementId)
        }
        return false
    }

    /**正常模式结算 */
    showNormalModeResultAward() {
        let uiData = this.getModel().getResultAwardUIDatas(0);
        if (uiData) {//有结果需要展示
            // this.getModel().setCollectWdCnt(uiData.collectWdCnt);
            EventCenter.getInstance().fire(GameEvent.update_game_state, GameState.show_result)
            EventCenter.getInstance().fire(GameEvent.game_show_award_result, uiData)
        } else {
            let noArawdInfo = this.getModel().getResulNoAwardUIDatas()//不中奖
            // this.getModel().setCollectWdCnt(noArawdInfo.collectWdCnt);
            EventCenter.getInstance().fire(GameEvent.game_show_no_award_result, noArawdInfo)//不中奖手动刷新余额
            EventCenter.getInstance().fire(GameEvent.game_update_player_blance, this.getModel().balance)
        }
    }

    openUIAuto() {
        let uiData = this.getModel().getInitUIAutoData()
        UIManager.showView(EViewNames.UIAuto, EUILayer.Popup, uiData)
    }

    openUISettingBet() {
        let uiData = this.getModel().getInitUIBetSettingData()
        UIManager.showView(EViewNames.UIBetSetting, EUILayer.Popup, uiData)
    }

    reqGetBanlance(callback) {
        let param = {
            "token": LoginCtrl.getIns().getModel().getToken(),
        };
        HttpMgr.getIns().post(Routes.req_login, param, (bSucc: boolean, info: ServerResult<THhscUserInfoRsp>) => {
            if (bSucc) {
                callback(info.data.player_info.balance)
            } else {
                callback(null)
            }
        })
    }

    openUIBanlance() {
        let uiData = this.getModel().getInitUIBetSettingData()
        UIManager.showView(EViewNames.UImoney, EUILayer.Popup, uiData)
    }

    async openUIHistory() {
        let uiData = this.getModel().getInitUIBetSettingData()
        UIManager.showView(EViewNames.UIhistory, EUILayer.Popup, uiData)
        // let ui = await UIManager.showView(EViewNames.UIRecord, EUILayer.Popup, uiData)
        // let sharedRecord = ui.getComponentInChildren(SharedRecord)
        // sharedRecord.setGameRecord(this.getModel())
        // sharedRecord.setEmitter(this.emitter);
        // sharedRecord.register();
        // sharedRecord.showLoadingTips();
        // sharedRecord.setDestroyCallback(() => {
        //     console.log("dddddddddddddd")
        //     // this.gameData.getGameOpenUiStatus().cancelRecord();
        // })
        // this.emitter.emit(EMIT_VIEW_RESIZE_FLUSH);
    }

    /**取消延时停止移动 */
    cancelDelayShowResult() {
        EventCenter.getInstance().fire(GameEvent.update_game_state, GameState.cancel_roll)
        if (!this.delayHandlerId) {
            this.delayTime = 0
            return;
        }
        this.startRoll(true)
    }


    reduceBetAmount() {
        let amount = this.getModel().reduceBetAmount();
        EventCenter.getInstance().fire(GameEvent.update_game_change_bet_amount, amount)
        let data = this.getBetAmountState(amount)
    }

    addBetAmount() {
        let amount = this.getModel().addBetAmount();
        EventCenter.getInstance().fire(GameEvent.update_game_change_bet_amount, amount)
    }

    switchBetId(id: number) {
        this.getModel().setCurBetId(id);
        let amount = this.getModel().getCurBetAmount()
        EventCenter.getInstance().fire(GameEvent.update_game_change_bet_amount, amount, false);
    }

    /**获取下注是否达到边界 */
    getBetAmountState(amount: number) {
        let ixMax = this.getModel().isMaxBet(amount)
        let isMin = this.getModel().isMinBet(amount)
        return { isMax: ixMax, isMin: isMin }
    }


}