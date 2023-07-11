import { commands } from '#interactions'
import { ToribotClient } from '#structs'
import { handleEvents } from '#events'

const client = new ToribotClient()
const { id } = await client.api.users.getCurrent()
const commandJson = [...commands.values()].map(command => command.getCommand())

await client.api.applicationCommands.bulkOverwriteGlobalCommands(id, commandJson)
await handleEvents(client)
await client.login()