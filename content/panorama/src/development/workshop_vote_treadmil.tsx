const loop_index = 0;

function StartLoopEconId(e: ScenePanel) {
    // full_body_loadout
    // loop_index++;
    // $.Msg(["loop_index", loop_index])
    // 7715375074
    // e.SpawnHeroInScenePanelByPlayerSlot("7715375074", 1,"featured_hero");
    const state = e.SpawnHeroInScenePanelByHeroId(1, 'featured_hero', 22764);

    $.Msg(['state', state]);
    e.FireEntityInput('featured_hero', 'StartGestureOverride', 'ACT_DOTA_LOADOUT');
    // e.SpawnHeroInScenePanelByPlayerSlotWithFullBodyView( "npc_dota_hero_wisp", 1 );
    $.Schedule(1, () => {
        //     // e.ReloadScene();
        //     StartLoopEconId(e)
        // e.SetUnit("npc_dota_hero_axe", "full_body_right_side", true)
    });
}

function LoopEconId(e: ScenePanel) {}

let heroModel: ScenePanel;

export const WorkshopVoteTreadmil = () => {
    return (
        <Panel
            id="WorkshopVoteTreadmil"
            // visible={false}
            onload={e => {
                // let Scene = $.CreatePanel("DOTAUIEconSetPreview", e, "InGamePreviewScene", {
                //     class: 'Use3DPreview EconSetPreview root',
                //     hittest: false,
                //     // map: "maps/ui/dota_hud/loadout_2022",
                //     camera: "default_camera",

                //     displaymode: "loadout_small",
                //     // light: "global_light",
                //     allowrotation: true,
                //     drawbackground: true,
                //     particleonly: false,
                //     renderdeferred: true,
                // });
                // heroModel = e.FindChildTraverse('Preview3DItems') as ScenePanel;

                // // $.Msg(heroModel)
                // $.Schedule(0, () => {

                //     // heroModel.SetScenePanelToLocalHero(2 as HeroID);
                //     // let state = heroModel.SetScenePanelToPlayerHero("npc_dota_hero_wisp", 0);
                //     // $.Msg(["state", state]);
                const CScenePanel = e.FindChildTraverse('InGamePreviewScene') as ScenePanel;
                //     var nItemDef = 4004;
                //     var nItemStyle = 0;
                //     var strHero = "npc_dota_hero_axe";
                //     var strSlotType = "";
                StartLoopEconId(CScenePanel);
                //     $.DispatchEvent('DOTAEconSetPreviewSetItemDef', heroModel, nItemDef, strHero, strSlotType, nItemStyle, true, false);
                // })
            }}
        >
            {/* <GenericPanel
                type="DOTAUIEconSetPreview"
                id="InGamePreviewScene"
                class="HideStickerbacks"
                itemdef="24182 24183"
                stickeranim="stock_idle"
                renderdeferred="true"
                deferredalpha="true"
                antialias="false"
                particleonly="false"
                allowrotation="true"
                map="scenes/stickers/sticker_basic"
                camera="sticker_camera_tight"
                light="stickerlight"
                // rotateonmousemove="true"
                // rotationlimits="1.5 -1.5 1.5 -1.5"
                // yawaxis="pitch"
                // pitchaxis="roll"
                stickermap="scenes/stickers/sticker_basic_locked"
            /> */}

            <DOTAScenePanel
                id="InGamePreviewScene"
                map="backgrounds/workshop_vote_treadmil"
                // unit="npc_dota_hero_axe"
                camera="hero_camera"
                light="hero_light"
                renderdeferred={false}
                hittest={false}
                antialias={true}
                particleonly={false}
                // environment="full_body_loadout"
                activity-modifier="run_haste"

                // id="InGamePreviewScene"
                // map="backgrounds/workshop_vote_treadmil"
                // camera="hero_camera"
                // light='light_frontpage'
                // particleonly={false}
                // renderdeferred={false}
                // rendershadows={false}
                // particleonly={true}
            />
        </Panel>
    );
};
