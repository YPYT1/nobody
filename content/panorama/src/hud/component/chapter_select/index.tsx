import { useCallback, useState } from "react"
import { CurrentStageSelect } from "./_current_stage_select";
import { StageHeroSelect } from "./_stage_hero_select";


/** 章节选择 */
export const ChapterSelect = () => {


    return (
        <Panel id='ChapterSelect' className="am2-container" hittest={false} visible={true}>
            <CurrentStageSelect />
            <StageHeroSelect />
        </Panel>
    );
};
