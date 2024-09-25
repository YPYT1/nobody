
// 预载入KV文件中的所有资源
function precacheEveryResourceInKV(kvFileList: string[], context: CScriptPrecacheContext) {
    kvFileList.forEach(file => {
        const kvTable = LoadKeyValues(file);
        precacheEverythingFromTable(kvTable, context);
    });
}
// 预载入资源列表
function precacheResource(resourceList: string[], context: CScriptPrecacheContext) {
    resourceList.forEach(resource => {
        precacheResString(resource, context);
    });
}
function precacheResString(res: string, context: CScriptPrecacheContext) {
    if (res.endsWith('.vpcf')) {
        PrecacheResource('particle', res, context);
    } else if (res.endsWith('.vsndevts')) {
        PrecacheResource('soundfile', res, context);
    } else if (res.endsWith('.vmdl')) {
        PrecacheResource('model', res, context);
    }
}

// 预载入单位列表
function precacheUnits(unitNamesList: string[], context?: CScriptPrecacheContext) {
    if (context != null) {
        unitNamesList.forEach(unitName => {
            PrecacheUnitByNameSync(unitName, context);
        });
    } else {
        unitNamesList.forEach(unitName => {
            PrecacheUnitByNameAsync(unitName, () => { });
        });
    }
}
// 预载入物品列表
function precacheItems(itemList: string[], context: CScriptPrecacheContext) {
    itemList.forEach(itemName => {
        PrecacheItemByNameSync(itemName, context);
    });
}

// 一个辅助的，从KV表中解析出所有资源并预载入的方法
function precacheEverythingFromTable(kvTable: any, context: CScriptPrecacheContext) {
    for (const [k, v] of pairs(kvTable)) {
        if (type(v) === 'table') {
            precacheEverythingFromTable(v, context);
        } else if (type(v) === 'string') {
            precacheResString(v, context);
        }
    }
}
