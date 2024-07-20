import { EViewNames } from "../configs/UIConfig";
import GameConst from "../define/GameConst";
import Routes from "../define/Routes";
import GameEvent from "../event/GameEvent";
import { THhscBetInfoRsp } from "../interface/betinfo";
import { ServerResult } from "../interface/common";
import { THhscUserInfoRsp } from "../interface/userinfo";
import { UIManager } from "../kernel/compat/view/UImanager";
import EventCenter from "../kernel/core/event/EventCenter";
import logger from "../kernel/core/logger";
import DateUtil from "../kernel/core/utils/DateUtil";
import UrlUtil from "../kernel/core/utils/UrlUtil";
import HttpMgr from "../mgrs/HttpMgr";
import LoginModel from "../models/LoginModel";
import BaseCtrl from "./BaseCtrl";
import GameCtrl from "./GameCtrl";

export default class LoginCtrl extends BaseCtrl<LoginModel>{

    heartTimer: number = 0;
    /**登录失败重试此时 */
    reLoginTimes: number = 0;



    init() {
        this.setModel(new LoginModel())
    }


    private stopHeartBeat() {
        if (this.heartTimer < 0) { return; }
        clearInterval(this.heartTimer);
        this.heartTimer = -1;
    }

    private startHeartBeat() {
        this.stopHeartBeat();
        //@ts-ignore
        this.heartTimer = setInterval(() => {
            let info = {
                timestamp: DateUtil.getSysTime(),
                token: this.getModel().getToken(),
            }
            HttpMgr.getIns().post(Routes.req_heartbeat, info);
        }, 8000);
        logger.log("开始心跳");
    }


    private _reqLogin(callback) {
        let param = {
            "token": this.getModel().getToken(),
        };
        HttpMgr.getIns().post(Routes.req_login, param, (bSucc: boolean, info: ServerResult<THhscUserInfoRsp>) => {
            if (!bSucc) {
                if (this.reLoginTimes >= GameConst.MaxReLoginCnt) {
                    return
                }
                this.reLoginTimes++;
                logger.log("重新连接中...")
                EventCenter.getInstance().fire(GameEvent.user_login_fail, this.reLoginTimes);
                setTimeout(() => {
                    this._reqLogin(callback)
                }, 3000);
                return
            }
            callback(info.data)
        })
    }

    reqLogin(): Promise<THhscUserInfoRsp> {
        return new Promise((res) => {
            this._reqLogin(res)
        })
    }


    reqGetBetInfo(): Promise<THhscBetInfoRsp> {
        return new Promise((res) => {
            HttpMgr.getIns().post(Routes.req_bet_info, {}, (bSucc: boolean, info: ServerResult<THhscBetInfoRsp>) => {
                if (!bSucc) {
                    res(null)
                    logger.red("获取下注信息失败")
                    return
                }
                res(info.data)
            })
        })
    }

