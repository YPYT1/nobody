import { reloadable } from "../../../utils/tstl-utils";
import * as SpecialKeyvalueJson from "./../../../json/config/game/special_keyvalue.json"



declare type OverrideSpecialInputProps = {
    [primary in OverrideSpecialKeyTypes]?: {
        [type_key in OverrideSpecialBonusTypes]?: number
    }
}

/** 修改技能 */
@reloadable
export class CustomOverrideAbility {

    OverrideSpecialMul: { [player: string]: OverrideSpecialObjectProps };
    OverrideSpecialValue: { [player: string]: OverrideSpecialValueProps };

    // PlayerUpgradesTable:{}; // 玩家升级树
    constructor() {
        print("[CustomOverrideAbility]:constructor")
        this.OverrideSpecialMul = {}
        this.OverrideSpecialValue = {}
    }

    /** 初始化玩家的special key 值 */
    InitOverrideSpecialTable(player_id: PlayerID, hUnit: CDOTA_BaseNPC) {
        hUnit.OverrideSpecial = {};
        this.OverrideSpecialMul[player_id] = {}
        this.OverrideSpecialValue[player_id] = {};
        CustomNetTables.SetTableValue("unit_special_value", tostring(player_id), hUnit.OverrideSpecial);
        hUnit.AddNewModifier(hUnit, null, "modifier_custom_override", {})
    }


    ModifyOverrideSpecialValue(player_id: PlayerID, special_input: OverrideSpecialInputProps) {
        for (let override_key in special_input) {
            if (this.OverrideSpecialMul[player_id][override_key] == null) {
                this.OverrideSpecialMul[player_id][override_key] = {
                    mul_list: [],
                }

                this.OverrideSpecialValue[player_id][override_key] = {
                    base_value: 0,
                    mul_value: 1,
                    // result_value: 0,
                    correct_value: 100,
                }
            }

            let RowInput = special_input[override_key];
            if (RowInput.Base) { this.OverrideSpecialValue[player_id][override_key].base_value += RowInput.Base }
            if (RowInput.Percent) {
                let mul_input = (100 + RowInput.Percent) * 0.01
                this.OverrideSpecialMul[player_id][override_key].mul_list.push(mul_input)
                let mul_value = 1;
                for (let row_value of this.OverrideSpecialMul[player_id][override_key].mul_list) {
                    mul_value *= row_value;
                }
                this.OverrideSpecialValue[player_id][override_key].mul_value = mul_value
            }
            if (RowInput.Correct) {
                this.OverrideSpecialValue[player_id][override_key].cache_value += RowInput.Correct
            }

        }

        this.UpdateUpgradeStatus(player_id)
    }

    /**
    * 更新技能SV值
    * @param player_id 
    */
    UpdateUpgradeStatus(player_id: PlayerID) {
        const hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        hHero.OverrideSpecial = this.OverrideSpecialValue[player_id];
        CustomNetTables.SetTableValue("unit_special_value", tostring(player_id), hHero.OverrideSpecial);
        const KvBuff = hHero.FindModifierByName("modifier_custom_override");
        if (KvBuff) {
            KvBuff.ForceRefresh()
        }
    }

    GetOverrideKeyValue(player_id: PlayerID, override_key: OverrideSpecialKeyTypes) {
        return this.OverrideSpecialValue[player_id][override_key].cache_value
    }

    Debug(cmd: string, args: string[], player_id: PlayerID) {
        if (cmd == "-amrs2") {
            // this.ModifyOverrideSpecialValue(0, {
            //     "summoned_duration":{
            //         Base:
            //     }
            // })
        }
    }
}