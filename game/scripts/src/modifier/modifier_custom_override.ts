import { BaseModifier, registerModifier } from '../utils/dota_ts_adapter';

@registerModifier()
export class modifier_custom_override extends BaseModifier {
    bDirty: boolean;
    player_id: PlayerID;
    hParent: CDOTA_BaseNPC;

    IsHidden(): boolean {
        return true;
    }

    IsPermanent(): boolean {
        return true;
    }

    RemoveOnDeath(): boolean {
        return false;
    }

    OnCreated(params: object): void {
        this.bDirty = true;
        this.hParent = this.GetParent();
        this.player_id = this.GetParent().GetPlayerOwnerID();
        if (IsServer()) {
            CustomNetTables.SetTableValue('unit_special_value', tostring(this.player_id), this.GetParent().MinorAbilityUpgrades);
        } else {
            this.GetParent().MinorAbilityUpgrades = CustomNetTables.GetTableValue('unit_special_value', tostring(this.player_id));
        }
    }

    OnRefresh(params: object): void {
        this.bDirty = true;
        // print("OnRefresh", IsServer(), this.bDirty)
        if (IsServer()) {
            CustomNetTables.SetTableValue('unit_special_value', tostring(this.player_id), this.GetParent().MinorAbilityUpgrades);
        } else {
            this.GetParent().MinorAbilityUpgrades = CustomNetTables.GetTableValue('unit_special_value', tostring(this.player_id));
        }
        // 更新缓存
        // if (this.GetParent().MinorAbilityUpgrades != null) {
        //     for (let [_, Override] of pairs(this.GetParent().MinorAbilityUpgrades)) {
        //         // DeepPrintTable(Override)
        //         if (Override && Override.cache_value != null) {
        //             Override.cache_value = null
        //         }
        //     }
        // }
    }

    // DeclareFunctions(): ModifierFunction[] {
    //     return [
    //         ModifierFunction.OVERRIDE_ABILITY_SPECIAL,
    //         ModifierFunction.OVERRIDE_ABILITY_SPECIAL_VALUE,
    //         ModifierFunction.COOLDOWN_PERCENTAGE,
    //     ]
    // }

    GetModifierOverrideAbilitySpecial(event: ModifierOverrideAbilitySpecialEvent): 0 | 1 {
        // print("GetModifierOverrideAbilitySpecial:",event.ability.GetAbilityName())
        if (this.GetParent() == null || event.ability == null) {
            return 0;
        }
        const szAbilityName = event.ability.GetAbilityName();
        let hUpgrades = this.GetParent().MinorAbilityUpgrades;
        if (hUpgrades == null) {
            hUpgrades = CustomNetTables.GetTableValue('unit_special_value', tostring(this.player_id));
        }
        const szSpecialValueName = event.ability_special_value;
        if (hUpgrades == null || hUpgrades[szAbilityName] == null) {
            return 0;
        }

        if (hUpgrades[szAbilityName][szSpecialValueName] == null) {
            return 0;
        }
        return 1;
    }

    GetModifierOverrideAbilitySpecialValue(event: ModifierOverrideAbilitySpecialEvent): number {
        let hUpgrades = this.GetParent().MinorAbilityUpgrades;
        if (hUpgrades == null) {
            hUpgrades = CustomNetTables.GetTableValue('unit_special_value', tostring(this.player_id));
        }

        const sSpecialValueName = event.ability_special_value;
        const nSpecialLevel = event.ability_special_level;
        const szAbilityName = event.ability.GetAbilityName();
        const flBaseValue = event.ability.GetLevelSpecialValueNoOverride(sSpecialValueName, nSpecialLevel);
        // let sAbilityName = event.ability.GetAbilityName();
        if (hUpgrades == null || hUpgrades[szAbilityName] == null) {
            return 0;
        }
        const SpecialValueUpgrades = hUpgrades[szAbilityName][sSpecialValueName];
        if (SpecialValueUpgrades != null) {
            if (SpecialValueUpgrades.cache_value != null) {
                // print("cache_value", IsServer(), szAbilityName, sSpecialValueName, SpecialValueUpgrades.cache_value)
                return SpecialValueUpgrades.cache_value;
            }
            // let flAddResult = SpecialValueUpgrades.base_value;
            // let flMulResult = SpecialValueUpgrades.mul_value;
            // let flPercentResult = SpecialValueUpgrades.percent_value * 0.01;
            // let flCorrResult = math.max(0, SpecialValueUpgrades.correct_value * 0.01);
            // let flResult = math.floor((flBaseValue + flAddResult) * flPercentResult * flMulResult * flCorrResult)
            // SpecialValueUpgrades.cache_value = flResult;
            // this.bDirty = false;
            // return flResult;
        }

        return flBaseValue;
    }

    // GetModifierPercentageCooldown(event: ModifierAbilityEvent): number {
    //     if (this.hParent == null || event.ability == null) { return 100; }
    //     // let hAbility = event.ability;
    //     // print("GetModifierPercentageCooldown", this.player_id, IsServer(), event.ability.GetAbilityName())
    //     // let skv_haste = GameRules.CustomOverrideAbility.GetOverrideKeyValue(this.player_id, "skv_haste");
    //     return 100
    // }
}
