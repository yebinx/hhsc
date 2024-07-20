/* eslint-disable */
/** @format */

// This is code generated automatically by the proto2api, please do not modify

export interface THhscRecordListReq {
  // 身份令牌
  token?: string;
  // 开始时间-时间戳-毫秒 @int64
  start_timestamp?: number;
  // 结束时间-时间戳-毫秒, 如果这个等于0会使用当前时间戳 @int64
  end_timestamp?: number;
  // 请求的数量, 如果是0 会是默认值10, 如果超过200, 则是200 @int32
  limit?: number;
  // 注意, 5 , 6, 7  只能有一个生效,
  // 顺序 id > page > offset @int32
  page?: number;
  // 第一次是0, 以后每一次就是用上一次的id @int64
  id?: number;
  // 偏移量, @int32
  offset?: number;
}

export interface THhscRecordListRsp {
  // 总下注
  bet_s?: string;
  // 总盈利
  win_s?: string;
  // 游戏记录
  list?: THhscRecordInfo[];
  // 用来查询的ID @int64
  id?: number;
  // 数量 @uint32
  count?: number;
  // 总下注 @int64
  bet?: number;
  // 总盈利 @int64
  win?: number;
}

export interface THhscRecordInfo {
  create_time?: string;
  // 数据库索引-mongodb-obj-id
  order_id?: string;
  // 交易单号
  round_id?: string;
  // 盈利
  win_s?: string;
  // 下注
  bet_s?: string;
  // 免费游戏次数 @int32
  free_times?: number;
  // -1 是选择 0 普通,  1 , 2, 3 对应3个免费 @int32
  free_mode_type?: number;
  // 创建时间-时间戳-毫秒 @int64
  create_timestamp?: number;
  // 是否免费游戏 @bool
  free?: boolean;
  // 普通游戏 @uint32
  normal_round_times?: number;
  // 免费游戏 @uint32
  free_round_times?: number;
  // 下注的额度 @int64
  bet?: number;
  // 盈利 @int64
  win?: number;
}
