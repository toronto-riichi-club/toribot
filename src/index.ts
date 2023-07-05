import { ToriClient } from '#structs'
import { handleEvents } from './events.js'

const client = new ToriClient()

await handleEvents(client)
await client.login()