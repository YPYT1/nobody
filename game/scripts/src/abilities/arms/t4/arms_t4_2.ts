import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 洗劫	每次攻击窃取%steal_soul%点灵魂，并回复等额生命值。
 */
@registerAbility()
export class arms_t4_2 extends BaseArmsAbility {

}

@registerModifier()
export class modifier_arms_t4_2 extends BaseArmsModifier {

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.ON_ATTACK,
            ModifierFunction.ON_ATTACK_START,
            ModifierFunction.ON_ATTACKED,
        ]
    }

    OnAttack(event: ModifierAttackEvent): void {
        print("OnAttack")
    }

    OnAttackStart(event: ModifierAttackEvent): void {
        print("OnAttackStart")
    }

    OnAttacked(event: ModifierAttackEvent): void {
        print("OnAttacked")
    }
}