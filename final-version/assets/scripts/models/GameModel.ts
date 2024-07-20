import { Vec2, v2 } from "cc";
import LoginCtrl from "../ctrls/LoginCtrl";
import GameConst from "../define/GameConst";
import GameEvent from "../event/GameEvent";
import { THhscBetRsp } from "../interface/bet";
import { THhscBetInfo, THhscBetInfoRsp } from "../interface/betinfo";
import { TPrize, TRound } from "../interface/result";
import { THhscGameInfo } from "../interface/userinfo";
import EventCenter from "../kernel/core/event/EventCenter";
import BaseModel from "./BaseModel";
import MathUtil from "../kernel/core/utils/MathUtil";
import { THhscRecordInfo, THhscRecordListRsp } from "../interface/recordlist";
import { IGameRecord, IRecordDetail, IRecordProfile, IRecordProfileSummary } from "../../shared/script/shared_record/shared_record_interface";
import { THhscRecordDetailRsp } from "../interface/recorddetail";


export interface BaseGoldInfo {
    balance: number//玩家余额
    curBetAmount: number//当前下注的钱
    lastWinAmount: number//赢得的前
}

export enum X10AnimationType {
    none,//没变化
    x10,//普通10倍
    hhscx10,//这个模式正常情况不会出现
    x10_quanxiao,// 虎虎身财 相同元素 全消虎虎生财模式默认播放这个
    hhscx10_quanxiao,// 虎虎身财 相同元素 全消虎虎生财模式默认播放这个
}

export interface InitUIInfo extends BaseGoldInfo {
    elementList: Array<Array<number>> //初始化元素列表
    lastResultAwardUIInfo: ResultAwardUIInfo//上局展示结果
}
export interface InitUIAutoInfo extends BaseGoldInfo {
    selectNums: number[]
}


const rates: number[] = [5, 15, 35]

/**自动旋转的次数 */
const AutoRounds = [10, 30, 50, 80, 1000];


export interface EPoint {
    col: number,
    row: number,
    isAward?: boolean,
}

const LineToElementPosList: Array<Array<EPoint>> = [
    [
        { col: 0, row: 1 },
        { col: 1, row: 1 },
        { col: 2, row: 1 },
    ],
    [
        { col: 0, row: 2 },
        { col: 1, row: 2 },
        { col: 2, row: 2 },
    ],
    [
        { col: 0, row: 0 },
        { col: 1, row: 0 },
        { col: 2, row: 0 },
    ],
    [
        { col: 0, row: 2 },
        { col: 1, row: 1 },
        { col: 2, row: 0 },
    ],
    [
        { col: 0, row: 0 },
        { col: 1, row: 1 },
        { col: 2, row: 2 },
    ],
]



export interface ResultLineInfo {
    idx: number,//编号
    win: number,//单条线赢多少钱
    ePoint: Array<EPoint>//对应二维数组位置
}

/**中奖结果展示信息 */
export interface ResultAwardUIInfo {
    lastWin: number,
    /**赢得多少 */
    win: number,
    x10Type: X10AnimationType,
    x10ElementId: number,
    balance: number,
    bigAwardNums: number[],
    /**百搭元素的位置 */
    wdElementPosList: Array<EPoint>,
    /**显示奖励动画等级 */
    showAwardAnimationLevel: number,
    lastshowAwardAnimationLevel: number,
    /**连线信息 */
    lineInfos: ResultLineInfo[]
}

/**不中奖结果展示信息 */
export interface ResultNoAwardUIInfo {
    /**百搭元素的位置 */
    wdElementPosList: Array<EPoint>,
}

/**结果展示信息 */
export interface HHSCResultAwardUIInfo {
    resultAwardUIInfo: ResultAwardUIInfo
    showElementResult: Array<Array<number>>//最后的显示
}

