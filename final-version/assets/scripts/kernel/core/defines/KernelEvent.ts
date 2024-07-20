//---------------------------------
// 事件名
//---------------------------------
var KernelEvent = {
	Restart: "kernel_Restart",  						//cc.game.restart()前触发
	OrientationChanged: "kernel_OrientationChanged",	//横竖屏切换
	EnterBackground: "kernel_EnterBackground", 		//切入后台
	EnterForground: "kernel_EnterForground", 			//切回前台
	keyboard_down : "kernel_keyboard_down", 			//系统按键
	//
	NET_STATE : "kernel_NET_STATE",					//网络状态
	WS_ERROR_CODE : "kernel_WS_ERROR_CODE",			//错误码
	HTTP_ERROR_CODE : "kernel_HTTP_ERROR_CODE",		//错误码
	ERR_UNPACK_NETDATA : "kernel_ERR_UNPACK_NETDATA",	//解析网络包出错
	test_reconnect: "kernel_test_reconnect", 			//测试断线重连
	//
	SCENE_BEFORE_SWITCH : "kernel_SCENE_BEFORE_SWITCH", 	//切场景前触发
	SCENE_AFTER_SWITCH : "kernel_SCENE_AFTER_SWITCH", 		//切场景后触发
	UI_LOADING_BEGIN : "kernel_UI_LOADING_BEGIN",			//开始loading界面
	UI_LOADING_PROGRESS : "kernel_UI_LOADING_PROGRESS", 	//loading界面进度
	UI_LOADING_FINISH : "kernel_UI_LOADING_FINISH", 		//loading界面完成
	e_screen_size: "kernel_e_screen_size",					//屏幕尺寸变化
}

export default KernelEvent;
