

const PlayerHeroSelect = () => {

}

const StageDifficultyRows = ({ stage, difficulty }: { stage: number, difficulty: number }) => {

    return (
        <Button className="StageDifficultyRows">
            <Label text={`${stage}- ${difficulty}`} />
        </Button>
    )
}

const StageDifficulty = ({ stage }: { stage: number }) => {

    return (
        <Panel className="StageDifficulty">
            {
                [1, 2, 3, 4, 5, 6, 7, 8].map((v, k) => {
                    return <StageDifficultyRows key={k} stage={stage} difficulty={v} />
                })
            }
        </Panel>
    )
}
const SelectStage = ({ stage }: { stage: number }) => {

    return (
        <Button className="SelectStage">
            <Label text={`STAGE ${stage}`} />
        </Button>
    )
}

/**
 * 关卡难度选择
 */
const CurrentStageSelect = () => {

    return (
        <Panel id="CurrentStageSelect">
            <Panel id="SelectStageList">
                {
                    [1, 2, 3, 4].map((v, k) => {
                        return <SelectStage key={k} stage={v} />
                    })
                }
            </Panel>
            <Panel id="StageDifficultyList">
                {
                    [1, 2, 3, 4].map((v, k) => {
                        return <StageDifficulty key={k} stage={v} />
                    })
                }
            </Panel>
        </Panel>
    )
}

/** 章节选择 */
export const ChapterSelect = () => {

    return (
        <Panel id='ChapterSelect' className="am2-container StageSelect" hittest={false}>
            <CurrentStageSelect />
        </Panel>
    );
};
