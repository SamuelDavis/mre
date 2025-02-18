/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App.tsx";
import Data from "./Data.tsx";
import "@picocss/pico/css/pico.classless.min.css";
import "./index.css";
import { Route, Router } from "@solidjs/router";

render(
	() => (
		<Router>
			<Route path="/" component={App} />
			<Route path="/data" component={Data} />
		</Router>
	),
	document.body,
);
