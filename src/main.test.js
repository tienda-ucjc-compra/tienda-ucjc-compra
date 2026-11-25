import { beforeEach, describe, expect, it, vi } from 'vitest';
import mod from './main.js';

describe('ucjc-compra', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('exporta metadatos de carga', () => {
    expect(mod).toEqual({ nombre: 'compra', version: '0.2.0' });
  });

  it('registra el custom element', () => {
    expect(customElements.get('ucjc-compra')).toBeTruthy();
  });

  it('confirma pedido con sesión y líneas (evento canónico)', async () => {
    const el = document.createElement('ucjc-compra');
    document.body.appendChild(el);
    const spy = vi.fn();
    window.addEventListener('ucjc:compra:pedido-confirmado@1', spy);

    window.dispatchEvent(
      new CustomEvent('ucjc:identidad:sesion-cambiada@1', {
        detail: {
          autenticado: true,
          usuario: { id: 'u-1', email: 'a@ucjc.edu', nombre: 'Ana' },
        },
      })
    );
    window.dispatchEvent(
      new CustomEvent('ucjc:descubrimiento:anadir-al-carrito@1', {
        detail: { productoId: 'p1', nombre: 'Camiseta', precio: 10, cantidad: 2 },
      })
    );
    await Promise.resolve();
    el.shadowRoot.querySelector('[data-a="ok"]').click();

    expect(spy).toHaveBeenCalledTimes(1);
    const detail = spy.mock.calls[0][0].detail;
    expect(detail.usuarioId).toBe('u-1');
    expect(detail.total).toBe(20);
    expect(detail.lineas).toHaveLength(1);
    expect(detail.pedidoId).toMatch(/^PED-/);
  });

  const anadir = (detail) =>
    window.dispatchEvent(new CustomEvent('ucjc:descubrimiento:anadir-al-carrito@1', { detail }));

  it('agrupa el mismo artículo en una sola línea "nombre  3 × precio  total"', () => {
    const el = document.createElement('ucjc-compra');
    document.body.appendChild(el);
    anadir({ productoId: 'taza', nombre: 'Taza graduación', precio: 5.99, cantidad: 1 });
    anadir({ productoId: 'taza', nombre: 'Taza graduación', precio: 5.99, cantidad: 2 });

    const lineas = el.shadowRoot.querySelectorAll('li.linea');
    expect(lineas).toHaveLength(1);
    expect(lineas[0].querySelector('.nombre').textContent).toBe('Taza graduación');
    expect(lineas[0].querySelector('.unit').textContent).toBe('3 × 5.99 €');
    expect(lineas[0].querySelector('.sub').textContent).toBe('17.97 €');
  });

  it('con descuento muestra original tachado, % en rojo y precio descontado', () => {
    const el = document.createElement('ucjc-compra');
    document.body.appendChild(el);
    anadir({ productoId: 'taza', nombre: 'Taza graduación', precio: 10, cantidad: 3, descuento: 20 });

    const li = el.shadowRoot.querySelector('li.linea');
    expect(li.querySelector('.tachado').textContent).toBe('10.00 €');
    expect(li.querySelector('.dto').textContent).toBe('-20%');
    expect(li.querySelector('.desc').textContent).toBe('8.00 €');
    expect(li.querySelector('.sub').textContent).toBe('24.00 €');
    expect(el.shadowRoot.querySelector('.total b').textContent).toBe('Total: 24.00 €');
  });

  it('el pedido lleva exactamente los campos de pedido-confirmado@1', () => {
    const el = document.createElement('ucjc-compra');
    document.body.appendChild(el);
    const spy = vi.fn();
    window.addEventListener('ucjc:compra:pedido-confirmado@1', spy);
    window.dispatchEvent(
      new CustomEvent('ucjc:identidad:sesion-cambiada@1', {
        detail: { autenticado: true, usuario: { id: 'u-2', email: 'b@ucjc.edu' } },
      })
    );
    anadir({ productoId: 'p1', nombre: 'Taza', precio: 10, cantidad: 1, descuento: 20 });
    el.shadowRoot.querySelector('[data-a="ok"]').click();
    window.removeEventListener('ucjc:compra:pedido-confirmado@1', spy);

    const detail = spy.mock.calls[0][0].detail;
    expect(Object.keys(detail).sort()).toEqual(['creadoEn', 'lineas', 'pedidoId', 'total', 'usuarioId']);
    expect(new Date(detail.creadoEn).toISOString()).toBe(detail.creadoEn);
    expect(detail.lineas[0]).toEqual({ productoId: 'p1', nombre: 'Taza', precio: 8, cantidad: 1 });
    expect(detail.total).toBe(8);
  });

  it('escucha campana-cambiada@1 y muestra u oculta el aviso', () => {
    const el = document.createElement('ucjc-compra');
    document.body.appendChild(el);
    const campana = (activa) =>
      window.dispatchEvent(
        new CustomEvent('ucjc:descubrimiento:campana-cambiada@1', {
          detail: { activa, codigo: 'black-friday-2026', etiqueta: 'Black Friday UCJC', momento: '2026-11-27T09:00:00+01:00' },
        })
      );
    campana(true);
    expect(el.shadowRoot.querySelector('.campana b').textContent).toBe('Black Friday UCJC');
    expect(el.shadowRoot.querySelector('.box').classList.contains('bf')).toBe(true);
    campana(false);
    expect(el.shadowRoot.querySelector('.campana')).toBeNull();
    expect(el.shadowRoot.querySelector('.box').classList.contains('bf')).toBe(false);
  });

  it('escapa el nombre del producto', () => {
    const el = document.createElement('ucjc-compra');
    document.body.appendChild(el);
    anadir({ productoId: 'x', nombre: '<img src=x onerror=alert(1)>', precio: 1, cantidad: 1 });
    expect(el.shadowRoot.querySelector('img')).toBeNull();
    expect(el.shadowRoot.querySelector('.nombre').textContent).toBe('<img src=x onerror=alert(1)>');
  });

  it('se puede quitar y volver a poner sin error', () => {
    const el = document.createElement('ucjc-compra');
    document.body.appendChild(el);
    el.remove();
    expect(() => document.body.appendChild(el)).not.toThrow();
    expect(el.shadowRoot.querySelector('h2').textContent).toBe('Compra');
  });
});
