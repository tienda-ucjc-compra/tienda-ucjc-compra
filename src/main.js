
const EVT_ADD = 'ucjc:descubrimiento:anadir-al-carrito@1';
const EVT_SES = 'ucjc:identidad:sesion-cambiada@1';
const EVT_PED = 'ucjc:compra:pedido-confirmado@1';

const css = `
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
`;

class UcjcCompra extends HTMLElement {
  #lineas = [];
  #usuarioId = null;
  #flash = '';

  #onAdd = (e) => {
    const d = e.detail || {};
    const productoId = String(d.productoId ?? '');
    const nombre = String(d.nombre ?? 'Producto');
    const original = Number(d.precio) || 0;
    const cantidad = Math.max(1, Number(d.cantidad) || 1);
    // descuento opcional en % (0-100). `precio` llega siempre como precio original.
    const descuento = Math.min(100, Math.max(0, Number(d.descuento) || 0));
    const precio = descuento ? Number((original * (1 - descuento / 100)).toFixed(2)) : original;

    // mismo producto y mismo precio -> se suma la cantidad en la misma línea
    const existente = this.#lineas.find(
      (l) => (l.productoId || l.nombre) === (productoId || nombre) && l.precio === precio
    );
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      this.#lineas.push({
        productoId,
        nombre,
        precio,
        cantidad,
        ...(descuento ? { precioOriginal: original, descuento } : {}),
      });
    }
    this.#flash = `Añadido: ${d.nombre || d.productoId}`;
    this.#pintar();
  };

  #onSes = (e) => {
    const d = e.detail || {};
    this.#usuarioId = d.autenticado ? d.usuario?.id ?? null : null;
    this.#pintar();
  };

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    window.addEventListener(EVT_ADD, this.#onAdd);
    window.addEventListener(EVT_SES, this.#onSes);
    this.#pintar();
  }

  disconnectedCallback() {
    window.removeEventListener(EVT_ADD, this.#onAdd);
    window.removeEventListener(EVT_SES, this.#onSes);
  }

  #total() {
    return this.#lineas.reduce((s, l) => s + l.precio * l.cantidad, 0);
  }

  #confirmar() {
    if (!this.#usuarioId || !this.#lineas.length) return;

    const pedidoId = `PED-${Date.now()}`;
    const lineas = this.#lineas.map((l) => ({ ...l }));

    const detail = {
      pedidoId,
      usuarioId: this.#usuarioId,
      creadoEn: new Date().toISOString(),
      total: Number(this.#total().toFixed(2)),
      lineas,
    };

    window.dispatchEvent(new CustomEvent(EVT_PED, { detail }));

    this.#lineas = [];
    this.#flash = `Pedido ${pedidoId} confirmado (${detail.total.toFixed(2)} €)`;
    this.#pintar();
  }

  #pintar() {
    const ses = this.#usuarioId
      ? `Sesión: <b>${this.#usuarioId}</b>`
      : '<span class="aviso-error">Inicio de sesión necesario para realizar el pedido</span>';

    const items = this.#lineas.length
      ? this.#lineas
          .map((l) => {
            const unit = l.descuento
              ? `<span class="tachado">${l.precioOriginal.toFixed(2)} €</span><span class="dto">-${l.descuento}%</span><span class="desc">${l.precio.toFixed(2)} €</span>`
              : `${l.precio.toFixed(2)} €`;
            return `<li class="linea"><span class="nombre">${l.nombre}</span><span class="unit">${l.cantidad} × ${unit}</span><span class="sub">${(l.precio * l.cantidad).toFixed(2)} €</span></li>`;
          })
          .join('')
      : '<li><i>No puedes confirmar el pedido porque el carrito está vacío. Añade al menos un producto desde Descubrimiento o usa el botón «+ producto demo».</i></li>';

    this.shadowRoot.innerHTML = `
      <style>${css}</style>
      <div class="box">
        <h2>Compra</h2>
        <p class="meta">${ses}</p>
        <ul class="lineas">${items}</ul>
        <p><b>Total: ${this.#total().toFixed(2)} €</b></p>
        <div class="row">
          <button type="button" data-a="demo" class="sec">+ producto demo</button>
          <button type="button" data-a="ok" ${this.#usuarioId && this.#lineas.length ? '' : 'disabled'}>
            Confirmar pedido
          </button>
          <button type="button" data-a="vaciar" class="sec" ${this.#lineas.length ? '' : 'disabled'}>Vaciar</button>
        </div>
        <p class="ok">${this.#flash}</p>
      </div>`;

    this.shadowRoot.querySelector('[data-a="demo"]').onclick = () => {
      this.#onAdd({
        detail: {
          productoId: 'prod-demo',
          nombre: 'Camiseta UCJC (demo)',
          precio: 19.99,
          cantidad: 1,
        },
      });
    };

    this.shadowRoot.querySelector('[data-a="ok"]').onclick = () => this.#confirmar();

    this.shadowRoot.querySelector('[data-a="vaciar"]').onclick = () => {
      this.#lineas = [];
      this.#flash = 'Carrito vacío';
      this.#pintar();
    };
  }
}

customElements.define('ucjc-compra', UcjcCompra);

export default { nombre: 'compra', version: '0.2.0' };
