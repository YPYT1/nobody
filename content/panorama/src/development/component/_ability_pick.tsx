import { useCallback, useEffect, useRef, useState } from 'react';
import { default as NpcAbilitiesCustom } from './../../json/npc_abilities_custom.json';
import { CreateDragPanelImage } from '../../common/panel_operaton';
import { GetAbilityImageSrc } from '../../common/custom_kv_method';
import { useGameEvent } from 'react-panorama-x';
import { HideCustomTooltip, ShowCustomTooltip } from '../../utils/custom_tooltip';
// import { CAbilityImage } from "../../components/ability_image";

const CustomAbilityPanel = ({ abilityname }: { abilityname: string }) => {
    const panelRef = useRef<Panel | null>();
    const onInit = useCallback((e: Panel) => {
        panelRef.current = e;
        $.RegisterEventHandler('DragStart', e, OnDragStart);
        // $.RegisterEventHandler('DragEnter', e, OnDragEnter);
        // $.RegisterEventHandler('DragDrop', e, OnDragDrop);
        // $.RegisterEventHandler('DragLeave', e, OnDragLeave);
        $.RegisterEventHandler('DragEnd', e, OnDragEnd);
    }, []);

    const OnDragStart = useCallback((panel: Panel, dragCallbacks: Panel) => {
        // $.Msg(["OnDragStart"])
        if (panelRef.current == null) {
            return;
        }

        const displayPanel = CreateDragPanelImage(abilityname, 'Ability');
        // displayPanel.Data<PanelDataObject>().m_DragCompleted = false;
        displayPanel.Data<PanelDataObject>().m_ability = abilityname;

        dragCallbacks.displayPanel = displayPanel;
        dragCallbacks.offsetX = 0;
        dragCallbacks.offsetY = 0;
        panelRef.current?.AddClass('dragging_from');
        return true;
    }, []);

    const OnDragEnter = useCallback((panel: Panel, draggedPanel: Panel) => {
        // $.Msg("OnDragEnter");
        panelRef.current?.AddClass('potential_drop_target');
        return true;
    }, []);

    // const OnDragDrop = useCallback((panel: Panel, draggedPanel: Panel) => {
    //     $.Msg("OnDragDrop");

    //     return true;
    // }, []);

    const OnDragLeave = useCallback((panel: Panel, draggedPanel: Panel) => {
        // $.Msg("OnDragLeave");
        // const draggedItem = draggedPanel.Data<PanelDataObject>().m_DragItem;
        // if (draggedItem === null) return false;
        panelRef.current?.RemoveClass('potential_drop_target');
        return true;
    }, []);

    const OnDragEnd = useCallback((panel: Panel, draggedPanel: Panel) => {
        // $.Msg("OnDragEnd");
        draggedPanel.DeleteAsync(0);
        panelRef.current?.RemoveClass('dragging_from');
        $.DispatchEvent('DropInputFocus');
        return true;
    }, []);

    return (
        <Panel
            className={'CustomAbilityPanel'}
            onmouseover={e => {
                ShowCustomTooltip(e, 'ability', abilityname, -1, 0);
                // $.DispatchEvent("DOTAShowTextTooltip", e, $.Localize("#DOTA_Tooltip_Ability_" + abilityname));
            }}
            onmouseout={() => {
                HideCustomTooltip();
                // $.DispatchEvent("DOTAHideTextTooltip");
            }}
            onload={onInit}
            draggable={true}
        >
            <DOTAAbilityImage abilityname={abilityname} />
            <Label localizedText={`#DOTA_Tooltip_Ability_${abilityname}`} />
        </Panel>
    );
};

