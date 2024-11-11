import * as AttributeConst from "../../../json/config/game/attribute_const.json";
import * as AttributeSub from "../../../json/config/game/attribute_sub.json";
import * as NpcHeroesCustom from "../../../json/npc_heroes_custom.json";

import { reloadable } from "../../../utils/tstl-utils";
import { drow_range_wearable } from "../../../kv_data/hero_wearable/drow_range";
import { skywrath_mage_wearable } from "../../../kv_data/hero_wearable/skywrath_mage";
import { modifier_rune_effect } from "../../../modifier/rune_effect/modifier_rune_effect";

/** 自定义属性系统 */
@reloadable
export class CustomAttribute {

    /** 更新间隔 */
    update_delay: number;
    hero_wearable: {
        [hero: string]: HeroWearable
    }

    particle_test: ParticleID[];

    constructor() {
        print("[CustomAttribute]:constructor")
        this.ModifierList = {};
        this.hero_wearable = {};
        this.update_delay = 0.25;
        this.hero_wearable["npc_dota_hero_drow_ranger"] = drow_range_wearable
        this.hero_wearable["npc_dota_hero_skywrath_mage"] = skywrath_mage_wearable

        ListenToGameEvent("dota_player_gained_level", event => this.OnEntityDotaPlayerGainedLevel(event), this);
    }

    Reload() {
        // this.particle_test = [];
        this.update_delay = 0.25;
        this.hero_wearable["npc_dota_hero_drow_ranger"] = drow_range_wearable
        this.hero_wearable["npc_dota_hero_skywrath_mage"] = skywrath_mage_wearable;
        GameRules.GetGameModeEntity().SetContextThink("particle_test", null, 0)
        // GameRules.GetGameModeEntity().SetContextThink("particle_test", () => {
        //     for (let particle of this.particle_test) {
        //         print("particle", particle)
        //         ParticleManager.DestroyParticle(particle,true)
        //     }
        //     return 1
        // }, 1)
    }


    /** 升级事件 */
    OnEntityDotaPlayerGainedLevel(event: GameEventProvidedProperties & DotaPlayerGainedLevelEvent) {
        // print("OnEntityDotaPlayerGainedLevel")
        const hHero = EntIndexToHScript(event.hero_entindex) as CDOTA_BaseNPC_Hero;
        //增加天赋点
        GameRules.HeroTalentSystem.AddHeroTalent(event.player_id, 1);
        //增加符文点
        if (event.level % 5 == 0) {
            GameRules.RuneSystem.GetRuneSelectToPlayer(event.player_id)
        }

        const rune_mdf = hHero.FindModifierByName("modifier_rune_effect") as modifier_rune_effect;
        if (rune_mdf) {
            rune_mdf.OnLevelUprade()
        }
        GameRules.HeroTalentSystem.TalentUnlockLevel(event.player_id, event.level);
        this.AttributeInLevelUp(hHero)
    }

