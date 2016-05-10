module.exports = {

	programStore: './recipes',
	pluginStore: './bricks',
	destPrefix: 'build',

	// path related
	dest: null,
	program: null,

	// server related
	port: 8080,
	host: 'localhost',
	bsProxy: {
		port: 3000,
		host: 'localhost'
	},
	apiProxy: null,
	watch: false,
	livereload: false,
	https: false,

	// others
	hashbit: 7,
	lint: false,
	offline: false,
	registry: null,
	showConfig: false,
	debuggable: false
}
