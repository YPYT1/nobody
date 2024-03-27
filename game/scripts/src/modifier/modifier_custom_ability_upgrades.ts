import { BaseModifier, registerModifier } from "../utils/dota_ts_adapter";

@registerModifier()
export class modifier_custom_ability_upgrades extends BaseModifier {

    bDirty: boolean;
    player_id: PlayerID;

    IsHidden(): boolean {
        return true
    }

    IsPermanent(): boolean {
        return true
    }

    RemoveOnDeath(): boolean {
        return false
    }

    OnCreated(params: object): void {
        print("sv create", IsServer());
        this.bDirty = true;
        this.player_id = this.GetParent().GetPlayerOwnerID();
        if (IsServer()) {
            CustomNetTables.SetTableValue("unit_special_value", tostring(this.player_id), this.GetParent().AbilityUpgrades);
        } else {
            this.GetParent().AbilityUpgrades = CustomNetTables.GetTableValue("unit_special_value", tostring(this.player_id))
        }
    }

    OnRefresh(params: object): void {
        this.bDirty = true
        if (IsServer()) {
            CustomNetTables.SetTableValue("unit_special_value", tostring(this.player_id), this.GetParent().AbilityUpgrades);
        } else {
            this.GetParent().AbilityUpgrades = CustomNetTables.GetTableValue("unit_special_value", tostring(this.player_id))
        }
        // 更新缓存
        if (this.GetParent().AbilityUpgrades != null) {
            for (let [_, Upgrade] of pairs(this.GetParent().AbilityUpgrades)) {
                if (Upgrade) {
                    for (let [__, special_key] of pairs(Upgrade)) {
                        if (special_key && special_key.cache_value != null) {
                            special_key.cache_value = null
                        }
                    }
                }
            }
        }
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.OVERRIDE_ABILITY_SPECIAL,
            ModifierFunction.OVERRIDE_ABILITY_SPECIAL_VALUE,
            ModifierFunction.CHANGE_ABILITY_VALUE,
        ]
    }

    GetModifierChangeAbilityValue() {
        print("GetModifierChangeAbilityValue")

    }

    GetModifierOverrideAbilitySpecial(event: ModifierOverrideAbilitySpecialEvent): 0 | 1 {
        // print("GetModifierOverrideAbilitySpecial:",event.ability.GetAbilityName())
        if (this.GetParent() == null || event.ability == null) { return 0; }
        if (event.ability_special_value == "test_value") {
            return 1
        }
        return 0
        // let ability_name = event.ability.GetAbilityName();
        // let hUpgrades = this.GetParent().AbilityUpgrades
        // if (hUpgrades == null) {
        //     hUpgrades = CustomNetTables.GetTableValue("unit_special_value", tostring(this.player_id))
        // }
        // if (hUpgrades == null || hUpgrades[ability_name] == null) {
        //     return 0
        // }
        // if (hUpgrades[ability_name][event.ability_special_value] == null) {
        //     return 0
        // }
        // return 1
    }

    GetModifierOverrideAbilitySpecialValue(event: ModifierOverrideAbilitySpecialEvent): number {
        print("GetModifierOverrideAbilitySpecialValue", event.ability_special_value);
        let sSpecialValueName = event.ability_special_value
        let nSpecialLevel = event.ability_special_level
        let flBaseValue = event.ability.GetLevelSpecialValueNoOverride(sSpecialValueName, nSpecialLevel);

        return flBaseValue + 200;
        // let hUpgrades = this.GetParent().AbilityUpgrades
        // if (hUpgrades == null) {
        //     hUpgrades = CustomNetTables.GetTableValue("unit_special_value", tostring(this.player_id))
        // }

        // let sAbilityName = event.ability.GetAbilityName();
        // if (hUpgrades == null || hUpgrades[sAbilityName] == null) {
        //     return 0
        // }
        // let sSpecialValueName = event.ability_special_value
        // let nSpecialLevel = event.ability_special_level
        // let flBaseValue = event.ability.GetLevelSpecialValueNoOverride(sSpecialValueName, nSpecialLevel);
        // let SpecialValueUpgrades = hUpgrades[sAbilityName][sSpecialValueName];
        // if (SpecialValueUpgrades != null) {
        //     if (this.bDirty == false && SpecialValueUpgrades.cache_value != null) {
        //         // print("load chace value", IsServer(), sAbilityName, sSpecialValueName, SpecialValueUpgrades.cache_value)
        //         return SpecialValueUpgrades.cache_value
        //     }

        //     let flAddResult = SpecialValueUpgrades.base_value;
        //     let flMulResult = SpecialValueUpgrades.mul_value;
        //     let flResult = (flBaseValue + flAddResult) * flMulResult
        //     SpecialValueUpgrades.cache_value = flResult;
        //     this.bDirty = false;
        //     // print("update value:", IsServer(), sAbilityName, sSpecialValueName, flResult)
        //     return flResult
        // }
        // // print(
        // //     "[GetModifierOverrideAbilitySpecialValue]:", IsServer(),
        // //     event.ability.GetAbilityName(), event.ability_special_value, event.ability_special_level, base_value)
        // return flBaseValue
    }
}