import React from 'react';
import { useGameEvent } from 'react-panorama-x';
import { HideCustomTooltip, ShowCustomTextTooltip } from '../../../utils/custom_tooltip';

let ResourcePanel: { [key in PlayerResourceTyps]?: Panel } = {}

const ResourceTypePanel = ({ resour_type }: { resour_type: PlayerResourceTyps }) => {

    return (
        <Panel
            className='ResourceTypePanel'
            onload={(e) => {
                ResourcePanel[resour_type] = e;
            }}
            onmouseover={(e) => {
                ShowCustomTextTooltip(e, "", resour_type)
            }}
            onmouseout={HideCustomTooltip}
        >
            <Panel className={'ResourceIcon ' + resour_type} />
            <Label className='ResourceAmount' localizedText='{d:amount}' />
        </Panel>
    )
}

/** 资源组件 */
export const ResourceComponent = () => {

    useGameEvent("ResourceSystem_SendPlayerResources", event => {
        let data = event.data;
        // ResourcePanel["Gold"]?.SetDialogVariable("amount", `${data.Gold}`)
        ResourcePanel["Soul"]?.SetDialogVariableInt("amount", data.Soul)
        ResourcePanel["Kills"]?.SetDialogVariableInt("amount", data.Kills)
        // ResourcePanel["SingleExp"]?.SetDialogVariable("amount", `${data.SingleExp}`)
        // ResourcePanel["TeamExp"]?.SetDialogVariable("amount", `${data.TeamExp}`)
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
            {/* <ResourceTypePanel resour_type="Gold" /> */}
            <ResourceTypePanel resour_type="Soul" />
            <ResourceTypePanel resour_type="Kills" />
            {/* <ResourceTypePanel resour_type="SingleExp" /> */}
            {/* <ResourceTypePanel resour_type="TeamExp" /> */}
        </Panel>
    );
};