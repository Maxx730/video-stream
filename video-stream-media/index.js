const NodeMediaServer = require('node-media-server');
const serverConfig = require('./config');
const mediaServer = new NodeMediaServer(serverConfig);

function logEvent (name) {
    console.log(`--- ${name} ---`);
}

mediaServer.run();
mediaServer.on('prePublish', (id, path, args) => {
    logEvent('CONNECTION STARTED');
});

mediaServer.on('postPublish', async (id, path, args) => {
    logEvent('INITIALIZING CHANNEL');
    const session = mediaServer.getSession(id);
    const streamKey = path.split('/')[2];

    // INITIALIZE CHANNEL FOR OTHER VIEWERS
    const initResponse = await fetch('http://channels:2276/init', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({ title: args.title, desc: args.desc, key: streamKey }),
    });
    if (initResponse.status != 200) {
        logEvent('ERROR INITIALIZING CHANNEL');
        session.reject();
    }
});

mediaServer.on('donePublish', (id, path, args) => {
    const streamKey = path.split('/')[2];
    fetch('http://channels:2276/done', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({ key: streamKey }),
    });
});

