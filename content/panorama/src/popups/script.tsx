


export const Initialize = () => {
    InitPopupsContent();
}

const popups_ids: string[] = [
    "loading",
    // "store_purchase",
    "get_item",
    "gacha_result",
    "server_msg",
    "card_result",
    // "payment",
]

const InitPopupsContent = () => {
    for (let key of popups_ids) {
        $("#" + key).BLoadLayout(
            `file://{resources}/layout/custom_game/popups/${key}/${key}.xml`,
            true,
            false
        );
    }
}

(() => {
    Initialize();
})();
