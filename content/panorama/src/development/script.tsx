import { useCallback, useEffect, useState } from 'react';
import { render } from 'react-panorama-x';
import { HeroPick } from './component/_hero_pick';
import { AbilityPick } from './component/_ability_pick';
import { ItemListPick } from './component/_items_list';
import { HeroDemoAttribute } from './component/hero_demo_attribute';

let current_action = "";

const HandleLevelUp = (uplv: number) => {
    const queryUnit = Players.GetLocalPlayerPortraitUnit();
    GameEvents.SendCustomGameEventToServer("Development", {
        event_name: "HeroLevelUp",
        params: {
            value: uplv,
            unit: queryUnit,
        }
    })
}

type UnitEventName = "RespawnHero" | "KillUnit" | "AddDummy"
const UnitOperation = (event_name: UnitEventName) => {
    const queryUnit = Players.GetLocalPlayerPortraitUnit();
    GameEvents.SendCustomGameEventToServer("Development", {
        event_name: event_name,
        params: {
            unit: queryUnit,
        }
    })
}

const RemoveUnitSendServer = () => {
    GameEvents.SendCustomGameEventToServer("Development", {
        event_name: "RemoveUnit",
        params: {
            units: Players.GetSelectedEntities(Players.GetLocalPlayer())
        }
    })
}

const UnitCountsPanel = () => {

    const [Counts, setCounts] = useState(0);

    const Update = useCallback(()=>{
        let entity = Entities.GetAllEntitiesByClassname("npc_dota_creature");
        setCounts(entity.length)
    },[])

    useEffect(() => {
        const interval = setInterval(() => { Update(); }, 250);
        return () => clearInterval(interval);
    }, []);

    return (
        <Label text={Counts} />
    )
}
type PopupsViewsType = "None" | "Heroes" | "Ability" | "Items";

export const HeroDemo = () => {

    const [PopupsViews, setPopupsViews] = useState<PopupsViewsType>("None")
    const [show, setShow] = useState(true);

    const TogglePopupsViews = (popups_type: PopupsViewsType, views: boolean) => {
        if (PopupsViews == popups_type || views == false) {
            setPopupsViews("None")
        } else {
            setPopupsViews(popups_type)
        }
    }

    const ToggleHandle = () => {
        setShow(v => !v);
        setPopupsViews("None")
    }

    return (
        <>
            <Panel className={`fc-tool ${show ? "" : "minimized"}`} >
                <Panel className="fc-tool-head">
                    <Label text="开发工具" />
                    <Button onactivate={ToggleHandle} />
                </Panel>
                <Panel className="fc-tool-content">
                    <Panel className="fc-tool-row">
                        <Label className="fc-tool-row-title" text={PopupsViews} />

                    </Panel>
                    <UnitCountsPanel />
                    <Panel className="fc-tool-row">
                        <Button className="fc-tool-button" onactivate={() => {
                            TogglePopupsViews("Items", true)
                        }}
                        >
                            <Label text="物品栏" />
                        </Button>

                    </Panel>
                </Panel>
                <Panel className="fc-tool-content">
                    <Panel className="fc-tool-row">
                        <Label className="fc-tool-row-title" text="当前单位" />
                    </Panel>

                    <Panel className="fc-tool-row">
                        <Button className="fc-tool-button" onactivate={() => UnitOperation("KillUnit")}>
                            <Label text="自杀" />
                        </Button>
                        <Button className="fc-tool-button" onactivate={() => UnitOperation("RespawnHero")}>
                            <Label text="复活" />
                        </Button>
                        <Button className="fc-tool-button" onactivate={() => {
                            current_action = "PickHero"
                            // setHeroesView(v => !v)
                            TogglePopupsViews("Heroes", true)
                        }}
                        >
                            <Label text="更换英雄" />
                        </Button>
                    </Panel>
                    <Panel className="fc-tool-row">
                        <Button className="fc-tool-button" onactivate={() => { HandleLevelUp(1) }}>
                            <Label text="升1级" />
                        </Button>
                        <Button className="fc-tool-button" onactivate={() => { HandleLevelUp(5) }}>
                            <Label text="升5级" />
                        </Button>
                        <Button className="fc-tool-button" onactivate={() => { HandleLevelUp(10) }}>
                            <Label text="升10级" />
                        </Button>
                    </Panel>

                    <Panel className="fc-tool-row">
                        <Button className="fc-tool-button" id="ReplaceAbility" onactivate={() => { TogglePopupsViews("Ability", true) }}>
                            <Label text="变更技能" />
                        </Button>
                    </Panel>
                    <Panel className="fc-tool-row">
                        <Label className="fc-tool-row-title" text="属性操作" />
                    </Panel>
                    <Panel className="fc-tool-row">
                        <HeroDemoAttribute />
                    </Panel>
                </Panel>

                <Panel className="fc-tool-content">
                    <Panel className="fc-tool-row">
                        <Label className="fc-tool-row-title" text="敌对单位操作" />
                    </Panel>
                    <Panel className="fc-tool-row">
                        <Button className="fc-tool-button" onactivate={() => { UnitOperation("AddDummy") }}>
                            <Label text="创建傀儡" />
                        </Button>
                        <Button className="fc-tool-button" onactivate={() => { RemoveUnitSendServer() }}>
                            <Label text="移除所选单位" />
                        </Button>
                    </Panel>
                </Panel>


            </Panel>

            <Panel id='DevelopmentPopups' className={`Popups ${PopupsViews}`} hittest={false}>
                <HeroPick />
                <AbilityPick />
                <ItemListPick />
            </Panel >

        </>


    )
}

function ChangeCameraValue(value: number) {
    GameUI.SetCameraDistance(value);
    let pitchmin = 60;
    if (value > 1500) {
        pitchmin += Math.min(1, (value - 1400) / (2300 - 1400)) * 32;
    }
    GameUI.SetCameraPitchMax(pitchmin);
}

let camera_value = 1200;

export const CameraSetting = () => {
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

export const App = () => {

    return (
        <>
            {
                Game.IsInToolsMode() &&
                <>
                    <HeroDemo />
                    <CameraSetting />
                </>
            }
        </>
    );
};

render(<App />, $.GetContextPanel());

