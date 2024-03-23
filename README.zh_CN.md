# @tomjs/joker

[![npm](https://img.shields.io/npm/v/@tomjs/joker)](https://www.npmjs.com/package/@tomjs/joker) ![node-current (scoped)](https://img.shields.io/node/v/@tomjs/joker) ![NPM](https://img.shields.io/npm/l/@tomjs/joker)

[English](./README.md) | **中文**

> 🤡 为了支持一些不太好的开发习惯，不推荐使用。

## 特性

- `joker cjs` 让 `Pure ESM packages` 同时支持 `cjs` 和 `esm`;

## 安装

```bash
# pnpm
pnpm add @tomjs/joker -D

# yarn
yarn add @tomjs/joker -D

# npm
npm add @tomjs/joker -D
```

## 使用

```bash
joker -h

joker/0.0.0

Usage:
  $ joker <command> [options]

🤡 In order to support some bad development habits, its use is not recommended.

Commands:
  cjs [...workspaces]  Let "Pure ESM packages" support both "cjs" and "esm"

For more info, run any command with the `--help` flag:
  $ joker cjs --help

Options:
  -h, --help     Display this message
  -v, --version  Display version number
```
