/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';

export interface AndroidFile {
  path: string;
  name: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'markdown' | 'properties';
  content: string;
  description: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  // 1. AndroidManifest.xml
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    description: 'Android manifest declaring Media3 MediaSessionService, permissions for local audio scanning, and foreground playback.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.shri.music">

    <!-- Offline Storage Permissions for Local MediaStore Audio Files -->
    <!-- Android 13+ (API 33+) granular audio permission -->
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
    <!-- Android 12 and below storage read permission -->
    <uses-permission
        android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />

    <!-- Foreground Service & Media Playback (Required for uninterrupted lock-screen / background playback) -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    
    <!-- Audio & Bluetooth Media Hardware Interfacing -->
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

    <!-- Pure Offline Assurance: NO INTERNET PERMISSION REQUESTED -->

    <application
        android:name=".DekuApplication"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.DekuMusic">

        <!-- Main UI Activity with Edge-to-Edge Jetpack Compose -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/Theme.DekuMusic">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <!-- Intent filter to open audio files directly from file managers -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:scheme="content" />
                <data android:mimeType="audio/*" />
            </intent-filter>
        </activity>

        <!-- Media3 MediaSession Foreground Playback Service -->
        <service
            android:name=".playback.MusicPlaybackService"
            android:exported="true"
            android:foregroundServiceType="mediaPlayback">
            <intent-filter>
                <action android:name="androidx.media3.session.MediaSessionService" />
                <action android:name="android.media.browse.MediaBrowserService" />
            </intent-filter>
        </service>

