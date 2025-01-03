
import { reloadable } from "../../../utils/tstl-utils";
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";

type TopHealthBarTyps = "Boss" | "King";

/** 伤害统计刷新间隔 */
const DAMAGE_RECORD_UPDATE_INTERVAL = 1

@reloadable
export class CMsg extends UIEventRegisterClass {

    elite_list: EntityIndex[];
    boss_list: EntityIndex[];
    king_list: EntityIndex[];

    top_countdown: number;

    player_damage_record: number[];
    update_damage_record_time: number;

    constructor() {
        super("CMsg", true);
        this.elite_list = [];
        this.boss_list = [];
        this.king_list = [];
        this.top_countdown = 0;
        this.player_damage_record = [0, 0, 0, 0];
        this.update_damage_record_time = 0
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
     *  发送公共消息通知
     */
    SendMsgToAll(event_type: CGMessageEventType) {
        CustomGameEventManager.Send_ServerToAllClients(
            "CMsg_SendMsgToAll",
            {
                data: {
                    event_type: event_type,
                    message: "",
                }
            }

        );
    }


    /** 发送顶部倒计时 */
    SendTopCountdown(end_timer: number) {
        this.top_countdown = end_timer
        CustomGameEventManager.Send_ServerToAllClients(
            "CMsg_TopCountdown",
            {
                data: {
                    end_timer: this.top_countdown,
                }
            }

        );
    }

    GetTopCountdown(player_id: PlayerID, params: any) {
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "CMsg_TopCountdown",
            {
                data: {
                    end_timer: this.top_countdown,
                }
            }

        );
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
     * 发送服务器消息到玩家
     * @param player_id -1则为全体玩家
     * @param code 
     * @param message 
     * @param type 
     * @param data 
     */
    SendServerMsgToPlayer(player_id: PlayerID, code: number, message: string, type: number = 0, data?: any) {
        if (player_id == -1) {
            CustomGameEventManager.Send_ServerToAllClients(
                "CMsg_SendServerMsgToPlayer",
                {
                    code,
                    message,
                    type,
                    data,
                }
            );
        } else {
            CustomGameEventManager.Send_ServerToPlayer(
                PlayerResource.GetPlayer(player_id),
                "CMsg_SendServerMsgToPlayer",
                {
                    code,
                    message,
                    type,
                    data,
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
        // print("unit_entity",unit_entity)
        this.boss_list.push(unit_entity);
        this.GetEntityListHealthBar(-1, {});
    }

    RemoveBossHealthBar(hUnit: CDOTA_BaseNPC) {
        if (hUnit == null || IsValid(hUnit)) { return; }
        let unit_entity = hUnit.GetEntityIndex();
        let index = this.boss_list.indexOf(unit_entity);
        // print("RemoveBossHealthBar", index, unit_entity)
        if (index > -1) {
            table.remove(this.boss_list, index + 1);
            this.GetEntityListHealthBar(-1, {});
            return
        }

        // let index2 = this.king_list.indexOf(unit_entity);
        // if (index2 > -1) {
        //     table.remove(this.king_list, index2 + 1);
        //     this.GetEntityListHealthBar(-1, {});
        //     return
        // }
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

    Popups(target: CDOTA_BaseNPC, popup_type: PopupsType, amount: number, player?: CDOTAPlayerController) {
        if (player) {
            CustomGameEventManager.Send_ServerToPlayer(
                player,
                "CMsg_PopupUnitState",
                {
                    data: {
                        unit: target.entindex(),
                        popup_type: popup_type,
                        amount: amount,
                    }
                }
            )
        } else {
            CustomGameEventManager.Send_ServerToAllClients(
                "CMsg_PopupUnitState",
                {
                    data: {
                        unit: target.entindex(),
                        popup_type: popup_type,
                        amount: amount,
                    }
                }
            )
        }

    }

    AddDamageRecord(player_id: PlayerID, damage: number) {
        this.player_damage_record[player_id] += damage;

        const update_state = GameRules.GetDOTATime(false, false) > this.update_damage_record_time
        if (update_state) {
            this.update_damage_record_time = GameRules.GetDOTATime(false, false) + DAMAGE_RECORD_UPDATE_INTERVAL
            this.GetDamageRecord()
        } else {
            GameRules.GetGameModeEntity().SetContextThink("damage_record_interval", () => {
                this.GetDamageRecord();
                return null
            }, DAMAGE_RECORD_UPDATE_INTERVAL)
        }
    }

    GetDamageRecord(...arg: any) {
        CustomGameEventManager.Send_ServerToAllClients(
            "CMsg_GetDamageRecord",
            {
                data: {
                    dmg_record: this.player_damage_record,
                }
            }
        );
    }

    BossCastWarning(show: boolean, message?: string, data?: MessageObjectDataProps) {
        CustomGameEventManager.Send_ServerToAllClients(
            "CMsg_BossCastWarning",
            {
                data: {
                    show: show ? 1 : 0,
                    message: message,
                    data: data,
                }
            }
        );
    }

    ClearDamageRecord() {
        this.player_damage_record = [0, 0, 0, 0];
        this.GetDamageRecord()
    }

    AbilityChannel(hCaster: CDOTA_BaseNPC, hMdf: CDOTA_Buff, state: number) {
        if (hMdf.GetAbility() == null) { return }
        if ((hMdf.is_clone ?? 0) == 1) { return }
        hMdf.GetAbility().SetFrozenCooldown(state == 1);
        if (state == 1) {
            GameRules.BasicRules.StopMove(hCaster)
        }

        const ability_name = hMdf.GetAbility().GetAbilityName();
        const channel_time = hMdf.GetDuration();
        CustomGameEventManager.Send_ServerToPlayer(
            hCaster.GetPlayerOwner(),
            "CMsg_AbilityChannel",
            {
                data: {
                    state: state,
                    ability_name: ability_name,
                    channel_time: channel_time,
                }
            }
        )
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

        if (cmd == "-event") {
            let event_id = tonumber(args[0] ?? "101");
            this.SendMsgToAll(event_id)
        }

        if (cmd == "-timer") {
            print("timer")
            this.SendTopCountdown(GameRules.GetDOTATime(false, false) + 3)
        }
    }
}