#!/usr/bin/env node
import fs from "fs"
import { getEntities, getParsedEntity } from "./src/parser.js"

async function main() {
  const args = process.argv
  if (args.length < 3) {
    console.log(`Usage: npx nest-boil <FILE_PATH>`)
    process.exit(1)
  }

  const filePath = process.argv[2]

  try {
    // Parse
    const schemaStr = fs.readFileSync(filePath, "utf-8")
    const entites = getEntities(schemaStr)
    const parsedEntites = getParsedEntity(entites)
  } catch (err) {
    console.error(err)
  }
}

main()
