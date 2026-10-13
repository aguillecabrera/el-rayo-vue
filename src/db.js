import Dexie from 'dexie'

const db = new Dexie('ElRayoDB')

db.version(1).stores({
  productos: 'id, descripcion, precio, categoria, unidad, ultimaModificacion, cantidad_cpra, codigo, precio_cpra, precio_vta, proveedor'
})

export { db }