    /**初始化英雄数据,只针对英雄 */
    InitHeroAttribute(hUnit: CDOTA_BaseNPC) {
        let heroname = hUnit.GetUnitName() as keyof typeof NpcHeroesCustom;
        let hHeroKvData = NpcHeroesCustom[heroname];
        let player_id = hUnit.GetPlayerOwnerID()
        hUnit.custom_attribute_value = {};
        hUnit.custom_attribute_table = {};
        hUnit.custom_mul_attribute = {};
        hUnit.custom_attribute_show = {};
        hUnit.custom_attribute_key_table = {};
        hUnit.custom_attribute_conversion = {};
        hUnit.last_attribute_update = 0;
        hUnit.CustomVariables = {};
        hUnit.move_state = false;
        hUnit.prop_count = {};
        hUnit.hero_talent = {};
        hUnit.rune_level_index = {};


        GameRules.CustomOverrideAbility.InitOverrideSpecialTable(player_id, hUnit);
        //PrecacheUnitByNameAsync(heroname, () => {
        print("InitHeroAttribute", hHeroKvData)
        if (hHeroKvData) {
            // print("has herodata")
            // 延迟1帧之后加载
            for (let i = 0; i < 32; i++) {
                let hAbility = hUnit.GetAbilityByIndex(i);
                if (hAbility) { hAbility.RemoveSelf() }
            }
            this.SetHeroWearables(hUnit)
            hUnit.SetContextThink("delay_init_attr", () => {
                /** 属性表 */
                let attribute_table: CustomAttributeTableType = {};
                /** 属性转换 */
                let attribute_conversion: CustomAttributeConversionType = {};
                for (let key in AttributeConst) {
                    let attr_key = key as keyof typeof AttributeConst;
                    hUnit.custom_attribute_value[attr_key] = 0;
                    hUnit.custom_attribute_show[attr_key] = [0, 0]
                    if (attribute_table[attr_key] == null) { attribute_table[attr_key] = {} }
                    let AttributeRows = hHeroKvData.AttributeValues[key as keyof typeof hHeroKvData.AttributeValues];
                    for (let key2 in AttributeSub) {
                        let sub_key = key2 as AttributeSubKey
                        if (attribute_table[attr_key][sub_key] == null) {
                            let value: number;
                            if (AttributeRows) {
                                value = AttributeRows[key2 as keyof typeof AttributeRows] ?? 0;
                            } else {
                                value = 0;
                            }
                            attribute_table[attr_key][key2] = value
                        }
                    }
                    // 属性转换表加载
                    // if (attribute_conversion[attr_key] == null) { attribute_conversion[attr_key] = {} }
                    // const ConversionValue = AttributeConst[attr_key]["ConversionValue"];
                    // for (let conver_key in ConversionValue) {
                    //     let data = ConversionValue[conver_key]
                    //     attribute_conversion[attr_key][conver_key] = data
                    // }
                }

                // DeepPrintTable(attribute_table)
                hUnit.custom_attribute_table = attribute_table;
                // hUnit.custom_attribute_conversion = attribute_conversion;
                this.AttributeCalculate(hUnit, Object.keys(AttributeConst) as AttributeMainKey[], true);
                this.InitHeroAbility(hUnit);

                //注册英雄天赋
                GameRules.HeroTalentSystem.RegisterHeroTalent(hUnit);

                //初始化存档给英雄提供的属性
                GameRules.ServiceData.LoadPlayerServerAttr(player_id);
                return null
            }, 0.1)


        } else {

            for (let i = 0; i < 32; i++) {
                let hAbility = hUnit.GetAbilityByIndex(i);
                if (hAbility) {
                    if (hAbility.GetAbilityType() == 2) {
                        hAbility.RemoveSelf()
                    }
                }
            }

            hUnit.SetContextThink("delay_init_attr", () => {
                /** 属性表 */
                let attribute_table: CustomAttributeTableType = {};
                /** 属性转换 */
                let attribute_conversion: CustomAttributeConversionType = {};
                for (let key in AttributeConst) {
                    let attr_key = key as keyof typeof AttributeConst;
                    hUnit.custom_attribute_value[attr_key] = 0;
                    hUnit.custom_attribute_show[attr_key] = [0, 0]
                    if (attribute_table[attr_key] == null) { attribute_table[attr_key] = {} }
                    for (let key2 in AttributeSub) {
                        let sub_key = key2 as AttributeSubKey
                        if (attribute_table[attr_key][sub_key] == null) {
                            attribute_table[attr_key][key2] = 0
                        }
                    }
                    // 属性转换表加载
                    // if (attribute_conversion[attr_key] == null) { attribute_conversion[attr_key] = {} }
                    // const ConversionValue = AttributeConst[attr_key]["ConversionValue"];
                    // for (let conver_key in ConversionValue) {
                    //     let data = ConversionValue[conver_key]
                    //     attribute_conversion[attr_key][conver_key] = data
                    // }
                }

                hUnit.custom_attribute_table = attribute_table;
                hUnit.custom_attribute_conversion = attribute_conversion;

                // this.InitHeroAbility(hUnit, false);
                hUnit.AddAbility("public_arms").SetLevel(1);
                hUnit.AddAbility("public_attribute").SetLevel(1);
                hUnit.AddAbility("custom_datadriven_hero").SetLevel(1);
                this.AttributeCalculate(hUnit, Object.keys(AttributeConst) as AttributeMainKey[]);

                this.ModifyAttribute(hUnit, {
                    "MaxMana": {
                        Base: 999
                    },
                    "ManaRegen": {
                        Base: 99
                    }
                })

                hUnit.AddNewModifier(hUnit, null, "modifier_item_aghanims_shard", {})
                hUnit.AddNewModifier(hUnit, null, "modifier_item_ultimate_scepter_consumed", {})
                return null
            }, 0.1)
        }

        //});
    }

