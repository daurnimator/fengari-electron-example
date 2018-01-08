local js = require "js"
local electron = require "electron"

-- Helper to copy lua table to a new JavaScript Object
-- e.g. Object{mykey="myvalue"}
local function Object(t)
	local o = js.new(js.global.Object)
	for k, v in pairs(t) do
		assert(type(k) == "string" or js.typeof(k) == "symbol", "JavaScript only has string and symbol keys")
		o[k] = v
	end
	return o
end

electron.app:on("ready", function()
	local win = js.new(electron.BrowserWindow, Object{
		autoHideMenuBar = true;
	})
	win:loadURL("https://fengari.io")
end)
