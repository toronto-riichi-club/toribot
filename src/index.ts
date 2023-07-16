import { commands } from '#interactions'
import { ToribotClient } from '#structs'
import { handleEvents } from '#events'

const client = new ToribotClient()
const { id } = await client.api.users.getCurrent()
const players = await client.database.players.getPlayers()
const commandJson = [...commands.values()].map(command => command.getCommand())

for (const player of players)
    client.cache.players.insert(player.username, player.userId)

await client.api.applicationCommands.bulkOverwriteGlobalCommands(id, commandJson)
await handleEvents(client)
await client.login()