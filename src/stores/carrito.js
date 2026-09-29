import { reactive } from 'vue'

// Estado del carrito
const state = reactive({
  items: [],
  descuentoTipo: 'porcentaje',  // 'porcentaje' | 'monto'
  descuentoValor: 0,
  subtotal: 0,
  montoDescuento: 0,
  total: 0
})

function recalcular() {
  const sub = state.items.reduce((acc, item) => acc + item.subtotal, 0)
  state.subtotal = sub
  let desc = 0
  if (state.descuentoTipo === 'porcentaje') {
    const pct = Math.min(Math.max(state.descuentoValor, 0), 100)
    desc = sub * (pct / 100)
  } else {
    // monto
    desc = Math.min(state.descuentoValor, sub)
  }
  state.montoDescuento = Math.round(desc * 100) / 100
  state.total = Math.round((sub - state.montoDescuento) * 100) / 100
}

// Funciones para manipular el carrito
function agregarProducto(producto, cantidad = 1) {
  const existente = state.items.find(item => item.producto.id === producto.id)
  if (existente) {
    existente.cantidad += cantidad
    existente.subtotal = existente.producto.precio * existente.cantidad
  } else {
    state.items.push({
      producto: { ...producto },
      cantidad,
      subtotal: producto.precio * cantidad
    })
  }
  recalcular()
  guardarLocalStorage()
}

function actualizarCantidad(id, nuevaCantidad) {
  const item = state.items.find(i => i.producto.id === id)
  if (item) {
    item.cantidad = nuevaCantidad
    item.subtotal = item.producto.precio * item.cantidad
    recalcular()
    guardarLocalStorage()
  }
}

function eliminarItem(id) {
  state.items = state.items.filter(i => i.producto.id !== id)
  recalcular()
  guardarLocalStorage()
}

function limpiarCarrito() {
  state.items = []
  state.descuentoTipo = 'porcentaje'
  state.descuentoValor = 0
  recalcular()
  guardarLocalStorage()
}

function guardarLocalStorage() {
  const data = {
    items: state.items.map(i => ({
      producto: i.producto,
      cantidad: i.cantidad,
      subtotal: i.subtotal
    })),
    descuentoTipo: state.descuentoTipo,
    descuentoValor: state.descuentoValor,
    subtotal: state.subtotal,
    montoDescuento: state.montoDescuento,
    total: state.total
  }
  localStorage.setItem('carrito', JSON.stringify(data))
}

function cargarDesdeLocalStorage() {
  const raw = localStorage.getItem('carrito')
  if (raw) {
    try {
      const data = JSON.parse(raw)
      state.items = data.items || []
      state.descuentoTipo = data.descuentoTipo || 'porcentaje'
      state.descuentoValor = data.descuentoValor || 0
      recalcular()
    } catch (e) {
      // ignorar
    }
  }
}

function setDescuentoTipo(tipo) {
  state.descuentoTipo = tipo
  recalcular()
  guardarLocalStorage()
}

function setDescuentoValor(valor) {
  state.descuentoValor = Number(valor) || 0
  recalcular()
  guardarLocalStorage()
}

export function zustandCarrito() {
  return {
    state,
    agregarProducto,
    actualizarCantidad,
    eliminarItem,
    limpiarCarrito,
    guardarLocalStorage,
    cargarDesdeLocalStorage,
    setDescuentoTipo,
    setDescuentoValor
  }
}
