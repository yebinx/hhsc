/* eslint-disable */
/** @format */

// This is code generated automatically by the proto2api, please do not modify

import { THhscPlayerInfo } from './userinfo';

export interface THhscMuteReq {
  // 身份令牌
  token?: string;
  // 静音0-正常1静音 @int32
  mute?: number;
}

export interface THhscMuteRsp {
  player_info?: THhscPlayerInfo;
}
