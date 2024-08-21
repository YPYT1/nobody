import { default as TalentTreeConfig } from "./../json/config/game/hero/talent_tree/talent_tree_config.json";



export const HeroTreeObject = TalentTreeConfig

// type HeroName = keyof typeof HeroTreeObject;
type TalentTreeRowProps = typeof HeroTreeObject["1"];

// interface HeroTalentObject = {
        
// }

export const GetAllHeroTalentTree = ()=>{
    return HeroTreeObject
}
export const GetHeroTalentTreeObject = () => {
    let res_obj = HeroTreeObject
    if (res_obj) {
        return res_obj
    } else {
        return {} as typeof res_obj
    }
}


export const GetHeroTalentTreeRowData = (key: string) => {
    let res_obj = HeroTreeObject
    return res_obj[key as "1"]
}

interface TalentTreeObject {
    name: string,
    max: number,
    img: string;
    sub: TalentTreeObject[]
}

interface TalentTreeProps {
    [index: string]: TalentTreeObject[];
}

export const FormatTalentTree = (talent_tree_obj: any , hero_id:number) => {
    let temp_tree: TalentTreeProps = {};
    for (let k in talent_tree_obj) {
        let row_data = talent_tree_obj[k];
        if (row_data.hero_id != hero_id){ continue}
        let parent_node = `` + row_data.parent_node;
        let index = row_data.index;

        if (temp_tree[index] == null) { temp_tree[index] = []; }
        let temp_obj = { name: k, max: row_data.max_number, img: row_data.img, sub: [] }
        if (parent_node == "0") {
            temp_tree[index].push(temp_obj)
        } else {
            for (let sub_tree of temp_tree[index]) {
                if (sub_tree.name == parent_node) {
                    sub_tree.sub.push(temp_obj)
                    break
                }
                for (let sub_tree2 of sub_tree.sub) {
                    if (sub_tree2.name == parent_node) {
                        sub_tree2.sub.push(temp_obj)
                        break
                    }
                    for (let sub_tree3 of sub_tree2.sub) {
                        if (sub_tree3.name == parent_node) {
                            sub_tree3.sub.push(temp_obj)
                            break
                        }
                    }
                }
            }
        }
    }
    
    return temp_tree
}