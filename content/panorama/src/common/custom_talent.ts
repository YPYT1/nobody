import { default as TalentTreeConfig } from './../json/config/game/hero/talent_tree/talent_tree_config.json';

export const HeroTreeObject = TalentTreeConfig;

// type HeroName = keyof typeof HeroTreeObject;
type TalentTreeRowProps = (typeof HeroTreeObject)['1'];

// interface HeroTalentObject = {

// }

export const GetAllHeroTalentTree = () => {
    return HeroTreeObject;
};
export const GetHeroTalentTreeObject = () => {
    const res_obj = HeroTreeObject;
    if (res_obj) {
        return res_obj;
    } else {
        return {} as typeof res_obj;
    }
};

export const GetHeroTalentTreeRowData = (key: string) => {
    const res_obj = HeroTreeObject;
    return res_obj[key as '1'];
};

interface TalentTreeObject {
    name: string;
    max: number;
    img: string;
    sub: number[];
}

interface TalentTreeProps {
    [index: string]: TalentTreeObject[];
}
