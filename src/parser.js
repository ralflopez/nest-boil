import { buildEntityImport, buildEnumImport } from "./helpers/imports.js"

// Get all entites from json schem
export function getEntities(schemaStr) {
  const schema = JSON.parse(schemaStr)
  return schema.definitions
}

export function getParsedEntity(entities) {
  const entityTypeList = []
  // For every entity
  Object.keys(entities).forEach((entity) => {
    const properties = entities[entity].properties
    const propertyList = Object.keys(properties)
    // Create entity object
    const entityType = {
      columns: [],
      name: entity,
      type: "entity",
      imports: new Set(),
    }
    // Add Columns to the entity object
    propertyList.forEach((property) => {
      entityType.columns.push(
        extractType(entityType, property, properties[property])
      )
    })

    // Add created entity object in list
    entityTypeList.push(entityType)
  })
  console.log(entityTypeList)
  return entityTypeList
}

export function extractType(parent, name, property) {
  const type = Array.isArray(property.type) ? property.type : [property.type]
  const result = {
    defaultValue: property.default,
    isNullable: type.includes("null"),
    isArray: false,
    name,
    type: "",
    entity: parent.name,
    decorators: type.includes("null") ? ["@IsOptional()"] : ["@IsDefined()"],
  }

  if (!property.type) {
    // relation
    result.type = property.anyOf[0].$ref.split("/").pop()
    parent.imports.add(buildEntityImport(result.type))
  } else if (type.includes("array")) {
    if (property.items?.$ref) {
      // array with relations
      result.type = property.items.$ref.split("/").pop()
      parent.imports.add(buildEntityImport(result.type))
      result.isArray = true
    } else if (type.length > 3) {
      // any
      result.type = "any"
    } else {
      // array with primitive type
      result.type = property.items.type
      result.isArray = true
    }
  } else if (
    type.includes("integer") ||
    type.includes("float") ||
    type.includes("number")
  ) {
    // number
    result.decorators.push("@IsNumber()")
    result.type = "number"
  } else if (type.includes("string")) {
    // date
    if (property.format === "date-time") {
      result.decorators.push("@IsDate()")
      result.type = "Date"
    } else if (property.enum) {
      // enum (type ENUM will have enum property)
      const enumName = name.charAt(0).toUpperCase() + name.slice(1)
      parent.imports.add(buildEnumImport(enumName))
      result.type = enumName
      result.enum = property.enum
      result.defaultValue = `${enumName}.${result.defaultValue}`
      result.decorators.push(`@IsEnum(${enumName})`)
    } else {
      // string
      result.decorators.push("@IsString()")
      result.type = "string"
    }
  } else if (type.includes("boolean")) {
    // bool
    result.decorators.push("@IsBoolean()")
    result.type = "boolean"
  }

  return result
}
