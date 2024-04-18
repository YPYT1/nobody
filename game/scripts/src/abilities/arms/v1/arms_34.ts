import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";


/**
 * 灭魔之道	每次击杀敌人时，永久增加1点攻击力。至多叠加500攻击力。
 */
@registerAbility()
export class arms_34 extends BaseArmsAbility {

    killed_ad: number;
    limit_kill: number;

    _OnUpdateKeyValue(): void {
        this.killed_ad = this.GetSpecialValueFor("killed_ad")
        this.limit_kill = this.GetSpecialValueFor("limit_kill")
        this.RegisterEvent(["OnKill"])
    }

    OnKill(hTarget: CDOTA_BaseNPC): void {
        if (this.killed_ad < this.limit_kill) {
            this.killed_ad += 1;
            this.buff.SetStackCount(this.killed_ad)
            GameRules.CustomAttribute.ModifyAttribute(this.caster, {
                "AttackDamage": {
                    "Base": this.killed_ad
                }
            })
        }
    }
}

@registerModifier()
export class modifier_arms_34 extends BaseArmsModifier {

    IsHidden(): boolean {
        return false
    }
}
