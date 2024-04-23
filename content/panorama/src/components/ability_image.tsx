import React from 'react';
import { GetTextureSrc } from "../common/custom_kv_method";
import { default as NpcAbilityCustom } from "./../json/npc_abilities_custom.json";

export const CAbilityImage = ({ id, abilityname }: { id: string, abilityname?: string; }) => {

    let image_src = "";
    let ability_data = NpcAbilityCustom[abilityname as keyof typeof NpcAbilityCustom];
    if (ability_data) {
        let image = ability_data.AbilityTextureName;
        image_src = GetTextureSrc(image);
    }


    return (
        <Panel id={id} className="CAbilityImage" >
            <Image src={image_src} scaling='stretch-to-fit-y-preserve-aspect' />
        </Panel>

    )
}