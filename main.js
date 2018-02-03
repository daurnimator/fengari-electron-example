"use strict";

const path = require("path");

const {
	FENGARI_COPYRIGHT,
	to_luastring,
	lua: {
		LUA_ERRSYNTAX,
		LUA_OK,
		LUA_REGISTRYINDEX,
		lua_pcall,
		lua_pop,
		lua_pushstring,
		lua_setfield,
		lua_setglobal,
		lua_tojsstring
	},
	lauxlib: {
		LUA_LOADED_TABLE,
		luaL_checkstack,
		luaL_getsubtable,
		luaL_loadfile,
		luaL_newstate,
		luaL_requiref
	},
	lualib: {
		luaL_openlibs
	}
} = require('fengari');
const {
	luaopen_js,
	push,
	tojs
} = require('fengari-interop');

const L = luaL_newstate();

/* open standard libraries */
luaL_openlibs(L);
/* js lib */
luaL_requiref(L, to_luastring("js"), luaopen_js, 0);
lua_pop(L, 1); /* remove lib */
/* register electron lib */
luaL_getsubtable(L, LUA_REGISTRYINDEX, LUA_LOADED_TABLE);
push(L, require("electron"));
lua_setfield(L, -2, to_luastring("electron"));  /* LOADED[modname] = module */
lua_pop(L, 1); /* remove LOADED */

lua_pushstring(L, to_luastring(FENGARI_COPYRIGHT));
lua_setglobal(L, to_luastring("_COPYRIGHT"));

let ok = luaL_loadfile(L, to_luastring(path.join(__dirname, "main.lua")));
if (ok === LUA_ERRSYNTAX) {
	throw new SyntaxError(lua_tojsstring(L, -1));
}
if (ok === LUA_OK) {
	/* Push process.argv[2:] */
	luaL_checkstack(L, process.argv.length-2, null);
	for (let i=2; i<process.argv.length; i++) {
		push(L, process.argv[i]);
	}
	ok = lua_pcall(L, process.argv.length-2, 0, 0);
}
if (ok !== LUA_OK) {
	let e = tojs(L, -1);
	lua_pop(L, 1);
	throw e;
}
