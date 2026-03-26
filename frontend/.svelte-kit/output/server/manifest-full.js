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
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/admin",
				pattern: /^\/admin\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/confirmation",
				pattern: /^\/confirmation\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/register",
				pattern: /^\/register\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
