import React, { useCallback, useEffect, useState } from 'react';
import { render, useGameEvent } from 'react-panorama-x';

import { default as NpcItemCustom } from "./../../json/npc_items_custom.json";
import { CItemImage, CItemLabel } from '../../components/item_image';
import { ConvertAttributeValues, GetItemAttribute } from '../../utils/attribute_method';

const SetCustomDescription = (name: string, panel_id: string) => {
    // let DesContainer = $("#" + panel_id);
    let DesContainer = $.GetContextPanel().FindChildTraverse(panel_id)!;
    if (DesContainer) {
        DesContainer.RemoveAndDeleteChildren();
        // let itemdata = NpcItemCustom[name as "item_jewel_1"];
        let Description = $.Localize(`#DOTA_Tooltip_Ability_${name}_Description`);
        let bHasDesc = Description.indexOf("#") != 0;
        if (!bHasDesc) { return; };
        let count = 0;
        for (let text of Description.split("<h1>")) {
            if (text.indexOf("</h1>") > -1) {
                let tmp = text.split("</h1>");
                let h1Text = tmp[0];
                let nText = GameUI.ReplaceDOTAAbilitySpecialValues(name, tmp[1]);
                // $.Msg(nText)
                let className = "Header";
                if (count >= 1) className += " Labelline";
                $.CreatePanel("Label", DesContainer, "", { class: `${className}`, text: h1Text, html: true, });
                $.CreatePanel("Label", DesContainer, "", { class: `HeaderDesc`, text: nText, html: true, });
                count += 1;
            } else {
                if (text) {
                    $.CreatePanel("Label", DesContainer, "", {
                        class: `DescLabel`,
                        text: text,
                        html: true,
                    });
                }

            }
        }
    }

};


const App = () => {

    const [pid, setPid] = useState(-1);
    const [index, setIndex] = useState(0 as ItemEntityIndex);
    const [itemname, setItemname] = useState("");

    const [cooldown, setCooldown] = useState(0);
    const [mana, setMana] = useState(0);
    const [attributes, setAttributes] = useState("");
    const [description, setDescription] = useState("");
    const [NodeDescription, setNodeDescription] = useState("");


    const UpdateItemInfoFromName = useCallback(() => {
        let name = $.GetContextPanel().GetAttributeString("name", "");
        // Category
        // let kvdata = NpcItemCustom[name as "item_arms_t0_1"];

        setItemname(name);
        SetCustomDescription(name, "DescriptionLabel");
        setDescription($.Localize(`#DOTA_Tooltip_Ability_${name}_Description`));
        let NodeContainer = $.Localize(`#DOTA_Tooltip_Ability_${name}_Lore`);
        if (NodeContainer.indexOf("#") == 0) {
            setNodeDescription("");
        } else {
            setNodeDescription(NodeContainer);
        }

        let ItemAttribute = GetItemAttribute(name);
        // $.Msg(ItemAttribute)
        // let level = $.GetContextPanel().GetAttributeInt("item_level", 1);
        // setLevel(level);
        // let itemdata = NpcItemCustom[name as "item_equip_origin_1"];
        // let cooldown = itemdata.AbilityCooldown ?? 0;
        // setCooldown(cooldown);
        // let ManaCost = itemdata.AbilityManaCost ?? 0;
        // setMana(ManaCost);
        // setGold(GetItemGoldCost(name));
        // let Wood = itemdata.ItemWood ?? 0;
        // setWood(Wood);
        // // 属性
        let attr_list = ConvertAttributeValues(ItemAttribute);
        // $.Msg(attr_list)
        setAttributes(attr_list);



    }, []);


    const UpdateItemInfoFromEntity = useCallback((entityIndex: ItemEntityIndex) => {
        // const queryUnit = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer());
        const queryUnit = Players.GetLocalPlayerPortraitUnit();
        let name = Abilities.GetAbilityName(entityIndex);
        setItemname(name);
        setDescription($.Localize(`#DOTA_Tooltip_Ability_${name}_Description`));
        let NodeContainer = $.Localize(`#DOTA_Tooltip_Ability_${name}_Lore`);
        if (NodeContainer.indexOf("#") == 0) {
            setNodeDescription("");
        } else {
            setNodeDescription(NodeContainer);
        }
        SetCustomDescription(name, "DescriptionLabel");
    }, []);

    // 更新面板
    useEffect(() => {
        $.GetContextPanel().SetPanelEvent("ontooltiploaded", () => {
            let ContextPanel = $.GetContextPanel();
            let name = $.GetContextPanel().GetAttributeString("name", "");
            let entityIndex = $.GetContextPanel().GetAttributeInt("entityIndex", 0) as ItemEntityIndex;
            // $.Msg(["entityIndex", entityIndex])
            setIndex(entityIndex);
            if (entityIndex <= 0) {
                UpdateItemInfoFromName();
                setPid(-1);
            } else {
                UpdateItemInfoFromEntity(entityIndex);
                let p = Items.GetPurchaser(entityIndex);
                setPid(p);
            }
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
                    <CItemImage id='ItemIcon' itemname={itemname} />
                </Panel>
                <Panel id="HeaderLabels" className="flow-down">
                    <Panel id="ItemNameContent" className='w100 flow-right'>
                        <CItemLabel id="TooltipItemName" itemname={itemname} />
                        {/* <Label id="ItemLevel" html={true} text={"Lv:" + level} /> */}
                    </Panel>
                    <Panel id='ItemCategory'>

                    </Panel>
                    {/* <Panel id="ItemInfo">
                        <Panel className='ItemGold' visible={Gold > 0} >
                            <Panel className='icon icon-resource-gold' />
                            <Label text={Gold} />
                        </Panel>
                        <Panel className='ItemWood' visible={Wood > 0} >
                            <Panel className='icon icon-resource-wood' />
                            <Label text={Wood} />
                        </Panel>
                    </Panel> */}
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
