import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { BaseHeroAbility, BaseHeroModifier } from "../../base_hero_ability";

/**
 * B.散射（5/5）：散射5支箭，造成攻击力120%/140%/160%/190%/240%的伤害。
cd：3秒
蓝量消耗30
作用范围：500码距离，扇形90°
 */
@registerAbility()
export class drow_2b extends BaseHeroAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_2b"
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
                // element_type: ElementTypeEnum.fire,
                is_primary: true,
            })
            return true
        }
    }
}

@registerModifier()
export class modifier_drow_2b extends BaseHeroModifier {

    base_value: number;
    arrow_count: number;
    arrow_angle: number;

    proj_width: number;
    proj_speed: number;
    proj_name: string;
    proj_distance: number;

    /** 投射 */
    porj_track = {
        "none": "particles/units/heroes/hero_drow/drow_multishot_proj_linear_proj.vpcf",
        "fire": "fire",
    }

    /** 线型 */
    porj_linear = {
        "none": "particles/units/heroes/hero_drow/drow_multishot_proj_linear_proj.vpcf",
        "fire": "particles/proj/linear/fire/proj_linear_fire.vpcf",
        "ice": "particles/proj/linear/ice/proj_linear_ice.vpcf",
        "wind": "particles/proj/linear/wind/proj_linear_wind.vpcf",
    }

    MdfUpdataAbilityValue(): void {
        this.base_value = this.ability.GetSpecialValueFor("base_value");
        this.arrow_count = this.ability.GetSpecialValueFor("arrow_count");
        this.arrow_angle = this.ability.GetSpecialValueFor("arrow_angle");
        this.proj_width = this.ability.GetSpecialValueFor("proj_width");
        this.proj_speed = this.ability.GetSpecialValueFor("proj_speed");
        this.proj_name = this.porj_linear.none;
        this.proj_distance = this.ability.GetSpecialValueFor("proj_distance");
    }

    OnIntervalThink() {
        // print(this.caster.GetMana() , this.ability.GetManaCost(-1))
        if (this.ability.IsCooldownReady() && this.caster.GetMana() >= this.ability.GetManaCost(-1)) {
            let enemies = FindUnitsInRadius(
                this.team,
                this.caster.GetAbsOrigin(),
                null,
                this.proj_distance,
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

    PlayEffect(params: PlayEffectProps): void {
        this.ability_damage = this.caster.GetAverageTrueAttackDamage(null) * this.base_value * 0.01
        let vTarget = params.hTarget.GetAbsOrigin()
        this.MultiShot(vTarget);
    }

    MultiShot(vTarget: Vector) {
        let vCaster = this.caster.GetAbsOrigin();
        let direction = vTarget - vCaster as Vector;
        direction.z = 0;
        direction = direction.Normalized();
        ProjectileManager.CreateLinearProjectile({
            // EffectName: "particles/heroes/windrunner/passive_proj.vpcf",
            EffectName: this.proj_name,
            Ability: this.GetAbility(),
            vSpawnOrigin: this.GetCaster().GetOrigin(),
            fStartRadius: this.proj_width,
            fEndRadius: this.proj_width,
            vVelocity: (direction * this.proj_speed) as Vector,
            fDistance: this.proj_distance,
            Source: this.GetCaster(),
            iUnitTargetTeam: UnitTargetTeam.ENEMY,
            iUnitTargetType: UnitTargetType.BASIC + UnitTargetType.HERO,
            iUnitTargetFlags: UnitTargetFlags.NONE,
            ExtraData: {
                a: this.ability_damage,
                x: vCaster.x,
                y: vCaster.y,
            }
        });
        let last_count = this.arrow_count - 1
        for (let i = 0; i < last_count; i++) {
            let is_even = i % 2 == 0; // 偶数
            let angle_y = is_even ? (this.arrow_angle / last_count) * math.floor(1 + i / 2) : (this.arrow_angle / -last_count) * math.floor(1 + i / 2);
            let vPoint = RotatePosition(vCaster, QAngle(0, angle_y, 0), vTarget);
            let direction = vPoint - vCaster as Vector;
            direction.z = 0;
            direction = direction.Normalized();
            ProjectileManager.CreateLinearProjectile({
                // EffectName: "particles/heroes/windrunner/passive_proj.vpcf",
                EffectName: this.proj_name,
                Ability: this.GetAbility(),
                vSpawnOrigin: this.GetCaster().GetOrigin(),
                fStartRadius: this.proj_width,
                fEndRadius: this.proj_width,
                vVelocity: (direction * this.proj_speed) as Vector,
                fDistance: this.proj_distance,
                Source: this.GetCaster(),
                iUnitTargetTeam: UnitTargetTeam.ENEMY,
                iUnitTargetType: UnitTargetType.BASIC + UnitTargetType.HERO,
                iUnitTargetFlags: UnitTargetFlags.NONE,
                ExtraData: {
                    a: this.ability_damage,
                    x: vCaster.x,
                    y: vCaster.y,
                }
            });
        }
    }
}