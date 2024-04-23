import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 闪电护盾	"生成一个雷电护盾，护盾值为命值25%，可抵消同等伤害，受雷属性伤害减免30%。
特效：大电锤主动
持续时间：5秒
cd：8秒"

 */
@registerAbility()
export class arms_66 extends BaseArmsAbility {

    _OnUpdateKeyValue(): void {
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart(): void {
        this.caster.AddNewModifier(this.caster, this, "modifier_arms_66_shield", {
            duration: 5
        })
    }
}

@registerModifier()
export class modifier_arms_66 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_66_shield extends BaseModifier {

    value: number;

    blocked: number;

    OnCreated(params: object): void {
        this.value = math.floor(this.GetParent().GetMaxHealth() * 0.25)
        if (IsServer()) {
            this.SetStackCount(this.value)
        }
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.INCOMING_DAMAGE_CONSTANT
        ]
    }

    OnIntervalThink(): void {
        this.StartIntervalThink(-1)
        this.Destroy()
    }

    GetModifierIncomingDamageConstant(event: ModifierAttackEvent): number {
        if (IsServer()) {
            if (event.damage <= this.value) {
                this.value -= event.damage;
                this.SetStackCount(this.value)
                return -event.damage
            } else {
                this.StartIntervalThink(0.01)
                // this.SetStackCount(0)
                return this.value - event.damage
            }
            // 服务器客户端的返回值应为当前防护健康，作为正值
        } else {
            return this.value
        }

    }
}
