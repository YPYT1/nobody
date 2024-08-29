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
        this.StartIntervalThink(1)
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }

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
        if (enemies.length > 0) {
            let attack_damage = this.caster.GetAverageTrueAttackDamage(null);
            print("attack_damage",attack_damage)
            for (let enemy of enemies) {
                ApplyCustomDamage({
                    victim: enemy,
                    attacker: this.caster,
                    damage: attack_damage,
                    damage_type: DamageTypes.MAGICAL,
                    ability: this.GetAbility(),
                    element_type: ElementTypes.NONE,
                    // is_primary: true,
                })
            }
            // 播放声音

            // 动作
            this.caster.StartGesture(GameActivity.DOTA_ATTACK)
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
            // [ModifierState.FORCED_FLYING_VISION]: true,
            // [ModifierState.DISARMED]: true,
        }
    }
}