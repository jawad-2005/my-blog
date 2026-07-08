import { useSyncExternalStore as w, useCallback as V } from "react";
function E({ update: e, notify: t, unwatched: s }) {
  return {
    link: a,
    unlink: g,
    propagate: C,
    checkDirty: P,
    shallowPropagate: x
  };
  function a(n, i, f) {
    const d = i.depsTail;
    if (d !== void 0 && d.dep === n)
      return;
    const u = d !== void 0 ? d.nextDep : i.deps;
    if (u !== void 0 && u.dep === n) {
      u.version = f, i.depsTail = u;
      return;
    }
    const l = n.subsTail;
    if (l !== void 0 && l.version === f && l.sub === i)
      return;
    const r = i.depsTail = n.subsTail = {
      version: f,
      dep: n,
      sub: i,
      prevDep: d,
      nextDep: u,
      prevSub: l,
      nextSub: void 0
    };
    u !== void 0 && (u.prevDep = r), d !== void 0 ? d.nextDep = r : i.deps = r, l !== void 0 ? l.nextSub = r : n.subs = r;
  }
  function g(n, i = n.sub) {
    const f = n.dep, d = n.prevDep, u = n.nextDep, l = n.nextSub, r = n.prevSub;
    return u !== void 0 ? u.prevDep = d : i.depsTail = d, d !== void 0 ? d.nextDep = u : i.deps = u, l !== void 0 ? l.prevSub = r : f.subsTail = r, r !== void 0 ? r.nextSub = l : (f.subs = l) === void 0 && s(f), u;
  }
  function C(n) {
    let i = n.nextSub, f;
    e: do {
      const d = n.sub;
      let u = d.flags;
      if (u & 60 ? u & 12 ? u & 4 ? !(u & 48) && A(n, d) ? (d.flags = u | 40, u &= 1) : u = 0 : d.flags = u & -9 | 32 : u = 0 : d.flags = u | 32, u & 2 && t(d), u & 1) {
        const l = d.subs;
        if (l !== void 0) {
          const r = (n = l).nextSub;
          r !== void 0 && (f = { value: i, prev: f }, i = r);
          continue;
        }
      }
      if ((n = i) !== void 0) {
        i = n.nextSub;
        continue;
      }
      for (; f !== void 0; )
        if (n = f.value, f = f.prev, n !== void 0) {
          i = n.nextSub;
          continue e;
        }
      break;
    } while (!0);
  }
  function P(n, i) {
    let f, d = 0, u = !1;
    e: do {
      const l = n.dep, r = l.flags;
      if (i.flags & 16)
        u = !0;
      else if ((r & 17) === 17) {
        if (e(l)) {
          const c = l.subs;
          c.nextSub !== void 0 && x(c), u = !0;
        }
      } else if ((r & 33) === 33) {
        (n.nextSub !== void 0 || n.prevSub !== void 0) && (f = { value: n, prev: f }), n = l.deps, i = l, ++d;
        continue;
      }
      if (!u) {
        const c = n.nextDep;
        if (c !== void 0) {
          n = c;
          continue;
        }
      }
      for (; d--; ) {
        const c = i.subs, y = c.nextSub !== void 0;
        if (y ? (n = f.value, f = f.prev) : n = c, u) {
          if (e(i)) {
            y && x(c), i = n.sub;
            continue;
          }
          u = !1;
        } else
          i.flags &= -33;
        i = n.sub;
        const T = n.nextDep;
        if (T !== void 0) {
          n = T;
          continue e;
        }
      }
      return u;
    } while (!0);
  }
  function x(n) {
    do {
      const i = n.sub, f = i.flags;
      (f & 48) === 32 && (i.flags = f | 16, (f & 6) === 2 && t(i));
    } while ((n = n.nextSub) !== void 0);
  }
  function A(n, i) {
    let f = i.depsTail;
    for (; f !== void 0; ) {
      if (f === n)
        return !0;
      f = f.prevDep;
    }
    return !1;
  }
}
let v = 0, o = 0, h = 0, b;
const p = [], { link: m, unlink: I, propagate: M, checkDirty: R, shallowPropagate: j } = E({
  update(e) {
    return e.depsTail !== void 0 ? B(e) : O(e);
  },
  notify(e) {
    var a;
    let t = h, s = t;
    do
      if (p[t++] = e, e.flags &= -3, e = (a = e.subs) == null ? void 0 : a.sub, e === void 0 || !(e.flags & 2))
        break;
    while (!0);
    for (h = t; s < --t; ) {
      const g = p[s];
      p[s++] = p[t], p[t] = g;
    }
  },
  unwatched(e) {
    e.flags & 1 ? e.depsTail !== void 0 && (e.depsTail = void 0, e.flags = 17, S(e)) : q.call(e);
  }
});
function D(e) {
  const t = b;
  return b = e, t;
}
function z(e) {
  return H.bind({
    currentValue: e,
    pendingValue: e,
    subs: void 0,
    subsTail: void 0,
    flags: 1
  });
}
function L(e) {
  const t = {
    fn: e,
    subs: void 0,
    subsTail: void 0,
    deps: void 0,
    depsTail: void 0,
    flags: 6
  }, s = D(t);
  s !== void 0 && m(t, s, 0);
  try {
    t.fn();
  } finally {
    b = s, t.flags &= -5;
  }
  return J.bind(t);
}
function B(e) {
  ++v, e.depsTail = void 0, e.flags = 5;
  const t = D(e);
  try {
    const s = e.value;
    return s !== (e.value = e.getter(s));
  } finally {
    b = t, e.flags &= -5, S(e);
  }
}
function O(e) {
  return e.flags = 1, e.currentValue !== (e.currentValue = e.pendingValue);
}
function F(e) {
  const t = e.flags;
  if (t & 16 || t & 32 && R(e.deps, e)) {
    ++v, e.depsTail = void 0, e.flags = 6;
    const s = D(e);
    try {
      e.fn();
    } finally {
      b = s, e.flags &= -5, S(e);
    }
  } else
    e.flags = 2;
}
function G() {
  try {
    for (; o < h; ) {
      const e = p[o];
      p[o++] = void 0, F(e);
    }
  } finally {
    for (; o < h; ) {
      const e = p[o];
      p[o++] = void 0, e.flags |= 10;
    }
    o = 0, h = 0;
  }
}
function H(...e) {
  var t;
  if (e.length) {
    if (this.pendingValue !== (this.pendingValue = e[0])) {
      this.flags = 17;
      const s = this.subs;
      s !== void 0 && (M(s), G());
    }
  } else {
    if (this.flags & 16 && O(this)) {
      const a = this.subs;
      a !== void 0 && j(a);
    }
    let s = b;
    for (; s !== void 0; ) {
      if (s.flags & 3) {
        m(this, s, v);
        break;
      }
      s = (t = s.subs) == null ? void 0 : t.sub;
    }
    return this.currentValue;
  }
}
function J() {
  q.call(this);
}
function q() {
  this.depsTail = void 0, this.flags = 0, S(this);
  const e = this.subs;
  e !== void 0 && I(e);
}
function S(e) {
  const t = e.depsTail;
  let s = t !== void 0 ? t.nextDep : e.deps;
  for (; s !== void 0; )
    s = I(s, e);
}
var N = z;
function Q(e) {
  let t = w((a) => {
    let g = L(() => {
      e(), a();
    });
    return () => g();
  }, () => e(), () => e()), s = V((a) => {
    e(typeof a == "function" ? a(e()) : a);
  }, []);
  return [t, s];
}
function U(e) {
  return w((t) => {
    let s = L(() => {
      e(), t();
    });
    return () => s();
  }, () => e(), () => e());
}
function W(e) {
  return V((t) => {
    e(typeof t == "function" ? t(e()) : t);
  }, []);
}
function X(e) {
  return { value: () => e(), setValue: (t) => {
    e(typeof t == "function" ? t(e()) : t);
  } };
}
export {
  W as S,
  Q as V,
  U as b,
  X as v,
  N as y
};
