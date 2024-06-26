import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 召唤骷髅	"召唤一名骷髅，骷髅会跟随英雄攻击周围的敌方单位。
骷髅兵持续时间：40
骷髅兵攻击力：攻击力10%*暗元素伤害
骷髅兵攻击间隔：1.0
骷髅兵血量：自身最大生命值*（1+暗元素等级系数）*20%
骷髅兵护甲：3
骷髅兵移速：350
召唤上限：2
CD：15"

 */
@registerAbility()
export class arms_10 extends BaseArmsAbility {

    InitCustomAbilityData(): void {
        this.RegisterEvent(["OnArmsInterval"])
    }

    OnArmsInterval(): void {
        this.ability_damage = this.GetAbilityDamage();
        let summoned_duration = this.GetSpecialValueFor("summoned_duration")
        let vLoc = this.caster.GetAbsOrigin() + RandomVector(200) as Vector;
        let summoned_unit = GameRules.SummonedSystem.CreatedUnit(
            "summoned_skeleton1",
            vLoc,
            this.caster,
            summoned_duration
        )
        summoned_unit.AddNewModifier(this.caster, this, "modifier_arms_158_summoned", {})

    }


}

@registerModifier()
export class modifier_arms_10 extends BaseArmsModifier {


}