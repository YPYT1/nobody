import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { BaseHeroAbility, BaseHeroModifier } from "../../base_hero_ability";

/**
 * 连续射击【目标型】5	"快速射出4支箭，每支箭造成攻击力130%的伤害。
cd：3秒
蓝量消耗：20
作用范围：750码内敌对单位
连发 1/3"

 */
@registerAbility()
export class drow_2a extends BaseHeroAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_2a"
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: any): boolean | void {
        if (target) {
            let ability_damage = extraData.a;
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: ability_damage,
                damage_type: DamageTypes.PHYSICAL,
                ability: this,
                is_primary: true,
            })
            return true
        }
    }
}

@registerModifier()
export class modifier_drow_2a extends BaseHeroModifier {

    base_value: number;

    action_range: number;
    proj_count: number;
    proj_speed: number;
    proj_width: number;

    proj_name: string;
    /** 投射 */
    porj_track = {
        "none": "particles/units/heroes/hero_drow/drow_multishot_proj_linear_proj.vpcf",
        "fire": "fire",
    }

    /** 线型 */
    porj_linear = {
        "none": "particles/proj/linear/none/proj_linear_none.vpcf",
        "fire": "particles/proj/linear/fire/proj_linear_fire.vpcf",
        "ice": "particles/proj/linear/ice/proj_linear_ice.vpcf",
        "wind": "particles/proj/linear/wind/proj_linear_wind.vpcf",
    }

    UpdataAbilityValue(): void {
        const hAbility = this.GetAbility();
        this.base_value = hAbility.GetSpecialValueFor("base_value");
        this.proj_count = hAbility.GetSpecialValueFor("proj_count");
        this.proj_speed = hAbility.GetSpecialValueFor("proj_speed");
        this.proj_width = hAbility.GetSpecialValueFor("proj_width");
        this.action_range = hAbility.GetSpecialValueFor("action_range");
        this.proj_name = this.porj_linear.none;
    }


    OnIntervalThink() {
        if (this.caster.IsAlive() && this.ability.IsCooldownReady() && this.caster.GetMana() >= this.ability.GetManaCost(0)) {
            let enemies = FindUnitsInRadius(
                this.team,
                this.caster.GetAbsOrigin(),
                null,
                this.action_range,
                UnitTargetTeam.ENEMY,
                UnitTargetType.HERO + UnitTargetType.BASIC,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            );
            if (enemies.length == 0) { return }
            this.ability.UseResources(true, true, true, true)
            let hTarget = enemies[0];
            this.PlayEffect({ hTarget: hTarget })
        }
    }

    PlayEffect(params: PlayEffectProps) {
        let hTarget = params.hTarget;
        let vTarget = hTarget.GetAbsOrigin();
        let count = 0;
        let ability_damage = this.caster.GetAverageTrueAttackDamage(null) * this.base_value * 0.01;
        this.caster.SetContextThink("drow_2a_shot", () => {
            let vCaster = this.caster.GetAbsOrigin() + RandomVector(100) as Vector;
            let vDirection = (vTarget - vCaster as Vector).Normalized();
            vDirection.z = 0;
            let vVelocity = vDirection * this.proj_speed as Vector;
            ProjectileManager.CreateLinearProjectile({
                EffectName: this.proj_name,
                Ability: this.GetAbility(),
                // vSpawnOrigin: vCaster,
                vVelocity: vVelocity,
                fDistance: this.action_range,
                fStartRadius: this.proj_width,
                fEndRadius: this.proj_width,
                Source: this.caster,
                vSpawnOrigin: vCaster,
                iUnitTargetTeam: UnitTargetTeam.ENEMY,
                iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
                iUnitTargetFlags: UnitTargetFlags.NONE,
                ExtraData: {
                    a: ability_damage,
                }
            })
            count += 1;
            if (count >= this.proj_count) {
                return null
            }
            return 0.1
        }, 0)

    }


}
