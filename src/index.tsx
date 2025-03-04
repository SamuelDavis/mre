/* @refresh reload */
import { render } from "solid-js/web";
import Home from "./Pages/Home.tsx";
import Data from "./Pages/Data.tsx";
import "@picocss/pico/css/pico.classless.min.css";
// import "./index.css";
import { Route, Router } from "@solidjs/router";
import Layout from "./Pages/Layout.tsx";
import Search from "./Pages/Search.tsx";
import NotFound from "./Pages/NotFound.tsx";
import List from "./Pages/List.tsx";
import App from "./App.tsx";

render(
  () => (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/list" component={List} />
      <Route path="/data" component={Data} />
      <Route path="/app" component={App} />
      <Route path="*404" component={NotFound} />
    </Router>
  ),
  document.body,
);
