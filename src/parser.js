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
    }
    // Add Columns to the entity object
    propertyList.forEach((property) => {
      entityType.columns.push(
        extractType(entity, property, properties[property])
      )
    })

    // Add created entity object in list
    entityTypeList.push(entityType)
  })

  return entityTypeList
}

export function extractType(parent, name, property) {
  const type = Array.isArray(property.type) ? property.type : [property.type]
  const result = {
    defaultValue: property.default,
    isNullable: type.includes("null"),
    name,
    type: "",
    entity: parent,
    decorators: type.includes("null") ? ["@IsOptional()"] : ["@IsDefined()"],
  }

  if (!property.type) {
    // relation
    result.type = property.anyOf[0].$ref.split("/").pop()
  } else if (type.includes("array")) {
    if (property.items?.$ref) {
      // array with relations
      result.type = property.items.$ref.split("/").pop()
    } else if (type.length > 3) {
      // any
      result.type = "any"
    } else {
      // array with primitive type
      result.type = property.items.type
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
      // enum
      result.type = property.enum.reduce((prev, cur) => prev + " | " + cur)
      result.decorators.push(`@IsIn(${result.type.replace("|", ",")})`)
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
