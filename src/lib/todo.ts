/** Marca una función del esqueleto que aún no está implementada.
    Recibe los parámetros de la función solo para que TypeScript no los marque como sin usar. */
export function notImplemented(what: string, ..._args: unknown[]): never {
  throw new Error(`TODO: implementar ${what}`)
}
