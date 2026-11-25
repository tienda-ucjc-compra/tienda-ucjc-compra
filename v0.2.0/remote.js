// src/main.js
var e = "ucjc:descubrimiento:anadir-al-carrito@1", t = "ucjc:identidad:sesion-cambiada@1", n = class extends HTMLElement {
	#e = [];
	#t = null;
	#n = "";
	#r = (e) => {
		let t = e.detail || {}, n = String(t.productoId ?? ""), r = String(t.nombre ?? "Producto"), i = Number(t.precio) || 0, a = Math.max(1, Number(t.cantidad) || 1), o = Math.min(100, Math.max(0, Number(t.descuento) || 0)), s = o ? Number((i * (1 - o / 100)).toFixed(2)) : i, c = this.#e.find((e) => (e.productoId || e.nombre) === (n || r) && e.precio === s);
		c ? c.cantidad += a : this.#e.push({
			productoId: n,
			nombre: r,
			precio: s,
			cantidad: a,
			...o ? {
				precioOriginal: i,
				descuento: o
			} : {}
		}), this.#n = `Añadido: ${t.nombre || t.productoId}`, this.#s();
	};
	#i = (e) => {
		let t = e.detail || {};
		this.#t = t.autenticado ? t.usuario?.id ?? null : null, this.#s();
	};
	connectedCallback() {
		this.attachShadow({ mode: "open" }), window.addEventListener(e, this.#r), window.addEventListener(t, this.#i), this.#s();
	}
	disconnectedCallback() {
		window.removeEventListener(e, this.#r), window.removeEventListener(t, this.#i);
	}
	#a() {
		return this.#e.reduce((e, t) => e + t.precio * t.cantidad, 0);
	}
	#o() {
		if (!this.#t || !this.#e.length) return;
		let e = `PED-${Date.now()}`, t = this.#e.map((e) => ({ ...e })), n = {
			pedidoId: e,
			usuarioId: this.#t,
			creadoEn: (/* @__PURE__ */ new Date()).toISOString(),
			total: Number(this.#a().toFixed(2)),
			lineas: t
		};
		window.dispatchEvent(new CustomEvent("ucjc:compra:pedido-confirmado@1", { detail: n })), this.#e = [], this.#n = `Pedido ${e} confirmado (${n.total.toFixed(2)} €)`, this.#s();
	}
	#s() {
		let e = this.#t ? `Sesión: <b>${this.#t}</b>` : "<span class=\"aviso-error\">Inicio de sesión necesario para realizar el pedido</span>", t = this.#e.length ? this.#e.map((e) => {
			let t = e.descuento ? `<span class="tachado">${e.precioOriginal.toFixed(2)} €</span><span class="dto">-${e.descuento}%</span><span class="desc">${e.precio.toFixed(2)} €</span>` : `${e.precio.toFixed(2)} €`;
			return `<li class="linea"><span class="nombre">${e.nombre}</span><span class="unit">${e.cantidad} × ${t}</span><span class="sub">${(e.precio * e.cantidad).toFixed(2)} €</span></li>`;
		}).join("") : "<li><i>No puedes confirmar el pedido porque el carrito está vacío. Añade al menos un producto desde Descubrimiento o usa el botón «+ producto demo».</i></li>";
		this.shadowRoot.innerHTML = `
      <style>
  :host { display:block; font:15px/1.45 system-ui,sans-serif; color:#152033; }
  .box { background:#f7f9fc; border:1px solid #d7dee8; border-radius:12px; padding:1rem 1.1rem; }
  h2 { margin:0 0 .35rem; font-size:1.1rem; }
  .meta { color:#5b677a; font-size:.85rem; margin-bottom:.75rem; }
  ul { margin:.4rem 0 .8rem; padding-left:1.1rem; }
  li { margin:.2rem 0; }
  li.linea { list-style:none; display:grid; grid-template-columns:1fr auto auto; gap:.2rem .9rem; align-items:start; margin:.55rem 0; }
  ul.lineas { padding-left:0; }
  .nombre { word-break:break-word; }
  .unit { text-align:right; white-space:nowrap; }
  .tachado { text-decoration:line-through; color:#5b677a; }
  .dto { color:#c62828; font-weight:700; margin-left:.35rem; }
  .desc { display:block; }
  .sub { text-align:right; font-weight:700; white-space:nowrap; }
  .row { display:flex; flex-wrap:wrap; gap:.5rem; align-items:center; }
  button { font:inherit; border:0; border-radius:8px; padding:.45rem .85rem; cursor:pointer; background:#0f3d7a; color:#fff; }
  button.sec { background:#e7ecf3; color:#152033; }
  button:disabled { opacity:.45; cursor:not-allowed; }
  .ok { color:#0b6b3a; font-size:.85rem; min-height:1.2em; }

  .aviso-error {
    color:#c62828;
    font-weight:700;
  }
</style>
      <div class="box">
        <h2>Compra</h2>
        <p class="meta">${e}</p>
        <ul class="lineas">${t}</ul>
        <p><b>Total: ${this.#a().toFixed(2)} €</b></p>
        <div class="row">
          <button type="button" data-a="demo" class="sec">+ producto demo</button>
          <button type="button" data-a="ok" ${this.#t && this.#e.length ? "" : "disabled"}>
            Confirmar pedido
          </button>
          <button type="button" data-a="vaciar" class="sec" ${this.#e.length ? "" : "disabled"}>Vaciar</button>
        </div>
        <p class="ok">${this.#n}</p>
      </div>`, this.shadowRoot.querySelector("[data-a=\"demo\"]").onclick = () => {
			this.#r({ detail: {
				productoId: "prod-demo",
				nombre: "Camiseta UCJC (demo)",
				precio: 19.99,
				cantidad: 1
			} });
		}, this.shadowRoot.querySelector("[data-a=\"ok\"]").onclick = () => this.#o(), this.shadowRoot.querySelector("[data-a=\"vaciar\"]").onclick = () => {
			this.#e = [], this.#n = "Carrito vacío", this.#s();
		};
	}
};
customElements.define("ucjc-compra", n);
var r = {
	nombre: "compra",
	version: "0.2.0"
};
export { r as default };
