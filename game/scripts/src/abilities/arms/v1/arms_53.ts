import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * "【灵魂吸收】：通过接近敌人吸取灵魂，每秒吸取敌人
1点灵魂。
特效：骨法大招（黑紫色）
持续3秒，cd：6秒
作用范围：300码内3个敌军。无伤害"

 */
@registerAbility()
export class arms_53 extends BaseArmsAbility {

    _OnUpdateKeyValue(): void {
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart(): void {
        this.ability_damage = this.GetAbilityDamage();

        let vPoint = this.caster.GetAbsOrigin();
        let origin_radius = this.GetSpecialValueFor("origin_radius");
        let extra_count = this.GetSpecialValueFor("extra_count");
        let debuff_duration = this.GetSpecialValueFor("debuff_duration");
        let count = 0;

        let enemies = FindUnitsInRadius(
            this.team,
            vPoint,
            null,
            origin_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );

        for (let enemy of enemies) {
            if (count < extra_count) {
                count += 1;
                enemy.AddNewModifier(this.caster, this, "modifier_arms_53_life_drain", {
                    duration: debuff_duration
                })
            } else {
                break
            }
        }
    }
}

@registerModifier()
export class modifier_arms_53 extends BaseArmsModifier {

}

@registerModifier()
export class modifier_arms_53_life_drain extends BaseModifier {

    cast_fx: ParticleID;
    ability_damage: number;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.ability_damage = this.GetAbility().ability_damage;
        this.cast_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_pugna/pugna_life_drain.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetCaster()
        );
        ParticleManager.SetParticleControlEnt(
            this.cast_fx,
            1,
            this.GetParent(),
            ParticleAttachment.POINT_FOLLOW,
            "attach_hitloc",
            Vector(0, 0, 0),
            true
        )
        ParticleManager.SetParticleControl(this.cast_fx, 60, Vector(80, 0, 112));
        ParticleManager.SetParticleControl(this.cast_fx, 61, Vector(1, 0, 0));
        
        this.OnIntervalThink()
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        // ApplyCustomDamage({
        //     victim: this.GetParent(),
        //     attacker: this.GetCaster(),
        //     damage: this.ability_damage,
        //     damage_type: DamageTypes.MAGICAL,
        //     ability: this.GetAbility(),
        //     element_type: ElementTypeEnum.light
        // });

        // 治疗
        // GameRules.CustomMechanics.Heal(this.GetCaster(), this.ability_damage * 0.2, this.GetAbility())
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        ParticleManager.DestroyParticle(this.cast_fx, true)
    }

}