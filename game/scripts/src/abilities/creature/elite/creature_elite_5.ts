
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";



/**
 * creature_elite_5	隐身	
 * 在玩家视野范围内时遁入隐身，隐身破影触碰到玩家时造成攻击力2倍伤害。在玩家300码范围内时可被侦查到。
 */
@registerAbility()
export class creature_elite_5 extends BaseCreatureAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_creature_elite_5"
    }
}

@registerModifier()
export class modifier_creature_elite_5 extends BaseModifier {

    parent: CDOTA_BaseNPC;
    relieve_radius: number;

    OnCreated(params: object): void {
        this.relieve_radius = this.GetAbility().GetSpecialValueFor("relieve_radius")
        if (!IsServer()) { return }
        this.parent = this.GetParent();
        this.StartIntervalThink(0.1)
        // 加个感叹号
        let cast_fx = GameRules.WarningMarker.CreateExclamation(this.GetParent());
        this.AddParticle(cast_fx, false, false, -1, false, false)
    }

    OnIntervalThink(): void {
        let unit = FindUnitsInRadius(
            this.parent.GetTeamNumber(),
            this.parent.GetAbsOrigin(),
            null,
            this.relieve_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        this.SetStackCount(unit.length)
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.INVISIBLE]: true,
            [ModifierState.PROVIDES_VISION]: this.GetStackCount() > 0
        }
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.INVISIBILITY_LEVEL,
            ModifierFunction.INCOMING_DAMAGE_PERCENTAGE,
            ModifierFunction.BASEDAMAGEOUTGOING_PERCENTAGE,
        ]
    }

    GetModifierInvisibilityLevel(): number {
        return 10
    }

    GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
        this.Destroy()
        return 0
    }

    GetModifierBaseDamageOutgoing_Percentage(event: ModifierAttackEvent): number {
        return 100
    }
}
