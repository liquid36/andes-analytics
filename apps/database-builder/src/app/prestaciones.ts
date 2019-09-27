export function flatPrestacion(prestacion) {
    let res = [];
    for (let r of prestacion.ejecucion.registros) {
        res = [...res, ...flatRegistros(r, [], [])];
    }
    return res;
}

export function flatRegistros(registro, ancestorsId, ancestorsSctId): any[] {
    const tx = {
        registroId: registro._id,
        valor: registro.valor,
        concepto: registro.concepto,
        ancestorsId,
        ancestorsSctId
    };
    let res = [tx];
    for (let r of registro.registros) {
        const ancestorsIdTemp = [...ancestorsId, r._id];
        const ancestorsSctIdTemp = [...ancestorsSctId, r.concepto.conceptId];
        res = [...res, ...flatRegistros(r, ancestorsIdTemp, ancestorsSctIdTemp)];
    }
    return res;
}