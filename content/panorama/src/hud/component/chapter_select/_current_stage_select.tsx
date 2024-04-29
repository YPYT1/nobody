import { useCallback, useState } from "react";

import { default as MapInfoDifficulty } from "../../../json/config/map_info_difficulty.json"
import { useGameEvent } from "react-panorama-x";

const StageDifficultyRows = ({ stage, difficulty }: { stage: number, difficulty: number }) => {

    return (
        <Button className="btn" style={{ width: "120px" }} onactivate={() => {
            // handle(stage * 100 + difficulty);
            let diff = `${stage * 100 + difficulty}`
            GameEvents.SendCustomGameEventToServer("MapChapter", {
                event_name: "SelectDifficulty",
                params: {
                    difficulty: `${diff}`
                }
            })
        }}>
            <Label text={`${stage}- ${difficulty}`} />
        </Button>
    )
}

const StageDifficulty = ({ stage }: { stage: number }) => {

    return (
        <Panel id={`StageDifficulty_${stage}`} className="StageDifficulty row wrap">
            {
                [1, 2, 3, 4, 5, 6, 7, 8].map((v, k) => {
                    return <StageDifficultyRows key={k} stage={stage} difficulty={v} />
                })
            }
        </Panel>
    )
}
const SelectStage = ({ stage, handle }: { stage: number, handle: (stage: number) => void }) => {

    return (
        <Button className="btn" onactivate={() => {
            handle(stage)
        }}>
            <Label text={`STAGE ${stage}`} />
        </Button>
    )
}

/**
 * 关卡难度选择 current_stage_select
 */
export const CurrentStageSelect = () => {

    const [Stage, setStage] = useState(1);
    const [Difficulty, setDifficulty] = useState("101");

    const select_stage = useCallback((stage: number) => {
        setStage(stage)
    }, []);

    useGameEvent("MapChapter_SelectDifficulty", event => {
        // 当前难度
        let data = event.data;
        let difficulty = data.select_difficulty;
        // $.Msg(["MapChapter_SelectDifficulty", data])
        setDifficulty(difficulty)
    })

    return (
        <Panel id="CurrentStageSelect" className={`container Stage_${Stage}`}>
            <Panel className="content">
                <Panel className="title">
                    <Label text="章节选择" />
                </Panel>
                <Panel className="row btn-group">

                    {
                        [1, 2, 3, 4].map((v, k) => {
                            return <SelectStage key={k} stage={v} handle={select_stage} />
                        })
                    }

                </Panel>
                <Panel className="row btn-group">
                    {
                        [1, 2, 3, 4].map((v, k) => {
                            return <StageDifficulty key={k} stage={v} />
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