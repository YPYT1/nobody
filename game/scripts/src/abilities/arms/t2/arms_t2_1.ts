import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";

/**
 * 【唤雷】：召唤雷电对范围内单个敌人进行电疗。
 * 技能cd：3s
   技能范围：800码
   技能伤害：500%英雄攻击力·雷元素·伤害
   技能特效：宙斯大招
 */
@registerAbility()
export class arms_t2_1 extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_arms_t2_1"
    }
    
}

@registerModifier()
export class modifier_arms_t2_1 extends BaseModifier {

    

}