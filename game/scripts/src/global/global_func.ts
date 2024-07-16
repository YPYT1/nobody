/** @noSelfInFile */
/**
 * 获取一个角度范围的弹道发射集合
 * @param VectorLen 发射中心点
 * @param num 数量
 * @param angle 角度
 * @param initialspeed 初始速度 
 * @param changespeed 每个弹道增加速度 可以为负数
 * @param type 在有changespeed情况下 类型 1:扇形 | 2 中间散开
 * @param doublenum  双倍数量是否以中间攻击
 * @returns 
 */
function GetAngleByNA(
    VectorLen: Vector,
    num: number = 7,
    angle: number = 60,
    initialspeed: number = 1000,
    changespeed: number = 0,
    type: number = 1,
    doublenum: boolean = false,
) {
    let Cangle = GetAngleByPosOfX(VectorLen);
    let Vectors: Vector[] = [];
    if (num == 1) {
        VectorLen.z = 0;
        VectorLen = VectorLen.Normalized();
        if (initialspeed == 0) {
            return [VectorLen];
        }
        return [VectorLen * initialspeed as Vector];
    }
    let i = angle / (num - 1);
    let Cangle_min = 0;
    let Patterns: number[] = [];
    if (changespeed != 0) {
        Patterns = GetPattern(num, initialspeed, changespeed, type);
    }
    if ((Cangle - angle / 2) < 0) {
        Cangle_min = ((Cangle - angle / 2)) + 360;
    } else {
        Cangle_min = ((Cangle - angle / 2));
    }
    for (let index = 0; index < num; index++) {
        let angles = 0;
        if (doublenum && (num % 2 == 0)) {
            if ((Cangle_min + i * (index + 0.5)) >= 360) {
                angles = (Cangle_min + i * (index + 0.5)) - 360;
            } else {
                angles = Cangle_min + i * (index + 0.5);
            }
        } else {
            if ((Cangle_min + i * index) >= 360) {
                angles = (Cangle_min + i * index) - 360;
            } else {
                angles = Cangle_min + i * index;
            }
        }

        let newVector = Vector();
        if (changespeed == 0) {
            newVector.x = math.cos((angles / 180 * math.pi)) * initialspeed;
            newVector.y = math.sin((angles / 180 * math.pi)) * initialspeed;
        } else {
            newVector.x = math.cos((angles / 180 * math.pi)) * Patterns[index];
            newVector.y = math.sin((angles / 180 * math.pi)) * Patterns[index];
        }
        newVector.z = 0;
        Vectors.push(newVector);
    }
    return Vectors;
}
/**
 * 获取一个角度范围的弹道发射集合(官方方法)
 * @param StartVector 起点 
 * @param DesVector 终点 
 * @param num 数量
 * @param angle 角度
 * @param changespeed 每个弹道增加速度 可以为负数
 * @param type 在有changespeed情况下 类型 1:扇形 | 2 中间散开
 * @returns 
 */
function GetAngleByGF(
    StartVector: Vector,
    DesVector: Vector,
    num: number = 7,
    angle: number = 60,
    changespeed: number = 0,
    type: number = 1
) {
    let VectorLen = (DesVector - StartVector) as Vector;
    let initialspeed = VectorLen.Length2D();
    let Cangle = GetAngleByPosOfX(VectorLen);
    let Vectors: Vector[] = [];
    if (num == 1) {
        VectorLen.z = 0;
        VectorLen = VectorLen.Normalized();
        if (initialspeed == 0) {
            return [VectorLen];
        }
        return [VectorLen * initialspeed as Vector];
    }
    let i = angle / (num - 1);
    let Cangle_min = 0;
    let Patterns: number[] = [];
    if (changespeed != 0) {
        Patterns = GetPattern(num, initialspeed, changespeed, type);
    }
    if ((Cangle - angle / 2) < 0) {
        Cangle_min = ((Cangle - angle / 2)) + 360;
    } else {
        Cangle_min = ((Cangle - angle / 2));
    }
    for (let index = 0; index < num; index++) {
        let angles = 0;
        if ((Cangle_min + i * index) >= 360) {
            angles = (Cangle_min + i * index) - 360;
        } else {
            angles = Cangle_min + i * index;
        }
        let newVector = Vector();
        if (changespeed == 0) {
            newVector = RotatePosition(StartVector, QAngle(0, angles, 0), DesVector);
        } else {
            newVector = RotatePosition(StartVector, QAngle(0, angles, 0), DesVector);
            newVector.x = newVector.x / initialspeed * Patterns[index];
            newVector.y = newVector.y / initialspeed * Patterns[index];
        }
        newVector.z = 0;
        Vectors.push(newVector);
    }
    return Vectors;
}
/**
 * 获得一个速度倍率集合
 * @param num 
 * @param initialspeed 
 * @param changespeed 
 * @param type type 类型 1: 左快右慢 | 2 中间快两边慢
 * @returns 
 */
