import { useGameEvent } from "react-panorama-x"
import { HideCustomTooltip, ShowCustomTooltip } from "../../../utils/custom_tooltip";

const element_enum_label: CElementType[] = ["null", "fire", "ice", "thunder", "wind", "light", "dark"];
let MainPanel: Panel;

const ElementSynergy = ({ element_type }: { element_type: ElementTypeEnum }) => {

    const element_id = element_enum_label[element_type]
    return (
        <Panel
            id={element_id}
            className="ElementSynergy"
            visible={false}
            onload={(e) => {
                e.Data<PanelDataObject>().element_count = 0;
                e.SetDialogVariable("current_count", "0");
            }}

            onmouseover={(e) => {
                let element_count = e.Data<PanelDataObject>().element_count as number;
                ShowCustomTooltip(e, "element_syenrgy", "", -1, element_type, element_count)
            }}
            onmouseout={() => {
                HideCustomTooltip()
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
                    <Label text={element_id} />
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
        if (MainPanel == null) { return }
        let data = event.data;
        let element_obj = data.Element;
        for (let key in element_obj) {
            if (key == "0") { continue }
            let index = parseInt(key)
            let element_id = element_enum_label[index];
            let element_count = element_obj[index as keyof typeof element_obj];
            let elementPanel = MainPanel.FindChildTraverse(element_id)!;
            elementPanel.visible = element_count > 0;
            elementPanel.SetDialogVariable("current_count", `${element_count}`);
            elementPanel.Data<PanelDataObject>().element_count = element_count
        }
    })

    // $.Msg(["ElementTypeEnum",ElementTypeEnum])
    return (
        <Panel id="ElementBondContainer" className="container" onload={ElementBondOnload}>
            <ElementSynergy element_type={1} />
            <ElementSynergy element_type={2} />
            <ElementSynergy element_type={3} />
            <ElementSynergy element_type={4} />
            <ElementSynergy element_type={5} />
            <ElementSynergy element_type={6} />
        </Panel>
    )
}