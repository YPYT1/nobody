import { BaseModifier, registerModifier } from '../utils/dota_ts_adapter';

@registerModifier()
export class modifier_publice_treasure_chest extends BaseModifier {
    boss_wave: number;
    loc: Vector;
    IsHidden(): boolean {
        return false;
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.NO_HEALTH_BAR]: true,
        };
    }

    OnCreated(params: any): void {
        if (!IsServer()) {
            return;
        }
        this.boss_wave = params.boss_wave ?? 1;
        this.loc = this.GetParent().GetAbsOrigin();
        this.StartIntervalThink(0.2);
    }

    OnIntervalThink(): void {
        if (!IsServer()) {
            return;
        }
        const heroes = FindUnitsInRadius(
            DotaTeam.GOODGUYS,
            this.loc,
            null,
            300,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        if (heroes.length > 0) {
            GameRules.BasicRules.BossChestReward(this.boss_wave);
            this.StartIntervalThink(-1);
            this.Destroy();
            return;
        }
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        UTIL_Remove(this.GetParent());
    }
}
