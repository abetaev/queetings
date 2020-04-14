cordova run android --prod --release --buildConfig build.json --no-native-run
echo cd platforms/android/ && gradlew bundleRelease
echo jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore release-key.keystore platforms/android/app/build/outputs/bundle/release/app.aab todoapp -storepass 123
echo cd ../..
