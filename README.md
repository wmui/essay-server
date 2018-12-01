## Essay server

### 前言

Essay server API 基于 RESTful 标准设计   

### 本地运行

#### 启动数据库

首先安装[MongoDB](https://www.mongodb.com/download-center?jmp=nav#community)数据库和[Node.js](https://nodejs.org/en/)环境

```bash
# yourDBpath 表示你自定义的数据库目录，任意位置皆可
$ sudo mongod --dbpath yourDBpath
```

#### 运行项目

```bash
$ git clone https://github.com/wmui/essay-server.git
$ cd essay-server
$ npm install
$ npm run dev # 浏览器访问 http://127.0.0.1:3001
```

### API 文档



### 开源协议

GPL  