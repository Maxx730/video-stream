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

  trans: {
    // In your Alpine container this is /usr/bin/ffmpeg
    // On bare metal macOS(Homebrew): /opt/homebrew/bin/ffmpeg (Apple Silicon) or /usr/local/bin/ffmpeg (Intel)
    ffmpeg: '/usr/bin/ffmpeg',

    tasks: [
      {
        app: 'live',          // must match your RTMP URL: rtmp://host:1935/live/<key>
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=12:hls_flags=delete_segments]',
        dash: false,

        // Force video/audio codecs & settings
        vc: 'libx264',
        ac: 'aac',

        // Video encoding
        videoBitrate: '2500k',      // adjust as needed
        vCodecPreset: 'veryfast',
        videoProfile: 'baseline',   // baseline/main/high are fine; baseline is most compatible
        videoSize: '1280x720',      // set your target resolution
        videoGop: '60',             // keyframe every ~2s at 30fps

        // Audio encoding
        audioBitrate: '128k',
        audioSamplerate: 44100,
        audioChannel: 2
      }
    ]
  }
};