    InitHeroAbility(hUnit: CDOTA_BaseNPC, heroName?: string) {
        // print("InitHeroAbility");
        hUnit.AddAbility("public_null_1").SetLevel(1);
        hUnit.AddAbility("public_null_2").SetLevel(1);
        hUnit.AddAbility("public_null_3").SetLevel(1);
        hUnit.AddAbility("public_null_4").SetLevel(1);
        hUnit.AddAbility("public_null_5").SetLevel(1);
        hUnit.AddAbility("public_blink").SetLevel(1);
        hUnit.AddAbility("public_arms").SetLevel(1);
        hUnit.AddAbility("public_attribute").SetLevel(1);
        hUnit.AddAbility("custom_datadriven_hero").SetLevel(1);
    }

    /**
     * 在游戏中初始化技能
     */
    InitAbility(hUnit: CDOTA_BaseNPC) {
        for (let index = 0; index < 5; index++) {
            let abi = hUnit.GetAbilityByIndex(index);
            hUnit.RemoveAbilityByHandle(abi);
        }
        hUnit.AddAbility("public_null_1").SetLevel(1);
        hUnit.AddAbility("public_null_2").SetLevel(1);
        hUnit.AddAbility("public_null_3").SetLevel(1);
        hUnit.AddAbility("public_null_4").SetLevel(1);
        hUnit.AddAbility("public_null_5").SetLevel(1);
        //重置锁定条件
        let player_id = hUnit.GetPlayerOwnerID();
        GameRules.MysticalShopSystem.player_skill_activated[player_id] = [
            true, true, true, true, true
        ];
    }


    /** 计算属性 */
    AttributeCalculate(hUnit: CDOTA_BaseNPC, attr_key: AttributeMainKey[], is_init: boolean = false) {
        for (let main_key of attr_key) {
            let is_mul = AttributeConst[main_key].is_mul == 1;
            if (!is_mul) {
                let mul_value = 1;
                if (hUnit.custom_mul_attribute[main_key]) {
                    let attr_values = Object.values(hUnit.custom_mul_attribute[main_key]);
                    // DeepPrintTable(attr_values)
                    let base_value = 100;
                    for (let value of attr_values) {
                        base_value *= (100 + value) * 0.01;
                    }
                    mul_value = base_value * 0.01;
                }
                // print("mul_value",mul_value)
                // 非乘算属性
                let SubAttr = hUnit.custom_attribute_table[main_key as keyof typeof hUnit.custom_attribute_table];
                let TotalAttrValue = ((SubAttr["Base"]) * (1 + SubAttr["BasePercent"] * 0.01) + SubAttr["Bonus"])
                    * (1 + SubAttr["TotalPercent"] * 0.01)
                    + (SubAttr["Bonus"]) * (SubAttr["BonusPercent"] * 0.01)
                    + (SubAttr["Fixed"]);
                TotalAttrValue = TotalAttrValue * mul_value;
                /** 最低基础值 */
                let LastState = (SubAttr["Last"] ?? 0) > 0;
                if (LastState) {
                    hUnit.custom_attribute_value[main_key] = math.max(SubAttr["Base"], TotalAttrValue);
                } else {
                    hUnit.custom_attribute_value[main_key] = TotalAttrValue;
                }

                hUnit.custom_attribute_show[main_key][0] = SubAttr["Base"];
                hUnit.custom_attribute_show[main_key][1] = TotalAttrValue - SubAttr["Base"]

                hUnit.custom_attribute_table[main_key].MulRegion = mul_value
            } else {
                // 乘算属性处理
                let mul_value = 1;
                if (hUnit.custom_mul_attribute[main_key]) {
                    let attr_values = Object.values(hUnit.custom_mul_attribute[main_key]);
                    let base_value = 100;
                    for (let value of attr_values) {
                        base_value = base_value * (100 - value) * 0.01;
                    }
                    hUnit.custom_attribute_value[main_key] = 100 - base_value;
                    mul_value = base_value * 0.01;
                }

                hUnit.custom_attribute_table[main_key].MulRegion = mul_value
            }
        }

        // DeepPrintTable(hUnit.custom_attribute_value)

        // 第二次计算 把额外属性转为绿字,不会
        // let extra_attribute_table = this.ConversionCalculate(hUnit)
        // let extra_attribute_value = this.AttributeCalculateExtra(hUnit, extra_attribute_table)
        // for (let extra_key in extra_attribute_value) {
        //     hUnit.custom_attribute_value[extra_key] += math.floor(extra_attribute_value[extra_key])
        //     hUnit.custom_attribute_show[extra_key][1] += math.floor(extra_attribute_value[extra_key])
        // }

        // 技能急速处理
        let AbilityHaste = hUnit.custom_attribute_value.AbilityHaste ?? 0;
        let AbilityCooldownLimit = hUnit.custom_attribute_table.AbilityCooldown.Limit ?? 0;
        hUnit.custom_attribute_value.AbilityCooldown = math.min(AbilityCooldownLimit, 100 * AbilityHaste / (AbilityHaste + 150))
        if (!is_init) {
            const update_state = GameRules.GetDOTATime(false, false) > hUnit.last_attribute_update;
            // print("update", update_state)
            if (update_state) {
                this.UpdateAttributeInGame(hUnit)
            } else {
                hUnit.SetContextThink("last_attribute_update", () => {
                    // print("start last_attribute_update")
                    this.UpdateAttributeInGame(hUnit)
                    return null;
                }, this.update_delay);
            }
        }


    }

