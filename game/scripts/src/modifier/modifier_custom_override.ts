import { BaseModifier, registerModifier } from "../utils/dota_ts_adapter";

@registerModifier()
export class modifier_custom_override extends BaseModifier {

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
        this.bDirty = true;
        this.player_id = this.GetParent().GetPlayerOwnerID();
        if (IsServer()) {
            CustomNetTables.SetTableValue("unit_special_value", tostring(this.player_id), this.GetParent().OverrideSpecial);
        } else {
            this.GetParent().OverrideSpecial = CustomNetTables.GetTableValue("unit_special_value", tostring(this.player_id))
        }
    }

    OnRefresh(params: object): void {
        this.bDirty = true
        if (IsServer()) {
            CustomNetTables.SetTableValue("unit_special_value", tostring(this.player_id), this.GetParent().OverrideSpecial);
        } else {
            this.GetParent().OverrideSpecial = CustomNetTables.GetTableValue("unit_special_value", tostring(this.player_id))
        }
        // 更新缓存
        if (this.GetParent().OverrideSpecial != null) {
            for (let [_, Override] of pairs(this.GetParent().OverrideSpecial)) {
                DeepPrintTable(Override)
                if (Override && Override.cache_value != null) {
                    Override.cache_value = null
                }
            }
        }
    }


    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.OVERRIDE_ABILITY_SPECIAL,
            ModifierFunction.OVERRIDE_ABILITY_SPECIAL_VALUE,
        ]
    }

    GetModifierOverrideAbilitySpecial(event: ModifierOverrideAbilitySpecialEvent): 0 | 1 {
        // print("GetModifierOverrideAbilitySpecial:",event.ability.GetAbilityName())
        if (this.GetParent() == null || event.ability == null) { return 0; }
        // let ability_name = event.ability.GetAbilityName();
        let hOverrideSpecial = this.GetParent().OverrideSpecial
        if (hOverrideSpecial == null) {
            hOverrideSpecial = CustomNetTables.GetTableValue("unit_special_value", tostring(this.player_id))
        }
        if (hOverrideSpecial == null || hOverrideSpecial[event.ability_special_value] == null) {
            return 0
        }
        return 1
    }

    GetModifierOverrideAbilitySpecialValue(event: ModifierOverrideAbilitySpecialEvent): number {
        let sSpecialValueName = event.ability_special_value
        let nSpecialLevel = event.ability_special_level
        let flBaseValue = event.ability.GetLevelSpecialValueNoOverride(sSpecialValueName, nSpecialLevel);
        let hUpgrades = this.GetParent().OverrideSpecial
        if (hUpgrades == null) {
            hUpgrades = CustomNetTables.GetTableValue("unit_special_value", tostring(this.player_id))
        }
        // let sAbilityName = event.ability.GetAbilityName();
        if (hUpgrades == null || hUpgrades[sSpecialValueName] == null) {
            return flBaseValue
        } else {
            let SpecialValueUpgrades = hUpgrades[sSpecialValueName];
            // DeepPrintTable(SpecialValueUpgrades)
            if (this.bDirty == false && SpecialValueUpgrades.cache_value != null) {
                // print("load chace value", IsServer(), sSpecialValueName, SpecialValueUpgrades.cache_value)
                return SpecialValueUpgrades.cache_value
            }
            let flAddResult = SpecialValueUpgrades.base_value;
            let flMulResult = SpecialValueUpgrades.mul_value;
            let flCorrResult = math.max(0, SpecialValueUpgrades.correct_value * 0.01);
            let flResult = math.floor((flBaseValue + flAddResult) * flMulResult * flCorrResult)
            SpecialValueUpgrades.cache_value = flResult;
            this.bDirty = false;
            // print(
            //     "[GetModifierOverrideAbilitySpecialValue]:", IsServer(),
            //     event.ability.GetAbilityName(),
            //     event.ability_special_value,
            //     event.ability_special_level,
            //     flResult,
            // )
            return flResult
        }

    }
}