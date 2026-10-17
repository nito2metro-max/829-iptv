import { ResizeMode, Video } from 'expo-av';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ▶️ Reproductor universal: HLS (m3u8) para TV en vivo y MP4 para películas/series */
export default function PlayerScreen() {
  const router = useRouter();
  const { uri, title, referrer, userAgent } = useLocalSearchParams<{
    uri: string;
    title?: string;
    referrer?: string;
    userAgent?: string;
  }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headers: Record<string, string> = {};
  if (referrer) headers.Referer = referrer;
  if (userAgent) headers['User-Agent'] = userAgent;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.videoBox}>
        <Video
          source={{ uri, headers }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onReadyForDisplay={() => setLoading(false)}
          onPlaybackStatusUpdate={s => {
            if (s.isLoaded && s.isPlaying) setLoading(false);
          }}
          onError={e => {
            setLoading(false);
            setError(String(e));
          }}
        />
        {loading && !error && <ActivityIndicator size="large" color="#e50914" />}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>No se pudo reproducir</Text>
            <Text style={styles.errorText}>
              La señal puede estar caída o bloqueada en tu región. Prueba con otro canal.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
  back: { color: '#fff', fontSize: 22 },
  title: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1 },
  videoBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorBox: { padding: 24, alignItems: 'center' },
  errorTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 6 },
  errorText: { color: '#999', textAlign: 'center' },
});