/**HHSC结果展示信息 */
export interface ResultHHSCAwardUIInfo {
    isNewLine: boolean,
    awardLines: number[], //所有中奖线路
    allElements: Array<EPoint>//所有元素 包括不中奖的
}


export enum GameMode {
    normal,
    hhsc
}

/**进入虎虎生财模式下 传递给UI的信息 */
export interface EnterHHSCModeUIInfo {
    elementId: number //中奖的元素ID
    showElementResult: Array<Array<number>> //显示的结果元素列表
}


export default class GameModel extends BaseModel {
    /**当前下注Id */
    private curBetId: number = 0;
    /**玩家的余额 */
    balance: number = 0;
    /**最后一次赢得的钱 */
    lastWinAmount: number = 0;
    /**加减下注列表 */
    addSubCombination: number[] = []

    gameInfo: THhscGameInfo;

    betInfo: THhscBetInfoRsp;

    mode: GameMode = GameMode.normal;

    /**可选项倍数列表 */
    optionalMultipleLists: number[] = [];
    /**可选项下注列表 */
    optionalBetAmountLists: number[] = [];
    /**可选项总下注列表 */
    optionalTotalAmountLists: number[] = [];

    elementList: Array<Array<number>> = [];

    // betData: THhscBetRsp;
    /**虎虎生财 选中元素 */
    hhscElementId: number = 0;
    /**当前下注结果集合 */
    curBetResultRoundList: TRound[] = [];

    /**收集百搭个数 */
    collectWdCnt: number = 0;

    /**当前下注数量 */
    curBetAmount: number = 0;

    /**是否打开音乐 */
    _isOpenAudio: boolean = false;

    // /**记录数据 */
    // gameRecordInfo: THhscRecordListRsp = null;

    // /**记录列表 */
    // gameRecordList: THhscRecordInfo[] = []

    // /**详情数据 */
    // private recordDetailMap = new Map<string, THhscRecordDetailRsp>();

    /** 改变下注数量idx*/
    // quickChangeBetAmountIdx: number = 0;

    initGameData(data: { balance: number, list: number[], lastWin: number, lastRound: TRound }) {
        this.balance = data.balance;
        this.curBetId = this.gameInfo.last_time_bet_id || this.betInfo.default_id;
        this.setElementList(data.list);
        this.lastWinAmount = data.lastWin;
        this.curBetAmount = this.getCurBetAmount();
        this.curBetResultRoundList = [data.lastRound]
        // this.updateChangeBetAmountIdx();
    }

    setGameInfo(info: THhscGameInfo) {
        this.gameInfo = info;
    }

    setBetInfo(info: THhscBetInfoRsp) {
        this.betInfo = info;
        this.setOptionalLists(info.bet_list);
    }

    setAudioStae(isOpen: boolean) {
        this._isOpenAudio = isOpen;
    }

    isOpenAudio() {
        return this._isOpenAudio;
    }


    /**收集百搭元素个数 */
    getCollectWdCnt() {
        return this.collectWdCnt;
    }

    /**清除百搭个数 */
    clearCollectWdCnt() {
        this.collectWdCnt = 0;
    }

    setCollectWdCnt(cnt: number) {
        this.collectWdCnt = cnt;
    }

    /**设置第一次的游戏记录信息 */
    // setGameRecordInfo(info: THhscRecordListRsp) {
    //     this.gameRecordInfo = info;
    //     this.gameRecordList = info.list;
    // }

    // /**添加游戏记录 */
    // addGameRecord(list: THhscRecordInfo[]) {
    //     this.gameRecordList.push(...list)
    // }

    // updateChangeBetAmountIdx() {
    //     let curBetAmountInfo = this.betInfo.bet_list[this.curBetId - 1]
    //     for (let index = 0; index < this.betInfo.addSubCombination.length; index++) {
    //         const element = this.betInfo.addSubCombination[index];
    //         if (element == curBetAmountInfo.id) {
    //             this.quickChangeBetAmountIdx = index;
    //         }
    //     }
    // }
    // addRecordDetail(orderId: string, rsp: THhscRecordDetailRsp) {
    //     this.recordDetailMap.set(orderId, rsp)
    // }

