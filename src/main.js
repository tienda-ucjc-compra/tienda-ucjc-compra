
import { REBAJAS, precioRebajado } from './rebajas.js';

const EVT_ADD = 'ucjc:descubrimiento:anadir-al-carrito@1';
const EVT_SES = 'ucjc:identidad:sesion-cambiada@1';
const EVT_PED = 'ucjc:compra:pedido-confirmado@1';
const EVT_CAMPANA = 'ucjc:descubrimiento:campana-cambiada@1';

// los textos que llegan por eventos se escapan antes de meterlos en el HTML
const escapar = (t) =>
  String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const css = `
  :host { display:block; font:15px/1.45 system-ui,sans-serif; color:#152033; }
  .box { background:#f7f9fc; border:1px solid #d7dee8; border-radius:12px; padding:1rem 1.1rem; }
  h2 { margin:0 0 .35rem; font-size:1.1rem; }
  .meta { color:#5b677a; font-size:.85rem; margin-bottom:.75rem; }
  ul { margin:.4rem 0 .8rem; padding-left:1.1rem; }
  li { margin:.2rem 0; }
  li.linea { list-style:none; display:grid; grid-template-columns:1fr auto auto auto; gap:.2rem .9rem; align-items:start; margin:.55rem 0; }
  ul.lineas { padding-left:0; }
  .nombre { word-break:break-word; }
  .unit { text-align:right; white-space:nowrap; }
  .tachado { display:block; text-decoration:line-through; color:#5b677a; }
  .desc { color:#c62828; font-weight:700; }
  .dto { background:#c62828; color:#fff; font-weight:700; font-size:.8rem; border-radius:4px; padding:0 .3rem; margin-left:.35rem; }
  .ctrl { display:flex; gap:.25rem; align-items:center; }
  .cant { min-width:1.6rem; text-align:center; font-weight:700; }
  .ctrl button { padding:.1rem .5rem; min-width:1.8rem; background:#e7ecf3; color:#152033; }
  .ctrl button.quitar { background:transparent; color:#c62828; font-weight:700; }
  .sub { text-align:right; font-weight:700; white-space:nowrap; }
  .row { display:flex; flex-wrap:wrap; gap:.5rem; align-items:center; }
  button { font:inherit; border:0; border-radius:8px; padding:.45rem .85rem; cursor:pointer; background:#0f3d7a; color:#fff; }
  button.sec { background:#e7ecf3; color:#152033; }
  button:disabled { opacity:.45; cursor:not-allowed; }
  .ok { color:#0b6b3a; font-size:.85rem; min-height:1.2em; }

  /* modo Black Friday: se activa al recibir campana-cambiada@1 con activa=true */
  .box.bf { background:#111; border:2px solid #f5c400; color:#f2f2f2; }
  .bf h2 { color:#f5c400; text-transform:uppercase; letter-spacing:.04em; }
  .bf .meta, .bf .tachado { color:#b8b8b8; }
  .bf .desc { color:#ff5a4f; }
  .bf .dto { background:#ff5a4f; color:#111; }
  .bf .ctrl button { background:#333; color:#f2f2f2; }
  .bf .ctrl button.quitar { background:transparent; color:#ff5a4f; }
  .bf .ok { color:#7ddc9b; }
  .bf .aviso-error { color:#ff5a4f; }
  .bf .total { color:#f5c400; font-size:1.1rem; }
  .bf button { background:#f5c400; color:#111; font-weight:700; }
  .bf button.sec { background:#333; color:#f2f2f2; }
  .campana { display:flex; justify-content:space-between; align-items:center; gap:.5rem; flex-wrap:wrap;
    background:#f5c400; color:#111; border-radius:8px; padding:.5rem .8rem; margin:0 0 .75rem; }
  .campana b { font-size:1rem; text-transform:uppercase; }
  .campana span { font-size:.85rem; }

  .aviso-error {
    color:#c62828;
    font-weight:700;
  }
`;

class UcjcCompra extends HTMLElement {
  #lineas = [];
  #usuarioId = null;
  #flash = '';
  #campana = null;

  #onAdd = (e) => {
    const d = e.detail || {};
    const productoId = String(d.productoId ?? '');
    const nombre = String(d.nombre ?? 'Producto');
    const precio = Number(d.precio) || 0;
    const cantidad = Math.max(1, Number(d.cantidad) || 1);
    // en Black Friday el precio llega ya rebajado: si coincide con la rebaja
    // del catálogo guardamos el original y el % para enseñarlos
    const rebaja = this.#campana ? REBAJAS[productoId] : null;
    const enOferta = rebaja && precioRebajado(rebaja.precioOriginal, rebaja.descuento) === precio;

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
        ...(enOferta ? rebaja : {}),
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

