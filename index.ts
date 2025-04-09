import { type RsbuildPlugin, logger } from '@rsbuild/core';
import { log } from '@clack/prompts';
import color from 'picocolors';
import {  } from "module";
import { createTemplateFile } from './generateLogfile.js';

const console = {
    ...log,
    ...logger,
};
let count = 0;
export function pluginRelog(options?: any): RsbuildPlugin {
    const { rspeedyLogs = false }: { rspeedyLogs?: boolean } = options || {};

    return {
        name: 'lynx:rsbuild:relog',
        pre: ['lynx:rsbuild:api', 'lynx:rsbuild:ngrok'],
        post: [],
        setup(api) {

            api.onBeforeCreateCompiler(() => {
                const ngrok_url = api.useExposed('lynx:rsbuild:ngrok')?.ngrok_url || ""

                if (api.context.devServer && count == 0) {
                    const { https, hostname, port } = api.context.devServer;
                    const protocol = https ? 'https' : 'http';
                    console.log("ngrok_url exposed", ngrok_url)

                    const url =
                        ngrok_url ? ngrok_url :
                            `${protocol}://${hostname}:${port}`;

                    createTemplateFile(url)
                    count++;
                }
            })
            
            api.onBeforeStartDevServer(async ({ server }) => {
                if (!server) {
                    console.error('Rsbuild dev server not found.');
                    return;
                }

                // Add custom middleware to handle /log route
                server.middlewares.use((req, res, next) => {
                    if (req.method === 'POST' && req.url === '/console_log') {
                        let body = '';
                        req.on('data', (chunk) => {
                            body += chunk.toString();
                        });
                        req.on('end', () => {
                            try {
                                const parsedBody = JSON.parse(body);
                                const { message } = parsedBody;

                                if (!message) {
                                    console.warn('Received empty message in /console_log');
                                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                                    res.end('Empty message');
                                    return;
                                }

                                if (Array.isArray(message)) {
                                        const isSafe = message.every((msg) => typeof msg === 'string' || typeof msg === 'number' || typeof msg === 'boolean');
                                        const shouldSkip = !rspeedyLogs && (message.includes('[rspeedy-dev-server]') || message.includes('[HMR]'))
                                        if(shouldSkip) return res.writeHead(200, { 'Content-Type': 'text/plain' }).end('OK');

                                        if (isSafe) {
                                            console.log(color.cyan('[APP]:'), ...message);
                                        } else {
                                            console.log(color.cyan('[APP]:'), JSON.stringify(message));
                                        }
                                } else if (
                                    typeof message === 'string' ||
                                    typeof message === 'number' ||
                                    typeof message === 'boolean'
                                ) {
                                    console.log(color.cyan('[APP]:'), message.toString());
                                } else {
                                    console.log(color.cyan('[APP]:'), JSON.stringify(message));
                                }

                                res.writeHead(200, { 'Content-Type': 'text/plain' });
                                res.end('OK');
                            } catch (error) {
                                console.error('Error parsing JSON: ' + error);
                                res.writeHead(400, { 'Content-Type': 'text/plain' });
                                res.end('Invalid JSON');
                            }
                        });
                    } else {
                        next();
                    }
                });
            });
        },
    };
}



