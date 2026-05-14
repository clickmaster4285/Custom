/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** Full URL or path to the Android APK (e.g. `/pakistan-customs-portal.apk`). */
  readonly VITE_ANDROID_APK_URL?: string
  /** App Store product page URL for the native iOS app (e.g. `https://apps.apple.com/app/...`). */
  readonly VITE_IOS_APP_STORE_URL?: string
}
