import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../utils/dota_ts_adapter";

// 相位移动
@registerAbility()
export class public_dummy extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_public_dummy";
    }

}

@registerModifier()
export class modifier_public_dummy extends BaseModifier {

    IsHidden(): boolean {
        return true
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.MIN_HEALTH
        ]
    }

    GetMinHealth(): number {
        return 1
    }
}