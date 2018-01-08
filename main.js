"use strict";

const path = require("path");

const {lua, lauxlib, lualib} = require('fengari');
const interop = require('fengari-interop');

const L = lauxlib.luaL_newstate();

/* open standard libraries */
lualib.luaL_openlibs(L);
/* js lib */
lauxlib.luaL_requiref(L, lua.to_luastring("js"), interop.luaopen_js, 0);
lua.lua_pop(L, 1); /* remove lib */
/* register electron lib */
lauxlib.luaL_getsubtable(L, lua.LUA_REGISTRYINDEX, lauxlib.LUA_LOADED_TABLE);
interop.push(L, require("electron"));
lua.lua_setfield(L, -2, lua.to_luastring("electron"));  /* LOADED[modname] = module */
lua.lua_pop(L, 1); /* remove LOADED */

lua.lua_pushstring(L, lua.to_luastring(lua.FENGARI_COPYRIGHT));
lua.lua_setglobal(L, lua.to_luastring("_COPYRIGHT"));

let ok = lauxlib.luaL_loadfile(L, lua.to_luastring(path.join(__dirname, "main.lua")));
if (ok === lua.LUA_ERRSYNTAX) {
	throw new SyntaxError(lua.lua_tojsstring(L, -1));
}
if (ok === lua.LUA_OK) {
	/* Push process.argv[2:] */
	lauxlib.luaL_checkstack(L, process.argv.length-2, null);
	for (let i=2; i<process.argv.length; i++) {
		interop.push(L, process.argv[i]);
	}
	ok = lua.lua_pcall(L, process.argv.length-2, 0, 0);
}
if (ok !== lua.LUA_OK) {
	let e = interop.tojs(L, -1);
	lua.lua_pop(L, 1);
	throw e;
}