    // getRecordDetail(orderId: string) {
    //     return this.recordDetailMap.get(orderId)
    // }


    private setOptionalLists(betList: THhscBetInfo[]) {
        for (let index = 0; index < betList.length; index++) {
            const element = betList[index];
            let bet_multiple = element.bet_multiple
            let bet_size = element.bet_size / GameConst.BeseGold
            let total_bet = element.total_bet / GameConst.BeseGold
            if (this.optionalMultipleLists.indexOf(bet_multiple) == -1) {
                this.optionalMultipleLists.push(bet_multiple)
            }
            if (this.optionalBetAmountLists.indexOf(bet_size) == -1) {
                this.optionalBetAmountLists.push(bet_size)
            }
            if (this.optionalTotalAmountLists.indexOf(total_bet) == -1) {
                this.optionalTotalAmountLists.push(total_bet)
            }
        }
        this.optionalMultipleLists.sort((a1, a2) => {
            return a1 - a2
        })
        this.optionalBetAmountLists.sort((a1, a2) => {
            return a1 - a2
        })
        this.optionalTotalAmountLists.sort((a1, a2) => {
            return a1 - a2
        })
    }

    getBetInfoByTotal(total: number) {
        for (let index = 0; index < this.betInfo.bet_list.length; index++) {
            let info = this.betInfo.bet_list[index];
            if (info.total_bet == total) {
                return info;
            }
        }
    }

    getBetInfoByAmount(betAmount: number, multiple: number, line: number = 5) {
        for (let index = 0; index < this.betInfo.bet_list.length; index++) {
            let betInfo = this.betInfo.bet_list[index];
            if (betInfo.bet_size == betAmount && betInfo.bet_multiple == multiple && betInfo.basic_bet == line) {
                return betInfo
            }
        }
    }

    getBetAmountIdx(amount: number) {
        for (let index = 0; index < this.optionalBetAmountLists.length; index++) {
            const element = this.optionalBetAmountLists[index];
            if (amount == element) {
                return index
            }
        }
    }

    getBetMultipleIdx(amount: number) {
        for (let index = 0; index < this.optionalMultipleLists.length; index++) {
            const element = this.optionalMultipleLists[index];
            if (amount == element) {
                return index
            }
        }
    }

    getBetTotalIdx(amount: number) {
        for (let index = 0; index < this.optionalTotalAmountLists.length; index++) {
            const element = this.optionalTotalAmountLists[index];
            if (amount == element) {
                return index
            }
        }
    }

    /**设置初始化元素信息 牌面 */
    setElementList(list: number[]) {
        this.elementList = this.svrElementArrayConvertTo2Array(list)
    }


    getTestElementList() {
        return this.svrElementArrayConvertTo2Array([2, 2, 5, 4, 4, 4, 6, 3, 3])
    }

    /**服务器一维元素数组装换客户端二维数组 */
    svrElementArrayConvertTo2Array(serverElementArray: number[]) {
        let elementList: Array<Array<number>> = [];
        for (let index = 0; index < serverElementArray.length; index++) {
            let col = Math.floor(index / GameConst.MaxRow)
            let row = GameConst.MaxRow - index % GameConst.MaxRow - 1;
            if (!elementList[col]) {
                elementList[col] = [];
            }
            elementList[col][row] = serverElementArray[index]
        }
        return elementList
    }

    /**服务器的pos装换为客户端二维数组行列 */
    svrPosArrayConvertToRowAndCol(serverPosArray: number[]) {
        let points: Array<EPoint> = [];
        for (let index = 0; index < serverPosArray.length; index++) {
            let pos = serverPosArray[index]
            let col = Math.floor(pos / GameConst.MaxRow)
            let row = GameConst.MaxRow - (pos % GameConst.MaxRow);
            points.push({ col: col, row: row - 1 })
        }
        return points
    }


