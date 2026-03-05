const { withStringsXml, withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo config plugin that fixes Mapbox Navigation on Android:
 * 1. Injects the Mapbox public access token into Android's strings.xml
 * 2. Patches ExpoMapboxNavigationModule.kt to set MapboxOptions.accessToken
 *    and setup MapboxNavigationApp SYNCHRONOUSLY (not in a coroutine)
 * 3. Patches ExpoMapboxNavigationView.kt so the mapboxNavigation reference
 *    is lazy — fetched when needed instead of at construction time — fixing
 *    the race condition where the view is created before setup completes.
 */
function withMapboxAndroidToken(config, { accessToken }) {
  // Step 1: Add mapbox_access_token to strings.xml
  config = withStringsXml(config, (mod) => {
    mod.modResults.resources.string = (
      mod.modResults.resources.string || []
    ).filter((s) => s.$.name !== "mapbox_access_token");

    mod.modResults.resources.string.push({
      $: { name: "mapbox_access_token", translatable: "false" },
      _: accessToken,
    });

    return mod;
  });

  // Step 2: Patch the Kotlin source files
  config = withDangerousMod(config, [
    "android",
    async (mod) => {
      const basePath = path.resolve(
        mod.modRequest.projectRoot,
        "node_modules/@badatgil/expo-mapbox-navigation/android/src/main/java/expo/modules/mapboxnavigation"
      );

      // --- Patch ExpoMapboxNavigationModule.kt ---
      const modulePath = path.join(basePath, "ExpoMapboxNavigationModule.kt");
      if (fs.existsSync(modulePath)) {
        // Write the entire patched module to avoid string-matching issues
        const patchedModule = `package expo.modules.mapboxnavigation

import android.os.Handler
import android.os.Looper
import androidx.lifecycle.LifecycleOwner
import com.mapbox.geojson.Point
import com.mapbox.common.MapboxOptions
import com.mapbox.navigation.base.options.NavigationOptions
import com.mapbox.navigation.core.lifecycle.MapboxNavigationApp
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoMapboxNavigationModule : Module() {
  private val activity
    get() = requireNotNull(appContext.activityProvider?.currentActivity)

  @com.mapbox.navigation.base.ExperimentalPreviewMapboxNavigationAPI
  override fun definition() = ModuleDefinition {
    Name("ExpoMapboxNavigation")

    OnActivityEntersForeground {
      // Read the access token (can be done on any thread)
      try {
        val ctx = activity.applicationContext
        val resId = ctx.resources.getIdentifier("mapbox_access_token", "string", ctx.packageName)
        if (resId != 0) {
          val token = ctx.getString(resId)
          if (token.isNotEmpty()) {
            MapboxOptions.accessToken = token
          }
        }
      } catch (_: Exception) {}

      // MapboxNavigationApp methods must be called on the main thread
      val runOnMain = Runnable {
        if (!MapboxNavigationApp.isSetup()) {
          MapboxNavigationApp.setup {
            NavigationOptions.Builder(activity.applicationContext).build()
          }
        }
        MapboxNavigationApp.attach(activity as LifecycleOwner)
      }

      if (Looper.myLooper() == Looper.getMainLooper()) {
        runOnMain.run()
      } else {
        Handler(Looper.getMainLooper()).post(runOnMain)
      }
    }

    View(ExpoMapboxNavigationView::class) {
      Events(
              "onRouteProgressChanged",
              "onCancelNavigation",
              "onWaypointArrival",
              "onFinalDestinationArrival",
              "onRouteChanged",
              "onUserOffRoute",
              "onRoutesLoaded",
              "onRouteFailedToLoad"
      )

      Prop("coordinates") { view: ExpoMapboxNavigationView, coordinates: List<Map<String, Any>> ->
        val points = mutableListOf<Point>()
        for (coordinate in coordinates) {
          val longValue = coordinate.get("longitude")
          val latValue = coordinate.get("latitude")
          if (longValue is Double && latValue is Double) {
            points.add(Point.fromLngLat(longValue, latValue))
          }
        }
        view.setCoordinates(points)
      }

      Prop("vehicleMaxHeight") { view: ExpoMapboxNavigationView, maxHeight: Double? ->
        view.setVehicleMaxHeight(maxHeight)
      }

      Prop("vehicleMaxWidth") { view: ExpoMapboxNavigationView, maxWidth: Double? ->
        view.setVehicleMaxWidth(maxWidth)
      }

      Prop("waypointIndices") { view: ExpoMapboxNavigationView, indices: List<Int>? ->
        view.setWaypointIndices(indices)
      }

      Prop("locale") { view: ExpoMapboxNavigationView, localeStr: String? ->
        view.setLocale(localeStr)
      }

      Prop("useRouteMatchingApi") { view: ExpoMapboxNavigationView, useRouteMatchingApi: Boolean? ->
        view.setIsUsingRouteMatchingApi(useRouteMatchingApi)
      }

      Prop("routeProfile") { view: ExpoMapboxNavigationView, profile: String? ->
        view.setRouteProfile(profile)
      }

      Prop("routeExcludeList") { view: ExpoMapboxNavigationView, excludeList: List<String>? ->
        view.setRouteExcludeList(excludeList)
      }

      Prop("mapStyle") { view: ExpoMapboxNavigationView, style: String? -> view.setMapStyle(style) }

      Prop("mute") { view: ExpoMapboxNavigationView, isMuted: Boolean? -> view.setIsMuted(isMuted) }

      Prop("initialLocation") { view: ExpoMapboxNavigationView, initialLocation: Map<String, Any>?
        ->
        val longValue = initialLocation?.get("longitude")
        val latValue = initialLocation?.get("latitude")
        val zoomValue = initialLocation?.get("zoom")

        if (longValue is Double && latValue is Double && zoomValue is Double?) {
          view.setInitialLocation(Point.fromLngLat(longValue, latValue), zoomValue)
        }
      }

      Prop("customRasterSourceUrl") { view: ExpoMapboxNavigationView, url: String? ->
        view.setCustomRasterSourceUrl(url)
      }

      Prop("placeCustomRasterLayerAbove") { view: ExpoMapboxNavigationView, layerId: String? ->
        view.setPlaceCustomRasterLayerAbove(layerId)
      }

      Prop("disableAlternativeRoutes") {
              view: ExpoMapboxNavigationView,
              disableAlternativeRoutes: Boolean? ->
        view.setDisableAlternativeRoutes(disableAlternativeRoutes)
      }

      Prop("followingZoom") { view: ExpoMapboxNavigationView, followingZoom: Double? ->
        view.setFollowingZoom(followingZoom)
      }

      AsyncFunction("recenterMap") { view: ExpoMapboxNavigationView -> view.recenterMap() }
    }
  }
}
`;
        fs.writeFileSync(modulePath, patchedModule, "utf-8");
      }

      // --- Patch ExpoMapboxNavigationView.kt ---
      // Change mapboxNavigation from eager val to a lazy getter so it
      // always gets the current (non-null) MapboxNavigationApp instance
      const viewPath = path.join(basePath, "ExpoMapboxNavigationView.kt");
      if (fs.existsSync(viewPath)) {
        let viewContent = fs.readFileSync(viewPath, "utf-8");

        // Replace the eager initialization with a lazy getter
        if (viewContent.includes("private val mapboxNavigation = MapboxNavigationApp.current()")) {
          viewContent = viewContent.replace(
            "private val mapboxNavigation = MapboxNavigationApp.current()",
            "private val mapboxNavigation get() = MapboxNavigationApp.current()"
          );
          fs.writeFileSync(viewPath, viewContent, "utf-8");
        }
      }

      return mod;
    },
  ]);

  return config;
}

module.exports = withMapboxAndroidToken;

