import { reloadable } from "../../../utils/tstl-utils";
import * as SpecialKeyvalueJson from "./../../../json/config/game/special_keyvalue.json"
import * as ArmsTypesJson from "./../../../json/config/game/const/arms_types.json"
import * as AbilitiesArmsJson from "./../../../json/abilities/arms.json"

import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";

// declare type AbilityCategoryTypes = keyof typeof ArmsTypesJson

declare type OverrideSpecialInputProps = {
    [primary in OverrideSpecialKeyTypes]?: {
        [type_key in OverrideSpecialBonusTypes]?: number
    }
}

declare type AbilitySpecialInputProps = {
    [special_key: string]: {
        [type_key in OverrideSpecialBonusTypes]?: number
    }
}

const SpecialvalueOfTable = {
    "Missile": {
        "skv_missile_count": 0,
        "skv_missile_speed": 0,
    },
    "Aoe": {
        "skv_aoe_radius": 0,
        "skv_aoe_multiple": 0,
        "skv_aoe_dmg": 0,
    }


}
/** 修改技能 */
@reloadable
export class CustomOverrideAbility extends UIEventRegisterClass {

    AbilitySpecialValue: { [player: string]: { [ability: string]: OverrideSpecialValueProps } };
    AbilitySpecialMul: { [player: string]: { [ability: string]: OverrideSpecialObjectProps } };
    OverrideSpecialMul: { [player: string]: OverrideSpecialObjectProps };
    OverrideSpecialValue: { [player: string]: OverrideSpecialValueProps };
    SpecialCategoryTable: { [cate: string]: string[] };

    // PlayerUpgradesTable:{}; // 玩家升级树
    constructor() {
        super("CustomOverrideAbility");
        // print("[CustomOverrideAbility]:constructor")
        this.OverrideSpecialMul = {};
        this.OverrideSpecialValue = {};
        this.AbilitySpecialValue = {};
        this.AbilitySpecialMul = {}
        this.SetArmsJson()
    }

    /** 初始化玩家的special key 值 */
    InitOverrideSpecialTable(player_id: PlayerID, hUnit: CDOTA_BaseNPC) {
        // hUnit.OverrideSpecial = {};
        hUnit.MinorAbilityUpgrades = {};

        this.OverrideSpecialMul[player_id] = {}
        this.OverrideSpecialValue[player_id] = {};

        this.AbilitySpecialValue[player_id] = {}
        this.AbilitySpecialMul[player_id] = {}

        CustomNetTables.SetTableValue("unit_special_value", tostring(player_id), hUnit.MinorAbilityUpgrades);
        hUnit.AddNewModifier(hUnit, null, "modifier_custom_override", {})
    }

    SetArmsJson() {
        this.SpecialCategoryTable = {};
        for (let k in SpecialKeyvalueJson) {
            let _data = SpecialKeyvalueJson[k as keyof typeof SpecialKeyvalueJson];
            let cate = _data.InCategory;
            if (this.SpecialCategoryTable[cate] == null) {
                this.SpecialCategoryTable[cate] = [];
            }
            this.SpecialCategoryTable[cate].push(k)
        }
    }

    ModifyOverrideSpecialValue(player_id: PlayerID, special_input: OverrideSpecialInputProps) {
        for (let override_key in special_input) {
            if (this.OverrideSpecialValue[player_id][override_key] == null) {
                this.OverrideSpecialValue[player_id][override_key] = {
                    base_value: 0,
                    mul_value: 1,
                    percent_value: 100,
                    correct_value: 100,
                }
            }

            let RowInput = special_input[override_key as keyof typeof special_input];
            if (RowInput.Base) { this.OverrideSpecialValue[player_id][override_key].base_value += RowInput.Base }
            if (RowInput.Percent) {
                this.OverrideSpecialValue[player_id][override_key].percent_value += RowInput.Percent
            }
            if (RowInput.Multiple) {
                let mul_input = (100 + RowInput.Multiple) * 0.01
                this.OverrideSpecialValue[player_id][override_key].mul_value *= mul_input
            }
            if (RowInput.Correct) {
                this.OverrideSpecialValue[player_id][override_key].correct_value += RowInput.Correct
            }
        }

        // 刷新一次技能
        GameRules.CustomAttribute.UpdataPlayerSpecialValue(player_id)


        this.GetUpdateSpecialValue(player_id)

    }

