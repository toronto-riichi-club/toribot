import type { ApplicationCommandInteraction } from '#structs'
import { type CommandInteraction, GameBit } from '#types/interaction'
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
import { InPersonGameLocation, InPersonGameType } from '@prisma/client'

export const InPersonRecordCommand: CommandInteraction = {
    getCommand(): APIApplicationCommandOption {
        return {
            description: 'Record an in-person game',
            name: 'record',
            options: [
                {
                    choices: [
                        { name: 'Peel', value: InPersonGameLocation.PEEL },
                        { name: 'Toronto', value: InPersonGameLocation.TORONTO },
                        { name: 'Waterloo', value: InPersonGameLocation.WATERLOO },
                        { name: 'York', value: InPersonGameLocation.YORK }
                    ],
                    description: 'The game location',
                    name: 'location',
                    required: true,
                    type: ApplicationCommandOptionType.String
                },
                {
                    description: 'Player 1',
                    name: 'player-one',
                    required: true,
                    type: ApplicationCommandOptionType.String
                },
                {
                    description: 'Player 2',
                    name: 'player-two',
                    required: true,
                    type: ApplicationCommandOptionType.String
                },
                {
                    description: 'Player 3',
                    name: 'player-three',
                    required: true,
                    type: ApplicationCommandOptionType.String
                },
                {
                    description: 'Player 4',
                    name: 'player-four',
                    type: ApplicationCommandOptionType.String
                },
                {
                    choices: [
                        { name: 'Hanchan', value: InPersonGameType.SOUTH },
                        { name: 'Potluck (tonpuusen)', value: InPersonGameType.POTLUCK_EAST },
                        { name: 'Potluck (hanchan)', value: InPersonGameType.POTLUCK_SOUTH },
                        { name: 'Sanma (tonpuusen)', value: InPersonGameType.SANMA_EAST },
                        { name: 'Sanma (hanchan)', value: InPersonGameType.SANMA_SOUTH },
                        { name: 'Space (tonpuusen)', value: InPersonGameType.SPACE_EAST },
                        { name: 'Space (hanchan)', value: InPersonGameType.SANMA_SOUTH },
                        { name: 'Tonpuusen', value: InPersonGameType.EAST }
                    ],
                    description: 'The game type',
                    name: 'type',
                    type: ApplicationCommandOptionType.String
                },
            ],
            type: ApplicationCommandOptionType.Subcommand
        }
    },
    async run(interaction: ApplicationCommandInteraction): Promise<void> {
        const players: Record<string, string> = {}

        for (const name of ['player-one', 'player-two', 'player-three', 'player-four']) {
            const value = interaction.getStringOption(name)

            if (!value)
                continue

            const id = value.match(/^<@!?(?<id>\d{15,20})>$/)

            if (id?.[1]) {
                const { discriminator, username } = interaction.resolved.users[id[1]]

                players[id[1]] = `${ username }#${ discriminator }`
            }
            if (/^[a-zA-Z\d]+$/.test(value))
                players[value] = value
        }

        if (Object.keys(players).length < 3) {
            const embed: Partial<APIEmbed> = {
                color: 0xF8F8FF,
                description: `You have provided ${ Object.keys(players).length } valid player(s). Please provide either **three** or **four** valid players.`
            }

            await interaction.reply({ embeds: [embed] })
            return
        }

        let bits: number

        const location = interaction.getStringOption('location') as InPersonGameLocation
        const type = interaction.getStringOption('type') as InPersonGameType

        switch (location) {
            case 'PEEL': { bits |= GameBit.Peel; break; }
            case 'TORONTO': { bits |= GameBit.Toronto; break; }
            case 'WATERLOO': { bits |= GameBit.Waterloo; break; }
            case 'YORK': { bits |= GameBit.York; break; }
        }

        switch (type) {
            case 'EAST': { bits |= GameBit.East; break; }
            case 'POTLUCK_EAST': { bits |= GameBit.PotluckEast; break; }
            case 'POTLUCK_SOUTH': { bits |= GameBit.PotluckSouth; break; }
            case 'SANMA_EAST': { bits |= GameBit.SanmaEast; break; }
            case 'SANMA_SOUTH': { bits |= GameBit.SanmaSouth; break; }
            case 'SOUTH': { bits |= GameBit.South; break; }
            case 'SPACE_EAST': { bits |= GameBit.SpaceEast; break; }
            case 'SPACE_SOUTH': { bits |= GameBit.SpaceSouth; break; }
        }

        const playerComponents: APIActionRowComponent<APITextInputComponent>[] = Object
            .entries(players)
            .map(([custom_id, label]) => {
                return {
                    components: [{
                        custom_id,
                        label,
                        max_length: 8,
                        placeholder: `Score for ${ label }`,
                        required: true,
                        style: TextInputStyle.Short,
                        type: ComponentType.TextInput
                    }],
                    type: ComponentType.ActionRow
                }
            })
        const modal: APIModalInteractionResponseCallbackData = {
            components: [
                ...playerComponents,                
                {
                    components: [
                        {
                            custom_id: 'notes',
                            label: 'Notes',
                            max_length: 200,
                            placeholder: 'Add any notes (if applicable)',
                            required: false,
                            style: TextInputStyle.Paragraph,
                            type: ComponentType.TextInput
                        }
                    ],
                    type: ComponentType.ActionRow
                }
            ],
            custom_id: `record-in-person-game-${ bits }`,
            title: 'Record in-person game'
        }

        await interaction.replyWithModal(modal)
    }
}