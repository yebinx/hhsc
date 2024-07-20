import { sys } from "cc";
import StringUtil from "./utils/StringUtil";


export default class logger {
	private static origin_console_log = console.log;
	private static origin_console_warn = console.warn;
	private static origin_console_error = console.error;

	private static no_cc = function(msg: string|any, ...subst: any[]): void {

	}

	private static no_console = function(...data: any[]): void {

	}

	private static _green(msg: any, ...subst: any[]) {
		let s = StringUtil.formatStr(msg, ...subst);
		logger.log('%c'+s, 'color: green;');
	}

	private static _blue(msg: any, ...subst: any[]) {
		let s = StringUtil.formatStr(msg, ...subst);
		logger.log('%c'+s, 'color: blue;');
	}

	private static _purple(msg: any, ...subst: any[]) {
		let s = StringUtil.formatStr(msg, ...subst);
		logger.log('%c'+s, 'color: purple;');
	}

	private static _red(msg: any, ...subst: any[]) {
		let s = StringUtil.formatStr(msg, ...subst);
		logger.log('%c'+s, 'color: red;');
	}

	private static _yellow(msg: any, ...subst: any[]) {
		let s = StringUtil.formatStr(msg, ...subst);
		logger.log('%c'+s, 'color: yellow;');
	}

	private static _pink(msg: any, ...subst: any[]) {
		let s = StringUtil.formatStr(msg, ...subst);
		logger.log('%c'+s, 'color: pink;');
	}

	private static _orange(msg: any, ...subst: any[]) {
		let s = StringUtil.formatStr(msg, ...subst);
		logger.log('%c'+s, 'color: orange;');
	}

	//-------------------------------------------------------------------------------

	static log = console.log;
	static warn = console.warn;
	static error = console.error;

	static green(msg: any, ...subst: any[]) { }
	static blue(msg: any, ...subst: any[]) { }
	static purple(msg: any, ...subst: any[]) { }
	static red(msg: any, ...subst: any[]) { }
	static yellow(msg: any, ...subst: any[]) { }
	static pink(msg: any, ...subst: any[]) { }
	static orange(msg: any, ...subst: any[]) { }

	static enableLogger(bEnable:boolean) {
		if(bEnable) {
			let isPcBrowse = sys.isBrowser && !sys.isMobile
			this.log = this.origin_console_log;
			this.warn = this.origin_console_warn;
			console.log = this.origin_console_log;
			console.warn = this.origin_console_warn;
			this.green = isPcBrowse && this._green || this.origin_console_log;
			this.blue = isPcBrowse && this._blue || this.origin_console_log;
			this.purple = isPcBrowse && this._purple || this.origin_console_log;
			this.red = isPcBrowse && this._red || this.origin_console_log;
			this.yellow = isPcBrowse && this._yellow || this.origin_console_log;
			this.pink = isPcBrowse && this._pink || this.origin_console_log;
			this.orange = isPcBrowse && this._orange || this.origin_console_log;
		} else {
			this.log = this.no_cc;
			this.warn = this.no_cc;
			console.log = this.no_console;
			console.warn = this.no_console;
			this.green = this.no_cc;
			this.blue = this.no_cc;
			this.purple = this.no_cc;
			this.red = this.no_cc;
			this.yellow = this.no_cc;
			this.pink = this.no_cc;
			this.orange = this.no_cc;
		}
	}
}
