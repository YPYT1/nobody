
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_elite_7	天女撒花	
 * 蓄力2秒，向四周投掷十把飞镖造成伤害（伤害值为玩家最大生命值20%），最大飞行距离1000码，
 * 飞镖宽度50码。施法距离500码。

 */
@registerAbility()
export class creature_elite_7 extends BaseCreatureAbility {

    line_width: number;
    OnAbilityPhaseStart(): boolean {
        // let hTarget = this.GetCursorTarget();
        this.vOrigin = this.hCaster.GetAbsOrigin();
        let count = this.GetSpecialValueFor("count");
        let line_width = this.GetSpecialValueFor("line_width");
        let line_distance = this.GetSpecialValueFor("line_distance")
        let line_pos = this.vOrigin + this.hCaster.GetForwardVector() * line_distance as Vector;
        for (let i = 0; i < count; i++) {
            line_pos = RotatePosition(this.vOrigin, QAngle(0, 360 / count, 0), line_pos);
            let line_fx = GameRules.WarningMarker.Line(
                this.hCaster,
                line_width,
                this.vOrigin,
                line_pos,
                -1,
                this._cast_point
            )
            this.nPreviewFX_List.push(line_fx)
        }

        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        // 发射
        let vCaster = this.hCaster.GetAbsOrigin()
        let line_pos = vCaster + this.hCaster.GetForwardVector() * 1000 as Vector;
        let count = this.GetSpecialValueFor("count");
        let line_width = this.GetSpecialValueFor("line_width");
        let line_distance = this.GetSpecialValueFor("line_distance")
        for (let i = 0; i < count; i++) {
            let vDirection = (line_pos - vCaster as Vector).Normalized();
            ProjectileManager.CreateLinearProjectile({
                Ability: this,
                EffectName: "particles/custom/creature/elite/elite7_proj.vpcf",
                vSpawnOrigin: vCaster,
                fDistance: line_distance,
                fStartRadius: line_width,
                fEndRadius: line_width,
                Source: this.hCaster,
                vVelocity: (vDirection * line_distance) as Vector,
                iUnitTargetTeam: UnitTargetTeam.ENEMY,
                iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
            });

            line_pos = RotatePosition(vCaster, QAngle(0, 360 / count, 0), line_pos);
        }

    }

    OnProjectileHit(target: CDOTA_BaseNPC | undefined, location: Vector): boolean | void {
        if (target) {
            let damage = target.GetMaxHealth() * 0.2
            ApplyCustomDamage({
                victim: target,
                attacker: this.GetCaster(),
                ability: this,
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                miss_flag: 1,
            })
        }
    }
}