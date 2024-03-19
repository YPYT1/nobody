import 'utils/index';
import { ActivateModules } from './modules';
import Precache from './utils/precache';

import "./modifier/__init__";
import "./global/__init__";

Object.assign(getfenv(), {
    Activate: () => {
        ActivateModules();
    },
    Precache: Precache,
});
