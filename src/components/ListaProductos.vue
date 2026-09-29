<template>
  <div class="flex-1 overflow-y-auto px-4 py-2 space-y-2">
    <div
      v-for="prod in productosFiltrados"
      :key="prod.id"
      @click="$emit('producto-seleccionado', prod)"
      class="bg-white rounded-lg shadow px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
    >
      <div>
        <p class="text-sm text-gray-500">{{ prod.id }}</p>
        <p class="font-medium text-gray-800">{{ prod.descripcion }}</p>
      </div>
      <p class="font-bold text-lg text-green-700">$ {{ formatearPrecio(prod.precio) }}</p>
    </div>
    <div v-if="productosFiltrados.length === 0 && cargando" class="text-center text-gray-400 py-8">
      Cargando productos...
    </div>
    <div v-else-if="productosFiltrados.length === 0 && !cargando" class="text-center text-gray-400 py-8">
      No se encontraron productos
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { db } from '../db.js'

const props = defineProps({
  termino: String
})
defineEmits(['producto-seleccionado'])

const productos = ref([])
const cargando = ref(true)

onMounted(async () => {
  await cargarProductos()
})

async function cargarProductos() {
  try {
    cargando.value = true
    productos.value = await db.productos.toArray()
  } catch (e) {
    console.error('Error cargando productos', e)
    productos.value = []
  } finally {
    cargando.value = false
  }
}

const productosFiltrados = computed(() => {
  const term = (props.termino || '').toLowerCase().trim()
  if (!term) return productos.value
  return productos.value.filter(p =>
    p.id.toLowerCase().includes(term) ||
    p.descripcion.toLowerCase().includes(term)
  )
})

// Escuchar cuando se actualiza la BD
watch(() => productos.value, () => {}) // para refresco externo
window.addEventListener('db-updated', async () => {
  await cargarProductos()
})

function formatearPrecio(precio) {
  return precio.toFixed(2).replace('.', ',')
}
</script>
