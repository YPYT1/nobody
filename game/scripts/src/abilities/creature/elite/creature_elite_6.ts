
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_elite_6	冲击波	
 * 锁定一个玩家，蓄力2秒之后发射冲击波，冲击波长度700码宽300码，造成高额伤害（玩家当前生命值40%）。施法距离700码。
 */
@registerAbility()
export class creature_elite_6 extends BaseCreatureAbility {

    line_width: number;
    line_distance: number;

    OnAbilityPhaseStart(): boolean {
        // let hTarget = this.GetCursorTarget();
        this.vPoint = this.GetCursorPosition();
        this.line_width = this.GetSpecialValueFor("line_width");
        this.line_distance = this.GetSpecialValueFor("line_distance")
        this.nPreviewFX = GameRules.WarningMarker.Line(
            this.hCaster,
            this.line_width,
            this.hCaster.GetAbsOrigin(),
            this.vPoint,
            this.line_distance,
            this._cast_point
        )
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx()
        let vCaster = this.hCaster.GetAbsOrigin()
        let vDirection = (this.vPoint - vCaster as Vector).Normalized();
        // vDirection.z = 0;
        ProjectileManager.CreateLinearProjectile({
            Ability: this,
            EffectName: "particles/econ/items/death_prophet/death_prophet_acherontia/death_prophet_acher_swarm.vpcf",
            vSpawnOrigin: vCaster,
            fDistance: this.line_distance,
            fStartRadius: this.line_width,
            fEndRadius: this.line_width,
            Source: this.hCaster,
            vVelocity: (vDirection * this.line_distance) as Vector,
            iUnitTargetTeam: UnitTargetTeam.ENEMY,
            iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
        });
        // let effect_fx = ParticleManager.CreateParticle(
        //     "particles/units/heroes/hero_death_prophet/death_prophet_carrion_swarm.vpcf",
        //     ParticleAttachment.CUSTOMORIGIN,
        //     null
        // )
        // ParticleManager.SetParticleControl(effect_fx,0,vCaster)
        // ParticleManager.set
    }

    OnProjectileHit(target: CDOTA_BaseNPC | undefined, location: Vector): boolean | void {
        if (target) {
            let damage = target.GetHealth() * 0.4;
            ApplyCustomDamage({
                victim: target,
                attacker: this.hCaster,
                ability: this,
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                miss_flag: 1,
            })
        }
    }
}