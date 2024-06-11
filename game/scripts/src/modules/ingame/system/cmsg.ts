
import { reloadable } from "../../../utils/tstl-utils";
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";

@reloadable
export class CMsg extends UIEventRegisterClass {

    constructor() {
        super("CMsg");
    }

    /**
     * 发送消息给单个或全体玩家
     * @param player_id 
     * @param message 
     * @param data 
     */
    SendCommonMsgToPlayer(player_id: PlayerID, message: string, data?: object) {
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
    SendErrorMsgToPlayer(player_id: PlayerID, message: string, data?: object) {
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
}