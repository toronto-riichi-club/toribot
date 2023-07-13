export class PlayerCache {
    #items: Map<string, bigint | null> = new Map()

    entries() {
        return this.#items.entries()
    }

    get(username: string): bigint | null {
        return this.#items.get(username) ?? null
    }

    insert(username: string, userId?: bigint) {
        this.#items.set(username, userId ?? null)
    }

    remove(username: string) {
        this.#items.delete(username)
    }
}