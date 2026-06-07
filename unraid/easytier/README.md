# unraid-easytier
This is a unRAID plugin for the easytier binary executable

Source: https://github.com/EasyTier/Easytier

### install

https://raw.githubusercontent.com/fejich/unraid-easytier/master/easytier.plg

### use

After install, open unRAID WebUI:

Settings -> EasyTier

From this built-in plugin page you can:

- Start/Stop/Restart service
- Save runtime config (web bind/port, db path, core admin uri)
- Toggle autostart on boot
- View service logs
- Open embedded EasyTier web console

Default config path:

/boot/config/plugins/easytier/easytier.conf

You can still run manually:

```bash
chmod +x /etc/rc.d/rc.easytier
/etc/rc.d/rc.easytier start
```

EasyTier web-console reference:

https://easytier.cn/guide/network/web-console.html
