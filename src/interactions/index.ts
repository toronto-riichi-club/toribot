import type { ChatInputCommand, Modal } from '#types/interaction'
import { AddScoreCommand } from './command/index.js'
import { AddScoreModal } from './modal/index.js'

export const commands: Map<string, ChatInputCommand> = new Map([
    ['addscore', AddScoreCommand]
])
export const modals: Map<string, Modal> = new Map([
    ['addscore', AddScoreModal]
])