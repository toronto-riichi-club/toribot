import { handleInteractionCreate } from './interactionCreate.js'
import { handleReady } from './ready.js'
import type { ToribotClient } from '#structs'
import { GatewayDispatchEvents } from '@discordjs/core'

export async function handleEvents(client: ToribotClient) {
    client.on(GatewayDispatchEvents.InteractionCreate, async payload => await handleInteractionCreate(client, payload))
    client.on(GatewayDispatchEvents.Ready, async payload => await handleReady(client, payload))
}