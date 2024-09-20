
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_elite_17	自爆	
 * 精英怪被动技能：死亡时，在死亡点延迟3秒爆炸，爆炸范围半径300码。
 * （爆炸伤害为玩家最大生命值40%)
 */
@registerAbility()
export class creature_elite_17 extends BaseCreatureAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_creature_elite_17"
    }
}

@registerModifier()
export class modifier_creature_elite_17 extends BaseModifier {

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.ON_DEATH
        ]
    }

    OnDeath(event: ModifierInstanceEvent): void {
        if (event.unit == this.GetCaster()) {
            CreateModifierThinker(
                event.unit,
                this.GetAbility(),
                "modifier_creature_elite_17_blast",
                {
                    duration: 3,
                },
                event.unit.GetAbsOrigin(),
                event.unit.GetTeam(),
                false
            )
        }
    }
}

@registerModifier()
export class modifier_creature_elite_17_blast extends BaseModifier {

    origin: Vector;
    _radius = 300;
    team:DotaTeam;
    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.team = this.GetCaster().GetTeam()
        this.origin = this.GetParent().GetAbsOrigin();
        GameRules.WarningMarker.Circular(this._radius, 3, this.origin, true)
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        let casf_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_techies/techies_land_mine_explode.vpcf",
            ParticleAttachment.CUSTOMORIGIN,
            null
        )
        ParticleManager.SetParticleControl(casf_fx, 0, this.origin)
        ParticleManager.SetParticleControl(casf_fx, 1, Vector(this._radius, this._radius, this._radius))
        ParticleManager.ReleaseParticleIndex(casf_fx);
        let enemies = FindUnitsInRadius(
            this.team,
            this.origin,
            null,
            this._radius,
            UnitTargetTeam.ENEMY,
            19, // 18 + 1
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        for (let enemy of enemies) {
            let damage = enemy.GetMaxHealth() * 0.4;
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.GetCaster(),
                ability: this.GetAbility(),
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                miss_flag: 1,
            })
        }

    }
}