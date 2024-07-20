/* eslint-disable */
/** @format */

// This is code generated automatically by the proto2api, please do not modify

// 获取 财神来了 游戏的初始内容
export interface THhscBetInfoReq {}

export interface THhscBetInfoRsp {
  // 下注的信息, 这里获取
  bet_list?: THhscBetInfo[];
  // 默认的ID @int32
  default_id?: number;
  // 加减组合id @int32
  addSubCombination?: number[];
}

export interface THhscBetInfo {
  // 基本下注单位 @int64
  bet_size?: number;
  // 倍率 @int32
  bet_multiple?: number;
  // 20,  固定20 @int32
  basic_bet?: number;
  // 实际下注 @int64
  total_bet?: number;
  // 下注ID @int32
  id?: number;
  // 字符串形态
  bet_size_s?: string;
  // 字符串形态
  total_bet_s?: string;
}
