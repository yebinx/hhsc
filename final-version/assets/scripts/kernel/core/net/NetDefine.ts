// 网络连接状态
export enum ConnState {
	unconnect = 0, 	//尚未连接
	
	connecting,		//正在连接
	connectsucc,	//连接成功
	connectfail,	//连接失败

	reconnecting,	//正在重连
	reconnectsucc,	//重连成功
	reconnectfail,	//重连失败
}

// 网络包编解码格式
export enum ProcessorType {
	Json,
	LeafWs,
}

export var NetHeadSize = [0, 2];
export var NetLittleEndian = [true, true];

// 网络通道类型
export enum ChannelType {
	Ws,
	Tcp,
	Udp,
	Http,
}

// HTTP响应状态
export enum EHttpResult {
	Idle,
	Working,
	Succ,
	Timeout,
	Aborted,
	Error
}

export function isFailErrCode(code:number) : boolean {
	return !(code===null || code===undefined || code==0);
}
