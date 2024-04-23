import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 范围雷击	"召唤一道闪电打击范围直径325码的敌
方单位，造成伤害及短暂眩晕0.5秒。
cd：4秒
伤害系数：攻击力300%·雷元素伤害
作用范围：施法距离750码"

 */
@registerAbility()
export class arms_69 extends BaseArmsAbility {

    stun_duration: number;

    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource("particle", "particles/units/heroes/hero_zuus/zuus_lightning_bolt.vpcf", context)
        PrecacheResource("particle", "particles/units/heroes/hero_zuus/zuus_lightning_bolt_aoe.vpcf", context)
    }

    _OnUpdateKeyValue(): void {
        this.stun_duration = this.GetSpecialValueFor("stun_duration")
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart(): void {
        let ability_damage = this.GetAbilityDamage();
        let aoe_radius = this.GetSpecialValueFor("aoe_radius");
        let vTarget = this.FindRandomEnemyVect();

        let enemies = FindUnitsInRadius(
            this.team,
            vTarget,
            null,
            aoe_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.CLOSEST,
            false
        );

        for (let enemy of enemies) {
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.caster,
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: ElementTypeEnum.thunder
            });
            GameRules.BuffManager.AddGeneralDebuff(this.caster, enemy, DebuffTypes.stunned, this.stun_duration)
        }

        let nFXIndex = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_zuus/zuus_lightning_bolt.vpcf",
            ParticleAttachment.WORLDORIGIN,
            null
        )
        ParticleManager.SetParticleControl(nFXIndex, 0, Vector(vTarget.x, vTarget.y, 5000))
        ParticleManager.SetParticleControl(nFXIndex, 1, Vector(vTarget.x, vTarget.y, vTarget.z))
        ParticleManager.ReleaseParticleIndex(nFXIndex)

        let nFxAoe = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_zuus/zuus_lightning_bolt_aoe.vpcf",
            ParticleAttachment.WORLDORIGIN,
            null
        )
        ParticleManager.SetParticleControl(nFxAoe, 0, vTarget)
        ParticleManager.SetParticleControl(nFxAoe, 1, Vector(aoe_radius, 1, 1))
        ParticleManager.ReleaseParticleIndex(nFxAoe)


    }
}

@registerModifier()
export class modifier_arms_69 extends BaseArmsModifier { }
