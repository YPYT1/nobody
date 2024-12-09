import { reloadable } from '../../../utils/tstl-utils';
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";
import * as TalentConfig from "../../../json/config/game/hero/talent_config/talent_config.json";
import { BaseHeroAbility } from '../../../abilities/hero/base_hero_ability';
import { HeroTalentObject } from '../../../kv_data/hero_talent_object';
import { modifier_talent_effect } from '../../../modifier/talent_effect/modifier_talent_effect';

// 引用 HeroTalentObject
const TalentTreeObject = HeroTalentObject

@reloadable
export class HeroTalentSystem extends UIEventRegisterClass {
    /**
     * 英雄天赋点
     */
    player_talent_data: CGEDPlayerTalentSkillPoints[] = [];
    /**
     * 客服端传入数据
     */
    player_talent_data_client: CGEDPlayerTalentSkillClientList[] = [];
    /** 
     * 英雄对应加点信息
     */
    player_talent_list: CGEDPlayerTalentSkill[] = [];   
    /** 
     * 加载通用
     */
    player_talent_config: CGEDPlayerTalentConfig = {
        unlock_count: {}, //解锁所需投入数量
        unlock_level: {} //解锁所需英雄等级
    };
    /**
     * 玩家使用的英雄
     */
    player_hero_name: string[] = [];
    /**
     * 玩家使用的英雄id
     */
    player_hero_id: number[] = [];
    //玩家数量
    player_count = 6;

    //玩家动态技能随机库
    player_talent_dt_jn : string[][] = [];
    //获取可选技能列表
    get_select_talent_data : CGEDPlayerSelectTalentData[] = [];

    //玩家最大可选栏位
    player_field_count : number[] = [ 3 , 3 , 3 , 3]

    talent_tree_values: {
        [key: string]: {
            [ability_key: string]: number[];
        }
    } = {};
    //技能位置
    player_talent_index_max : { [index : number] : {
        max : number,
        abikey : string,
        tier : number,
    }}[] = [];
    
    constructor() {
        super("HeroTalentSystem" , true);
        for (const key in TalentConfig) {
            this.player_talent_config.unlock_count[parseInt(key)] = TalentConfig[key as keyof typeof TalentConfig].count;
            this.player_talent_config.unlock_level[parseInt(key)] = TalentConfig[key as keyof typeof TalentConfig].level;
        }
        for (let index = 0; index < this.player_count; index++) {
            this.player_talent_data.push({
                use_count: 0,
                points: 0,
            });
            this.player_talent_data_client.push({

            }); 
            this.player_talent_list.push({

            });
            this.player_hero_name.push("");
            this.player_hero_id.push(6);
            this.player_talent_index_max.push({});  
            this.player_hero_star.push(0);
            this.player_talent_dt_jn.push([]);
            this.get_select_talent_data.push({
                is_show : 0, 
                data : []
            });
        }
        for (const key in TalentTreeObject) {
            let hero_talent = TalentTreeObject[key as keyof typeof TalentTreeObject];
            this.talent_tree_values[key] = {};  
            //技能数组
            for (const A_key in hero_talent.AbilityValues) {
                let str = tostring(hero_talent.AbilityValues[A_key]);
                let strlist = str.split(" ");
                let numlist: number[] = [];
                for (let value of strlist) {
                    numlist.push(tonumber(value));
                }
                this.talent_tree_values[key][A_key] = numlist;
            }
        }
    }
    //英雄星级 临时存储
    player_hero_star : number[] = [];

