interface PlayerUpgradeStatusProps {
    abilitydata : { //玩家技能数据
        [ability: string]: {
            count: number, //实际消耗点数
            calculatecount: number, //计算点数
            upgrades: {
                [code: string]: number,
            }
        }
    }
}


interface PlayerRuneDataProps {
    [key: string]: number,
}

/**
 * PlayerUpgradeSelectServerData
 */
declare interface PlayerUpgradeSelectServerData {
    arms_list: { [index: number ]: PlayerUpgradeSelectServer; },  //可选技能列表
    is_select : number , //是否可以选择 用于是否显示
}


/**
 * PlayerUpgradeSelectServer
 */
declare interface PlayerUpgradeSelectServer {
    lv : number , //技能当前等级
    key: string;  //技能下标
}

/**
 * 技能数据返回列表
 */
declare interface PlayerUpgradeSelectRetData {
    Data: PlayerUpgradeSelectServerData ; //可选列表
    EvolutionPoint : number //技能点
    ConsumeEvolutionPoint : number //已使用的技能点
}



declare interface PlayerRuneSelectServerData {
    rune_list: { [index: number ]: PlayerRuneSelectServer; },  //可选技能列表
    is_select : number , //是否可以选择 用于是否显示
}

declare interface PlayerRuneSelectServer {
    key: string;  //符文下标
}


declare interface PlayerRuneSelectRetData {
    Data: PlayerRuneSelectServerData ; //可选列表
    EvolutionPoint : number //技能点
    ConsumeEvolutionPoint : number //已使用的技能点
}