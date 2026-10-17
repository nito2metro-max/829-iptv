import { CatalogScreen } from '@/components/media/catalog-screen';
import { SERIES_COLLECTION, SERIES_GENRES } from '@/constants/iptv';

export default function SeriesScreen() {
  return (
    <CatalogScreen
      heading="Series"
      collection={SERIES_COLLECTION}
      genres={SERIES_GENRES}
      kind="series"
    />
  );
}
