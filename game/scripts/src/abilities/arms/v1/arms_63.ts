import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 龙破斩	"引导龙的吐息，放出一波火焰，烧焦所有
波及的敌人，并且持续烧灼他们3秒。
特效：火女1技能
cd：3秒
伤害系数：攻击力200%·火元素伤害，
灼烧伤害为攻击力25%·火元素伤害
作用范围：宽200码，长1200码。"

 */
@registerAbility()
export class arms_63 extends BaseArmsAbility {

    projectile_width: number;


    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource("particle", "particles/units/heroes/hero_lina/lina_spell_dragon_slave.vpcf", context);
    }

    _OnUpdateKeyValue(): void {
        this.projectile_width = this.GetSpecialValueFor("projectile_width")
        this.projectile_speed = this.GetSpecialValueFor("projectile_speed")
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart(): void {
        this.ability_damage = this.GetAbilityDamage();
        let vPoint = this.FindRandomEnemyVect();
        let direction = vPoint - this.caster.GetOrigin() as Vector;
        direction.z = 0;
        direction = direction.Normalized();
        let vVelocity = (direction * this.projectile_speed) as Vector;
        ProjectileManager.CreateLinearProjectile({
            EffectName: "particles/units/heroes/hero_lina/lina_spell_dragon_slave.vpcf",
            Ability: this,
            vSpawnOrigin: this.caster.GetAbsOrigin(),
            fStartRadius: this.projectile_width,
            fEndRadius: this.projectile_width,
            vVelocity: vVelocity,
            fDistance: this.trigger_distance,
            Source: this.caster,
            iUnitTargetTeam: UnitTargetTeam.ENEMY,
            iUnitTargetType: UnitTargetType.BASIC + UnitTargetType.HERO,
            iUnitTargetFlags: UnitTargetFlags.NONE,
        });
    }

    OnProjectileHit(target: CDOTA_BaseNPC, location: Vector): boolean | void {
        if (target) {
            // 伤害
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: this.ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: ElementTypeEnum.fire
            });


        }
    }
}

@registerModifier()
export class modifier_arms_63 extends BaseArmsModifier { }
