// config.js  (Node-Media-Server v2)
module.exports = {
  logType: 3,

  rtmp: {
    port: 1935,
    gop_cache: true,
    ping: 30,
    ping_timeout: 300
  },

  http: {
    port: 8000,
    allow_origin: '*',
    // Use absolute path in Docker
    mediaroot: '/app/media'
  },

  // config.js — LIGHT transcode
  trans: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=12:hls_flags=delete_segments]',
        vc: 'libx264',
        ac: 'aac',
        vCodecPreset: 'superfast',     // faster than veryfast
        videoBitrate: '2200k',         // reduce a bit
        videoProfile: 'main',
        videoSize: '1280x720',
        videoGop: '60',                // 30 fps -> keyframe every 2s
        audioBitrate: '128k',
        audioSamplerate: 44100,
        audioChannel: 2
      }
    ]
  }
};
