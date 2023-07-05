import type { ApplicationCommandInteraction, ToriClient } from '#structs'
import type { CommandInteraction } from '#types/interaction'
import {
    type APIApplicationCommandOption,
    type APIEmbed,
    ApplicationCommandOptionType,
    MessageFlags
 } from '@discordjs/core'
 import dayjs from 'dayjs'

export const OnlineUpdateCommand: CommandInteraction = {
    getCommand(): APIApplicationCommandOption {
        return {
            description: 'Update the date or URL for an online game',
            name: 'update',
            options: [
                {
                    description: 'The online game to update',
                    name: 'id',
                    required: true,
                    type: ApplicationCommandOptionType.Number
                },
                {
                    description: 'The Tenhou URL',
                    name: 'url',
                    required: false,
                    type: ApplicationCommandOptionType.String
                },
                {
                    description: 'The date (in "YYYY-MM-DD" format)',
                    name: 'date',
                    required: false,
                    type: ApplicationCommandOptionType.String
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }
    },
    async run(interaction: ApplicationCommandInteraction, client: ToriClient): Promise<void> {
        await interaction.defer({ flags: MessageFlags.Ephemeral })

        const id = interaction.getNumberOption('id')
        const url = interaction.getStringOption('url')
        const date = interaction.getStringOption('date')
        const embed: Partial<APIEmbed> = { color: 0xF8F8FF }
        const onlineGame = await client.database.readOnlineGame(interaction.guildId, id)

        if (!onlineGame) 
            embed.description = 'No online game found.'
        else if (!url && !date)
            embed.description = 'No URL or date provided.'
        else if (url && !/^https?:\/\/tenhou.net\/\d\/\?log=(?<log>.+)&.*$/g.test(url))
            embed.description = 'The provided URL is not a Tenhou URL.'
        else if (date && (!/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(date) || !dayjs(date, {}, true).isValid()))
            embed.description = 'The provided date is not a valid date.'
        else {
            await client.database.updateOnlineGame(interaction.guildId, id, { date, url })

            embed.description = `Updated online game #${ id }!`
        }

        if (date) {
            const guildGames = client.cache.guilds.get(interaction.guildId).games
            const oldDate = dayjs(onlineGame.date).format('YYYY-MM-DD')
            const count = await client.database.countOnlineGames(interaction.guildId, oldDate)
    
            if (count === 0n)
                guildGames.remove(oldDate, 'ONLINE')
    
            guildGames.insert(date, 'ONLINE')
        }
        
        await interaction.updateReply({ embeds: [embed] })
    }
}