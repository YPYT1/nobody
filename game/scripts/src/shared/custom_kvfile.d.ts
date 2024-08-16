import * as rune_config_json   from "./../json/config/game/rune/rune_config.json"

import * as mysterious_shop_config from "./../json/config/game/shop/mysterious_shop_config.json";

declare global {
    type RuneName = keyof typeof rune_config_json
    type PropName = keyof typeof mysterious_shop_config
    
}
