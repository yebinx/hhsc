var Routes = {
    req_login: "api/v1/hhsc/user/info",  //登录
    req_heartbeat: "v1/hhsc/heartbeat",  //心跳
    req_switch_audio:"api/v1/hhsc/mute",//切换音乐
    //
    req_bet: "api/v1/hhsc/bet",  //下注
    req_free: "v1/hhsc/free",  //免费游戏 !!!USELESS!!!
    req_history: "api/v1/hhsc/record/list",  //历史记录
    req_hisdetail: "api/v1/hhsc/record/detail",  //记录详情
    req_bet_info: "api/v1/hhsc/bet/info", //
    req_balance: "",  //余额
}

export default Routes;
