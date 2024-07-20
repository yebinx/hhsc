/* eslint-disable */
/** @format */

// This is code generated automatically by the proto2api, please do not modify

export interface TResultList {
  // 结果的结果集
  result_list?: TResult[];
}

export interface TResult {
  round_list?: TRound[];
  // 本轮中奖的基本倍率 @int32
  rate?: number;
}

export interface TRound {
  // 本次所有卡牌, 0-14, @int32
  item_type_list?: number[];
  // 本次中奖的 @int32
  round_rate?: number;
  // 轮号 @uint32
  round?: number;
  // 翻倍倍数表, 1 2 3 5 还是  "6, 12, 18, 40"  # 免费游戏3  5次 @uint32
  multi_time?: number;
  // 奖励列表
  prize_list?: TPrize[];
  // 下一次要出的列表 @int32
  next_list?: number[];
  // 下落的列表
  drop_list?: TUintList[];
  // 胜利位置, 所有一起的胜利的位置 @uint32
  win_pos_list?: number[];
  // 当前的余额是多少 @int64
  balance?: number;
  // 获得几次免费次数 @uint32
  free_play?: number;
  // 玩家本轮中奖 @int64
  win?: number;
  // -1 是选择 0 普通,  1 , 2, 3 对应3个免费 @int32
  free_mode_type?: number;
  // 免费里面覆盖的盘面 @int32
  item_type_list_append?: number[];
  // 全屏消除且为同一个图标 @int32
  all_win_item?: number;
  // 当前的余额是多少
  balance_s?: string;
  // 玩家的输赢
  win_s?: string;
}

// 奖励的具体详情
export interface TPrize {
  // 胜利位置, 给客户端做连线和消除用 @uint32
  win_pos_list?: number[];
  // 线路编号 @uint32
  index?: number;
  // 轴, 至少是3, 至多是5 @uint32
  level?: number;
  // 中奖麻将类型 @int32
  item_type?: number;
  // 图标倍数 @int32
  rate?: number;
  // 消除用的单线 @uint32
  win_item_list?: number[];
  // 翻倍倍数表, 1 2 3 5 还是  "6, 12, 18, 40"  # 免费游戏3  5次 @uint32
  multi_time?: number;
  // 玩家本轮中奖 @int64
  win?: number;
  // 轴, 至少是3, 至多是5
  level_s?: string;
  // 中奖麻将类型
  item_type_s?: string;
  // 中奖麻将类型
  rate_s?: string;
  // 奖金乘数
  multi_time_s?: string;
  // 玩家的输赢
  win_s?: string;
}

// 展示用的二维数组
export interface TUintList {
  //  @uint32
  list?: number[];
}
