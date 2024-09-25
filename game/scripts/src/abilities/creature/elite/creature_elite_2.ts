
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_elite_2	洪流	
 * 锁定一个区域，2秒延迟后地上生出地刺攻击（伤害值为玩家最大生命值20%），击飞1秒并眩晕1秒。范围：直径300码。
 */
@registerAbility()
export class creature_elite_2 extends BaseCreatureAbility {

    knockback_duration: number;
    
    OnAbilityPhaseStart(): boolean {
        this.vPoint = this.GetCursorPosition();
        this.knockback_duration = this.GetSpecialValueFor("knockback_duration")
        this.nPreviewFX = GameRules.WarningMarker.Circular(
            this._radius,
            this._cast_point,
            this.vPoint
        )
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx()
        // file://{images}/spellicons/leshrac_split_earth.png
        let effect_fx = ParticleManager.CreateParticle(
            "particles/econ/items/leshrac/leshrac_tormented_staff/leshrac_split_tormented.vpcf",
            ParticleAttachment.CUSTOMORIGIN,
            null
        );
        ParticleManager.SetParticleControl(effect_fx, 0, this.vPoint)
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(this._radius,1,1))
        ParticleManager.ReleaseParticleIndex(effect_fx)
        let enemies = FindUnitsInRadius(
            this.hCaster.GetTeam(),
            this.vPoint,
            null,
            this._radius,
            UnitTargetTeam.ENEMY,
            19, // 18 + 1
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )

        for (let enemy of enemies) {
            let damage = enemy.GetMaxHealth() * 0.2;
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.hCaster,
                ability: null,
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                miss_flag: 1,
            })
            enemy.AddNewModifier(this.hCaster, this, "modifier_knockback_lua", {
                center_x: this.vPoint.x,
                center_y: this.vPoint.y,
                center_z: 0,
                knockback_height: 600,
                knockback_distance: 0,
                knockback_duration: this.knockback_duration,
                duration: this.knockback_duration,
            })
        }

        // cast_fx

    }

}