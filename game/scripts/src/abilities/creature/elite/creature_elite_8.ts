
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_elite_8	天火	
 * 锁定一个区域，3秒延迟后降下天火对范围内玩家造成眩晕2秒并持续灼烧，
 * 每秒损失10%最大生命值持续3秒。施法距离700码，作用范围直径300码。

 */
@registerAbility()
export class creature_elite_8 extends BaseCreatureAbility {

    OnAbilityPhaseStart(): boolean {
        this.vPoint = this.GetCursorPosition();
        this.nPreviewFX = GameRules.WarningMarker.Circular(this._radius, this._cast_point, this.vPoint)
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx()
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
            enemy.AddNewModifier(this.hCaster, this, "modifier_creature_elite_8_dot", {
                duration: this._duration + 0.1,
            })
        }

        // cast_fx
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_invoker/invoker_sun_strike.vpcf",
            ParticleAttachment.WORLDORIGIN,
            null
        );
        ParticleManager.SetParticleControl(effect_fx, 0, this.vPoint);
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(300, 0, 0));
        ParticleManager.ReleaseParticleIndex(effect_fx);
    }
}

@registerModifier()
export class modifier_creature_elite_8_dot extends BaseModifier {

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_huskar/huskar_burning_spear_debuff.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        )
        this.AddParticle(effect_fx, false, false, -1, false, false)
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        let damage = this.GetParent().GetMaxHealth() * 0.1;
        ApplyCustomDamage({
            victim: this.GetParent(),
            attacker: this.GetCaster(),
            ability: this.GetAbility(),
            damage: damage,
            damage_type: DamageTypes.PHYSICAL,
            miss_flag: 1,
        })
    }
}