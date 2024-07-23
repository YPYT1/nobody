/**
 *  服务接口
 */
import { UIEventRegisterClass } from '../../modules/class_extends/ui_event_register_class';
import { reloadable } from '../../utils/tstl-utils';

import * as ServerSkillful from "../../json/config/server/hero/server_skillful.json";

@reloadable
export class ServiceInterface extends UIEventRegisterClass{
    
    constructor() {
        super("ServiceInterface")
    }
    //游戏激活状态
    _game_activate = 0;

    //获取游戏是否激活
    GetGameActivate(player_id: PlayerID, params: any, callback?) {  
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_GetGameActivate",
            {   
                data: {
                    Activate: GameRules.ServiceInterface._game_activate
                }
            }
        );
    }

    //激活游戏
    PlyaerGameActivate(player_id: PlayerID, params: any, callback?) {
        let key:string = params.key;
        GameRules.ArchiveService.VerificationCode(player_id, key);
    }

    PlayerServerSkillful : CGEDServerSkillful[] = [];
    /**
     * 经验值转等级
     * @param key 
     */
    GetServerSkillfulLevel(key : string , exp : number) : { level : number , cur_exp : number}{
        ServerSkillful[key as keyof typeof ServerSkillful].exp;
        let yyexp = exp;
        let level = 0;
        let cur_exp = 0;
        
        for (let index = 1; index < 30; index++) {  
            let use_exp = 24500 + index * 500;
            if(yyexp >= use_exp){
                level ++;
                yyexp -= use_exp;
            }else{
                return {
                    level : level,
                    cur_exp : cur_exp,
                };
            }
        }
    }
    /**
     * 加载存档技能等级
     * @param player_id 
     */
    LoadSkillfulLevel(player_id : PlayerID){
        for (let index = 0; index < 6; index++) {
            this.PlayerServerSkillful.push({
                level : {}
            })
        }
        let level_obj : { [ key : string] : number } =  {};
        for (let index = 1; index <= 32; index++) {
            let SkillData = ServerSkillful[index.toString() as keyof typeof ServerSkillful];
            if(SkillData.is_lock == 0){
                level_obj[index.toString()] = RandomInt(10000 , 920000);
            }
        }
        for (const key in level_obj) {
            let type = ServerSkillful[key as keyof typeof ServerSkillful].type;
            let lvdata = this.GetServerSkillfulLevel( key , level_obj[key]);
            this.PlayerServerSkillful[player_id].level[key] = {
                "lv" : lvdata.level,
                "exp" : level_obj[key],
                "type" : type,
                "cur_exp" : lvdata.cur_exp,
            }
        }
        DeepPrintTable(this.PlayerServerSkillful[player_id]);
    }

    Debug(cmd: string, args: string[], player_id: PlayerID) {
        
    }
}