/**
 * Valida un RUT chileno (con o sin puntos/guión)
 * @param {string} rut - El RUT a validar
 * @returns {boolean} - True si el RUT es válido
 */
const validarRUT = (rut) => {
  if (!rut || typeof rut !== 'string') return false;

  // Limpiamos el RUT de puntos y guiones
  let valor = rut.replace(/\./g, '').replace('-', '').toUpperCase();

  // Extraemos el cuerpo y el dígito verificador
  let cuerpo = valor.slice(0, -1);
  let dv = valor.slice(-1);

  // Validamos que el cuerpo sea un número
  if (cuerpo.length < 7) return false;

  // Calcular el dígito verificador esperado
  let suma = 0;
  let multiplo = 2;

  for (let i = 1; i <= cuerpo.length; i++) {
    let index = multiplo * valor.charAt(cuerpo.length - i);
    suma += index;
    if (multiplo < 7) {
      multiplo += 1;
    } else {
      multiplo = 2;
    }
  }

  let dvEsperado = 11 - (suma % 11);
  dv = dv === 'K' ? 10 : parseInt(dv);
  dvEsperado = dvEsperado === 11 ? 0 : dvEsperado === 10 ? 10 : dvEsperado;

  return dv === dvEsperado;
};

/**
 * Limpia el RUT para dejarlo en formato estandarizado (XX.XXX.XXX-X)
 */
const formatRUT = (rut) => {
  if (!rut) return rut;
  
  // Limpiar todo lo que no sea número o K
  let valor = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  
  if (valor.length < 2) return valor;

  let cuerpo = valor.slice(0, -1);
  let dv = valor.slice(-1);
  
  // Formatear cuerpo con puntos
  let result = '';
  for (let i = cuerpo.length - 1, j = 0; i >= 0; i--, j++) {
    result = cuerpo.charAt(i) + (j > 0 && j % 3 === 0 ? '.' : '') + result;
  }
  
  return `${result}-${dv}`;
};

module.exports = { validarRUT, formatRUT };
