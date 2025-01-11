import { spawn } from 'child_process';
import { build, createServer } from 'vite';


let spawnProcess = null;


const renderDev = {
  async createRenderServer(serverOptions) {
    const { sharedOptions, config } = serverOptions;

    process.env.VITE_CURRENT_RUN_MODE = 'render';

    const options = {
      configFile: false,
      ...sharedOptions,
      ...config,
    };

    const server = await createServer(options);
    await server.listen();
    server.printUrls();

    return server;
  },
};

const preloadDev = {
  async createRenderServer(viteDevServer, serverOptions) {
    const { sharedOptions, config } = serverOptions;

    process.env.VITE_CURRENT_RUN_MODE = 'preload';

    const options = {
      configFile: false,
      ...sharedOptions,
      ...config,
    };

    return build({
      ...options,
      plugins: [
        {
          name: 'reload-page-on-preload-package-change',
          writeBundle() {
            viteDevServer.ws.send({
              type: 'full-reload',
            });
          },
        },
      ],
    });
  },
};

const mainDev = {
  async createMainServer(renderDevServer, serverOptions, electronPath) {
    const { sharedOptions, config } = serverOptions;

    const protocol = `http${renderDevServer.config.server.https ? 's' : ''}:`;
    const host = renderDevServer.config.server.host || 'localhost';
    const port = renderDevServer.config.server.port;

    process.env.VITE_DEV_SERVER_URL = `${protocol}//${host}:${port}/`;
    process.env.VITE_CURRENT_RUN_MODE = 'main';

    const options = {
      configFile: false,
      ...sharedOptions,
      ...config,
    };

    return build({
      ...options,
      plugins: [
        {
          name: 'reload-app-on-main-package-change',
          writeBundle() {
            if (spawnProcess != null) {
              spawnProcess.kill('SIGINT');
              spawnProcess = null;
            }

            spawnProcess = spawn(String(electronPath), ['--inspect','.']);

            if (spawnProcess) {
              spawnProcess.stdout.on('data', (d) => {
                const data = d.toString().trim();
                console.log(data);
              });
              spawnProcess.stderr.on('data', (err) => {
                console.error(`stderr: ${err}`);
              });
            }

            process.on('SIGINT', () => {
              if (spawnProcess) {
                spawnProcess.kill();
                spawnProcess = null;
              }
              process.exit();
            });
          },
        },
      ],
    });
  },
};


const createViteElectronService = async (options) => {
  const {
    render,
    preload,
    main,
    worker,
    electronPath,
    sharedOptions = {
      mode: 'dev',
      build: {
        watch: {},
      },
    },
  } = options;

  try {
    const renderDevServer = await renderDev.createRenderServer({ config: render, sharedOptions });
    await preloadDev.createRenderServer(renderDevServer, { config: preload, sharedOptions });
    await mainDev.createMainServer(renderDevServer, { config: main, sharedOptions }, electronPath);
    build({
      configFile: false,
      ...sharedOptions,
      ...worker,
    });
  } catch (err) {
    console.error(err);
  }
};

export default createViteElectronService;