    /**
     * 属性更新至客户端
     * @param hUnit 
     */
    UpdateAttributeInGame(hUnit: CDOTA_BaseNPC) {
        // print("UpdateAttributeInGame")
        // print("hUnit", hUnit, hUnit.IsNull())
        if (hUnit == null || hUnit.IsNull()) { return }
        hUnit.last_attribute_update = GameRules.GetDOTATime(false, false) + this.update_delay
        let buff = hUnit.FindModifierByName("modifier_public_attribute");
        if (buff) {
            buff.ForceRefresh();
        }
    }

    /** 转换属性获取 
     * 比如获得最大2%生命值攻击, 这转换出来的属性,是否能再次吃到加成?
     * 转为基础
     */
    ConversionCalculate(hUnit: CDOTA_BaseNPC) {
        // 第二次计算转换
        let extra_attribute_table: CustomAttributeTableType = {};//临时的数据
        for (let OriginAttr in hUnit.custom_attribute_conversion) {
            // print("OriginAttr", OriginAttr)
            let ConversionData = hUnit.custom_attribute_conversion[OriginAttr as keyof typeof hUnit.custom_attribute_conversion];
            // DeepPrintTable(ConversionData)
            for (let TargetAttr in ConversionData) {
                if (extra_attribute_table[TargetAttr] == null) {
                    extra_attribute_table[TargetAttr] = {};
                }
                for (let TargetSubAttr in ConversionData[TargetAttr]) {
                    if (extra_attribute_table[TargetAttr][TargetSubAttr] == null) {
                        extra_attribute_table[TargetAttr][TargetSubAttr] = 0
                    }
                    const _value = ConversionData[TargetAttr][TargetSubAttr];
                    const origin_value = hUnit.custom_attribute_value[OriginAttr as AttributeMainKey]
                    extra_attribute_table[TargetAttr][TargetSubAttr] += (_value * origin_value)
                }
            }
        }

        return extra_attribute_table
    }

    /**
     * 转换属性后获得额外属性计算, 转换属性是否再次吃加成
     * @param hUnit 
     * @param custom_attribute_table 
     * @returns 
     */
    AttributeCalculateExtra(hUnit: CDOTA_BaseNPC, custom_attribute_table: CustomAttributeTableType) {
        let temp_attribute_value: CustomAttributeValueType = {}
        for (let MainKey in custom_attribute_table) {
            let SubAttr = hUnit.custom_attribute_table[MainKey as keyof typeof hUnit.custom_attribute_table];
            let TempSubAttr = custom_attribute_table[MainKey as keyof typeof custom_attribute_table];
            let MainAttrValue = ((TempSubAttr["Base"] ?? 0) * (1 + SubAttr["BasePercent"] * 0.01) + (TempSubAttr["Bonus"] ?? 0))
                * (1 + SubAttr["TotalPercent"] * 0.01)
                + (TempSubAttr["Bonus"] ?? 0) * (1 + SubAttr["BonusPercent"] * 0.01)
                + (TempSubAttr["Fixed"] ?? 0);
            temp_attribute_value[MainKey] = MainAttrValue
        }

        return temp_attribute_value
    }

