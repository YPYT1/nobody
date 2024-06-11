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

export function PlayerIdToARGB(i: number) {
    return ('00' + (i & 0xFF).toString(16)).substr(-2) +
        ('00' + ((i >> 8) & 0xFF).toString(16)).substr(-2) +
        ('00' + ((i >> 16) & 0xFF).toString(16)).substr(-2) +
        ('00' + ((i >> 24) & 0xFF).toString(16)).substr(-2);
}
export const CreateCommonMessage = (event: CommonMessageProps) => {
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

    if (event.message.search("#") == -1) { event.message = "#" + event.message; }
    let sMessage = $.Localize(event.message, MessagePanel);
    MessagePanel.SetHasClass("show", true);
    MessagePanel.SetDialogVariable("event_type", "消息:");
    MessagePanel.SetDialogVariable("event_label", sMessage);
    MessagePanel.Data<PanelDataObject>().delete_time = (Game.GetDOTATime(false, false) + MESSAGE_DURATION);
};


export function StartMessageTimer() {
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
    $.Msg(params)
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

    let sMessage = "";
    if (message.substr(0, 1) == "#") {
        sMessage = $.Localize(message, MessagePanel);
    } else {
        sMessage = $.Localize("#" + message, MessagePanel);
    }
    //let sMessage = $.Localize("#"+message, MessagePanel);
    let eventData = { reason: 80, message: sMessage, sequenceNumber: 0 };
    GameEvents.SendEventClientSide("dota_hud_error_message", eventData);
};

export const Init = () => {
    $.Msg(["MessageInit"])
    StartMessageTimer();

    GameEvents.Subscribe("CMsg_SendCommonMsgToPlayer", event => {
        let data = event.data;
        const message_object = { "message": data.message, "data": data.data };
        CreateCommonMessage(message_object);
    })

    GameEvents.Subscribe("CMsg_SendErrorMsgToPlayer", SendErrorMessage)

}

(function () {
    Init()
})();