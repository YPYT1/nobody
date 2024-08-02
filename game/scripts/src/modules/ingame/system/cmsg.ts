
import { reloadable } from "../../../utils/tstl-utils";
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";

type TopHealthBarTyps = "Boss" | "King";

@reloadable
export class CMsg extends UIEventRegisterClass {

    elite_list: EntityIndex[];
    boss_list: EntityIndex[];
    king_list: EntityIndex[];

    constructor() {
        super("CMsg");
        this.elite_list = [];
        this.boss_list = [];
        this.king_list = [];
    }

    /**
     * 发送消息给单个或全体玩家
     * @param player_id 
     * @param message 
     * @param data 
     */
    SendCommonMsgToPlayer(player_id: PlayerID, message: string, data?: MessageObjectDataProps) {
        if (player_id == -1) {
            CustomGameEventManager.Send_ServerToAllClients(
                "CMsg_SendCommonMsgToPlayer",
                {
                    data: {
                        message: message,
                        data: data,
                    }
                }
            );
        } else {
            CustomGameEventManager.Send_ServerToPlayer(
                PlayerResource.GetPlayer(player_id),
                "CMsg_SendCommonMsgToPlayer",
                {
                    data: {
                        message: message,
                        data: data,
                    }
                }
            );
        }
    }

    /**
     * 发送错误信息文字 弹框到游戏屏幕中间
     * @param player_id 
     * @param message 
     * @param data 
     */
    SendErrorMsgToPlayer(player_id: PlayerID, message: string, data?: MessageObjectDataProps) {
        if (player_id == -1) {
            CustomGameEventManager.Send_ServerToAllClients(
                "CMsg_SendErrorMsgToPlayer",
                {
                    data: {
                        message: message,
                        data: data,
                    }
                }
            );
        } else {
            CustomGameEventManager.Send_ServerToPlayer(
                PlayerResource.GetPlayer(player_id),
                "CMsg_SendErrorMsgToPlayer",
                {
                    data: {
                        message: message,
                        data: data,
                    }
                }
            );
        }
    }

    /**
     * 设置一个血条到客户端
     * @param hUnit 
     */
    SetBossHealthBar(hUnit: CDOTA_BaseNPC, barTypes: TopHealthBarTyps = "Boss") {
        let unit_entity = hUnit.GetEntityIndex();
        this.boss_list.push(unit_entity);
        this.GetEntityListHealthBar(-1, {});
    }

    RemoveBossHealthBar(hUnit: CDOTA_BaseNPC) {
        if (hUnit == null || IsValid(hUnit) || hUnit.UnitCanRespawn()) { return; }
        let unit_entity = hUnit.GetEntityIndex();
        let index = this.boss_list.indexOf(unit_entity);
        if (index > -1) {
            table.remove(this.boss_list, index + 1);
            this.GetEntityListHealthBar(-1, {});
            return
        }

        let index2 = this.king_list.indexOf(unit_entity);
        if (index2 > -1) {
            table.remove(this.king_list, index2 + 1);
            this.GetEntityListHealthBar(-1, {});
            return
        }
    }

    RemoveAllHealthBar() {
        for (let entity of this.boss_list) {
            let hUnit = EntIndexToHScript(entity);
            UTIL_Remove(hUnit);
        }
        this.boss_list = [];
        this.GetEntityListHealthBar(-1, {});
    }
    GetEntityListHealthBar(player_id: PlayerID, params: any) {
        if (player_id == -1) {
            CustomGameEventManager.Send_ServerToAllClients(
                "CMsg_GetEntityListHealthBar",
                {
                    data: {
                        boss_list: this.boss_list,
                    }
                }
            );
        } else {
            CustomGameEventManager.Send_ServerToPlayer(
                PlayerResource.GetPlayer(player_id),
                "CMsg_GetEntityListHealthBar",
                {
                    data: {
                        boss_list: this.boss_list,
                    }
                }
            );
        }

    }


    Debug(cmd: string, args: string[], player_id: PlayerID): void {
        if (cmd == "-msg") {
            let message = args[0];
            CustomGameEventManager.Send_ServerToAllClients(
                "CMsg_SendCommonMsgToPlayer",
                {
                    data: {
                        message: message,
                        // data: data,
                    }
                }
            );
        }
    }
}