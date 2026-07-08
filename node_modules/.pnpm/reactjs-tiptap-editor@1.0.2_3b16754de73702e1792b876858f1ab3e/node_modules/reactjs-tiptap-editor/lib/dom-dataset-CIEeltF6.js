function d(e) {
  try {
    return JSON.stringify(e);
  } catch {
    return JSON.stringify({});
  }
}
function p(e, s = !1) {
  return (r) => {
    const o = e.startsWith("data-") ? e : `data-${e}`;
    let t = decodeURIComponent(r.getAttribute(o));
    if (t == null || typeof t == "string" && t === "null")
      try {
        const c = r.outerHTML.match(/([\S\s])+?="([\S\s])+?"/g);
        c && c.length > 0 && (t = (c.map((a) => a.trim()).reduce((a, u) => {
          const i = u.indexOf("="), f = [u.slice(0, i), u.slice(i + 1).slice(1, -1)];
          return a[f[0]] = f[1], a;
        }, {})[e.toLowerCase()] || "").replaceAll("&quot;", '"'));
      } catch (l) {
        console.error("Error getDatasetAttribute ", l.message, r);
      }
    if (s)
      try {
        return JSON.parse(t);
      } catch {
        return {};
      }
    if (t.includes("%") || t.includes("auto"))
      return t;
    const n = Number.parseInt(t);
    return n !== n ? t : n;
  };
}
function h(e) {
  const { attrs: s } = e;
  return Object.keys(s).reduce((r, o) => {
    const t = s[o];
    if (t == null)
      return r;
    let n = "";
    return typeof t == "object" ? n = d(t) : n = t, r[o] = n, r;
  }, /* @__PURE__ */ Object.create(null));
}
export {
  p as g,
  h as n
};
