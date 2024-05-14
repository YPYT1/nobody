import { useCallback } from "react";
import { useGameEvent } from "react-panorama-x";

import { default as ChapterInfo } from "../../../json/config/chapter_info.json"
import { default as MapInfoDifficulty } from "../../../json/config/map_info_difficulty.json"

type DifficultyType = keyof typeof MapInfoDifficulty;
type DifficultyRowData = typeof MapInfoDifficulty[DifficultyType]

const InitChapterMapData = () => {
    let map_data: { [chapter: string]: { [diff: string]: DifficultyRowData } } = {};
    for (let diff in MapInfoDifficulty) {
        let row_data = MapInfoDifficulty[diff as keyof typeof MapInfoDifficulty];
        let chapter_key = row_data.chapter_key;
        if (map_data[chapter_key] == null) { map_data[chapter_key] = {} }
        map_data[chapter_key][diff] = row_data
    }
    return map_data
}

const ChapterMapData = InitChapterMapData();


const StageDifficultyRows = ({ chapter, difficulty }: { chapter: number, difficulty: number }) => {

    return (
        <Button className="btn" style={{ width: "120px" }} onactivate={() => {
            let diff = `${chapter * 100 + difficulty}`
            GameEvents.SendCustomGameEventToServer("MapChapter", {
                event_name: "SelectDifficulty",
                params: {
                    difficulty: `${diff}`
                }
            })
        }}>
            <Label text={`${chapter}- ${difficulty}`} />
        </Button>
    )
}

const StageDifficulty = ({ chapter, default_max }: { chapter: number, default_max: number }) => {


    return (
        <Panel id={`StageDifficulty_${chapter}`} className="StageDifficulty row wrap">
            {
                Array(default_max).fill(0).map((v, k) => {
                    return <StageDifficultyRows key={k} chapter={chapter} difficulty={k + 1} />
                })
            }
        </Panel>
    )
}
const SelectChapter = ({ chapter, handle }: { chapter: number, handle: (chapter: number) => void }) => {

    return (
        <Button className="btn" onactivate={() => { handle(chapter) }}>
            <Label text={`chapter ${chapter}`} />
        </Button>
    )
}

/**
 * 关卡难度选择 current_stage_select
 */
export const CurrentStageSelect = () => {

    let MainPanel: Panel;

    // const [Stage, setStage] = useState(1);

    const select_stage = (stage: number) => {
        // setStage(stage)
        // $.Msg(["select_stage", stage])
        for (let i = 1; i <= 5; i++) {
            // $.Msg([`Stage_${stage}`, stage == i])
            MainPanel.SetHasClass(`Stage_${i}`, stage == i);
        }
    };


    useGameEvent("MapChapter_GetDifficultyMax", event => {
        let data = event.data;
        // setGameSelectPhase(data.game_select_phase);
        // djksdkljsa
    }, [])



    return (
        <Panel
            id="CurrentStageSelect"
            // className={`Stage_${Stage}`}
            onload={(e) => {
                MainPanel = e;
                MainPanel.SetHasClass("Stage_1", true)
            }}
        >

            <Panel className="title">
                <Label text="章节选择" />
            </Panel>
            <Panel id="ChapterList" className="row btn-group">
                {
                    Object.values(ChapterInfo).map((v, k) => {
                        return <SelectChapter key={k} chapter={v.name} handle={select_stage} />
                    })
                }
            </Panel>
            <Panel id="ChapterForDiff" className="row btn-group">
                {
                    Object.values(ChapterInfo).map((v, k) => {
                        return <StageDifficulty key={k} chapter={v.name} default_max={v.default_max} />
                    })
                }
            </Panel>

            <Panel id="StageBtnGroup">
                <Button className="btn" onactivate={() => {
                    GameEvents.SendCustomGameEventToServer("MapChapter", {
                        event_name: "SelectDifficultyAffirm",
                        params: {}
                    })
                }}>
                    <Label localizedText="START==> {s:difficulty}" />
                </Button>
            </Panel>
        </Panel >
    )
}