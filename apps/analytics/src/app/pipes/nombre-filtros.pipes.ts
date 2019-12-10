import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'label' })
export class NombreFiltrosPipe implements PipeTransform {
    transform(value: any): any {
        if (value.type === 'organizacion') {
            let nombreOrganizacion = value.nombre.toLocaleLowerCase();
            // Se reemplazan nombres de organización por abreviaturas
            if (nombreOrganizacion.indexOf('hospital') !== -1) {
                nombreOrganizacion = nombreOrganizacion.replace('hospital', 'HOSP.');
            } else if (nombreOrganizacion.indexOf('centro de salud') !== -1) {
                nombreOrganizacion = nombreOrganizacion.replace('centro de salud', 'CS.');
            } else if (nombreOrganizacion.indexOf('puesto sanitario') !== -1) {
                nombreOrganizacion = nombreOrganizacion.replace('puesto sanitario', 'PS.');
            }
            // Cortar del guion "-" en adelante
            // Max 30 caracteres
            if (nombreOrganizacion.indexOf('-') !== -1) {
                nombreOrganizacion = nombreOrganizacion.substr(0, nombreOrganizacion.indexOf('-'));
                nombreOrganizacion = nombreOrganizacion.substring(0, 30);
            }
            return nombreOrganizacion.toLocaleUpperCase();
        } else {
            return value.nombre;
        }
    }
}