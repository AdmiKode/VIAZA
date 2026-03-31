package com.ikviaza.app

import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class MyFirebaseMessagingService : FirebaseMessagingService() {

    companion object {
        private const val TAG = "VIAZAfcm"
    }

    /**
     * Se invoca cuando Firebase genera o rota el token FCM.
     * Persiste el token en Supabase (tabla push_tokens) vía HTTP directo,
     * sin depender de la capa React/Capacitor.
     *
     * Esto cubre el caso de token rotado cuando el usuario ya tiene sesión
     * pero no ha vuelto a abrir la app (Capacitor no puede capturar la rotación).
     */
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "FCM Token nuevo/rotado: $token")

        // Persiste en Supabase en background — sin bloquear el hilo principal
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val supabaseUrl = getString(R.string.supabase_url)
                val anonKey    = getString(R.string.supabase_anon_key)

                // SharedPreferences: busca el JWT de sesión activa guardado por Capacitor Preferences
                val prefs = applicationContext.getSharedPreferences(
                    "CapacitorStorage", MODE_PRIVATE
                )
                val sessionJson = prefs.getString("supabase.auth.token", null)
                val accessToken = if (sessionJson != null) {
                    try {
                        JSONObject(sessionJson).optString("access_token", "")
                    } catch (_: Exception) { "" }
                } else ""

                // Upsert en push_tokens — si no hay sesión activa, se salta (token se registra
                // cuando el usuario haga login a través del flujo Capacitor normal)
                if (accessToken.isBlank()) {
                    Log.d(TAG, "onNewToken: sin sesión activa, token se registrará en próximo login")
                    return@launch
                }

                val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)
                sdf.timeZone = TimeZone.getTimeZone("UTC")
                val nowIso = sdf.format(Date())

                val body = JSONObject().apply {
                    put("token", token)
                    put("platform", "android")
                    put("is_active", true)
                    put("last_seen_at", nowIso)
                }.toString()

                val url = URL("$supabaseUrl/rest/v1/push_tokens")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.setRequestProperty("apikey", anonKey)
                conn.setRequestProperty("Authorization", "Bearer $accessToken")
                conn.setRequestProperty("Prefer", "resolution=merge-duplicates")
                conn.doOutput = true
                conn.connectTimeout = 8000
                conn.readTimeout = 8000

                OutputStreamWriter(conn.outputStream).use { it.write(body) }

                val code = conn.responseCode
                if (code in 200..299) {
                    Log.d(TAG, "onNewToken: token persistido en Supabase (HTTP $code)")
                } else {
                    Log.w(TAG, "onNewToken: Supabase respondió HTTP $code")
                }
                conn.disconnect()
            } catch (e: Exception) {
                Log.w(TAG, "onNewToken: error al persistir token — ${e.message}")
            }
        }
    }

    /**
     * Se invoca cuando la app está en foreground y llega una push remota.
     */
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Log.d(TAG, "FCM mensaje recibido — from: ${remoteMessage.from}")
        remoteMessage.notification?.let {
            Log.d(TAG, "  título: ${it.title}")
            Log.d(TAG, "  body:   ${it.body}")
        }
        remoteMessage.data.takeIf { it.isNotEmpty() }?.let {
            Log.d(TAG, "  data:   $it")
        }
    }
}
