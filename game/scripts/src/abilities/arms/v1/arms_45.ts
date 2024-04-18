import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 小火球	"向直径700码以内随机敌人发射一颗小火
球对其造成伤害。
cd：3秒
伤害系数：攻击力150%·火元素伤害"

 */
@registerAbility()
export class arms_45 extends BaseArmsAbility {

    burn_duration: number;

    _OnUpdateKeyValue(): void {
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart(): void {
        let count = 0;
        this.ability_damage = this.GetAbilityDamage();
        const projectile_speed = this.GetSpecialValueFor("projectile_speed");
        const extra_count = this.GetSpecialValueFor("extra_count");
        const vPoint = this.caster.GetOrigin();
        let enemies = FindUnitsInRadius(
            this.caster.GetTeam(),
            vPoint,
            null,
            this.trigger_distance,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );

        for (let enemy of enemies) {
            if (count < extra_count) {
                count += 1;
                ProjectileManager.CreateTrackingProjectile({
                    Target: enemy,
                    Source: this.caster,
                    Ability: this,
                    EffectName: "particles/units/heroes/hero_ogre_magi/ogre_magi_ignite.vpcf",
                    iMoveSpeed: projectile_speed,
                    vSourceLoc: vPoint,
                    bDodgeable: false,
                    bProvidesVision: false,
                });
            } else {
                break;
            }
        }
    }

    OnProjectileHit(target: CDOTA_BaseNPC, location: Vector): boolean | void {
        if (target) {
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: this.ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: ElementTypeEnum.fire
            });
            return true
        }
    }
}

@registerModifier()
export class modifier_arms_45 extends BaseArmsModifier { }
