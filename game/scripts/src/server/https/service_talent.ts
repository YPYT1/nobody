/**
 *  服务接口
 */
import { UIEventRegisterClass } from '../../modules/class_extends/ui_event_register_class';
import { reloadable } from '../../utils/tstl-utils';

import * as ServerTalentData from "../../json/config/server/hero/server_talent_data.json";
import * as NpcHeroesCustom from "../../json/npc_heroes_custom.json";

@reloadable
export class ServiceTalent extends UIEventRegisterClass{

    //玩家数量
    player_count = 6;
    //存档天赋保存的天赋(临时数据)
    player_talent_list: {
        [hero_id: number]: CGEDGetTalentListInfo;
    }[] = [];
    //存档天赋保存的天赋
    player_server_talent_list: {
        [hero_id: number]: CGEDGetTalentListInfo;
    }[] = [];

    constructor() {
        super("ServiceTalent")
        //初始化总等级
        for (let index = 0; index < this.player_count; index++) { 
            //根据英雄初始化
            this.player_talent_list.push({
                
            })
            //
            this.player_server_talent_list.push({
                
            })
            for (const key in NpcHeroesCustom) {
                let hero = NpcHeroesCustom[key as  keyof typeof NpcHeroesCustom];
                this.player_talent_list[index][hero.HeroID] = {
                    use_count : 0 , //总投入点 用于反算可以使用的点
                    count : 0 , //可用天赋点
                    talent : {}
                }

                this.player_server_talent_list[index][hero.HeroID] = {
                    use_count : 0 , //总投入点 用于反算可以使用的点
                    count : 0 , //可用天赋点
                    talent : {}
                }

                for( const Tkey in ServerTalentData){
                    let TalentData  = ServerTalentData[Tkey as keyof typeof ServerTalentData];
                    if(TalentData.hero_id == hero.HeroID){
                        if(TalentData.tier_number == 0 && TalentData.parent_node == 0){
                            this.player_talent_list[index][hero.HeroID].talent[Tkey] = {
                                uc : 0 ,
                                iu : 1 ,
                            }
                        }else{
                            this.player_talent_list[index][hero.HeroID].talent[Tkey] = {
                                uc : 0 ,
                                iu : 0 ,
                            }
                        }

                        if(TalentData.tier_number == 0 && TalentData.parent_node == 0){
                            this.player_server_talent_list[index][hero.HeroID].talent[Tkey] = {
                                uc : 0 ,
                                iu : 1 ,
                            }
                        }else{
                            this.player_server_talent_list[index][hero.HeroID].talent[Tkey] = {
                                uc : 0 ,
                                iu : 0 ,
                            }
                        }
                        
                    }
                    
                }
            }
        }
    }

     //获取玩家装备配置
     GetPlayerServerTalent(player_id: PlayerID, params: CGED["ServiceTalent"]["GetPlayerServerTalent"], callback?) {
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceTalent_GetPlayerServerTalent",
            {
                data: {
                    server: this.player_server_talent_list[player_id],
                    local: this.player_talent_list[player_id]
                }
            }
        );
    }
    /**
     * 点天赋
     * @param player_id 
     * @param params 
     * @param callback 
     */
    ClickTalent(player_id: PlayerID, params: CGED["ServiceTalent"]["ClickTalent"], callback?) {
        let hero_id = params.hero_id;
        let key = params.key;
        if (talent.iu != 1) {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "当前天赋未解锁...");
        } else {
            if (key) {
                GameRules.CMsg.SendErrorMsgToPlayer(player_id, "key 不存在....");
            } else if(!hero_id){
                GameRules.CMsg.SendErrorMsgToPlayer(player_id, "hero_id 不存在....");
            } else {
                if (!this.player_talent_list[player_id][hero_id].talent[key]) {
                    GameRules.CMsg.SendErrorMsgToPlayer(player_id, "未找到数据...");
                } else {
                    let talent = this.player_talent_list[player_id][hero_id].talent[key];
                    let e_d = ServerEquipInfo[equi_data.n as keyof typeof ServerEquipInfo];
                    this.player_equip_list[player_id].hero[params.hero_id][params.t - 1][e_d.type] = equi_data.id;
                }
            }
        }
        this.GetPlayerServerTalent(player_id, {});
    }
    //保存天赋
    SaveTalentConfig(player_id: PlayerID, params: CGED["ServiceTalent"]["SaveTalentConfig"], callback?) {
        GameRules.ArchiveService.EquipCfgModify(player_id, this.player_equip_config[player_id]);
    }
    //还原天赋
    RestoreTalentConfig(player_id: PlayerID, params: CGED["ServiceTalent"]["RestoreTalentConfig"], callback?) {
        if (!this.player_equip_config[player_id].hero[params.hero_id]) {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "还原配装:未找到角色...");
        } else {
            this.player_equip_config[player_id].hero[params.hero_id][params.t - 1] =
                CustomDeepCopy(this.server_player_equip_config[player_id].hero[params.hero_id][params.t - 1]) as string[];
        }
        this.GetEquipConfig(player_id, {});
    }

    // //获取玩家装备配置
    // GetEquipConfig(player_id: PlayerID, params: CGED["ServiceEquipment"]["GetEquipConfig"], callback?) {
    //     CustomGameEventManager.Send_ServerToPlayer(
    //         PlayerResource.GetPlayer(player_id),
    //         "ServiceEquipment_GetEquipConfig",
    //         {
    //             data: {
    //                 server: this.server_player_equip_config[player_id],
    //                 local: this.player_equip_config[player_id]
    //             }
    //         }
    //     );
    // }
    
    //存档天赋系统
    Debug(cmd: string, args: string[], player_id: PlayerID) {
       
    }
}