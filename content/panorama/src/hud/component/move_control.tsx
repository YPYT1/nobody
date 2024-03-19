

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

export const MoveControll = () => {

    return (
        <Panel id="MoveControll">
            <Button
                id="InputButton"
                className='HotkeyInput'
                // maxchars={1}
                onload={(e) => {
                    e.SetDialogVariable("input_key", "");
                    // $.DispatchEvent("DropInputFocus", e);
                    for (let n in ke) {
                        const r = ke[n as keyof typeof ke];
                        $.RegisterKeyBind(e, n, () => {
                            // GameEvents.SendCustomGameEventToServer("event_playerinfo", {
                            //     event_name: "SetKeyBind",
                            //     parameter: {
                            //         name: hotkey,
                            //         key: r
                            //     },
                            //     callback: "callback_UpdateKeyBind"
                            // });
                            $.DispatchEvent("DropInputFocus", e);
                            e.SetDialogVariable("input_key", r);
                        });
                    }
                    for (let n = 65; n < 91; n++) {
                        let r = String.fromCharCode(n);
                        $.RegisterKeyBind(e, `key_${r}`, () => {
                            // GameEvents.SendCustomGameEventToServer("event_playerinfo", {
                            //     event_name: "SetKeyBind",
                            //     parameter: {
                            //         name: hotkey,
                            //         key: r
                            //     },
                            //     callback: "callback_UpdateKeyBind"
                            // });
                            $.DispatchEvent("DropInputFocus", e);
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
        </Panel>
    )
}