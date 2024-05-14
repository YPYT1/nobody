import React from 'react';
import { useGameEvent } from 'react-panorama-x';

let ResourcePanel: { [key in PlayerResourceTyps]?: Panel } = {}

const ResourceTypePanel = ({ resour_type }: { resour_type: PlayerResourceTyps }) => {

    return (
        <Panel className='forms-row' onload={(e) => {
            ResourcePanel[resour_type] = e;
        }}>
            <Panel className={'forms-title'} >
                <Label text={resour_type.substring(0, 4)} />
            </Panel>
            <Label className='forms-label' localizedText='{s:amount}' />
        </Panel>
    )
}

/** 资源组件 */
export const ResourceComponent = () => {

    useGameEvent("ResourceSystem_SendPlayerResources", event => {
        let data = event.data;
        ResourcePanel["Gold"]?.SetDialogVariable("amount", `${data.Gold}`)
        ResourcePanel["Soul"]?.SetDialogVariable("amount", `${data.Soul}`)
        ResourcePanel["Kills"]?.SetDialogVariable("amount", `${data.Kills}`)
        ResourcePanel["SingleExp"]?.SetDialogVariable("amount", `${data.SingleExp}`)
        ResourcePanel["TeamExp"]?.SetDialogVariable("amount", `${data.TeamExp}`)
    }, [])

    return (
        <Panel
            id='ResourceComponent'
            className='forms'
            hittest={false}
            onload={(e) => {
                GameEvents.SendCustomGameEventToServer("ResourceSystem", {
                    event_name: "GetPlayerResource",
                    params: {}
                })
            }}>
            <ResourceTypePanel resour_type="Gold" />
            <ResourceTypePanel resour_type="Soul" />
            <ResourceTypePanel resour_type="Kills" />
            <ResourceTypePanel resour_type="SingleExp" />
            <ResourceTypePanel resour_type="TeamExp" />
        </Panel>
    );
};