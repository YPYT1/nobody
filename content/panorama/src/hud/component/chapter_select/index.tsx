import { useCallback, useState } from "react"
import { CurrentStageSelect } from "./_current_stage_select";
import { StageHeroSelect } from "./_stage_hero_select";
import { useGameEvent } from "react-panorama-x";


const OnLoad = (e: Panel) => {
    // $.Msg(["ChapterSelect", "OnLoad"])
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

    const [GameSelectPhase, setGameSelectPhase] = useState(0);
    const [Difficulty, setDifficulty] = useState("101");
    const [Show, setShow] = useState(true);

    const ToggleHandle = useCallback((b: boolean) => {
        setShow(!b);
    }, [])

    useGameEvent("MapChapter_GetDifficultyMax", event => {
        let data = event.data;
        // setGameSelectPhase(data.game_select_phase);

    }, [])

    useGameEvent("MapChapter_GetPlayerHeroList", event => {
        let data = event.data;
        // setGameSelectPhase(data.game_select_phase)
    })

    useGameEvent("MapChapter_SelectDifficulty", event => {
        let data = event.data;
        let difficulty = data.select_difficulty;
        $.Msg(["MapChapter_SelectDifficulty", data])
        setDifficulty(difficulty)
    })

    useGameEvent("MapChapter_GetGameSelectPhase", event => {
        let data = event.data;
        setGameSelectPhase(data.game_select_phase)
    })

    return (
        <Panel
            id='ChapterSelect'
            className={`container GameSelectPhase_${GameSelectPhase} ${Show ? "Open" : ""}`}
            hittest={false}
            onload={OnLoad}
        >
            <Panel className="content">
                <Panel className="head">
                    <Panel className="title">
                        <Label text="chapter_select" />
                    </Panel>
                    <Panel className="head-btn">
                        <Button className="btn-close" onactivate={() => { ToggleHandle(Show) }} />
                    </Panel>
                </Panel>
            </Panel>
            <Panel id="ChapterContent" className="content">
                <CurrentStageSelect difficulty={Difficulty} />
                <StageHeroSelect difficulty={Difficulty} />
            </Panel>

        </Panel>
    );
};
