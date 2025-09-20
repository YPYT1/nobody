import { BaseAbility, BaseModifier, registerAbility, registerModifier } from '../../utils/dota_ts_adapter';

// 傀儡单位
@registerAbility()
export class public_dummy extends BaseAbility {
    GetIntrinsicModifierName(): string {
        return 'modifier_public_dummy';
    }
}

@registerModifier()
export class modifier_public_dummy extends BaseModifier {
    IsHidden(): boolean {
        return true;
    }

    OnIntervalThink(): void {
        this.StartIntervalThink(-1);
        const hParent = this.GetParent();
        hParent.SetHealth(hParent.GetMaxHealth());
    }

    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.MIN_HEALTH, ModifierFunction.INCOMING_DAMAGE_PERCENTAGE];
    }

    GetMinHealth(): number {
        return 1;
    }

    GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
        this.StartIntervalThink(5);
        return 0;
    }
}
