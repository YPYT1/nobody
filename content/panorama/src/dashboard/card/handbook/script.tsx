import { LoadCustomComponent } from '../../_components/component_manager';

const MainPanel = $.GetContextPanel();
const CardRarityDropDown = $('#CardRarityDropDown') as DropDown;
const CardSearchInput = $('#CardSearchInput') as TextEntry;
const CardList = $('#CardList');
const ComposeList = $('#ComposeList');

const ButtonComposeMode1 = $('#ButtonComposeMode1') as Button;
const ButtonComposeMode2 = $('#ButtonComposeMode2') as Button;

/** 每行合成卡片上限 */
const ROW_CARD_LIMIT = 3;
/** 最多可一次合成多少行的卡片 */
const MAX_COMPOSE_LIMIT = 8;
let card_compose_list: string[][] = [];

const RarityOptionList = ['all', 'ss', 's', 'a', 'b', 'c'];

// 快捷方法
// const GetServerItemData = GameUI.CustomUIConfig().GetServerItemData;
const GetPictureCardData = GameUI.CustomUIConfig().GetPictureCardData;
const _PictuerCardData = GameUI.CustomUIConfig().KvData.PictuerCardData;
const GetTextureSrc = GameUI.CustomUIConfig().GetTextureSrc;

// pictuer_card_data

const OncClickAdd = $('#OncClickAdd') as Button;

/** 特殊卡片ID列表 */
let special_card_list: string[] = [];

export const Init = () => {
    const max_cards = Object.keys(_PictuerCardData).length;
    MainPanel.SetDialogVariableInt('card_count', 0);
    MainPanel.SetDialogVariableInt('card_max', max_cards);
    MainPanel.SetDialogVariableInt('compose_cost', 0);

    InitComposeButton();
    InitComposeViews();
    InitCardList();
    InitCardRarityDropDown();
    CustomEventSubscribe();
};

const card_rarity = {
    All: 99,
    SS: 6,
    S: 5,
    A: 4,
    B: 3,
    C: 2,
};

let fliter_ratity = 99;
let fliter_text = '';

const InitCardRarityDropDown = () => {
    // CardRarityDropDown.RemoveAllOptions();

    for (const key in card_rarity) {
        const rarity = card_rarity[key as keyof typeof card_rarity];
        if (!CardRarityDropDown.HasOption(`${rarity}`)) {
            const optionLabel = $.CreatePanel('Label', CardRarityDropDown, `${rarity}`, {
                text: key,
                html: true,
            });
            CardRarityDropDown.AddOption(optionLabel);
        }
    }

    $.Schedule(0.01, () => {
        CardRarityDropDown.SetSelectedIndex(0);
        CardRarityDropDown.SetPanelEvent('oninputsubmit', () => {
            const id = CardRarityDropDown.GetSelected().id;
            // $.Msg(SelectedPanel.Data())
            fliter_ratity = parseInt(id);
            FliterCardList();
        });
    });

    CardSearchInput.SetPanelEvent('ontextentrychange', () => {
        fliter_text = CardSearchInput.text;
        FliterCardList();
    });
};

const FliterCardList = () => {
    for (let i = 0; i < CardList.GetChildCount(); i++) {
        const CardPanel = CardList.GetChild(i)!;
        const loc_rarity = CardPanel.Data<PanelDataObject>().rarity as number;
        const loc_name = CardPanel.Data<PanelDataObject>().name as string;
        const text_res = loc_name.search(fliter_text);
        const Show = (fliter_ratity == 99 || loc_rarity == fliter_ratity) && (fliter_text.length == 0 || text_res != -1);
        CardPanel.visible = Show;
    }
};

const InitComposeViews = () => {
    ComposeList.RemoveAndDeleteChildren();
    card_compose_list = [[], [], [], [], [], [], [], []];

    for (let i = 0; i < MAX_COMPOSE_LIMIT; i++) {
        const ComposePanel = $.CreatePanel('Panel', ComposeList, 'row_' + i);
        ComposePanel.BLoadLayoutSnippet('CardCompose');

        const SourceList = ComposePanel.FindChildTraverse('SourceList')!;
        for (let j = 0; j < SourceList.GetChildCount(); j++) {
            const row_source = SourceList.GetChild(j)!;
            row_source.SetHasClass('has_item', false);
            row_source.SetPanelEvent('onactivate', () => {
                RemoveComposeCard(row_source, i, j);
            });
        }
    }
};

