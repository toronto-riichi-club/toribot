import type { ApplicationCommandInteraction, ToriClient } from '#structs'
import type { CommandInteraction } from '#types/interaction'
import {
    type APIApplicationCommandOption,
    type APIEmbed,
    ApplicationCommandOptionType,
    MessageFlags
} from '@discordjs/core'
import dayjs from 'dayjs'

export const OnlineRecordCommand: CommandInteraction = {
    getCommand(): APIApplicationCommandOption {
        return {
            description: 'Record an online game',
            name: 'record',
            options: [
                {
                    description: 'The Tenhou URL',
                    name: 'url',
                    required: true,
                    type: ApplicationCommandOptionType.String
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }
    },
    async run(interaction: ApplicationCommandInteraction, client: ToriClient): Promise<void> {
        await interaction.defer({ flags: MessageFlags.Ephemeral })

        const url = interaction.getStringOption('url')
        const embed: Partial<APIEmbed> = { color: 0xF8F8FF }
        
        if (!/^https?:\/\/tenhou.net\/\d\/\?log=(?<log>.+)&.*$/g.test(url))
            embed.description = 'The provided URL is not a Tenhou URL.'
        else {
            const onlineGame = await client.database.insertOnlineGame(interaction.guildId, url)
            const date = dayjs(onlineGame.date).format('YYYY-MM-DD')

            client.cache.guilds.get(interaction.guildId).games.insert(date, 'ONLINE')
            embed.description = `Recorded online game #${ onlineGame.id }!`
        }

        await interaction.updateReply({ embeds: [embed] })
    }
}