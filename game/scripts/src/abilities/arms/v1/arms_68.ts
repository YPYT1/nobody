import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";
import { arms_67, modifier_arms_67_thinker } from "./arms_67";

/**
 * 弧形闪电II	"释放一道会跳跃穿越附近敌人的闪电，造成雷元素伤害，跳跃8次
特效：宙斯1技能，效果更大
cd：3秒
伤害系数：攻击力250%·雷元素伤害
作用范围：直径700码以内随机目标"

 */
@registerAbility()
export class arms_68 extends arms_67 {

    mdf_tinker: string = "modifier_arms_68_thinker";

    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource("particle", "particles/econ/items/zeus/zeus_ti8_immortal_arms/zeus_ti8_immortal_arc.vpcf", context)
    }

}

@registerModifier()
export class modifier_arms_68 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_68_thinker extends modifier_arms_67_thinker {

    effect_name: string = "particles/econ/items/zeus/zeus_ti8_immortal_arms/zeus_ti8_immortal_arc.vpcf";

}