<template>
  <div class="flex flex-col h-full">
    <!-- Filtros -->
    <div class="px-4 py-2 bg-gray-50 border-b">
      <div class="flex gap-2 mb-2">
        <input 
          v-model="terminoBusqueda"
          type="text" 
          placeholder="Buscar producto..."
          class="flex-1 px-3 py-2 border rounded-lg"
        />
      </div>
      <div class="flex gap-2">
        <label class="text-sm font-medium text-gray-700">Proveedor:</label>
        <select v-model="proveedorSeleccionado" class="px-2 py-1 border rounded text-sm">
          <option value="Todos">Todos</option>
          <option value="Domfer">Domfer</option>
          <option value="Gfp">Gfp</option>
          <option value="Venti">Venti</option>
          <option value="Tornillo">Tornillo</option>
          <option value="Rayo">Rayo</option>
        </select>
      </div>
    </div>

    <!-- Lista de productos -->
    <div class="flex-1 overflow-y-auto px-4 py-2 space-y-2">
      <div
        v-for="prod in productosFiltrados"
        :key="prod.id"
        @click="$emit('producto-seleccionado', prod)"
        class="bg-white rounded-lg shadow px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
      >
        <div class="flex-1">
          <div class="flex gap-2 mb-1">
            <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{{ prod.id }}</span>
            <span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{{ prod.proveedor }}</span>
          </div>
          <p class="font-medium text-gray-800">{{ prod.descripcion }}</p>
        </div>
        <p class="font-bold text-lg text-green-700">$ {{ formatearPrecio(prod.precio_vta) }}</p>
      </div>
      <div v-if="productosFiltrados.length === 0 && cargando" class="text-center text-gray-400 py-8">
        Cargando productos...
      </div>
      <div v-else-if="productosFiltrados.length === 0 && !cargando" class="text-center text-gray-400 py-8">
        No se encontraron productos
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { db } from '../db.js'

defineEmits(['producto-seleccionado'])

const productos = ref([])
const cargando = ref(true)
const terminoBusqueda = ref('')
const proveedorSeleccionado = ref('Todos')

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
  let filtrados = productos.value

  // Filtrar por término de búsqueda
  const term = terminoBusqueda.value.toLowerCase().trim()
  if (term) {
    filtrados = filtrados.filter(p =>
      p.id.toLowerCase().includes(term) ||
      p.descripcion.toLowerCase().includes(term) ||
      p.codigo.toLowerCase().includes(term)
    )
  }

  // Filtrar por proveedor
  if (proveedorSeleccionado.value !== 'Todos') {
    filtrados = filtrados.filter(p => p.proveedor === proveedorSeleccionado.value)
  }

  return filtrados
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
