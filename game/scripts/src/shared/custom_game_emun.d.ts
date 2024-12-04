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
type CMoveDirection = "UP" | "DOWN" | "LEFT" | "RIGHT" | "SPACE";

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
    /** 魅惑 [缓慢靠近施法者]*/  
    charm = 6,
    /** 破坏 [被动失效]*/
    break = 7,
    /** 变形 [移速降低,无法攻击]*/
    hexed = 8,
    /** 恐惧 [逃离施法者]*/
    feared = 9,
    /** 麻痹 [禁止移动,攻速降低50%,]*/
    paralysis = 10,
    /** 混乱 `反方向移动` */
    chaos = 11,
    /** 不可操作 WASD失效*/
    un_controll = 12,
    /** 冻结 */
    frozen = 13,
    /** 致命 */
    fatal = 14,

}

declare const enum CGMessageEventType {
    MESSAGE1 = 101, //对应消息 海量怪物即将来袭，是男人就坚持下去…… 持续时间3秒
    MESSAGE2 = 102, //对应消息 请使用W,A,S,D或方向键进行移动…… 持续时间5秒
    MESSAGE3 = 103, //对应消息 BOSS即将来袭，请准备应对…… 持续时间3秒
    MESSAGE4 = 104, //对应消息 最终BOSS即将来袭，请准备应对……  持续时间3秒
    MESSAGE5 = 105, //对应消息 即将开启灵魂商店，可自行购买灵魂道具…… 持续时间3秒
    MESSAGE6 = 106, //对应消息 他们又来了，他们更强了…… 持续时间3秒
    // BOSS警告
    WARNINGBOSS = 201, // boss警告 持续时间3秒
    // 
    WARNINGTS = 202, // boss警告 持续时间3秒
}

/** 元素特性状态 */
declare const enum ElementState {
    null = 0,
    burn = 1,  
}
