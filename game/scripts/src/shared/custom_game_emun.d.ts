/** 元素类型 
 * 火
 * 水
 * 雷
 * 土
 * 风
 * 
*/
type CElementType = "fire" | "water" | "thunder" | "earth" | "wind" | "null";

/** 负面状态类型 */
declare const enum DebuffTypes {
    /** 无效果 */
    any = 0,
    /** 眩晕 */
    stunned = 1,
    /** 减速 `持续时间/减速值`*/
    slow = 2,
    /** 沉默*/
    silenced = 3,
    /** 禁锢*/
    rooted = 4,
    /** 缴械 */
    disarmed = 5,
    /**魅惑 */
    charm = 6,
    /** 破坏 */
    break = 7,
    /** 变形 */
    hexed = 8,
    /** 恐惧 */
    feared = 9

}