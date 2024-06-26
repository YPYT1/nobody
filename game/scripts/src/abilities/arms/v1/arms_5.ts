import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 火箭弹幕	"自动锁定附近一定范围内的敌方单位点并发射火箭弹幕进行攻击
CD:0
作用范围：400
发射导弹数：10
每发导弹伤害：攻击力3%*火元素伤害"

 */
@registerAbility()
export class arms_5 extends BaseArmsAbility {

    missile_distance: number;
    missile_radius: number;

    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource("particle", "particles/units/heroes/hero_rattletrap/rattletrap_rocket_flare.vpcf", context);
    }

    InitCustomAbilityData(): void {
        this.missile_distance = this.GetSpecialValueFor("missile_distance");
        this.missile_radius = this.GetSpecialValueFor("missile_radius");
        this.RegisterEvent(["OnArmsInterval"])
    }

    OnArmsInterval(): void {
        // print("ArmsEffectStart")
        this.ability_damage = this.GetAbilityDamage();
        this.caster.AddNewModifier(this.caster, this, "modifier_arms_5_launch", {
            duration: 2
        })

    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC, location: Vector, extraData: any): boolean | void {
        if (target) {

            let enemies = FindUnitsInRadius(
                this.GetCaster().GetTeam(),
                location,
                null,
                this.missile_radius,
                UnitTargetTeam.ENEMY,
                UnitTargetType.BASIC + UnitTargetType.HERO,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            );
            for (let enemy of enemies) {
                ApplyCustomDamage({
                    victim: enemy,
                    attacker: this.GetCaster(),
                    damage: this.ability_damage,
                    damage_type: DamageTypes.MAGICAL,
                    ability: this,
                    // element_type: 0,
                });
            }

            UTIL_Remove(target);
        }
    }

}

@registerModifier()
export class modifier_arms_5 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_5_launch extends BaseModifier {

    missile_count: number;
    missile_speed: number;

    count: number;
    target_vect: Vector;
    GetAttributes(): ModifierAttribute {
        return ModifierAttribute.MULTIPLE
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        const vOrigin = this.GetCaster().GetOrigin();
        const missile_distance = this.GetAbility().GetSpecialValueFor("missile_distance");
        this.missile_count = this.GetAbility().GetSpecialValueFor("skv_missile_count");
        this.missile_speed = this.GetAbility().GetSpecialValueFor("skv_missile_speed")
        this.count = 0;
        let enemies = FindUnitsInRadius(
            this.GetCaster().GetTeam(),
            vOrigin,
            null,
            missile_distance,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        let target_vect: Vector;
        if (enemies.length > 0) {
            target_vect = enemies[0].GetOrigin();
        } else {
            target_vect = vOrigin + Vector(RandomInt(-350, 350), RandomInt(-350, 350), 0) as Vector;
        }
        this.target_vect = target_vect;


        this.OnIntervalThink()
        this.StartIntervalThink(0.1)
    }

    OnIntervalThink() {
        this.count += 1;
        let vPoint = this.target_vect + Vector(RandomInt(-50, 50), RandomInt(-50, 50), 0) as Vector;

        let hTarget = CreateModifierThinker(
            this.GetCaster(),
            this.GetAbility(),
            "modifier_basic_tracking_thinker",
            {
                duration: 2
            },
            vPoint,
            this.GetCaster().GetTeam(),
            false
        )

        // DebugDrawCircle(vPoint,Vector(255,255,9),100,100,true,1);

        ProjectileManager.CreateTrackingProjectile({
            Source: this.GetCaster(),
            Target: hTarget,
            Ability: this.GetAbility(),
            EffectName: "particles/units/heroes/hero_rattletrap/rattletrap_rocket_flare.vpcf",
            iSourceAttachment: ProjectileAttachment.HITLOCATION,
            // vSourceLoc: this.parent.GetAbsOrigin(),
            iMoveSpeed: this.missile_speed,
        })

        if (this.count >= this.missile_count) {
            this.StartIntervalThink(-1);
            this.Destroy();
        }
    }
}
