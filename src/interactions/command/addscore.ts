import type { ChatInputCommandInteraction, ToribotClient } from '#structs'
import type { ChatInputCommand } from '#types/interaction'
import {
    type APIActionRowComponent,
    type APIApplicationCommandInteractionDataStringOption,
    type APIApplicationCommandOptionChoice,
    type APIEmbed,
    type APIModalInteractionResponseCallbackData,
    type APITextInputComponent,
    ApplicationCommandOptionType,
    ComponentType,
    MessageFlags,
    TextInputStyle,
    type RESTPostAPIApplicationCommandsJSONBody,
} from '@discordjs/core'
import { GameLocation, GameType } from '@prisma/client'

export const AddScoreCommand: ChatInputCommand = {
    getCommand(): RESTPostAPIApplicationCommandsJSONBody {
        return {
            description: 'Record an in-person game',
            name: 'addscore',
            options: [
                {
                    autocomplete: true,
                    description: 'Player 1',
                    name: 'player-one',
                    required: true,
                    type: ApplicationCommandOptionType.String
                },
                {
                    autocomplete: true,
                    description: 'Player 2',
                    name: 'player-two',
                    required: true,
                    type: ApplicationCommandOptionType.String
                },
                {
                    autocomplete: true,
                    description: 'Player 3',
                    name: 'player-three',
                    required: true,
                    type: ApplicationCommandOptionType.String
                },
                {
                    autocomplete: true,
                    description: 'Player 4',
                    name: 'player-four',
                    required: true,
                    type: ApplicationCommandOptionType.String
                },
                {
                    choices: [
                        { name: 'Peel', value: GameLocation.PEEL },
                        { name: 'Toronto', value: GameLocation.TORONTO },
                        { name: 'Waterloo', value: GameLocation.WATERLOO },
                        { name: 'York', value: GameLocation.YORK }
                    ],
                    description: 'The game location',
                    name: 'location',
                    required: true,
                    type: ApplicationCommandOptionType.String
                },
                {
                    choices: [
                        { name: 'Hanchan', value: GameType.HANCHAN }
                    ],
                    description: 'The game type',
                    name: 'type',
                    type: ApplicationCommandOptionType.String
                }
            ]
        }
    },
    async run(client: ToribotClient, interaction: ChatInputCommandInteraction): Promise<void> {
        const focusedOption = interaction.getFocusedOption()

        if (focusedOption) {
            const { value } = focusedOption
            const valueSanitized = value.toString().toLowerCase()
            const choices: APIApplicationCommandOptionChoice<string>[] = []

            for (const [username, userId] of client.cache.players.entries()) {
                if (username.includes(valueSanitized) || userId?.toString().includes(valueSanitized))
                    choices.push({ name: userId ? `@${username}` : username, value: username })
                if (choices.length >= 25)
                    break
            }

            choices.sort((a, b) => a.name.localeCompare(b.name))

            return interaction.autocomplete(choices)
        }

        const [
            { value: playerOne },
            { value: playerTwo },
            { value: playerThree },
            { value: playerFour },
            { value: location },
            { value: type = GameType.HANCHAN } = {}
        ] = interaction.data.options as APIApplicationCommandInteractionDataStringOption[]
        const uniquePlayers = [...new Set([playerOne, playerTwo, playerThree, playerFour])]
        const embed: Partial<APIEmbed> = { color: 0xF8F8FF }

        if (uniquePlayers.length !== 4) {
            embed.description = 'Please provide 4 unique player usernames.'

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })

            return
        }

        const areAllUsernamesValid = uniquePlayers.every(username => /^[A-Za-z0-9_\.]*$/g.test(username))

        if (!areAllUsernamesValid) {
            embed.description = 'Please ensure that all users consist of **only** letters, numbers, underscores, and periods.'

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })

            return
        }

        for (const [index, username] of uniquePlayers.entries()) {
            if (client.cache.players.get(username))
                continue

            const searchResult = await client.api.guilds.searchForMembers(interaction.guildId, { query: username })
            const user = searchResult?.[0]?.user
            const u = user?.username ?? username
            const i = user ? BigInt(user.id) : null

            await client.database.players.insertPlayer(u, i)

            client.cache.players.insert(u, i)
            uniquePlayers[index] = u
        }

        const playerActionRows: APIActionRowComponent<APITextInputComponent>[] = uniquePlayers
            .map(username => ({
                components: [{
                    custom_id: username,
                    label: `Score for ${username}`,
                    max_length: 8,
                    placeholder: `Enter score for ${username} here!`,
                    required: true,
                    style: TextInputStyle.Short,
                    type: ComponentType.TextInput
                }],
                type: ComponentType.ActionRow
            }))
        const modal: APIModalInteractionResponseCallbackData = {
            components: [
                ...playerActionRows,
                {
                    components: [
                        {
                            custom_id: 'leftover-points',
                            label: 'Leftover points',
                            max_length: 8,
                            required: false,
                            style: TextInputStyle.Short,
                            type: ComponentType.TextInput
                        }
                    ],
                    type: ComponentType.ActionRow
                }
            ],
            custom_id: `addscore:${location}:${type}`,
            title: `Record ${type.toLowerCase()} at ${location.charAt(0).toUpperCase()}${location.slice(1).toLowerCase()}`
        }

        await interaction.replyWithModal(modal)
    }
}