  #onCampana = (e) => {
    const d = e.detail || {};
    this.#campana = d.activa ? { codigo: d.codigo, etiqueta: d.etiqueta || 'Campaña activa' } : null;
    this.#pintar();
  };

  connectedCallback() {
    // si el shell quita y vuelve a poner el elemento, el shadowRoot ya existe
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    window.addEventListener(EVT_ADD, this.#onAdd);
    window.addEventListener(EVT_SES, this.#onSes);
    window.addEventListener(EVT_CAMPANA, this.#onCampana);
    this.#pintar();
  }

  disconnectedCallback() {
    window.removeEventListener(EVT_ADD, this.#onAdd);
    window.removeEventListener(EVT_SES, this.#onSes);
    window.removeEventListener(EVT_CAMPANA, this.#onCampana);
  }

  #total() {
    return this.#lineas.reduce((s, l) => s + l.precio * l.cantidad, 0);
  }

  #confirmar() {
    if (!this.#usuarioId || !this.#lineas.length) return;

    const pedidoId = `PED-${Date.now()}`;
    // solo los 4 campos del contrato pedido-confirmado@1
    const lineas = this.#lineas.map(({ productoId, nombre, precio, cantidad }) => ({ productoId, nombre, precio, cantidad }));

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
      ? `Sesión: <b>${escapar(this.#usuarioId)}</b>`
      : '<span class="aviso-error">Inicio de sesión necesario para realizar el pedido</span>';

    const items = this.#lineas.length
      ? this.#lineas
          .map((l, i) => {
            const unit = l.descuento
              ? `<span class="tachado">${l.precioOriginal.toFixed(2)} €</span>${l.cantidad} × <span class="desc">${l.precio.toFixed(2)} €</span><span class="dto">-${l.descuento}%</span>`
              : `${l.cantidad} × ${l.precio.toFixed(2)} €`;
            // con una sola unidad el − se desactiva (para quitarla está la X)
            const masMenos = `<button type="button" data-a="menos" data-i="${i}" title="Quitar una" ${l.cantidad > 1 ? '' : 'disabled'}>−</button><span class="cant">${l.cantidad}</span><button type="button" data-a="mas" data-i="${i}" title="Añadir una">+</button>`;
            return `<li class="linea"><span class="nombre">${escapar(l.nombre)}</span><span class="unit">${unit}</span><span class="sub">${(l.precio * l.cantidad).toFixed(2)} €</span><span class="ctrl">${masMenos}<button type="button" class="quitar" data-a="quitar" data-i="${i}" title="Eliminar del carrito">X</button></span></li>`;
          })
          .join('')
      : '<li><i>No puedes confirmar el pedido porque el carrito está vacío. Añade al menos un producto desde Descubrimiento o usa el botón «+ producto demo».</i></li>';

    this.shadowRoot.innerHTML = `
      <style>${css}</style>
      <div class="box${this.#campana ? ' bf' : ''}">
        <h2>Compra</h2>
        ${this.#campana ? `<p class="campana"><b>${escapar(this.#campana.etiqueta)}</b><span>Los precios del carrito ya llevan la rebaja</span></p>` : ''}
        <p class="meta">${ses}</p>
        <ul class="lineas">${items}</ul>
        <p class="total"><b>Total: ${this.#total().toFixed(2)} €</b></p>
        <div class="row">
          <button type="button" data-a="demo" class="sec">+ producto demo</button>
          <button type="button" data-a="ok" ${this.#usuarioId && this.#lineas.length ? '' : 'disabled'}>
            Confirmar pedido
          </button>
          <button type="button" data-a="vaciar" class="sec" ${this.#lineas.length ? '' : 'disabled'}>Vaciar</button>
        </div>
        <p class="ok">${escapar(this.#flash)}</p>
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

    this.shadowRoot.querySelector('ul.lineas').onclick = (e) => {
      const b = e.target.closest('button[data-i]');
      if (!b) return;
      const l = this.#lineas[Number(b.dataset.i)];
      if (!l) return;
      if (b.dataset.a === 'mas') l.cantidad += 1;
      if (b.dataset.a === 'menos') l.cantidad = Math.max(1, l.cantidad - 1);
      if (b.dataset.a === 'quitar') {
        this.#lineas.splice(Number(b.dataset.i), 1);
        this.#flash = `Eliminado: ${l.nombre}`;
      }
      this.#pintar();
    };

    this.shadowRoot.querySelector('[data-a="vaciar"]').onclick = () => {
      this.#lineas = [];
      this.#flash = 'Carrito vacío';
      this.#pintar();
    };
  }
}

customElements.define('ucjc-compra', UcjcCompra);

export default { nombre: 'compra', version: '0.2.0' };
