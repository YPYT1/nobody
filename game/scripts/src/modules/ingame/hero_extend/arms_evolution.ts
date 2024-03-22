
import { reloadable } from "../../../utils/tstl-utils";
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";

import * as ArmsEvolutionJson from "../../../json/config/game/arms_evolution.json";


interface PlayerUpgradeStatusProps {
    [ability: string]: {
        count: number,
        upgrades: {
            [code: string]: number,
        }
    }
}


interface EvolutionTableProps {
    [ability: string]: {
        [code: string]: {
            id: string,
            kv: typeof ArmsEvolutionJson[keyof typeof ArmsEvolutionJson]
        }
    }
}
/** 技能升级相关 */
@reloadable
export class ArmsEvolution extends UIEventRegisterClass {

    PlayerUpgradeStatus: { [player: string]: PlayerUpgradeStatusProps };

    EvolutionTable: EvolutionTableProps;

    /** 玩家升级池子 */
    PlayerUpgradePool: {};

    constructor() {
        super("ArmsEvolution")
        this.PlayerUpgradeStatus = {}
        this.PlayerUpgradePool = {}
        this.InitArmsEvolutionTable()
    }


    InitArmsEvolutionTable() {
        this.EvolutionTable = {};
        for (let [id, RowData] of pairs(ArmsEvolutionJson)) {
            let Ability = RowData.Ability;
            if (this.EvolutionTable[Ability] == null) {
                this.EvolutionTable[Ability] = {}
            }
            let code_id = RowData.CodeID;
            // let Object = { ...RowData, ...{ ID: id as string } };
            this.EvolutionTable[Ability][code_id] = {
                id: id,
                kv: RowData
            };
        }

        DeepPrintTable(this.EvolutionTable)
    }

    /** 初始化玩家的升级树 */
    InitPlayerUpgradeStatus(player_id: PlayerID) {
        this.PlayerUpgradeStatus[player_id] = {}
    }

    /**
     * 火力技升级 加入池子
     * @param player_id 
     * @param ability_name 
     */
    ArmsJoinPool(player_id: PlayerID, ability_name: string) {

    }

    /**
     * 火力技移除,并返回对应选择次数
     */
    ArmsRefund(player_id: PlayerID, ability_name: string) {

    }


    /**
     * 获取当前升级选项 
     * 1.默认是3个,如果其他则可以多选
     * 2.符合条件后会出现特殊升级
     */
    GetUpgradesOptions(player_id: PlayerID) {
        
    }


    __Debug(cmd: string, args: string[], player_id: PlayerID) {
        if (cmd == "-sevo") {
            DeepPrintTable(this.EvolutionTable)
        }

        if (cmd == "-getup") {
            this.GetUpgradesOptions(player_id)
        }
    }
}