import { useState } from "react";
import { default as NpcHeroesCustom } from "../../../json/npc_heroes_custom.json"
import { useGameEvent } from "react-panorama-x";

function InitHeroes() {
    let hero_table: { [heroid: string]: string } = {};
    for (let heroname in NpcHeroesCustom) {
        let row_data = NpcHeroesCustom[heroname as keyof typeof NpcHeroesCustom];
        let enable = row_data.Enable;
        if (enable == 1) {
            let hero_id = row_data.HeroID;
            // let index = row_data.Index;
            hero_table[`${hero_id}`] = heroname
            // hero_table.push({ heroname, enable, index });
            // heroes_order_table[index] = heroname;
        }

    }
    // hero_table.sort((a, b) => { return a.index - b.index; });
    return hero_table;
}

const heroes_key = InitHeroes();


const PlayerReadyStateItem = ({ player, }: { player: PlayerID; }) => {
    // $.Msg(["steamid", steamid]);
    const playerinfo = Game.GetPlayerInfo(player);
    const steamid = playerinfo.player_steamid;
    // const heroname = heroes_key[hero_id]
    const PlayerInfo = Game.GetPlayerInfo(player as PlayerID);
    const isLocal = Players.GetLocalPlayer() == player;
    const bIsReady = false;
    // const bCanVote = vote_action == 1 && !isLocal;
    // 
    return (
        <Panel className={`PlayerReadyStateItem ${isLocal && "is_local"}`} visible={false}>
            <Panel className='AvatarImage' visible={false} >
                <DOTAAvatarImage
                    style={{ width: "64px", height: "64px", verticalAlign: "middle" }}
                    // steamid={steamid == "0" ? "local" : steamid}
                    nocompendiumborder={false}
                    onmouseover={() => { }}
                />
            </Panel>
            <Panel className="SelectHero">
                <Panel className='HeroImage'>
                    <Image id="HeroIcon" src={``} />
                </Panel>
                <Panel className='HeroBorder' />
            </Panel>
            <Panel className='PlayerInfo'>
                <Panel id="ReadyState">
                    <Label className='NotReady' text={"正在选择..."} />
                    <Label className='IsReady' text={"已选择"} />
                </Panel>
                <Label id='PlayerName' text={PlayerInfo.player_name} />
            </Panel>
        </Panel>

    );
};

function GetHeroData() {

}

const HeroCardButton = ({ heroname, hero_id }: { heroname: string, hero_id: number }) => {

    return (
        <RadioButton
            className="HeroCardButton"
            group="HeroCardButtonGroup"
            onactivate={() => {
                GameEvents.SendCustomGameEventToServer("MapChapter", {
                    event_name: "SelectHero",
                    params: {
                        hero_id: hero_id,
                    }
                })
            }}
        >
            <Panel className="HeroImage">
                <Image className="HeroIcon" src={`file://{images}/heroes/selection/${heroname}.png`} />
                <DOTAHeroMovie className="HeroMovie" heroname={heroname} />
            </Panel>
        </RadioButton>
    )
}

export const StageHeroSelect = () => {

    let PlayerList: Panel;
    // const [PlayerState, setPlayerState] = useState(usePlayerState());

    useGameEvent("MapChapter_GetPlayerSelectHeroList", event => {
        let data = event.data;
        let hero_ids = data.hero_ids
        // let player_state = Object.values(data.hero_ids);
        // $.Msg(["player_state", player_state])
        // setPlayerState(player_state)
        if (PlayerList) {
            for (let k in hero_ids) {
                let index = parseInt(k) - 1;
                let info = hero_ids[k];
                // $.Msg(["k",k])
                let StatePanel = PlayerList.GetChild(index);
                // $.Msg(StatePanel)
                if (StatePanel) {
                    StatePanel.visible = true;
                    let HeroIcon = StatePanel.FindChildTraverse("HeroIcon") as ImagePanel;
                    const heroname = heroes_key[info.hero_id]
                    HeroIcon.SetImage(`file://{images}/heroes/selection/${heroname}.png`)
                    StatePanel.SetHasClass("is_ready", info.state == 1)
                }
            }
        }



    }, [])

    return (
        <Panel
            id="StageHeroSelect"
            className="container"
            onload={() => {
                GameEvents.SendCustomGameEventToServer("MapChapter", {
                    event_name: "GetPlayerSelectHeroList",
                    params: {}
                })
            }}
        >
            <Panel className="content">
                <Panel className="grid">
                    <Panel className="head">
                        <Label localizedText="当前关卡 {s:difficulty}" />
                    </Panel>
                </Panel>
                <Panel className="grid">
                    <Panel className="title">
                        <Label text="英雄选择" />
                    </Panel>
                    <Panel className="grid">
                        <Panel id="PickHeroList">
                            {
                                Object.entries(NpcHeroesCustom).map((v, k) => {
                                    return <HeroCardButton key={k} heroname={v[0]} hero_id={v[1].HeroID} />
                                })
                            }
                        </Panel>
                    </Panel>
                </Panel>
                <Panel className="grid">
                    <Panel className="title">
                        <Label text="玩家列表" />
                    </Panel>
                    <Panel className="grid">
                        <Panel id="PlayerList" onload={(e) => { PlayerList = e; }}>
                            {
                                Game.GetAllPlayerIDs().map((v, k) => {
                                    return <PlayerReadyStateItem
                                        key={k}
                                        player={v}
                                    />
                                })

                            }
                        </Panel>

                    </Panel>
                </Panel>
                <Panel className="vert-bot grid">
                    <Button
                        className="btn hor-center"
                        style={{ width: "120px" }}
                        onactivate={() => {
                            GameEvents.SendCustomGameEventToServer("MapChapter", {
                                event_name: "SelectHeroAffirm",
                                params: {}
                            })
                        }}

                    >
                        <Label text={"确认"} />
                    </Button>
                </Panel>
            </Panel>

        </Panel>
    )
}