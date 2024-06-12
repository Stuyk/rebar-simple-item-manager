import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { AddOptions, InventoryExtension, Item } from '../shared/types.js';
import { useItemArrayManager } from './itemArrayManager.js';
import { ItemIDs } from '../shared/ignoreItemIds.js';
import { usePlayerItemManagerEventInvoker } from './playerItemManagerEvents.js';
import { useItemUsageManager } from './itemUsageManager.js';

const Rebar = useRebar();

const invoker = usePlayerItemManagerEventInvoker();

/**
 * Manages player items by interfacing with the player's inventory and item manager.
 *
 * Provides methods to add, remove, get, check, stack, and split items in the player's inventory.
 *
 * @param {alt.Player} player - The player whose item inventory is being managed.
 * @returns {Object} An object containing methods to manipulate the player's item inventory.
 */
export function usePlayerItemManager(player: alt.Player) {
    const document = Rebar.document.character.useCharacter(player);
    const itemArrayManager = useItemArrayManager();
    const itemUsage = useItemUsageManager();

    /**
     * Adds a similar item based on `id` or creates a new item and adds it to the player's inventory.
     * Saves the updated inventory to the database.
     *
     * @param {ItemIDs} id - The ID of the item to add.
     * @param {number} quantity - The quantity of the item to add.
     * @param {AddOptions} [addOptions={}] - Additional options for adding the item.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the item was added successfully, otherwise `false`.
     */
    async function add(id: ItemIDs, quantity: number, addOptions: AddOptions = {}) {
        const data = document.get<InventoryExtension>();
        if (!data.items) {
            data.items = [];
        }

        const items = itemArrayManager.add(id, quantity, data.items, addOptions);
        if (!items) {
            return false;
        }

        await document.set<InventoryExtension>('items', items);

        invoker.invokeOnItemAdded(player, id, quantity);
        invoker.invokeOnItemsUpdated(player, items);

        return true;
    }

    /**
     * Removes an item by `id` and quantity from the player's inventory.
     * Saves the updated inventory to the database.
     *
     * @param {ItemIDs} id - The ID of the item to remove.
     * @param {number} quantity - The quantity of the item to remove.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the item was removed successfully, otherwise `false`.
     */
    async function remove(id: ItemIDs, quantity: number): Promise<boolean> {
        const data = document.get<InventoryExtension>();
        if (!data.items) {
            data.items = [];
        }

        const initialQuantity = quantity;
        const items = itemArrayManager.remove(id, quantity, data.items);
        if (!items) {
            return false;
        }

        await document.set<InventoryExtension>('items', items);

        invoker.invokeOnItemRemoved(player, id, initialQuantity);
        invoker.invokeOnItemsUpdated(player, items);

        return true;
    }

    /**
     * Removes all existing items in document.items (Character Items)
     * Saves the updated inventory to the database.
     *
     * @returns {Promise<void>} A promise that resolves to `true` if the item was removed successfully, otherwise `false`.
     */
    async function clearArray() {
        await document.set<InventoryExtension>('items', []);
    }

    /**
     * Remove a quantity of items from a specific item stack based on `uid`
     *
     * @param {string} uid
     * @param {number} quantity
     * @returns {boolean}
     */
    async function removeQuantityFrom(uid: string, quantity: number) {
        const data = document.get<InventoryExtension>();
        if (!data.items) {
            data.items = [];
        }

        const items = itemArrayManager.removeQuantityFrom(uid, quantity, data.items);
        if (!items) {
            return false;
        }

        await document.set<InventoryExtension>('items', items);
        invoker.invokeOnItemsUpdated(player, items);
        return true;
    }

    /**
     * Gets all items the player currently has available.
     *
     * @returns {Readonly<Item[]>} An array of items in the player's inventory.
     */
    function get(): Readonly<Item[]> {
        return (document.get<InventoryExtension>().items as Readonly<Item[]>) ?? ([] as Readonly<Item[]>);
    }

    /**
     * Gets an item based on uid, returns `undefined` if not found
     *
     * @param {string} uid
     * @returns {Readonly<Item> | undefined}
     */
    function getByUid(uid: string) {
        const items = get();
        return itemArrayManager.getByUid(uid, items);
    }

    /**
     * Gets internal item data and allows conversion of data with generics
     *
     * @template T
     * @param {string} uid
     * @return {(Readonly<T> | undefined)}
     */
    function getData<T = Object>(uid: string): Readonly<T> | undefined {
        const items = get();
        return itemArrayManager.getData(uid, items);
    }

    /**
     * Checks if the player has enough of an item.
     *
     * @param {ItemIDs} id - The ID of the item to check.
     * @param {number} quantity - The quantity of the item to check.
     * @returns {boolean} `true` if the player has enough of the item, otherwise `false`.
     */
    function has(id: ItemIDs, quantity: number) {
        const data = document.get<InventoryExtension>();
        if (!data.items) {
            return false;
        }

        return itemArrayManager.has(id, quantity, data.items);
    }

    /**
     * Stacks two items together and leaves the remaining if the stack is too large.
     * Saves the updated inventory to the database.
     *
     * @param {string} uidToStackOn - The UID of the item to stack onto.
     * @param {string} uidToStack - The UID of the item to be stacked.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the items were stacked successfully, otherwise `false`.
     */
    async function stack(uidToStackOn: string, uidToStack: string) {
        const data = document.get<InventoryExtension>();
        if (!data.items) {
            return false;
        }

        const items = itemArrayManager.stack(uidToStackOn, uidToStack, data.items);
        if (!items) {
            return false;
        }

        await document.set<InventoryExtension>('items', items);

        invoker.invokeOnItemsUpdated(player, items);

        return true;
    }

    /**
     * Splits an item into two items.
     * Saves the updated inventory to the database.
     *
     * @param {string} uid - The UID of the item to split.
     * @param {number} amountToSplit - The amount to split from the item.
     * @param {AddOptions} [options={}] - Additional options for splitting the item.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the item was split successfully, otherwise `false`.
     */
    async function split(uid: string, amountToSplit: number, options: AddOptions = {}) {
        const data = document.get<InventoryExtension>();
        if (!data.items) {
            return false;
        }

        const items = itemArrayManager.split(uid, amountToSplit, data.items, options);
        if (!items) {
            return false;
        }

        await document.set<InventoryExtension>('items', items);

        invoker.invokeOnItemsUpdated(player, items);

        return true;
    }

    /**
     * Updates the data set for a single item, overwriting any data inside.
     *
     * @param {string} uid
     * @param {Partial<Omit<Item, '_id'>>} data
     * @returns {boolean}
     */
    async function update(uid: string, data: Partial<Omit<Item, '_id'>>) {
        const playerDocument = document.get<InventoryExtension>();
        if (!playerDocument.items) {
            return false;
        }

        const items = itemArrayManager.update(uid, data, playerDocument.items);
        if (!items) {
            return false;
        }

        await document.set<InventoryExtension>('items', items);

        invoker.invokeOnItemsUpdated(player, items);

        return true;
    }

    /**
     * Use an item, but does not subtract quantity.
     *
     * Simply invokes the event attached to the base item if available
     *
     * @param {string} uid
     * @return
     */
    async function use(uid: string) {
        const item = getByUid(uid);
        if (!item) {
            return false;
        }

        return itemUsage.invoke(player, item);
    }

    /**
     * Use an item, removes 1 of the item from the quantity
     *
     * Simply invokes the event attached to the base item if available
     *
     * @param {string} uid
     * @return
     */
    async function useOne(uid: string) {
        const item = getByUid(uid);
        if (!item) {
            return false;
        }

        const didInvoke = itemUsage.invoke(player, item);
        if (!didInvoke) {
            itemArrayManager.setErrorMessage(itemUsage.getErrorMessage());
            return false;
        }

        return removeQuantityFrom(uid, 1);
    }

    /**
     * Decays any decayable items in the item list by 1, and removes decayed items
     *
     * @return {Promise<void>}
     */
    async function invokeDecay(): Promise<void> {
        const data = document.get<InventoryExtension>();
        if (!data.items) {
            return;
        }

        const items = itemArrayManager.invokeDecay(data.items);
        await document.set<InventoryExtension>('items', items);
    }

    return {
        add,
        get,
        getData,
        getErrorMessage() {
            return itemArrayManager.getErrorMessage();
        },
        getByUid,
        has,
        invokeDecay,
        remove,
        removeQuantityFrom,
        clearArray,
        split,
        stack,
        update,
        use,
        useOne,
    };
}
