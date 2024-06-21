import { reloadable } from "../../../utils/tstl-utils";
import * as SpecialKeyvalueJson from "./../../../json/config/game/special_keyvalue.json"
import * as AbilitiesArmsJson from "./../../../json/abilities/arms.json"
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";


declare type OverrideSpecialInputProps = {
    [primary in OverrideSpecialKeyTypes]?: {
        [type_key in OverrideSpecialBonusTypes]?: number
    }
}

const SpecialvalueOfTable: { [cate: string]: string[] } = {
    ["Missile"]: ["skv_missile_counts", "kv_missile_speed"],
    ["Aoe"]: ["skv_aoe_radius", "skv_aoe_set1"],

}
/** 修改技能 */
@reloadable
export class CustomOverrideAbility extends UIEventRegisterClass {

    OverrideSpecialMul: { [player: string]: OverrideSpecialObjectProps };
    OverrideSpecialValue: { [player: string]: OverrideSpecialValueProps };
    SpecialCategoryTable: { [cate: string]: string[] };

    // PlayerUpgradesTable:{}; // 玩家升级树
    constructor() {
        super("CustomOverrideAbility");
        // print("[CustomOverrideAbility]:constructor")
        this.OverrideSpecialMul = {};
        this.OverrideSpecialValue = {};


        this.SetArmsJson()
    }

    /** 初始化玩家的special key 值 */
    InitOverrideSpecialTable(player_id: PlayerID, hUnit: CDOTA_BaseNPC) {
        // hUnit.OverrideSpecial = {};
        hUnit.MinorAbilityUpgrades = {};
        this.OverrideSpecialMul[player_id] = {}
        this.OverrideSpecialValue[player_id] = {};
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

    /** 更新技能表 */
    UpdateOverrideAbility(hUnit: CDOTA_BaseNPC, sAbilityName: string) {
        let MinorAbilityUpgrades = hUnit.MinorAbilityUpgrades;
        let hLastAbilityList = Object.keys(MinorAbilityUpgrades);
        let hCurrentAbilityList: string[] = [];
        for (let i = 0; i < 6; i++) {
            let hAbility = hUnit.GetAbilityByIndex(i);
            if (hAbility == null) { continue };
            let ability_state = (hAbility.GetBehaviorInt() & AbilityBehavior.NOT_LEARNABLE) != AbilityBehavior.NOT_LEARNABLE;
            let ability_name = hAbility.GetAbilityName();
            if (ability_state) {
                hCurrentAbilityList.push(ability_name);
            }

        }

        // 先移除不存在的技能
        for (let last_ability of hLastAbilityList) {
            // 当前6个技能里面没有该技能时.移除
            if (hCurrentAbilityList.indexOf(last_ability) == -1) {
                MinorAbilityUpgrades[last_ability] = null;
            }
        }

        // 加入新的技能
        if (MinorAbilityUpgrades[sAbilityName] == null) {
            MinorAbilityUpgrades[sAbilityName] = {};
            // 根据技能类型加入对应的kv监听
            let hKvData = AbilitiesArmsJson[sAbilityName as keyof typeof AbilitiesArmsJson];
            if (hKvData) {
                let sCategoryString = hKvData.Category;
                if (sCategoryString != "Null") {
                    let category_list = sCategoryString.split(",");
                    for (let cate of category_list) {
                        let override_key_list = this.SpecialCategoryTable[cate];
                        for (let override_key of override_key_list) {
                            MinorAbilityUpgrades[sAbilityName][override_key] = {
                                base_value: 0,
                                mul_value: 1,
                                percent_value: 100,
                                // result_value: 0,
                                correct_value: 100,
                            }
                        }
                    }
                }
            }
        }

        this.UpdateSpecialValue(hUnit.GetPlayerOwnerID());
    }



    ModifyOverrideSpecialValue(player_id: PlayerID, special_input: OverrideSpecialInputProps) {
        for (let override_key in special_input) {
            if (this.OverrideSpecialMul[player_id][override_key] == null) {
                this.OverrideSpecialMul[player_id][override_key] = { mul_list: [], }

                this.OverrideSpecialValue[player_id][override_key] = {
                    base_value: 0,
                    mul_value: 1,
                    percent_value: 100,
                    // result_value: 0,
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
                this.OverrideSpecialMul[player_id][override_key].mul_list.push(mul_input)
                let mul_value = 1;
                for (let row_value of this.OverrideSpecialMul[player_id][override_key].mul_list) {
                    mul_value *= row_value;
                }
                this.OverrideSpecialValue[player_id][override_key].mul_value = mul_value
            }
            if (RowInput.Correct) {
                this.OverrideSpecialValue[player_id][override_key].correct_value += RowInput.Correct
            }
        }
        this.UpdateSpecialValue(player_id);
    }

    // CustomOverrideAbility_
    /**
    * 更新技能SV值
    * @param player_id 
    */
    UpdateSpecialValue(player_id: PlayerID) {
        const hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        let MinorAbilityUpgrades = hHero.MinorAbilityUpgrades;
        const OverrideSpecialValue = this.OverrideSpecialValue[player_id];
        for (let override_key in OverrideSpecialValue) {
            const row_kv_data = OverrideSpecialValue[override_key];
     
            for (let ability_name in MinorAbilityUpgrades) {
                let row_ability_data = MinorAbilityUpgrades[ability_name];
                DeepPrintTable(row_ability_data[override_key])
                
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
        return this.OverrideSpecialValue[player_id][override_key].cache_value
    }

    Debug(cmd: string, args: string[], player_id: PlayerID) {
        if (cmd == "-amrs2") {
            this.ModifyOverrideSpecialValue(player_id, {
                "skv_summon_duration": {
                    "Percent": 10,
                }
            })
        }
    }
}