var Base = {

}

var GameEvent = {
    user_login_fail: "user_login_fail",
    user_login_succ: "user_login_succ",
    
    comp_bet_scroll_opt_start: "comp_bet_scroll_opt_start",
    comp_bet_scroll_opt_end: "comp_bet_scroll_opt_end",
    key_down_space: "key_down_space",
    key_pressing_space: "key_pressing_space",


    ui_show_hisdetail_tip: "ui_show_hisdetail_tip",
    click_element: "click_element",//点击元素
    reconnect_tip: "reconnect_tip_enter",//重连提示
    reconnect_tip_close: "reconnect_tip_close",//重连提示

    close_bigreward: "close_bigreward",
    game_switch_fast: "game_switch_fast",//切换快速模式

    ref_record_filter: "ref_record_filter",//刷新过滤

    game_axis_roll_frist_move_lowest: "game_axis_roll_frist_move_lowest",//第一个元素移动到最低端

    game_axis_roll_top_full_move_scene: "game_axis_roll_top_full_move_scene",//最上面一个元素移动全部移动到屏幕 需要补充元素

    update_game_state: "update_game_state",//更新游戏状态
    update_game_change_bet_amount: "update_game_change_bet_amount",//改变下注数量
    game_start_roll: "game_start_roll",//游戏开始转动
    game_axis_roll_end: "game_axis_roll_end",//单轴滚动结束
    game_axis_ready_roll_end: "game_axis_ready_roll_end",//单轴准备滚动结束
    game_roll_complete: "game_roll_complete",//滚动完成
    game_update_player_blance: "game_update_player_blance",//更新玩家余额
    // betvalue_set: "betvalue_set",//设置下注数值
    game_start_stop_roll: "game_start_stop_roll",//数据返回游戏开始停止转动
    enter_hhsc_mode: "enter_hhsc_mode",//进入虎虎生财模式
    //enter_hhsc_mode_rescroll_1: "enter_hhsc_mode_rescroll_1",//进入虎虎生财模式 重新滚动元素只出现百搭
    //enter_hhsc_mode_rescroll_2: "enter_hhsc_mode_rescroll_2",//进入虎虎生财模式 重新滚动元素只出现百搭 与 指定元素
    game_show_award_result: "game_show_award_result",//展示中奖结果
    game_show_no_award_result: "game_show_no_award_result",//展示不中奖结果
    game_show_hhsc_award_result: "game_show_hhsc_award_result",//虎虎生财展示中奖结果
    game_show_hhsc_enter_next_round: "game_show_hhsc_enter_next_round",//虎虎生财进入下一轮
    game_show_hhsc_round_award_result: "game_show_hhsc_round_award_result",//虎虎生财一轮展示中奖结果
    game_clear_award_result: "game_clear_award_result",//清理展示中奖结果
    game_update_open_auto_roll: "game_open_auto_roll",//是否打开自动旋转

    ui_req_loading_complete: "ui_req_loading_complete",//发送请求中完成
    game_sleep: "game_sleep",//待机
}


export default GameEvent