    // CustomOverrideAbility_
    /**
    * 更新技能SV值
    * @param player_id 
    */
    UpdateSpecialValue(player_id: PlayerID, abilityname?: string) {
        const hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        let MinorAbilityUpgrades = hHero.MinorAbilityUpgrades;
        const OverrideSpecialValue = this.OverrideSpecialValue[player_id];
        if (abilityname == null) {

            for (let override_key in OverrideSpecialValue) {
                const row_kv_data = OverrideSpecialValue[override_key];

                for (let ability_name in MinorAbilityUpgrades) {
                    let row_ability_data = MinorAbilityUpgrades[ability_name];
                    // DeepPrintTable(row_ability_data[override_key])

                    if (row_ability_data[override_key]) {
                        row_ability_data[override_key].percent_value = row_kv_data.percent_value;
                        row_ability_data[override_key].base_value = row_kv_data.base_value;
                        row_ability_data[override_key].mul_value = row_kv_data.mul_value;
                        row_ability_data[override_key].correct_value = row_kv_data.correct_value;
                    }

                }
            }
            // 对技能的值进行修改
            for (let ability_name in MinorAbilityUpgrades) {
                let hAbility = hHero.FindAbilityByName(ability_name);
                let iAbilityLevel = hAbility.GetLevel();
                let kv_data = MinorAbilityUpgrades[ability_name];
                for (let sSpecialValueName in kv_data) {
                    let row_data = kv_data[sSpecialValueName];
                    if (row_data) {
                        let flBaseValue = hAbility.GetLevelSpecialValueNoOverride(sSpecialValueName, iAbilityLevel);
                        let flAddResult = row_data.base_value;
                        let flMulResult = row_data.mul_value;
                        let flPercentResult = row_data.percent_value * 0.01;
                        let flCorrResult = math.max(0, row_data.correct_value * 0.01);
                        let flResult = math.floor((flBaseValue + flAddResult) * flPercentResult * flMulResult * flCorrResult);
                        row_data.cache_value = flResult
                    }

                }
            }
        } else {
            // 更新指定技能相关sv值
        }
        // hHero.OverrideSpecial = this.OverrideSpecialValue[player_id];

        CustomNetTables.SetTableValue("unit_special_value", tostring(player_id), hHero.MinorAbilityUpgrades);
        const KvBuff = hHero.FindModifierByName("modifier_custom_override");
        if (KvBuff) {
            KvBuff.ForceRefresh();
        }

        // 发送至客户端
        this.GetUpdateSpecialValue(player_id)
    }

    GetUpdateSpecialValue(player_id: PlayerID, params?: CGED["CustomOverrideAbility"]["GetUpdateSpecialValue"]) {
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "CustomOverrideAbility_UpdateSpecialValue",
            {
                data: this.OverrideSpecialValue[player_id]
            }
        )
    }

    GetOverrideKeyValue(player_id: PlayerID, override_key: OverrideSpecialKeyTypes) {

        // this.GetAbilityTypesAffixBonus(100, "Aoe", "skv_aoe_dmg",)
        return this.OverrideSpecialValue[player_id][override_key].cache_value
    }

    /**
     * 获得当前词条额外加成后的值
     * @param value 
     * @param skv_type 
     * @param hAbility 
     */
    GetTypesAffixValue<
        T1 extends keyof typeof SpecialvalueOfTable,
        T2 extends keyof typeof SpecialvalueOfTable[T1]
    >(flBaseValue: number, skv_affix: T1, skv_key: T2, hAbility: CDOTABaseAbility) {
        let skv_type = hAbility.custom_ability_types.skv_type[skv_affix]
        let player_id = hAbility.GetCaster().GetPlayerOwnerID();
        const OverrideSpecialValue = this.OverrideSpecialValue[player_id];
        // print('input value', value, "skv_affix", skv_affix, "skv_type", skv_type, "skv_key", skv_key)
        if (!skv_type) { return flBaseValue }
        // DeepPrintTable(OverrideSpecialValue)
        const row_data = this.OverrideSpecialValue[player_id][skv_key as string]
        if (row_data) {
            // let flBaseValue = value;
            let flAddResult = row_data.base_value;
            let flMulResult = row_data.mul_value;
            let flPercentResult = row_data.percent_value * 0.01;
            let flCorrResult = math.max(0, row_data.correct_value * 0.01);
            let flResult = math.floor((flBaseValue + flAddResult) * flPercentResult * flMulResult * flCorrResult);
            return flResult
        }
        return flBaseValue

    }

    Debug(cmd: string, args: string[], player_id: PlayerID) {
        if (cmd == "-coa") {
            this.ModifyOverrideSpecialValue(player_id, {
                "skv_aoe_radius": {
                    "Base": 10,
                    "Percent": 10,
                }
            })
        }
    }
}