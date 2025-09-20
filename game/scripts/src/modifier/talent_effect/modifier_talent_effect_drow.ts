import { BaseAbility, BaseModifier, registerModifier } from '../../utils/dota_ts_adapter';
import { modifier_talent_effect } from './modifier_talent_effect';

/** 通用天赋属性效果 */
@registerModifier()
export class modifier_talent_effect_drow extends modifier_talent_effect {
    timer_t44: number;

    _OnCreated() {
        this.timer_t44 = 0;
    }

    OnIntervalThink(): void {
        if (!this.caster.IsAlive()) {
            return;
        }
        const caster_hp_pct = this.caster.GetHealthPercent();
        const caster_mp_pct = this.caster.GetManaPercent();

        // 26	追击	生命值高于%hp_heighest%%%，攻击速度提高%base_value%
        if (this.object['26']) {
            const hp_heighest = this.GetObject('26', 'hp_heighest');
            const base_value = this.GetObject('26', 'base_value');
            if (caster_hp_pct > hp_heighest) {
                // this.caster.SetAttributeInKey()
                GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'kv_t_26', {
                    AttackSpeed: {
                        Base: base_value,
                    },
                });
            } else {
                GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'kv_t_26', {
                    AttackSpeed: {
                        Base: 0,
                    },
                });
            }
        }

        // 39	全能	生命值大于50%时，最终伤害提升5%/10%/15%；生命值小于50%时，最终免伤降低5%/10%/15%。
        if (this.object['39']) {
            const hp_heighest = this.GetObject('39', 'hp_heighest');
            const find_dmg = this.GetObject('39', 'final_dmg');
            const final_reduction = this.GetObject('39', 'final_reduction');
            if (caster_hp_pct > hp_heighest) {
                GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'kv_t_39', {
                    FinalDamageMul: {
                        Base: find_dmg,
                    },
                    DmgReductionPct: {
                        Base: 0,
                    },
                });
            } else {
                GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'kv_t_39', {
                    FinalDamageMul: {
                        Base: 0,
                    },
                    DmgReductionPct: {
                        Base: final_reduction,
                    },
                });
            }
        }

        // 43	潜能激发	蓝量小于最大蓝量的20%/30%时，每秒恢复5点蓝量。
        if (this.object['43']) {
            const mana_low = this.GetObject('43', 'mana_low');
            if (caster_mp_pct < mana_low) {
                const res_mana = this.GetObject('43', 'res_mana');
                GameRules.BasicRules.RestoreMana(this.caster, res_mana);
            }
        }

        // 44	治愈	每过5秒，回复4%/8%最大生命值。
        if (this.object['44']) {
            this.timer_t44 += 1;
            const interval = this.GetObject('44', 'interval');
            if (this.timer_t44 >= interval) {
                this.timer_t44 = 0;
                const heal_maxhp_pct = this.GetObject('44', 'heal_maxhp_pct');
                const heal_amount = this.caster.GetMaxHealth() * heal_maxhp_pct * 0.01;
                GameRules.BasicRules.Heal(this.caster, heal_amount);
            }
        }
    }

    /** 触发暴击 */
    OnCriticalStrike(hTarget: CDOTA_BaseNPC) {
        // 53	追猎	暴击后提高%add_as_pct%%%攻速和%add_mv_pct%%%移速，持续2秒。
        if (this.object['53']) {
            const add_as_pct = this.GetObject('53', 'add_as_pct');
            const add_mv_pct = this.GetObject('53', 'add_mv_pct');
            const duration = this.GetObject('53', 'duration');
            GameRules.CustomAttribute.SetAttributeInKey(
                this.caster,
                'kv_t_53',
                {
                    AttackSpeed: {
                        Base: add_as_pct,
                    },
                    MoveSpeed: {
                        BasePercent: add_mv_pct,
                    },
                },
                duration
            );
        }
    }

    /** 触发闪避 */
    OnDodge(hAttacker: CDOTA_BaseNPC) {
        // 41	侥幸	闪避后立即回复%dogde_heal_loss%%%已损失生命值。
        if (this.object['41']) {
            const dogde_heal_loss = this.GetObject('41', 'dogde_heal_loss');
            const heal_count = this.caster.GetHealthDeficit() * dogde_heal_loss * 0.01;
            GameRules.BasicRules.Heal(this.caster, heal_count);
        }
    }

    /** 击杀单位 */
    OnKillEvent(hTarget: CDOTA_BaseNPC) {}
}
