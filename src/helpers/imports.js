export function buildEnumImport(enumName) {
  return `import { ${enumName} } from '../../enums/${enumName}.enum.ts'`
}

export function buildEntityImport(type) {
  return `import { ${type} } from '../../${type.toLowerCase()}/entities/${type.toLowerCase()}.entity.ts`
}
