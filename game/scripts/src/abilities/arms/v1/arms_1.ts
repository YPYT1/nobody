import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 对锥型区域内的敌人造成伤害并减缓其移动速度
 */
@registerAbility()
export class arms_1 extends BaseArmsAbility {

    spirit_list: CDOTA_BaseNPC[];
    spirit_limit: number;
    projectile_distance:number;

    _OnUpdateKeyValue(): void {
        this.spirit_limit = this.GetSpecialValueFor("spirit_limit");
        if (this.spirit_list == null) { this.spirit_list = [] }
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart(): void {
        this.projectile_distance = 750
        this.ability_damage = 11;
        // this.trigger_distance = 600;
        // print("this.spirit_list.length", this.spirit_list.length)
        const projectile_start_radius = 55;
        const projectile_end_radius = 355;
        // const projectile_distance = 650;
        const projectile_speed = 3000;
        // const projectile_speed = this.GetSpecialValueFor("projectile_speed");
        const vOrigin = this.caster.GetOrigin();

        // let enemies = FindUnitsInRadius(
        //     this.caster.GetTeam(),
        //     vOrigin,
        //     null,
        //     projectile_distance,
        //     UnitTargetTeam.ENEMY,
        //     UnitTargetType.BASIC + UnitTargetType.HERO,
        //     UnitTargetFlags.NONE,
        //     FindOrder.CLOSEST,
        //     false
        // );

        // GameRules.ResourceSystem.ModifyResource
        let vPoint = vOrigin + this.caster.GetForwardVector() * this.projectile_distance as Vector;
        // if (enemies.length > 0) {
        //     let vTarget = enemies[0].GetAbsOrigin();
        //     let direction = vTarget - vOrigin as Vector;
        //     direction.z = 0
        //     direction = direction.Normalized();
        //     // print(this.caster.GetForwardVector(),direction)
        //     vPoint = vOrigin + direction * projectile_distance as Vector;

        //     // DebugDrawCircle(vTarget, Vector(255, 9, 9), 100, 100, true, 1);
        // }
        // print("vPoint", vPoint)
        // DebugDrawCircle(vPoint, Vector(255, 9, 9), 100, 100, true, 1);
        let projectile_direction = vPoint - vOrigin as Vector
        projectile_direction.z = 0
        projectile_direction = projectile_direction.Normalized()

        // let enemy = 
        ProjectileManager.CreateLinearProjectile({
            Source: this.caster,
            Ability: this,
            vSpawnOrigin: this.caster.GetAbsOrigin(),
            iUnitTargetTeam: UnitTargetTeam.ENEMY,
            iUnitTargetType: UnitTargetType.BASIC + UnitTargetType.HERO,
            iUnitTargetFlags: UnitTargetFlags.NONE,
            EffectName: "particles/units/heroes/hero_snapfire/hero_snapfire_shotgun.vpcf",
            // EffectName: "particles/units/heroes/hero_nyx_assassin/nyx_assassin_impale.vpcf",

            fDistance: this.projectile_distance,
            fStartRadius: projectile_start_radius,
            fEndRadius: projectile_end_radius,
            vVelocity: projectile_direction * projectile_speed as Vector,

            bProvidesVision: false,

            ExtraData: {
                pos_x: vOrigin.x,
                pos_y: vOrigin.y,
            }
        });
        EmitSoundOn("Hero_Snapfire.Shotgun.Fire", this.caster);

        // let particle_name = "particles/units/heroes/hero_snapfire/hero_snapfire_shotgun_range_finder_aoe.vpcf";
        // let effect_cast = ParticleManager.CreateParticle(particle_name, ParticleAttachment.ABSORIGIN, this.caster);
        // ParticleManager.SetParticleControl(effect_cast, 0, vOrigin)

        // ParticleManager.SetParticleControl(effect_cast, 1, vPoint)
        // ParticleManager.SetParticleControl(effect_cast, 2, Vector(0, projectile_end_radius, 0))
        // // ParticleManager.SetParticleControl(effect_cast, 6, vOrigin + projectile_direction * projectile_end_radius as Vector);
        // this.caster.SetContextThink(DoUniqueString("test"), () => {
        //     ParticleManager.DestroyParticle(effect_cast, true)
        //     return null
        // }, 1)

    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC, location: Vector, extraData: any): boolean | void {
        if (target) {
            let vOrigin = Vector(extraData.pos_x, extraData.pos_y, 0);
            let vTarget = target.GetAbsOrigin();
            let distance = (vTarget - vOrigin as Vector).Length2D();
            // print("distance", distance, this.projectile_distance)
            if (distance > this.projectile_distance + 200) { return };
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: this.ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: this.element_type
            });
            return false
        }
        return true
    }

}
