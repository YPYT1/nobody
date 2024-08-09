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

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: ProjectileExtraData): boolean | void {
        if (target) {
            let ability_damage = extraData.a;
            let bp_ingame = extraData.bp_ingame;
            let bp_server = extraData.bp_server

            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: ability_damage,
                damage_type: DamageTypes.PHYSICAL,
                ability: this,
                is_primary: true,
                bp_ingame: bp_ingame,
                bp_server: bp_server,
            })
            return true
        }
    }
}

@registerModifier()
export class modifier_drow_2b extends BaseHeroModifier {

    base_value: number;
    bonus_value: number = 0;
    arrow_count: number;
    arrow_angle: number;

    proj_width: number;
    proj_speed: number;
    proj_name: string;
    proj_distance: number;

    UpdataAbilityValue(): void {
        this.base_value = this.ability.GetSpecialValueFor("base_value");
        this.arrow_count = this.ability.GetSpecialValueFor("arrow_count");
        this.arrow_angle = this.ability.GetSpecialValueFor("arrow_angle");
        this.proj_width = this.ability.GetSpecialValueFor("proj_width");
        this.proj_speed = this.caster.GetProjectileSpeed();
        this.proj_name = G_PorjLinear.none;
        this.proj_distance = this.ability.GetSpecialValueFor("proj_distance");
        // this.StartIntervalThink(1)
    }

    OnIntervalThink() {
        // print(this.caster.GetMana() , this.ability.GetManaCost(-1))
        if (this.caster.IsAlive() && this.ability.IsCooldownReady() && this.caster.GetMana() >= this.ability.GetManaCost(-1)) {
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
            // this.ability.UseResources(true, true, true, true)
            let manacost_bonus = this.ability.ManaCostAndConverDmgBonus();
            let hTarget = enemies[0];
            this.PlayEffect({ hTarget: hTarget, value: manacost_bonus })
        }
    }

    PlayEffect(params: PlayEffectProps): void {
        let vTarget = params.hTarget.GetAbsOrigin()
        this.MultiShot(vTarget, params.value);
    }

    MultiShot(vTarget: Vector, bonus_pct: number) {
        let vCaster = this.caster.GetAbsOrigin();
        let direction = vTarget - vCaster as Vector;
        direction.z = 0;
        direction = direction.Normalized();
        let attack_game = this.caster.GetAverageTrueAttackDamage(null);
        let bp_ingame = (this.base_value - 100) + this.bonus_value + bonus_pct;
        let bp_server = 0;
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
                a: attack_game,
                x: vCaster.x,
                y: vCaster.y,
                bp_ingame: bp_ingame,
                bp_server: bp_server,
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
                    a: attack_game,
                    x: vCaster.x,
                    y: vCaster.y,
                    bp_ingame: bp_ingame,
                    bp_server: bp_server,
                }
            });
        }
    }
}