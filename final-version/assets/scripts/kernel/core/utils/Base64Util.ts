import { isNil } from "../Globals";

export default class Base64Util {
    
    public static arrayBufferToBase64(buffer) : string {
		var binary = '';
		var bytes = new Uint8Array( buffer );  
		var len = bytes.byteLength;  
		for (var i = 0; i < len; i++) { 
			binary += String.fromCharCode( bytes[ i ] );  
		} 
		return window.btoa( binary );
	}
	
	static isValidBase64Image(base64Str:string) : boolean {
		if(isNil(base64Str)) { return false; }
		if(typeof(base64Str) != "string") { return false; }
		return base64Str.substring(0, 10) == "data:image";
	}

}


