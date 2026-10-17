/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
  return {
    usuario: locals.usuario,
    tema: locals.tema,
  };
}
