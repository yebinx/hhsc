import { THhscGameInfo, THhscPlayerInfo } from "../interface/userinfo";
import BaseModel from "./BaseModel";

export default class LoginModel extends BaseModel {

    private token: string = "B12AB9FC3B7847E1A9BEFCBAC488FA06"

    /**游戏相关信息 */
    gameInfo:THhscGameInfo;

    /**玩家相关信息 */
    playerInfo:THhscPlayerInfo;

    setToken(token) {
        this.token = token
    }

    getToken() {
        return this.token;
    }

    setPlayerInfo(info:THhscPlayerInfo){
        this.playerInfo = info
    }

    getPlayerInfo(){
        return this.playerInfo
    }
}