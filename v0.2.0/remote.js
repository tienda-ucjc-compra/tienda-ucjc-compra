// src/rebajas.js
var e = {
	"prod-101": {
		precioOriginal: 19.99,
		descuento: 20
	},
	"prod-102": {
		precioOriginal: 39.95,
		descuento: 30
	},
	"prod-104": {
		precioOriginal: 55,
		descuento: 25
	},
	"prod-105": {
		precioOriginal: 29.9,
		descuento: 15
	},
	"prod-107": {
		precioOriginal: 9.95,
		descuento: 40
	}
}, t = (e, t) => Math.round(e * (100 - t)) / 100, n = "ucjc:descubrimiento:anadir-al-carrito@1", r = "ucjc:identidad:sesion-cambiada@1", i = "ucjc:compra:pedido-confirmado@1", a = "ucjc:descubrimiento:campana-cambiada@1", o = (e) => String(e ?? "").replace(/[&<>"']/g, (e) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[e]), s = "\n  :host { display:block; font:15px/1.45 system-ui,sans-serif; color:#152033; }\n  .box { background:#f7f9fc; border:1px solid #d7dee8; border-radius:12px; padding:1rem 1.1rem; }\n  h2 { margin:0 0 .35rem; font-size:1.1rem; }\n  .meta { color:#5b677a; font-size:.85rem; margin-bottom:.75rem; }\n  ul { margin:.4rem 0 .8rem; padding-left:1.1rem; }\n  li { margin:.2rem 0; }\n  li.linea { list-style:none; display:grid; grid-template-columns:1fr auto auto auto; gap:.2rem .9rem; align-items:start; margin:.55rem 0; }\n  ul.lineas { padding-left:0; }\n  .nombre { word-break:break-word; }\n  .unit { text-align:right; white-space:nowrap; }\n  .tachado { display:block; text-decoration:line-through; color:#5b677a; }\n  .desc { color:#c62828; font-weight:700; }\n  .dto { background:#c62828; color:#fff; font-weight:700; font-size:.8rem; border-radius:4px; padding:0 .3rem; margin-left:.35rem; }\n  .ctrl { display:flex; gap:.25rem; }\n  .ctrl button { padding:.1rem .5rem; min-width:1.8rem; background:#e7ecf3; color:#152033; }\n  .ctrl button.quitar { background:transparent; color:#c62828; font-weight:700; }\n  .sub { text-align:right; font-weight:700; white-space:nowrap; }\n  .row { display:flex; flex-wrap:wrap; gap:.5rem; align-items:center; }\n  button { font:inherit; border:0; border-radius:8px; padding:.45rem .85rem; cursor:pointer; background:#0f3d7a; color:#fff; }\n  button.sec { background:#e7ecf3; color:#152033; }\n  button:disabled { opacity:.45; cursor:not-allowed; }\n  .ok { color:#0b6b3a; font-size:.85rem; min-height:1.2em; }\n\n  /* modo Black Friday: se activa al recibir campana-cambiada@1 con activa=true */\n  .box.bf { background:#111; border:2px solid #f5c400; color:#f2f2f2; }\n  .bf h2 { color:#f5c400; text-transform:uppercase; letter-spacing:.04em; }\n  .bf .meta, .bf .tachado { color:#b8b8b8; }\n  .bf .desc { color:#ff5a4f; }\n  .bf .dto { background:#ff5a4f; color:#111; }\n  .bf .ctrl button { background:#333; color:#f2f2f2; }\n  .bf .ctrl button.quitar { background:transparent; color:#ff5a4f; }\n  .bf .ok { color:#7ddc9b; }\n  .bf .aviso-error { color:#ff5a4f; }\n  .bf .total { color:#f5c400; font-size:1.1rem; }\n  .bf button { background:#f5c400; color:#111; font-weight:700; }\n  .bf button.sec { background:#333; color:#f2f2f2; }\n  .campana { display:flex; justify-content:space-between; align-items:center; gap:.5rem; flex-wrap:wrap;\n    background:#f5c400; color:#111; border-radius:8px; padding:.5rem .8rem; margin:0 0 .75rem; }\n  .campana b { font-size:1rem; text-transform:uppercase; }\n  .campana span { font-size:.85rem; }\n\n  .aviso-error {\n    color:#c62828;\n    font-weight:700;\n  }\n", c = class extends HTMLElement {
	#e = [];
	#t = null;
	#n = "";
	#r = null;
	#i = (n) => {
		let r = n.detail || {}, i = String(r.productoId ?? ""), a = String(r.nombre ?? "Producto"), o = Number(r.precio) || 0, s = Math.max(1, Number(r.cantidad) || 1), c = this.#r ? e[i] : null, l = c && t(c.precioOriginal, c.descuento) === o, u = this.#e.find((e) => (e.productoId || e.nombre) === (i || a) && e.precio === o);
		u ? u.cantidad += s : this.#e.push({
			productoId: i,
			nombre: a,
			precio: o,
			cantidad: s,
			...l ? c : {}
		}), this.#n = `Añadido: ${r.nombre || r.productoId}`, this.#l();
	};
	#a = (e) => {
		let t = e.detail || {};
		this.#t = t.autenticado ? t.usuario?.id ?? null : null, this.#l();
	};
	#o = (e) => {
		let t = e.detail || {};
		this.#r = t.activa ? {
			codigo: t.codigo,
			etiqueta: t.etiqueta || "Campaña activa"
		} : null, this.#l();
	};
	connectedCallback() {
		this.shadowRoot || this.attachShadow({ mode: "open" }), window.addEventListener(n, this.#i), window.addEventListener(r, this.#a), window.addEventListener(a, this.#o), this.#l();
	}
	disconnectedCallback() {
		window.removeEventListener(n, this.#i), window.removeEventListener(r, this.#a), window.removeEventListener(a, this.#o);
	}
	#s() {
		return this.#e.reduce((e, t) => e + t.precio * t.cantidad, 0);
	}
	#c() {
		if (!this.#t || !this.#e.length) return;
		let e = `PED-${Date.now()}`, t = this.#e.map(({ productoId: e, nombre: t, precio: n, cantidad: r }) => ({
			productoId: e,
			nombre: t,
			precio: n,
			cantidad: r
		})), n = {
			pedidoId: e,
			usuarioId: this.#t,
			creadoEn: (/* @__PURE__ */ new Date()).toISOString(),
			total: Number(this.#s().toFixed(2)),
			lineas: t
		};
		window.dispatchEvent(new CustomEvent(i, { detail: n })), this.#e = [], this.#n = `Pedido ${e} confirmado (${n.total.toFixed(2)} €)`, this.#l();
	}
	#l() {
		let e = this.#t ? `Sesión: <b>${o(this.#t)}</b>` : "<span class=\"aviso-error\">Inicio de sesión necesario para realizar el pedido</span>", t = this.#e.length ? this.#e.map((e, t) => {
			let n = e.descuento ? `<span class="tachado">${e.precioOriginal.toFixed(2)} €</span>${e.cantidad} × <span class="desc">${e.precio.toFixed(2)} €</span><span class="dto">-${e.descuento}%</span>` : `${e.cantidad} × ${e.precio.toFixed(2)} €`, r = `<button type="button" data-a="menos" data-i="${t}" title="Quitar una" ${e.cantidad > 1 ? "" : "disabled"}>−</button><button type="button" data-a="mas" data-i="${t}" title="Añadir una">+</button>`;
			return `<li class="linea"><span class="nombre">${o(e.nombre)}</span><span class="unit">${n}</span><span class="sub">${(e.precio * e.cantidad).toFixed(2)} €</span><span class="ctrl">${r}<button type="button" class="quitar" data-a="quitar" data-i="${t}" title="Eliminar del carrito">X</button></span></li>`;
		}).join("") : "<li><i>No puedes confirmar el pedido porque el carrito está vacío. Añade al menos un producto desde Descubrimiento o usa el botón «+ producto demo».</i></li>";
		this.shadowRoot.innerHTML = `
      <style>${s}</style>
      <div class="box${this.#r ? " bf" : ""}">
        <h2>Compra</h2>
        ${this.#r ? `<p class="campana"><b>${o(this.#r.etiqueta)}</b><span>Los precios del carrito ya llevan la rebaja</span></p>` : ""}
        <p class="meta">${e}</p>
        <ul class="lineas">${t}</ul>
        <p class="total"><b>Total: ${this.#s().toFixed(2)} €</b></p>
        <div class="row">
          <button type="button" data-a="demo" class="sec">+ producto demo</button>
          <button type="button" data-a="ok" ${this.#t && this.#e.length ? "" : "disabled"}>
            Confirmar pedido
          </button>
          <button type="button" data-a="vaciar" class="sec" ${this.#e.length ? "" : "disabled"}>Vaciar</button>
        </div>
        <p class="ok">${o(this.#n)}</p>
      </div>`, this.shadowRoot.querySelector("[data-a=\"demo\"]").onclick = () => {
			this.#i({ detail: {
				productoId: "prod-demo",
				nombre: "Camiseta UCJC (demo)",
				precio: 19.99,
				cantidad: 1
			} });
		}, this.shadowRoot.querySelector("[data-a=\"ok\"]").onclick = () => this.#c(), this.shadowRoot.querySelector("ul.lineas").onclick = (e) => {
			let t = e.target.closest("button[data-i]");
			if (!t) return;
			let n = this.#e[Number(t.dataset.i)];
			n && (t.dataset.a === "mas" && (n.cantidad += 1), t.dataset.a === "menos" && (n.cantidad = Math.max(1, n.cantidad - 1)), t.dataset.a === "quitar" && (this.#e.splice(Number(t.dataset.i), 1), this.#n = `Eliminado: ${n.nombre}`), this.#l());
		}, this.shadowRoot.querySelector("[data-a=\"vaciar\"]").onclick = () => {
			this.#e = [], this.#n = "Carrito vacío", this.#l();
		};
	}
};
customElements.define("ucjc-compra", c);
var l = {
	nombre: "compra",
	version: "0.2.0"
};
export { l as default };
