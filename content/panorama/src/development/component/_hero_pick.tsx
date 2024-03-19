const PickHeroHandler = (heroid: number) => {
    GameEvents.SendCustomGameEventToServer("Development", {
        event_name: "ReplaceHero",
        params: {
            heroid: heroid
        }
    })
}

export const HeroPick = () => {

    return (
        <Panel id="HeroPick" className={`fc-heropick`}>
            <GenericPanel id="HeroPicker" type='DOTAUIHeroPicker' onload={(e) => {
                $.RegisterEventHandler('DOTAUIHeroPickerHeroSelected', e, (heroid: number) => {
                    PickHeroHandler(heroid);
                })
            }} />
        </Panel>
    )
}