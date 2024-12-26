


export const Initialize = () => {
    InitPopupsContent();
}


const popups_ids: string[] = ["loading", "store_purchase","get_item"]
const InitPopupsContent = () => {
    $.Msg(["InitPopupsContent 2"])
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
