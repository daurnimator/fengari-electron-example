local js = require "js"
local electron = require "electron"

electron.app:on("ready", function()
	local win = js.new(electron.BrowserWindow)
	win:loadURL("https://fengari.io")
end)
