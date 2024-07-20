//---------------------------------
// protobuf格式数据编码解码
//---------------------------------
import ICodec from "./ICodec";

export default class ProtobufCodec implements ICodec {

	encode(pkg:any, structName:string, tsObj:any) 
	{
		let message = pkg[structName].create(tsObj);
		let buff = pkg[structName].encode(message).finish();
		return buff;
	}

	decode(pkg:any, structName:string, bytes:any) 
	{
		if(bytes === null){ return null; }
		var data = new Uint8Array(bytes);
		var obj = pkg[structName].decode(data);
		var info = pkg[structName].toObject(obj);
		return info;
	}

}
