module.exports = {

	programStore: './recipes',
	pluginStore: './bricks',


	// path related
	dest: null,
	program: null,

	// server related
	port: 8080,
	proxyPort: 3000,
	host: 'localhost',
	proxyHost: 'localhost',
	serverAddress: 'localhost',
	watch: false,
	livereload: false,
	https: false,

	// others
	hashbit: 7,
	lint: false,
	offline: false,
	registry: null
}
