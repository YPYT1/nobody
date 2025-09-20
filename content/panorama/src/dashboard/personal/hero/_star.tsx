const HeroPopups_Star = $('#HeroPopups_Star');
const StarClosedBtn = $('#StarClosedBtn') as Button;

let select_hero_id = -1;
export const InitHeroStarUpView = () => {
    StarClosedBtn.SetPanelEvent('onactivate', () => {
        HeroPopups_Star.SetHasClass('Open', false);
    });
};

export const OpenStarUpPage = (heroid: number) => {
    if (heroid == -1) {
        return;
    }
    HeroPopups_Star.SetDialogVariableInt('curr_count', 0);
    HeroPopups_Star.SetDialogVariableInt('need_count', 0);
    HeroPopups_Star.SetHasClass('Open', true);
    HeroPopups_Star.SetDialogVariableInt('heroid', heroid);
    // $.Msg(["OpenStarUpPage", heroid, select_hero_id])
    if (select_hero_id == heroid) {
        // HeroPopups_Star.SetHasClass("Open", true)
        return;
    }
    select_hero_id = heroid;
};
