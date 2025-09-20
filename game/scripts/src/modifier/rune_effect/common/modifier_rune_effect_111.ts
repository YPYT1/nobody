import { BaseModifier, registerModifier } from '../../../utils/dota_ts_adapter';

// rune_111	累积跑动	移动速度降低15%，每移动3000码增加1%移动速度
@registerModifier()
export class modifier_rune_effect_111 extends BaseModifier {
    buff_key = 'rune_111_bonus';
    move_distance: number;
    origin: Vector;
    bonus_ms: number;

    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        this.move_distance = 0;
        this.bonus_ms = 0;
        this.origin = this.GetParent().GetAbsOrigin();
        this.StartIntervalThink(0.1);
    }

    OnRefresh(params: object): void {
        if (!IsServer()) {
            return;
        }
        let value = 1;
        if (this.GetParent().rune_level_index['rune_118']) {
            value = 2;
        }

        GameRules.CustomAttribute.SetAttributeInKey(this.GetParent(), this.buff_key, {
            MoveSpeed: {
                BasePercent: this.bonus_ms * value,
            },
        });
    }

    OnIntervalThink(): void {
        const vect = this.GetParent().GetAbsOrigin();
        const distance = ((vect - this.origin) as Vector).Length2D();
        this.move_distance += distance;
        if (this.move_distance >= 3000) {
            this.move_distance -= 3000;
            this.bonus_ms += 1;

            let value = 1;
            if (this.GetParent().rune_level_index['rune_118']) {
                value = 2;
            }

            GameRules.CustomAttribute.SetAttributeInKey(this.GetParent(), this.buff_key, {
                MoveSpeed: {
                    BasePercent: this.bonus_ms * value,
                },
            });
        }
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        GameRules.CustomAttribute.DelAttributeInKey(this.GetParent(), this.buff_key);
    }
}
