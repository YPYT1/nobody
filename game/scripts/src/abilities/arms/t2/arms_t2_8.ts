import { modifier_debuff_slow } from "../../../modifier/modifier_debuff";
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 冰霜新星	"召唤具有破坏性的冰雹，降低目标区域敌人的移动速度。
作用范围：直径450码，减速20%，持续5秒
伤害公式：%DamageFormula%"
 */
@registerAbility()
export class arms_t2_8 extends BaseArmsAbility {

    mdf_name = "modifier_arms_t2_8"

    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource("particle", "particles/units/heroes/hero_crystalmaiden/maiden_crystal_nova.vpcf", context);
    }

    _OnUpdateKeyValue(): void {
        this.ArmsAdd();
    }

    ArmsEffectStart(): void {
        const vCaster = this.caster.GetOrigin();
        let ability_damage = this.GetAbilityDamage();
        let aoe_radius = this.GetSpecialValueFor("aoe_radius");
        let debuff_duration = this.GetSpecialValueFor("debuff_duration");
        let moveslow_pct = this.GetSpecialValueFor("moveslow_pct");

        let targets = FindUnitsInRadius(
            this.team,
            vCaster,
            null,
            this.trigger_distance,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        let vTarget: Vector;
        if (targets.length > 0) {
            vTarget = targets[0].GetAbsOrigin()
        } else {
            vTarget = vCaster + RandomVector(RandomInt(0, this.trigger_distance)) as Vector
        }

        let nova_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_crystalmaiden/maiden_crystal_nova.vpcf",
            ParticleAttachment.WORLDORIGIN,
            this.caster
        );
        ParticleManager.SetParticleControl(nova_fx,0,vTarget)
        ParticleManager.SetParticleControl(nova_fx, 1, Vector(aoe_radius, 0, 0));
        ParticleManager.ReleaseParticleIndex(nova_fx);

        
        let enemies = FindUnitsInRadius(
            this.team,
            vTarget,
            null,
            aoe_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        for (let enemy of enemies) {
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.caster,
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: ElementTypeEnum.ice,
            })

            enemy.AddNewModifier(this.caster, this, "modifier_arms_t2_8_debuff", {
                duration: debuff_duration,
                slow: moveslow_pct,
            })
            // GameRules.BuffManager.AddGeneralDebuff(this.caster,enemy,DebuffTypes.slow,debuff_duration,20)

        }
    }
}

@registerModifier()
export class modifier_arms_t2_8 extends BaseArmsModifier {

}

@registerModifier()
export class modifier_arms_t2_8_debuff extends modifier_debuff_slow { }