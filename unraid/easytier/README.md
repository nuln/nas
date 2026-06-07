# unraid-easytier

unRAID 插件 for [EasyTier](https://github.com/EasyTier/Easytier) mesh VPN。

## 安装

unRAID WebUI → Plugins → Install Plugin，输入：

```
https://raw.githubusercontent.com/nuln/nas/master/unraid/easytier/easytier.plg
```

或一键安装脚本（unRAID 终端执行）：

```bash
wget -qO- https://raw.githubusercontent.com/nuln/nas/master/unraid/easytier/install.sh | bash
```

安装后访问 **Settings → EasyTier**。

## 卸载

unRAID WebUI → Plugins → 找到 easytier 点击 Uninstall。

卸载会删除程序文件和页面文件，**保留配置**（`/boot/config/plugins/easytier/`）。
