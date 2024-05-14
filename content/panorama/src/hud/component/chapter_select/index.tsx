import { useCallback } from "react"
import { CurrentStageSelect } from "./_current_stage_select";
import { StageHeroSelect } from "./_stage_hero_select";
import { useGameEvent } from "react-panorama-x";

let MainPanel: Panel;

const OnLoad = (e: Panel) => {
    MainPanel = e;
    MainPanel.Data<PanelDataObject>()["difficulty"] = "101"
    // MainPanel.SetDialogVariable("difficulty", "101");

    GameEvents.SendCustomGameEventToServer("MapChapter", {
        event_name: "GetDifficultyMax",
        params: {}
    })

    GameEvents.SendCustomGameEventToServer("MapChapter", {
        event_name: "GetGameSelectPhase",
        params: {}
    })

}

/** 章节选择 */
export const ChapterSelect = () => {

    // const [Difficulty, setDifficulty] = useState("101");

    const ToggleHandle = () => {
        let state = MainPanel.BHasClass("Open");
        MainPanel.SetHasClass("Open", !state)
    }


    // useGameEvent("MapChapter_GetPlayerHeroList", event => {
    //     let data = event.data;
    //     // setGameSelectPhase(data.game_select_phase)
    // })

    useGameEvent("MapChapter_SelectDifficulty", event => {
        let data = event.data;
        // $.Msg(["MapChapter_SelectDifficulty1", data])
        let difficulty = data.select_difficulty;
        MainPanel.Data<PanelDataObject>()["difficulty"] = difficulty;
        MainPanel.SetDialogVariable("difficulty", difficulty)
        // setDifficulty(difficulty)
    })

    return (
        <Panel
            id='ChapterSelect'
            className={`container Open`}
            hittest={false}
            onload={OnLoad}
        >
            <Panel className="content">
                <Panel className="head">
                    <Panel className="title">
                        <Label text="chapter_select" />
                    </Panel>
                    <Panel className="head-btn">
                        <Button className="btn-close" onactivate={() => { ToggleHandle() }} />
                    </Panel>
                </Panel>
            </Panel>
            <Panel id="ChapterContent" className="content">
                <CurrentStageSelect />
                <StageHeroSelect />
            </Panel>

        </Panel>
    );
};
