import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [items, setItems] = useState<Title[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(
    async (p: number) => {
      const id = ++requestId.current;
      setLoading(true);
      setError(false);
      try {
        const res = await searchTitles({ collection, query: submitted, subject, page: p });
        if (id !== requestId.current) return;
        setItems(prev => (p === 1 ? res.items : [...prev, ...res.items]));
        setTotal(res.total);
        setPage(p);
      } catch {
        if (id === requestId.current) setError(true);
      }
      if (id === requestId.current) setLoading(false);
    },
    [collection, submitted, subject]
  );

  useEffect(() => {
    setItems([]);
    load(1);
  }, [load]);

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
        <TouchableOpacity onPress={() => load(1)}>
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
        onEndReached={() => {
          if (!loading && items.length < total) load(page + 1);
        }}
        ListEmptyComponent={
          !loading && !error ? <Text style={styles.status}>Sin resultados</Text> : null
        }
        ListFooterComponent={loading ? <ActivityIndicator color="#e50914" style={{ margin: 20 }} /> : null}
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
