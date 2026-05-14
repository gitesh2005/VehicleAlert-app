const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withArOptional(config) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;

    if (!androidManifest['uses-feature']) {
      androidManifest['uses-feature'] = [];
    }

    // Check if the AR feature is already present
    const hasArFeature = androidManifest['uses-feature'].some(
      (feature) => feature.$['android:name'] === 'android.hardware.camera.ar'
    );

    if (!hasArFeature) {
      androidManifest['uses-feature'].push({
        $: {
          'android:name': 'android.hardware.camera.ar',
          'android:required': 'false',
        },
      });
    } else {
      // If it exists, make sure it's set to false
      androidManifest['uses-feature'] = androidManifest['uses-feature'].map((feature) => {
        if (feature.$['android:name'] === 'android.hardware.camera.ar') {
          feature.$['android:required'] = 'false';
        }
        return feature;
      });
    }

    return config;
  });
};
