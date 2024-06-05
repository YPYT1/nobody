import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";


/**
 * 战意	
 * 战意	每次使用技能都会叠加5%攻击力和3%移动速度,持续时间20秒。最大层数8层后不再叠加，持续时间结束之后进入冷却,内置冷却:10秒
 */
@registerAbility()
export class arms_16 extends BaseArmsAbility {

    stack_buff: CDOTA_Buff;
    activate_time: number;


    stack_limit: number;

    _OnUpdateKeyValue() {
        this.activate_time = 0
        this.stack_limit = this.GetSpecialValueFor("stack_limit");
        this.RegisterEvent(["OnArmsExecuted"])
    }

    OnArmsExecuted(): void {
        // print("arms_16 OnAbilityExecuted");
        let gameTime = GameRules.GetDOTATime(false, false);
        if (this.activate_time < gameTime) {
            let buff_duration = this.GetSpecialValueFor("buff_duration")
            if (this.stack_buff == null) {
                this.stack_buff = this.caster.AddNewModifier(this.caster, this, "modifier_arms_16_stack", { duration: buff_duration })
            }
            this.stack_buff.IncrementStackCount();
            this.stack_buff.SetDuration(buff_duration, true);
            let stack = this.stack_buff.GetStackCount();
            if (stack >= this.stack_limit) {
                this.activate_time = gameTime + buff_duration + this.arms_cd
            }
        }

    }
}

@registerModifier()
export class modifier_arms_16 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_16_stack extends BaseModifier {

    stack_ad_pct: number;
    stack_mv_pct: number;
    stack_count: number;
    ability: arms_16;
    buff_key: string;

    GetAttributes(): ModifierAttribute {
        return ModifierAttribute.MULTIPLE
    }

    OnCreated(params: object): void {
        this.stack_count = 1;
        this.ability = this.GetAbility() as arms_16;
        this.stack_mv_pct = this.ability.GetSpecialValueFor("stack_mv_pct");
        this.stack_ad_pct = this.ability.GetSpecialValueFor("stack_ad_pct");
        this.buff_key = "buff_key_" + this.ability.GetEntityIndex();
    }


    OnStackCountChanged(stackCount: number): void {
        this.stack_count = this.GetStackCount();
        if (!IsServer()) { return }
        GameRules.CustomAttribute.SetAttributeInKey(this.GetParent(), this.buff_key, {
            "AttackDamage": {
                "BasePercent": this.stack_ad_pct * this.stack_count,
            },
            "MoveSpeed": {
                "BasePercent": this.stack_mv_pct * this.stack_count,
            }
        })
    }

    // DeclareFunctions(): ModifierFunction[] {
    //     return [
    //         ModifierFunction.BASEDAMAGEOUTGOING_PERCENTAGE,
    //         ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
    //     ]
    // }

    // GetModifierBaseDamageOutgoing_Percentage(event: ModifierAttackEvent): number {
    //     return this.stack_ad_pct * this.stack_count;
    // }

    // GetModifierMoveSpeedBonus_Percentage(): number {
    //     return this.stack_mv_pct * this.stack_count;
    // }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.CustomAttribute.DelAttributeInKey(this.GetParent(), this.buff_key)
        this.ability.stack_buff = null;
    }
}




