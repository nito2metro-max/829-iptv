import { CatalogScreen } from '@/components/media/catalog-screen';
import { MOVIE_GENRES, MOVIES_COLLECTION } from '@/constants/iptv';

export default function MoviesScreen() {
  return (
    <CatalogScreen
      heading="Películas"
      collection={MOVIES_COLLECTION}
      genres={MOVIE_GENRES}
      kind="movie"
    />
  );
}
