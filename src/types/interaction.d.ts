import type {
    ApplicationCommandAutocompleteInteraction,
    ApplicationCommandInteraction,
    ModalSubmitInteraction,
    ToriClient
} from '#structs'
import type {
    APIApplicationCommandInteractionDataIntegerOption,
    APIApplicationCommandInteractionDataNumberOption,
    APIApplicationCommandInteractionDataStringOption,
    RESTPostAPIApplicationCommandsJSONBody,
    RESTPostAPIBaseApplicationCommandsJSONBody
} from '@discordjs/core'

export type AutocompleteFocusedOption = 
    | APIApplicationCommandInteractionDataIntegerOption
    | APIApplicationCommandInteractionDataNumberOption
    | APIApplicationCommandInteractionDataStringOption
    
export interface AutocompleteInteraction {
    getChoices(interaction: ApplicationCommandAutocompleteInteraction, client: ToriClient): APIApplicationCommandOptionChoice<string | number>[]
}

export interface CommandInteraction {
    getCommand(): RESTPostAPIApplicationCommandsJSONBody | RESTPostAPIBaseApplicationCommandsJSONBody
    run(interaction: ApplicationCommandInteraction, client: ToriClient): void
}

export interface ModalInteraction {
    handle(interaction: ModalSubmitInteraction, client: ToriClient): void
}

export const enum GameBit {
    Peel = 1 << 0,
    Toronto = 1 << 1,
    Waterloo = 1 << 2,
    York = 1 << 3,
    East = 1 << 4,
    PotluckEast = 1 << 5,
    PotluckSouth = 1 << 6,
    SanmaEast = 1 << 7,
    SanmaSouth = 1 << 8,
    South = 1 << 9,
    SpaceEast = 1 << 10,
    SpaceSouth = 1 << 11
}