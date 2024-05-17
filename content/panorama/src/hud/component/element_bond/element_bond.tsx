import { useGameEvent } from "react-panorama-x"

const element_enum_label: CElementType[] = ["null", "fire", "ice", "thunder", "wind", "light", "dark"];
let MainPanel: Panel;

const ElementSynergy = ({ element_type }: { element_type: CElementType }) => {

    return (
        <Panel
            id={element_type}
            className="ElementSynergy"
            visible={false}
            onload={(e) => {
                e.SetDialogVariable("current_count", "0");
            }}
        >
            <Panel className="SynergyIcon">
                <Image id="Icon" />
            </Panel>
            <Panel className="SynergyCount">
                <Label localizedText="{s:current_count}" />
            </Panel>
            <Panel className="SynergyInfo">
                <Panel className="SynergyTitle">
                    <Label text={element_type} />
                </Panel>
                <Panel className="EffectList" >
                    <Label className="CurrentCountLabel Count_2" text={2} />
                    <Label className="symbol" text={">"} />
                    <Label className="CurrentCountLabel Count_3" text={3} />
                    <Label className="symbol" text={">"} />
                    <Label className="CurrentCountLabel Count_4" text={4} />
                    <Label className="symbol" text={">"} />
                    <Label className="CurrentCountLabel Count_5" text={5} />
                    <Label className="symbol" text={">"} />
                    <Label className="CurrentCountLabel Count_6" text={6} />
                    <Label className="symbol" text={">"} />
                    <Label className="CurrentCountLabel Count_7" text={7} />
                </Panel>

            </Panel>
        </Panel>
    )
}

const ElementBondOnload = (e: Panel) => {
    MainPanel = e;

    $.Schedule(0.1, () => {
        GameEvents.SendCustomGameEventToServer("NewArmsEvolution", {
            event_name: "GetArmssElementBondDateList",
            params: {}
        });
    })


}

export const ElementBondContainer = () => {

    useGameEvent("NewArmsEvolution_GetArmssElementBondDateList", event => {
        let data = event.data;
        let element_obj = data.Element;
        // $.Msg(["MainPanel", MainPanel])
        for (let key in element_obj) {
            if (key == "0") { continue }
            let index = parseInt(key)
            let element_id = element_enum_label[index];
            let element_count = element_obj[index as keyof typeof element_obj];
            let elementPanel = MainPanel.FindChildTraverse(element_id)!;
            elementPanel.visible = element_count > 0;
            elementPanel.SetDialogVariable("current_count", `${element_count}`);
        }

    })

    return (
        <Panel id="ElementBondContainer" className="container" onload={ElementBondOnload}>
            <ElementSynergy element_type={"fire"} />
            <ElementSynergy element_type={"ice"} />
            <ElementSynergy element_type={"thunder"} />
            <ElementSynergy element_type={"wind"} />
            <ElementSynergy element_type={"light"} />
            <ElementSynergy element_type={"dark"} />
        </Panel>
    )
}