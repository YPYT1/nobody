
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_boss_16	撼地一拳	蓄力3秒，然后重锤地板，
 * 对自身范围直径700码的玩家造成高额伤害，且附带击飞效果并眩晕3秒。
 * （伤害为玩家最大生命值45%，击飞1秒）
 */
@registerAbility()
export class creature_boss_16 extends BaseCreatureAbility {

    OnAbilityPhaseStart(): boolean {
        this.hCaster.AddNewModifier(this.hCaster, this, "modifier_state_boss_invincible", {})
        this.vOrigin = this.hCaster.GetAbsOrigin();
        this.nPreviewFX = GameRules.WarningMarker.Circular(this._cast_range, this._cast_point, this.vOrigin)
        GameRules.CMsg.BossCastWarning(true, "custom_text_boss_cast_warning", {
            unitname: this.hCaster.GetUnitName(),
            ability: this.GetAbilityName(),
        })
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx()
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_earthshaker/earthshaker_echoslam_start.vpcf",
            ParticleAttachment.CUSTOMORIGIN,
            null
        )
        ParticleManager.SetParticleControl(effect_fx, 0, this.vOrigin);
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(1, 0, 0));
        ParticleManager.ReleaseParticleIndex(effect_fx);

        let enemies = FindUnitsInRadius(
            this.GetCaster().GetTeam(),
            this.vOrigin,
            null,
            this._radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        for (let enemy of enemies) {
            let damage = enemy.GetMaxHealth() * this.dmg_max_hp;
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.hCaster,
                ability: this,
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                miss_flag: 1,
            })

            // 击飞
            enemy.AddNewModifier(this.hCaster, this, "modifier_knockback_lua", {
                center_x: this.vOrigin.x,
                center_y: this.vOrigin.y,
                center_z: 0,
                knockback_height: 500,
                knockback_distance: 650,
                knockback_duration: 1.5,
                duration: 1.5,
            })
            GameRules.BuffManager.AddGeneralDebuff(this.hCaster, enemy, DebuffTypes.stunned, 3)
        }
    }
}