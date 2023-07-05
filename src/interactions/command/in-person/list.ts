import type { ApplicationCommandInteraction, ToriClient } from '#structs'
import type { CommandInteraction } from '#types/interaction'
import {
    type APIApplicationCommandOption,
    type APIEmbed,
    type APIEmbedField,
    ApplicationCommandOptionType,
    MessageFlags
 } from '@discordjs/core'
import type{ InPersonGameLocation } from '@prisma/client'

export const InPersonListCommand: CommandInteraction = {
    getCommand(): APIApplicationCommandOption {
        return {
            description: 'List in-person games (by date)',
            name: 'list',
            options: [
                {
                    autocomplete: true,
                    description: 'The date to look for',
                    name: 'date',
                    required: true,
                    type: ApplicationCommandOptionType.String
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }
    },
    async run(interaction: ApplicationCommandInteraction, client: ToriClient): Promise<void> {
        await interaction.defer({ flags: MessageFlags.Ephemeral })
        
        const [date, location] = interaction.getStringOption('date').split('_') as  [string, InPersonGameLocation]
        const partialInPersonGames = await client.database.readPartialInPersonGamesByDateAndLocation(interaction.guildId, date, location)
        const embeds: Partial<APIEmbed>[] = [{ color: 0xF8F8FF, description: `${ partialInPersonGames.length ? partialInPersonGames.length : 'No' } game(s) found in ${ location.charAt(0).toUpperCase() }${ location.slice(1).toLowerCase() } for ${ date }!` }]
        
        if (partialInPersonGames.length)
            embeds.push(
                ...Array
                    .from({ length: Math.ceil(partialInPersonGames.length / 5) }, (_, i) => partialInPersonGames.slice(5 * i, 5 * (i + 1)))
                    .map(partialInPersonGameChunk => {
                        const fields: APIEmbedField[] = partialInPersonGameChunk.map(game => {
                            const players: Record<string, number> = {
                                [game.playerOneId]: game.playerOneScore,
                                [game.playerTwoId]: game.playerTwoScore,
                                [game.playerThreeId]: game.playerThreeScore
                            }
                    
                            if (game.playerFourId)
                                players[game.playerFourId] = game.playerFourScore

                            const value = Object
                                .entries(players)
                                .sort((playerOne, playerTwo) => playerTwo[1] - playerOne[1])
                                .map(([id, score]) => {
                                    const formattedScore = score
                                        .toString()
                                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
                                    const formattedId = (/^\d{17,20}$/.test(id))
                                        ? `<@${ id }>`
                                        : id
                    
                                    return `${ formattedId } - ${ formattedScore }`
                                })

                            if (game.notes?.length)
                                value.push(`\n__**Notes**__\n${ game.notes }`)

                            return {
                                inline: false,
                                name: `Game #${ game.id }`,
                                value: value.join('\n')
                            }
                        })
                        
                        return { color: 0xF8F8FF, fields }
                    })
            )
        
        await interaction.updateReply({ embeds })
    }
}