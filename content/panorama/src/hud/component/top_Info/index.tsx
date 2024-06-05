import { useGameEvent } from "react-panorama-x"

const StageInfo = () => {

    // useGameEvent("")

    const MainOnload = (e: Panel) => {

    }

    return (
        <Panel id="StageInfo" className="TopRows" onload={MainOnload}>
            <Label localizedText="{s:stage}" />
            <Panel className="Icon" />
        </Panel>
    )
}


const LifeInfo = () => {

    // useGameEvent("")

    const MainOnload = (e: Panel) => {

    }

    return (
        <Panel id="LifeInfo" className="TopRows" onload={MainOnload}>
            <Panel className="Icon" />
            <Label localizedText="{d:life}" />
        </Panel>
    )
}

const GameTimeInfo = () => {

    return (
        <Panel id="GameTimeInfo">
            <Label className="TimeLabel" localizedText="{s:time_label}" />
        </Panel>
    )
}
export const TopInfoContainer = () => {

    let mainPanel: Panel;

    const OnLoad = (e: Panel) => {
        e.SetDialogVariable("stage", "1-1");
        e.SetDialogVariable("time_label", "0:0");
        e.SetDialogVariableInt("life", 0);
    }
    return (
        <Panel id="TopInfoContainer" onload={OnLoad} hittest={false}>
            <StageInfo />
            <LifeInfo />
            <GameTimeInfo />
        </Panel>
    )
}