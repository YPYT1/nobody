
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_elite_12	欺诈	
 * 被玩家击杀时，会欺诈玩家，对自身范围300码的玩家造成伤害（玩家最大生命值20%）并强制影响玩家方向3秒。
 * （往左走，会变成往右）
 * 
 */
@registerAbility()
export class creature_elite_12 extends BaseCreatureAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_creature_elite_12"
    }
}

@registerModifier()
export class modifier_creature_elite_12 extends BaseModifier {

    radius: number;
    dmg_max_hp: number;
    
    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.ON_DEATH
        ]
    }

    OnCreated(params: object): void {
        this.OnRefresh(params)
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }
        this.radius = 300;
        this.dmg_max_hp = 20 * 0.01
    }

    OnDeath(event: ModifierInstanceEvent): void {
        if (event.unit == this.GetParent()) {
            let pos = this.GetParent().GetAbsOrigin();
            let cast_fx = ParticleManager.CreateParticle(
                "particles/units/heroes/hero_dark_willow/dark_willow_wisp_spell.vpcf",
                ParticleAttachment.WORLDORIGIN,
                null
            )
            ParticleManager.SetParticleControl(cast_fx, 0, pos);
            ParticleManager.SetParticleControl(cast_fx, 1, Vector(this.radius, 1, 1))
            ParticleManager.ReleaseParticleIndex(cast_fx);

            let enemies = FindUnitsInRadius(
                this.GetCaster().GetTeam(),
                pos,
                null,
                this.radius,
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
                    attacker: this.GetCaster(),
                    ability: this.GetAbility(),
                    damage: damage,
                    damage_type: DamageTypes.PHYSICAL,
                    miss_flag: 1,
                })

                GameRules.BuffManager.AddGeneralDebuff(this.GetCaster(), enemy, DebuffTypes.chaos, 3)
            }
        }
    }

}