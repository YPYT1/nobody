import { registerAbility } from "../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../creature/base_creature";

/**
 * 暗影球伤害为英雄最大生命值40%。
 */
@registerAbility()
export class mission_spider extends BaseCreatureAbility {

    shadowball_distance: number = 5000;
    shadowball_maxhp_dmg: number = 40;
    shadowball_speed: number = 350;

    GetIntrinsicModifierName(): string {
        return "modifier_mission_spider";
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC, location: Vector, extraData: object): boolean | void {
        if (target) {
            let damage = target.GetMaxHealth() * 0.4;
            // print("mission_spider hit")
            ApplyCustomDamage({
                victim: target,
                attacker: this.GetCaster(),
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                element_type: ElementTypes.NONE,
                ability: this,
                miss_flag: 1,
                ignore_armor: 1,
                // bonus_percent: bonus_percent,
            })
            // target.AddNewModifier(this.GetCaster(), this, "modifier_creature_boss_shadow_demon_3_stack", {});
            return true;
        }
    }

    OnAbilityPhaseStart(): boolean {
        let vCaster = this.hCaster.GetAbsOrigin()
        let line_pos = vCaster + this.hCaster.GetForwardVector() * 1000 as Vector;
        // for (let i = 0; i < 6; i++) {
        //     let nPreviewFX = GameRules.WarningMarker.Line(this.hCaster, 128, vCaster, line_pos, -1, 1, Vector(255, 0, 0));
        //     this.nPreviewFX_List.push(nPreviewFX)
        //     line_pos = RotatePosition(vCaster, QAngle(0, 60, 0), line_pos);
        // }
        this.nPreviewFX = GameRules.WarningMarker.Circular(300, 1, vCaster)
        this.nPreviewFX_2 = GameRules.WarningMarker.CreateExclamation(this.hCaster);
        return true
    }

    OnSpellStart(): void {
        print("mission_spider OnSpellStart")
        this.DestroyWarningFx();
        // 发射
        let vCaster = this.hCaster.GetAbsOrigin()
        let line_pos = vCaster + this.hCaster.GetForwardVector() * 1000 as Vector;
        for (let i = 0; i < 6; i++) {
            let vDirection = (line_pos - vCaster as Vector).Normalized();
            ProjectileManager.CreateLinearProjectile({
                Ability: this,
                EffectName: "particles/units/heroes/hero_shadow_demon/shadow_demon_shadow_poison_projectile.vpcf",
                vSpawnOrigin: vCaster,
                fDistance: this.shadowball_distance,
                fStartRadius: 128,
                fEndRadius: 128,
                Source: this.hCaster,
                vVelocity: (vDirection * this.shadowball_speed) as Vector,
                iUnitTargetTeam: UnitTargetTeam.ENEMY,
                iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
            });

            line_pos = RotatePosition(vCaster, QAngle(0, 60, 0), line_pos);
        }
    }
}