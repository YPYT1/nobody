import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 对锥型区域内的敌人造成伤害并减缓其移动速度
 */
@registerAbility()
export class arms_1 extends BaseArmsAbility {

 
    // projectile_distance:number;

    skv_aoe_radius:number;

    start_radius :number;
    end_radius :number;
    speed:number;

    InitCustomAbilityData(): void {
        this.speed = this.GetSpecialValueFor("speed");
        this.start_radius = this.GetSpecialValueFor("start_radius");
        this.end_radius = this.GetSpecialValueFor("end_radius");
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart(): void {
        this.ability_damage = this.GetAbilityDamage();
        this.skv_aoe_radius = this.GetSpecialValueFor("skv_aoe_radius");
        // print("skv_aoe_radius",this.skv_aoe_radius)
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
        let vPoint = vOrigin + this.caster.GetForwardVector() * this.skv_aoe_radius as Vector;
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

            fDistance: this.skv_aoe_radius,
            fStartRadius: this.start_radius,
            fEndRadius: this.end_radius,
            vVelocity: projectile_direction * this.speed as Vector,

            bProvidesVision: false,

            ExtraData: {
                pos_x: vOrigin.x,
                pos_y: vOrigin.y,
            }
        });
        EmitSoundOn("Hero_Snapfire.Shotgun.Fire", this.caster);

        let particle_name = "particles/units/heroes/hero_snapfire/hero_snapfire_shotgun_range_finder_aoe.vpcf";
        let effect_cast = ParticleManager.CreateParticle(particle_name, ParticleAttachment.ABSORIGIN, this.caster);
        ParticleManager.SetParticleControl(effect_cast, 0, vOrigin)

        ParticleManager.SetParticleControl(effect_cast, 1, vPoint)
        ParticleManager.SetParticleControl(effect_cast, 2, Vector(0, this.end_radius, 0))
        // ParticleManager.SetParticleControl(effect_cast, 6, vOrigin + projectile_direction * projectile_end_radius as Vector);
        this.caster.SetContextThink(DoUniqueString("test"), () => {
            ParticleManager.DestroyParticle(effect_cast, true)
            return null
        }, 1)

    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC, location: Vector, extraData: any): boolean | void {
        if (target) {
            let vOrigin = Vector(extraData.pos_x, extraData.pos_y, 0);
            let vTarget = target.GetAbsOrigin();
            let distance = (vTarget - vOrigin as Vector).Length2D();
            if (distance > this.skv_aoe_radius ) { return };
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
