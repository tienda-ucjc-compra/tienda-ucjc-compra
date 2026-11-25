// Copia provisional de los descuentos de Black Friday de Descubrimiento
// (tienda-ucjc-descubrimiento/src/productos.js, commit 0ae6c52).
// El evento anadir-al-carrito@1 solo trae el precio ya rebajado, así que
// Compra necesita esta tabla para enseñar el precio original y el %.
// Quitar cuando el contrato traiga el precio original.
export const REBAJAS = {
  'prod-101': { precioOriginal: 19.99, descuento: 20 },
  'prod-102': { precioOriginal: 39.95, descuento: 30 },
  'prod-104': { precioOriginal: 55.0, descuento: 25 },
  'prod-105': { precioOriginal: 29.9, descuento: 15 },
  'prod-107': { precioOriginal: 9.95, descuento: 40 },
};

// mismo redondeo que usa Descubrimiento
export const precioRebajado = (original, descuento) =>
  Math.round(original * (100 - descuento)) / 100;
