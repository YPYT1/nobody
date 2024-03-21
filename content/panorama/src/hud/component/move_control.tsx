


const ke = {
    key_Backquote: "`",
    key_TAB: "TAB",
    key_CAPSLOCK: "CAPSLOCK",
    key_SPACE: "SPACE",
    key_Minus: "-",
    key_Equal: "=",
    key_Backspace: "BACKSPACE",
    key_Backslash: "\\",
    key_Semicolon: ";",
    key_Comma: ",",
    key_Period: ".",
    key_Slash: "/",
    key_Enter: "RETURN",
    key_1: "1",
    key_2: "2",
    key_3: "3",
    key_4: "4",
    key_5: "5",
    key_6: "6",
    key_7: "7",
    key_8: "8",
    key_9: "9",
    key_0: "0",
    key_F1: "F1",
    key_F2: "F2",
    key_F3: "F3",
    key_F4: "F4",
    key_F5: "F5",
    key_F6: "F6",
    key_F7: "F7",
    key_F8: "F8",
    key_F9: "F9",
    key_F10: "F10",
    key_F11: "F11",
    key_F12: "F12"
};

let WASD_down_state = {
    "w": false,
    "a": false,
    "s": false,
    "d": false,
}

let hero_entity = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer());

function OnInitMoveHotkey() {
    SetHotKey("W", OnKey_Down_W, OnKey_Up_W);
    SetHotKey("A", OnKey_Down_A, OnKey_Up_A);
    SetHotKey("S", OnKey_Down_S, OnKey_Up_S);
    SetHotKey("D", OnKey_Down_D, OnKey_Up_D);
    SetHotKey("S1_UP", OnKey_Down_W, OnKey_Up_W);
    SetHotKey("S1_LEFT", OnKey_Down_A, OnKey_Up_A);
    SetHotKey("S1_DOWN", OnKey_Down_S, OnKey_Up_S);
    SetHotKey("S1_RIGHT", OnKey_Down_D, OnKey_Up_D);
    // GameUI.SetCameraDistance(1300);
    // GameUI.SetCameraPitchMin(70);
    // GameUI.SetCameraPitchMax(70);
    GameUI.SetCameraTarget(hero_entity)
}

function MoveStateEvent(eventData: { Direction: CMoveDirection, State: 0 | 1 }) {
    GameEvents.SendCustomGameEventToServer("BasicRules", {
        event_name: "MoveState",
        params: eventData
    })
}

function OnKey_Down_W() {
    MoveStateEvent({ Direction: "UP", State: 1 })
}

function OnKey_Up_W() {
    MoveStateEvent({ Direction: "UP", State: 0 })
}

function OnKey_Down_A() {
    MoveStateEvent({ Direction: "LEFT", State: 1 })
}

function OnKey_Up_A() {
    MoveStateEvent({ Direction: "LEFT", State: 0 })
}

function OnKey_Down_S() {
    MoveStateEvent({ Direction: "DOWN", State: 1 })
}
function OnKey_Up_S() {
    MoveStateEvent({ Direction: "DOWN", State: 0 })
}

function OnKey_Down_D() {
    MoveStateEvent({ Direction: "RIGHT", State: 1 })
}

function OnKey_Up_D() {
    MoveStateEvent({ Direction: "RIGHT", State: 0 })
}

function ChangeCameraValue(value: number) {
    GameUI.SetCameraDistance(value);
    // let pitchmin = 60;
    // if (value > 1500) {
    //     pitchmin += Math.min(1, (value - 1400) / (2300 - 1400)) * 32;
    // }
    // GameUI.SetCameraPitchMax(pitchmin);
}

let camera_value = 1200;

const CameraSetting = () => {

    GameUI.SetMouseCallback((event: MouseEvent, value: MouseButton | MouseScrollDirection) => {
        if (value == 6 && camera_value < 1400) {
            camera_value += 10;
        } else if (value == 5 && camera_value > 800) {
            camera_value -= 10;
        }
        ChangeCameraValue(camera_value);
        return false;
    });

    return (
        <Panel id="CameraSetting" visible={false} />
    );
};
/**
 * 设置热键
 * @param key 
 * @param down_func 按下
 * @param up_func 松开
 */
export function SetHotKey(key: string, down_func: Function, up_func: Function) {
    let command_string = `On${key}${Date.now()}`;
    Game.CreateCustomKeyBind(key, `+${command_string}`);
    Game.AddCommand(
        `+${command_string}`,
        () => { if (down_func) { down_func(); } },
        ``,
        1 << 32
    );
    Game.AddCommand(
        `-${command_string}`,
        () => { if (up_func) { up_func(); } },
        ``,
        1 << 32
    );
}

export const MoveControll = () => {

    return (
        <Panel id="MoveControll">
            <Button
                id="InputButton"
                className='HotkeyInput LabelFXContainer'
                // maxchars={1}
                onload={(e) => {
                    OnInitMoveHotkey();
                    e.SetDialogVariable("input_key", "");
                    // $.DispatchEvent("DropInputFocus", e);
                    for (let n in ke) {
                        const r = ke[n as keyof typeof ke];
                        $.RegisterKeyBind(e, n, (source, presses, panel) => {
                            $.Msg(["source", source])
                            e.SetDialogVariable("input_key", r);
                        });
                    }
                    for (let n = 65; n < 91; n++) {
                        let r = String.fromCharCode(n);
                        $.RegisterKeyBind(e, `key_${r}`, () => {
                            e.SetDialogVariable("input_key", r);
                        });
                    }
                }}

                onactivate={(e) => {
                    $.DispatchEvent("SetInputFocus", e);
                }}

                onfocus={(e) => {
                    e.AddClass("focus");
                }}

                onblur={(e) => {
                    e.RemoveClass("focus");
                }}
            >
                <Label localizedText='{s:input_key}' />
            </Button>
            <CameraSetting />
        </Panel>
    )
}