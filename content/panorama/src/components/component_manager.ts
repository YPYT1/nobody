import { SetComponent_BackpackCount } from "./backpack_count/backpack_count";
import { SetServerImagePanel } from "./server_image/server_image";
import { SetStoreItemPanel } from "./store_item/store_item";

GameUI.CustomUIConfig().SetServerImagePanel = SetServerImagePanel;
GameUI.CustomUIConfig().SetComponent_BackpackCount = SetComponent_BackpackCount;
GameUI.CustomUIConfig().SetStoreItemPanel = SetStoreItemPanel;

