import { BaseModifier, registerModifier } from '../../../utils/dota_ts_adapter';

// rune_108	储备	每次复活后，15秒内造成的伤害翻倍，受到的伤害减半
@registerModifier()
export class modifier_rune_effect_108 extends BaseModifier {
    buff_key = 'rune_108';

    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        GameRules.CustomAttribute.SetAttributeInKey(this.GetParent(), this.buff_key, {
            FinalDamageMul: {
                Base: 100,
            },
            DmgReductionPct: {
                Base: 50,
            },
        });
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        GameRules.CustomAttribute.DelAttributeInKey(this.GetParent(), this.buff_key);
    }
}
