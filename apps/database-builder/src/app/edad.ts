import * as moment from 'moment';

const nacional = [0, 1, 2, 6, 10, 15, 50, 100];
const provincial = [0, 1, 5, 15, 20, 40, 70, 100];


export function calcularEdad(fechaNacimiento, fechaActual) {
    fechaNacimiento = moment(fechaNacimiento);
    fechaActual = moment(fechaActual);

    const edad = fechaActual.diff(fechaNacimiento, 'years');

    return {
        edad,
        decada: Math.floor(edad / 10) * 10,
        semanas: fechaActual.diff(fechaNacimiento, 'week'),
        nacional: calcularRango(nacional, edad),
        provincial: calcularRango(provincial, edad),
    };
}

function calcularRango(rango, edad) {
    for (let i = 0; i < rango.length - 1; i++) {
        if (rango[i] <= edad && edad < rango[i + 1]) {
            return rango[i];
        }
    }
    return 100;
}
