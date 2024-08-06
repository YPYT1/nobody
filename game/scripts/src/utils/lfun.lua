if LFUN == nil then
	_G.LFUN = class({})
end

function LFUN:eval(equation, variables)
    if(type(equation) == "string") then
        local eval = loadstring("return "..equation);
        if(type(eval) == "function") then
            setfenv(eval, variables or {});
            return eval();
        end
    end
end
