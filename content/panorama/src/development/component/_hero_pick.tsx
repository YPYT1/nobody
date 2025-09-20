const PickHeroHandler = (heroid: number, facetid: number) => {
    GameEvents.SendCustomGameEventToServer('Development', {
        event_name: 'ReplaceHero',
        params: {
            heroid: heroid,
            facetid: facetid,
        },
    });
};

export const HeroPick = ({ closedHandle }: { closedHandle: (a: string) => void }) => {
    return (
        <Panel id="HeroPick" className={`fc-heropick`}>
            <GenericPanel
                id="HeroPicker"
                type="DOTAUIHeroPicker"
                facet-select-popup={true}
                onload={e => {
                    $.RegisterEventHandler('DOTAUIHeroPickerHeroSelected', e, (heroid: number, facetid: number) => {
                        // $.Msg([heroid,facetid])
                        PickHeroHandler(heroid, facetid);
                        closedHandle('None');
                    });
                }}
            />
        </Panel>
    );
};
