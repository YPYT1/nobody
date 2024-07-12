import * as AttributeConst from "../../../json/config/game/attribute_const.json";
import * as AttributeSub from "../../../json/config/game/attribute_sub.json";
import * as NpcHeroesCustom from "../../../json/npc_heroes_custom.json";
import * as ItemArmsJson from "../../../json/items/item_arms.json";
import * as AbilitiesArmsJson from "../../../json/abilities/arms.json";


import { reloadable } from "../../../utils/tstl-utils";

/** 自定义属性系统 */
@reloadable
export class CustomAttribute {

    /** 更新间隔 */
    update_delay = 0.1;

    constructor() {
        print("[CustomAttribute]:constructor")
        this.ModifierList = {};
        ListenToGameEvent("dota_player_gained_level", event => this.OnEntityDotaPlayerGainedLevel(event), this);

    }

    /** 升级事件 */
    OnEntityDotaPlayerGainedLevel(event: GameEventProvidedProperties & DotaPlayerGainedLevelEvent) {
        // print("OnEntityDotaPlayerGainedLevel")
        const hHero = EntIndexToHScript(event.hero_entindex) as CDOTA_BaseNPC_Hero;
        this.AttributeInLevelUp(hHero)
    }

    /**初始化英雄数据,只针对英雄 */
    InitHeroAttribute(hUnit: CDOTA_BaseNPC) {
        let heroname = hUnit.GetUnitName() as keyof typeof NpcHeroesCustom;
        let hHeroKvData = NpcHeroesCustom[heroname];
        let player_id = hUnit.GetPlayerOwnerID()
        hUnit.custom_attribute_value = {};
        hUnit.custom_attribute_table = {};
        hUnit.custom_attribute_show = {};
        hUnit.custom_attribute_key_table = {};
        hUnit.custom_attribute_conversion = {};
        hUnit.last_attribute_update = 0;

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
                    if (attribute_conversion[attr_key] == null) { attribute_conversion[attr_key] = {} }
                    const ConversionValue = AttributeConst[attr_key]["ConversionValue"];
                    for (let conver_key in ConversionValue) {
                        let data = ConversionValue[conver_key]
                        attribute_conversion[attr_key][conver_key] = data
                    }
                }

                // DeepPrintTable(attribute_table)
                hUnit.custom_attribute_table = attribute_table;
                hUnit.custom_attribute_conversion = attribute_conversion;

                this.InitHeroAbility(hUnit);
                this.AttributeCalculate(hUnit, Object.keys(AttributeConst) as AttributeMainKey[]);