    /**
     * 属性计算公式
     * 
     * @param RowAttrList 
     */
    AttributeCalculationCore(RowAttrList: { [key2 in AttributeSubKey]?: number }) {
        // let MainAttrValue = ((RowAttrList["Base"] ?? 0) * (1 + SubAttr["BasePercent"] * 0.01) + (TempSubAttr["Bonus"] ?? 0))
        //     * (1 + SubAttr["TotalPercent"] * 0.01)
        //     + (RowAttrList["Bonus"] ?? 0) * (1 + SubAttr["BonusPercent"] * 0.01)
        //     + (RowAttrList["Fixed"] ?? 0);
    }

    /** 升级事件增加属性 */
    AttributeInLevelUp(hUnit: CDOTA_BaseNPC) {
        let Attr: CustomAttributeTableType = {};
        for (let MainKey in hUnit.custom_attribute_table) {
            let main_key = MainKey as AttributeMainKey;
            let SubAttr = hUnit.custom_attribute_table[MainKey as keyof typeof hUnit.custom_attribute_table];
            if (SubAttr["PreLvBase"] > 0 || SubAttr["PreLvBonus"] > 0 || SubAttr["PreLvFixed"] > 0) {
                Attr[main_key] = {
                    "Base": SubAttr["PreLvBase"],
                    "Bonus": SubAttr["PreLvBonus"],
                    "Fixed": SubAttr["PreLvFixed"],
                }
            }

        }
        this.ModifyAttribute(hUnit, Attr)
    }

    /**
     * 修改属性
     * @param hUnit 
     * @param Attr 
     * @param mode `0`为增加 `-1`为减
     */
    ModifyAttribute(hUnit: CDOTA_BaseNPC, AttrList: CustomAttributeTableType, mode: number = 0) {
        // DeepPrintTable(AttrList)
        if (mode == 0) {
            for (let key in AttrList) {
                let attr_key = key as keyof typeof AttrList;
                let is_mul = AttributeConst[attr_key].is_mul == 1;
                if (!is_mul) {
                    for (let k2 in AttrList[key]) {
                        if (k2 != "MulRegion") {
                            let value = AttrList[key][k2] as number;
                            hUnit.custom_attribute_table[key][k2] += value
                        }
                    }
                }
            }
        } else {
            for (let key in AttrList) {
                let attr_key = key as keyof typeof AttrList;
                let is_mul = AttributeConst[attr_key].is_mul == 1;
                if (!is_mul) {
                    for (let k2 in AttrList[key]) {
                        if (k2 != "MulRegion") {
                            let value = AttrList[key][k2] as number;
                            hUnit.custom_attribute_table[key][k2] -= value
                        }

                    }
                }
            }
        }

        this.AttributeCalculate(hUnit, Object.keys(AttrList) as AttributeMainKey[]);
    }

