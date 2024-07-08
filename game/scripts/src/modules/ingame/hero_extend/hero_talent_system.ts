import { reloadable } from '../../../utils/tstl-utils';
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";
import * as TalentConfig from "../../../json/config/game/hero/talent_config/talent_config.json";
import * as DrowRanger from "../../../json/config/game/hero/talent_tree/drow_ranger.json";



@reloadable
export class HeroTalentSystem extends UIEventRegisterClass {
    /**
     * 英雄天赋点
     */
    player_talent_data : CGEDPlayerTalentSkillPoints[] = [];
    /** 
     * 英雄对应加点信息
     */
    player_talent_list : CGEDPlayerTalentList[] = [];
    /** 
     * 加载通用
     */
    player_talent_config : CGEDPlayerTalentConfig = {
        unlock_count : {} //解锁所需数量
    };
    /**
     * 玩家使用的英雄
     */
    player_hero_name : string[] = [];
    //玩家数量
    player_count = 6;

    /**
     * 记录玩家每层使用的数据
     */
    player_hero_tier_number : { [key : string] : string}[] = [];

    constructor() {
        super("HeroTalentSystem");
        for (const key in TalentConfig) {
            this.player_talent_config.unlock_count[parseInt(key)] = TalentConfig[key];
        }

        for (let index = 0; index < this.player_count; index++) {
            this.player_talent_data.push({
                use_count : 0,
                points : 0,
            });
            this.player_talent_list.push({
            })
            this.player_hero_name.push("");
            this.player_hero_tier_number.push({});

        }
    }
    
