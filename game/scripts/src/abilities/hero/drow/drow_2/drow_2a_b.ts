import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { modifier_drow_2a } from "./drow_2a";

/**
 * 2.穿透（3/3）:连续射击可穿透目标，伤害提高20%/40%/60%
2.1.刺骨《冰》（1/2）：技能赋予冰元素效果，伤害变为冰元素伤害。（2/2）：该技能冰元素减速效果增加至50%。
2.2.冰爆【范围型】（3/3）：连续射击命中被减速的敌人时，有12%概率发生冰爆，对范围300码敌人造成攻击力160%/200%/250%冰元素伤害。
 */
@registerAbility()
export class drow_2a_b extends BaseAbility {

    caster: CDOTA_BaseNPC;

    OnUpgrade(): void {
        this.caster = this.GetCaster();
    }

    GetIntrinsicModifierName(): string {
        return "modifier_drow_2a_b"
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: any): boolean | void {
        if (target) {
            let ability_damage = extraData.a;
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: ElementTypeEnum.ice,
                is_primary: true,
            })

            // 减速的敌人有概率触发冰爆
            let is_slowed = UnitIsSlowed(target);
            if (is_slowed && RollPercentage(12)) {
                let vPos = target.GetAbsOrigin()
                let effect_fx = ParticleManager.CreateParticle(
                    "particles/units/heroes/hero_drow/drow_frost_arrow_explosion.vpcf",
                    ParticleAttachment.CUSTOMORIGIN,
                    null
                );
                ParticleManager.SetParticleControl(effect_fx, 0, vPos);
                ParticleManager.SetParticleControl(effect_fx, 3, vPos);
                ParticleManager.ReleaseParticleIndex(effect_fx);
                let enemies = FindUnitsInRadius(
                    this.caster.GetTeam(),
                    vPos,
                    null,
                    300,
                    UnitTargetTeam.ENEMY,
                    UnitTargetType.BASIC + UnitTargetType.HERO,
                    UnitTargetFlags.NONE,
                    FindOrder.ANY,
                    false
                );
                let damage = this.caster.GetAverageTrueAttackDamage(null) * 1.6;
                for(let enemy of enemies){
                    ApplyCustomDamage({
                        victim: enemy,
                        attacker: this.caster,
                        damage: damage,
                        damage_type: DamageTypes.MAGICAL,
                        ability: this,
                        element_type: ElementTypeEnum.ice,
                        is_primary: true,
                    })
                }
            }
            return false
        }
    }
}

@registerModifier()
export class modifier_drow_2a_b extends modifier_drow_2a {


}