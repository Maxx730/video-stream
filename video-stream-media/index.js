const NodeMediaServer = require('node-media-server');
const serverConfig = require('./config');
const mediaServer = new NodeMediaServer(serverConfig);

function logEvent (name) {
    console.log(`--- ${name} ---`);
}

mediaServer.run();
mediaServer.on('prePublish', (id, path, args) => {

});

mediaServer.on('postPublish', async (id, path, args) => {
    logEvent('INITIALIZING CHANNEL');
    const session = mediaServer.getSession(id);
    console.log(args);
    // INITIALIZE CHANNEL FOR OTHER VIEWERS
    const initResponse = await fetch('http://channels:2276/init', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({ title: args.title, desc: args.desc, key: args.key }),
    });
    console.log(initResponse.status);
    if (initResponse.status != 200) {
        logEvent('ERROR INITIALIZING CHANNEL');
        session.reject();
    }
});

mediaServer.on('donePublish', (id, path, args) => {
    fetch('http://channels:2276/done', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({ key: args.key }),
    });
});

