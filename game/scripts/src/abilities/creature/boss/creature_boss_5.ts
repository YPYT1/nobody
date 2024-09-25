import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_boss_5	退	被动，部分技能释放结束后,.会直接击退自身直径范围内300码的玩家，造成高额伤害。
 * 该技能只会出现在特定技能结束后（伤害为玩家最大生命值25%）
 */
@registerAbility()
export class creature_boss_5 extends BaseCreatureAbility {

    OnSpellStart(): void {
        this.DestroyWarningFx();
        this.vOrigin = this.hCaster.GetAbsOrigin();
        const effect_px = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_phoenix/phoenix_supernova_reborn.vpcf",
            ParticleAttachment.ABSORIGIN,
            this.hCaster
        )
        ParticleManager.SetParticleControl(effect_px, 1, Vector(this._radius, this._radius, this._radius));
        ParticleManager.ReleaseParticleIndex(effect_px);

        let enemies = FindUnitsInRadius(
            this._team,
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
            const damage = enemy.GetMaxHealth() * this.dmg_max_hp;
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.hCaster,
                ability: this,
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                miss_flag: 1,
            })

            enemy.AddNewModifier(this.hCaster, this, "modifier_knockback_lua", {
                center_x: this.vOrigin.x,
                center_y: this.vOrigin.y,
                center_z: 0,
                knockback_height: 100,
                knockback_distance: 450,
                knockback_duration: 1,
                duration: 1,
            })
        }
    }
}