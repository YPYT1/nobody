/** 元素类型 
 * 0.无元素
 * 1.火
 * 2.冰
 * 3.雷
 * 4.风
 * 5.光
 * 6.暗
*/
type CElementType = "null" | "fire" | "ice" | "thunder" | "wind" | "light" | "dark" ;

declare const enum ElementTypes {
    NONE = 0,
    FIRE = 1,
    ICE = 2,
    THUNDER = 3,
    WIND = 4,
    LIGHT = 5,
    DARK = 6    
}

declare const enum ElementTypeEnum {
    null = 0,
    fire = 1,
    ice = 2,
    thunder = 3,
    wind = 4,
    light = 5,
    dark = 6    
}

// declare const enum ArmsAbilityCategory {
//     NONE = 0,
//     /** 计数型 */
//     COUNT = 1,
//     /** 范围型 */
//     AOE = 2,
//     /** 持续型伤害 */
//     DOT = 4,
//     /** 直接类伤害 */
//     DMG = 8,
//     /** 召唤类伤害 */
//     SUMMON = 16,

// }
/** 按键移动方向 */
type CMoveDirection = "UP" | "DOWN" | "LEFT" | "RIGHT";

/** 负面状态类型 */
declare const enum DebuffTypes {
    /** 无效果 */
    any = 0,
    /** 眩晕 */
    stunned = 1,
    /** 减速 [`持续时间/减速值`]*/
    slow = 2,
    /** 沉默 [无法主动施法]*/
    silenced = 3,
    /** 禁锢 [禁止移动]*/
    rooted = 4,
    /** 缴械 [无法攻击]*/
    disarmed = 5,
    /**魅惑 [缓慢靠近施法者]*/  
    charm = 6,
    /** 破坏 [被动失效]*/
    break = 7,
    /** 变形 [移速降低,无法攻击]*/
    hexed = 8,
    /** 恐惧 [逃离施法者]*/
    feared = 9,
    /** 麻痹 [禁止移动,攻速降低50%,]*/
    paralysis = 10,

}