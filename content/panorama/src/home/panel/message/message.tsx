import { PlayerIdToARGB } from "../../../utils/method";

const LIMIT_COUNT = 10;
const MESSAGE_DURATION = 8;

interface CommonMessageProps {
    message: string;
    event_type?: number;
    data?: Object;
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
            } else if (k == "treasure_name") {
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
            } else if (k == "C_Attr") {
                MessagePanel.SetDialogVariable(k, $.Localize(`#dota_custom_attribute_${data[k]}`));
            } else {
                let value = data[k];
                if (typeof (value) == "string") {
                    MessagePanel.SetDialogVariable(k, value);
                } else {
                    MessagePanel.SetDialogVariableInt(k, value);
                }

            }
        }
    }

    // if (event.message.search("#") == -1) { event.message = "#" + event.message; }
    let sMessage = $.Localize(event.message, MessagePanel);
    MessagePanel.SetHasClass("show", true);
    MessagePanel.SetDialogVariable("event_type", "消息:");
    MessagePanel.SetDialogVariable("event_label", sMessage);
    MessagePanel.Data<PanelDataObject>().delete_time = (Game.GetDOTATime(false, false) + MESSAGE_DURATION);
};


function StartMessageTimer() {
    MessageTimer();
    $.Schedule(0.1, StartMessageTimer);
}

export function MessageTimer() {
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

export const SendErrorMessage = (params: CustomGameEventDeclarations["CMsg_SendErrorMsgToPlayer"]) => {

    let MessagePanel = $.GetContextPanel();
    let msg = params.data;
    let message = msg.message;
    let data = msg.data;
    if (data) {
        for (let key in data) {
            if (key == "message") { continue }
            let value = data[key];
            if (key.indexOf("int_") != -1) {
                if (typeof (value) == "number") {
                    MessagePanel.SetDialogVariableInt(key, value);
                } else {
                    MessagePanel.SetDialogVariableInt(key, parseInt(value));
                }

            } else if (key.indexOf("str_") != -1) {
                if (typeof (value) == "number") {
                    MessagePanel.SetDialogVariable(key, `${value}`);
                } else if (value.substr(0, 1) == "#") {
                    MessagePanel.SetDialogVariable(key, $.Localize(value));
                } else {
                    MessagePanel.SetDialogVariable(key, $.Localize("#" + value));
                }
            } else if (key == "ability_name") {
                MessagePanel.SetDialogVariable(key, $.Localize("#DOTA_Tooltip_ability_" + value));
            }
        }
    }

    let sMessage = $.Localize(message, MessagePanel);
    // if (message.substr(0, 1) == "#") {
    //     sMessage = $.Localize(message, MessagePanel);
    // } else {
    //     sMessage = $.Localize("#" + message, MessagePanel);
    // }
    //let sMessage = $.Localize("#"+message, MessagePanel);
    let eventData = { reason: 80, message: sMessage, sequenceNumber: 0 };
    GameEvents.SendEventClientSide("dota_hud_error_message", eventData);
};

const element_color: [number, number, number][] = [
    [255, 255, 255], // 无
    [255, 33, 25], // 火
    [77, 228, 255], // 冰
    [193, 126, 255], // 雷
    [148, 255, 77], // 风
    [255, 240, 173], // 光
    [161, 0, 140], // 暗
];

export const DamageFloating = (event: CustomGameEventDeclarations["Popup_DamageNumberToClients"]) => {
    // $.Msg(["Popup_DamageNumberToClients",event])
    const duration = 1;
    let params = event.data;
    let element = params.element_type ?? 0;

    let damage_value = params.value;
    let damage_type = params.type;
    let entity = params.entity as EntityIndex;


    let digits = String(damage_value).length + 1;


    let color = element_color[element]
    let pidx = Particles.CreateParticle(
        "particles/diy/msg_damage.vpcf",
        ParticleAttachment_t.PATTACH_WORLDORIGIN,
        entity
    );
    Particles.SetParticleControl(pidx, 0, Entities.GetAbsOrigin(entity));
    Particles.SetParticleControl(pidx, 1, [1, damage_value, 3]);
    Particles.SetParticleControl(pidx, 2, [duration, digits, 0]);
    Particles.SetParticleControl(pidx, 3, color);
    Particles.ReleaseParticleIndex(pidx);
}


let BossWarningPanel = $("#BossWarningPanel");
let EventWarning = $("#EventWarning");
let EventDuration: { [key: string]: number } = {
    "102": 5,
}
const CMsg_SendMsgToAll = (params: CustomGameEventDeclarations["CMsg_SendMsgToAll"]) => {
    let data = params.data;
    let event_type = data.event_type;
    if (event_type == 201) {
        BossWarningPanel.AddClass("Show");
        $.Schedule(3, () => {
            BossWarningPanel.RemoveClass("Show")
        })
    } else if (event_type == 101) {
        let eventPanel = EventWarning.FindChildTraverse("101")!;
        eventPanel.AddClass("Show");
        $.Schedule(3, () => {
            eventPanel.RemoveClass("Show")
        })
    } else {
        let eventPanel = EventWarning.FindChildTraverse(`${event_type}`)!;
        if (eventPanel != null) {
            eventPanel.AddClass("Show");
            let duration = EventDuration[`${event_type}`] ?? 3;
            $.Schedule(duration, () => {
                eventPanel.RemoveClass("Show")
            })
        }

    }
}

export const Init = () => {
    StartMessageTimer();
    GameEvents.Subscribe("CMsg_SendCommonMsgToPlayer", event => {
        let data = event.data;
        const message_object = { "message": data.message, "data": data.data };
        CreateCommonMessage(message_object);
    })

    GameEvents.Subscribe("CMsg_SendErrorMsgToPlayer", SendErrorMessage)
    GameEvents.Subscribe("Popup_DamageNumberToClients", DamageFloating)
    GameEvents.Subscribe("CMsg_SendMsgToAll", CMsg_SendMsgToAll)

}

(function () {
    Init()
})();