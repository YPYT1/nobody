import 'utils/index';
import { ActivateModules } from './modules';
import Precache from './utils/precache';

import "./modifier/__init__";
import "./global/__init__";
import "./server/https/https_server_const";
import "./server/https/https_server_api";
import "./extend/__init__";
import { ReloadModules } from './modules/game_event';

Object.assign(getfenv(), {
    Activate: () => {
        ActivateModules();
    },
    Precache: Precache,
});

ReloadModules()