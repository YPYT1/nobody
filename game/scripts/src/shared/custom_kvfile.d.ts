import type * as rune_config_json from './../json/config/game/rune/rune_config.json';

import type * as mysterious_shop_config from './../json/config/game/shop/mysterious_shop_config.json';

import type * as pictuer_fetter_ability from './../json/config/server/picture/pictuer_fetter_ability.json';

declare global {
    type RuneName = keyof typeof rune_config_json;
    type PropName = keyof typeof mysterious_shop_config;
    type PictuerFetterAbilityName = keyof typeof pictuer_fetter_ability;
}
