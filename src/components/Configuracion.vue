<template>
  <div class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-bold mb-4">Configuración ⚙️</h2>

      <div class="space-y-4">
        <div>
          <label class="block font-medium text-sm mb-1">Importar archivo (.xlsx o .csv)</label>
          <input type="file" accept=".xlsx,.csv" @change="importarArchivo" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700" />
        </div>

        <div>
          <label class="block font-medium text-sm mb-1">Modo de importación</label>
          <div class="flex gap-4">
            <label><input type="radio" v-model="modoImportacion" value="reemplazar" /> Reemplazar todo</label>
            <label><input type="radio" v-model="modoImportacion" value="merge" /> Actualizar/Merge</label>
          </div>
        </div>

        <div v-if="importando" class="text-blue-600">Importando...</div>
        <div v-if="errorImport" class="text-red-600 text-sm">{{ errorImport }}</div>
        <div v-if="exitoImport" class="text-green-600 text-sm">{{ exitoImport }}</div>

        <hr />

        <button @click="exportarJSON" class="w-full bg-green-100 text-green-800 py-2 rounded-lg">📦 Exportar copia de seguridad (JSON)</button>
        <button @click="vaciarBD" class="w-full bg-red-100 text-red-800 py-2 rounded-lg">🗑️ Vaciar base de datos</button>
      </div>

      <div class="flex justify-end mt-6">
        <button @click="$emit('cerrar')" class="px-6 py-2 bg-gray-800 text-white rounded-lg">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import { db } from '../db.js'

const emit = defineEmits(['cerrar'])
const modoImportacion = ref('merge')
const importando = ref(false)
const errorImport = ref('')
const exitoImport = ref('')

async function importarArchivo(event) {
  const file = event.target.files[0]
  if (!file) return
  importando.value = true
  errorImport.value = ''
  exitoImport.value = ''

  try {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet)

    const productosImportar = []
    for (const row of rows) {
      if (!row.id || !row.descripcion) continue

      const precioVta = parseFloat(String(row.precio_vta ?? '').replace(',', '.')) || 0

      let ultimaModificacion = new Date().toISOString()
      if (row.ultimaModificacion) {
        const fecha = new Date(row.ultimaModificacion)
        if (!isNaN(fecha)) ultimaModificacion = fecha.toISOString()
      }

      const producto = {
        id: String(row.id).trim(),
        cantidad_cpra: Number(row.cantidad_cpra) || 0,
        codigo: row.codigo ? String(row.codigo).trim() : '',
        descripcion: String(row.descripcion).trim(),
        precio_cpra: parseFloat(String(row.precio_cpra ?? '').replace(',', '.')) || 0,
        descuento_cpra: parseFloat(String(row.descuento_cpra ?? '').replace(',', '.')) || 0,
        precio_vta: parseFloat(String(row.precio_vta ?? '').replace(',', '.')) || 0,
        // Se conserva "precio" para que el carrito y el resto de la app sigan funcionando
        precio: parseFloat(String(row.precio_vta ?? '').replace(',', '.')) || 0,
        proveedor: row.proveedor ? String(row.proveedor).trim() : '',
        categoria: row.categoria ? String(row.categoria).trim() : '',
        unidad: row.unidad ? String(row.unidad).trim() : '',
        ultimaModificacion
      }

      productosImportar.push(producto)
    }

    if (modoImportacion.value === 'reemplazar') {
      await db.productos.clear()
    }

    // Transacción
    await db.transaction('rw', db.productos, async () => {
      for (const prod of productosImportar) {
        if (modoImportacion.value === 'merge') {
          const existente = await db.productos.get(prod.id)
          if (existente) {
            await db.productos.update(prod.id, {
              cantidad_cpra: prod.cantidad_cpra,
              codigo: prod.codigo,
              descripcion: prod.descripcion,
              precio_cpra: prod.precio_cpra,
              precio_vta: prod.precio_vta,
              precio: prod.precio_vta,
              proveedor: prod.proveedor,
              categoria: prod.categoria,
              unidad: prod.unidad,
              ultimaModificacion: prod.ultimaModificacion
            })
          } else {
            await db.productos.add(prod)
          }
        } else {
          // reemplazar ya limpió, agregar todos
          await db.productos.add(prod)
        }
      }
    })

    exitoImport.value = `Se importaron ${productosImportar.length} productos correctamente.`
    // Disparar evento para actualizar listas
    window.dispatchEvent(new CustomEvent('db-updated'))
  } catch (e) {
    console.error(e)
    errorImport.value = 'Error al importar: ' + e.message
  } finally {
    importando.value = false
  }
}

async function exportarJSON() {
  const productos = await db.productos.toArray()
  const blob = new Blob([JSON.stringify(productos, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'respaldo_productos.json'
  a.click()
  URL.revokeObjectURL(url)
}

async function vaciarBD() {
  if (confirm('¿Estás seguro de vaciar toda la base de datos?')) {
    await db.productos.clear()
    window.dispatchEvent(new CustomEvent('db-updated'))
    alert('Base de datos vaciada.')
  }
}
</script>