function GetPattern(num: number, initialspeed: number, changespeed: number, type: number = 1) {
    //普通类型
    let Patterns = [];
    let speed = initialspeed;
    for (let index = 0; index < num; index++) {
        if (type == 1) {
            Patterns.push(initialspeed + index * changespeed);
        } else {
            if (index < num / 2) {
                speed += changespeed;
            } else {
                speed -= changespeed;
            }
            Patterns.push(speed);
        }
    }
    return Patterns;
}

/**
 * 获取当前坐标与X轴的夹角
 * @param v1 
 * @returns 
 */
function GetAngleByPosOfX(v1: Vector) {
    let m = math.atan2(v1.y, v1.x) * 180 / math.pi;
    if (m < 0) {
        m += 360;
    }
    return m;
}

/** 两点求夹角 */
function GetAngleByPos(v1: Vector, v2: Vector) {
    let p = {
        x: v2.x - v1.x,
        y: v2.y - v1.y
    };
    return math.atan2(p.y, p.x) * 180 / math.pi;
}

/** 获得两点方向 */
function GetVectDirection(vect1: Vector, vect2: Vector) {
    let dir = (vect1 - vect2) as Vector;
    dir.z = 0;
    dir = dir.Normalized();
    return dir;
}

/** 判断是否为无效值 [true:表示无效] */
function IsValid(h: any) {
    return h != null && h.IsNull();
}

/**
 * 范围内多个随机整数数方法
 * @param min 最小值
 * @param max 最大值
 * @param num 获取几个数字
 * @returns number[] 数字数组
 */
function ScopeRandomNumber(min: number, max: number, num: number = 2): number[] {
    if (min >= max) {
        return [-1];
    }
    if (max - min < num) {
        return [-1];
    }
    let i = 0;
    let hashSet: { [n: string]: number; } = {};
    while (i < num) {
        let rand_int = RandomInt(min, max);
        let key = tostring(rand_int);
        if (hashSet.hasOwnProperty(key) == false) {
            hashSet[key] = rand_int;
            i++;
        }
    }
    return Object.values(hashSet);
}

function StringToNumberList(str: string): number[] {
    let strlist = str.split(" ");
    let numlist: number[] = [];
    for (let value of strlist) {
        numlist.push(tonumber(value));
    }
    return numlist;
}

/**
 * 获取数组中的概率 的下标 
 * @param number_list 
 * @returns 
 */
function GetCommonProbability(number_list: number[]) {
    let prob = 0;
    let max_num = 0;
    for (let num of number_list) {
        max_num += num;
    }
    let rand_factor = RandomInt(1, max_num);
    let level = 0;
    for (let num of number_list) {
        prob += num;
        if (rand_factor <= prob) {
            return level;
        }
        level++;
    }
    return level;
}




/**
 * 
 * @param hItem 
 * @param hUnit 
 * @param Drop 直接掉落？
 * @returns 
 */
function AddItemToUnit(hItem: CDOTA_Item, hUnit: CDOTA_BaseNPC, Drop: boolean = false): void {
    // if (Drop == null) {
    //     Drop = true;
    // }
    hItem.SetPurchaser(hUnit);
    let ItemCount = 0;
    for (let i = 0; i < 9; i++) {
        if (hUnit.GetItemInSlot(i)) {
            ItemCount += 1;
        }
    }
    if (ItemCount < 9 && hUnit.HasInventory() && !Drop) {
        hUnit.AddItem(hItem);
        return;
    } else {
        // have same
        // print(hItem.IsStackable())
        if (hItem.IsStackable() && hUnit.HasInventory()) {
            let itemName = hItem.GetAbilityName();
            let SlotItem = hUnit.FindItemInInventory(itemName);
            if (SlotItem) {
                SlotItem.SetCurrentCharges(SlotItem.GetCurrentCharges() + 1);
                hItem.RemoveSelf();
                return;
            }
        }
        let DropPosition = hUnit.GetAbsOrigin();
        DropPosition.x = DropPosition.x + RandomFloat(-100, 100);
        DropPosition.y = DropPosition.y + RandomFloat(-100, 100);
        let drop = CreateItemOnPositionSync(DropPosition, hItem);
        drop.SetContainedItem(hItem);
        hItem.LaunchLoot(false, 200, 0.5, DropPosition, null);
        return;
    }
}

/**
 * 深拷贝一份object或者array
 * @param number_list 
 * @returns 
 */
function CustomDeepCopy(obj: Object) {
    return JSON.decode(JSON.encode(obj));
}


function splitStrToList2(text: string, split: string[]) {
    let res: string[][] = [];
    if (split.length > 0) {
        let text_1 = text.split(split[0]);
        if (split.length > 1) {
            let new_split = split.splice(0, 1);
            for (let t of text_1) {
                let text_2 = t.split(split[0]);
                res.push(text_2);
            }
        } else {
            res.push(text_1);
        }
    }
    return res;
}

