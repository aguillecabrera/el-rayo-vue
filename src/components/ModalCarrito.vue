<template>
  <div class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col p-4">
      <h2 class="text-xl font-bold mb-2">Carrito 🛒</h2>
      <div class="flex-1 overflow-y-auto space-y-3">
        <div v-for="item in carrito.state.items" :key="item.producto.id" class="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <div class="flex-1 min-w-0">
            <p class="font-medium truncate">{{ item.producto.descripcion }}</p>
            <p class="text-sm text-gray-500">{{ item.producto.id }} • ${{ formatearPrecio(item.producto.precio) }}</p>
          </div>
          <div class="flex items-center gap-2 ml-2">
            <button @click="restar(item)" class="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 font-bold">−</button>
            <span class="w-8 text-center">{{ item.cantidad }}</span>
            <button @click="sumar(item)" class="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 font-bold">+</button>
          </div>
          <p class="font-semibold ml-2 w-20 text-right">${{ formatearPrecio(item.subtotal) }}</p>
          <button @click="eliminar(item)" class="ml-2 text-red-500">🗑️</button>
        </div>
        <div v-if="carrito.state.items.length === 0" class="text-center text-gray-400 py-8">
          El carrito está vacío
        </div>
      </div>

      <!-- Descuentos -->
      <div class="border-t pt-3 mt-3 space-y-2">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium">Descuento:</label>
          <select v-model="descuentoTipo" @change="cambiarTipo" class="border rounded px-2 py-1 text-sm">
            <option value="porcentaje">Porcentaje (%)</option>
            <option value="monto">Monto ($)</option>
          </select>
          <input v-model.number="descuentoValor" @input="cambiarValor" type="number" min="0" class="border rounded px-2 py-1 w-20 text-sm" />
        </div>
        <div class="flex justify-between text-sm">
          <span>Subtotal:</span><span>$ {{ formatearPrecio(carrito.state.subtotal) }}</span>
        </div>
        <div class="flex justify-between text-sm text-red-600" v-if="carrito.state.montoDescuento > 0">
          <span>Descuento:</span><span>- $ {{ formatearPrecio(carrito.state.montoDescuento) }}</span>
        </div>
        <div class="flex justify-between text-lg font-bold">
          <span>TOTAL:</span><span>$ {{ formatearPrecio(carrito.state.total) }}</span>
        </div>
      </div>

      <div class="flex gap-3 mt-4">
        <button @click="compartir" class="flex-1 bg-green-600 text-white py-2 rounded-lg">📄 Compartir</button>
        <button @click="limpiar" class="flex-1 bg-red-500 text-white py-2 rounded-lg">🗑️ Limpiar</button>
        <button @click="$emit('cerrar')" class="px-4 py-2 border border-gray-300 rounded-lg">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'

const carrito = inject('carrito')
const emit = defineEmits(['cerrar'])

const descuentoTipo = ref(carrito.state.descuentoTipo)
const descuentoValor = ref(carrito.state.descuentoValor)

function formatearPrecio(val) {
  return val.toFixed(2).replace('.', ',')
}

function sumar(item) {
  carrito.actualizarCantidad(item.producto.id, item.cantidad + 1)
}
function restar(item) {
  if (item.cantidad > 1) carrito.actualizarCantidad(item.producto.id, item.cantidad - 1)
}
function eliminar(item) {
  carrito.eliminarItem(item.producto.id)
}

function cambiarTipo() {
  carrito.setDescuentoTipo(descuentoTipo.value)
}
function cambiarValor() {
  carrito.setDescuentoValor(descuentoValor.value)
}

function limpiar() {
  if (confirm('¿Limpiar carrito?')) {
    carrito.limpiarCarrito()
  }
}

function compartir() {
  if (!navigator.share) {
    alert('Compartir no está disponible en este navegador')
    return
  }
  let texto = '📋 Pedido:\n\n'
  carrito.state.items.forEach(item => {
    texto += `${item.cantidad} x ${item.producto.descripcion} ($${formatearPrecio(item.subtotal)})\n`
  })
  texto += `\nSubtotal: $${formatearPrecio(carrito.state.subtotal)}\n`
  if (carrito.state.montoDescuento > 0) {
    texto += `Descuento: -$${formatearPrecio(carrito.state.montoDescuento)}\n`
  }
  texto += `Total: $${formatearPrecio(carrito.state.total)}\n`
  navigator.share({
    title: 'Pedido El Rayo',
    text: texto
  }).catch(() => {})
}
</script>
