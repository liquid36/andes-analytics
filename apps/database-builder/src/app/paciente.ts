import { getPacientes, getLocalidades } from './database';

export async function findPaciente(id) {
    const collection = await getPacientes();
    return await collection.findOne({ _id: id });

}
export async function getCoordenadas(paciente) {
    const localidadesCollection = await getLocalidades();
    if (paciente && paciente.direccion && paciente.direccion.length > 0) {
        const d = paciente.direccion[0];
        if (d.geoReferencia) {
            return {
                lat: d.geoReferencia[0],
                lng: d.geoReferencia[1],
                aprox: false
            };
        }
        if (d.ubicacion && d.ubicacion.localidad) {
            const loc = await localidadesCollection.findOne({ nombre: d.ubicacion.localidad.nombre.toLowerCase() });
            if (loc) {
                return { ...loc.location, aprox: true };
            }
        }
    }
    return null;
}

export function getLocalidad(paciente) {
    if (paciente && paciente.direccion && paciente.direccion.length > 0) {
        const d = paciente.direccion[0];
        if (d.ubicacion && d.ubicacion.localidad) {
            return d.ubicacion.localidad.nombre;
        }
    }
    return null;
}