import React, { useState } from 'react';
import { useGameEvent } from 'react-panorama-x';


const ResourceTypePanel = ({ resour_type, amount }: { resour_type: PlayerResourceTyps, amount: number }) => {

    return (
        <Panel className='ResourceTypePanel'>
            <Panel className={'ResourceIcon ' + resour_type} />
            <Label text={amount} />
        </Panel>
    )
}

/** 资源组件 */
export const ResourceComponent = () => {

    const [Gold, setGold] = useState(0);
    const [Soul, setSoul] = useState(0);
    const [Kills, setKills] = useState(0);
    const [SingleExp, setSingleExp] = useState(0);
    const [TeamExp, setTeamExp] = useState(0);

    useGameEvent("ResourceSystem_SendPlayerResources", event => {
        let data = event.data;
        setGold(data.Gold);
        setSoul(data.Soul)
        setKills(data.Kills)
        setSingleExp(data.SingleExp)
        setTeamExp(data.TeamExp)
    }, [])

    return (
        <Panel 
            id='ResourceComponent'
            hittest={false}
            onload={(e) => {
                GameEvents.SendCustomGameEventToServer("ResourceSystem", {
                    event_name: "GetPlayerResource",
                    params: {}
                })
            }}>
            <ResourceTypePanel resour_type="Gold" amount={Gold} />
            <ResourceTypePanel resour_type="Soul" amount={Soul} />
            <ResourceTypePanel resour_type="Kills" amount={Kills} />
            <ResourceTypePanel resour_type="SingleExp" amount={SingleExp} />
            <ResourceTypePanel resour_type="TeamExp" amount={TeamExp} />
        </Panel>
    );
};