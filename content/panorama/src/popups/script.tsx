


export const Initialize = () => {
    InitPopupsContent();
}


const popups_ids: string[] = ["loading", "store_purchase"]
const InitPopupsContent = () => {
    $.Msg(["InitPopupsContent 1"])
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
