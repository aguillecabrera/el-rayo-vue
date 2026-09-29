import Dexie from 'dexie'

const db = new Dexie('ElRayoDB')

db.version(1).stores({
  productos: 'id, descripcion, precio, categoria, unidad, ultimaModificacion'
})

export { db }