const RemoveComposeCard = (row_source: Panel, i: number, j: number) => {
    const card_id = row_source.Data<PanelDataObject>().card_id as string;
    if (card_id == null) {
        return;
    }
    row_source.Data<PanelDataObject>().card_id = null;
    const compose_xy = [i, j];
    card_compose_list[i].splice(j, 1);
    row_source.SetHasClass('has_item', false);
    for (let r = 1; r <= 6; r++) {
        row_source.RemoveClass('rare_' + r);
    }
    // $.Msg(["card_id",card_id])
    const CardPanel = CardList.FindChildTraverse(`${card_id}`)!;
    const card_data = _PictuerCardData[card_id as keyof typeof _PictuerCardData];
    const rarity = card_data.rarity;
    rarity_card_list[rarity - 1][card_id] += 1;
    // CardPanel.Data<PanelDataObject>().count -= 1;
    CardPanel.SetDialogVariableInt('count', rarity_card_list[rarity - 1][card_id]);

    // let count = CardPanel.Data<PanelDataObject>().count;

    // CardPanel.Data<PanelDataObject>().count += 1;
    // CardPanel.SetDialogVariableInt("count", CardPanel.Data<PanelDataObject>().count);
    UpdateComposeInfo();
};
const InitComposeButton = () => {
    ButtonComposeMode1.enabled = false;
    ButtonComposeMode2.enabled = false;
    ButtonComposeMode1.SetPanelEvent('onactivate', () => {
        ButtonComposeMode1.enabled = false;
        SendCompoundCard(0);
    });

    ButtonComposeMode2.SetPanelEvent('onactivate', () => {
        ButtonComposeMode2.enabled = false;
        SendCompoundCard(1);
    });
};

const SendCompoundCard = (state: number = 1) => {
    const list: string[][] = [];
    for (const row of card_compose_list) {
        if (row.length == ROW_CARD_LIMIT) {
            list.push(row);
        }
    }
    GameEvents.SendCustomGameEventToServer('ServiceInterface', {
        event_name: 'CompoundCard',
        params: {
            list: list,
            type: state,
        },
    });
};

let rarity_card_list: { [card_id: string]: number }[] = [];

const GetPlayerCardList = (params: NetworkedData<CustomGameEventDeclarations['ServiceInterface_GetPlayerCardList']>) => {
    // $.Msg(["Card ServiceInterface_GetPlayerCardList"])
    const data = params.data;
    const card = data.card;
    // 清空合成表
    card_compose_list = [[], [], [], [], [], [], [], []];
    UpdateComposeInfo();
    const card_list = Object.values(data.card);
    // $.Msg(["card_list",card_list])
    MainPanel.SetDialogVariableInt('card_count', card_list.length);
    card_list.sort((a, b) => {
        const data_a = GetPictureCardData(`${a.item_id}`);
        const data_b = GetPictureCardData(`${b.item_id}`);
        if (data_a == null || data_b == null) {
            return -1;
        }
        // $.Msg(["data_a",a.item_id,data_a])
        return (data_a.rarity ?? 1) - (data_b.rarity ?? 1);
    });
    for (let i = 0; i < CardList.GetChildCount(); i++) {
        const CardPanel = CardList.GetChild(i)!;
        CardPanel.SetDialogVariableInt('count', 0);
    }
    // 更新已登记的图鉴
    const pictuer_list = data.pictuer_list;
    const picture_card_list: string[] = [];
    // const CardPanel = CardList.FindChildTraverse("3201")
    for (const pic_id in pictuer_list) {
        const sub_card_list = Object.values(pictuer_list[pic_id]);
        for (const card_id of sub_card_list) {
            const panel1 = CardList.FindChildTraverse(`${card_id}`) as Component_CardItem;
            panel1.Data<PanelDataObject>().has = 1;
            panel1.ShowCardIcon(true);
        }
    }

    // 卡片按质量分配
    rarity_card_list = [{}, {}, {}, {}, {}, {}, {}];
    for (const card of card_list) {
        const item_id = card.item_id;
        const card_id = `${item_id}`;
        const card_data = _PictuerCardData[card_id as keyof typeof _PictuerCardData];
        if (card_data == null) {
            continue;
        }
        // $.Msg(["card_data",card_id,card_data])

        const card_rare = card_data.rarity;
        const card_count = card.number;

        rarity_card_list[card_rare - 1][card_id] = card_count;
        const CardPanel = CardList.FindChildTraverse(card_id) as Component_CardItem;
        if (CardPanel == null) {
            continue;
        }
        CardPanel.ShowCardIcon(true);
        CardPanel.SetDialogVariableInt('count', card.number);
        CardPanel.Data<PanelDataObject>().count = card.number;
        CardPanel.Data<PanelDataObject>().has = 1;

        CardPanel.SetPanelEvent('onactivate', () => {
            // 当前卡片数量
            AddCompositeCard(card_id);
            // 更新
            UpdateComposeInfo();
        });
    }

    // 排序
    const card_list_count = CardList.GetChildCount();
    for (let i = 0; i < card_list_count; i++) {
        for (let j = 0; j < card_list_count - 1 - i; j++) {
            const panel1 = CardList.GetChild(j) as Component_CardItem;
            const panel2 = CardList.GetChild(j + 1) as Component_CardItem;
            // if (panel1.Data<PanelDataObject>().has < panel2.Data<PanelDataObject>().has) {
            //     CardList.MoveChildBefore(panel2, panel1);
            // }

            if (panel1.Data<PanelDataObject>().rare < panel2.Data<PanelDataObject>().rare) {
                CardList.MoveChildBefore(panel2, panel1);
            }
        }
    }

    for (let i = 0; i < card_list_count; i++) {
        for (let j = 0; j < card_list_count - 1 - i; j++) {
            const panel1 = CardList.GetChild(j) as Component_CardItem;
            const panel2 = CardList.GetChild(j + 1) as Component_CardItem;
            if (panel1.Data<PanelDataObject>().has < panel2.Data<PanelDataObject>().has) {
                CardList.MoveChildBefore(panel2, panel1);
            }

            // if (panel1.Data<PanelDataObject>().rare < panel2.Data<PanelDataObject>().rare) {
            //     CardList.MoveChildBefore(panel2, panel1);
            // }
        }
    }

    GameUI.CustomUIConfig().EventBus.publish('popup_loading', { show: false });
};

