import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_boss_8	移动空间	蓄力2秒后开启提示，玩家必须在3秒内保持移动，
 * 如果停下不动则会受到天降雷电的打击造成高额伤害。（伤害为玩家最大生命值75%）
 */
@registerAbility()
export class creature_boss_8 extends BaseCreatureAbility {

    OnAbilityPhaseStart(): boolean {
        this.vOrigin = this.hCaster.GetAbsOrigin();
        this.nPreviewFX = GameRules.WarningMarker.Circular(this._cast_range, this._cast_point, this.vOrigin)
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        let enemies = FindUnitsInRadius(
            this._team,
            this.vOrigin,
            null,
            9999,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )

        for (let enemy of enemies) {
            enemy.AddNewModifier(this.hCaster, this, "modifier_creature_boss_8", {
                duration: this._duration,
            })
        }
    }

}

// 禁止移动
@registerModifier()
export class modifier_creature_boss_8 extends BaseModifier {

    origin: Vector;
    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.origin = this.GetParent().GetAbsOrigin()
        let effect_fx = ParticleManager.CreateParticle(
            "particles/title_fx/title00028/title00028.vpcf",
            ParticleAttachment.OVERHEAD_FOLLOW,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(16, 0, 0))
        this.AddParticle(effect_fx, false, false, -1, false, false)
        this.StartIntervalThink(0.1)
    }

    OnIntervalThink(): void {
        const pos = this.GetParent().GetAbsOrigin()
        if (pos != this.origin) { 
            this.origin = pos;
            return 
        }
        this.ApplyDamage(this.GetParent())
    }

    ApplyDamage(hTarget: CDOTA_BaseNPC) {
        if (!hTarget.HasModifier("modifier_creature_boss_8_dmg_interval")) {
            hTarget.AddNewModifier(this.GetCaster(), this.GetAbility(), "modifier_creature_boss_8_dmg_interval", {
                duration: 1
            })
            const damage = hTarget.GetMaxHealth() * 0.75;
            ApplyCustomDamage({
                victim: hTarget,
                attacker: this.GetCaster(),
                ability: null,
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                miss_flag: 1,
            })

            let effect_px = ParticleManager.CreateParticle(
                "particles/units/heroes/hero_zuus/zuus_thundergods_wrath_start.vpcf",
                ParticleAttachment.OVERHEAD_FOLLOW,
                hTarget
            )
            ParticleManager.SetParticleControl(effect_px, 1, hTarget.GetAbsOrigin());
            ParticleManager.SetParticleControl(effect_px, 2, this.GetCaster().GetAbsOrigin());
            ParticleManager.ReleaseParticleIndex(effect_px);
        }
    }
}

@registerModifier()
export class modifier_creature_boss_8_dmg_interval extends BaseModifier {

    IsHidden(): boolean { return true }
}