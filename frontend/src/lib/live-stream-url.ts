/**
 * Default live camera stream URL used across the app (Live View, Camera Integration, Dashboard grid, etc.).
 * Password @ encoded as %40 so the URL parses correctly.
 * Note: Browsers do not play RTSP directly; for browser playback use an RTSP-to-HLS/HTTP proxy or VLC/Electron.
 */
export const DEFAULT_LIVE_STREAM_URL =
  "rtsp://admin:Pak%4000721@192.168.18.201:554/Streaming/Channels/101"
