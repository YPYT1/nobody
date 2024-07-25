import { reloadable } from "../../../utils/tstl-utils";
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";

/** 单位扩展 */
@reloadable
export class GameInformation extends UIEventRegisterClass {

    constructor() {
        super("GameInformation");
    }

    player_life_list : number[] = [ 2 , 2 , 2 , 2 , 2 , 2];
    
    /**
     * 设置玩家生命数
     * @param player_id 
     * @param count 
     */
    SetPlayerLife( player_id : PlayerID , count : number ){
        GameRules.GameInformation.player_life_list[player_id] = count;
        GameRules.GameInformation.GetPlayerLifeData(player_id , {})
    }

    /**
     * 增加或减少玩家生命数
     * @param player_id 
     * @param count 
     */
    AddPlayerLife( player_id : PlayerID , count : number ){
        GameRules.GameInformation.player_life_list[player_id] += count;
        GameRules.GameInformation.GetPlayerLifeData(player_id , {})
    }

    HeroDie( unit : CDOTA_BaseNPC_Hero) {
        let player_id = unit.GetPlayerOwnerID();
        let game_over = true;
        //检查全部英雄是否还有剩余生命
        let player_count = 1;
        for (let index  = 0 as PlayerID; index < player_count; index++) {
            const ps_life = this.player_life_list[index];
            let hHero = PlayerResource.GetSelectedHeroEntity(index);
            if(ps_life > 0 || hHero.IsAlive()){
                game_over = false
                break;
            }
        }
        //游戏结束
        if(game_over == true){
            GameRules.MapChapter.GameLoser()
            return ;
        }
        if(this.player_life_list[player_id] > 0){
            //测试模式下死亡会增加生命
            // if(IsInToolsMode()){
            //     this.player_life_list[player_id] += 2;
            // }
            GameRules.CMsg.SendCommonMsgToPlayer(
                player_id,
                "你还剩【" + (this.player_life_list[player_id] - 1) + "】条生命,3秒后复活",
                {}
            );
            Timers.CreateTimer(3, () => {
                //减少玩家生命
                GameRules.GameInformation.AddPlayerLife(player_id , -1)
                unit.SetRespawnPosition(unit.GetAbsOrigin());
                unit.RespawnHero(false, false);
                unit.AddNewModifier(unit, null, "modifier_state_invincible", { duration: 3 });
            });
        }else{
            GameRules.CMsg.SendCommonMsgToPlayer(
                player_id,
                "你没有剩余生命。",
                {}
            );
        }
    }
    /**
    * 获取所有玩家生命值
    */
    GetPlayerLifeData(player_id: PlayerID, params: CGED["GameInformation"]["GetPlayerLifeData"]) {
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "GameInformation_GetPlayerLifeData",
            {
                data: {
                    "player_life" : this.player_life_list[player_id]
                }
            }
        );
    }

    /**
     *  头部信息
     */
    play_game_time : number  = 0;

    SetPlayGameTime(time : number){
        GameRules.GameInformation.play_game_time = time;
        GameRules.GameInformation.GetPlayGameHeadData( -1 , {})
    }

    /**
    * 获取局内头部信息
    */
    GetPlayGameHeadData(player_id: PlayerID, params: CGED["GameInformation"]["GetPlayGameHeadData"]) {
        if(player_id  == -1){
            CustomGameEventManager.Send_ServerToAllClients(
                "GameInformation_GetPlayGameHeadData",
                {
                    data: {
                        time : GameRules.GameInformation.play_game_time,
                        difficulty : GameRules.MapChapter.GameDifficulty
                    }
                }
            );
        }else{
            CustomGameEventManager.Send_ServerToAllClients(
                "GameInformation_GetPlayGameHeadData",
                {
                    data: {
                        time : GameRules.GameInformation.play_game_time,
                        difficulty : GameRules.MapChapter.GameDifficulty
                    }
                }
            );
        }
    }
}   