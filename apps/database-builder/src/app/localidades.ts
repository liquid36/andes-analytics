import { environment } from '../environments/environment';
import { getPacientes, getLocalidades } from './database';

const googleMapsClient = require('@google/maps').createClient({
    key: environment.GOOGLE_KEY
});

async function geocode(address) {
    return new Promise((resolve, reject) => {
        googleMapsClient.geocode({ address: address }, function (err, response) {
            if (err) { return reject(err) };
            return resolve(response.json.results);
        });
    })
}

async function distinctLocalidades() {
    const pacientesDB = await getPacientes();
    const $pipeline = [
        {
            $unwind: '$direccion'
        },
        {
            $group: {
                _id: '$direccion.ubicacion.localidad.nombre',
                localidad: { $first: '$direccion.ubicacion.localidad.nombre' },
                provincia: { $first: '$direccion.ubicacion.provincia.nombre' },
                pais: { $first: '$direccion.ubicacion.pais.nombre' }
            }
        },
    ];

    return await pacientesDB.aggregate($pipeline, { allowDiskUse: true }).toArray();
}

export async function searchGeocode() {
    const localidadesDB = await getLocalidades();
    const localidades = await distinctLocalidades();
    const prs = localidades.map(async (localidad) => {

        const localidadInDB = await localidadesDB.findOne({ localidad: localidad.localidad });
        if (!localidadInDB) {
            const response = await geocode(`${localidad.localidad}, ${localidad.provincia}, argentina`);

            const location = response[0].geometry.location;

            const LocalidadDTO = {
                localidad: localidad.localidad,
                provincia: localidad.provincia,
                pais: localidad.pais,
                location
            }

            console.log(localidad.localidad, localidad.provincia, localidad.pais, location.lat, location.lng);

            await localidadesDB.insert(LocalidadDTO);
        }
    });
    await Promise.all(prs);
}