    /**下注结果 */
    setBetResult(data: THhscBetRsp) {
        // this.betData = data;
        this.curBetAmount = data.bet
        this.balance = data.balance;
        this.hhscElementId = data.chooseItem
        this.curBetResultRoundList = data.result.round_list;
    }

    /**获取指定回合的结果元素数据列表 */
    getResultElementDatas(roundIdx: number) {
        let roundData = this.curBetResultRoundList[roundIdx];
        if (roundData) {
            return this.svrElementArrayConvertTo2Array(roundData.item_type_list);
        }
    }
    /**获取指定回合的结果元素数据列表 */
    getHHSCResultElementDatas(roundIdx: number) {
        let roundData = this.curBetResultRoundList[roundIdx];
        if (roundData) {
            return this.svrElementArrayConvertTo2Array(roundData.item_type_list_append);
        }
    }

    /**获取进入虎虎生财模式下UI需要的数据 */
    getEnterHHSCModeUIInfo(roundIdx: number) {
        let roundData = this.curBetResultRoundList[roundIdx];
        if (roundData) {
            let data: EnterHHSCModeUIInfo = {
                elementId: this.hhscElementId,
                showElementResult: this.svrElementArrayConvertTo2Array(roundData.item_type_list_append)
            }
            return data
        }
    }

    getRoundData(roundIdx: number) {
        return this.curBetResultRoundList[roundIdx];
    }

    /**获取指定回合的结果奖励数据列表 */
    getResultAwardUIDatas(roundIdx: number) {
        let roundData = this.curBetResultRoundList[roundIdx];
        if (roundData) {
            if (roundData.prize_list?.length > 0) {
                this.lastWinAmount = roundData.win;
                let x10Type = this.getX10Type(roundData);
                let x10Win = roundData.win
                let x10Rate = roundData.round_rate * (roundData.multi_time || 1)
                let win = roundData.win;
                let rate = roundData.round_rate;
                if (x10Type != X10AnimationType.none) {
                    win = win / 10;
                }
                let arawdInfo: ResultAwardUIInfo = {
                    lastWin: x10Win,
                    balance: roundData.balance,
                    x10Type: x10Type,
                    x10ElementId: roundData.all_win_item,
                    wdElementPosList: this.getWdElementPosList(roundData.item_type_list),
                    win: win,
                    bigAwardNums: this.getResultBigAwardAnimationNums(this.curBetAmount, roundData.win),
                    showAwardAnimationLevel: this.getAwardAnimationLevel(rate / 5),
                    lastshowAwardAnimationLevel: this.getAwardAnimationLevel(x10Rate / 5),
                    lineInfos: this.getLineInfos(roundData.prize_list),
                }
                return arawdInfo
            }
        }
    }//(),

    /**不中奖数据 */
    getResulNoAwardUIDatas() {
        let roundData = this.curBetResultRoundList[0];
        if (roundData) {
            let wdElementPosList = this.getWdElementPosList(roundData.item_type_list)
            let noArawdInfo: ResultNoAwardUIInfo = {
                wdElementPosList: wdElementPosList,
            }
            return noArawdInfo
        }
    }

    /**获取hhsc结果奖励数据列表 */
    getHHSCResultAwardUIDatas(roundIdx: number) {
        let roundData = this.curBetResultRoundList[roundIdx];
        if (roundData) {
            if (roundData.prize_list?.length > 0) {
                let resultAwardUIInfo = this.getResultAwardUIDatas(roundIdx);
                let arawdInfo: HHSCResultAwardUIInfo = {
                    resultAwardUIInfo: resultAwardUIInfo,
                    showElementResult: this.svrElementArrayConvertTo2Array(roundData.item_type_list)
                }
                return arawdInfo
            }
        }
    }


