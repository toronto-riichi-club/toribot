import type { APIGuildChannel } from '#types/cache'
import {
    type APIApplicationCommandAutocompleteGuildInteraction,
    type APIChannel,
    type APIChatInputApplicationCommandGuildInteraction,
    type APIInteraction,
    type APIModalSubmitGuildInteraction,
    ApplicationCommandType,
    InteractionType
} from '@discordjs/core'

export function isApplicationCommandAutocompleteInteraction(interaction: APIInteraction): interaction is APIApplicationCommandAutocompleteGuildInteraction {
    return interaction.type === InteractionType.ApplicationCommandAutocomplete
}

export function isChatInputApplicationCommandInteraction(interaction: APIInteraction): interaction is APIChatInputApplicationCommandGuildInteraction {
    return interaction.type === InteractionType.ApplicationCommand && interaction.data.type === ApplicationCommandType.ChatInput
}

export function isGuildChannel(channel: APIChannel): channel is APIGuildChannel & { guild_id: string } {
    return Reflect.has(channel, 'guild_id')
}

export function isModalSubmitInteraction(interaction: APIInteraction): interaction is APIModalSubmitGuildInteraction {
    return interaction.type === InteractionType.ModalSubmit
}