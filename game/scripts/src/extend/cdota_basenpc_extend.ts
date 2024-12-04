
/** @noSelf */
import { HeroTalentObject } from '../kv_data/hero_talent_object';
import * as RuneConfig from '../json/config/game/rune/rune_config.json';

declare global {

    interface CDOTA_BaseNPC {

        GetTalentKv<
            Key extends keyof typeof HeroTalentObject,
            T1 extends keyof typeof HeroTalentObject[Key]["AbilityValues"],
        >(index_key: Key, ability_key: T1): number

        GetRuneKv<
            Key extends keyof typeof RuneConfig,
            T1 extends keyof typeof RuneConfig[Key]["AbilityValues"],
        >(index_key: Key, ability_key: T1): number

        /** 被冻结 */
        State_Frozen(): boolean;

        SetAttributeInKey(key: string, attr_list: CustomAttributeTableType, timer?: number): void;
        DelAttributeInKey(key: string): void;
    }
}


CDOTA_BaseNPC.GetTalentKv = function (index: any, key: any) {
    return GameRules.HeroTalentSystem.GetTalentKvOfUnit(this, index, key);
}

CDOTA_BaseNPC.GetRuneKv = function (index: any, key: any) {
    return GameRules.RuneSystem.GetKvOfUnit(this, index, key)
}

CDOTA_BaseNPC.State_Frozen = function () {
    return this.HasModifier("modifier_element_effect_ice_frozen")
}

CDOTA_BaseNPC.SetAttributeInKey = function (key: string, attr_list: CustomAttributeTableType, timer: number = -1) {
    GameRules.CustomAttribute.SetAttributeInKey(this, key, attr_list, timer)
}

CDOTA_BaseNPC.DelAttributeInKey = function (key: string) {
    GameRules.CustomAttribute.DelAttributeInKey(this, key)
}