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


const usePlayerState = () => {
    let readystate: MapSelectHeroList[] = [];

    let AllPlayerId = Game.GetAllPlayerIDs();
    for (let pid of AllPlayerId) {
        let playerinfo = Game.GetPlayerInfo(pid);
        readystate.push({
            // steamid: playerinfo.player_steamid,
            hero_id: 57,
            state: 0,
            // vote_count: 0,
            // vote_action: 0,
            // player_id: pid,
        });

    }
    return readystate;
};

const PlayerReadyStateItem = ({ ready_state, hero_id, player, }:
    { ready_state: number; hero_id: number; player: PlayerID; }
) => {
    // $.Msg(["steamid", steamid]);
    const playerinfo = Game.GetPlayerInfo(player);
    const steamid = playerinfo.player_steamid;
    const heroname = heroes_key[hero_id]
    const PlayerInfo = Game.GetPlayerInfo(player as PlayerID);
    const isLocal = Players.GetLocalPlayer() == player;
    const bIsReady = ready_state == 1;
    // const bCanVote = vote_action == 1 && !isLocal;

    return (
        <Panel className={`PlayerReadyStateItem ${bIsReady && "is_ready"} ${isLocal && "Local"}`}>
            {/* <Panel className='MasterVoteCount'>
                <Label text={vote_count} />
            </Panel> */}
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
                    <Image src={`file://{images}/heroes/selection/${heroname}.png`} />
                </Panel>
                <Panel className='HeroBorder' />
            </Panel>
            <Panel className='PlayerInfo'>
                <Panel id="ReadyState">
                    <Label className='NotReady' visible={ready_state == 0} text={"正在选择..."} />
                    <Label className='IsReady' visible={ready_state == 1} text={"已选择"} />
                </Panel>
                <Label id='PlayerName' text={PlayerInfo.player_name} />
            </Panel>
            {/* <Panel className='MasterVoteAction'>
                <Button
                    className='VoteButton'
                    // visible={!isLocal}
                    enabled={bCanVote}
                    onmouseover={(e) => {
                        ShowCustomTextTooltip(e, "#custom_text_master_vote");
                    }}

                    onmouseout={() => {
                        HideCustomTextTooltip();
                    }}
                    onactivate={(e) => {
                        e.enabled = false;
                        GameEvents.SendCustomGameEventToServer("GamePlayer", {
                            event_name: "MasterVote",
                            params: {
                                vote_player: player
                            }
                        }, "MasterVote");
                    }}>
                </Button>
            </Panel> */}
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

export const StageHeroSelect = ({ difficulty }: { difficulty: string }) => {

    const [PlayerState, setPlayerState] = useState(usePlayerState());

    useGameEvent("MapChapter_GetPlayerSelectHeroList", event => {
        let data = event.data;
        $.Msg(["data", data])
        let player_state = Object.values(data.hero_ids);
        setPlayerState(player_state)
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
                        <Label text={`当前关卡 ${difficulty}`} />
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
                        <Panel id="PlayerList">
                            {
                                PlayerState.map((v, k) => {
                                    return <PlayerReadyStateItem
                                        key={k}
                                        player={k as PlayerID}
                                        // steamid={v.steamid}
                                        ready_state={v.state}
                                        hero_id={v.hero_id}
                                    // vote_count={v.vote_count}
                                    // vote_action={VoteState}
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