const AddCompositeCard = (card_id: string) => {
    const card_data = _PictuerCardData[card_id as keyof typeof _PictuerCardData];
    if (card_data == null) {
        return;
    }
    const rarity = card_data.rarity;
    const count = rarity_card_list[rarity - 1][card_id] ?? 0;
    if (count <= 0) {
        return;
    }
    // $.Msg(["count", count])
    const CardPanel = CardList.FindChildTraverse(card_id) as Component_CardItem;
    // if (CardPanel.Data<PanelDataObject>().count <= 0) {
    //     // 无多余卡片
    //     return
    // }
    // const l_rare = CardPanel.Data<PanelDataObject>().rarity as number;
    // const l_card_id = CardPanel.Data<PanelDataObject>().card_id as string;
    // 同行为同品质
    const index = 0;
    for (let i = 0; i < MAX_COMPOSE_LIMIT; i++) {
        const row_compose = card_compose_list[i];
        // $.Msg(["I", i, row_compose])
        if (row_compose.length < ROW_CARD_LIMIT) {
            // 当前卡片品质
            if (row_compose.length == 0) {
                rarity_card_list[rarity - 1][card_id] -= 1;
                // CardPanel.Data<PanelDataObject>().count -= 1;
                CardPanel.SetDialogVariableInt('count', rarity_card_list[rarity - 1][card_id]);
                card_compose_list[i] = [card_id];
                break;
            } else {
                //
                const f_id = row_compose[0];
                const f_data = GetPictureCardData(`${f_id}`);
                const f_rare = f_data.rarity;
                if (f_rare == rarity) {
                    rarity_card_list[rarity - 1][card_id] -= 1;
                    // CardPanel.Data<PanelDataObject>().count -= 1;
                    CardPanel.SetDialogVariableInt('count', rarity_card_list[rarity - 1][card_id]);
                    // CardPanel.SetDialogVariableInt("count", CardPanel.Data<PanelDataObject>().count);
                    row_compose.push(card_id);
                    break;
                } else {
                    continue;
                }
            }
        }
    }
};
const UpdateComposeInfo = () => {
    // $.Msg(["card_compose_list", card_compose_list.length])
    // $.Msg(card_compose_list)

    for (let i = 0; i < MAX_COMPOSE_LIMIT; i++) {
        const row_compose_panel = ComposeList.GetChild(i)!;
        const SourceList = row_compose_panel.FindChildTraverse('SourceList')!;
        const row_compose = card_compose_list[i];
        for (let j = 0; j < SourceList.GetChildCount(); j++) {
            const row_source = SourceList.GetChild(j) as ImagePanel;
            for (let r = 1; r <= 6; r++) {
                row_source.RemoveClass('rare_' + r);
                row_source.SetHasClass('has_item', false);
            }
            row_source.SetImage('');
        }
        if (row_compose == null) {
            continue;
        }

        for (let j = 0; j < row_compose.length; j++) {
            const row_source = SourceList.GetChild(j) as ImagePanel;
            const card_id = row_compose[j];
            SetComposeItemInfo(row_source, card_id);
        }
    }

    ButtonComposeMode1.enabled = false;
    ButtonComposeMode2.enabled = false;
    for (const row_list of card_compose_list) {
        if (row_list.length >= ROW_CARD_LIMIT) {
            ButtonComposeMode1.enabled = true;
            ButtonComposeMode2.enabled = true;
            break;
        }
    }
};

