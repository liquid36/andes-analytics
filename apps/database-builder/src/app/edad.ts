import * as moment from 'moment';

export function calcularEdad(fechaNacimiento, fechaActual) {
    fechaNacimiento = moment(fechaNacimiento);
    fechaActual = moment(fechaActual);

    return {
        edad: fechaActual.diff(fechaNacimiento, 'years'),
        semanas: fechaActual.diff(fechaNacimiento, 'week')
    };
}