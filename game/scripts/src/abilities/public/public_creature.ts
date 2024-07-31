import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../utils/dota_ts_adapter";

// 属性
@registerAbility()
export class public_creature extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_public_creature"
    }
}

@registerModifier()
export class modifier_public_creature extends BaseModifier {

    caster: CDOTA_BaseNPC;
    attack_damage: number;

    IsHidden(): boolean {
        return true
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.attack_damage = this.caster.GetAverageTrueAttackDamage(null)
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        let enemies = FindUnitsInRadius(
            DotaTeam.BADGUYS,
            this.GetParent().GetAbsOrigin(),
            null,
            200,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.PLAYER_CONTROLLED,
            FindOrder.ANY,
            false
        );
        for (let enemy of enemies) {
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.caster,
                damage: this.attack_damage,
                damage_type: DamageTypes.PHYSICAL,
                ability: this.GetAbility(),
                element_type: ElementTypes.NONE,
                // is_primary: true,
            })
            // 播放声音

        }
    }
    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.ATTACKSPEED_BASE_OVERRIDE
        ]
    }

    GetModifierAttackSpeedBaseOverride(): number {
        return 0.001
    }
    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.FORCED_FLYING_VISION]: true,
            // [ModifierState.DISARMED]: true,
        }
    }
}