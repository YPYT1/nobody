import React, { useCallback, useEffect, useState } from 'react';
import { render, useGameEvent } from 'react-panorama-x';

import { default as NpcItemCustom } from "./../../json/npc_items_custom.json";

const App = () => {

    const [pid, setPid] = useState(-1);
    const [index, setIndex] = useState(0 as ItemEntityIndex);
    const [itemname, setItemname] = useState("");
    const [name, setName] = useState("");
    const [level, setLevel] = useState(1);
    const [cost, setCost] = useState(0);
    const [Gold, setGold] = useState(0);
    const [Wood, setWood] = useState(0);

    const [cooldown, setCooldown] = useState(0);
    const [mana, setMana] = useState(0);

    const [attributes, setAttributes] = useState("");
    const [description, setDescription] = useState("");
    const [NodeDescription, setNodeDescription] = useState("");


    const UpdateItemInfoFromName = useCallback(() => {

    }, []);


    // 更新面板
    useEffect(() => {
        $.GetContextPanel().SetPanelEvent("ontooltiploaded", () => {
            let ContextPanel = $.GetContextPanel();
            let name = $.GetContextPanel().GetAttributeString("name", "");
            let entityIndex = $.GetContextPanel().GetAttributeInt("entityIndex", 0) as ItemEntityIndex;
            setIndex(entityIndex);
            // if (entityIndex == 0) {
            //     UpdateItemInfoFromName();
            //     setPid(-1);
            // } else {
            //     UpdateItemInfoFromEntity(entityIndex);
            //     let p = Items.GetPurchaser(entityIndex);
            //     setPid(p);
            // }
        });
    }, []);

    // rec("UpdateItemInfoFromEntity", UpdateItemInfoFromEntity);
    return (
        <Panel
            id="CustomTooltipItem"
            className={`${index != 0 && "entity"}`}
            onload={(e) => {
                let m_TooltipPanel = $.GetContextPanel().GetParent()!.GetParent()!;
                $.GetContextPanel().GetParent()!.FindChild('LeftArrow')!.visible = false;
                $.GetContextPanel().GetParent()!.FindChild('RightArrow')!.visible = false;
                m_TooltipPanel.FindChild('TopArrow')!.visible = false;
                m_TooltipPanel.FindChild('BottomArrow')!.visible = false;
            }}>
            <Panel className="TooltipHeader">
                <Panel className='ItemImage'>
                    {/* <CItemImage id='ItemIcon' itemname={itemname} /> */}
                </Panel>
                <Panel id="HeaderLabels" className="flow-down">
                    <Panel id="ItemNameContent" className='w100 flow-right'>
                        {/* <CItemLabel id="TooltipItemName" itemname={itemname} /> */}
                        <Label id="ItemLevel" html={true} text={"Lv:" + level} />
                    </Panel>
                    <Panel id='ItemCategory'>

                    </Panel>
                    <Panel id="ItemInfo">
                        <Panel className='ItemGold' visible={Gold > 0} >
                            <Panel className='icon icon-resource-gold' />
                            <Label text={Gold} />
                        </Panel>
                        <Panel className='ItemWood' visible={Wood > 0} >
                            <Panel className='icon icon-resource-wood' />
                            <Label text={Wood} />
                        </Panel>
                    </Panel>
                </Panel>
            </Panel>
            <Panel className="Details">
                <Panel className='Content'>
                    <Label className={`Attribute ${attributes && "show"}`} text={attributes} html={true} />
                    <Panel id='DescriptionContainer'>
                        <Panel id='DescriptionLabel' className={`DescriptionLabel ${description && "show"}`} />
                        <Panel id="CurrentItemCosts" className={`${description && "show"}`}>
                            <Label id="Cooldown" className={`${cooldown == 0 && "hide"}`} text={cooldown} html={true} />
                            <Label id="ManaCost" className={`${mana == 0 && "hide"}`} text={mana} html={true} />
                        </Panel>
                    </Panel>
                    <Panel id='NodeContainer' className={`${NodeDescription && "Show"}`}>
                        <Label text={NodeDescription} />
                    </Panel>
                    <Label text={pid} visible={Game.IsInToolsMode()} />
                </Panel>
            </Panel>
        </Panel>
    );
};

render(<App />, $.GetContextPanel());
