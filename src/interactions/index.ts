import type {
    AutocompleteInteraction,
    CommandInteraction,
    ModalInteraction
} from '#types/interaction'
import { DateAutocomplete, QueryAutocomplete } from './autocomplete/index.js'
import { InPersonCommand, LatencyCommand, OnlineCommand, TagCommand } from './command/index.js'
import {
    AddTagModal,
    RecordInPersonGameModal,
    UpdateInPersonGameScoreModal,
    UpdateTagModal
} from './modal/index.js'

export const autocompletes: Map<string, AutocompleteInteraction> = new Map([
    ['date', DateAutocomplete],
    ['query', QueryAutocomplete]
])
export const commands: Map<string, CommandInteraction> = new Map([
    ['in-person', InPersonCommand],
    ['latency', LatencyCommand],
    ['online', OnlineCommand],
    ['tag', TagCommand]
])
export const modals: Map<string, ModalInteraction> = new Map([
    ['add-tag', AddTagModal],
    ['record-in-person-game', RecordInPersonGameModal],
    ['update-in-person-game-score', UpdateInPersonGameScoreModal],
    ['update-tag', UpdateTagModal]
])
