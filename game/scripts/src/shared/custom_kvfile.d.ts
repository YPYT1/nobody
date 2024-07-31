import * as rune_config_json   from "./../json/config/game/rune/rune_config.json"

declare global {
    type RuneName = keyof typeof rune_config_json
}
