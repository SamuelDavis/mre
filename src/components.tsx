import { useMatch } from "@solidjs/router";
import {
	type ComponentProps,
	For,
	type ValidComponent,
	children,
	splitProps,
} from "solid-js";

type ExtendProps<
	Parent extends ValidComponent,
	Props extends Record<string, unknown> = Record<string, unknown>,
	Except extends keyof ComponentProps<Parent> = never,
> = Omit<ComponentProps<Parent>, keyof Props & Except> & Props;

export function Nav(props: ExtendProps<"nav">) {
	const [local, parent] = splitProps(props, ["children"]);
	const getChildren = children(() => local.children).toArray;
	return (
		<nav {...parent}>
			<ul>
				<For each={getChildren()}>{(child) => <li>{child}</li>}</For>
			</ul>
		</nav>
	);
}

export function Link(props: ExtendProps<"a">) {
	const getMatch = useMatch(() => props.href ?? Math.random().toString(36));
	const getIsCurrent = () => Boolean(getMatch());
	return <a aria-current={getIsCurrent()} {...props} />;
}
