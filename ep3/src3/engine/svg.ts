/**
 * Мини-движок JSX → строка SVG (без React).
 * Рендер кадра = чистая функция времени, поэтому никакого DOM не нужно.
 */
export type VNode = {type: any; props: any; children: any[]};

const KEBAB = (s: string) => s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const clampByte = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

/** Заменяет невалидные числа на 0, чтобы в SVG не попало NaN/Infinity. */
const num = (v: number) => (Number.isFinite(v) ? String(Math.round(v * 1000) / 1000) : "0");

export function h(type: any, props: any, ...children: any[]): any {
  return {type, props: props || {}, children};
}

export const Fragment = "g";

/** Разворачивает вложенные массивы/фрагменты в плоский список детей. */
function flat(child: any, out: any[]) {
  if (child === null || child === undefined || child === false || child === true) return;
  if (Array.isArray(child)) {
    for (const c of child) flat(c, out);
    return;
  }
  out.push(child);
}

export function renderToString(node: any): string {
  const kids: any[] = [];
  flat(node, kids);
  let out = "";
  for (const k of kids) {
    if (k === null || k === undefined || k === false) continue;
    if (typeof k === "string" || typeof k === "number") {
      out += esc(String(k));
      continue;
    }
    if (Array.isArray(k)) {
      out += renderToString(k);
      continue;
    }
    out += renderNode(k);
  }
  return out;
}

function renderNode(n: any): string {
  if (n === null || n === undefined || n === false) return "";
  if (typeof n === "function") return renderNode(n());
  if (Array.isArray(n)) return renderToString(n);
  if (typeof n !== "object" || !("type" in n)) return esc(String(n));
  const {type, props, children} = n as VNode;
  if (typeof type === "function") {
    // Компонент: вызываем и рендерим результат.
    // ВАЖНО: у JSX-рантайма дети лежат в props.children, поэтому пустой
    // массив из h() не должен затирать их.
    const kids = children.length ? children : (props as any)?.children;
    return renderToString(type({...props, children: kids}));
  }
  const attrs: string[] = [];
  // tag/Props: react-подобные обёртки не должны протекать в разметку
  const SKIP = new Set(["key", "children", "tag", "Props"]);
  for (const k of Object.keys(props || {})) {
    const v = (props as any)[k];
    if (v === undefined || v === null || v === false) continue;
    if (SKIP.has(k)) continue;
    if (k === "style" && typeof v === "object") {
      attrs.push(`style="${Object.keys(v).map((p) => `${KEBAB(p)}:${v[p]}`).join(";")}"`);
      continue;
    }
    const name = k === "className" ? "class" : KEBAB(k);
    const val = typeof v === "number" ? num(v) : String(v);
    attrs.push(`${name}="${esc(val).replace(/"/g, "&quot;")}"`);
  }
  const inner = renderToString(children && children.length ? children : props?.children ?? null);
  if (type === "g" && inner === "" ) return "";
  if (inner === "" && !SELF_CLOSING.has(type)) return `<${type}${attrs.length ? " " + attrs.join(" ") : ""}/>`;
  return `<${type}${attrs.length ? " " + attrs.join(" ") : ""}>${inner}</${type}>`;
}

const SELF_CLOSING = new Set(["path", "rect", "circle", "ellipse", "line", "polygon", "polyline", "stop", "image", "use"]);

/**
 * Обёртка кадра.
 *
 * ВАЖНО (проверено эмпирически): resvg паникует (abort без исключения), если
 * viewBox узкий/смещённый и какой-то элемент целиком лежит вне видимой области —
 * например горизонтальная линия пола за кадром при zoom > 1. Поэтому камера
 * задаётся transform'ом внутри документа, а viewBox всегда полный.
 */
export function svgDoc(
  camera: {cx: number; cy: number; zoom: number},
  body: any,
  extraDefs?: any,
): string {
  const bodyStr = renderToString(body);
  const defsStr = extraDefs ? renderToString(extraDefs) : "";
  // Камеру применяет Timeline (только к сцене), оверлеи и субтитры остаются
  // в экранных координатах — иначе текст уезжает вместе с зумом.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><rect x="0" y="0" width="1080" height="1920" fill="#05070f"/>${defsStr}${bodyStr}</svg>`;
}
