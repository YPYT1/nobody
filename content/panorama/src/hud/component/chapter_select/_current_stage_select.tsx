import { useCallback, useState } from "react";
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
        <Button className="btn" onactivate={() => {
            handle(chapter)
        }}>
            <Label text={`chapter ${chapter}`} />
        </Button>
    )
}

/**
 * 关卡难度选择 current_stage_select
 */
export const CurrentStageSelect = ({ difficulty }: { difficulty: string }) => {

    const [Stage, setStage] = useState(1);
    const [Difficulty, setDifficulty] = useState("101");

    const select_stage = useCallback((stage: number) => {
        setStage(stage)
    }, []);



    return (
        <Panel id="CurrentStageSelect" className={`container Stage_${Stage}`}>
            <Panel className="content">
                <Panel className="title">
                    <Label text="章节选择" />
                </Panel>
                <Panel className="row btn-group">

                    {
                        Object.values(ChapterInfo).map((v, k) => {
                            return <SelectChapter key={k} chapter={v.name} handle={select_stage} />
                        })
                    }

                </Panel>
                <Panel className="row btn-group">
                    {
                        Object.values(ChapterInfo).map((v, k) => {
                            return <StageDifficulty key={k} chapter={v.name} default_max={v.default_max} />
                        })
                    }
                </Panel>

            </Panel>


            <Panel id="StageBtnGroup">
                <Button className="btn" onactivate={() => {
                    GameEvents.SendCustomGameEventToServer("MapChapter", {
                        event_name: "SelectDifficultyAffirm",
                        params: {}
                    })
                }}>
                    <Label text={`START==> ${Difficulty}`} />
                </Button>
            </Panel>
        </Panel >
    )
}