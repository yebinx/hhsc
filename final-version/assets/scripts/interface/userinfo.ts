/* eslint-disable */
/** @format */

// This is code generated automatically by the proto2api, please do not modify

import { TRound } from './result';

export interface THhscUserInfoReq {
  // 身份令牌
  token?: string;
}

export interface THhscUserInfoRsp {
  player_info?: THhscPlayerInfo;
  game_info?: THhscGameInfo;
  // 数组形态, 这个形态下会出更多的内容 @int32
  list?: number[];
  // 上局情况
  lastRound?: TRound;
}

export interface THhscPlayerInfo {
  // 玩家id @int64
  id?: number;
  // 玩家余额 @int64
  balance?: number;
  // 玩家账户
  account?: string;
  // 玩家昵称(如果需要)
  nickname?: string;
  // 玩家类型:0-正常1-试玩 @int32
  type?: number;
  // 玩家静音:0-正常1-静音 @int32
  mute?: number;
}

export interface THhscGameInfo {
  //  @int64
  id?: number;
  // int32           free_play_times             = 3;    // 上一次下注剩余次数 @int64
  last_time_bet?: number;
  // 上一次下注的iD @int64
  last_time_bet_id?: number;
  // 投注大小 @int64
  last_time_bet_size?: number;
  // 基础投注 @int32
  last_time_basic_bet?: number;
  // 下注倍数 @int32
  last_time_bet_multiple?: number;
  // 免费总次数 @int32
  free_total_times?: number;
  // 免费剩余次数 @int32
  free_remain_times?: number;
  // 免费游戏总赢 @int64
  free_game_total_win?: number;
  // 总投注 @int64
  total_bet?: number;
  // 总投注次数 @int32
  total_bet_times?: number;
  // 总免费次数 @int32
  total_free_times?: number;
  // -1 是选择 0 普通,  1 , 2, 3 对应3个免费 @int32
  free_mode_type?: number;
  // 上局赢分 @int64
  last_win?: number;
  // 上局倍数 不是1就是10 @int64
  last_multi?: number;
}
