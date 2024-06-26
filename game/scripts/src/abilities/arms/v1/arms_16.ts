import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";


@registerAbility()
export class arms_16 extends BaseArmsAbility { 

    skv_missile_count:number;
    skv_missile_speed:number;

    InitCustomAbilityData(): void {
        this.RegisterEvent(["OnArmsInterval"])
    }

    UpdataCustomKeyValue(): void {
        this.skv_missile_count = this.GetSpecialValueFor("skv_missile_count");
        this.skv_missile_speed = this.GetSpecialValueFor("skv_missile_speed");
    }

    OnArmsInterval(): void {
        print("")
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

        if(enemies.length > 0){
            let hTarget = enemies[0];
            this.ability_damage = this.GetAbilityDamage();
            ProjectileManager.CreateTrackingProjectile({
                Target: hTarget,
                Source: this.caster,
                Ability: this,
                EffectName: "particles/units/heroes/hero_ogre_magi/ogre_magi_ignite.vpcf",
                iMoveSpeed: this.skv_missile_speed,
                vSourceLoc: vPoint,
                bDodgeable: false,
                bProvidesVision: false,
            });
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
                element_type: this.element_type
            });

            // target.AddNewModifier(this.caster, this, "modifier_arms_7_dot", {
            //     dot_damage: this.ability_damage,
            //     dot_interval: this.skv_dot_interval,
            //     duration: this.skv_dot_duration,
            // })
            return true
        }
    }
}

@registerModifier()
export class modifier_arms_16 extends BaseArmsModifier {}