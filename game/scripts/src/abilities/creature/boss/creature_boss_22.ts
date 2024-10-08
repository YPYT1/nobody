
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_boss_22	沉痛打击	
 * 蓄力3秒，boss会锁定一个玩家，在3秒后实施沉痛打击，打击范围直径500码。该伤害可分摊，
 * 每多一名玩家分摊，伤害降低25%。（伤害为玩家最大生命值100%）
 */
@registerAbility()
export class creature_boss_22 extends BaseCreatureAbility {

    OnAbilityPhaseStart(): boolean {
        this.hTarget = this.GetCursorTarget()
        this.vOrigin = this.hCaster.GetAbsOrigin();
        this.nPreviewFX = GameRules.WarningMarker.Circular(
            this._radius, this._cast_point, this.vOrigin, false, Vector(255, 255, 0), 1
        )
        ParticleManager.SetParticleControlEnt(
            this.nPreviewFX,
            0,
            this.hTarget,
            ParticleAttachment.ABSORIGIN_FOLLOW,
            "attach_hitloc",
            Vector(0, 0, 0),
            true
        );
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        let base_dmg_pct = 90;
        let vTarget = this.hTarget.GetAbsOrigin()
        let enemies = FindUnitsInRadius(
            this._team,
            vTarget,
            null,
            this._radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        if (enemies.length > 0) {
            let cast_fx = ParticleManager.CreateParticle(
                "particles/econ/items/lina/lina_ti7/lina_spell_light_strike_array_ti7.vpcf",
                ParticleAttachment.CUSTOMORIGIN,
                null
            )
            ParticleManager.SetParticleControl(cast_fx, 0, vTarget)
            ParticleManager.SetParticleControl(cast_fx, 1, Vector(this._radius, 1, 1))
            ParticleManager.ReleaseParticleIndex(cast_fx)
            let max_hp_pct = base_dmg_pct / enemies.length * 0.01;
            for (let enemy of enemies) {
                let damage = enemy.GetMaxHealth() * max_hp_pct;
                ApplyCustomDamage({
                    victim: enemy,
                    attacker: this.hCaster,
                    damage: damage,
                    damage_type: DamageTypes.PHYSICAL,
                    ability: this,
                    miss_flag: 1,
                })
            }
        }

    }
}