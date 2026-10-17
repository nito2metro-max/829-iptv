import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chips } from '@/components/media/chips';
import { posterUrl, searchTitles, Title } from '@/hooks/archive';

type Props = {
  heading: string;
  collection: string;
  genres: { label: string; subject: string }[];
  kind: 'movie' | 'series';
};

/* 🎬 Catálogo en cuadrícula (compartido por Películas y Series) */
export function CatalogScreen({ heading, collection, genres, kind }: Props) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const columns = width > 700 ? 5 : 3;
  const itemWidth = (width - 16 * 2 - 10 * (columns - 1)) / columns;

  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [subject, setSubject] = useState('');
  const [data, setData] = useState<{
    key: string;
    items: Title[];
    total: number;
    page: number;
    error: boolean;
  }>({ key: '', items: [], total: 0, page: 0, error: false });
  const [loadingMore, setLoadingMore] = useState(false);
  const [retry, setRetry] = useState(0);

  // Cada combinación de búsqueda + género es una lista distinta
  const key = `${submitted}|${subject}|${retry}`;

  useEffect(() => {
    let alive = true;
    searchTitles({ collection, query: submitted, subject, page: 1 })
      .then(res => alive && setData({ key, items: res.items, total: res.total, page: 1, error: false }))
      .catch(() => alive && setData({ key, items: [], total: 0, page: 0, error: true }));
    return () => {
      alive = false;
    };
  }, [collection, submitted, subject, key]);

  const current = data.key === key;
  const items = current ? data.items : [];
  const error = current && data.error;
  const loading = !current || loadingMore;

  const loadMore = async () => {
    if (loading || items.length >= data.total) return;
    setLoadingMore(true);
    try {
      const res = await searchTitles({ collection, query: submitted, subject, page: data.page + 1 });
      setData(d => (d.key === key ? { ...d, items: [...d.items, ...res.items], page: d.page + 1 } : d));
    } catch {
      // Se reintenta la próxima vez que se llegue al final
    }
    setLoadingMore(false);
  };

  const renderItem = ({ item }: { item: Title }) => (
    <TouchableOpacity
      style={{ width: itemWidth }}
      onPress={() => router.push({ pathname: '/title/[id]', params: { id: item.identifier, kind } })}>
      <Image
        source={{ uri: posterUrl(item.identifier) }}
        style={[styles.poster, { height: itemWidth * 1.45 }]}
        contentFit="cover"
        transition={200}
      />
      <Text style={styles.itemTitle} numberOfLines={2}>
        {item.title}
      </Text>
      {item.year ? <Text style={styles.year}>{item.year}</Text> : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.heading}>{heading}</Text>
      <View style={styles.searchBox}>
        <TextInput
          placeholder={`Buscar ${heading.toLowerCase()}`}
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => setSubmitted(query)}
          returnKeyType="search"
          style={styles.input}
        />
      </View>
      <Chips
        options={genres.map(g => ({ label: g.label, value: g.subject }))}
        value={subject}
        onChange={setSubject}
      />

      {error && (
        <TouchableOpacity onPress={() => setRetry(r => r + 1)}>
          <Text style={styles.status}>Error de conexión. Toca para reintentar.</Text>
        </TouchableOpacity>
      )}

      <FlatList
        key={columns}
        data={items}
        numColumns={columns}
        keyExtractor={item => item.identifier}
        renderItem={renderItem}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={styles.grid}
        onEndReachedThreshold={0.5}
        onEndReached={loadMore}
        ListEmptyComponent={
          !loading && !error ? <Text style={styles.status}>Sin resultados</Text> : undefined
        }
        ListFooterComponent={loading ? <ActivityIndicator color="#e50914" style={{ margin: 20 }} /> : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  heading: { color: '#fff', fontSize: 28, fontWeight: '800', marginHorizontal: 16, marginTop: 8 },
  searchBox: {
    margin: 16,
    marginTop: 12,
    backgroundColor: '#111',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  input: { height: 44, color: '#fff', fontSize: 16 },
  grid: { paddingHorizontal: 16, paddingBottom: 40, gap: 16 },
  poster: { width: '100%', borderRadius: 8, backgroundColor: '#1a1a1a' },
  itemTitle: { color: '#fff', fontSize: 12, fontWeight: '600', marginTop: 6 },
  year: { color: '#888', fontSize: 11 },
  status: { color: '#888', textAlign: 'center', margin: 20 },
});
