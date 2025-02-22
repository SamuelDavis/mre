/* @refresh reload */
import { render } from "solid-js/web";
import Home from "./Home.tsx";
import Data from "./Data.tsx";
import "@picocss/pico/css/pico.classless.min.css";
import "./index.css";
import { Route, Router } from "@solidjs/router";
import Layout from "./Layout.tsx";
import Search from "./Search.tsx";
import { NotFound } from "./NotFound.tsx";

render(
  () => (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/data" component={Data} />
      <Route path="*404" component={NotFound} />
    </Router>
  ),
  document.body,
);
