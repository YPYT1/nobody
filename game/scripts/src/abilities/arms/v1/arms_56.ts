import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 魂之挽歌	"英雄死亡时，向直径1000码范围内释放5道魔能。
特效：sf大招·瞬发
伤害系数：每道魔能攻击力50%·暗元素伤害
作用范围：自身为中心，直径1000码"

 */
@registerAbility()
export class arms_56 extends BaseArmsAbility {

    travel_speed: number;

    _OnUpdateKeyValue(): void {
        this.travel_speed = 900;//this.GetSpecialValueFor("travel_speed")
    }

    OnDeath(): void {
        this.ability_damage = this.GetAbilityDamage();
        let vCaster = this.caster.GetAbsOrigin();
        let extra_count = this.GetSpecialValueFor("extra_count");
        let origin_radius = this.GetSpecialValueFor("origin_radius")
        let qangle_rotation_rate = 360 / extra_count;

        let line_position = (vCaster + this.caster.GetForwardVector() * origin_radius) as Vector;
        print("line_position", line_position)

        let max_distance_time = origin_radius / this.travel_speed;
        print("max_distance_time", origin_radius, this.travel_speed, max_distance_time)
        for (let i = 0; i < extra_count; i++) {
            // 角度
            let qangle = QAngle(0, qangle_rotation_rate, 0);
            line_position = RotatePosition(vCaster, qangle, line_position);
            DebugDrawCircle(line_position, Vector(255, 0, 0), 100, 100, true, 1)
            let velocity = ((line_position - vCaster) as Vector).Normalized();
            let particle_lines_fx = ParticleManager.CreateParticle(
                "particles/units/heroes/hero_nevermore/nevermore_requiemofsouls_line.vpcf",
                ParticleAttachment.ABSORIGIN,
                this.caster
            );
            ParticleManager.SetParticleControl(particle_lines_fx, 0, vCaster);
            ParticleManager.SetParticleControl(particle_lines_fx, 1, (velocity * this.travel_speed) as Vector);
            ParticleManager.SetParticleControl(particle_lines_fx, 2, Vector(0, max_distance_time, 0));
            ParticleManager.ReleaseParticleIndex(particle_lines_fx);

            // ProjectileManager.CreateLinearProjectile({
            //     Ability: this,
            //     EffectName: "particles/units/heroes/hero_nevermore/nevermore_requiemofsouls_line.vpcf",
            //     vSpawnOrigin: vCaster,
            //     fDistance: origin_radius,
            //     fStartRadius: 96,
            //     fEndRadius: 96,
            //     Source: this.caster,
            //     vVelocity: (velocity * this.travel_speed) as Vector,
            //     iUnitTargetTeam: UnitTargetTeam.ENEMY,
            //     iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
            //     iUnitTargetFlags: UnitTargetFlags.NONE,
            // });
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
                element_type: ElementTypeEnum.dark
            });
        }
    }
}

@registerModifier()
export class modifier_arms_56 extends BaseArmsModifier { }
