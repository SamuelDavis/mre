import type { ExtendProps } from "@samueldavis/solidlib";
import { Show, splitProps } from "solid-js";
import type { Title } from "../Lib/model";
import Img from "./Img";
import ListToggle from "./ListToggle";

export default function TitleCard(props: ExtendProps<"article", { title: Title }>) {
  const [local, parent] = splitProps(props, ["title"]);
  const getYear = (): string => local.title.date.slice(0, 4);
  const getHref = (): string =>
    `https://www.themoviedb.org/${local.title.media}/${local.title.id}`;

  return (
    <article {...parent}>
      <div class="flex gap-4">
        <Img
          type="poster"
          size="w154"
          path={local.title.poster_path}
          class="w-20 self-start sm:w-28"
        />
        <div class="min-w-0">
          <header class="mb-2">
            <strong>{local.title.name}</strong>{" "}
            <small>
              <Show when={getYear()}>{getYear()} · </Show>
              {local.title.media}
            </small>
          </header>
          <p class="line-clamp-3 text-sm">{local.title.overview}</p>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <ListToggle mediaKey={local.title.key} />
            <a target="_blank" href={getHref()}>
              TMDB
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
