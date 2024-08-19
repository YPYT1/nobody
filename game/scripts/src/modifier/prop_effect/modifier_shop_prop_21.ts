import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

//prop_21	【斯嘉蒂之眼】	冰元素技能降低移速时，同时降低敌人30%攻击速度和20%冰元素抗性，持续3秒
@registerModifier()
export class modifier_shop_prop_21 extends BaseModifier {

    IsDebuff(): boolean {
        return true
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.parent = this.GetParent();
        GameRules.EnemyAttribute.SetAttributeInKey(this.parent, 'prop_21', {
            'IceResist': {
                "Base": -20
            }
        })
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.EnemyAttribute.DelAttributeInKey(this.parent, 'prop_21')
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.ATTACKSPEED_PERCENTAGE
        ]
    }

    GetModifierAttackSpeedPercentage(): number {
        return -30
    }
}