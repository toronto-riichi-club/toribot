import type { ApplicationCommandInteraction, ToriClient } from '#structs'
import type { CommandInteraction } from '#types/interaction'
import {
    type APIEmbed,
    ApplicationCommandType,
    type RESTPostAPIApplicationCommandsJSONBody,
    MessageFlags
} from '@discordjs/core'

export const LatencyCommand: CommandInteraction = {
    getCommand(): RESTPostAPIApplicationCommandsJSONBody {
        return {
            description: 'Check Discord API latency',
            name: 'latency',
            options: [],
            type: ApplicationCommandType.ChatInput
        }
    },    
    async run(interaction: ApplicationCommandInteraction, client: ToriClient): Promise<void> {
        await interaction.defer({ flags: MessageFlags.Ephemeral })

        const response = await interaction.response()
        const responseUnixMilliseconds = Number((BigInt(response.id) >> 22n) + 1420070400000n)
        const interactionUnixMilliseconds = Number((BigInt(interaction.id) >> 22n) + 1420070400000n)
        const rtt = responseUnixMilliseconds - interactionUnixMilliseconds
        const rttFormatted = rtt
            .toString()
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
        const description = client.ping
            ? `💟 **Heartbeat**: ${ client.ping } ms\n🔂 **RTT**: ${ rttFormatted } ms`
            : `🔂 **RTT**: ${ rttFormatted } ms`
        const embed: Partial<APIEmbed> = { color: 0xF8F8FF, description }

        await interaction.updateReply({ embeds: [embed] })
    }
}