    /**
     * 设置一个属性
     * @param hUnit 
     * @param key 属性KEY
     * @param attr_key 属性列表
     * @param timer 持续时间 -1为永久
     */
    SetAttributeInKey(hUnit: CDOTA_BaseNPC, key: string, attr_list: CustomAttributeTableType, timer: number = -1) {
        print("SetAttributeInKey",key)
        // 对比写入的key 与 当前已存在的key 里面的结果是否想等
        if (!hUnit.IsHero()) { return }
        let exists_attr = hUnit.custom_attribute_key_table[key];
        let exists_attr_str = JSON.encode(exists_attr)
        let attr_list_str = JSON.encode(attr_list);
        if (exists_attr_str != attr_list_str) {
            for (let _key in attr_list) {
                let attr_key = _key as AttributeMainKey
                let is_mul = AttributeConst[attr_key].is_mul == 1;
                let row_input = attr_list[attr_key]
                if (is_mul) {
                    if (hUnit.custom_mul_attribute[attr_key] == null) {
                        hUnit.custom_mul_attribute[attr_key] = {}
                    }
                    hUnit.custom_mul_attribute[attr_key][key] = (attr_list[attr_key].Base ?? 0)
                } else if (row_input.MulRegion != null) {
                    if (hUnit.custom_mul_attribute[attr_key] == null) {
                        hUnit.custom_mul_attribute[attr_key] = {}
                    }
                    hUnit.custom_mul_attribute[attr_key][key] = (attr_list[attr_key].MulRegion ?? 0)
                }
            }
        }


        if (hUnit.custom_attribute_key_table[key] == null) {
            hUnit.custom_attribute_key_table[key] = attr_list;
            this.ModifyAttribute(hUnit, attr_list)
        } else {
            // 若已存在,进行覆盖时先对比差值 ,写入差值;
            let temp_attr_list = hUnit.custom_attribute_key_table[key];
            let origin_object: CustomAttributeTableType = {};
            let new_object: CustomAttributeTableType = {};
            // 原本的值
            for (let k in temp_attr_list) {
                let row_data = temp_attr_list[k as keyof typeof temp_attr_list];
                origin_object[k] = {}
                for (let k2 in row_data) {
                    let attr_value = row_data[k2 as keyof typeof row_data];
                    origin_object[k][k2] = temp_attr_list[k][k2]
                }
            }
            // 新写入的值
            for (let k in attr_list) {
                let row_data = attr_list[k as keyof typeof attr_list];
                new_object[k] = {}
                for (let k2 in row_data) {
                    let attr_value = row_data[k2 as keyof typeof row_data];
                    new_object[k][k2] = attr_value
                }
            }
            // print("============ origin_object")
            // DeepPrintTable(origin_object)
            // 移除原本的值
            for (let k in origin_object) {
                let row_data = origin_object[k as keyof typeof origin_object];
                for (let k2 in row_data) {
                    // let attr_value = row_data[k2 as keyof typeof row_data];
                    // 如果有原本值直接减
                    if (new_object[k] == null) { new_object[k] = {} }
                    if (new_object[k][k2]) {
                        new_object[k][k2] -= origin_object[k][k2]
                    } else {
                        // 否则直接添加要扣除的值
                        new_object[k][k2] = -1 * origin_object[k][k2]
                    }

                }
            }
            // DeepPrintTable(new_object)
            hUnit.custom_attribute_key_table[key] = attr_list
            this.ModifyAttribute(hUnit, new_object)
        }

        if (timer >= 0) {
            const timer_key = "attr_timer_" + key;
            hUnit.SetContextThink(
                timer_key,
                () => {
                    let temp_attr_list = hUnit.custom_attribute_key_table[key];
                    for (let attr_key in hUnit.custom_mul_attribute) {
                        hUnit.custom_mul_attribute[attr_key as AttributeMainKey][key] = null
                    }
                    this.ModifyAttribute(hUnit, temp_attr_list, -1)
                    hUnit.custom_attribute_key_table[key] = null;
                    // 移除增益属性
                    return null;
                },
                timer
            );
        }
    }

    /** 删除一个key值的相关属性 */
    DelAttributeInKey(hUnit: CDOTA_BaseNPC, key: string) {
        if (!hUnit.IsHero()) { return }
        if (hUnit.custom_attribute_key_table[key] == null) {
            return;
        }
        let temp_attr_list = hUnit.custom_attribute_key_table[key];
        hUnit.custom_attribute_key_table[key] = null;

        // 移除对应的 独立乘算
        for (let attr_key in temp_attr_list) {
            if (hUnit.custom_mul_attribute[attr_key] != null) {
                hUnit.custom_mul_attribute[attr_key][key] = null
            }
        }

        this.ModifyAttribute(hUnit, temp_attr_list, -1)
    }

    /** 获取物品的属性 */
    // GetItemAttribute(item_name: string) {
    //     let data = ItemArmsJson[item_name as keyof typeof ItemArmsJson];
    //     let AttributeValues = data.AttributeValues as CustomAttributeTableType
    //     return AttributeValues
    // }

    // GetAbilityAttribute(ability_name: string) {
    //     let data = AbilitiesArmsJson[ability_name as keyof typeof AbilitiesArmsJson];
    //     let AttributeValues = data.AttributeValues as CustomAttributeTableType
    //     return AttributeValues
    // }


    /** 修改转换属性 */
    ModifyConversionAttribute(hUnit: CDOTA_BaseNPC, attr_key: CustomAttributeConversionType) {

    }

    GetUnitTotalAttribute(attr_key: AttributeMainKey[]) {

    }


