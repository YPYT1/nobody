import { useCallback, useState } from "react"


const StageDifficultyRows = ({ stage, difficulty, handle }: { stage: number, difficulty: number, handle: (diff: number) => void }) => {

    return (
        <Button className="Btn StageDifficultyRows" onactivate={() => {
            handle(stage * 100 + difficulty)
        }}>
            <Label text={`${stage}- ${difficulty}`} />
        </Button>
    )
}

const StageDifficulty = ({ stage, handle }: { stage: number, handle: (diff: number) => void }) => {

    return (
        <Panel id={`StageDifficulty_${stage}`} className="StageDifficulty">
            {
                [1, 2, 3, 4, 5, 6, 7, 8].map((v, k) => {
                    return <StageDifficultyRows key={k} stage={stage} difficulty={v} handle={handle} />
                })
            }
        </Panel>
    )
}
const SelectStage = ({ stage, handle }: { stage: number, handle: (stage: number) => void }) => {

    return (
        <Button className="Btn SelectStage" onactivate={() => {
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
    const [Difficulty, setDifficulty] = useState(101);

    const select_stage = useCallback((stage: number) => {
        setStage(stage)
    }, []);


    return (
        <Panel id="CurrentStageSelect" className={`Stage_${Stage}`}>
            <Panel id="StageAction">
                <Panel id="SelectStageList">
                    {
                        [1, 2, 3, 4].map((v, k) => {
                            return <SelectStage key={k} stage={v} handle={select_stage} />
                        })
                    }
                </Panel>
                <Panel id="StageDifficultyList">
                    {
                        [1, 2, 3, 4].map((v, k) => {
                            return <StageDifficulty key={k} stage={v} handle={setDifficulty} />
                        })
                    }
                </Panel>
            </Panel>

            <Panel id="StageBtnGroup">
                <Button className="Btn" onactivate={() => {
                    $.Msg(["STAGE READY", Difficulty])
                }}>
                    <Label text={`START==> ${Difficulty}`} />
                </Button>
            </Panel>
        </Panel>
    )
}