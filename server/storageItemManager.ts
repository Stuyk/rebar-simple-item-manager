import * as alt from 'alt-server';
import * as Utility from '@Shared/utility/index.js';
import { useRebar } from '@Server/index.js';

import { useItemArrayManager } from './itemArrayManager.js';

import { ItemManagerConfig } from '../shared/config.js';
import { AddOptions, Storage } from '../shared/types.js';
import { useItemManagerDatabase } from './database.js';
import { Item, RebarItems } from '@Shared/types/items.js';

const Rebar = useRebar();
const db = Rebar.database.useDatabase();
const managerDb = useItemManagerDatabase();

/**
 * When an `identifier` is assigned to this document manager, it will automatically
 * create the document in the database. Make sure you know what you're doing.
 *
 * @export
 * @param {string} identifier
 * @param {Omit<AddOptions, 'data'>} [options={}]
 * @return
 */
export async function useStorageItemManager(identifier: string, options: Omit<AddOptions, 'data'> = {}) {
    const itemArrayManager = useItemArrayManager();

    if (!options.maxSlots) {
        options.maxSlots = ItemManagerConfig.slots.maxSlots;
    }

    if (!options.maxWeight) {
        options.maxWeight = ItemManagerConfig.weight.maxWeight;
    }

    await alt.Utils.waitFor(() => managerDb.isReady(), 30000);

    let document = await db.get<Storage>({ id: identifier }, ItemManagerConfig.collectionNameForStorage);
    if (!document) {
        await db.create<Omit<Storage, '_id'>>(
            { id: identifier, items: [], maxSlots: options.maxSlots, lastAccessed: Date.now() },
            ItemManagerConfig.collectionNameForStorage,
        );

        document = await db.get<Storage>({ id: identifier }, ItemManagerConfig.collectionNameForStorage);
    }

    /**
     * Finds a similar item based on `id` or creates a new item and adds it to the player's inventory
     *
     * Saves to database
     *
     * @param {keyof RebarItems} id
     * @param {number} quantity
     * @param {AddOptions} [addOptions={}]
     * @return
     */
    async function add(id: keyof RebarItems, quantity: number, addOptions: AddOptions = {}) {
        const currentItems = await getInternal();
        const items = itemArrayManager.add(id, quantity, currentItems, addOptions);
        if (!items) {
            return false;
        }

        await updateItems(items);

        alt.emit('rebar:storageItemAdded', identifier, id.toString(), quantity);
        alt.emit('rebar:storageItemsUpdated', identifier, items);
        return true;
    }

    /**
     * Remove an item by `id` and quantity
     *
     * Saves to database
     *
     * @param {keyof RebarItems} id
     * @param {number} quantity
     * @return {Promise<boolean>}
     */
    async function remove(id: keyof RebarItems, quantity: number): Promise<boolean> {
        const currentItems = await getInternal();
        const initialQuantity = quantity;
        const items = itemArrayManager.remove(id, quantity, currentItems);
        if (!items) {
            return false;
        }

        await updateItems(items);

        alt.emit('rebar:storageItemRemoved', identifier, id.toString(), initialQuantity);
        alt.emit('rebar:storageItemsUpdated', identifier, items);
        return true;
    }

    /**
     * Remove an item based on a given uid
     *
     * @param {string} uid
     * @return
     */
    async function removeAt(uid: string) {
        const currentItems = await getInternal();
        const results = itemArrayManager.removeAt(uid, currentItems);
        if (!results) {
            return false;
        }

        await updateItems(results.items);
        alt.emit('rebar:storageItemRemoved', identifier, results.item.id.toString(), results.item.quantity);
        alt.emit('rebar:storageItemsUpdated', identifier, results.items);
        return true;
    }

    /**
     * Get all items the player currently has available
     *
     * @return {Item[]}
     */
    async function get(): Promise<Readonly<Item[]>> {
        const document = await db.get<Storage>({ id: identifier }, ItemManagerConfig.collectionNameForStorage);
        if (!document) {
            return [];
        }

        return (Utility.clone.arrayData(document.items) as Readonly<Item[]>) ?? ([] as Readonly<Item[]>);
    }

    /**
     * Gets an item based on uid, returns `undefined` if not found
     *
     * @param {string} uid
     * @returns {Readonly<Item> | undefined}
     */
    async function getByUid(uid: string) {
        const items = await get();
        return itemArrayManager.getByUid(uid, items);
    }

    /**
     * Gets internal item data and allows conversion of data with generics
     *
     * @template T
     * @param {string} uid
     * @return {Promise<(Readonly<T> | undefined)>}
     */
    async function getData<T = Object>(uid: string): Promise<Readonly<T> | undefined> {
        const items = await getInternal();
        return itemArrayManager.getData(uid, items);
    }

    /**
     * Internal get items that doesn't mark it as readonly
     *
     * @return {Promise<Item[]>}
     */
    async function getInternal(): Promise<Item[]> {
        const document = await db.get<Storage>({ id: identifier }, ItemManagerConfig.collectionNameForStorage);
        if (!document) {
            return [];
        }

        return Utility.clone.arrayData(document.items) ?? [];
    }

    /**
     * Check if they have enough of an item
     *
     * Returns `true / false`
     *
     * @param {keyof RebarItems} id
     * @param {number} quantity
     * @return
     */
    async function has(id: keyof RebarItems, quantity: number) {
        const currentItems = await getInternal();
        return itemArrayManager.has(id, quantity, currentItems);
    }

    /**
     * Remove a quantity of items from a specific item stack based on `uid`
     *
     * @param {string} uid
     * @param {number} quantity
     * @returns {boolean}
     */
    async function removeQuantityFrom(uid: string, quantity: number) {
        const currentItems = await getInternal();
        const items = itemArrayManager.removeQuantityFrom(uid, quantity, currentItems);
        if (!items) {
            return false;
        }

        await updateItems(items);
        return true;
    }

    /**
     * Stack two items together and leave remaining if stack is too large
     *
     * Saves to database
     *
     * @param {string} uidToStackOn
     * @param {string} uidToStack
     * @return
     */
    async function stack(uidToStackOn: string, uidToStack: string) {
        const currentItems = await getInternal();
        const items = itemArrayManager.stack(uidToStackOn, uidToStack, currentItems);
        if (!items) {
            return false;
        }

        await updateItems(items);
        alt.emit('rebar:storageItemsUpdated', identifier, items);
        return true;
    }

    /**
     * Split an item into two items
     *
     * Saves to database
     *
     * @param {string} uid
     * @param {number} amountToSplit
     * @param {AddOptions} [options={}]
     * @return
     */
    async function split(uid: string, amountToSplit: number, options: AddOptions = {}) {
        const currentItems = await getInternal();
        const items = itemArrayManager.split(uid, amountToSplit, currentItems, options);
        if (!items) {
            return false;
        }

        await updateItems(items);
        alt.emit('rebar:storageItemsUpdated', identifier, items);
        return true;
    }

    /**
     * Update items and write to the database
     *
     * @param {Item[]} items
     */
    async function updateItems(items: Item[]) {
        await db.update<Partial<Storage>>(
            { _id: document._id, items, lastAccessed: Date.now() },
            ItemManagerConfig.collectionNameForStorage,
        );
    }

    /**
     * Updates the data set for a single item, overwriting any data inside.
     *
     * @param {string} uid
     * @param {Partial<Omit<Item, '_id'>>} data
     * @returns {boolean}
     */
    async function update(uid: string, data: Partial<Omit<Item, '_id'>>) {
        const currentItems = await getInternal();
        const items = itemArrayManager.update(uid, data, currentItems);
        if (!items) {
            return false;
        }

        await updateItems(items);
        alt.emit('rebar:storageItemsUpdated', identifier, items);
        return true;
    }

    /**
     * Decays any decayable items in the item list by 1, and removes decayed items
     *
     * @return {Promise<void>}
     */
    async function invokeDecay(): Promise<void> {
        if (document.noDecay) {
            return;
        }

        const currentItems = await getInternal();
        if (currentItems.length <= 0) {
            return;
        }

        const items = itemArrayManager.invokeDecay(currentItems);
        await updateItems(items);
    }

    return {
        add,
        get,
        getByUid,
        getData,
        getErrorMessage() {
            return itemArrayManager.getErrorMessage();
        },
        has,
        invokeDecay,
        remove,
        removeAt,
        removeQuantityFrom,
        split,
        stack,
        update,
    };
}