const UnitAbilityImage = ({ order }: { order: number }) => {
    // $.Msg(["ability_enti", ability_enti])
    const queryUnit = Players.GetLocalPlayerPortraitUnit();

    const [AbilityEnti, setAbilityEnti] = useState(Entities.GetAbility(queryUnit, order));
    const [AbilityName, setAbilityName] = useState('');
    const [AbilityLevel, setAbilityLevel] = useState(-1);
    // const image_src = GetAbilityImageSrc(ability_name)

    const DeleteAbility = (e: Button) => {
        GameEvents.SendCustomGameEventToServer('Development', {
            event_name: 'DeleteAbility',
            params: {
                queryUnit: Players.GetLocalPlayerPortraitUnit(),
                ability_order: order,
            },
        });
    };

    const ToggleAbility = (e: Button) => {
        GameEvents.SendCustomGameEventToServer('Development', {
            event_name: 'ToggleAbility',
            params: {
                queryUnit: Players.GetLocalPlayerPortraitUnit(),
                ability_order: order,
            },
        });
    };

    const UpgradeAbility = (e: Button) => {
        GameEvents.SendCustomGameEventToServer('Development', {
            event_name: 'UpgradeAbility',
            params: {
                ability_enti: AbilityEnti,
            },
        });
    };

    const OnDragDrop = useCallback((panel: Panel, draggedPanel: Panel) => {
        // $.Msg([`OnDragDrop Order:[${order}]`]);
        const m_ability = draggedPanel.Data<PanelDataObject>().m_ability;
        const queryUnit = Players.GetLocalPlayerPortraitUnit();
        GameEvents.SendCustomGameEventToServer('Development', {
            event_name: 'ReplaceAbility',
            params: {
                ability_name: m_ability,
                order: order,
                queryUnit: queryUnit,
            },
        });
        return true;
    }, []);

    const UpdateLocalPlayer = () => {
        const queryUnit = Players.GetLocalPlayerPortraitUnit();
        const AbilityEnti = Entities.GetAbility(queryUnit, order);
        setAbilityEnti(AbilityEnti);
        setAbilityName(Abilities.GetAbilityName(AbilityEnti));
        setAbilityLevel(Abilities.GetLevel(AbilityEnti));
    };

    // useEffect(() => {
    //     const interval = setInterval(() => { UpdateLocalPlayer(); }, 100);
    //     return () => clearInterval(interval);
    // }, []);

    useGameEvent('dota_player_update_selected_unit', UpdateLocalPlayer, []);
    useGameEvent('dota_player_update_query_unit', UpdateLocalPlayer, []);
    // useGameEvent("dota_portrait_ability_layout_changed", UpdateLocalPlayer, []);
    // useGameEvent("dota_ability_changed", UpdateLocalPlayer, []);
    // useGameEvent("dota_hero_ability_points_changed", UpdateLocalPlayer, []);

    return (
        <Panel className="UnitAbilityImage">
            <Panel className="ImagePanel">
                <Panel className="ImageLeft">
                    <Panel
                        className="UnitDOTAAbilityImage"
                        onload={e => {
                            // $.RegisterEventHandler('DragStart', e, OnDragStart);
                            // $.RegisterEventHandler('DragEnter', e, OnDragEnter);
                            $.RegisterEventHandler('DragDrop', e, OnDragDrop);
                            // $.RegisterEventHandler('DragLeave', e, OnDragLeave);
                            // $.RegisterEventHandler('DragEnd', e, OnDragEnd);
                        }}
                        onmouseover={e => {
                            // $.Msg(["AbilityEnti",AbilityEnti])
                            if (AbilityEnti < 1) {
                                return;
                            }
                            ShowCustomTooltip(e, 'ability', '', AbilityEnti);
                        }}
                        onmouseout={() => {
                            HideCustomTooltip();
                        }}
                    >
                        {/* <DOTAItemImage src={image_src} scaling='stretch-to-fit-y-preserve-aspect' /> */}

                        <DOTAAbilityImage abilityname={AbilityName} />
                        <Label text={`Lv.${AbilityLevel}`} />
                    </Panel>
                </Panel>
                <Panel className="ImageRight">
                    <Button className="btn" onactivate={UpgradeAbility}>
                        <Label text="升级" />
                    </Button>
                    <Button className="btn" onactivate={ToggleAbility}>
                        <Label text="禁用/启用" />
                    </Button>
                    <Button className="btn" onactivate={DeleteAbility}>
                        <Label text="删除" />
                    </Button>
                </Panel>
            </Panel>

            <Label className="AbilityName" text={AbilityName} />
        </Panel>
    );
};

export const AbilityPick = () => {
    const [queryUnit, setQueryUnit] = useState<EntityIndex>(Players.GetLocalPlayerPortraitUnit());

    const UpdateLocalPlayer = () => {
        const queryUnit = Players.GetLocalPlayerPortraitUnit();
        setQueryUnit(queryUnit);
    };

    return (
        <Panel id="AbilityPick" className={`fc-heropick`}>
            <Panel id="AbilityList" hittest={false}>
                {Object.entries(NpcAbilitiesCustom).map((v, k) => {
                    if (v[1].Disable == 0) {
                        return <CustomAbilityPanel key={k} abilityname={v[0]} />;
                    }
                })}
            </Panel>
            <Panel className="fc-ability-existing" id="AbilityExisting">
                {Array(36)
                    .fill(0)
                    .map((v, k) => {
                        return <UnitAbilityImage key={k} order={k} />;
                    })}
            </Panel>
        </Panel>
    );
};
