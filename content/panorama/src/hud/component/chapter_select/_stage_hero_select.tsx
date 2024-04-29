import { default as NpcHeroesCustom } from "../../../json/npc_heroes_custom.json"

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
                        hero_id: 0,
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

    return (
        <Panel id="StageHeroSelect" className="container">
            <Panel className="content">
                <Panel className="grid">
                    <Panel className="head">
                        <Label text="当前关卡 ?-?" />
                    </Panel>
                </Panel>
                <Panel className="grid">
                    <Panel className="title">
                        <Label text="英雄选择" />
                    </Panel>
                    <Panel className="grid">
                        <Panel id="PickHeroList">
                            {
                                Object.keys(NpcHeroesCustom).map((v, k) => {
                                    return <HeroCardButton key={k} heroname={v} hero_id={k} />
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
                        
                    </Panel>
                </Panel>
            </Panel>
            <Panel className="vert-bot grid">
                <Button className="btn hor-center" style={{ width: "120px" }}>
                    <Label text={"确认"} />
                </Button>
            </Panel>
        </Panel>
    )
}