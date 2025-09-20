import { BaseModifier, registerModifier } from '../../utils/dota_ts_adapter';

//prop_38	【缚灵索】	攻击自身的敌人会被束缚1秒
@registerModifier()
export class modifier_shop_prop_38 extends BaseModifier {
    // GetTexture(): string {
    //     return ""
    // }

    IsDebuff(): boolean {
        return true;
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.ROOTED]: true,
        };
    }

    GetEffectName(): string {
        return 'particles/items3_fx/gleipnir_root.vpcf';
    }

    GetEffectAttachType(): ParticleAttachment_t {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }
}
