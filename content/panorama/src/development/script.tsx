import { useCallback, useEffect, useState } from 'react';
import { render } from 'react-panorama-x';
import { HeroPick } from './component/_hero_pick';
import { AbilityPick } from './component/_ability_pick';
import { ItemListPick } from './component/_items_list';
import { HeroEditor } from './component/hero_demo_attribute';
import { WorkshopVoteTreadmil } from './workshop_vote_treadmil';



let current_action = "";


const WarpPanel = () => {

    const [ScreenX, setScreenX] = useState(0);
    const [ScreenY, setScreenY] = useState(0);

    const Update = useCallback(() => {
        let width = Game.GetScreenWidth();
        let height = Game.GetScreenHeight();
        let ScreenPos = GameUI.GetScreenWorldPosition([width / 2, height / 2]);
        if (ScreenPos) {
            setScreenX(Math.floor(ScreenPos[0]))
            setScreenY(Math.floor(ScreenPos[1]))
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(() => { Update(); }, 100);
        return () => clearInterval(interval);
    }, []);


    return (
        <Panel className="grid flow-down">
            <Panel className="title">
                <Label text={`当前坐标: ${ScreenX}:${ScreenY}`} />
            </Panel>
            <Panel className="row btn-group">
                <Button className="btn" onactivate={() => {
                    GameEvents.SendCustomGameEventToServer("Development", {
                        event_name: "WarpUnit",
                        params: {
                            queryUnit: Players.GetLocalPlayerPortraitUnit(),
                            x: ScreenX,
                            y: ScreenY,
                        }
                    })
                }}>
                    <Label text="传送至屏幕位置" />
                </Button>
            </Panel>
        </Panel>
    )
}
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
    const [Counts2, setCounts2] = useState(0);

    const Update = useCallback(() => {
        let entity = Entities.GetAllEntitiesByClassname("npc_dota_creature");
        // let exp_entity = Entities.GetAllEntitiesByClassname("npc_dota_base_additive");
        // $.Msg(exp_entity.length)
        setCounts(entity.length);
        // setCounts2(exp_entity.length)
    }, [])

    useEffect(() => {
        const interval = setInterval(() => { Update(); }, 250);
        return () => clearInterval(interval);
    }, []);

    return (
        <Panel className='flow-right'>
            <Label text={Counts} />
            {/* <Label text={Counts2} /> */}
        </Panel>

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
            <Panel id='DevelopmentContainer' className={`container flow-down ${show ? "" : "off"}`} >
                <Panel className="head">
                    <Panel className='flow-right'>
                        <Label text="开发工具" />
                        <UnitCountsPanel />
                    </Panel>
                    <Button className='btn-close' onactivate={ToggleHandle} />
                </Panel>
                <WarpPanel />
                <Panel className="content">
                    <Panel className="title">
                        <Label text="当前单位" />
                    </Panel>

                    <Panel className="row btn-group">
                        <Button className="btn" onactivate={() => UnitOperation("KillUnit")}>
                            <Label text="自杀" />
                        </Button>
                        <Button className="btn" onactivate={() => UnitOperation("RespawnHero")}>
                            <Label text="复活" />
                        </Button>
                        <Button className="btn" onactivate={() => {
                            current_action = "PickHero"
                            // setHeroesView(v => !v)
                            TogglePopupsViews("Heroes", true)
                        }}
                        >
                            <Label text="更换英雄" />
                        </Button>
                    </Panel>
                    <Panel className="row btn-group">
                        <Button className="btn" onactivate={() => { HandleLevelUp(1) }}>
                            <Label text="升1级" />
                        </Button>
                        <Button className="btn" onactivate={() => { HandleLevelUp(5) }}>
                            <Label text="升5级" />
                        </Button>
                        <Button className="btn" onactivate={() => { HandleLevelUp(10) }}>
                            <Label text="升10级" />
                        </Button>
                    </Panel>

                    <Panel className="row btn-group">
                        <Button className="btn" onactivate={() => { TogglePopupsViews("Items", true) }}>
                            <Label text="物品栏" />
                        </Button>
                        <Button className="btn" id="ReplaceAbility" onactivate={() => { TogglePopupsViews("Ability", true) }}>
                            <Label text="变更技能" />
                        </Button>
                    </Panel>

                </Panel>
                <HeroEditor />
                <Panel className="content">
                    <Panel className="title">
                        <Label className="" text="敌对单位操作" />
                    </Panel>
                    <Panel className="row btn-group">
                        <Button className="btn" onactivate={() => { UnitOperation("AddDummy") }}>
                            <Label text="创建傀儡" />
                        </Button>
                        <Button className="btn" onactivate={() => { RemoveUnitSendServer() }}>
                            <Label text="移除所选单位" />
                        </Button>
                    </Panel>
                </Panel>
            </Panel>

            <Panel id='DevelopmentPopups' className={`Popups ${PopupsViews}`} hittest={false}>
                <HeroPick closedHandle={() => setPopupsViews("None")} />
                <AbilityPick />
                <ItemListPick />
            </Panel >

        </>


    )
}



export const App = () => {

    return (
        <>
            <HeroDemo />
        </>
    );
};

Game.IsInToolsMode() && render(<App />, $.GetContextPanel());

