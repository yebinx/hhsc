/* eslint-disable */
/** @format */

// This is code generated automatically by the proto2api, please do not modify

import { TResult } from './result';

export interface THhscGameRecordReq {
  // 身份令牌
  token?: string;
  // 交易单号-mongodb-obj-id
  order_id?: string;
}

export interface THhscGameRecordRsp {
  // 结果
  result?: TResult;
  // 余额   整数int64 @int64
  balance?: number;
  // 得分前，下注后的 @int64
  balance_before_score?: number;
  // 下注金额  整数int64 @int64
  bet?: number;
  // 中奖金额 @int64
  prize?: number;
  // 玩家输赢, 不中奖就是-bet @int64
  player_win_lose?: number;
  // 是否免费游戏 @bool
  free?: boolean;
  // 免费总次数 @uint32
  free_total_times?: number;
  // 免费剩余次数 @uint32
  free_remain_times?: number;
  // 免费游戏总赢 @uint64
  free_game_total_win?: number;
}
