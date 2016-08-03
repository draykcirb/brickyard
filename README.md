# brickyard3

brickyard3 是一个基于插件式架构的前端代码管理与构建框架工具，是面向产品线开发的代码共享与分化的集成解决方案。

## 简介

此核心库只完成几项核心功能：

* 作为命令行工具，调用用户指定且已安装的子命令。如`brickyard install ****`
* 作为配置收集工具，生成一个运行时配置对象，提供给子命令使用。
* 提供一个函数工具集。

## 使用

1. 用户仓库需要安装**此核心库**以及需要用到的子命令（dev，release...）
```
npm install brickyard3 brickyard-command-dev brickyard-command-release brickyard-command-install -S
```

2. 用户仓库的代码目录解构需要如下安排(类似)

```
├─ bricks (name configurable)
│   ├── brickyard-plugins
│   └── awosome-app
├── config (optional)
│   └── default.js
├── recipes (name configurable)
│   └── awosome-app (program-specific config)
├── by-conf.js (optional)
└── package.json
```

配置可进行多级覆盖，具体优先级如下（从上到下递增）：
```
framework default config
user config (optional)
program config (optional)
command line config (optional)
```

user config 默认是运行目录下 by-conf.js，除非用户指定了 config 参数

bricks(或者其他指定文件夹内)放置插件，recipes(或者其他指定文件夹内)放置目标程序的组装计划。程序由插件组装而成。

插件可以直接是一个`npm package`，或者以`bower`管理依赖的`package`。

组装计划需要是以下格式：
```
module.exports = {
	id: 'awesome-app',
	plugins: [
		'brickyard-plugins',
		'awosome-app'
	]，
	config: {
		...(the same as config)
	}
}
```
如果指定了id，会取代其目录名成为组装计划的名称。

3. 项目开发需按如下步骤：

```shell
# 安装插件依赖
brickyard install awesome-app

# 启动开发流程
brickyard dev awesome-app
```

```
# 启动发布流程, 不需要预先 install
brickyard release awesome-app
```

4. 项目生成文件目录结构
```
├── dist
│   ├── build-awesome-app
│   │   └── bower_components
│   └── release-wcg
│       ├── bower_components
│       └── www
```
`www`目录里面就是可打包的发布目录

> Note: 由于开发模式下使用的是内存文件系统，并不会生成目标文件，所以`build-***`目录下只有安装的`bower packages`

## 详细设计

参见 [设计文档](./basement/design.md)