const SetComposeItemInfo = (e: ImagePanel, card_id: string) => {
    const data = GetPictureCardData(`${card_id}`);
    for (let r = 1; r <= 6; r++) {
        e.SetHasClass('rare_' + r, data.rarity == r);
    }
    e.Data<PanelDataObject>().card_id = card_id;
    e.SetDialogVariable('card_id', `${card_id}`);
    e.SetHasClass('has_item', true);

    const card_data = GetPictureCardData(card_id);

    e.SetImage(GetTextureSrc(card_data.AbilityTextureName));
};

const CustomEventSubscribe = () => {};

const InitCardList = () => {
    special_card_list = [];

    const CardListData = Object.values(_PictuerCardData);
    CardListData.sort((a, b) => {
        return b.rarity - a.rarity;
    });
    CardList.RemoveAndDeleteChildren();

    const temp_special_cards: { [speid: string]: any } = {};
    for (const card_data of CardListData) {
        const card_id = `${card_data.item_id}`;
        const _CardPanel = $.CreatePanel('Panel', CardList, `${card_id}`);
        const CardPanel = LoadCustomComponent(_CardPanel, 'card_item');
        CardPanel.SetCardItem(card_id, true, true);
        CardPanel.SetDialogVariableInt('count', 0);
        CardPanel.Data<PanelDataObject>().count = 0;
        CardPanel.Data<PanelDataObject>().rare = card_data.rarity;
        CardPanel.Data<PanelDataObject>().name = $.Localize('#custom_server_card_' + card_id);

        const special_compound = card_data.special_compound;
        for (const spe_id of special_compound) {
            if (spe_id == 0) {
                continue;
            }
            if (temp_special_cards[`${spe_id}`] == null) {
                temp_special_cards[`${spe_id}`] = {};
            }
        }
    }
    special_card_list = Object.keys(temp_special_cards);

    /**
     * 添加逻辑：添加顺序为C->B->A->S，即优先添加进去C级绿色的，
     * 添加完之后，再添加B级蓝色的，添加完之后，再添加A级紫色的依次类推。
     * 如果C级的卡片数量不能被3整除，就只添加能被3整除的部分，不被3整除的部分保留在左侧展示栏
     */
    OncClickAdd.SetPanelEvent('onactivate', () => {
        // $.Msg(["OncClickAdd"])
        // $.Msg(special_card_list)
        // $.Msg(card_compose_list)
        for (const row_data of card_compose_list) {
            // $.Msg([" ========== RowAction ================"])
            // $.Msg(row_data)
            const row_len = row_data.length;
            if (row_len >= ROW_CARD_LIMIT) {
                // $.Msg(["IsMax"])
                continue;
            } else if (row_len == 0) {
                // $.Msg(["NewAdd"])
                let add_state = false;
                let rare = 0;
                for (const rare_list of rarity_card_list) {
                    // 当前品质非特殊且包含3张以上
                    let valid_count = 0;
                    for (const _id in rare_list) {
                        const count = rare_list[_id];
                        if (count > 0 && special_card_list.indexOf(_id) == -1) {
                            valid_count += count;
                        }
                    }

                    // $.Msg(["rare", rare, "valid_count", valid_count])
                    rare += 1;
                    if (valid_count >= 3) {
                        for (let i = 0; i < ROW_CARD_LIMIT; i++) {
                            for (const _id in rare_list) {
                                const count = rare_list[_id];
                                if (count > 0 && special_card_list.indexOf(_id) == -1) {
                                    AddCompositeCard(_id);
                                    break;
                                }
                            }
                        }

                        add_state = true;
                        break;
                    }
                }

                // $.Msg(["add_state", add_state])
                // AddCompositeCard(card_id)
                // 如果为0的情况则直接按照规则填充
            } else {
                // $.Msg(["Buchong"])
                const f_id = row_data[0];
                const f_data = _PictuerCardData[f_id as keyof typeof _PictuerCardData];
                const f_rare = f_data.rarity;
                // 如果有则按照当前品质填充;
                const rare_list = rarity_card_list[f_rare - 1];
                for (let i = row_len; i < ROW_CARD_LIMIT; i++) {
                    for (const _id in rare_list) {
                        const count = rare_list[_id];
                        if (count > 0 && special_card_list.indexOf(_id) == -1) {
                            AddCompositeCard(_id);
                        }
                    }
                }
            }
        }
        // for (let rare_list of rarity_card_list) {
        //     $.Msg(rare_list)
        // }
        UpdateComposeInfo();
    });

    GameEvents.Subscribe('ServiceInterface_GetPlayerCardList', GetPlayerCardList);
    GameEvents.SendCustomGameEventToServer('ServiceInterface', {
        event_name: 'GetPlayerCardList',
        params: {},
    });
};

(() => {
    Init();
})();
