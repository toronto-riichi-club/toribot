import type { ApplicationCommandInteraction, ToriClient } from '#structs'
import type { CommandInteraction } from '#types/interaction'
import {
    type APIActionRowComponent,
    type APIApplicationCommandOption,
    type APIEmbed,
    type APIModalInteractionResponseCallbackData,
    type APITextInputComponent,
    ApplicationCommandOptionType,
    ComponentType,
    TextInputStyle
} from '@discordjs/core'

export const InPersonUpdateScoreCommand: CommandInteraction = {
    getCommand(): APIApplicationCommandOption {
        return {
            description: 'Update the score for an in-person game',
            name: 'update-score',
            options: [
                {
                    description: 'The in-person game to update',
                    name: 'id',
                    required: true,
                    type: ApplicationCommandOptionType.Number
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }
    },
    async run(interaction: ApplicationCommandInteraction, client: ToriClient): Promise<void> {
        const id = interaction.getNumberOption('id')
        const inPersonGame = await client.database.readInPersonGame(interaction.guildId, id)

        if (!inPersonGame) {
            const embed: Partial<APIEmbed> = { color: 0xF8F8FF, description: 'No game found.' }

            await interaction.reply({ embeds: [embed] })
            return
        }

        const results: Record<string, number> = {
            [inPersonGame.playerOneId]: inPersonGame.playerOneScore,
            [inPersonGame.playerTwoId]: inPersonGame.playerTwoScore,
            [inPersonGame.playerThreeId]: inPersonGame.playerThreeScore
        }

        if (inPersonGame.playerFourScore)
            results[inPersonGame.playerFourId] = inPersonGame.playerFourScore

        const playerComponents: APIActionRowComponent<APITextInputComponent>[] = []

        for (const [id, score] of Object.entries(results)) {
            let label = id

            if (/^\d{17,20}$/.test(id)) {
                await client.fetchMember(interaction.guildId, id)

                const { username, discriminator } = client.cache.users.get(BigInt(id))
                
                label = `${ username }#${ discriminator }`
            }

            playerComponents.push({
                components: [{
                    custom_id: id,
                    label,
                    max_length: 8,
                    placeholder: `Score for ${ label }`,
                    required: true,
                    style: TextInputStyle.Short,
                    type: ComponentType.TextInput,
                    value: score.toString()
                }],
                type: ComponentType.ActionRow
            })
        }

        const modal: APIModalInteractionResponseCallbackData = {
            components: playerComponents,
            custom_id: `update-in-person-game-score-${ id }`,
            title: 'Update game'
        }

        await interaction.replyWithModal(modal)
    }
}