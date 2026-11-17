// src/main.js
var e = "ucjc:descubrimiento:anadir-al-carrito@1", t = "ucjc:identidad:sesion-cambiada@1", n = class extends HTMLElement {
	#e = [];
	#t = null;
	#n = "";
	#r = (e) => {
		let t = e.detail || {};
		this.#e.push({
			productoId: String(t.productoId ?? ""),
			nombre: String(t.nombre ?? "Producto"),
			precio: Number(t.precio) || 0,
			cantidad: Math.max(1, Number(t.cantidad) || 1)
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
		let e = this.#t ? `Sesión: ${this.#t}` : "Sin sesión — inicia sesión en Identidad para confirmar", t = this.#e.length ? this.#e.map((e) => `<tr><td>${e.nombre}</td><td class="r">${e.cantidad}</td><td class="r">${(e.precio * e.cantidad).toFixed(2)} €</td></tr>`).join("") : "<tr><td colspan=\"3\" class=\"vacio\">Carrito vacío — espera un «añadir» de Descubrimiento o usa el botón demo</td></tr>";
		this.shadowRoot.innerHTML = `
      <style>
  :host { display:block; font:16px/1.5 Arial,Helvetica,sans-serif; color:#222; }
  header { background:#1f3a63; color:#fff; padding:14px 24px; display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap; }
  header h1 { margin:0; font-size:20px; }
  header span { font-size:14px; }
  main { max-width:640px; margin:28px auto; padding:0 16px; }
  h2 { font-size:20px; margin:0 0 4px; }
  .sub { margin:0 0 16px; color:#555; font-size:14px; }
  .box { background:#fff; border:1px solid #ccc; border-radius:10px; padding:16px; }
  table { width:100%; border-collapse:collapse; }
  th { text-align:left; font-size:13px; color:#555; border-bottom:1px solid #d5d9e0; padding:6px 4px; }
  td { padding:8px 4px; border-bottom:1px solid #eee; }
  .r { text-align:right; }
  .vacio { color:#777; font-style:italic; }
  .total { text-align:right; font-size:18px; margin:14px 0; }
  .row { display:flex; flex-wrap:wrap; gap:8px; }
  button { font:inherit; font-size:15px; padding:8px 16px; border:1px solid #c4c4c4; border-radius:8px; background:#ececec; color:#222; cursor:pointer; }
  button.main { background:#1f3a63; color:#fff; border-color:#1f3a63; margin-left:auto; }
  button:disabled { opacity:.45; cursor:not-allowed; }
  .ok { margin:12px 0 0; font-size:14px; color:#1d6b2f; min-height:1.2em; }
</style>
      <header><h1>UCJC Compra</h1><span>${e}</span></header>
      <main>
        <h2>Carrito</h2>
        <p class="sub">Revisa los productos antes de confirmar el pedido.</p>
        <div class="box">
          <table>
            <tr><th>Producto</th><th class="r">Cantidad</th><th class="r">Precio</th></tr>
            ${t}
          </table>
          <p class="total"><b>Total: ${this.#a().toFixed(2)} €</b></p>
          <div class="row">
            <button type="button" data-a="demo">+ Producto demo</button>
            <button type="button" data-a="vaciar" ${this.#e.length ? "" : "disabled"}>Vaciar</button>
            <button type="button" data-a="ok" class="main" ${this.#t && this.#e.length ? "" : "disabled"}>Confirmar pedido</button>
          </div>
          <p class="ok">${this.#n}</p>
        </div>
      </main>`, this.shadowRoot.querySelector("[data-a=\"demo\"]").onclick = () => {
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
