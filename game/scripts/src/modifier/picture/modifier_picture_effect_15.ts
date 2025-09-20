import { BaseModifier, registerModifier } from '../../utils/dota_ts_adapter';

// 15	邪恶LV%lv%:周围500码友军获得5%移动速度加成和每秒1/S生命值恢复
@registerModifier()
export class modifier_picture_effect_15 extends BaseModifier {
    radius: number = 0;
    ms_pct = 0;
    hp_regen = 0;

    IsAura(): boolean {
        return true;
    }

    GetAuraRadius(): number {
        return this.radius;
    }

    GetAuraSearchFlags() {
        return UnitTargetFlags.NONE;
    }

    GetAuraSearchTeam() {
        return UnitTargetTeam.FRIENDLY;
    }

    GetAuraSearchType() {
        return UnitTargetType.HERO + UnitTargetType.BASIC;
    }

    GetModifierAura() {
        return 'modifier_picture_effect_15_aura';
    }

    OnCreated(params: any): void {
        if (!IsServer()) {
            return;
        }
        this.radius = params.radius;
        this.ms_pct = params.ms_pct;
        this.hp_regen = params.hp_regen;
    }
}

@registerModifier()
export class modifier_picture_effect_15_aura extends BaseModifier {
    buff_key = 'picture_15';

    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        this.parent = this.GetParent();
        const buff = this.GetAuraOwner().FindModifierByName('modifier_picture_effect_15') as modifier_picture_effect_15;
        const ms_pct = buff ? buff.ms_pct : 0;
        const hp_regen = buff ? buff.hp_regen : 0;
        this.parent.SetAttributeInKey(this.buff_key, {
            MoveSpeed: {
                BasePercent: ms_pct,
            },
            HealthRegen: {
                Base: hp_regen,
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
