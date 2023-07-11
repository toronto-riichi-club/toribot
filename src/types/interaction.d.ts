import type {
    ChatInputCommandInteraction,
    ModalSubmitInteraction,
    ToribotClient,
} from '#structs'
import type {
    APIApplicationCommandInteractionDataIntegerOption,
    APIApplicationCommandInteractionDataNumberOption,
    APIApplicationCommandInteractionDataStringOption,
    APIChatInputApplicationCommandInteractionData,
    APIModalSubmission,
    ModalSubmitInteraction
} from '@discordjs/core'
import type { REST } from '@discordjs/rest'

export type AutocompleteFocusedOption =
    | APIApplicationCommandInteractionDataIntegerOption
    | APIApplicationCommandInteractionDataNumberOption
    | APIApplicationCommandInteractionDataStringOption

export type BaseInteractionOptions = {
    applicationId: string,
    id: string,
    rest: REST,
    token: string
}

export interface ChatInputCommand {
    getCommand(): RESTPostAPIApplicationCommandsJSONBody
    run(client: ToribotClient, interaction: ChatInputCommandInteraction): Promise<void>
}

export type ChatInputCommandInteractionOptions = WithBaseInteractionOptions<APIChatInputApplicationCommandInteractionData>

export interface Modal {
    handle(client: ToribotClient, interaction: ModalSubmitInteraction): Promise<void>
}

export type ModalInteractionOptions = WithBaseInteractionOptions<APIModalSubmission>

export interface WithBaseInteractionOptions<T extends APIChatInputApplicationCommandInteractionData | APIModalSubmission> extends BaseInteractionOptions {
    data: T,
    username: string
}