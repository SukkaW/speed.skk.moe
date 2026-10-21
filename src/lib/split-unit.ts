/** xbits returns "140 MiB"; the value and unit are typeset separately. */
export function splitUnit(pretty: string) {
  const [value, unit] = pretty.split(' ', 2);
  return { value, unit };
}
