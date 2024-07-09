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
    player_talent_list : CGEDPlayerTalentSkill[] = [];
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
            print("npc_dota_hero_drow_ranger:......")
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
        for (let index = 1; index <= Object.keys(this.player_talent_config.unlock_count).length; index++) {
            //是否初始化
            // this.player_talent_list[player_id][index] = {};
                if(index == 1){
                    this.player_talent_list[player_id][index] = {
                        uc : 1, //当技能投入点数
                        iu: 1, //当技能是否解锁 0 未解锁 1已解锁
                        t : {} , //层信息
                        pu : 0 , //当前技能是否解锁被动 0 未解锁 1已解锁
                        tm : 0 , //最大层数
                    }
                }else{
                    this.player_talent_list[player_id][index] = {
                        uc : 0, //当前层投入点数
                        iu: 0, //当前层是否解锁 0 未解锁 1已解锁
                        t : {} , //层信息
                        pu : 0 , //当前技能是否解锁被动 0 未解锁 1已解锁
                        tm : 0 , //最大层数
                    }
                }
        }
        let h_max_tf : { [key : string ] : number } = {};
        //处理解锁条件
        let unlock_key = HeroTalentCounfg["1"].unlock_key;
        
        for (const key in HeroTalentCounfg) {
            let skill_index = HeroTalentCounfg[key].index;
            let max_number = HeroTalentCounfg[key].max_number;
            let tier_number = HeroTalentCounfg[key].tier_number;
            if(!this.player_talent_list[player_id][skill_index].t.hasOwnProperty(tier_number)){
                this.player_talent_list[player_id][skill_index].t[tier_number] = {
                    sk : "",
                    si : {},
                }
            }
            if(key == "1"){ //第一个技能默认点了
                h_max_tf["1"] = 1;
                this.player_talent_list[player_id][skill_index].t[tier_number].si[key] = {
                    iu: 1, //当前技能是否解锁 0 未解锁 1已解锁
                    ml : max_number , //最高等级
                    uc : 1 , //当前技能投入点数
                }
            }else if(unlock_key.includes(parseInt(key))){ //默认可以解锁
                this.player_talent_list[player_id][skill_index].t[tier_number].si[key] = {
                    iu: 1, //当前技能是否解锁 0 未解锁 1已解锁
                    ml : max_number , //最高等级
                    uc : 0 , //当前技能投入点数
                }
            }else{
                this.player_talent_list[player_id][skill_index].t[tier_number].si[key] = {
                    iu: 0, //当前技能是否解锁 0 未解锁 1已解锁
                    ml : max_number , //最高等级
                    uc : 0 , //当前技能投入点数
                }
            }
            //重设最大层数

            if(this.player_talent_list[player_id][skill_index].tm < tier_number && tier_number != 99){
                this.player_talent_list[player_id][skill_index].tm = tier_number;
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
     * 增加/减少 天赋点
     */
    AddHeroTalent(player_id: PlayerID , count : number = 1) {
        this.player_talent_data[player_id].points += count;
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
        
        if(this.player_talent_list[player_id][skill_index].iu == 1){
            if(this.player_talent_list[player_id][skill_index].t[tier_number].si[key]){
                if(this.player_talent_list[player_id][skill_index].t[tier_number].si[key].uc 
                    >= this.player_talent_list[player_id][skill_index].t[tier_number].si[key].ml
                ){
                    GameRules.CMsg.SendErrorMsgToPlayer(player_id, "当前技能已满级");
                }else if(this.player_talent_list[player_id][skill_index].t[tier_number].si[key].iu == 0){
                    GameRules.CMsg.SendErrorMsgToPlayer(player_id, "当前技能未解锁");
                }else{
                    if(tier_number != 99){
                        if(this.player_talent_list[player_id][skill_index].t[tier_number].sk != ""){
                            if(this.player_talent_list[player_id][skill_index].t[tier_number].sk != key){
                                GameRules.CMsg.SendErrorMsgToPlayer(player_id, "不能选取同层其他技能");
                                this.GetHeroTalentListData(player_id, {});
                                return 
                            }
                        }
                    }
                    let unlock_key = HeroTalentCounfg.unlock_key;
                    for (let index = 0; index < unlock_key.length; index++) {
                        const element = tostring(unlock_key[index]);
                        if(element == "0"){
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
                        let tu = HeroTalent.tier_number;
                        this.player_talent_list[player_id][si].t[tu].si[element].iu = 1;
                    }
                    //处理技能
                    this.player_talent_list[player_id][skill_index].t[tier_number].si[key].uc ++;
                    //减少技能点
                    this.player_talent_data[player_id].points --;
                    //增加使用记录
                    this.player_talent_data[player_id].use_count ++;

                    if(tier_number != 99 && this.player_talent_list[player_id][skill_index].t[tier_number].sk == ""){
                        this.player_talent_list[player_id][skill_index].t[tier_number].sk = key;
                    }
                    //根据总投入点 解锁层
                    if(Object.values(this.player_talent_config.unlock_count).includes(this.player_talent_data[player_id].use_count)){
                        let s_u_index = Object.values(this.player_talent_config.unlock_count).indexOf((this.player_talent_data[player_id].use_count)) + 1;
                        this.player_talent_list[player_id][s_u_index].iu = 1;
                        for (const key in this.player_talent_list[player_id][s_u_index].t[1].si) {
                            this.player_talent_list[player_id][s_u_index].t[1].si[key].iu = 1;
                        }
                    }
                    //检查此层是否可以开启 被动
                    if(this.player_talent_list[player_id][skill_index].pu == 0){
                        for (let index = 1 ; index <= this.player_talent_list[player_id][skill_index].tm ; index++) {
                            let sk = this.player_talent_list[player_id][skill_index].t[index].sk;
                            if(sk == ""){
                                break;
                            }
                            let HeroTalentT :  typeof DrowRanger["1"];
                            if(unitname == "npc_dota_hero_drow_ranger"){
                                HeroTalentT = DrowRanger[sk];
                            }else{
                                GameRules.CMsg.SendErrorMsgToPlayer(player_id , "天赋配置错误！！！！")
                                this.GetHeroTalentListData(player_id, {});
                                return 
                            }
                            if(this.player_talent_list[player_id][skill_index].t[index].si[sk].uc 
                                < this.player_talent_list[player_id][skill_index].t[index].si[sk].ml
                            ){
                                break;
                            }
                            if(HeroTalentT.unlock_key[0] == 0){
                                this.player_talent_list[player_id][skill_index].pu = 1;
                                if(this.player_talent_list[player_id][skill_index].t.hasOwnProperty(99)){
                                    for (const skp in this.player_talent_list[player_id][skill_index].t[99].si) {
                                        let HeroTalentP :  typeof DrowRanger["1"];
                                        if(unitname == "npc_dota_hero_drow_ranger"){
                                            HeroTalentP = DrowRanger[skp];
                                        }else{
                                            GameRules.CMsg.SendErrorMsgToPlayer(player_id , "天赋配置错误！！！！")
                                            this.GetHeroTalentListData(player_id, {});
                                            return 
                                        }
                                        //tudo 需要特定处理
                                        this.player_talent_list[player_id][skill_index].t[99].si[skp].iu = 1;
                                    }
                                }
                                break;
                            }
                        }
                    }

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
    Debug(cmd: string, args: string[], player_id: PlayerID) {

        if (cmd == "-atf") {    
            let number = tonumber(args[0]) ?? 1;
            this.AddHeroTalent(player_id , number)
        }
        if (cmd == "-stf") {
            let key = args[0] ?? "1";
            this.HeroSelectTalent(player_id ,  { key : key })
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