import { modifier_element_effect_fire } from "../../../../modifier/modifier_element";
import { registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_3b, modifier_drow_3b, modifier_drow_3b_thinker, modifier_drow_3b_thinker_arrow } from "./drow_3b";


/**
 *
 *  35	燃矢	"箭雨技能赋予火元素效果，伤害变为火元素伤害。（2级触发灼烧伤害持续时间延长2秒，伤害增加攻击力25%。）
 * 36	焚身	箭雨对被灼烧的敌人造成伤害提高%extra_dmg_pct%%%
 */
@registerAbility()
export class drow_3b_a extends drow_3b {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_3b_a"
    }

}

@registerModifier()
export class modifier_drow_3b_a extends modifier_drow_3b {

    mdf_thinker = "modifier_drow_3b_a_thinker";
}

@registerModifier()
export class modifier_drow_3b_a_thinker extends modifier_drow_3b_thinker {

    extra_dmg_pct: number = 0;
    is_primary: boolean
    dot_duration: number = 0;
    interval_increase: number;
    arrow_thinker = "modifier_drow_3b_thinker_arrow_fire";

    OnCreated_Extends(): void {
        this.element_type = ElementTypes.FIRE;
        let extra_dmg_pct = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.GetCaster(), "drow_ranger", "36", "extra_dmg_pct")
        if (extra_dmg_pct > 0) {
            this.extra_dmg_pct = this.ability.GetTypesAffixValue(extra_dmg_pct, "Buff", "skv_buff_increase");
        }
        let level = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.GetCaster(), "drow_ranger", "35", "level");
        this.is_primary = level < 2;
        // rune_45	游侠#20	箭雨【燃矢】灼烧伤害提升至200%，持续时间延长至10秒
        if (this.caster.rune_level_index.hasOwnProperty("rune_45")) {
            this.dot_duration = GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_45', 'rs_duration');
        } else {
            // drow_35 燃烧
            this.dot_duration = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, 'drow_ranger', '35', 'burn_duration');
        }
        this.dot_duration += this.caster.custom_attribute_value["BurningDuration"];

        this.interval_increase = this.ability.GetTypesAffixValue(100, "Dot", "skv_dot_interval")

    }

    DoDamageTarget(target: CDOTA_BaseNPC, ability_damage: number): void {
        target.SetContextThink(DoUniqueString("drow3_b_delay"), () => {
            if (!target.IsAlive()) { return null }
            let hCaster = this.GetCaster()
            let DamageBonusMul = this.DamageBonusMul;
            if (this.extra_dmg_pct > 0 && target.HasModifier("modifier_element_effect_fire")) {
                DamageBonusMul += this.extra_dmg_pct
            }
            ApplyCustomDamage({
                victim: target,
                attacker: hCaster,
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                element_type: this.element_type,
                ability: this.GetAbility(),
                is_primary: this.is_primary,
                SelfAbilityMul: this.SelfAbilityMul,
                DamageBonusMul: DamageBonusMul,
                // bp_ingame: this.bp_ingame + bp_ingame,
                // bp_server: this.bp_server,
            });
            if (!this.is_primary) {
                // 添加强灼烧
                target.AddNewModifier(hCaster, this.GetAbility(), "modifier_drow_3b_a_dot", {
                    duration: this.dot_duration,
                    interval_increase: this.interval_increase,
                })
            }
            return null
        }, 0.3)
    }
}

@registerModifier()
export class modifier_drow_3b_a_thinker_arrow extends modifier_drow_3b_thinker_arrow {

    arrow_name = "particles/dev/attack/attack_flame/attack_flame_1.vpcf";

}

// 强化灼烧
@registerModifier()
export class modifier_drow_3b_a_dot extends modifier_element_effect_fire {

    OnRefresh(params: any): void {
        if (!IsServer()) { return }
        let base_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, 'drow_ranger', '35', 'burn_dmg')
        // rune_45	游侠#20	箭雨【燃矢】灼烧伤害提升至200%，持续时间延长至10秒
        if (this.caster.rune_level_index.hasOwnProperty("rune_45")) {
            base_value = GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_45', 'rs_to_dmg')
        }
        base_value += this.caster.custom_attribute_value["BurningDmg"]
        this.dot_damage = math.floor(this.caster.GetAverageTrueAttackDamage(null) * base_value * 0.01);
    }

}