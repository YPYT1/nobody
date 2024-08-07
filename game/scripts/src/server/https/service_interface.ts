/**
 *  服务接口
 */
import { UIEventRegisterClass } from '../../modules/class_extends/ui_event_register_class';
import { reloadable } from '../../utils/tstl-utils';

import * as ServerSkillExp from "../../json/config/server/hero/server_skill_exp.json";
import * as ServerSkillful from "../../json/config/server/hero/server_skillful.json";

@reloadable
export class ServiceInterface extends UIEventRegisterClass{
    
    constructor() {
        super("ServiceInterface")
        //初始化总等级
        for (let index = 0; index < 6; index++) {
            this.PlayerServerSkillLevelCount.push({
                level : {}
            })
        }
        //初始化分支等级
        for (let index = 0; index < 6; index++) {
            this.PlayerServerSkillTypeLevel.push({})
        }
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
    //主类型总等级
    PlayerServerSkillLevelCount : PlayerServerSkillLevelCount[] = [];
    //分支等级
    PlayerServerSkillTypeLevel : CGEDServerSkillTypeLevel[] = [];
    /**
     * 经验值转等级
     * @param key 
     */
    GetServerSkillfulLevel(key : string , exp : number) : { level : number , cur_exp : number}{
        let exp_equation = ServerSkillExp[key as keyof typeof ServerSkillExp].exp;
        let yyexp = exp;
        let level = 0;
        
        for (let index = 1; index < 30; index++) { 
            let param = {
                lv : index,
            } 
            let use_exp = LFUN.eval(exp_equation , param )
            if(yyexp >= use_exp){
                level ++;
                yyexp -= use_exp;
            }else{
                return {
                    level : level,
                    cur_exp : yyexp,
                };
            }
        }
    }
    /**
     * 加载存档技能等级
     * @param player_id 
     */
    LoadSkillfulLevel(player_id : PlayerID){

        this.PlayerServerSkillLevelCount[player_id] = {
            level : {}
        }

        this.PlayerServerSkillTypeLevel[player_id] = {};

        
        let level_obj : { [ key : string] : number } =  {};
        for (let index = 1; index <= 15; index++) {
            level_obj[index.toString()] = RandomInt(10000 , 920000);
        }
        for (const key in level_obj) {
            let lvdata = this.GetServerSkillfulLevel( key , level_obj[key]);
            this.PlayerServerSkillLevelCount[player_id].level[key] = {
                "lv" : lvdata.level,
                "exp" : level_obj[key],
                "type" : tonumber(key),
                "cur_exp" : lvdata.cur_exp,
            }
        }
        //加载分支信息
        GameRules.ServiceInterface.LoadSkillTypeLevel(player_id)
        DeepPrintTable(this.PlayerServerSkillLevelCount[player_id]);
    }

    //分支生效等级
    LoadSkillTypeLevel(player_id : PlayerID){
        for (let index = 1; index <= Object.keys(this.PlayerServerSkillLevelCount[player_id].level).length; index++) {
            const PlayerServerSkillLevelCount = this.PlayerServerSkillLevelCount[player_id].level[index.toString()];
            for (const key in ServerSkillful) {
                let ServerSkillfulData = ServerSkillful[key as keyof typeof ServerSkillful];
                print("ServerSkillfulData.type : " , ServerSkillfulData.type)
                print("PlayerServerSkillLevelCount.type : " , PlayerServerSkillLevelCount.type)
                //初始化
                if(ServerSkillfulData.type == PlayerServerSkillLevelCount.type){
                    //计算等级
                    if(ServerSkillfulData.is_lock == 1){ //处理特殊解锁
                        if(PlayerServerSkillLevelCount.lv >= ServerSkillfulData.min_level){
                            this.PlayerServerSkillTypeLevel[player_id][key] = {
                                lv : 1,
                            }
                        }else{
                            this.PlayerServerSkillTypeLevel[player_id][key] = {
                                lv : 0,
                            }
                        }
                    }else{
                        if(PlayerServerSkillLevelCount.lv >= ServerSkillfulData.max_level ){
                            this.PlayerServerSkillTypeLevel[player_id][key] = {
                                lv : ServerSkillfulData.max_level - ServerSkillfulData.min_level + 1,
                            }
                        }else{
                            
                            let skill_level = PlayerServerSkillLevelCount.lv - (ServerSkillfulData.min_level - 1)
                            if(skill_level > 0){
                                this.PlayerServerSkillTypeLevel[player_id][key] = {
                                    lv : skill_level,
                                }
                            }else{
                                this.PlayerServerSkillTypeLevel[player_id][key] = {
                                    lv : 0,
                                }
                            }

                        }
                    }
                }
            }
        }


        DeepPrintTable(this.PlayerServerSkillTypeLevel[player_id]);
    }

    Debug(cmd: string, args: string[], player_id: PlayerID) {
        if(cmd == "-LoadSkillfulLevel"){
            this.LoadSkillfulLevel(player_id)
        }
    }
}