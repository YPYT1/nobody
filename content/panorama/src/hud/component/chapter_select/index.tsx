import { useCallback, useState } from "react"
import { CurrentStageSelect } from "./_current_stage_select";
import { StageHeroSelect } from "./_stage_hero_select";
import { useGameEvent } from "react-panorama-x";


const OnLoad = (e: Panel) => {
    // $.Msg(["ChapterSelect", "OnLoad"])
    GameEvents.SendCustomGameEventToServer("MapChapter", {
        event_name: "GetDifficultyMax",
        params: {

        }
    })
}

/** 章节选择 */
export const ChapterSelect = () => {

    const [GameSelectPhase, setGameSelectPhase] = useState(0);

    useGameEvent("MapChapter_GetDifficultyMax", event => {
        let data = event.data;
        // $.Msg(["MapChapter_GetDifficultyMax", data])
        setGameSelectPhase(data.game_select_phase)
    }, [])

    useGameEvent("MapChapter_GetPlayerHeroList", event => {
        let data = event.data;
        setGameSelectPhase(data.game_select_phase)
    })

    return (
        <Panel
            id='ChapterSelect'
            className={`GameSelectPhase_${GameSelectPhase}`}
            hittest={false}
            onload={OnLoad}
        >
            <CurrentStageSelect />
            <StageHeroSelect />
        </Panel>
    );
};
