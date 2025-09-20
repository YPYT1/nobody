import { BaseModifier, registerModifier } from '../../utils/dota_ts_adapter';

// prop_10	【生人勿进】	对自身250码范围内的敌人造成的伤害提升25%
@registerModifier()
export class modifier_shop_prop_10 extends BaseModifier {
    aura_radius: number = 0;

    IsHidden(): boolean {
        return false;
    }

    RemoveOnDeath(): boolean {
        return false;
    }

    IsAura(): boolean {
        return true;
    }

    GetAuraRadius(): number {
        return this.aura_radius;
    }

    IsAuraActiveOnDeath() {
        return false;
    }

    GetAuraSearchFlags() {
        return UnitTargetFlags.NONE;
    }

    GetAuraSearchTeam() {
        return UnitTargetTeam.ENEMY;
    }

    GetAuraSearchType() {
        return UnitTargetType.HERO + UnitTargetType.BASIC;
    }

    GetModifierAura() {
        return 'modifier_shop_prop_10_aura';
    }

    GetAttributes(): DOTAModifierAttribute_t {
        return ModifierAttribute.PERMANENT + ModifierAttribute.IGNORE_INVULNERABLE + ModifierAttribute.IGNORE_DODGE;
    }

    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        print('oncreate modifier_shop_prop_10');
        this.caster = this.GetCaster();
        this.aura_radius = 250; //GameRules.MysticalShopSystem.GetKvOfUnit(this.caster, 'prop_10', 'range')
    }
}

@registerModifier()
export class modifier_shop_prop_10_aura extends BaseModifier {
    IsHidden(): boolean {
        return false;
    }

    GetAttributes(): DOTAModifierAttribute_t {
        return ModifierAttribute.MULTIPLE;
    }
}
