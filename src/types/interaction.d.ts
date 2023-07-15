import type {
    ChatInputCommandInteraction,
    ModalInteraction,
    ToribotClient
} from '#structs'
import type {
    APIApplicationCommandInteractionDataIntegerOption,
    APIApplicationCommandInteractionDataNumberOption,
    APIApplicationCommandInteractionDataStringOption,
    APIApplicationCommandOption,
    APIChatInputApplicationCommandInteractionData,
    APIModalSubmission,
} from '@discordjs/core'
import type { REST } from '@discordjs/rest'

export type AutocompleteFocusedOption =
    | APIApplicationCommandInteractionDataIntegerOption
    | APIApplicationCommandInteractionDataNumberOption
    | APIApplicationCommandInteractionDataStringOption

export interface BaseInteractionOptions {
    applicationId: string
    id: string
    rest: REST
    token: string
}

export interface ChatInputCommand {
    getCommand(): APIApplicationCommandOption | RESTPostAPIApplicationCommandsJSONBody
    run(client: ToribotClient, interaction: ChatInputCommandInteraction): Promise<void>
}

export interface ChatInputCommandInteractionOptions extends BaseInteractionOptions {
    data: APIChatInputApplicationCommandInteractionData
    guildId: string
}

export interface Modal {
    run(client: ToribotClient, interaction: ModalInteraction): Promise<void>
}

export interface ModalInteractionOptions extends BaseInteractionOptions {
    data: APIModalSubmission
    username: string
}