export class UnavailableGuildCache {
    #items: Set<bigint> = new Set()

    insert(key: bigint) {
        this.#items.add(key)
    }

    remove(key: bigint) {
        this.#items.delete(key)
    }
}