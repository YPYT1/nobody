import { BaseAbility, BaseModifier, registerAbility, registerModifier } from '../../utils/dota_ts_adapter';

// 相位移动
@registerAbility()
export class public_phase_move extends BaseAbility {
    GetIntrinsicModifierName(): string {
        return 'modifier_public_phase_move';
    }
}

@registerModifier()
export class modifier_public_phase_move extends BaseModifier {
    IsHidden(): boolean {
        return true;
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            // [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.NO_HEALTH_BAR]: true,
        };
    }
}
