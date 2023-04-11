import { requests as requests$0 } from "../../index.js";
import plugins from "./plugins.js";
const requests = { requests: requests$0 }.requests;
// Serve assets from plugins
function setupPathsFor(item) {
    plugins.getPublicUrlAndFileSystemPaths(item)
        .forEach(paths => {
        requests.serveDirectory(paths.publicUrl, paths.fileSystemPath);
        // Keep /extension-assets path for backwards compatibility
        // TODO: Remove in v14
        requests.serveDirectory(paths.publicUrl.replace('plugin-assets', 'extension-assets'), paths.fileSystemPath);
    });
}
setupPathsFor('scripts');
setupPathsFor('stylesheets');
setupPathsFor('assets');
