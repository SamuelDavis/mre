import { lazy, onCleanup, onMount } from "solid-js";
import { Route, HashRouter as Router } from "@solidjs/router";
import Layout from "./Pages/Layout";
import { AppStateProvider } from "./AppState";
import { rateLimitInterval, usage } from "./util";

const Home = lazy(() => import("./Pages/Home"));
const Search = lazy(() => import("./Pages/Search"));
const List = lazy(() => import("./Pages/List"));
const Suggest = lazy(() => import("./Pages/Suggest"));
const NotFound = lazy(() => import("./Pages/NotFound"));

export default function App() {
  onMount(() => {
    const interval = setInterval(() => usage.clear(), rateLimitInterval);
    onCleanup(() => clearInterval(interval));
  });
  return (
    <AppStateProvider>
      <Router root={Layout}>
        <Route path="/" component={Home} />
        <Route path="/search" component={Search} />
        <Route path="/list" component={List} />
        <Route path="/suggest" component={Suggest} />
        <Route path="*404" component={NotFound} />
      </Router>
    </AppStateProvider>
  );
}
