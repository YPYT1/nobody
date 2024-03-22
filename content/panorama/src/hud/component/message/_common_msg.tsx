import React from 'react';
import { useGameEvent } from 'react-panorama-x';
import { PlayerIdToARGB } from '../../../utils/method';

const LIMIT_COUNT = 10;
const MESSAGE_DURATION = 8;

interface CommonMessageProps {
    message: string;
    event_type: number;
    data?: Object;
}

const OnStart = () => {
    // LoopSendMessage();
    StartMessageTimer();
};

function StartMessageTimer() {
    MessageTimer();
    $.Schedule(0.03, StartMessageTimer);
}

function MessageTimer() {
    let current_time = Game.GetDOTATime(false, false);
    let CommonManager = $("#CommonManager");
    for (let i = 0; i < CommonManager.GetChildCount(); i++) {
        let row_panel = CommonManager.GetChild(i);
        if (row_panel) {
            let del_time: number = row_panel?.Data<PanelDataObject>().delete_time;
            if (current_time >= del_time) {
                row_panel.SetHasClass("hide", true);
                row_panel.SetHasClass("show", false);
                row_panel.DeleteAsync(1);
            }
        }
    }
}
interface MessageDataProps {
    [key: string]: number | string;
    player_id: PlayerID;
}

const CreateCommonMessage = (event: CommonMessageProps) => {
    // MessageEventIte
    let CommonManager = $("#CommonManager");
    let current_count = CommonManager.GetChildCount();
    // $.Msg(current_count);
    if (current_count >= LIMIT_COUNT) {
        let row = CommonManager.GetChild(0);
        row?.DeleteAsync(0);
    }

    let MessagePanel = $.CreatePanel("Panel", CommonManager, "");
    MessagePanel.BLoadLayoutSnippet("MessageEventItem");
    let data = event.data as MessageDataProps;
    if (data) {
        for (let k in data) {
            if (k == "player_id") {
                const sPlayerName = Players.GetPlayerName(data["player_id"]);
                const sPlayerColor = PlayerIdToARGB(Players.GetPlayerColor(data["player_id"]));
                MessagePanel.SetDialogVariable("player_id", "<font color='#" + sPlayerColor + "'>" + sPlayerName + "</font>");
            } else if (k == "ability_name") {
                MessagePanel.SetDialogVariable("ability_name", $.Localize(`#DOTA_Tooltip_Ability_${data[k]}`));
            } else if (k == "item_name") {
                MessagePanel.SetDialogVariable("item_name", $.Localize(`#DOTA_Tooltip_Ability_${data[k]}`));
            }else if (k == "treasure_name") {
                const treasure_level = (data["treasure_level"] ?? 1) as number;
                const treasure_name = $.Localize(`#DOTA_Tooltip_Ability_${data[k]}`);
                const treasure_span = `<span class="treasure_level lv_${treasure_level}">${treasure_name}</span>`;
                MessagePanel.SetDialogVariable("treasure_name", treasure_span);
            } else if (k == "gold") {
                const value = data[k];
                MessagePanel.SetDialogVariable(k, `<span class="gold_color">${value}</span>`);
            } else if (k == "wood") {
                const value = data[k];
                MessagePanel.SetDialogVariable(k, `<span class="wood_color">${value}</span>`);
            } else if (k == "C_Attr"){
                MessagePanel.SetDialogVariable(k, $.Localize(`#dota_custom_attribute_${data[k]}`));
            }

            else {
                let value = data[k];
                if (typeof (value) == "string") {
                    MessagePanel.SetDialogVariable(k, value);
                } else {
                    MessagePanel.SetDialogVariableInt(k, value);
                }

            }
        }
    }

    if (event.message.search("#") == -1) { event.message = "#" + event.message; }
    let sMessage = $.Localize(event.message, MessagePanel);
    MessagePanel.SetHasClass("show", true);
    MessagePanel.SetDialogVariable("event_type", "消息:");
    MessagePanel.SetDialogVariable("event_label", sMessage);
    MessagePanel.Data<PanelDataObject>().delete_time = (Game.GetDOTATime(false, false) + MESSAGE_DURATION);
};

export const WarningManager = () => {

    return (
        <Panel id="WarningManager" hittest={false} >
            <Panel className="warning-panel" hittest={false} hittestchildren={false}>
                <Panel id="TopStripe" className='strip-panel'>
                    <Panel className='scroll-left warning-strip' hittest={false} />
                </Panel>
                <Panel id="WarningLabel" hittest={false} >
                    <Label id="warning-text" localizedText="Warning" />
                </Panel>
                <Panel id="BottomStripe" className='strip-panel'>
                    <Panel className='scroll-right warning-strip' hittest={false} />
                </Panel>
            </Panel>
        </Panel>
    );
};



/** 通用消息 */
export const CommonMessage = () => {

    // useGameEvent("CMsg_SendCommonMsgToPlayer", event => {
    //     let data = event.data;
    //     const message_object = { "message": data.message, "event_type": data.event_type, "data": data.data };
    //     CreateCommonMessage(message_object);
    // }, []);

    // 玩家资源获取
    // useGameEvent("PlayerInfo_ResourcesGetTip", event => {
    //     let data = event.data;
    //     const amount = data.amount;
    //     const type = data.type;
    //     const unit = data.unit;
    //     let duration = 1;
    //     let digits = String(amount).length + 1;
    //     let color: [number, number, number] = [255, 215, 0];
    //     if (type == "Wood") {
    //         color = [50, 255, 50];
    //     }

    //     let msg_fx = Particles.CreateParticle(
    //         "particles/msg_fx/msg_damage.vpcf",
    //         ParticleAttachment_t.PATTACH_WORLDORIGIN,
    //         unit
    //     );
    //     Particles.SetParticleControl(msg_fx, 0, Entities.GetAbsOrigin(unit));
    //     Particles.SetParticleControl(msg_fx, 1, [0, amount, 0]);
    //     Particles.SetParticleControl(msg_fx, 2, [duration, digits, 0]);
    //     Particles.SetParticleControl(msg_fx, 3, color);
    //     Particles.ReleaseParticleIndex(msg_fx);
    // }, []);

    return (
        <Panel id="CommonMessage" className='BottomToTopMessagePanel' hittest={false}>
            <Panel id="CommonManager" className='ManagerList' hittest={false} onload={() => { OnStart(); }} />
        </Panel>
    );
};