import { BaseModifier, registerModifier } from '../../utils/dota_ts_adapter';

@registerModifier()
export class modifier_mission_radiant_6_box extends BaseModifier {
    is_kill: boolean;
    timer_fx: ParticleID;

    OnCreated(params: object): void {
        this.is_kill = false;
        if (!IsServer()) {
            return;
        }
    }

    DeclareFunctions(): modifierfunction[] {
        return [ModifierFunction.INCOMING_DAMAGE_PERCENTAGE];
    }

    GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
        // 增加进度
        this.is_kill = true;
        return 0;
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.LOW_ATTACK_PRIORITY]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.NO_HEALTH_BAR]: true,
        };
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        if (this.is_kill == true) {
            GameRules.MissionSystem.RadiantMissionHandle.AddProgressValue(1);
        }
    }
}
