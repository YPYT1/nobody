import { BaseModifier, registerModifier } from "./../utils/dota_ts_adapter";
import * as HeroTalentTree from "./../json/config/game/hero/talent_tree/talent_tree_config.json";

/** 天赋属性 */
@registerModifier()
export class modifier_talent_attribute extends BaseModifier {

    caster: CDOTA_BaseNPC;
    ability: CDOTABaseAbility;

    object: { [rune: string]: AbilityValuesProps };

    timer_t44: number;

    IsHidden(): boolean { return true }
    IsPermanent(): boolean { return true }
    RemoveOnDeath(): boolean { return false }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();
        this.object = {}

        this.timer_t44 = 0;
        this.OnRefresh(params);
        this.StartIntervalThink(1)
    }

    GetKV<
        Key extends keyof typeof HeroTalentTree,
        T2 extends typeof HeroTalentTree[Key]
    >(prop_name: Key, rune_key: keyof T2["AbilityValues"]) {
        return this.object[prop_name as string][rune_key as string]
    }

    InputAbilityValues(prop_name: string, rune_input: AbilityValuesProps): void {
        this.object[prop_name] = rune_input
    }

    Talent_OnKilled(hTarget: CDOTA_BaseNPC): void {
        // this.Prop_Object("prop_1", 'value')
        // this.Talent_Object("")
    }

    OnIntervalThink(): void {
        if (this.caster.IsAlive() == false) { return }
        let caster_hp_pct = this.caster.GetHealthPercent();
        let caster_mp_pct = this.caster.GetManaPercent();
        // 26	追击	生命值高于%hp_heighest%%%，攻击速度提高%base_value%
        if (this.caster.hero_talent.hasOwnProperty("26")) {
            let hp_heighest = this.GetKV("26", 'hp_heighest');
            let base_value = this.GetKV("26", 'base_value');
            if (caster_hp_pct > hp_heighest) {
                GameRules.CustomAttribute.SetAttributeInKey(this.caster, "talent_26", {
                    "AttackSpeed": {
                        "Base": base_value
                    }
                })
            } else {
                GameRules.CustomAttribute.SetAttributeInKey(this.caster, "talent_26", {
                    "AttackSpeed": {
                        "Base": 0
                    }
                })
            }
        }

        // 39	全能	生命值大于50%时，最终伤害提升5%/10%/15%；生命值小于50%时，最终免伤降低5%/10%/15%。
        if (this.caster.hero_talent.hasOwnProperty("39")) {
            let hp_heighest = this.GetKV("39", 'hp_heighest');
            let find_dmg = this.GetKV('39', 'final_dmg');
            let find_reduction = this.GetKV('39', 'final_reduction');
            if (caster_hp_pct > hp_heighest) {
                GameRules.CustomAttribute.SetAttributeInKey(this.caster, "talent_39", {
                    "FinalDamageMul": {
                        "Base": find_dmg
                    },
                    "DmgReductionPct": {
                        "Base": 0
                    }
                })
            } else {
                GameRules.CustomAttribute.SetAttributeInKey(this.caster, "talent_39", {
                    "FinalDamageMul": {
                        "Base": 0
                    },
                    "DmgReductionPct": {
                        "Base": find_reduction
                    }
                })
            }
        }
       

    }
}