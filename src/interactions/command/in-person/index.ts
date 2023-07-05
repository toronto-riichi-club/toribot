import type { ApplicationCommandInteraction, ToriClient } from '#structs'
import type { CommandInteraction } from '#types/interaction'
import {
    type APIEmbed,
    ApplicationCommandType,
    MessageFlags,
    type RESTPostAPIApplicationCommandsJSONBody
} from '@discordjs/core'
import { InPersonDeleteCommand } from './delete.js'
import { InPersonListCommand } from './list.js'
import { InPersonRecordCommand } from './record.js'
import { InPersonUpdateDateCommand } from './update-date.js'
import { InPersonUpdateScoreCommand } from './update-score.js'

const enum InPersonCommandSubcommand {
    Delete = 'delete',
    List = 'list',
    Record = 'record',
    UpdateDate = 'update-date',
    UpdateScore = 'update-score'
}

export const InPersonCommand: CommandInteraction = {
    getCommand(): RESTPostAPIApplicationCommandsJSONBody {
        return {
            description: 'Manage in-person games',
            name: 'in-person',
            options: [
                InPersonDeleteCommand.getCommand(),
                InPersonListCommand.getCommand(),
                InPersonRecordCommand.getCommand(),
                InPersonUpdateDateCommand.getCommand(),
                InPersonUpdateScoreCommand.getCommand()
            ],
            type: ApplicationCommandType.ChatInput
        }
    },
    async run(interaction: ApplicationCommandInteraction, client: ToriClient): Promise<void> {
        if ((interaction.subcommand !== InPersonCommandSubcommand.List) && (interaction.subcommand === InPersonCommandSubcommand.Record) && !interaction.isInvokerAnAdmin()) {
            const embed: Partial<APIEmbed> = { color: 0xF8F8FF, description: 'You must have administrator permissions to use this subcommand.' }

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
        } else
            switch (interaction.subcommand) {
                case InPersonCommandSubcommand.Delete: return InPersonDeleteCommand.run(interaction, client)
                case InPersonCommandSubcommand.List: return InPersonListCommand.run(interaction, client)
                case InPersonCommandSubcommand.Record: return InPersonRecordCommand.run(interaction, client)
                case InPersonCommandSubcommand.UpdateDate: return InPersonUpdateDateCommand.run(interaction, client)
                case InPersonCommandSubcommand.UpdateScore: return InPersonUpdateScoreCommand.run(interaction, client)
                default: {
                    const embed: Partial<APIEmbed> = { color: 0xF8F8FF, description: 'Unknown subcommand' }

                    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
                }
            }
    }
}