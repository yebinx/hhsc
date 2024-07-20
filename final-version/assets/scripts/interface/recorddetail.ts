/* eslint-disable */
/** @format */

// This is code generated automatically by the proto2api, please do not modify

import { TPrize } from './result';

// 详情
export interface THhscRecordDetailReq {
  // 身份令牌
  token?: string;
  // 交易单号, 前面拿到的order_id
  order_id?: string;
}

export interface THhscRecordDetailRsp {
  // 游戏记录
  list?: THhscRecordDetailInfo[];
}

// 回合的详情
export interface THhscRoundDetailInfo {
  bet_s?: string;
  // 中奖金额
  prize_s?: string;
  // 玩家的输赢
  player_win_lose_s?: string;
  // 余额
  balance_s?: string;
  // 投注大小
  bet_size_s?: string;
  // 轮号 @uint32
  round?: number;
  // 数据库索引-mongodb-obj-id
  order_id?: string;
  // 交易单号
  round_id?: string;
  // 投注 @int64
  bet?: number;
  // 中奖金额 @int64
  prize?: number;
  // 玩家的输赢 @int64
  player_win_lose?: number;
  // 余额 @int64
  balance?: number;
  // 投注大小 @int64
  bet_size?: number;
  // 投注倍数 @int32
  bet_multiple?: number;
  // 基础投注 @int32
  basic_bet?: number;
  // 翻倍倍数表 @uint32
  multi_time?: number;
  // 奖励数量 @int32
  prize_list_count?: number;
  // 奖励列表
  prize_list?: TPrize[];
  // 本次所有卡牌, 0-22, @int32
  item_type_list?: number[];
}

export interface THhscRecordDetailInfo {
  // 创建时间-时间
  create_time?: string;
  // 数据库索引-mongodb-obj-id
  order_id?: string;
  // 交易单号
  round_id?: string;
  bet_s?: string;
  prize_s?: string;
  // -1 是选择 0 普通,  1 , 2, 3 对应3个免费 @int32
  free_mode_type?: number;
  player_win_lose_s?: string;
  // 余额   整数string
  balance_s?: string;
  // 得分前，下注后的
  balance_before_score_s?: string;
  // 创建时间-时间戳-毫秒 @int64
  create_timestamp?: number;
  // 下注金额  整数int64 @int64
  bet?: number;
  // 中奖金额 @int64
  prize?: number;
  // 玩家输赢, 不中奖就是-bet @int64
  player_win_lose?: number;
  // 余额   整数int64 @int64
  balance?: number;
  // 得分前，下注后的 @int64
  balance_before_score?: number;
  // 是否免费游戏 @bool
  free?: boolean;
  // 免费总次数 @uint32
  free_total_times?: number;
  // 免费剩余次数 @uint32
  free_remain_times?: number;
  // 免费游戏总赢 @uint64
  free_game_total_win?: number;
  // 投注大小 @int64
  bet_size?: number;
  // 基础投注    -  这里固定20 @int32
  basic_bet?: number;
  // 投注倍数 @int32
  bet_multiple?: number;
  // round list 的数量 @int32
  round_list_count?: number;
  // 回合的详情
  round_list?: THhscRoundDetailInfo[];
}