    async login() {
        let loginInfo: THhscUserInfoRsp;
        if (GameCtrl.getIns().isTest) {
            loginInfo = {
                "player_info": {
                    "id": 2519,
                    "balance": 100000000,
                    "account": "try4kPOQT17F",
                    "nickname": "试玩nz86PAWmwh",
                    "type": 0,
                    "mute": 0
                },
                "game_info": {
                    "id": 2519,
                    "last_time_bet": 0,
                    "last_time_bet_id": 0,
                    "last_time_bet_size": 0,
                    "last_time_basic_bet": 0,
                    "last_time_bet_multiple": 0,
                    "free_total_times": 0,
                    "free_remain_times": 0,
                    "free_game_total_win": 0,
                    "total_bet": 0,
                    "total_bet_times": 0,
                    "total_free_times": 0,
                    "free_mode_type": 0,
                    "last_win": 0,
                    "last_multi": 0
                },
                "list": [
                    2,
                    2,
                    5,
                    1,
                    1,
                    1,
                    6,
                    3,
                    3
                ],
                "lastRound": null
            }
        } else {
            loginInfo = await this.reqLogin();
        }


        logger.log("请求登录成功...")

        if (!GameCtrl.getIns().isTest) {
            this.startHeartBeat();
        }

        this.getModel().setPlayerInfo(loginInfo.player_info)
        let betInfo: THhscBetInfoRsp;
        if (GameCtrl.getIns().isTest) {
            betInfo = {
                "bet_list": [
                    {
                        "bet_size": 300,
                        "bet_multiple": 1,
                        "basic_bet": 5,
                        "total_bet": 1500,
                        "id": 1,
                        "bet_size_s": "0.03",
                        "total_bet_s": "0.15"
                    },
                    {
                        "bet_size": 300,
                        "bet_multiple": 2,
                        "basic_bet": 5,
                        "total_bet": 3000,
                        "id": 2,
                        "bet_size_s": "0.03",
                        "total_bet_s": "0.30"
                    },
                    {
                        "bet_size": 300,
                        "bet_multiple": 3,
                        "basic_bet": 5,
                        "total_bet": 4500,
                        "id": 3,
                        "bet_size_s": "0.03",
                        "total_bet_s": "0.45"
                    },
                    {
                        "bet_size": 300,
                        "bet_multiple": 4,
                        "basic_bet": 5,
                        "total_bet": 6000,
                        "id": 4,
                        "bet_size_s": "0.03",
                        "total_bet_s": "0.60"
                    },
                    {
                        "bet_size": 300,
                        "bet_multiple": 5,
                        "basic_bet": 5,
                        "total_bet": 7500,
                        "id": 5,
                        "bet_size_s": "0.03",
                        "total_bet_s": "0.75"
                    },
                    {
                        "bet_size": 300,
                        "bet_multiple": 6,
                        "basic_bet": 5,
                        "total_bet": 9000,
                        "id": 6,
                        "bet_size_s": "0.03",
                        "total_bet_s": "0.90"
                    },
                    {
                        "bet_size": 300,
                        "bet_multiple": 7,
                        "basic_bet": 5,
                        "total_bet": 10500,
                        "id": 7,
                        "bet_size_s": "0.03",
                        "total_bet_s": "1.05"
                    },
                    {
                        "bet_size": 300,
                        "bet_multiple": 8,
                        "basic_bet": 5,
                        "total_bet": 12000,
                        "id": 8,
                        "bet_size_s": "0.03",
                        "total_bet_s": "1.20"
                    },
                    {
                        "bet_size": 300,
                        "bet_multiple": 9,
                        "basic_bet": 5,
                        "total_bet": 13500,
                        "id": 9,
                        "bet_size_s": "0.03",
                        "total_bet_s": "1.35"
                    },
                    {
                        "bet_size": 300,
                        "bet_multiple": 10,
                        "basic_bet": 5,
                        "total_bet": 15000,
                        "id": 10,
                        "bet_size_s": "0.03",
                        "total_bet_s": "1.50"
                    },
                    {
                        "bet_size": 1000,
                        "bet_multiple": 1,
                        "basic_bet": 5,
                        "total_bet": 5000,
                        "id": 11,
                        "bet_size_s": "0.10",
                        "total_bet_s": "0.50"
                    },
                    {
                        "bet_size": 1000,
                        "bet_multiple": 2,
                        "basic_bet": 5,
                        "total_bet": 10000,
                        "id": 12,
                        "bet_size_s": "0.10",
                        "total_bet_s": "1.00"
                    },
                    {
                        "bet_size": 1000,
                        "bet_multiple": 3,
                        "basic_bet": 5,
                        "total_bet": 15000,
                        "id": 13,
                        "bet_size_s": "0.10",
                        "total_bet_s": "1.50"
                    },
                    {
                        "bet_size": 1000,
                        "bet_multiple": 4,
                        "basic_bet": 5,
                        "total_bet": 20000,
                        "id": 14,
                        "bet_size_s": "0.10",
                        "total_bet_s": "2.00"
                    },
                    {
                        "bet_size": 1000,
                        "bet_multiple": 5,
                        "basic_bet": 5,
                        "total_bet": 25000,
                        "id": 15,
                        "bet_size_s": "0.10",
                        "total_bet_s": "2.50"
                    },
                    {
                        "bet_size": 1000,
                        "bet_multiple": 6,
                        "basic_bet": 5,
                        "total_bet": 30000,
                        "id": 16,
                        "bet_size_s": "0.10",
                        "total_bet_s": "3.00"
                    },
                    {
                        "bet_size": 1000,
                        "bet_multiple": 7,
                        "basic_bet": 5,
                        "total_bet": 35000,
                        "id": 17,
                        "bet_size_s": "0.10",
                        "total_bet_s": "3.50"
                    },
                    {
                        "bet_size": 1000,
                        "bet_multiple": 8,
                        "basic_bet": 5,
                        "total_bet": 40000,
                        "id": 18,
                        "bet_size_s": "0.10",
                        "total_bet_s": "4.00"
                    },
                    {
                        "bet_size": 1000,
                        "bet_multiple": 9,
                        "basic_bet": 5,
                        "total_bet": 45000,
                        "id": 19,
                        "bet_size_s": "0.10",
                        "total_bet_s": "4.50"
                    },
                    {
                        "bet_size": 1000,
                        "bet_multiple": 10,
                        "basic_bet": 5,
                        "total_bet": 50000,
                        "id": 20,
                        "bet_size_s": "0.10",
                        "total_bet_s": "5.00"
                    },
                    {
                        "bet_size": 3000,
                        "bet_multiple": 1,
                        "basic_bet": 5,
                        "total_bet": 15000,
                        "id": 21,
                        "bet_size_s": "0.30",
                        "total_bet_s": "1.50"
                    },
                    {
                        "bet_size": 3000,
                        "bet_multiple": 2,
                        "basic_bet": 5,
                        "total_bet": 30000,
                        "id": 22,
                        "bet_size_s": "0.30",
                        "total_bet_s": "3.00"
                    },
                    {
                        "bet_size": 3000,
                        "bet_multiple": 3,
                        "basic_bet": 5,
                        "total_bet": 45000,
                        "id": 23,
                        "bet_size_s": "0.30",
                        "total_bet_s": "4.50"
                    },
                    {
                        "bet_size": 3000,
                        "bet_multiple": 4,
                        "basic_bet": 5,
                        "total_bet": 60000,
                        "id": 24,
                        "bet_size_s": "0.30",
                        "total_bet_s": "6.00"
                    },
                    {
                        "bet_size": 3000,
                        "bet_multiple": 5,
                        "basic_bet": 5,
                        "total_bet": 75000,
                        "id": 25,
                        "bet_size_s": "0.30",
                        "total_bet_s": "7.50"
                    },
                    {
                        "bet_size": 3000,
                        "bet_multiple": 6,
                        "basic_bet": 5,
                        "total_bet": 90000,
                        "id": 26,
                        "bet_size_s": "0.30",
                        "total_bet_s": "9.00"
                    },
                    {
                        "bet_size": 3000,
                        "bet_multiple": 7,
                        "basic_bet": 5,
                        "total_bet": 105000,
                        "id": 27,
                        "bet_size_s": "0.30",
                        "total_bet_s": "10.50"
                    },
                    {
                        "bet_size": 3000,
                        "bet_multiple": 8,
                        "basic_bet": 5,
                        "total_bet": 120000,
                        "id": 28,
                        "bet_size_s": "0.30",
                        "total_bet_s": "12.00"
                    },
                    {
                        "bet_size": 3000,
                        "bet_multiple": 9,
                        "basic_bet": 5,
                        "total_bet": 135000,
                        "id": 29,
                        "bet_size_s": "0.30",
                        "total_bet_s": "13.50"
                    },
                    {
                        "bet_size": 3000,
                        "bet_multiple": 10,
                        "basic_bet": 5,
                        "total_bet": 150000,
                        "id": 30,
                        "bet_size_s": "0.30",
                        "total_bet_s": "15.00"
                    },
                    {
                        "bet_size": 9000,
                        "bet_multiple": 1,
                        "basic_bet": 5,
                        "total_bet": 45000,
                        "id": 31,
                        "bet_size_s": "0.90",
                        "total_bet_s": "4.50"
                    },
                    {
                        "bet_size": 9000,
                        "bet_multiple": 2,
                        "basic_bet": 5,
                        "total_bet": 90000,
                        "id": 32,
                        "bet_size_s": "0.90",
                        "total_bet_s": "9.00"
                    },
                    {
                        "bet_size": 9000,
                        "bet_multiple": 3,
                        "basic_bet": 5,
                        "total_bet": 135000,
                        "id": 33,
                        "bet_size_s": "0.90",
                        "total_bet_s": "13.50"
                    },
                    {
                        "bet_size": 9000,
                        "bet_multiple": 4,
                        "basic_bet": 5,
                        "total_bet": 180000,
                        "id": 34,
                        "bet_size_s": "0.90",
                        "total_bet_s": "18.00"
                    },
                    {
                        "bet_size": 9000,
                        "bet_multiple": 5,
                        "basic_bet": 5,
                        "total_bet": 225000,
                        "id": 35,
                        "bet_size_s": "0.90",
                        "total_bet_s": "22.50"
                    },
                    {
                        "bet_size": 9000,
                        "bet_multiple": 6,
                        "basic_bet": 5,
                        "total_bet": 270000,
                        "id": 36,
                        "bet_size_s": "0.90",
                        "total_bet_s": "27.00"
                    },
                    {
                        "bet_size": 9000,
                        "bet_multiple": 7,
                        "basic_bet": 5,
                        "total_bet": 315000,
                        "id": 37,
                        "bet_size_s": "0.90",
                        "total_bet_s": "31.50"
                    },
                    {
                        "bet_size": 9000,
                        "bet_multiple": 8,
                        "basic_bet": 5,
                        "total_bet": 360000,
                        "id": 38,
                        "bet_size_s": "0.90",
                        "total_bet_s": "36.00"
                    },
                    {
                        "bet_size": 9000,
                        "bet_multiple": 9,
                        "basic_bet": 5,
                        "total_bet": 405000,
                        "id": 39,
                        "bet_size_s": "0.90",
                        "total_bet_s": "40.50"
                    },
                    {
                        "bet_size": 9000,
                        "bet_multiple": 10,
                        "basic_bet": 5,
                        "total_bet": 450000,
                        "id": 40,
                        "bet_size_s": "0.90",
                        "total_bet_s": "45.00"
                    }
                ],
                "default_id": 22,
                "addSubCombination": [
                    1,
                    2,
                    3,
                    11,
                    5,
                    10,
                    15,
                    31,
                    20,
                    25,
                    30,
                    35,
                    40
                ]
            }
        } else {
            betInfo = await this.reqGetBetInfo();
        }


        if (betInfo) {
            let lastWin = 0;
            if (loginInfo.lastRound) {
                lastWin = loginInfo.lastRound.win * (loginInfo.lastRound.multi_time || 1)
            }
            GameCtrl.getIns().getModel().setBetInfo(betInfo);
            GameCtrl.getIns().getModel().setAudioStae(loginInfo.player_info.mute == 0)
            GameCtrl.getIns().getModel().setGameInfo(loginInfo.game_info);
            GameCtrl.getIns().getModel().initGameData({
                balance: loginInfo.player_info.balance,
                list: loginInfo.list,
                lastWin: lastWin,
                lastRound: loginInfo.lastRound,
            })
            EventCenter.getInstance().fire(GameEvent.user_login_succ);
        }
    }

    enterGame() {
        GameCtrl.getIns().enterGame()
    }
}