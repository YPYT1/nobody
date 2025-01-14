import { QRCode } from "../../_module/qrcode-ts/src/qrcode/QRCode";
import { GetTextureSrc } from "../../common/custom_kv_method";
import { LoadCustomComponent } from "../../dashboard/_components/component_manager";

const MainPanel = $.GetContextPanel();
const ConfirmButton = $("#ConfirmButton");
const CanvasPanel = $("#CanvasPanel") as UICanvas;
const ServerShopList = GameUI.CustomUIConfig().KvData.server_shop_list;
const StoreIcon = $("#StoreIcon") as ImagePanel;

const CurrencyIcon = LoadCustomComponent($("#CurrencyIcon"), "server_item");
CurrencyIcon._SetServerItemInfo({ hide_bg: true, show_count: false, show_tips: false });
CurrencyIcon._SetItemId("rmb");

const Pay_wx = $("#Pay_wx") as RadioButton;
const Pay_alipay = $("#Pay_alipay") as RadioButton;


let g_goods_id = "";

export const Init = () => {
    // MainPanel.SetHasClass("Show", false);

    ConfirmButton.SetPanelEvent("onactivate", () => {
        CanvasPanel.AddClass("Hide")
        CanvasPanel.RemoveClass("Show")
        Pay_wx.checked = false;
        Pay_alipay.checked = false;
        CanvasPanel.ClearJS(`rgba(255,255,255,0)`)
        MainPanel.SetHasClass("Show", false);
    })
    InitEvents()
}


function CreateQRCode(ui_Panel: UICanvas, str_url: string, code_size: number) {
    ui_Panel.AddClass("Show")
    ui_Panel.RemoveClass("Hide")
    ui_Panel.ClearJS(`rgba(255,255,255,0)`)
    ui_Panel.RemoveAndDeleteChildren();
    let qrcode = new QRCode(8, 3);
    qrcode.addData(str_url);
    qrcode.make();
    let size = qrcode.getModuleCount();
    const pix_size = 6;//Math.floor(code_size / size);
    const offcount = 4;

    // $.Msg(["star",Game.GetGameTime()])

    for (let row = 0; row < size; ++row) {
        for (let col = 0; col < size; ++col) {
            const color = qrcode.isDark(row, col) ? "#000000" : "#ffffff";
            const offx = 4 + row * pix_size;
            const offy = 1 + col * pix_size;
            const points1 = [[offx, offy], [offx, offy + pix_size]];
            ui_Panel.DrawSoftLinePointsJS(points1.length, _flattenArrayOfTuples(points1), 6, 0, color)
        }
    }



    // for (let row = 0; row < size; ++row) {
    //     let ui_RowPanel = $.CreatePanel("Panel", ui_Panel, "");
    //     ui_RowPanel.style.flowChildren = "right";
    //     for (let col = 0; col < size; ++col) {
    //         let pix = $.CreatePanel("Panel", ui_RowPanel, "");
    //         pix.style.width = pix_size + "px";
    //         pix.style.height = pix_size + "px";
    //         pix.style.backgroundColor = qrcode.isDark(row, col) ? "#000000" : "#ffffff";
    //     }
    // }
    // $.Msg(["end",Game.GetGameTime()])
}


function InitEvents() {

    GameUI.CustomUIConfig().EventBus.clear("open_rmb_purchase");
    GameUI.CustomUIConfig().EventBus.subscribe("open_rmb_purchase", event => {
        MainPanel.SetHasClass("Show", true);
        let goods_id = event.id;
        g_goods_id = goods_id;

        let data = ServerShopList[goods_id as keyof typeof ServerShopList];
        let goods_name = $.Localize("#custom_text_goods_" + goods_id);
        let goods_desc = $.Localize("#custom_text_goods_" + goods_id + "_desc").replaceAll("\n", "<br>");
        // $.Msg(["goods_desc",goods_desc])
        MainPanel.SetDialogVariable("goods_name", goods_name)
        MainPanel.SetDialogVariable("goods_desc", goods_desc)

        //@ts-ignore
        let image_src = GetTextureSrc(data.AbilityTextureName ?? "");
        StoreIcon.SetImage(image_src);

        let cost_str = data.cost.split("_")[1]
        MainPanel.SetDialogVariable("currency_cost", cost_str)
        // 这里需要发送到服务器进



    })



    Pay_wx.SetPanelEvent("onselect", () => {
        // $.Msg(["Pay_wx"])
        CreateQRCode(CanvasPanel, "http://www.baidu.com", 250)
    })

    Pay_alipay.SetPanelEvent("onselect", () => {
        // $.Msg(["Pay_alipay"])
        CreateQRCode(CanvasPanel, "http://www.google.com", 250)
    })
}

function _flattenArrayOfTuples(arrOfTuples: number[][]) {
    let retVal: number[] = [];
    arrOfTuples.forEach(t => retVal.push(t[0]) && retVal.push(t[1]));
    return retVal;
}
(() => {
    Init()
})();