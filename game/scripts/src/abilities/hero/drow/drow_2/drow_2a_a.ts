import { StackModifier } from "../../../../modifier/extends/modifier_stack";
import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_2a, modifier_drow_2a } from "./drow_2a";

/**
 * 
1.连发（1/3）：连续射击的弓箭数量增加2/4/6支
13	击破	连续射击的每支箭都会使目标收到的伤害增加%value%%%，持续%duration%秒，最高%max_stack%层
14	风箭	技能赋予风元素效果，伤害变为风元素伤害。（风元素伤害增加15%。2级才显示）
（2/2）：风元素伤害增加15%。
 */
@registerAbility()
export class drow_2a_a extends drow_2a {

    talent_13: number;
    talent_14: number;
    max_stack: number = 0;
    GetIntrinsicModifierName(): string {
        return "modifier_drow_2a_a"
    }

    UpdataSpecialValue(): void {
        this.talent_14 = this.caster.hero_talent["14"] ?? 0;
        this.talent_13 = this.caster.hero_talent["13"] ?? 0;
        if (this.talent_13 > 0) {
            // rune_33	游侠#8	连续射击【击破】最大层数提高至30层
            if (this.caster.rune_level_index.hasOwnProperty("rune_33")) {
                this.max_stack = GameRules.RuneSystem.GetKvOfUnit(this.caster, "rune_33", "max_stack")
            } else {
                this.max_stack = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '13', 'max_stack');
            }
        }
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: ProjectileExtraData): boolean | void {
        if (target) {
            let ability_damage = extraData.a;
            let SelfAbilityMul = extraData.SelfAbilityMul;
            let DamageBonusMul = extraData.DamageBonusMul;

            if (this.talent_14 > 0) {
                let ElementDmgMul = extraData.ElementDmgMul;
                let damage_vect = Vector(extraData.x, extraData.y, 0);
                ApplyCustomDamage({
                    victim: target,
                    attacker: this.caster,
                    damage: ability_damage,
                    damage_type: DamageTypes.MAGICAL,
                    ability: this,
                    is_primary: true,
                    element_type: ElementTypes.WIND,
                    damage_vect: damage_vect,
                    SelfAbilityMul: SelfAbilityMul,
                    DamageBonusMul: DamageBonusMul,
                    ElementDmgMul: ElementDmgMul
                })
            } else {
                ApplyCustomDamage({
                    victim: target,
                    attacker: this.caster,
                    damage: ability_damage,
                    damage_type: DamageTypes.MAGICAL,
                    element_type: ElementTypes.NONE,
                    ability: this,
                    is_primary: true,
                    SelfAbilityMul: SelfAbilityMul,
                    DamageBonusMul: DamageBonusMul,
                })
            }

            if (this.talent_13 > 0) {
                target.AddNewModifier(this.caster, this, "modifier_drow_2a_a_debuff", {
                    init_stack: 1,
                    stack_add: 1,
                    max_stack: this.max_stack,
                    duration: 3,
                })
            }
            return true
        }
    }

}

@registerModifier()
export class modifier_drow_2a_a extends modifier_drow_2a {

    UpdataSpecialValue(): void {
        this.proj_count = this.ability.GetSpecialValueFor("proj_count")
            + GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "12", 'bonus_value');

        if (this.caster.hero_talent.hasOwnProperty("14")) {
            this.proj_name = G_PorjLinear.wind;
        }

        this.ElementDmgMul = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, '14', 'wind_dmg_pct')
    }
}

@registerModifier()
export class modifier_drow_2a_a_debuff extends StackModifier { }