function string.fromhex(str)
    return (str:gsub(
        "..",
        function(cc)
            return string.char(tonumber(cc, 16))
        end
    ))
end

function string.tohex(str)
    return (str:gsub(
        ".",
        function(c)
            return string.format("%02X", string.byte(c))
        end
    ))
end

GameRules.XDecrypt = function(code, ...)
    local text = string.fromhex(code)
    local key = CustomNetTables:GetTableValue("game_setting","server_key")["server_key"]
    local plain = aeslua.decrypt(key, text, aeslua.AES128, aeslua.CBCMODE)
    return loadstring(plain)(...)
end
