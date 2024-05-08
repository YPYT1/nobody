import { useState } from "react"
import { useGameEvent } from "react-panorama-x"


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
            <Label text={ability_name} />
        </Button>
    )
}

export const ArmsSelector = () => {

    const [ArmsList, setArmsList] = useState<PlayerUpgradeSelectServer[]>([])

    useGameEvent("NewArmsEvolution_GetArmssSelectData", event => {
        let data = event.data.Data;
        // $.Msg(["data", data])
        let arms_list = Object.values(data.arms_list);
        setArmsList(arms_list)
    }, [])

    return (
        <Panel id="ArmsSelector" className="container" onload={() => {

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
                <Button className="btn">
                    <Label text={"关闭"} />
                </Button>
            </Panel>
        </Panel>
    )
}