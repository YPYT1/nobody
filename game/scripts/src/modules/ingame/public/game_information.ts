import { reloadable } from "../../../utils/tstl-utils";
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";

/** 单位扩展 */
@reloadable
export class GameInformation extends UIEventRegisterClass {

    constructor() {
        super("GameInformation");
    }

    player_life_list: number[] = [2, 2, 2, 2, 2, 2];

    player_die_count: number[] = [0, 0, 0, 0, 0, 0];

    player_die_time: number[] = [0, 0, 0, 0, 0, 0];

    /**
     * 设置玩家生命数
     * @param player_id 
     * @param count 
     */
    SetPlayerLife(player_id: PlayerID, count: number) {
        GameRules.GameInformation.player_life_list[player_id] = count;
        GameRules.GameInformation.GetPlayerLifeData(player_id, {})
    }

    /**
     * 增加或减少玩家生命数
     * @param player_id 
     * @param count 
     */
    AddPlayerLife(player_id: PlayerID, count: number) {
        GameRules.GameInformation.player_life_list[player_id] += count;
        GameRules.GameInformation.GetPlayerLifeData(player_id, {})
    }

    HeroDie(unit: CDOTA_BaseNPC_Hero) {
        let player_id = unit.GetPlayerOwnerID();
        let game_over = true;
        //检查全部英雄是否还有剩余生命
        let player_count = GetPlayerCount();
        for (let index = 0 as PlayerID; index < player_count; index++) {
            let hHero = PlayerResource.GetSelectedHeroEntity(index);
            if (hHero.IsAlive()) {
                game_over = false
                break;
            }
        }
        //游戏结束
        if (game_over == true) {
            //取消所有玩家的定时器
            for (let index = 0 as PlayerID; index < player_count; index++) {
                let hHero = PlayerResource.GetSelectedHeroEntity(index);
                if (!hHero.IsAlive()) {
                    hHero.StopThink("HeroDie");
                }
            }
            GameRules.MapChapter.GameLoser()
            return;
        }
        this.player_die_count[player_id]++;
        let d_time = 10 + (this.player_die_count[player_id] * 5 * (player_count - 1));
        let game_d_time = GameRules.GetDOTATime(false, false) + d_time;
        this.player_die_time[player_id] = game_d_time;
        // 这里创建一个救援thinker
        let hAbility = unit.FindAbilityByName("public_attribute");
        CreateModifierThinker(
            unit,
            hAbility,
            "modifier_public_revive_thinker",
            {
                duration: d_time
            },
            unit.GetAbsOrigin(),
            unit.GetTeamNumber(),
            false
        )
        this.GetPlayerDieData(-1, {})

        // if(this.player_life_list[player_id] > 0){
        //     //测试模式下死亡会增加生命
        //     // if(IsInToolsMode()){
        //     //     this.player_life_list[player_id] += 2;
        //     // }
        //     GameRules.CMsg.SendCommonMsgToPlayer(
        //         player_id,
        //         "你还剩【" + (this.player_life_list[player_id] - 1) + "】条生命,3秒后复活",
        //         {}
        //     );
        // Timers.CreateTimer(3, () => {
        //     //减少玩家生命
        //     GameRules.GameInformation.AddPlayerLife(player_id , -1)
        //     unit.SetRespawnPosition(unit.GetAbsOrigin());
        //     unit.RespawnHero(false, false);
        //     unit.AddNewModifier(unit, null, "modifier_state_invincible", { duration: 3 });
        // });
        // }else{
        //     GameRules.CMsg.SendCommonMsgToPlayer(
        //         player_id,
        //         "你没有剩余生命。",
        //         {}
        //     );
        // }
    }

    /** 重置死亡次数 */
    ResetNumberofDeaths() {
        for (let i = 0; i < this.player_die_count.length; i++) {
            this.player_die_count[i] = 0
        }
    }

    // modifier_public_revive_thinker
    PlayerRevive(player_id: PlayerID) {
        let unit = PlayerResource.GetSelectedHeroEntity(player_id);
        let vLocation : Vector = null;
        if(GameRules.MapChapter._game_select_phase == 999){
            vLocation = Vector(GameRules.MapChapter.ChapterData.map_centre_x, GameRules.MapChapter.ChapterData.map_centre_y, 0);
        }else{
            vLocation = unit.GetAbsOrigin();
            unit.SetRespawnPosition(vLocation)
            unit.RespawnHero(false, false);
            unit.AddNewModifier(unit, null, "modifier_state_invincible", { duration: 3 });
        }
        this.player_die_time[player_id] = 0;
        this.GetPlayerDieData(-1, {})
        
    }
    /**
    * 获取玩家死亡倒计时
    */
    GetPlayerDieData(player_id: PlayerID, params: CGED["GameInformation"]["GetPlayerDieData"]) {
        if (player_id == -1) {
            CustomGameEventManager.Send_ServerToAllClients(
                "GameInformation_GetPlayerDieData",
                {
                    data: {
                        time: this.player_die_time
                    }
                }
            );
        } else {
            CustomGameEventManager.Send_ServerToPlayer(
                PlayerResource.GetPlayer(player_id),
                "GameInformation_GetPlayerDieData",
                {
                    data: {
                        time: this.player_die_time
                    }
                }
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
                    "player_life": this.player_life_list[player_id]
                }
            }
        );
    }
    /**
     *  头部信息
     */
    play_game_time: number = 0;

    SetPlayGameTime(time: number) {
        GameRules.GameInformation.play_game_time = time;
        GameRules.GameInformation.GetPlayGameHeadData(-1, {})
    }

    /**
    * 获取局内头部信息
    */
    GetPlayGameHeadData(player_id: PlayerID, params: CGED["GameInformation"]["GetPlayGameHeadData"]) {
        if (player_id == -1) {
            CustomGameEventManager.Send_ServerToAllClients(
                "GameInformation_GetPlayGameHeadData",
                {
                    data: {
                        time: GameRules.GameInformation.play_game_time,
                        difficulty: GameRules.MapChapter.GameDifficulty,
                        round_index : GameRules.Spawn._round_index,
                        round_max : GameRules.Spawn._round_max,
                    }
                }
            );
        } else {
            CustomGameEventManager.Send_ServerToAllClients(
                "GameInformation_GetPlayGameHeadData",
                {
                    data: {
                        time: GameRules.GameInformation.play_game_time,
                        difficulty: GameRules.MapChapter.GameDifficulty,
                        round_index : GameRules.Spawn._round_index,
                        round_max : GameRules.Spawn._round_max,
                    }
                }
            );
        }
    }
}   