import type { ToribotClient } from '#structs'
import type { GatewayReadyDispatchData, WithIntrinsicProps } from '@discordjs/core'

export async function handleReady(client: ToribotClient, payload: WithIntrinsicProps<GatewayReadyDispatchData>) {
    const { user } = payload.data

    console.log(`${ user.username }#${ user.discriminator } is online!`)
}