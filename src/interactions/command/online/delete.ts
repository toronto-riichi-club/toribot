import type { ApplicationCommandInteraction, ToriClient } from '#structs'
import type { CommandInteraction } from '#types/interaction'
import {
    type APIApplicationCommandOption,
    type APIEmbed,
    ApplicationCommandOptionType,
    MessageFlags
 } from '@discordjs/core'
 import dayjs from 'dayjs'

export const OnlineDeleteCommand: CommandInteraction = {
    getCommand(): APIApplicationCommandOption {
        return {
            description: 'Delete an online game',
            name: 'delete',
            options: [
                {
                    description: 'The online game to delete',
                    name: 'id',
                    required: true,
                    type: ApplicationCommandOptionType.Number
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }
    },
    async run(interaction: ApplicationCommandInteraction, client: ToriClient): Promise<void> {
        await interaction.defer({ flags: MessageFlags.Ephemeral })

        const id = interaction.getNumberOption('id')
        const onlineGame = await client.database.deleteOnlineGame(interaction.guildId, id)
        const embed: Partial<APIEmbed> = { color: 0xF8F8FF }

        if (!onlineGame)
            embed.description = 'No online game found.'
        else {
            const date = dayjs(onlineGame.date).format('YYYY-MM-DD')
            const count = await client.database.countOnlineGames(interaction.guildId, date)

            if (count === 0n)
                client.cache.guilds.get(interaction.guildId).games.remove(date, 'ONLINE')

            embed.description = `Deleted online game #${ id }!`
        }            

        await interaction.updateReply({ embeds: [embed] })
    }
}