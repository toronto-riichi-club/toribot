import { commands } from '#interactions'
import type { ToribotClient } from '#structs'
import type { GatewayReadyDispatchData, WithIntrinsicProps } from '@discordjs/core'

export async function handleReady(client: ToribotClient, payload: WithIntrinsicProps<GatewayReadyDispatchData>) {
    const { user } = payload.data
    const commandJson = [...commands.values()].map(command => command.getCommand())

    await client.api.applicationCommands.bulkOverwriteGlobalCommands(user.id, commandJson)

    console.log(`${ user.username }#${ user.discriminator } is online!`)
}