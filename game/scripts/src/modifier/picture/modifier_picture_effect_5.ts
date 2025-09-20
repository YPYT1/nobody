import { registerModifier } from '../../utils/dota_ts_adapter';
import { StackModifier } from '../extends/modifier_stack';

@registerModifier()
export class modifier_picture_effect_5 extends StackModifier {
    buff_key = 'picture_5';
    speed_pct: number;

    UpdateValue(params: any): void {
        this.speed_pct = params.speed_pct;
    }

    OnStateChanged(event: ModifierUnitEvent): void {
        if (!IsServer()) {
            return;
        }
        this.parent.SetAttributeInKey(this.buff_key, {
            MoveSpeed: {
                BasePercent: this.speed_pct * this.GetStackCount(),
            },
        });
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        this.parent.DelAttributeInKey(this.buff_key);
    }
}
