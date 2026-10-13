const { randomUUID } = require('crypto');
const chokidar = require('chokidar');

const CLIENT_RETRY_TIMEOUT = 1000 // retry in miliseonds

// Watch for updates then send to client
const files = [
    '.tmp/public',
    'app/views',
    'app/assets',
    'app/config.json'
]
var watcher = chokidar.watch(files)

// https://html.spec.whatwg.org/multipage/server-sent-events.html#the-eventsource-interface
function dataEvent (type, data) {
    let event = '';
    event += `id: ${randomUUID()}\n`

    if (type) {
        event += `event: ${type}\n`
    }
    event += `data: ${data}`
    
    if (type == "retry") {
        event = `retry: ${data}`
    }

    event += '\n\n'

    console.log('Event sent')
    console.log('---')
    console.log(event);
    console.log('---')
    console.log(' ')
    return event
}

function retryEvent (timeout = 1000) {
    return `retry: ${timeout}\n\n`
}

const syncChangesHandler = (req, res) => {
    console.log("client-connection:open")

    // Set headers to keep the connection alive and tell the client we're sending event-stream data
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Set default retry for the client to try to reconnect
    res.write(retryEvent(CLIENT_RETRY_TIMEOUT));

    watcher.on('change', (path) => {
        const data = JSON.stringify({ path })
        res.write(dataEvent("change", data));
    });

    // When client closes connection, stop sending events
    req.on('close', () => {
        console.log("client-connection:closed")
    });
};

process.on('exit', () => {
    console.log('server:closed')
    watcher.close().then(() => {
        console.log('watcher:closed')
    });
});

module.exports = {
    syncChangesHandler
}