function GetRandomMoveVect(start_vect: Vector, distance: number) {
    let count = 0;
    while (count < 20) {
        let rand_qz = RandomInt(0, 360);
        let line_point = start_vect + Vector(0, distance, 0) as Vector;
        let next_point = RotatePosition(start_vect, QAngle(0, rand_qz, 0), line_point);
        let bCanFind = GridNav.CanFindPath(start_vect, next_point);
        if (bCanFind) {
            return next_point;
        }
        count++;
    }
    return start_vect;
}

/**
 * 查找对应地图里面的实体列表 [比较耗资源]
 * @param szEntityName 实体名
 * @param MapGroupHandle 地图handle
 * @returns 
 */
function FindAllEntitiesInRoomByName(szEntityName: string, MapGroupHandle: SpawnGroupHandle) {
    let hEntityList = Entities.FindAllByName(szEntityName);
    for (let i = 0; i < hEntityList.length; i++) {
        if (hEntityList[i].GetSpawnGroupHandle() != MapGroupHandle) {
            table.remove(hEntityList, i + 1);
        }
    }
    return hEntityList;
}


function UnitIsSlowed(hUnit: CDOTA_BaseNPC) {
    let base_movespeed = hUnit.GetBaseMoveSpeed();
    return hUnit.GetMoveSpeedModifier(base_movespeed, false) - base_movespeed < 0;
}

/** 获取单位身上相同物品的个数 */
function GetInventoryNameCount(hUnit: CDOTA_BaseNPC, item_name: string) {
    let count = 0;
    for (let i = 0; i < 6; i++) {
        let hItem = hUnit.GetItemInSlot(i);
        if (hItem && hItem.GetAbilityName() == item_name) {
            count += 1;
        }
    }
    return count;
}

/**
 * 打乱数组
 * @param arr 
 */
function ArrayScramblingByString(arr: string[]): void {
    let key_length = arr.length;
    for (let k_i = 0; k_i < key_length; k_i++) {
        let JH_i = RandomInt(0, key_length - 1);
        if (JH_i != k_i) {
            let re_key_v = arr[JH_i];
            arr[JH_i] = arr[k_i];
            arr[k_i] = re_key_v;
        }
    }
}
/**
 * 打乱数组
 * @param arr 
 */
function ArrayScramblingByNumber(arr: number[]): void {
    let key_length = arr.length;
    for (let k_i = 0; k_i < key_length; k_i++) {
        let JH_i = RandomInt(0, key_length - 1);
        if (JH_i != k_i) {
            let re_key_v = arr[JH_i];
            arr[JH_i] = arr[k_i];
            arr[k_i] = re_key_v;
        }
    }
}

function GetClosestPoint(hUnit: CDOTA_BaseNPC, target_vect: Vector, max_dis: number) {
    let start_point = hUnit.GetOrigin();
    let curr_dis = (start_point - target_vect as Vector).Length2D();
    let distance = Math.min(max_dis, curr_dis);
    let direction = (target_vect - start_point as Vector).Normalized();
    let end_point = start_point + direction * distance as Vector;
    let bFindPath = GridNav.CanFindPath(start_point, end_point);
    if (bFindPath) {
        return end_point;
    }
    // print("bFindPath",bFindPath)
    let vPos = start_point + direction * distance as Vector;

    while (bFindPath == false && distance > 50) {
        distance -= 24;
        vPos = start_point + direction * distance as Vector;
        bFindPath = GridNav.CanFindPath(start_point, vPos);
        // print("bFindPath",bFindPath)
    }

    if (bFindPath == false) {
        return start_point;
    } else {
        return vPos;
    }
}

function GetCustomSystemTime() {
    let date_arr = GetSystemDate().split("/");
    let time_arr = GetSystemTime().split(":");

    // DeepPrintTable(date_arr)
    // DeepPrintTable(time_arr)
    return {
        yy: tonumber("20" + date_arr[2]),
        mm: tonumber(date_arr[0]),
        dd: tonumber(date_arr[1]),
        h: tonumber(time_arr[0]),
        m: tonumber(time_arr[1]),
        s: tonumber(time_arr[2]),
    };
}

/**
 * 获取玩家数量
 */
function GetPlayerCount(): number {
    return PlayerResource.GetPlayerCountForTeam(DotaTeam.GOODGUYS)
}

function PrecacheResourceList(resourceList: string[], context: CScriptPrecacheContext) {
    print("PrecacheResourceList", IsServer())
    resourceList.forEach(resource => {
        _precacheResString(resource, context);
    });
}

function _precacheResString(res: string, context: CScriptPrecacheContext) {
    if (res.endsWith('.vpcf')) {
        PrecacheResource('particle', res, context);
    } else if (res.endsWith('.vsndevts')) {
        PrecacheResource('soundfile', res, context);
    } else if (res.endsWith('.vmdl')) {
        PrecacheResource('model', res, context);
    }
}