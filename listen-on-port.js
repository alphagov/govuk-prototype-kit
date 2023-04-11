import browserSync from "browser-sync";
import server from "./server.js";
import { getConfig } from "./lib/config.js";
const config = { getConfig }.getConfig();
const port = config.port;
if (config.isTest) {
    server.listen();
}
else {
    if (config.isDevelopment) {
        console.log('You can manage your prototype at:');
        console.log(`http://localhost:${port}/manage-prototype`);
        console.log('');
    }
    console.log('The Prototype Kit is now running at:');
    console.log(`http://localhost:${port}`);
    console.log('');
    if (config.isProduction || !config.useBrowserSync) {
        server.listen(port);
    }
    else {
        server.listen(port - 50, () => {
            browserSync({
                proxy: 'localhost:' + (port - 50),
                port,
                ui: false,
                files: ['.tmp/public/**/*.*', 'app/views/**/*.*', 'app/assets/**/*.*', 'app/config.json'],
                ghostMode: false,
                open: false,
                notify: false,
                logLevel: 'error'
            });
        });
    }
}