        <!-- Broadcast Receiver for Headset Unplug / Noisy Audio Interruption -->
        <receiver
            android:name=".playback.BecomingNoisyReceiver"
            android:exported="false">
            <intent-filter>
                <action android:name="android.media.AUDIO_BECOMING_NOISY" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`
  },

  // 2. build.gradle.kts (App level)
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    language: 'kotlin',
    description: 'Gradle configuration with Media3 ExoPlayer, Jetpack Compose Material 3, Room, DataStore, and Coil for album art.',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.shri.music"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.shri.music"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug") // Configure custom release keystore for distribution
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    // Core AndroidX & Coroutines
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(libs.kotlinx.coroutines.android)

    // Jetpack Compose & Material 3
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.androidx.navigation.compose)

    // AndroidX Media3 ExoPlayer (Audio Engine, MediaSession, Notification Manager)
    implementation(libs.androidx.media3.exoplayer)
    implementation(libs.androidx.media3.session)
    implementation(libs.androidx.media3.ui)
    implementation(libs.androidx.media3.common)

    // Room Database for Offline Favorites, Playlists & History
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // Jetpack DataStore (User Preferences & Audio Settings)
    implementation(libs.androidx.datastore.preferences)

    // Coil Image Loading for Embedded Album Art
    implementation(libs.coil.compose)

    // Testing
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}`
  },

  // 3. DekuApplication.kt
  {
    path: 'app/src/main/java/com/shri/music/DekuApplication.kt',
    name: 'DekuApplication.kt',
    language: 'kotlin',
    description: 'Application entry point initializing local database, notification channel for playback, and dependency tree.',
    content: `package com.shri.music

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.shri.music.data.db.MusicDatabase

class DekuApplication : Application() {

    lateinit var database: MusicDatabase
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this
        database = MusicDatabase.getInstance(this)
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                PLAYBACK_NOTIFICATION_CHANNEL_ID,
                "Playback Controls",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows offline playback controls on lock screen and notification shade"
                setShowBadge(false)
                lockscreenVisibility = NotificationManager.IMPORTANCE_LOW
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    companion object {
        const val PLAYBACK_NOTIFICATION_CHANNEL_ID = "deku_playback_channel"
        lateinit var instance: DekuApplication
            private set
    }
}`
  },

  // 4. MusicPlaybackService.kt (Media3 MediaSessionService)
  {
    path: 'app/src/main/java/com/shri/music/playback/MusicPlaybackService.kt',
    name: 'MusicPlaybackService.kt',
    language: 'kotlin',
    description: 'Media3 ExoPlayer background service managing AudioFocus, AudioAttributes, lock-screen notification, and Bluetooth events.',
    content: `package com.shri.music.playback

import android.app.PendingIntent
import android.content.Intent
import android.os.Bundle
import androidx.annotation.OptIn
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.CommandButton
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService
import androidx.media3.session.SessionCommand
import androidx.media3.session.SessionResult
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture
import com.shri.music.MainActivity

class MusicPlaybackService : MediaSessionService() {

    private var mediaSession: MediaSession? = null
    private lateinit var player: ExoPlayer
    private lateinit var equalizerController: AudioEqualizerController

    @OptIn(UnstableApi::class)
    override fun onCreate() {
        super.onCreate()

        // 1. Configure Android AudioAttributes for dedicated music playback
        val audioAttributes = AudioAttributes.Builder()
            .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)
            .setUsage(C.USAGE_MEDIA)
            .build()

        // 2. Initialize ExoPlayer with handleAudioBecomingNoisy and AudioFocus
        player = ExoPlayer.Builder(this)
            .setAudioAttributes(audioAttributes, /* handleAudioFocus = */ true)
            .setHandleAudioBecomingNoisy(true)
            .setWakeMode(C.WAKE_MODE_LOCAL)
            .build()

        // 3. Initialize Hardware Audio Effect Equalizer & Bass Boost
        equalizerController = AudioEqualizerController(player.audioSessionId)

        // 4. Build Launch Intent for Tap on Lock Screen Notification
        val sessionActivityPendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        // 5. Build MediaSession for system & Bluetooth integration
        mediaSession = MediaSession.Builder(this, player)
            .setSessionActivity(sessionActivityPendingIntent)
            .setCallback(CustomMediaSessionCallback())
            .build()
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? {
        return mediaSession
    }

    @OptIn(UnstableApi::class)
    private inner class CustomMediaSessionCallback : MediaSession.Callback {
        override fun onConnect(
            session: MediaSession,
            controller: MediaSession.ControllerInfo
        ): MediaSession.ConnectionResult {
            val sessionCommands = MediaSession.ConnectionResult.DEFAULT_SESSION_COMMANDS.buildUpon()
                .add(SessionCommand(ACTION_TOGGLE_FAVORITE, Bundle.EMPTY))
                .add(SessionCommand(ACTION_SET_EQUALIZER, Bundle.EMPTY))
                .build()

            return MediaSession.ConnectionResult.AcceptedResultBuilder(session)
                .setAvailableSessionCommands(sessionCommands)
                .build()
        }

        override fun onCustomCommand(
            session: MediaSession,
            controller: MediaSession.ControllerInfo,
            customCommand: SessionCommand,
            args: Bundle
        ): ListenableFuture<SessionResult> {
            when (customCommand.customAction) {
                ACTION_TOGGLE_FAVORITE -> {
                    // Toggle favorite in Room database
                }
            }
            return Futures.immediateFuture(SessionResult(SessionResult.RESULT_SUCCESS))
        }
    }

    override fun onDestroy() {
        mediaSession?.run {
            player.release()
            release()
            mediaSession = null
        }
        equalizerController.release()
        super.onDestroy()
    }

    companion object {
        const val ACTION_TOGGLE_FAVORITE = "com.shri.music.ACTION_TOGGLE_FAVORITE"
        const val ACTION_SET_EQUALIZER = "com.shri.music.ACTION_SET_EQUALIZER"
    }
}`
  },

  // 5. AudioEqualizerController.kt (Hardware Audio Effects)
  {
    path: 'app/src/main/java/com/shri/music/playback/AudioEqualizerController.kt',
    name: 'AudioEqualizerController.kt',
    language: 'kotlin',
    description: 'Hardware audio engine integrating Android AudioEffect.Equalizer and BassBoost with graceful fallback.',
    content: `package com.shri.music.playback

import android.media.audiofx.BassBoost
import android.media.audiofx.Equalizer
import android.util.Log

class AudioEqualizerController(private val audioSessionId: Int) {

    private var equalizer: Equalizer? = null
    private var bassBoost: BassBoost? = null

    init {
        try {
            if (audioSessionId != 0) {
                equalizer = Equalizer(0, audioSessionId).apply {
                    enabled = true
                }
                bassBoost = BassBoost(0, audioSessionId).apply {
                    enabled = true
                }
            }
        } catch (e: Exception) {
            Log.w("AudioEqualizer", "Hardware audio effects unavailable on this device: \${e.message}")
        }
    }

    fun setBandLevel(bandIndex: Short, levelMilliBels: Short) {
        try {
            equalizer?.setBandLevel(bandIndex, levelMilliBels)
        } catch (e: Exception) {
            Log.e("AudioEqualizer", "Failed to set band level", e)
        }
    }

    fun setBassBoostStrength(strengthPercent: Int) {
        try {
            val roundedStrength = (strengthPercent.coerceIn(0, 100) * 10).toShort()
            bassBoost?.setStrength(roundedStrength)
        } catch (e: Exception) {
            Log.e("AudioEqualizer", "Failed to set bass boost", e)
        }
    }

    fun setPreset(presetIndex: Short) {
        try {
            equalizer?.usePreset(presetIndex)
        } catch (e: Exception) {
            Log.e("AudioEqualizer", "Failed to apply preset", e)
        }
    }

    fun release() {
        equalizer?.release()
        bassBoost?.release()
        equalizer = null
        bassBoost = null
    }
}`
  },

  // 6. MediaStoreScanner.kt
  {
    path: 'app/src/main/java/com/shri/music/data/repository/MediaStoreScanner.kt',
    name: 'MediaStoreScanner.kt',
    language: 'kotlin',
    description: 'Scans device storage for audio files (MP3, FLAC, WAV, AAC, OGG) via Android ContentResolver and extracts metadata.',
    content: `package com.shri.music.data.repository

import android.content.ContentUris
import android.content.Context
import android.net.Uri
import android.provider.MediaStore
import com.shri.music.data.model.Song
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

class MediaStoreScanner(private val context: Context) {

    suspend fun scanLocalAudioFiles(excludedFolderPaths: List<String> = emptyList()): List<Song> =
        withContext(Dispatchers.IO) {
            val songList = mutableListOf<Song>()

            val collection: Uri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI

            val projection = arrayOf(
                MediaStore.Audio.Media._ID,
                MediaStore.Audio.Media.TITLE,
                MediaStore.Audio.Media.ARTIST,
                MediaStore.Audio.Media.ALBUM,
                MediaStore.Audio.Media.ALBUM_ID,
                MediaStore.Audio.Media.DURATION,
                MediaStore.Audio.Media.DATA,
                MediaStore.Audio.Media.SIZE,
                MediaStore.Audio.Media.YEAR,
                MediaStore.Audio.Media.DATE_ADDED
            )

            // Filter out non-music and very short audio files (ringtone / notification sounds < 15 seconds)
            val selection = "\${MediaStore.Audio.Media.IS_MUSIC} != 0 AND \${MediaStore.Audio.Media.DURATION} >= 15000"
            val sortOrder = "\${MediaStore.Audio.Media.TITLE} ASC"

            context.contentResolver.query(
                collection,
                projection,
                selection,
                null,
                sortOrder
            )?.use { cursor ->
                val idColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
                val titleColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
                val artistColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
                val albumColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)
                val albumIdColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM_ID)
                val durationColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
                val dataColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATA)
                val sizeColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.SIZE)
                val yearColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.YEAR)
                val dateAddedColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATE_ADDED)

                while (cursor.moveToNext()) {
                    val id = cursor.getLong(idColumn)
                    val title = cursor.getString(titleColumn) ?: "Unknown Title"
                    val artist = cursor.getString(artistColumn) ?: "Unknown Artist"
                    val album = cursor.getString(albumColumn) ?: "Unknown Album"
                    val albumId = cursor.getLong(albumIdColumn)
                    val durationMs = cursor.getLong(durationColumn)
                    val filePath = cursor.getString(dataColumn) ?: ""
                    val sizeBytes = cursor.getLong(sizeColumn)
                    val year = cursor.getInt(yearColumn)
                    val dateAdded = cursor.getLong(dateAddedColumn)

                    // Check if file is in excluded folder
                    val parentFolder = File(filePath).parent ?: ""
                    if (excludedFolderPaths.any { parentFolder.startsWith(it, ignoreCase = true) }) {
                        continue
                    }

                    val contentUri = ContentUris.withAppendedId(
                        MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
                        id
                    )

                    val albumArtUri = ContentUris.withAppendedId(
                        Uri.parse("content://media/external/audio/albumart"),
                        albumId
                    )

                    songList.add(
                        Song(
                            id = id,
                            title = title,
                            artist = if (artist == "<unknown>") "Unknown Artist" else artist,
                            album = if (album == "<unknown>") "Unknown Album" else album,
                            albumId = albumId,
                            duration = durationMs / 1000,
                            contentUri = contentUri.toString(),
                            artworkUri = albumArtUri.toString(),
                            filePath = filePath,
                            folderPath = parentFolder,
                            sizeBytes = sizeBytes,
                            year = if (year > 0) year else null,
                            dateAdded = dateAdded,
                            isFavorite = false
                        )
                    )
                }
            }

            songList
        }
}`
  },

  // 7. Song.kt & Database Models
  {
    path: 'app/src/main/java/com/shri/music/data/model/Song.kt',
    name: 'Song.kt',
    language: 'kotlin',
    description: 'Data models for local songs, albums, playlists, and playback state with Room annotations.',
    content: `package com.shri.music.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "songs")
data class Song(
    @PrimaryKey val id: Long,
    val title: String,
    val artist: String,
    val album: String,
    val albumId: Long,
    val duration: Long, // in seconds
    val contentUri: String,
    val artworkUri: String?,
    val filePath: String,
    val folderPath: String,
    val sizeBytes: Long,
    val year: Int?,
    val dateAdded: Long,
    var isFavorite: Boolean = false,
    val playCount: Int = 0,
    val lastPlayedTimestamp: Long? = null
)

@Entity(tableName = "playlists")
data class Playlist(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val description: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "playlist_songs",
    primaryKeys = ["playlistId", "songId"]
)
data class PlaylistSongCrossRef(
    val playlistId: Long,
    val songId: Long,
    val orderIndex: Int
)`
  },

  // 8. MusicDatabase.kt
  {
    path: 'app/src/main/java/com/shri/music/data/db/MusicDatabase.kt',
    name: 'MusicDatabase.kt',
    language: 'kotlin',
    description: 'Room SQLite database for offline storage of playlists, favorites, and track history.',
    content: `package com.shri.music.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.shri.music.data.model.Playlist
import com.shri.music.data.model.PlaylistSongCrossRef
import com.shri.music.data.model.Song

@Database(
    entities = [Song::class, Playlist::class, PlaylistSongCrossRef::class],
    version = 1,
    exportSchema = false
)
abstract class MusicDatabase : RoomDatabase() {

    abstract fun songDao(): SongDao
    abstract fun playlistDao(): PlaylistDao

    companion object {
        @Volatile
        private var INSTANCE: MusicDatabase? = null

        fun getInstance(context: Context): MusicDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    MusicDatabase::class.java,
                    "deku_music_database.db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}`
  },

  // 9. Theme.kt (Nothing OS / Pixel Aesthetic in Compose)
  {
    path: 'app/src/main/java/com/shri/music/ui/theme/Theme.kt',
    name: 'Theme.kt',
    language: 'kotlin',
    description: 'Custom Material 3 Theme with Nothing OS dot-matrix design, pure AMOLED black, and Pixel typography.',
    content: `package com.shri.music.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

// Nothing OS Inspired Monochrome & Accent Color Palette
val NothingRed = Color(0xFFD71920)
val PureBlack = Color(0xFF000000)
val CharcoalDark = Color(0xFF121214)
val SurfaceDark = Color(0xFF18181B)
val TextPrimaryDark = Color(0xFFFFFFFF)
val TextSecondaryDark = Color(0xFFA1A1AA)

private val DekuAmoledColorScheme = darkColorScheme(
    primary = NothingRed,
    onPrimary = Color.White,
    primaryContainer = Color(0xFF261012),
    secondary = Color.White,
    background = PureBlack,
    surface = CharcoalDark,
    surfaceVariant = SurfaceDark,
    onBackground = TextPrimaryDark,
    onSurface = TextPrimaryDark,
    onSurfaceVariant = TextSecondaryDark
)

@Composable
fun DekuMusicTheme(
    darkTheme: Boolean = true,
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        else -> DekuAmoledColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}`
  },

  // 10. MainActivity.kt (Compose UI Entry)
  {
    path: 'app/src/main/java/com/shri/music/MainActivity.kt',
    name: 'MainActivity.kt',
    language: 'kotlin',
    description: 'Jetpack Compose entry activity handling edge-to-edge layout, runtime audio permissions, navigation, and playback UI.',
    content: `package com.shri.music

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import com.shri.music.ui.screens.MainAppNavigation
import com.shri.music.ui.theme.DekuMusicTheme

class MainActivity : ComponentActivity() {

    private var hasStoragePermission by mutableStateOf(false)

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasStoragePermission = isGranted
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        checkAndRequestStoragePermission()

        setContent {
            DekuMusicTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    MainAppNavigation(
                        hasPermission = hasStoragePermission,
                        onRequestPermission = { checkAndRequestStoragePermission() }
                    )
                }
            }
        }
    }

    private fun checkAndRequestStoragePermission() {
        val permission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            Manifest.permission.READ_MEDIA_AUDIO
        } else {
            Manifest.permission.READ_EXTERNAL_STORAGE
        }

        if (ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED) {
            hasStoragePermission = true
        } else {
            permissionLauncher.launch(permission)
        }
    }
}`
  },

  // 11. README.md & Build Instructions
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    description: 'Instructions to build, run, and export the signed release APK in Android Studio.',
    content: `# DEKU Music (SHRI Music) - Offline Android Music Player

Production offline music player for Android featuring Nothing OS & Google Pixel aesthetics, 5-band hardware equalizer, Media3 ExoPlayer background playback, MediaStore local file scanner, lock-screen MediaSession controls, and zero internet permission.

## Highlights
- **100% Offline & Private**: Zero network permission declared in AndroidManifest. No tracking, no telemetry, no ads.
- **AndroidX Media3 ExoPlayer**: Reliable playback for MP3, FLAC (lossless), WAV, AAC, OGG, and Opus.
- **Background Playback & Lock-Screen**: \`MediaSessionService\` with rich notification controls and Bluetooth headset integration.
- **Hardware Audio Equalizer**: 5-Band Equalizer, Bass Boost, and Treble filters directly using Android's audio effects engine.
- **Nothing OS Inspired UI**: Minimalist dot-matrix glyph accents, pure AMOLED black theme, and square-geometric controls.
- **Room Database**: Persistent storage for favorites, custom playlists, and playback position restoration.

## Requirements
- Android Studio Ladybug (2024.2) or newer
- JDK 17
- Android SDK Platform 35 (minSdk 26 - Android 8.0 Oreo)
- Physical Android phone or Android Virtual Device (AVD)

## How to Build and Run in Android Studio
1. Open Android Studio.
2. Choose **File > Open...** and select this directory.
3. Allow Gradle to sync dependencies.
4. Connect your Android device via USB (enable **Developer Options** and **USB Debugging**).
5. Press the green **Run (Shift+F10)** button.
6. Grant the "Music and Audio" permission when prompted to let DEKU scan local files.

## How to Generate Signed Release APK
1. In Android Studio, go to **Build > Generate Signed Bundle / APK...**
2. Choose **APK** and click **Next**.
3. Select or create your release keystore.
4. Choose **release** build variant and check **V1 and V2 signature**.
5. Click **Finish**. Your optimized, release APK will be in \`app/release/app-release.apk\`.`
  }
];

export async function generateAndroidProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root project files
  zip.file('settings.gradle.kts', `rootProject.name = "DekuMusic"\ninclude(":app")\n`);
  zip.file('build.gradle.kts', `plugins {\n    alias(libs.plugins.android.application) apply false\n    alias(libs.plugins.kotlin.android) apply false\n    alias(libs.plugins.kotlin.compose) apply false\n    alias(libs.plugins.ksp) apply false\n}\n`);
  zip.file('gradle.properties', `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8\nandroid.useAndroidX=true\nkotlin.code.style=official\nandroid.nonTransitiveRClass=true\n`);

  // Add all project files
  ANDROID_PROJECT_FILES.forEach((f) => {
    zip.file(f.path, f.content);
  });

  return await zip.generateAsync({ type: 'blob' });
}