    /**
     * 注册英雄天赋
     * @param BaseNPC 
     */
    RegisterHeroTalent(BaseNPC: CDOTA_BaseNPC) {
        let unitname = BaseNPC.GetUnitName();
        let HeroTalentCounfg :  {
            [key: string]: {
                index: number;
                is_ability: number;
                link_ability: string;
                tier_number: number;
                unlock_key: number[];
                max_number: number;
            };
        };
        if(unitname == "npc_dota_hero_drow_ranger"){
            HeroTalentCounfg = DrowRanger ;
        }else{
            print("天赋配置错误！！！！")
            return 
        }
        let player_id = BaseNPC.GetPlayerOwnerID();
        this.player_hero_name[player_id] = unitname;
        this.player_talent_list[player_id] = {};
        this.player_talent_data[player_id] = {
            use_count : 1,
            points : 0,
        };
        this.player_hero_tier_number[player_id] = {};

        for (let index = 1; index <= Object.keys(this.player_talent_config.unlock_count).length; index++) {
            if(index == 1){
                this.player_talent_list[player_id][index] = {
                    use_count : 1, //当前层投入点数
                    is_unlock: 1, //当前层是否解锁 0 未解锁 1已解锁
                    skill_data :  {},
                    passive_unlock : 0 , //当前技能是否解锁被动 0 未解锁 1已解锁
                }
            }else{
                this.player_talent_list[player_id][index] = {
                    use_count : 0, //当前层投入点数
                    is_unlock: 0, //当前层是否解锁 0 未解锁 1已解锁
                    skill_data :  {},
                    passive_unlock : 0 , //当前技能是否解锁被动 0 未解锁 1已解锁
                }
            }
        }
        let h_max_tf : { [key : string ] : number } = {};
        //处理解锁条件
        let unlock_key = HeroTalentCounfg["1"].unlock_key;
        
        for (const key in HeroTalentCounfg) {
            let skill_index = HeroTalentCounfg[key].index;
            let max_number = HeroTalentCounfg[key].max_number;

            if(key == "1"){ //第一个技能默认点了
                h_max_tf["1"] = 1;
                this.player_talent_list[player_id][skill_index].skill_data[key] = {
                    is_unlock: 1, //当前技能是否解锁 0 未解锁 1已解锁
                    max_level : max_number , //最高等级
                    use_count : 1 , //当前技能投入点数
                    tier_index : "", //此层点的技能
                }
            }else if(unlock_key.includes(parseInt(key))){ //默认可以解锁
                this.player_talent_list[player_id][skill_index].skill_data[key] = {
                    is_unlock: 1, //当前技能是否解锁 0 未解锁 1已解锁
                    max_level : max_number , //最高等级
                    use_count : 0 , //当前技能投入点数
                    tier_index : "", //此层点的技能
                }
            }else{
                this.player_talent_list[player_id][skill_index].skill_data[key] = {
                    is_unlock: 0, //当前技能是否解锁 0 未解锁 1已解锁
                    max_level : max_number , //最高等级
                    use_count : 0 , //当前技能投入点数
                    tier_index : "", //此层点的技能
                }
            }
        }
        
        BaseNPC.hero_talent = h_max_tf;
        //发送玩家天赋信息
        this.GetHeroTalentListData(player_id, {});
    }
    /**
     * 获取天赋选择列表
     */
    GetHeroTalentListData(player_id: PlayerID, params: CGED["HeroTalentSystem"]["GetHeroTalentListData"], callback?) {
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "HeroTalentSystem_GetHeroTalentListData",
            {
                data: {
                    hero_talent_list: this.player_talent_list[player_id],
                    talent_points: this.player_talent_data[player_id].points,
                    talent_use_count: this.player_talent_data[player_id].use_count,
                }
            }
        );
    }
    /**
     * 
     * @param player_id 
     * @param params 
     * @param callback 
     */
    /**
     * 增加天赋点
     */
    AddHeroTalent(player_id: PlayerID) {
        this.player_talent_data[player_id].points++;
        this.GetHeroTalentListData(player_id, {});
    }
    /**
     * 点天赋
     */
    HeroSelectTalent(player_id: PlayerID, params: CGED["HeroTalentSystem"]["HeroSelectTalent"]) {
        let key = params.key;
        let unitname = this.player_hero_name[player_id];
        let HeroTalentCounfg :  typeof DrowRanger["1"] ;
        if(this.player_talent_data[player_id].points <= 0){
            GameRules.CMsg.SendErrorMsgToPlayer(player_id , "技能点不足！！")
                this.GetHeroTalentListData(player_id, {});
                return 
        }       
        if(unitname == "npc_dota_hero_drow_ranger"){
            HeroTalentCounfg = DrowRanger[key]; 
            if(!DrowRanger.hasOwnProperty(key)){
                GameRules.CMsg.SendErrorMsgToPlayer(player_id , "没有此技能！！")
                this.GetHeroTalentListData(player_id, {});
                return 
            }
        }else{
            GameRules.CMsg.SendErrorMsgToPlayer(player_id , "天赋配置错误！！！！")
            this.GetHeroTalentListData(player_id, {});
            return 
        }

        let skill_index =  HeroTalentCounfg.index;
        let tier_number =  HeroTalentCounfg.tier_number;
        
        if(this.player_talent_list[player_id][skill_index].is_unlock == 1){
            if(this.player_talent_list[player_id][skill_index].skill_data[key]){
                if(this.player_talent_list[player_id][skill_index].skill_data[key].use_count >= this.player_talent_list[player_id][skill_index].skill_data[key].max_level){
                    GameRules.CMsg.SendErrorMsgToPlayer(player_id, "当前技能已满级");
                }else if(this.player_talent_list[player_id][skill_index].skill_data[key].is_unlock == 0){
                    GameRules.CMsg.SendErrorMsgToPlayer(player_id, "当前技能未解锁");
                }else{
                    if(tier_number != 99){
                        if(this.player_hero_tier_number[player_id].hasOwnProperty(skill_index + "-" + tier_number)){
                            if(this.player_hero_tier_number[player_id][skill_index + "-" + tier_number] != key){
                                GameRules.CMsg.SendErrorMsgToPlayer(player_id, "不能选取同层其他技能");
                            }
                        }
                    }
                    let unlock_key = HeroTalentCounfg.unlock_key;
                    for (let index = 0; index < unlock_key.length; index++) {
                        const element = unlock_key[index];
                        if(element == 0){
                            continue;
                        }
                        let HeroTalent :  typeof DrowRanger["1"];

                        if(unitname == "npc_dota_hero_drow_ranger"){
                            HeroTalent = DrowRanger[element];
                        }else{
                            GameRules.CMsg.SendErrorMsgToPlayer(player_id , "天赋配置错误！！！！")
                            this.GetHeroTalentListData(player_id, {});
                            return 
                        }
                        let si = HeroTalent.index;
                        this.player_talent_list[player_id][si].skill_data[element].is_unlock = 1;
                    }
                    //处理技能
                    this.player_talent_list[player_id][skill_index].skill_data[key].use_count ++;
                    this.player_talent_list[player_id][skill_index].skill_data[key].tier_index = key;
                    this.player_hero_tier_number[player_id][skill_index + "-" + tier_number] = key
                    

                    //加载技能效果


                }
            }else{
                GameRules.CMsg.SendErrorMsgToPlayer(player_id, "未找到此技能");    
            }
        }else{
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "当前技能未解锁");
        }
            
        this.GetHeroTalentListData(player_id, {});
    }

    /**
     * debug 命令
     */
    DebugChat(player_id: PlayerID, command: string[], hHero: CDOTA_BaseNPC) {
        if (command[0] == "-tfxz") { //天赋选择
            let indexstr = command[1] ?? "1";
            GameRules.HeroTalentSystem.HeroSelectTalent(player_id, { key: indexstr });
        } else if (command[0] == "-tf") { //目标天赋满级 不会增加属性 直接设置
            //从下标开始
            // let indexstr = command[1] ?? "1";
            // let player_hero = PlayerResource.GetSelectedHeroEntity(player_id);
            // this.player_talent_list[player_id][indexstr].now_level = this.player_talent_list[player_id][indexstr].max_level;
            // player_hero.hero_talent[this.player_talent_list[player_id][indexstr].fission_id] = 1;
            // CustomNetTables.SetTableValue("hero_talent_fission", player_hero.GetEntityIndex().toString(), player_hero.hero_talent);
            // this.GetHeroTalentListData(player_id, {});
        } else if (command[0] == "-tfall") { //天赋全开 不会增加属性 直接设置
            // let player_hero = PlayerResource.GetSelectedHeroEntity(player_id);
            // for (let index = 1; index <= 16; index++) {
            //     this.player_talent_list[player_id][index.toString()].now_level = this.player_talent_list[player_id][index.toString()].max_level;
            //     player_hero.hero_talent[this.player_talent_list[player_id][index.toString()].fission_id] = 1;
            // }
            // CustomNetTables.SetTableValue("hero_talent_fission", player_hero.GetEntityIndex().toString(), player_hero.hero_talent);
            // this.GetHeroTalentListData(player_id, {});
        }

    }

    // OnKillUnit(killer: CDOTA_BaseNPC, target: CDOTA_BaseNPC) {
    //     // 小松鼠大招标记
    //     if (target.HasModifier("modifier_hoodwink_ultimate_marker_debuff")) {
    //         let hBuff = target.FindModifierByName("modifier_hoodwink_ultimate_marker_debuff");
    //         let hCaster = hBuff.GetCaster();
    //         let nGold = 1 + math.floor(hCaster.attribute_count["TotalInvestLevel"] / 10);
    //         LaunchGoldBag(nGold, target.GetAbsOrigin(), null, 30, false);
    //     }
    // }
}