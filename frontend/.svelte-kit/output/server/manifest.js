export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.9IwH805s.js",app:"_app/immutable/entry/app.BFTMC9Ry.js",imports:["_app/immutable/entry/start.9IwH805s.js","_app/immutable/chunks/Caenj4jM.js","_app/immutable/chunks/yGL7olir.js","_app/immutable/chunks/2JhTy--B.js","_app/immutable/entry/app.BFTMC9Ry.js","_app/immutable/chunks/yGL7olir.js","_app/immutable/chunks/HPh9KFwc.js","_app/immutable/chunks/HrgeC0Rd.js","_app/immutable/chunks/BnmpjQZA.js","_app/immutable/chunks/2JhTy--B.js","_app/immutable/chunks/Dip7S0V2.js","_app/immutable/chunks/Bz4npG2V.js","_app/immutable/chunks/DyYNTT68.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/","/admin","/confirmation","/register"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
