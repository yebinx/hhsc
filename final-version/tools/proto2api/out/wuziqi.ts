/* eslint-disable */
/** @format */

// This is code generated automatically by the proto2api, please do not modify

// 游戏结束枚举
export enum FinishType {
  // 五子连排
  FT_FIVE_CHESS = 1,
  // 一方认输
  FT_GIVE_UP = 2,
  // 同意和棋
  FT_AGREE_DRAW = 3,
  // 总时间超时和棋
  FT_TIMEOUT_DRAW = 4,
  // 棋盘满
  FT_FULL_CHESS = 5,
  // 等待操作超时
  FT_OPERA_TIMEOUT = 6,
}
// 格子信息
export interface Grid {
  // 格子 0空，1黑，2白 @int32
  color?: number;
  //  @int32
  x?: number;
  //  @int32
  y?: number;
}

// 棋盘信息
export interface Board {
  // 棋盘格子信息
  grids?: Grid[];
  // 下棋的玩家uid
  next_round_userid?: string;
  // 倒计时（秒） @int32
  countdown?: number;
}

// 五子棋玩家数据
export interface WZQPlayer {
  // 可求和次数 @int32
  canDraw?: number;
  // 可悔棋次数 @int32
  canCancel?: number;
}

// 五子棋游戏现场
export interface WuziqiGameContext {
  // 玩家
  player?: WZQPlayer[];
  // 棋盘信息
  board?: Board;
  // 持黑棋子的玩家id
  blackUserId?: string;
  // 当前回合ID @int32
  roundId?: number;
  // 当前回合剩余时间，单位：毫秒 @int32
  roundLeftT?: number;
}

// 游戏回合通知
// GameRoundNtf                    = 0x1102;    // 游戏回合通知
export interface GameRoundNtf {
  // 等待操作的玩家id
  operateUserId?: string;
  // 倒计时（秒） @int32
  countdown?: number;
  // 是否结束 @bool
  over?: boolean;
}

// 玩家下棋请求
export interface RoundReq {
  //  @int32
  x?: number;
  //  @int32
  y?: number;
}

// 玩家下棋请求
export interface RoundRsp {
  // 结果码 @uint32
  code?: number;
}

// 格子变化通知
export interface GridChangeNtf {
  // 玩家id
  userId?: string;
  //  @int32
  x?: number;
  //  @int32
  y?: number;
  // 棋子值，1：黑：2：白，0：撤回 @int32
  val?: number;
}

// 操作请求
export interface OperateReq {
  // 操作ID，1：悔棋，2：和棋，3：认输 @int32
  operaID?: number;
}

// 操作回复
export interface OperateRsp {
  // 结果码 @uint32
  code?: number;
}

// 对方操作请求的通知
export interface OtherOperateNtf {
  // 操作ID，1：悔棋，2：和棋 @int32
  operaID?: number;
}

// 处理对方操作
export interface DealOtherOperateReq {
  // 操作ID，1：悔棋，2：和棋 @int32
  operaID?: number;
  // true同意，false不同意 @bool
  agree?: boolean;
}

// 处理对方操作
export interface DealOtherOperateRsp {
  // 结果码 @uint32
  code?: number;
}

// 对方处理的通知
export interface OtherDealNtf {
  // 操作ID，1：悔棋，2：和棋 @int32
  operaID?: number;
  // true同意，false不同意 @bool
  agree?: boolean;
}

// 段位数据
export interface Section {
  // 主段位 @int32
  mainSection?: number;
  // 子段位 @int32
  subSection?: number;
  // 当前经验 @int32
  cur?: number;
  // 升级需要的经验 @int32
  need?: number;
}

// 游戏结束
export interface GameFinishNtf {
  // 结束原因，对应枚举 FinishType @int32
  reason?: number;
  // 胜者玩家id，和棋或超时时为空
  winUserId?: string;
  // 获胜的格子信息
  grids?: Grid[];
  // 回合数 @int32
  roundNum?: number;
  // 用时（秒数） @int32
  useSecond?: number;
  // 段位数据
  section?: Section;
  // 增加的亲密度 @int32
  intimacy?: number;
  // 房间扩展数据
  roomExtradata?: string;
}