    /**
     * 注册英雄天赋 - 可使用重置功能 会返还技能点
     * @param BaseNPC //使用的英雄
     * @param IsReset //是否为重置
     */
    RegisterHeroTalent(BaseNPC: CDOTA_BaseNPC , IsReset : boolean = false ) {
        //游戏中初始化技能
        if(IsReset){
            GameRules.CustomAttribute.InitAbility(BaseNPC);
        }
        let unitname = BaseNPC.GetUnitName();
        //获取注册英雄星级
        let player_id = BaseNPC.GetPlayerOwnerID(); 
        //默认设置
        this.player_hero_star[player_id] = 1;
        let hero_id = -1;
        if(BaseNPC.IsHero()){
            hero_id = BaseNPC.GetHeroID();
        }
        this.player_talent_dt_jn[player_id] = [];
        this.get_select_talent_data[player_id] = {
            is_show : 0, 
            data : []
        };
        //初始化星级
        if(GameRules.ServiceInterface.player_hero_star[player_id][hero_id]){
            this.player_hero_star[player_id] = GameRules.ServiceInterface.player_hero_star[player_id][hero_id];
        }
        this.player_hero_name[player_id] = unitname;
        this.player_hero_id[player_id] = hero_id;
        this.player_talent_list[player_id] = {};
        this.player_talent_data_client[player_id] = {};
        
        for (let index = 0; index < Object.keys(this.player_talent_config.unlock_count).length; index++) {
            // 是否初始化
            // this.player_talent_list[player_id][index] = {};
            if (index == 0) {
                this.player_talent_list[player_id][index] = {
                    uc: 1, //当技能投入点数
                    iu: 1, //当技能是否解锁 0 未解锁 1已解锁
                    t: {}, //层信息
                    pu: 0, //当前技能是否解锁被动 0 未解锁 1已解锁
                    tm: 0, //最大层数
                }
                this.player_talent_index_max[player_id][index] = {
                    max : 1 ,
                    abikey : "1",
                    tier : 1,
                }
            } else {
                this.player_talent_list[player_id][index] = {
                    uc: 0, //当前层投入点数
                    iu: 0, //当前层是否解锁 0 未解锁 1已解锁
                    t: {}, //层信息
                    pu: 0, //当前技能是否解锁被动 0 未解锁 1已解锁
                    tm: 0, //最大层数
                }
                this.player_talent_index_max[player_id][index] = {
                    max : 0 ,
                    abikey : "",
                    tier : 0,
                }
            }
        }
        let h_max_tf: { [key: string]: number } = {};
        //处理解锁条件
        let unlock_key = HeroTalentObject["1"].unlock_key;
        for (const key in HeroTalentObject) {
            let data = HeroTalentObject[key as keyof typeof HeroTalentObject];
            if(data.hero_id != hero_id){
                continue;
            }
            let skill_index = data.index;
            let tier_number = data.tier_number;
            if (skill_index == 0 && tier_number == 1) { //第一个技能默认点了
                unlock_key = HeroTalentObject[key].unlock_key;
                break
            }
        }
        for (const key in HeroTalentObject) {
            let data = HeroTalentObject[key as keyof typeof HeroTalentObject];
            if(data.hero_id != hero_id){
                continue;
            }
            let skill_index = data.index;
            let max_number = data.max_number;
            let tier_number = data.tier_number;
            if (!this.player_talent_list[player_id][skill_index].t.hasOwnProperty(tier_number)) {
                this.player_talent_list[player_id][skill_index].t[tier_number] = {
                    sk: "",
                    si: {},
                }
            }
            if (skill_index == 0 && tier_number == 1) { //第一个技能默认点了
                h_max_tf[key] = 1;
                this.player_talent_list[player_id][skill_index].t[tier_number].si[key] = {
                    iu: 1, //当前技能是否解锁 0 未解锁 1已解锁
                    ml: max_number, //最高等级
                    uc: 1, //当前技能投入点数
                }
                this.player_talent_data_client[player_id][key] = {
                    uc: 1,
                }
            } else if (unlock_key.includes(parseInt(key))) { //默认可以解锁
                this.player_talent_list[player_id][skill_index].t[tier_number].si[key] = {
                    iu: 1, //当前技能是否解锁 0 未解锁 1已解锁
                    ml: max_number, //最高等级
                    uc: 0, //当前技能投入点数
                }
                this.player_talent_data_client[player_id][key] = {
                    uc: 0,
                }
            } else {
                this.player_talent_list[player_id][skill_index].t[tier_number].si[key] = {
                    iu: 0, //当前技能是否解锁 0 未解锁 1已解锁
                    ml: max_number, //最高等级
                    uc: 0, //当前技能投入点数
                }
            }
            //重设最大层数
            if (this.player_talent_list[player_id][skill_index].tm < tier_number && tier_number != 99) {
                this.player_talent_list[player_id][skill_index].tm = tier_number;
            }
            if(data.index == 0 && data.tier_number == 1){
                //增加技能
                if(data.is_ability == 1){
                    let ablname = data.link_ability;
                    let ablindex = data.index;
                    if(BaseNPC.IsHero()){
                        GameRules.HeroTalentSystem.ReplaceAbility(ablname , ablindex , BaseNPC , 1);
                    }
                }
            }
        }

        //设置英雄个人池 // hero_id
        for (const key in HeroTalentObject) {
            let data = HeroTalentObject[key as keyof typeof HeroTalentObject];
            if(data.hero_id != hero_id){
                continue;
            }
            let skill_index = data.index;
            let tier_number = data.tier_number;
            if (skill_index == 0 && tier_number == 1){ //第一个技能默认点了 不写入 但是要解锁池
                for (const element of data.unlock_key) {
                    if(element != 0){
                        this.player_talent_dt_jn[player_id].push(tostring(element));
                    }
                }
            }else if(tier_number == 1){
                this.player_talent_dt_jn[player_id].push(tostring(key));
            }
        }
        if(IsReset){
            let points = this.player_talent_data[player_id].points + this.player_talent_data[player_id].use_count - 1;
            this.player_talent_data[player_id] = {
                use_count: 1,
                points: points,
            };
            //返还技能点
            // if(GameRules.MapChapter.GameDifficultyNumber >= 104){
            //     for (let index = 1; index < points; index++) {
            //         this.TalentUnlockLevel(player_id , index)
            //     }
            // }
        }else{
            this.player_talent_data[player_id] = {
                use_count: 1,
                points: 0,
            };
        }

        //更新数据
        GameRules.CustomAttribute.UpdataPlayerSpecialValue(player_id)
        

        BaseNPC.hero_talent = h_max_tf;
        
        //数据写入到网表
        CustomNetTables.SetTableValue("hero_talent", `${player_id}`, this.player_talent_data_client[player_id]);

        this.ResetHeroTalent(player_id , {});
        this.GetSelectTalentData(player_id , {});
    }
    /**
     * 随机天赋信息
     * @param player_id 
     * @param params 
     * @param callback 
     */
    SelectTalentData(player_id: PlayerID){
        let shop_wp_list: string[] = [];
        let Cdata : CGEDPlayerSelectTalentOne[] = [];
        let for_max = this.player_field_count[player_id];
        if(this.get_select_talent_data[player_id].is_show == 0){
            //循环计数器
            let amount_count = 0;
            let amount_max = 50;
            for (let index = 0; index < for_max; index++) {
                amount_count++;
                if (amount_count > amount_max) {
                    break;
                }
                let i_length = this.player_talent_dt_jn[player_id].length;
                if(i_length < 1){
                    break;
                }
                let index_length = RandomInt(0 , i_length - 1);
                let _name = this.player_talent_dt_jn[player_id][index_length];
                
                if (shop_wp_list.includes(_name)) {
                    //跳过本次 
                    index--;
                    continue;
                }
                if (_name && _name != "") {
                    
                } else {
                    index--;
                    continue;
                }
                //保存
                shop_wp_list.push(_name);
                let lv = 1;
                let hero_talent_object = HeroTalentObject[_name as keyof typeof HeroTalentObject];
                let skill_index = hero_talent_object.index;
                let tier_number = hero_talent_object.tier_number;
                if(this.player_talent_list[player_id][skill_index].t[tier_number].si[_name].uc > 0){
                    lv = lv + this.player_talent_list[player_id][skill_index].t[tier_number].si[_name].uc;
                }
                Cdata.push({
                    "key" :  _name,
                    "lv" : lv,
                    "r" : 1,
                    "type" : 1 , // 1技能 2其他
                })
            }
            let t2_lv = 1;
            let t2_r = 5;
            let r_int = RandomInt(1 , 1000);
            if(r_int > 995){ //3%=4级，1.5%=5级，0.5%=6级=红色边框
                t2_lv = 6;
                t2_r = 6;
            }else if(r_int > 980){ //3%=4级，1.5%=5级，0.5%=6级=红色边框
                t2_lv = 5;
                t2_r = 6;
            }else if(r_int > 950){ //3%=4级，1.5%=5级，0.5%=6级=红色边框
                t2_lv = 4;
                t2_r = 6;
            }else if(r_int > 900){ // 70%=1级，20%=2级，5%=3级=金色边框
                t2_lv = 3;
            }else if(r_int > 700){ //70%=1级，20%=2级，5%=3级=金色边框
                t2_lv = 2;
            }
            //获取当前等级
            let invest_level = GameRules.InvestSystem.PlayerInvestLevelList[player_id] 
                             + GameRules.InvestSystem.PlayerExtraInvestLevelList[player_id] ;
            let dq = GameRules.InvestSystem.EqK(player_id , invest_level);
            let uph = GameRules.InvestSystem.EqK(player_id , (invest_level + t2_lv));

            Cdata.push({
                "key" :  "-1",
                "lv" : t2_lv,
                "r" : t2_r,
                "type" : 2 , // 1技能 2其他
                "dq" : dq,
                "uph" : uph,
            });
            this.get_select_talent_data[player_id].is_show = 1;
            this.get_select_talent_data[player_id].data = Cdata;
        }
        //发送数据
        this.GetSelectTalentData(player_id , {})
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
                    hero_talent_list: this.player_talent_data_client[player_id],
                    talent_points: this.player_talent_data[player_id].points,
                    talent_use_count: this.player_talent_data[player_id].use_count,
                }
            }
        );
    }

     /**
     * 获取天赋选择列表
     */
     GetSelectTalentData(player_id: PlayerID, params: CGED["HeroTalentSystem"]["GetSelectTalentData"], callback?) {
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "HeroTalentSystem_GetSelectTalentData",
            {
                data: {
                    select : this.get_select_talent_data[player_id],
                    talent_points: this.player_talent_data[player_id].points,
                    talent_use_count: this.player_talent_data[player_id].use_count,
                }
            }
        );
    }
    /**
     * 重新获取选择英雄的天赋
     */
    ResetHeroTalent(player_id: PlayerID, params: CGED["HeroTalentSystem"]["ResetHeroTalent"], callback?) {
        let unitname = this.player_hero_name[player_id];
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "HeroTalentSystem_ResetHeroTalent",
            {
                data: {
                    hero_name: unitname,
                }
            }
        );
        //发送玩家天赋信息
        this.GetHeroTalentListData(player_id, {});
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
    AddHeroTalent(player_id: PlayerID, count: number = 1) {
        this.player_talent_data[player_id].points += count;
        if(count > 0){
            //监听技能技能变化
            this.SelectTalentData(player_id);
            this.GetHeroTalentListData(player_id, {});
        }
        this.PointsChange(player_id);
    }
    /**
     * 点天赋->通过index
     */
    HeroSelectTalentOfIndex(player_id: PlayerID, params: CGED["HeroTalentSystem"]["HeroSelectTalentOfIndex"]) {
        let index = params.index;
        if (this.player_talent_data[player_id].points <= 0) {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "技能点不足！！");
            this.GetHeroTalentListData(player_id, {});
            return
        }else{
            if(this.get_select_talent_data[player_id].is_show == 1){
                if(this.get_select_talent_data[player_id].data[index].type == 1){
                    this.HeroSelectTalent(player_id, { key : 
                        this.get_select_talent_data[player_id].data[index].key,
                    });
                }else if(this.get_select_talent_data[player_id].data[index].type == 2){
                    let level = this.get_select_talent_data[player_id].data[index].lv;
                    print("level :" , level)
                    //处理投资系统 增加等级
                    GameRules.InvestSystem.PostInvestUp(player_id, level);
                    this.get_select_talent_data[player_id].is_show = 0;
                    //减少技能点
                    this.AddHeroTalent(player_id , -1);
                    if(this.player_talent_data[player_id].points > 0){
                        this.SelectTalentData(player_id);
                    }else{
                        //发送数据
                        this.GetSelectTalentData(player_id , {})
                    }
                }else{
                    if(this.player_talent_data[player_id].points > 0){
                        this.SelectTalentData(player_id);
                    }else{
                        //发送数据
                        this.GetSelectTalentData(player_id , {})
                    }
                    //系统问题
                    GameRules.CMsg.SendErrorMsgToPlayer(player_id, "系统出错....");    
                }
            }else{
                if(this.player_talent_data[player_id].points > 0){
                    this.SelectTalentData(player_id)
                }else{
                    //发送数据
                    this.GetSelectTalentData(player_id , {})
                }
                //系统问题
                GameRules.CMsg.SendErrorMsgToPlayer(player_id, "系统出错....");
            }
        }
    }

    /**
     * 点天赋 内部调用 
     */
    HeroSelectTalent(player_id: PlayerID, params: CGED["HeroTalentSystem"]["HeroSelectTalent"]) {
        let key = params.key;
        let HeroTalentCounfg: typeof HeroTalentObject["1"];
        let hero = PlayerResource.GetSelectedHeroEntity(player_id);
        if (this.player_talent_data[player_id].points <= 0) {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "技能点不足！！")
            this.GetHeroTalentListData(player_id, {});
            return
        }
        HeroTalentCounfg = HeroTalentObject[key];
        if (!HeroTalentObject.hasOwnProperty(key)) {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "没有此技能！！")
            this.GetHeroTalentListData(player_id, {});
            return
        }
        let skill_index = HeroTalentCounfg.index;
        let tier_number = HeroTalentCounfg.tier_number;
        let is_ability = HeroTalentCounfg.is_ability;
        if (this.player_talent_list[player_id][skill_index].t[tier_number].si[key]) { 
            if (this.player_talent_list[player_id][skill_index].t[tier_number].si[key].uc
                >= this.player_talent_list[player_id][skill_index].t[tier_number].si[key].ml
            ) {
                GameRules.CMsg.SendErrorMsgToPlayer(player_id, "当前技能已满级");
            } else {
                //处理技能
                this.player_talent_list[player_id][skill_index].t[tier_number].si[key].uc++;
                //减少技能点
                this.AddHeroTalent(player_id , -1)
                //增加使用记录
                this.player_talent_data[player_id].use_count++;

                if (!this.player_talent_data_client[player_id].hasOwnProperty(key)) {
                    this.player_talent_data_client[player_id][key] = {
                        uc: 0,
                    }
                }
                this.player_talent_data_client[player_id][key].uc++;
                this.get_select_talent_data[player_id].is_show = 0;
                //添加到英雄天赋去
                hero.hero_talent[key] = this.player_talent_list[player_id][skill_index].t[tier_number].si[key].uc;
                // 添加mdf效果
                let AbilityValues  = HeroTalentCounfg.AbilityValues;
                if(Object.keys(AbilityValues).length > 0){
                    // let tire_level = hero.hero_talent[key]
                    let attr_count : CustomAttributeTableType = {};
                    // 这里需要获取到对应的KV值
                    let InputAbilityValues: AbilityValuesProps = {};
                    for(let k in AbilityValues){
                        let value = this.GetTalentKvOfUnit(hero,key as "1",k as 'base_value')
                        InputAbilityValues[k] = value
                    }
                    let talent_mdf = hero.FindModifierByName("modifier_talent_effect") as modifier_talent_effect;
                    if(talent_mdf){
                        talent_mdf.InputAbilityValues(key,InputAbilityValues)
                    } else {
                        print("no talent_mdf!!!")
                    }
                }
                //当前层主                    
                if (tier_number != 99 && this.player_talent_list[player_id][skill_index].t[tier_number].sk == "") {
                    this.player_talent_list[player_id][skill_index].t[tier_number].sk = key;
                }
                //处理池子数据
                //最先处理是 满级移除
                if(this.player_talent_list[player_id][skill_index].t[tier_number].si[key].uc
                    >= this.player_talent_list[player_id][skill_index].t[tier_number].si[key].ml){
                        if(this.player_talent_dt_jn[player_id].includes(key)){
                            let d_index = this.player_talent_dt_jn[player_id].indexOf(key);
                            //移除对应
                            this.player_talent_dt_jn[player_id].splice(d_index , 1);
                        }
                }
                //不是 99的继续移除同层
                if(tier_number != 99 && this.player_talent_list[player_id][skill_index].t[tier_number].si[key].uc == 1){
                    //优先处理 解锁问题
                    let unlock_key = HeroTalentCounfg.unlock_key;
                    for (const element of unlock_key) {
                        if(element != 0){
                            let element_str = tostring(element);
                            if(!this.player_talent_dt_jn[player_id].includes(element_str)){
                                this.player_talent_dt_jn[player_id].push(element_str);
                            }
                        }
                    }
                    //同层排除功能
                    if(this.player_talent_list[player_id][skill_index].t[tier_number]){
                        for (const t_key in this.player_talent_list[player_id][skill_index].t[tier_number].si) {
                            if(this.player_talent_list[player_id][skill_index].t[tier_number].sk != ""){
                                if(t_key != this.player_talent_list[player_id][skill_index].t[tier_number].sk){
                                    if(this.player_talent_dt_jn[player_id].includes(t_key)){
                                        let d_index = this.player_talent_dt_jn[player_id].indexOf(t_key);
                                        //移除对应
                                        this.player_talent_dt_jn[player_id].splice(d_index , 1);
                                    }
                                }
                            }
                            
                        }
                    }
                }
                //添加属性
                let ObjectValues  = HeroTalentCounfg.ObjectValues;
                if(Object.keys(ObjectValues).length > 0){
                    let tire_level = hero.hero_talent[key]
                    let attr_count : CustomAttributeTableType = {};
                    for (let Attr in ObjectValues) {
                        // let attr_values = this.GetKVAttr(rune_name, key, level_index);
                        if(!attr_count.hasOwnProperty(Attr)){
                            attr_count[Attr] = {};
                        }
                        for (const AttrType in ObjectValues[Attr]) {
                            if(typeof ObjectValues[Attr][AttrType] == "number"){
                                attr_count[Attr][AttrType] = ObjectValues[Attr][AttrType];
                            }else{
                                let Str = ObjectValues[Attr][AttrType] as string;
                                let Str_List = Str.split(" ");
                                let value = 0;
                                if(Str_List.length <= (tire_level)){ // 2  2
                                    value = tonumber(Str_List[Str_List.length - 1])
                                }else{
                                    value = tonumber(Str_List[tire_level - 1])
                                }
                                attr_count[Attr][AttrType] = value;
                            }
                        }
                    }
                    GameRules.CustomAttribute.SetAttributeInKey(hero,"talent_"+key,attr_count)
                }

                //检查此层是否可以开启 被动 
                if (this.player_talent_list[player_id][skill_index].pu == 0) {
                    for (let index = 1; index <= this.player_talent_list[player_id][skill_index].tm; index++) {
                        let sk = this.player_talent_list[player_id][skill_index].t[index].sk;
                        if (sk == "") {
                            break;
                        }
                        let HeroTalentT: typeof HeroTalentObject["1"];
                        HeroTalentT = HeroTalentObject[sk];
                        if (this.player_talent_list[player_id][skill_index].t[index].si[sk].uc
                            < this.player_talent_list[player_id][skill_index].t[index].si[sk].ml
                        ) {
                            break;
                        }
                        if (HeroTalentT.unlock_key[0] == 0) {
                            this.player_talent_list[player_id][skill_index].pu = 1;
                            if (this.player_talent_list[player_id][skill_index].t.hasOwnProperty(99)) {
                                let pass_list : string[] = [];
                                for (const skp in this.player_talent_list[player_id][skill_index].t[99].si) {
                                    let HeroTalentP: typeof HeroTalentObject["1"];
                                    HeroTalentP = HeroTalentObject[skp];
                                    let pass_key = HeroTalentP.unlock_key[0];
                                    if(pass_key != 0){
                                        pass_list.push(tostring(pass_key));
                                    }
                                }
                                for (const skp in this.player_talent_list[player_id][skill_index].t[99].si) {
                                    if(pass_list.includes(skp)){
                                        continue;
                                    }
                                    let HeroTalentP: typeof HeroTalentObject["1"];
                                    HeroTalentP = HeroTalentObject[skp];
                                    
                                    if(HeroTalentP.hero_star <= this.player_hero_star[player_id]){
                                        if(!this.player_talent_dt_jn[player_id].includes(skp)){
                                            this.player_talent_dt_jn[player_id].push(skp);
                                        }
                                    }
                                }
                            }
                            break;
                        }
                    }
                }
                //数据写入到网表
                CustomNetTables.SetTableValue("hero_talent", `${player_id}`, this.player_talent_data_client[player_id]);
                /**
                 * 替换技能 / 更新等级
                 */
                if(is_ability == 1){
                    if(HeroTalentCounfg.tier_number == 1 && hero.hero_talent[key] == 1){
                        //基础技能记录
                        this.player_talent_index_max[player_id][skill_index].abikey = key;
                        this.player_talent_index_max[player_id][skill_index].max = 1;
                        this.player_talent_index_max[player_id][skill_index].tier = HeroTalentCounfg.tier_number;
                        let ablname = HeroTalentCounfg.link_ability;
                        let ablindex = HeroTalentCounfg.index;
                        GameRules.HeroTalentSystem.ReplaceAbility(ablname , ablindex , hero , 1);
                    }else if(HeroTalentCounfg.tier_number == 1 && hero.hero_talent[key] > 1){
                        this.player_talent_index_max[player_id][skill_index].max = hero.hero_talent[key];
                        let ablindex = HeroTalentCounfg.index;
                        let ablobj = hero.GetAbilityByIndex(ablindex);
                        ablobj.SetLevel(hero.hero_talent[key])
                    }else{
                        if(this.player_talent_index_max[player_id][skill_index].tier < HeroTalentCounfg.tier_number){
                            this.player_talent_index_max[player_id][skill_index].tier = HeroTalentCounfg.tier_number;
                            let sklevel = this.player_talent_index_max[player_id][skill_index].max;
                            let ablname = HeroTalentCounfg.link_ability;
                            let ablindex = HeroTalentCounfg.index;
                            GameRules.HeroTalentSystem.ReplaceAbility(ablname , ablindex , hero , sklevel);
                        }
                    }
                }
                // 首次解锁天赋时
                let ablname = HeroTalentCounfg.link_ability;
                if(hero.hero_talent[key] == 1 && ablname != "null"){
                    let ablname = HeroTalentCounfg.link_ability;
                    let hHeroAbility = hero.FindAbilityByName(ablname) as BaseHeroAbility
                    let mark_element = HeroTalentCounfg.mark_element;
                    let mark_types = HeroTalentCounfg.mark_types as CustomHeroAbilityTypes;
                    if (mark_element > 0){
                        hHeroAbility.AddCustomAbilityElement(mark_element)
                    }
                    if (mark_types != "Null"){
                        hHeroAbility.SetCustomAbilityType(mark_types,true)
                    }
                    // print("mark_element",mark_element,"mark_types",mark_types)
                }
                // 更新点了天赋之后相关变动数值
                GameRules.CustomAttribute.UpdataPlayerSpecialValue(player_id)

                //记录天赋点击情况
                if(tier_number == 1){
                    GameRules.ServiceInterface.PostLuaLog(player_id , "技能位置#"+ skill_index +"学习基础技能:"+ key  + "(" 
                        + this.player_talent_list[player_id][skill_index].t[tier_number].si[key].uc+ "/" 
                        + HeroTalentCounfg.max_number + ")");
                }else{
                    GameRules.ServiceInterface.PostLuaLog(player_id , "技能位置#"+ skill_index +"学习分支技能:"+ key+ "(" 
                        + this.player_talent_list[player_id][skill_index].t[tier_number].si[key].uc+ "/" 
                        + HeroTalentCounfg.max_number + ")");
                }
                this.GetHeroTalentListData(player_id, {});
                
                //天赋点> 0
                if(this.player_talent_data[player_id].points > 0){
                    this.SelectTalentData(player_id)
                }else{
                    this.GetSelectTalentData(player_id , {})
                }
            }
        } else {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "未找到此技能");
        }
    }
    /**
     * 技能点变化方法
     */
    PointsChange(player_id : PlayerID ){
        let hero = PlayerResource.GetSelectedHeroEntity(player_id)
        //是否有 锁技
        if(hero.rune_level_index["rune_2"] && this.player_talent_data[player_id].points > 0){
            let value = GameRules.RuneSystem.GetKvOfUnit(hero , "rune_2" ,"value");
            let attr = value * this.player_talent_data[player_id].points;
            GameRules.CustomAttribute.SetAttributeInKey(hero,"talent_rune_2_bianhua",{
                "DamageBonusMul" : {
                    "Base" : attr,
                }
            })
        }
    }
    /**
     * 替换技能
     * @param player_id 
     * @param params    
     */
    ReplaceAbility(ability_name: string, order: number, queryUnit: CDOTA_BaseNPC_Hero , SetLevel : number) {
        const hUnit = queryUnit;
        let player_id = hUnit.GetPlayerOwnerID()
        let order_ability = hUnit.GetAbilityByIndex(order);
        if (order_ability) {
            // order_ability.RemoveSelf()
            hUnit.RemoveAbilityByHandle(order_ability)
        }
        let new_ability = hUnit.AddAbility(ability_name)
        new_ability.SetLevel(SetLevel);

        if (GameRules.MapChapter._game_select_phase == 999 && !IsInToolsMode()) {
            hUnit.GetAbilityByIndex(order).SetActivated(false);
        }

        if(!GameRules.MysticalShopSystem.player_skill_activated[player_id][order]){
            hUnit.GetAbilityByIndex(order).SetActivated(false);
        }
    }

    /**
     * 快速获取技能值 (如果大于技能等级则返回最高等级 如果小于最低等级则返回最低等级)
     * @param name 英雄名
     * @param key 键
     * @param level_index 等级下标
     */
    GetTKV<
        TIndex extends keyof typeof TalentTreeObject,
        T1 extends keyof typeof TalentTreeObject[TIndex]["AbilityValues"],
    >( value_key: TIndex, k2: T1, level_index: number = 0) {
        let k2_key = k2 as string;
        let length = this.talent_tree_values[value_key][k2_key].length;
        if (length > 0) {
            if (level_index < 0) {
                return this.talent_tree_values[value_key][k2_key][0];
            } else if ((level_index + 1) > length) {
                return this.talent_tree_values[value_key][k2_key][length - 1];
            } else {
                return this.talent_tree_values[value_key][k2_key][level_index];
            }
        } else {
            return this.talent_tree_values[value_key][k2_key][level_index];
        }
    }
    
    // GetTKV<
    //     TIndex extends keyof typeof TalentTreeObject[HeroName],
    //     T1 extends keyof typeof TalentTreeObject[HeroName][TIndex]["AbilityValues"],
    // >(hero: HeroName, value_key: TIndex, k2: T1, level_index: number = 0) {
    //     let k2_key = k2 as string;
    //     // let value = this.talent_tree_values[hero][value_key];
    //     let length = this.talent_tree_values[hero][value_key][k2_key].length;
    //     if (length > 0) {
    //         if (level_index < 0) {
    //             return this.talent_tree_values[hero][value_key][k2_key][0];
    //         } else if ((level_index + 1) > length) {
    //             return this.talent_tree_values[hero][value_key][k2_key][length - 1];
    //         } else {
    //             return this.talent_tree_values[hero][value_key][k2_key][level_index];
    //         }
    //     } else {
    //         return this.talent_tree_values[hero][value_key][k2_key][level_index];
    //     }
    // }

    /**
     * 天赋数据获取
     * @param hUnit 
     * @param hero 
     * @param key 
     * @param ability_key 
     * @param k2 
     * @returns 
     */
    GetTalentKvOfUnit<
        TIndex extends keyof typeof TalentTreeObject,
        T1 extends keyof typeof TalentTreeObject[TIndex]["AbilityValues"],
    >(hUnit: CDOTA_BaseNPC, index_key: TIndex, ability_key: T1) {
        if(IsServer()){
            let level_index = hUnit.hero_talent[index_key]
            if (level_index == null) {
                return 0
            } else {
                return this.GetTKV( index_key, ability_key, level_index - 1)
            }
        } else {
            let player_id = hUnit.GetPlayerOwnerID();
            let netdata = CustomNetTables.GetTableValue("hero_talent",`${player_id}`);
            if(netdata && netdata[index_key]){
                let level_index  = netdata[index_key].uc;
                if(level_index > 0){
                    return this.GetTKV( index_key, ability_key, level_index - 1)
                } else {
                    return 0
                }
            } else {
                return 0
            }
        }
    }


    /**
     * 天赋数据获取 最低都是1级
     * @param hUnit 
     * @param hero 
     * @param key 
     * @param ability_key 
     * @param k2 
     * @returns 
     */
    GetTalentKvOfUnit_V2<
        TIndex extends keyof typeof TalentTreeObject,
        T1 extends keyof typeof TalentTreeObject[TIndex]["AbilityValues"],
    >(hUnit: CDOTA_BaseNPC , index_key: TIndex, ability_key: T1) {
        let level_index = hUnit.hero_talent[index_key] ?? 0;
        return this.GetTKV(index_key, ability_key, level_index);
    }



    
    /**
     * debug 命令
     */
    Debug(cmd: string, args: string[], player_id: PlayerID) {
        let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        if (cmd == "-atf") {
            let number = tonumber(args[0]) ?? 1;
            this.AddHeroTalent(player_id, number)
        }
        if (cmd == "-stf") {
            let key = args[0] ?? "1";
            this.HeroSelectTalent(player_id, { key: key })
        }
        if (cmd == "-rtf") {
            let hero = PlayerResource.GetSelectedHeroEntity(player_id);
            this.RegisterHeroTalent(hero,true);
        }
        if(cmd == "-addjl"){
            // print("UpdataPlayerSpecialValue")

            let ablname = args[0] ?? "l_test_1";

            let ablindex = tonumber(args[1]) ?? 0;

            let hHero = PlayerResource.GetSelectedHeroEntity(player_id);

            let order_ability = hHero.GetAbilityByIndex(ablindex);
            if (order_ability) {
                // order_ability.RemoveSelf()
                hHero.RemoveAbilityByHandle(order_ability)
            }
            let new_ability = hHero.AddAbility(ablname)
            new_ability.SetLevel(1);

            for (let i = 0; i < 5; i++) {
                let hAbility = hHero.GetAbilityByIndex(i);
                if (hAbility) {
                    hAbility.OnUpgrade();
                }
                if (hAbility.IntrinsicMdf) {
                    let PassiveMdfName = hAbility.GetIntrinsicModifierName();
                    hAbility.IntrinsicMdf.ForceRefresh()
                }
            }
        }
        if(cmd == "!dtf"){
            this.HeroSelectTalentOfIndex(player_id , { "index" : 3 });
        }
        if(cmd == "!sx"){
            this.SelectTalentData(player_id);
        }
    }
}