import React, { useState } from 'react';
import { render, useGameEvent } from 'react-panorama-x';


interface TooltipTextProp {
    text: string;
    description?: string;
    show: boolean;
}

const App = () => {

    const [text, setText] = React.useState("");
    const [description, setDescription] = React.useState("");

    // 更新面板
    $.GetContextPanel().SetPanelEvent("ontooltiploaded", () => {
        let ContextPanel = $.GetContextPanel();
        let text = $.GetContextPanel().GetAttributeString("title", "");
        let description = $.GetContextPanel().GetAttributeString("description", "");
        if (description == "") {
            description = text + "_Description";
        }
        let LocalizeDescription = $.Localize(description, ContextPanel);
        setText($.Localize(text, ContextPanel));
        // $.Msg(["LocalizeDescription",LocalizeDescription.indexOf("#")])
        if(LocalizeDescription.indexOf("#") == 0){
            setDescription("");
        } else {
            LocalizeDescription = LocalizeDescription.replaceAll("\n", "<br>")
            setDescription(LocalizeDescription);
        }
        
    });

    return (
        <Panel id="TooltipText" onload={(e) => {
            let m_TooltipPanel = $.GetContextPanel().GetParent()!.GetParent()!;
            $.GetContextPanel().GetParent()!.FindChild('LeftArrow')!.visible = false;
            $.GetContextPanel().GetParent()!.FindChild('RightArrow')!.visible = false;
            m_TooltipPanel.FindChild('TopArrow')!.visible = false;
            m_TooltipPanel.FindChild('BottomArrow')!.visible = false;
        }}>
            <Panel className='Header' visible={text != ""}>
                <Label text={text} html={true} />
            </Panel>
            {/* {(description != "" && description != "undefined") && <Label className='Description' text={description} html={true} />} */}
        </Panel>
    );
};

render(<App />, $.GetContextPanel());
