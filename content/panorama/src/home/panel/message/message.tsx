import { PlayerIdToARGB } from "../../../utils/method";


import "./_countdown";

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

const SendErrorMessage = (params: CustomGameEventDeclarations["CMsg_SendErrorMsgToPlayer"]) => {

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
    [234, 71, 44], // 火
    [98, 158, 232], // 冰
    [48, 43, 255], // 雷
    [75, 228, 79], // 风
    [232, 187, 49], // 光
    [113, 42, 221], // 暗
];

const DamageFloating = (event: CustomGameEventDeclarations["Popup_DamageNumberToClients"]) => {
    // $.Msg(["Popup_DamageNumberToClients",event])
    // return 
    const duration = 1;
    let params = event.data;
    let element = params.element_type;
    let is_crit = params.is_crit;
    let damage_value = params.value;
    let damage_type = params.type;
    let entity = params.entity as EntityIndex;
    let digits = String(damage_value).length + 1 ;
    let font_size = 24;
    let vect = Entities.GetAbsOrigin(entity);
    let effect_name = "particles/msg_fx/msg00002/msg00002_normal.vpcf";
    if(is_crit == 1){
        effect_name = "particles/msg_fx/msg00002/msg00002_crit.vpcf";
        digits += 1;
        font_size = 32;
        vect[2] += Math.floor(Math.random() * 100) - 50;    
    }
    let color = element_color[element]
    let pidx = Particles.CreateParticle(
        effect_name,
        ParticleAttachment_t.PATTACH_WORLDORIGIN,
        entity
    );

    
    // vect[2] += 150;
    Particles.SetParticleControl(pidx, 0, vect);
    Particles.SetParticleControl(pidx, 1, color);
    Particles.SetParticleControl(pidx, 2, [0, damage_value, is_crit]);
    Particles.SetParticleControl(pidx, 3, [digits, 0, 0]);
    Particles.SetParticleControl(pidx, 4, [font_size, 0, 0]);

    Particles.ReleaseParticleIndex(pidx);
}


let BossWarningPanel = $("#BossWarningPanel");
let EventWarning = $("#EventWarning");
let EventDuration: { [key: string]: number } = {
    "102": 5,
}



const CMsg_PopupUnitState = (params: CustomGameEventDeclarations["CMsg_PopupUnitState"]) => {
    let data = params.data;
    let popup_type = data.popup_type;
    let target = data.unit;

    let fx_name = "";
    let fx_color: [number, number, number] = [255, 255, 255];
    let fx_time = 1;
    let fx_attach: ParticleAttachment_t = ParticleAttachment_t.PATTACH_POINT;
    let fx_digits = 1
    let fx_pre_symbol = 0;
    let fx_post_symbol = 0;
    let fx_number = data.amount;
    if (popup_type == "Miss") {
        fx_name = "particles/msg_fx/msg_damage.vpcf"
        fx_pre_symbol = 5
    } else {
        fx_name = "particles/msg_fx/msg_damage.vpcf"
    }

    let effect_fx = Particles.CreateParticle(fx_name, ParticleAttachment_t.PATTACH_POINT, target)

    Particles.SetParticleControl(effect_fx, 1, [fx_pre_symbol, fx_number, fx_post_symbol])
    Particles.SetParticleControl(effect_fx, 2, [fx_time, fx_digits, 0])
    Particles.SetParticleControl(effect_fx, 3, fx_color)

    Particles.ReleaseParticleIndex(effect_fx);

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
    GameEvents.Subscribe("CMsg_PopupUnitState", CMsg_PopupUnitState)
    
}

(function () {
    Init()
})();