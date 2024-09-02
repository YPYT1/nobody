import { BaseAbility, BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";
import * as TalentTreeConfig from "../../json/config/game/hero/talent_tree/talent_tree_config.json";


/** 通用天赋属性效果 */
@registerModifier()
export class modifier_talent_effect extends BaseModifier {

    caster: CDOTA_BaseNPC;
    player_id: PlayerID;
    ability: CDOTABaseAbility;
    object: { [talent: string]: AbilityValuesProps };

    timer_t44: number;
    IsHidden(): boolean { return true }
    IsPermanent(): boolean { return true }
    RemoveOnDeath(): boolean { return false }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();
        this.player_id = this.caster.GetPlayerOwnerID();
        this.object = {}

        // 部分定时器
        this.timer_t44 = 0;
        this.OnRefresh(params);
        this.StartIntervalThink(1)
    }


    InputAbilityValues(name: string, input: AbilityValuesProps): void {
        this.object[name] = input
    }

    GetObject<
        Key extends keyof typeof TalentTreeConfig,
        T2 extends typeof TalentTreeConfig[Key]
    >(name: Key, key: keyof T2["AbilityValues"]) {
        return this.object[name as string][key as string]
    }

    OnIntervalThink(): void {
        if (!this.caster.IsAlive()) { return }
        let caster_hp_pct = this.caster.GetHealthPercent();
        let caster_mp_pct = this.caster.GetManaPercent();

        // 26	追击	生命值高于%hp_heighest%%%，攻击速度提高%base_value%
        if (this.object['26']) {
            let hp_heighest = this.GetObject('26', 'hp_heighest');
            let base_value = this.GetObject('26', 'base_value');
            if (caster_hp_pct > hp_heighest) {
                // this.caster.SetAttributeInKey()
                GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'kv_t_26', {
                    'AttackSpeed': {
                        "Base": base_value
                    }
                })
            } else {
                GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'kv_t_26', {
                    'AttackSpeed': {
                        "Base": 0
                    }
                })
            }
        }

        // 39	全能	生命值大于50%时，最终伤害提升5%/10%/15%；生命值小于50%时，最终免伤降低5%/10%/15%。
        if (this.object['39']) {
            let hp_heighest = this.GetObject('39', 'hp_heighest');
            let find_dmg = this.GetObject('39', 'final_dmg');
            let final_reduction = this.GetObject('39', 'final_reduction');
            if (caster_hp_pct > hp_heighest) {
                GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'kv_t_39', {
                    'FinalDamageMul': {
                        "Base": find_dmg
                    },
                    'DmgReductionPct': {
                        "Base": 0
                    }
                })
            } else {
                GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'kv_t_39', {
                    'FinalDamageMul': {
                        "Base": 0
                    },
                    'DmgReductionPct': {
                        "Base": final_reduction
                    }
                })
            }
        }

        // 43	潜能激发	蓝量小于最大蓝量的20%/30%时，每秒恢复5点蓝量。
        if (this.object['39']) {
            let mana_low = this.GetObject("43", 'mana_low');
            if (caster_mp_pct < mana_low) {
                let res_mana = this.GetObject("43", "res_mana");
                GameRules.BasicRules.RestoreMana(this.caster, res_mana)
            }
        }


        // 44	治愈	每过5秒，回复4%/8%最大生命值。
        if (this.object['44']) {
            this.timer_t44 += 1;
            let interval = this.GetObject("44", "interval")
            if (this.timer_t44 >= interval) {
                this.timer_t44 = 0;
                let heal_maxhp_pct = this.GetObject("44", "heal_maxhp_pct")
                let heal_amount = this.caster.GetMaxHealth() * heal_maxhp_pct * 0.01
                GameRules.BasicRules.Heal(this.caster, heal_amount)
            }
        }
    }

    OnBeInjured(params: ApplyCustomDamageOptions) { }

    OnKillEvent(hTarget: CDOTA_BaseNPC) {

    }
}