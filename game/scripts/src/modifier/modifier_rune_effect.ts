import { BaseAbility, BaseModifier, registerModifier } from "../utils/dota_ts_adapter";
import * as RuneConfig from "../json/config/game/rune/rune_config.json";

type runeName = keyof typeof RuneConfig;

/** 符文效果 */
@registerModifier()
export class modifier_rune_effect extends BaseModifier {

    caster: CDOTA_BaseNPC;
    ability: CDOTABaseAbility ;

    _rune_object: { [rune: string]: AbilityValuesProps };

    IsHidden(): boolean { return true }
    IsPermanent(): boolean { return true }
    RemoveOnDeath(): boolean { return false }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();
        this._rune_object = {}
        this.OnRefresh(params);
        this.StartIntervalThink(1)
    }

    Rune_InputAbilityValues(rune_name: string, rune_input: AbilityValuesProps): void {
        this._rune_object[rune_name] = rune_input
    }

    OnRefresh(params: any): void {

        // this.caster.rune_passive_type[""]

        // 更新符文效果

    }

    Rune_OnKilled(hTarget: CDOTA_BaseNPC): void {
        // 通用符文11	击杀敌人时有15%概率获得5%/10%/15%伤害加成，持续5秒，最高5层
        if (this._rune_object["rune_11"]) {
            let chance = this.Rune_Object("rune_11", 'chance');
            let value = this.Rune_Object('rune_11', 'bp_ingame');
            let duration = this.Rune_Object('rune_11', 'duration');
            
            this.caster.AddNewModifier(this.caster, this.ability, "rune_11", {
                duration: duration
            })
        }
    }

    Rune_Object<
        Key extends keyof typeof RuneConfig,
        T2 extends typeof RuneConfig[Key]
    >(rune_name: Key, rune_key: keyof T2["AbilityValues"]) {
        return this._rune_object[rune_name as string][rune_key as string]
    }

    OnIntervalThink(): void {

    }
}