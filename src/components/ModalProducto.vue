<template>
  <div class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
      <h2 class="text-lg font-bold mb-2">{{ producto.descripcion }}</h2>
      <p class="text-sm text-gray-500 mb-1">Código: {{ producto.id }}</p>
      <p class="text-2xl font-bold text-green-700 mb-4">$ {{ formatearPrecio(producto.precio) }}</p>

      <div class="flex items-center gap-4 mb-4">
        <button @click="decrementar" class="w-10 h-10 rounded-full bg-gray-200 text-xl font-bold">−</button>
        <input v-model.number="cantidad" type="number" min="1" class="w-16 text-center border rounded-lg text-lg" />
        <button @click="incrementar" class="w-10 h-10 rounded-full bg-gray-200 text-xl font-bold">+</button>
      </div>
      <p class="text-right text-lg font-semibold">Subtotal: $ {{ formatearPrecio(producto.precio * cantidad) }}</p>

      <div class="flex gap-3 mt-6">
        <button @click="$emit('agregar', { producto, cantidad })" class="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium">Agregar al Carrito 🛒</button>
        <button @click="$emit('cerrar')" class="px-4 py-2 border border-gray-300 rounded-lg">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  producto: Object
})
const emit = defineEmits(['agregar', 'cerrar'])

const cantidad = ref(1)

function incrementar() {
  cantidad.value++
}
function decrementar() {
  if (cantidad.value > 1) cantidad.value--
}

function formatearPrecio(val) {
  return val.toFixed(2).replace('.', ',')
}
</script>
