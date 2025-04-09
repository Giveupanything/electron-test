/*
 * @Author: qilin
 * @Date: 2025-04-07 14:11:43
 * @LastEditors: qilin
 * @LastEditTime: 2025-04-09 11:54:46
 * @description: 乘风破浪
 */
import { rmSync } from 'node:fs'
import path from 'node:path'
import fs from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'
import pkg from './package.json'
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // loadEnv中三个参数 (mode,dir,base) -> 返回一个包含环境变量的对象
  // mode: Vite的运行模式,通常是development 或 production
  // dir: 环境变量文件的查找目录,通常用 process.cwd() 获取当前工作目录
  // base:环境变量文件的基础名称,通常为空字符串,表示默认的 '.env' 文件
  const env: Record<string, string> = loadEnv(mode, process.cwd(), ''); // 环境变量
  const isProd: boolean = env.VITE_APP_ENV === 'production';
  const isDev: boolean = env.VITE_APP_ENV === 'development';
  const isSit: boolean = env.VITE_APP_ENV === 'sit';  // 是否为测试环境
  const isHideLog: boolean = env.VITE_APP_LOG === 'true';  // 是否隐藏日志

  let delDir: (path: string) => void = (path: string) => { };
  // 非本地环境删除dist文件夹
  if (!isDev) {
    delDir = (path: string) => {
      let files: string[] = [];
      if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(file => {
          const curPath: string = path + '/' + file;
          // 判断是否是文件夹
          if (fs.statSync(curPath).isDirectory()) {
            delDir(curPath); //递归删除文件夹
          } else {
            // 是文件的话说明是最后一层不需要递归
            fs.unlinkSync(curPath); //删除文件
          }
        });
        fs.rmdirSync(path);
      } else {
        return false;
      }
    };

    // 删除目录
    delDir('./dist');
    // delDir('./mobile')
  }

  // 区分测试和生产的打包环境
  let publicPath: string = '';
  let outputDir: string = '';

  // 测试使用dist打包
  if (isSit) {
    publicPath = env.VITE_APP_RESOURCE_URL as string;
    outputDir = 'dist';
  }

  // 生产/预生产使用时间戳
  if (isProd) {
    // 前端打包解决缓存问题
    // const formatDate = (): string => {
    //   const time: Date = new Date();
    //   const y: string = time.getFullYear().toString();
    //   let m: string = (time.getMonth() + 1).toString();
    //   let d: string = time.getDate().toString();
    //   let h: string = time.getHours().toString();
    //   let mm: string = time.getMinutes().toString();
    //   const ss: string = time.getSeconds().toString();
    //   m = Number(m) < 10 ? `0${m}` : m;
    //   d = Number(d) < 10 ? `0${d}` : d;
    //   h = Number(h) < 10 ? `0${h}` : h;
    //   mm = Number(mm) < 10 ? `0${mm}` : mm;
    //   return `${y}${m}${d}${h}${mm}${ss}`;
    // };
    // const dirName: string = formatDate();
    // publicPath = `${env.VITE_APP_RESOURCE_URL}${dirName}`
    publicPath = `${env.VITE_APP_RESOURCE_URL}`;
    if (isProd) {
      // outputDir = `./dist/${dirName}`
      outputDir = `./dist`;
    }
  }

  rmSync('dist-electron', { recursive: true, force: true })

  // command 是vite的命令行参数,serve/build，
  // serve是开发模式，build是生产模式
  const isServe = command === 'serve'
  const isBuild = command === 'build'
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG

  return {
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src')
      },
    },
    plugins: [
      react(),
      svgr(),
      electron({
        main: {
          // Shortcut of `build.lib.entry`
          entry: 'electron/main/index.ts',
          onstart(args) {
            if (process.env.VSCODE_DEBUG) {
              // 使用 VSCode Debug 时，使用 Electron 的 Debug 模式
              console.log(/* For `.vscode/.debug.script.mjs` */'[startup] Electron App')
            } else {
              args.startup()
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: 'dist-electron/main',
              rollupOptions: {
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
              },
            },
          },
        },
        preload: {
          // Shortcut of `build.rollupOptions.input`.
          // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
          input: 'electron/preload/index.ts',
          vite: {
            build: {
              sourcemap: sourcemap ? 'inline' : undefined, // #332
              minify: isBuild,
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
              },
            },
          },
        },
        // Ployfill the Electron and Node.js API for Renderer process.
        // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
        // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
        renderer: {},
      }),
    ],
    build: {
      assetsDir: 'assets', // 静态资源目录名
      assetsInlineLimit: 1024 * 10, // 小于10kb的图片转base64， 默认 4096
      cssCodeSplit: true, // 是否使用css分离插件 ExtractTextPlugin
      minify: 'esbuild',  // 压缩方式， 默认 'terser'，esbuild更快
      terserOptions: {
        compress: {
          drop_console: isHideLog, // 生产环境移除console
          drop_debugger: isHideLog, // 生产环境移除debugger
        },
      },
      rollupOptions: {
        input: {
          main: path.join(__dirname, 'index.html'),
          float: path.join(__dirname, 'float.html'),
        },
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js', // chunk文件名
          entryFileNames: 'assets/js/[name]-[hash].js', // 入口文件名
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]', // 资源文件名
          manualChunks(id) {
            // 打包第三方库
            // 如果是node_modules下的文件,则分离打包
            if (id.includes('node_modules')) {
              // id是模块的路径
              // 通过split方法分割字符串,获取模块的名称
              return id.toString().split('node_modules/')[1].split('/')[0].toString()
            }
          }
        }
      },
    },
    // server: process.env.VSCODE_DEBUG && (() => {
    //   // 如果是VSCode调试模式,则使用Vite的调试模式
    //   const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL)
    //   return {
    //     host: url.hostname,
    //     port: +url.port,
    //   }
    // })(),
    server: {
      port: 7788,
      host: '0.0.0.0',
      open: false,
      // https: false,
      strictPort: false, // 为true若端口已被占用则会直接退出
      proxy: {
        '/api': {
          target: env.VITE_APP_SERVE_URl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    clearScreen: false,
  }
})
