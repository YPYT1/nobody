import { reloadable } from "../../../utils/tstl-utils";

import * as AbilitiesArms from "../../../json/abilities/arms.json";
import * as ArmsComboJson from "../../../json/config/game/arms_combo.json";

/** 技能组合 */
@reloadable
export class ArmsCombo {

    /** 组合技能表 */
    ComboAbilityTable: { [comb_key: string]: string[] };
    /** 玩家组合羁绊 */
    PlayerComboState: string[][];

    constructor() {
        this.InitAbilityCombo()
    }

    InitAbilityCombo() {
        this.ComboAbilityTable = {};
        this.PlayerComboState = [];
        for (let i = 0; i < 6; i++) {
            this.PlayerComboState.push([])
        }
        for (let name in AbilitiesArms) {
            let row_data = AbilitiesArms[name as "arms_t0_1"];
            if (row_data && row_data.Combo) {
                let ComboSets = `${row_data.Combo}`.split(" ");
                for (let combo_str of ComboSets) {
                    let combe_key = combo_str.split(",")
                    for (let key of combe_key) {
                        if (this.ComboAbilityTable[key] == null) {
                            this.ComboAbilityTable[key] = []
                        }
                        this.ComboAbilityTable[key].push(name)
                    }
                }
            }
        }
    }

    GetAbilityCombo(ability_name: string) {
        let abilityData = AbilitiesArms[ability_name as "arms_t0_1"];
        if (abilityData && abilityData.Combo) {
            return `${abilityData.Combo}`.split(",");
        }
        return []
    }

    AddComboAbility(hUnit: CDOTA_BaseNPC, ability_name: string) {
        let player_id = hUnit.GetPlayerOwnerID();
        let combo_list = this.GetAbilityCombo(ability_name);
        let ability_list: string[] = [];
        for (let i = 0; i < 6; i++) {
            let hAbility = hUnit.GetAbilityByIndex(i);
            if (hAbility) {
                ability_list.push(hAbility.GetAbilityName())
            }
        }
        for (let combo_key of combo_list) {
            this.AddCheckComboSets(player_id, hUnit, combo_key, ability_list)
        }
    }

    AddCheckComboSets(player_id: PlayerID, hUnit: CDOTA_BaseNPC, combo_key: string, ability_list: string[]) {
        if (this.PlayerComboState[player_id].indexOf(combo_key) == -1) {
            // 没有.进行技能验证
            let combo_state = true;
            let combo_ability_list = this.ComboAbilityTable[combo_key];
            for (let need_combo of combo_ability_list) {
                if (ability_list.indexOf(need_combo) == -1) {
                    // 失败
                    combo_state = false;
                    break
                }
            }
            if (combo_state) {
                this.PlayerComboState[player_id].push(combo_key);
                // 增加羁绊 MDF
                this.AddComboModifier(hUnit, combo_key)
            }
        }
        // DeepPrintTable(this.PlayerComboState[player_id])
    }

    RemoveCheckComboSets(hUnit: CDOTA_BaseNPC, RemoveAbility: CDOTABaseAbility) {
        let player_id = hUnit.GetPlayerOwnerID();
        let ability_list: string[] = [];
        for (let i = 0; i < 6; i++) {
            let hAbility = hUnit.GetAbilityByIndex(i);
            if (hAbility && hAbility != RemoveAbility) {
                ability_list.push(hAbility.GetAbilityName())
            }
        }
        let combo_state_object: { [combo_key: string]: boolean } = {}
        for (let combo_key of this.PlayerComboState[player_id]) {
            // print("combo_key", combo_key, this.PlayerComboState[player_id].length)
            let combo_ability_list = this.ComboAbilityTable[combo_key];
            combo_state_object[combo_key] = true
            for (let need_combo of combo_ability_list) {
                if (ability_list.indexOf(need_combo) == -1) {
                    combo_state_object[combo_key] = false
                    break
                }
            }

        }
        // DeepPrintTable(combo_state_object)
        for (let combo_key in combo_state_object) {
            let combo_state = combo_state_object[combo_key];
            if (combo_state == false) {
                let index = this.PlayerComboState[player_id].indexOf(combo_key);
                this.PlayerComboState[player_id].splice(index, 1);
                // 移除羁绊 Mdf
                this.RemoveComboModifier(hUnit, combo_key)
            }
        }

        // DeepPrintTable(this.PlayerComboState[player_id])
    }

    AddComboModifier(hUnit: CDOTA_BaseNPC, combo_key: string) {
        const mdf_name = "modifier_arms_combo_" + combo_key
        GameRules.BuffManager.AddPermanentMdf(hUnit, hUnit, null, mdf_name, {})
    }

    RemoveComboModifier(hUnit: CDOTA_BaseNPC, combo_key: string) {
        const mdf_name = "modifier_arms_combo_" + combo_key
        hUnit.RemoveModifierByName(mdf_name)
    }

    DebugChat(cmd: string, args: string[], player_id: PlayerID) {
        if (cmd == "-combo") {
            DeepPrintTable(this.PlayerComboState[player_id])
        }
    }
}