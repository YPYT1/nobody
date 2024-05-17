import { useCallback, useState } from "react"
import { useGameEvent } from "react-panorama-x"
import { CAbilityImage } from "../../../components/ability_image"


const ArmsAbilityRow = ({ ability_name, order }: { ability_name: string, order: number }) => {

    return (
        <Button
            className="ArmsAbilityRow"
            onactivate={() => {
                GameEvents.SendCustomGameEventToServer("NewArmsEvolution", {
                    event_name: "PostSelectArms",
                    params: {
                        index: order
                    }
                })
            }}
        >
            <CAbilityImage id="ImageIcon" abilityname={ability_name} showtooltip={true} />
        </Button>
    )
}

export const ArmsSelector = () => {

    let ArmsSelectorPanel:Panel;
    
    const [ArmsList, setArmsList] = useState<PlayerUpgradeSelectServer[]>([])
    const [Hide, setHide] = useState(true);
    const [Minimize, setMinimize] = useState(false);

    useGameEvent("NewArmsEvolution_GetArmssSelectData", event => {
        let data = event.data.Data;
        // $.Msg(["data", data])
        let arms_list = Object.values(data.arms_list);
        setArmsList(arms_list);

        setHide(data.is_select == 0);

    }, [])

    const TogglePanelHandle = useCallback((v: boolean) => {
        setMinimize(!v)
    }, [])
    
    return (
        <Panel
            id="ArmsSelector"
            className={`container ${Hide ? "Hide" : ""} ${Minimize ? "Minimize" : ""}`}
            onload={(e) => {
                ArmsSelectorPanel = e;
                GameEvents.SendCustomGameEventToServer("NewArmsEvolution", {
                    event_name: "GetArmssSelectData",
                    params: {}
                })

            }}>
            <Panel id="ArmsList">
                {
                    ArmsList.map((v, k) => {
                        return <ArmsAbilityRow key={k} order={k} ability_name={v.key} />
                    })
                }
            </Panel>
            <Panel id="ArmsOption">
                <Button className="btn" onactivate={() => {
                    TogglePanelHandle(Minimize)
                }}>
                    <Label text={"切换"} />
                </Button>
            </Panel>
        </Panel>
    )
}