    //技能相关
    ModifierList: {
        [EntityIndexList: EntityIndex]: {
            ability: CDOTABaseAbility,
            modifierName: string,
            add_type: "Driven" | "Script",
            modifierTable: object,
            hUnit: CDOTA_BaseNPC,
        }[];
    } = {};

    /**
     * 为目标添加延迟buff 死亡有效
     * @param hUnit 
     * @param UpdateTable 
     */
    AddHeroModifier(
        hUnit: CDOTA_BaseNPC, //来源
        hAbility: CDOTABaseAbility, //技能
        modifierName: string, //modifier名字
        add_type: "Driven" | "Script" = "Driven", //驱动方式
        modifierTable: object = {}, //额外参数
        target: CDOTA_BaseNPC = null, //目标
    ) {
        if (hUnit.IsAlive()) { //没有死亡立即添加
            // 技能
            if (target == null) { target = hUnit; }
            if (add_type == "Driven") {
                // 数据驱动
                (hAbility as CDOTA_Ability_DataDriven).ApplyDataDrivenModifier(hUnit, target, modifierName, modifierTable);
            } else if (add_type == "Script") {
                // 脚本技能
                target.AddNewModifier(hUnit, hAbility, modifierName, modifierTable);
            }

        } else {
            if (target == null) { target = hUnit; }
            let ModifierUpdata = target.CustomVariables["ModifierUpdataThink"] ?? 0; //是否启动Think
            let HEntityIndex = target.GetEntityIndex();
            if (this.ModifierList.hasOwnProperty(HEntityIndex)) {
                this.ModifierList[HEntityIndex].push({
                    ability: hAbility,
                    modifierName: modifierName,
                    add_type: add_type,
                    modifierTable: modifierTable,
                    hUnit: hUnit,
                });
            } else {
                this.ModifierList[HEntityIndex] = [];
                this.ModifierList[HEntityIndex].push({
                    ability: hAbility,
                    modifierName: modifierName,
                    add_type: add_type,
                    modifierTable: modifierTable,
                    hUnit: hUnit,
                });
            }
            if (ModifierUpdata == 0) {
                target.CustomVariables["ModifierUpdataThink"] = 1;
                target.SetContextThink("hero_modifier_update", () => {
                    if (target.IsAlive()) { //活着就更新
                        if (this.ModifierList.hasOwnProperty(HEntityIndex)) {
                            for (const moddata of this.ModifierList[HEntityIndex]) {
                                // 技能
                                let hAbility = moddata.ability;
                                if (add_type == "Driven") {
                                    // 数据驱动
                                    (hAbility as CDOTA_Ability_DataDriven).ApplyDataDrivenModifier(hUnit, target, moddata.modifierName, moddata.modifierTable);
                                } else if (add_type == "Script") {
                                    // 脚本技能
                                    target.AddNewModifier(hUnit, hAbility, moddata.modifierName, moddata.modifierTable);
                                }

                            }
                        }
                        target.CustomVariables["ModifierUpdataThink"] = 0;
                        return null;
                    } else {//死亡继续等待
                        return 1;
                    }
                }, 0);
            }
        }
    }

