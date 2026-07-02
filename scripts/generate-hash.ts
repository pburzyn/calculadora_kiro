/**
 * Script de utilidad para generar password hashes.
 * Uso: npx tsx scripts/generate-hash.ts <password>
 */
import { createHash } from 'crypto'

const password = process.argv[2]

if (!password) {
  console.error('Uso: npx tsx scripts/generate-hash.ts <password>')
  process.exit(1)
}

const hash = createHash('sha256').update(password).digest('hex')
console.log(`Password: ${password}`)
console.log(`SHA-256:  ${hash}`)