    getX10Type(data: TRound) {
        if (this.mode == GameMode.hhsc) {
            if (data.all_win_item) {
                return X10AnimationType.hhscx10_quanxiao
            } else if (data.multi_time == 10) {
                return X10AnimationType.hhscx10
            }
        } else {
            if (data.all_win_item) {
                return X10AnimationType.x10_quanxiao
            } else if (data.multi_time == 10) {
                return X10AnimationType.x10
            }
        }
        return X10AnimationType.none
    }

    /**虎虎生财模式下UI展示数据 */
    getHHSCAwardUIDatas(roundIdx: number) {
        let oldRoundData = this.curBetResultRoundList[roundIdx - 1];
        let roundData = this.curBetResultRoundList[roundIdx];
        if (roundData) {
            let isNewLine: boolean = true;
            if (roundData.prize_list?.length > 0) {
                let lineInfo = this.getLineInfos(roundData.prize_list)
                if (oldRoundData) {
                    if (oldRoundData?.prize_list.length > 0) {
                        let oldLineInfo = this.getLineInfos(oldRoundData.prize_list)
                        if (lineInfo.length == oldLineInfo.length) {
                            isNewLine = false
                        }
                    }
                }
                let arawdInfo: ResultHHSCAwardUIInfo = {
                    isNewLine: isNewLine,
                    awardLines: lineInfo.map(v => v.idx - 1),
                    allElements: this.getHHSCAllElements(roundData)
                }
                return arawdInfo
            }
        }
    }

    getHHSCAllElements(roundData: TRound) {
        let allElements: Array<EPoint> = []
        let awardElements: Array<EPoint> = []
        for (let index = 0; index < roundData.prize_list.length; index++) {
            const element = roundData.prize_list[index];
            let es = LineToElementPosList[element.index - 1]
            es.forEach(v => {
                awardElements.push(v)
            })
        }
        for (let index = 0; index < roundData.item_type_list.length; index++) {
            let col = Math.floor(index / GameConst.MaxRow)
            let row = GameConst.MaxRow - index % GameConst.MaxRow - 1;
            let isAward = awardElements.some(v => {
                return v.col == col && v.row == row
            })
            allElements.push({ col: col, row: row, isAward: isAward })
        }
        return allElements
    }

    private getLineInfos(datas: TPrize[]) {
        let lineInfos: ResultLineInfo[] = [];
        for (let index = 0; index < datas.length; index++) {
            const element = datas[index];
            lineInfos.push({ idx: element.index, ePoint: LineToElementPosList[element.index - 1], win: element.win })
        }
        return lineInfos
    }

    getElementList() {
        return this.elementList;
    }

    /**界面初始化信息 */
    getInitViewInfo() {
        let viewInfo: InitUIInfo = {
            balance: this.balance,
            curBetAmount: this.getCurBetAmount(),
            lastWinAmount: this.lastWinAmount,
            elementList: this.elementList,
            lastResultAwardUIInfo: this.getResultAwardUIDatas(0),
        }
        return viewInfo
    }

    getCurBetId() {
        return this.curBetId
    }

    setCurBetId(id: number) {
        this.curBetId = id;
    }

    getAwardAnimationLevel(roundRate: number) {
        if (roundRate > 5) {
            return 3
        } else if (roundRate > 3) {
            return 2
        } else {
            return 1
        }
    }

    getWdElementCnt(elementList: number[]) {
        let cnt = 0;
        for (let index = 0; index < elementList.length; index++) {
            const element = elementList[index];
            if (element == GameConst.WDElementId) {
                cnt++;
            }
        }
        return cnt
    }

    getWdElementPosList(nums: number[]) {
        let wdElementPosList: Array<EPoint> = [];
        for (let index = 0; index < nums.length; index++) {
            const element = nums[index];
            if (element == GameConst.WDElementId) {
                let col = Math.floor(index / GameConst.MaxRow)
                let row = GameConst.MaxRow - index % GameConst.MaxRow - 1;
                wdElementPosList.push({ col: col, row: row })
            }
        }
        return wdElementPosList
    }

