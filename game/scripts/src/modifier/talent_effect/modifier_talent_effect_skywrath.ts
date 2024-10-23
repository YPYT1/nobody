import { BaseAbility, BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";
import { modifier_talent_effect } from "./modifier_talent_effect";


/** 通用天赋属性效果 */
@registerModifier()
export class modifier_talent_effect_skywrath extends modifier_talent_effect {

    timer_zhiyu:number = 0;
    _OnCreated(): void {
        this.timer_zhiyu = 0
    }

    OnIntervalThink(): void {
        if (!this.caster.IsAlive()) { return }
        let caster_hp_pct = this.caster.GetHealthPercent();
        let caster_mp_pct = this.caster.GetManaPercent();

        // 99	全能	生命值大于50%时，最终伤害提升5%/10%/15%；生命值小于50%时，最终免伤降低5%/10%/15%。
        if (this.object['99']) {
            let hp_heighest = this.GetObject('99', 'hp_heighest');
            let find_dmg = this.GetObject('99', 'final_dmg');
            let final_reduction = this.GetObject('99', 'final_reduction');
            if (caster_hp_pct > hp_heighest) {
                GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'kv_t_99', {
                    'FinalDamageMul': {
                        "Base": find_dmg
                    },
                    'DmgReductionPct': {
                        "Base": 0
                    }
                })
            } else {
                GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'kv_t_99', {
                    'FinalDamageMul': {
                        "Base": 0
                    },
                    'DmgReductionPct': {
                        "Base": final_reduction
                    }
                })
            }
        }

        // 101	潜能激发	蓝量小于最大蓝量的20%/30%时，每秒恢复5点蓝量。
        if (this.object['101']) {
            let mana_low = this.GetObject("101", 'mana_low');
            if (caster_mp_pct < mana_low) {
                let res_mana = this.GetObject("101", "res_mana");
                GameRules.BasicRules.RestoreMana(this.caster, res_mana)
            }
        }


        // 102	治愈	每过5秒，回复4%/8%最大生命值。
        if (this.object['102']) {
            this.timer_zhiyu += 1;
            let interval = this.GetObject("102", "interval")
            if (this.timer_zhiyu >= interval) {
                this.timer_zhiyu = 0;
                let heal_maxhp_pct = this.GetObject("102", "heal_maxhp_pct")
                let heal_amount = this.caster.GetMaxHealth() * heal_maxhp_pct * 0.01
                GameRules.BasicRules.Heal(this.caster, heal_amount)
            }
        }
    }


    /** 触发暴击 */
    OnCriticalStrike(hTarget: CDOTA_BaseNPC) {
        // 112	贯通	暴击时，3秒内提高%value%%%的伤害加成。
        if (this.object["112"]) {
            let value = this.GetObject('112', 'value');
            let duration = this.GetObject('112', 'duration');
            GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'kv_t_53', {
                'DamageBonusMul': {
                    "Base": value,
                },
                
            }, duration)
        }
    }

    /** 触发闪避 */
    OnDodge(hAttacker: CDOTA_BaseNPC) {
        // 41	侥幸	闪避后立即回复%dogde_heal_loss%%%已损失生命值。
        if (this.object["41"]) {
            let dogde_heal_loss = this.GetObject('41', 'dogde_heal_loss');
            let heal_count = this.caster.GetHealthDeficit() * dogde_heal_loss * 0.01;
            GameRules.BasicRules.Heal(this.caster, heal_count)
        }
    }

    /** 击杀单位 */
    OnKillEvent(hTarget: CDOTA_BaseNPC) {

    }
}