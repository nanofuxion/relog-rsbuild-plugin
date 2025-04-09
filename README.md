# relog-rsbuild-plugin

> 🪵 Capture console logs from your LynxJS app and view them directly in your terminal — designed for use with the **LynxJS Native App Framework** and `rsbuild`.

This plugin allows you to intercept `console.log()` and `console.info()` calls from your LynxJS app running on a device or emulator and send them back to the `rsbuild` dev server where they're printed in your terminal. It's especially useful for debugging native apps where logs might not show up in your local console.

---

> ⚠️ **Disclaimer:** This README and plugin were generated with the help of AI and may contain errors or outdated assumptions.  
> 💡 I'm **not affiliated with LynxJS or its maintainers** — this project was built independently for use within the LynxJS ecosystem.  
>  
> 🙏 **Pull requests are welcome!** If something doesn’t work or could be improved, feel free to open a PR.

---

## 🔗 Related Plugin

This plugin is designed to work **alongside** [`ngrok-rsbuild-plugin`](https://www.npmjs.com/package/ngrok-rsbuild-plugin). It uses the ngrok tunnel URL to forward logs from remote devices when testing on real hardware.

Make sure you’re using both together for the best experience.

---

## ✨ Features

- 🔌 Adds a `POST /console_log` route to the dev server for capturing logs
- 📄 Automatically generates a `console.js` file that overrides `console.log` and `console.info`
- 🌐 Uses `ngrok` (if available) to allow logs from remote devices
- ⚙️ Filters out noisy logs (like `[rspeedy-dev-server]` and `[HMR]`) by default
- 🧪 Optional `rspeedyLogs` flag to include all logs if needed

---

## 🛠 Installation

```bash
npm install relog-rsbuild-plugin --save-dev
```

---

## 🔧 Setup

```ts
// rsbuild.config.ts or index.ts
import { pluginRelog } from 'relog-rsbuild-plugin';

export default {
  plugins: [
    pluginRelog({
      rspeedyLogs: false, // set to true if you want to see all logs including [rspeedy] and [HMR]
    }),
  ],
};
```

---

## 📁 Output

This plugin will generate a file called `console.js` in the same directory as the plugin.  
You should load this file into your app's entry point (or however your framework handles native-side injection of JavaScript code).

```js
import 'relog-rsbuild-plugin/console.js';
```

> This script overrides `console.log` and `console.info` globally to forward logs to the dev server.

---

## 🧩 How it Works

1. If `ngrok-rsbuild-plugin` is installed and exposes a tunnel URL, that URL is used for logging.
2. A `console.js` file is generated pointing to `http(s)://<host>/console_log`.
3. The script redefines `console.log` and `console.info` to send logs as JSON to the dev server.
4. The server receives and prints them in your terminal.

---

## 🔍 Notes

- Logs are filtered by default to hide common development spam (`[rspeedy-dev-server]`, `[HMR]`) — you can turn them back on with `rspeedyLogs: true`.
- The server route is mounted at `/console_log`.
- Make sure your app loads the generated `console.js` file.

---

## 🧪 Example Output

```bash
[APP]: App launched on device
[APP]: Fetching data from API...
[APP]: { status: "ok", data: [...] }
```

---

## License

MIT