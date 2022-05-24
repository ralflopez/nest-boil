#!/usr/bin/env node
import fs from "fs"

async function main() {
  const args = process.argv
  if (args.length < 3) {
    console.log(`Usage: npx nest-boil <FILE_PATH>`)
    process.exit(1)
  }

  const filePath = process.argv[2]

  try {
    const schema = fs.readFileSync(filePath, "utf-8")
    console.log(schema)
  } catch (err) {
    console.error(err)
  }
}

main()