                //注册英雄天赋
                GameRules.HeroTalentSystem.RegisterHeroTalent(hUnit);
                return null
            }, 0.1)


        } else {
            print("no hero data:", heroname);
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
                    if (attribute_conversion[attr_key] == null) { attribute_conversion[attr_key] = {} }
                    const ConversionValue = AttributeConst[attr_key]["ConversionValue"];
                    for (let conver_key in ConversionValue) {
                        let data = ConversionValue[conver_key]
                        attribute_conversion[attr_key][conver_key] = data
                    }
                }

                hUnit.custom_attribute_table = attribute_table;
                hUnit.custom_attribute_conversion = attribute_conversion;

                // this.InitHeroAbility(hUnit, false);
                hUnit.AddAbility("public_arms").SetLevel(1);
                hUnit.AddAbility("public_attribute").SetLevel(1);
                hUnit.AddAbility("custom_datadriven_hero").SetLevel(1);
                this.AttributeCalculate(hUnit, Object.keys(AttributeConst) as AttributeMainKey[]);

                return null
            }, 0.1)
        }

        //});
    }

    InitHeroAbility(hUnit: CDOTA_BaseNPC) {
        hUnit.AddAbility("drow_1").SetLevel(1);
        hUnit.AddAbility("arms_passive_1").SetLevel(1);
        hUnit.AddAbility("arms_passive_2").SetLevel(1);
        hUnit.AddAbility("arms_passive_3").SetLevel(1);
        hUnit.AddAbility("arms_passive_4").SetLevel(1);

        hUnit.AddAbility("public_arms").SetLevel(1);
        hUnit.AddAbility("public_attribute").SetLevel(1);
        hUnit.AddAbility("custom_datadriven_hero").SetLevel(1);
    }

    /** 计算属性 */
    AttributeCalculate(hUnit: CDOTA_BaseNPC, attr_key: AttributeMainKey[]) {
        for (let main_key of attr_key) {
            let SubAttr = hUnit.custom_attribute_table[main_key as keyof typeof hUnit.custom_attribute_table];
            // DeepPrintTable(SubAttr)
            let MainAttrValue = ((SubAttr["Base"]) * (1 + SubAttr["BasePercent"] * 0.01) + SubAttr["Bonus"])
                * (1 + SubAttr["TotalPercent"] * 0.01)
                + (SubAttr["Bonus"]) * (SubAttr["BonusPercent"] * 0.01)
                + (SubAttr["Fixed"]);
            hUnit.custom_attribute_value[main_key] = MainAttrValue;
            hUnit.custom_attribute_show[main_key][0] = SubAttr["Base"];
            hUnit.custom_attribute_show[main_key][1] = MainAttrValue - SubAttr["Base"]
        }

        let extra_attribute_table = this.ConversionCalculate(hUnit)
        let extra_attribute_value = this.AttributeCalculateExtra(hUnit, extra_attribute_table)
        for (let extra_key in extra_attribute_value) {
            hUnit.custom_attribute_value[extra_key] += math.floor(extra_attribute_value[extra_key])
            hUnit.custom_attribute_show[extra_key][1] += math.floor(extra_attribute_value[extra_key])
        }
        // 属性更新
        // DeepPrintTable(hUnit.custom_attribute_value)
        const update_state = GameRules.GetDOTATime(false, false) > hUnit.last_attribute_update;
        if (update_state) {
            this.UpdateAttributeInGame(hUnit)
        } else {
            hUnit.SetContextThink("last_attribute_update", () => {
                this.UpdateAttributeInGame(hUnit)
                return null;
            }, this.update_delay);
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

    /** 属性转换计算 */
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
                    // print("ConverAttr", TargetAttr, TargetSubAttr, _value, "OriginAttr:", OriginAttr, origin_value)
                    extra_attribute_table[TargetAttr][TargetSubAttr] += (_value * origin_value)
                }
            }
        }

        return extra_attribute_table
    }

    /** 第二次额外属性计算 */
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
    ModifyAttribute(hUnit: CDOTA_BaseNPC, Attr: CustomAttributeTableType, mode: number = 0) {
        // print("ModifyAttribute")
        // DeepPrintTable(Attr)
        if (mode == 0) {
            for (let k1 in Attr) {
                for (let k2 in Attr[k1]) {
                    let value = Attr[k1][k2] as number;
                    hUnit.custom_attribute_table[k1][k2] += value
                }
            }
        } else {
            for (let k1 in Attr) {
                for (let k2 in Attr[k1]) {
                    let value = Attr[k1][k2] as number;
                    hUnit.custom_attribute_table[k1][k2] -= value
                }
            }
        }

        this.AttributeCalculate(hUnit, Object.keys(Attr) as AttributeMainKey[]);
    }

    /**
     * 设置一个属性
     * @param hUnit 
     * @param key 属性KEY
     * @param attr_key 属性列表
     * @param timer 持续时间 -1为永久
     */
    SetAttributeInKey(hUnit: CDOTA_BaseNPC, key: string, attr_list: CustomAttributeTableType, timer: number = -1) {
        if (hUnit.custom_attribute_key_table[key] == null) {
            // 没有这个 key 时直接操作,
            hUnit.custom_attribute_key_table[key] = attr_list;
            this.ModifyAttribute(hUnit, attr_list)
        } else {
            // 若已存在,进行覆盖时先对比差值 ,写入差值;
            let temp_attr_list = hUnit.custom_attribute_key_table[key];
            let temp_object = {};
            for (let k in attr_list) {
                let row_data = attr_list[k as keyof typeof attr_list];
                temp_object[k] = {}
                for (let k2 in row_data) {
                    let attr_value = row_data[k2 as keyof typeof row_data];
                    let old_value = 0;
                    if (temp_attr_list[k] && temp_attr_list[k][k2]) {
                        old_value = temp_attr_list[k][k2]
                    }
                    temp_object[k][k2] = attr_value - old_value
                }
            }
            hUnit.custom_attribute_key_table[key] = attr_list
            this.ModifyAttribute(hUnit, temp_object)
        }

        if (timer > 0) {
            const timer_key = "attr_timer_" + key;
            hUnit.SetContextThink(
                timer_key,
                () => {
                    let temp_attr_list = hUnit.custom_attribute_key_table[key];
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
        if (hUnit.custom_attribute_key_table[key] == null) {
            return;
        }
        let temp_attr_list = hUnit.custom_attribute_key_table[key];
        hUnit.custom_attribute_key_table[key] = null;
        this.ModifyAttribute(hUnit, temp_attr_list, -1)
    }

    /** 获取物品的属性 */
    GetItemAttribute(item_name: string) {
        let data = ItemArmsJson[item_name as keyof typeof ItemArmsJson];
        let AttributeValues = data.AttributeValues as CustomAttributeTableType
        return AttributeValues
    }

    GetAbilityAttribute(ability_name: string) {
        let data = AbilitiesArmsJson[ability_name as keyof typeof AbilitiesArmsJson];
        let AttributeValues = data.AttributeValues as CustomAttributeTableType
        return AttributeValues
    }


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
        let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        for (let i = 0; i < 5; i++) {
            let hAbility = hHero.GetAbilityByIndex(i);
            let PassiveMdfName = hAbility.GetIntrinsicModifierName();
            if (hAbility.IntrinsicMdf) {
                hAbility.IntrinsicMdf.ForceRefresh()
            }

            // let 
        }
    }

    Debug(cmd: string, args: string[], player_id: PlayerID) {
        const hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        if (cmd == "-init") {
            this.InitHeroAttribute(hHero)
            // hHero.AddNewModifier(hHero, null, "modifier_hero_attribute", {})
        }

        if (cmd == "-attr") {
            DeepPrintTable(hHero.custom_attribute_table)
            DeepPrintTable(hHero.custom_attribute_value)
        }

        if (cmd == "-setattr") {
            let value = parseInt(args[0] ?? "100");
            let timer = parseInt(args[1] ?? "0");
            this.SetAttributeInKey(hHero, "settest", {
                "HealthPoints": {
                    "Base": value
                }
            }, timer)
        }
        if (cmd == "-addattr") {
            this.ModifyAttribute(hHero, {
                "HealthPoints": {
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
    }
}