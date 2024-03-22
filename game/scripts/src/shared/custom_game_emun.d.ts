/** 元素类型 
 * 火
 * 水
 * 雷
 * 土
 * 风
 * 
*/
type CElementType = "fire" | "water" | "thunder" | "earth" | "wind" | "null";

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