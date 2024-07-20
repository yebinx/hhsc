


export enum EDateType {
    year,
    month,
    day,
}

export default class GameConst {

    /**最大行数 */
    static MaxRow: number = 3;

    /**登录最大重试次数 */
    static MaxReLoginCnt: number = 5;
    // 0 // 空
    // 1 // 百搭可代替所有图标
    // 2 // 元宝
    // 3 // 玉如意
    // 4 // 福袋
    // 5 // 红包
    // 6 // 鞭炮
    // 7 // 橙子
    static ElementList = [1, 2, 3, 4, 5, 6, 7]

    static WDElementId = 1

    /**基础倍数 */
    static BeseGold: number = 10000;

    /**赔付表 */
    static ElementRateList: Map<number, number> = new Map([
        [1, 250],
        [2, 100],
        [3, 25],
        [4, 10],
        [5, 8],
        [6, 5],
        [7, 3],
    ])
}

export enum GameState {
    wait,//等待
    roll,//转动
    hhsc_roll_start,//虎虎生财转动
    hhsc_roll,//虎虎生财转动
    show_result,//显示结果
    start_stop_roll,//停止转动
    cancel_roll,//提前停止转动
    hhsc_cancel_roll,//虎虎生财取消
    delay,//新增一个阶段可以取消快速旋转
}