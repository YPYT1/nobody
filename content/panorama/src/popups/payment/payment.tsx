import { QRCode } from "../../_module/qrcode-ts/src/qrcode/QRCode";

const MainPanel = $.GetContextPanel();
const ConfirmButton = $("#ConfirmButton");
const CanvasPanel = $("#CanvasPanel") as UICanvas;

export const Init = () => {
    MainPanel.SetHasClass("Show", true);
    ConfirmButton.SetPanelEvent("onactivate", () => {
        MainPanel.SetHasClass("Show", false);
    })
    CreateQRCode(CanvasPanel, "weixin://wxpay/bizpayurl?pr=hUpfnIcz1", 200)

    // GameUI.CustomUIConfig().EventBus.subscribe("open_store_purchase", event => {

    // })
}


function CreateQRCode(ui_Panel: UICanvas, str_url: string, code_size: number) {
    ui_Panel.ClearJS(`rgba(255,255,255,0)`)
    ui_Panel.RemoveAndDeleteChildren();
    let qrcode = new QRCode(8, 3);
    qrcode.addData(str_url);
    qrcode.make();
    let size = qrcode.getModuleCount();

    const offcount = 2;
    const pix_size = Math.floor(code_size / size);
    // $.Msg(["pix_size",pix_size])
    // for (let row = 0; row < size; ++row) {
    //     for (let col = 0; col < size; ++col) {
    //         const color = qrcode.isDark(row, col) ? "#000000" : "#ffffff";
    //         const offx = row * pix_size;
    //         const offy = col * pix_size;
    //         const points = [
    //             [offx, offy],
    //             [offx + offcount, offy],
    //             [offx + offcount, offy + offcount],
    //             [offx, offy + offcount]
    //         ];
    //         ui_Panel.DrawSoftLinePointsJS(points.length, _flattenArrayOfTuples(points), 10, 100, color)
    //     }
    // }
    for (let row = 0; row < size; ++row) {
        let ui_RowPanel = $.CreatePanel("Panel", ui_Panel, "");
        ui_RowPanel.style.flowChildren = "right";
        for (let col = 0; col < size; ++col) {
            let pix = $.CreatePanel("Panel", ui_RowPanel, "");
            pix.style.width = pix_size + "px";
            pix.style.height = pix_size + "px";
            pix.style.backgroundColor = qrcode.isDark(row, col) ? "#000000" : "#ffffff";
        }
    }

    // //
    // const qrcodeWidth = pix_size * size;
    // return qrcodeWidth;
}

function _flattenArrayOfTuples(arrOfTuples: number[][]) {
    let retVal: number[] = [];
    arrOfTuples.forEach(t => retVal.push(t[0]) && retVal.push(t[1]));
    return retVal;
}
(() => {
    Init()
})();