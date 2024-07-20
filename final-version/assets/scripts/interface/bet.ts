/* eslint-disable */
/** @format */

// This is code generated automatically by the proto2api, please do not modify

import { TResult } from './result';

export interface THhscBetReq {
  // 身份令牌
  token?: string;
  // 下注ID @int32
  id?: number;
  // 幂等标识
  idempotent?: string;
}

export interface THhscBetRsp {
  // 结果
  result?: TResult;
  // 牌局信息
  round_id?: string;
  // 牌局信息
  order_id?: string;
  // 余额   整数int64 @int64
  balance?: number;
  // 下注金额  整数int64 @int64
  bet?: number;
  // 中奖金额 @int64
  prize?: number;
  // 玩家输赢, 不中奖就是-bet @int64
  player_win_lose?: number;
  // 是否进入免费游戏 @bool
  is_enter_free_game?: boolean;
  // 虎虎生财选中的图标 @int32
  chooseItem?: number;
  // 余额
  balance_s?: string;
  // 下注金额
  bet_s?: string;
  // 中奖金额
  prize_s?: string;
  // 玩家输赢, 不中奖就是-be
  player_win_lose_s?: string;
  // 免费游戏总赢
  free_game_total_win_s?: string;
  // 调试模式
  dbg?: string[];
}
