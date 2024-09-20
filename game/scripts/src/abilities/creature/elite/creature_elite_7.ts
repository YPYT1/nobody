
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_elite_7	天女撒花	
 * 蓄力2秒，向四周投掷十把飞镖造成伤害（伤害值为玩家最大生命值20%），最大飞行距离1000码，
 * 飞镖宽度50码。施法距离500码。

 */
@registerAbility()
export class creature_elite_7 extends BaseCreatureAbility {

    OnAbilityPhaseStart(): boolean {
        // let hTarget = this.GetCursorTarget();
        this.vPoint = this.hCaster.GetAbsOrigin();
        this.nPreviewFX = GameRules.WarningMarker.Circular(
            300,
            this._cast_point,
            this.vPoint
        )
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        // 发射
        let vCaster = this.hCaster.GetAbsOrigin()
        let line_pos = vCaster + this.hCaster.GetForwardVector() * 1000 as Vector;
        let count = 10;
        for (let i = 0; i < count; i++) {
            let vDirection = (line_pos - vCaster as Vector).Normalized();
            ProjectileManager.CreateLinearProjectile({
                Ability: this,
                EffectName: "particles/custom/creature/elite/elite7_proj.vpcf",
                vSpawnOrigin: vCaster,
                fDistance: 1000,
                fStartRadius: 50,
                fEndRadius: 50,
                Source: this.hCaster,
                vVelocity: (vDirection * 1000) as Vector,
                iUnitTargetTeam: UnitTargetTeam.ENEMY,
                iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
            });

            line_pos = RotatePosition(vCaster, QAngle(0, 360 / count, 0), line_pos);
        }

    }

    OnProjectileHit(target: CDOTA_BaseNPC | undefined, location: Vector): boolean | void {
        if(target){
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