    getResultBigAwardAnimationNums(bet: number, win: number) {
        let nums: number[] = []
        let rate = win / bet;

        if (rate < rates[0]) {
            return nums
        }
        if (rate < rates[1]) {
            nums.push(win)
            return nums
        }
        if (rate < rates[2]) {
            return [rates[1] * bet, win]
        }
        return [rates[1] * bet, rates[2] * bet, win]

        // nums[nums.length - 1] = win
        // return nums
        // if (rate > rates[2]) {
        //     nums.push(win)
        // } else {
        //     nums[nums.length - 1] = win
        //     return nums
        // }
        // return nums
    }

    /**获取 大奖 巨奖 超级巨奖等级 */
    getResultBigAwardAnimationLevel(roundRate: number) {
        if (roundRate > 35) {//超级巨奖
            return 3
        } else if (roundRate > 15) {//巨奖
            return 2
        } else if (roundRate > 5) { //大奖
            return 1
        }
        return 0
    }



    getBetIdInfo(betId: number) {
        for (let index = 0; index < this.betInfo.bet_list.length; index++) {
            const element = this.betInfo.bet_list[index];
            if (element.id == betId) {
                return element;
            }
        }
    }

    getInitUIAutoData() {
        let uiData: InitUIAutoInfo = {
            balance: this.balance,
            curBetAmount: this.getCurBetAmount(),
            lastWinAmount: this.lastWinAmount,
            selectNums: AutoRounds,
        }
        return uiData
    }

    getInitUIBetSettingData() {
        let uiData: BaseGoldInfo = {
            balance: this.balance,
            curBetAmount: this.getCurBetAmount(),
            lastWinAmount: this.lastWinAmount,
        }
        return uiData
    }

    getAutoRollCntByIdx(idx: number) {
        return AutoRounds[idx]
    }

    getCurBetAmount() {
        let betId = this.curBetId
        if (betId) {
            for (let index = 0; index < this.betInfo.bet_list.length; index++) {
                const element = this.betInfo.bet_list[index];
                if (element.id == betId) {
                    return element.total_bet;
                }
            }
        }
        return 0
    }

    isMaxBet(amount: number) {
        let id = this.betInfo.addSubCombination[this.betInfo.addSubCombination.length - 1];
        let info = this.betInfo.bet_list[id - 1]
        if (amount >= info.total_bet) {
            return true
        }
        return false
    }

    isMinBet(amount: number) {
        let id = this.betInfo.addSubCombination[0];
        let info = this.betInfo.bet_list[id - 1]
        if (amount <= info.total_bet) {
            return true
        }
        return false
    }

    reduceBetAmount() {
        let curBetAmountInfo = this.betInfo.bet_list[this.curBetId - 1];
        let isSelect: boolean = false;
        for (let index = this.betInfo.addSubCombination.length - 1; index >= 0; index--) {
            const element = this.betInfo.addSubCombination[index];
            let betInfo = this.getBetIdInfo(element)
            if (betInfo.total_bet < curBetAmountInfo.total_bet) {
                this.curBetId = betInfo.id;
                isSelect = true;
                break;
            }
        }
        return this.betInfo.bet_list[this.curBetId - 1].total_bet
    }

    addBetAmount() {
        let curBetAmountInfo = this.betInfo.bet_list[this.curBetId - 1];
        for (let index = 0; index < this.betInfo.addSubCombination.length; index++) {
            const element = this.betInfo.addSubCombination[index];
            let betInfo = this.getBetIdInfo(element)
            if (betInfo.total_bet > curBetAmountInfo.total_bet) {
                this.curBetId = betInfo.id
                break;
            }
        }
        return this.betInfo.bet_list[this.curBetId - 1].total_bet
    }
}