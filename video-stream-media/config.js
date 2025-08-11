module.exports = {
  logType: 2, // reduce noise
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*',      // tighten later
    mediaroot: './media',   // HLS/DASH output lives here
  },
  trans: {
    ffmpeg: 'ffmpeg',       // path to ffmpeg
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=6:hls_flags=delete_segments]',
        dash: false
      }
    ]
  }
}