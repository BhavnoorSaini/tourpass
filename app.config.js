module.exports = {
  expo: {
    name: "tourpass",
    slug: "tourpass-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "tourpass",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "This app uses location to show your position on the map.",
        MBXAccessToken: process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN,
        UIBackgroundModes: [
          "audio",
          "location"
        ]
      },
      bundleIdentifier: "com.bhavnoor.tourpass-app"
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      permissions: [
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION"
      ],
      edgeToEdgeEnabled: true,
      package: "com.bhavnoor.tourpassapp"
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ],
      [
        "@rnmapbox/maps",
        {
          RNMapboxMapsVersion: "11.13.4",
          RNMapboxMapsDownloadToken: process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN,
        }
      ],
      [
        "@badatgil/expo-mapbox-navigation",
        {
          accessToken: process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN,
          mapboxMapsVersion: "11.13.4"
        }
      ],
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static"
          }
        }
      ],
      "expo-font",
      [
        "./plugins/withMapboxAndroidToken",
        {
          accessToken: process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "659b66b8-f1be-4ee0-a2c4-fa1e32adefc7"
      }
    },
    owner: "tourpass"
  }
};
