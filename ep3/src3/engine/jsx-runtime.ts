/** Автоматический JSX-рантайм для esbuild (jsxImportSource = src3/engine). */
import {h, Fragment, renderToString} from "./svg";

const make = (type: any, props: any, key?: any) => h(type, key === undefined ? props : {...props, key});

export const jsx = make;
export const jsxs = make;
export const jsxDEV = (type: any, props: any, key?: any) => make(type, props, key);
export {Fragment, renderToString};
export default {jsx, jsxs, jsxDEV, Fragment, renderToString};
