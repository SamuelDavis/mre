import { useList } from "../AppState";
import MediaList from "../Components/MediaList";

export default function List() {
  const { get } = useList();
  return (
    <article>
      <MediaList items={get()} />
    </article>
  );
}
