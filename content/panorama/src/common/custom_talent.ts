import { default as talent_tree_drow_ranger } from "./../json/config/game/hero/talent_tree/drow_ranger.json";


let HeroTreeObject = {
    "drow_ranger": talent_tree_drow_ranger
}

export const GetHeroTalentTreeObject = (heroname: string) => {
    let res_obj = HeroTreeObject[heroname as keyof typeof HeroTreeObject]
    if (res_obj) {
        return res_obj
    } else {
        return {}
    }
}


export const GetHeroTalentTreeRowData = (heroname: string, key: string) => {
    let res_obj = HeroTreeObject[heroname as keyof typeof HeroTreeObject]
    return res_obj[key as "1"]
}