    /** 更新KV值 */
    UpdataPlayerSpecialValue(player_id: PlayerID) {
        // print("UpdataPlayerSpecialValue")
        let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
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

    /**
     * 加载单位饰品
     * @param hUnit 
     */
    SetHeroWearables(hUnit: CDOTA_BaseNPC) {
        let heroname = hUnit.GetUnitName();
        let wearable_data = this.hero_wearable[heroname]
        if (wearable_data) {
            // 移除原始饰品
            hUnit.SetModel("models/development/invisiblebox.vmdl");
            hUnit.SetOriginalModel("models/development/invisiblebox.vmdl")
            for (let v of hUnit.GetChildren()) {
                // print("v", v)
                if (v && v.GetClassname() == "dota_item_wearable") {
                    v.RemoveSelf()
                }
            }
            const WearableModel = wearable_data.origin_model

            hUnit.SetOriginalModel(WearableModel.unit_model)
            hUnit.SetModel(WearableModel.unit_model);
            hUnit.SetSkin(WearableModel.skin)
            // hUnit.SetMaterialGroup()
            for (let particle_create of wearable_data.particle_create) {
                // print("w_particle",particle_create)
                let particle_index = ParticleManager.CreateParticle(
                    particle_create,
                    ParticleAttachment.ABSORIGIN_FOLLOW,
                    hUnit
                )
            }

            let szWearables = wearable_data.wearables;
            for (let wearable of szWearables) {
                let hWearable = Entities.CreateByClassname("wearable_item") as CDOTA_BaseNPC
                if (hWearable != null) {
                    hWearable.wrarable_model = wearable.model
                    hWearable.SetModel(wearable.model)
                    hWearable.SetTeam(DotaTeam.GOODGUYS)
                    hWearable.SetOwner(hUnit)
                    hWearable.FollowEntity(hUnit, true)
                    let material = wearable.material
                    if (material) {
                        if (material.index) {
                            hWearable.SetMaterialGroup(material.index)
                        } else {
                            hWearable.SetBodygroupByName(material.group, material.value)
                        }

                    }

                    // hWearable.SetRenderColor(255,0,0);
                    for (let w_particle of wearable.particle) {

                        let particle_index = ParticleManager.CreateParticle(
                            w_particle,
                            ParticleAttachment.POINT_FOLLOW,
                            hWearable
                        )

                        // this.particle_test.push(particle_index)
                    }
                    // hWearable.SetSkin(1)
                }
            }
        }
    }


    /**
     * 击杀相关
     * @param hAttacker 击杀者 
     * @param hUnit 被击杀的单位
     */
    OnKillEvent(hAttacker: CDOTA_BaseNPC, hUnit: CDOTA_BaseNPC) {
        let kill_restore_hp = hAttacker.custom_attribute_value.KillRestoreHp ?? 0;
        if (kill_restore_hp > 0) { GameRules.BasicRules.Heal(hAttacker, kill_restore_hp) }
        let kill_restore_mp = hAttacker.custom_attribute_value.KillRestoreMp ?? 0;
        if (kill_restore_mp > 0) { GameRules.BasicRules.RestoreMana(hAttacker, kill_restore_mp) }
    }

    Debug(cmd: string, args: string[], player_id: PlayerID) {
        const hHero = PlayerResource.GetSelectedHeroEntity(player_id);

        if (cmd == "-attr") {
            DeepPrintTable(hHero.custom_attribute_key_table)
        }

        if (cmd == "-atest") {
            for (let i = 0; i < 10; i++) {
                this.SetAttributeInKey(hHero, "atest", {
                    'MoveSpeed': {
                        "BasePercent": -200,
                    },
                }, 5 + i * 0.5)
            }
        }

        if (cmd == "-uptest") {

            this.SetAttributeInKey(hHero, "uptest", {
                "MoveSpeed": {
                    "Up_Base": 5
                }
            })
        }
        if (cmd == "-addattr") {
            this.ModifyAttribute(hHero, {
                "MaxHealth": {
                    "Base": 1,
                },
                "AttackSpeed": {
                    Base: 10,
                },
                "AttackRange": {
                    Base: 10,
                },
            })
        }

        if (cmd == "-multest") {
            let value = [-50, -50, -50, -50, 50, 50, 50];


            for (let i = 0; i < 5; i++) {
                let mul_key = DoUniqueString("mul_key");
                this.SetAttributeInKey(hHero, mul_key, {
                    'MoveSpeed': {
                        "Bonus": -5,
                        "BasePercent": -10,
                    },
                }, 5 + i)
            }

        }

        if (cmd == '-debuff') {
            let debuff_emu = tonumber(args[0] ?? "1") as DebuffTypes;
            let debuff_duration = 2;
            GameRules.BuffManager.AddGeneralDebuff(hHero, hHero, debuff_emu, debuff_duration)
        }

        if (cmd == "-mana") {
            let mana_amount = tonumber(args[0] ?? "0");
            hHero.SetMana(mana_amount);
        }

        if (cmd == "-hp") {
            let amount = tonumber(args[0] ?? "1");
            hHero.SetHealth(math.max(1, amount));
        }

        if (cmd == "-hit") {
            let amount = tonumber(args[0] ?? "1");
            let element_type = tonumber(args[1] ?? "1") as ElementTypes;
            GameRules.DamageSystem.ApplyDamageForBadTeam({
                victim: hHero,
                attacker: hHero,
                damage: amount,
                damage_type: DamageTypes.MAGICAL,
                ability: null,
                element_type: element_type,
            })
        }
    }
}