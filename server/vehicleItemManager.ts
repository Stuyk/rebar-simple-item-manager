import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { AddOptions, Item } from '../shared/types.js';
import { useItemArrayManager } from './itemArrayManager.js';

const Rebar = useRebar();

export function useVehicleItemManager(vehicle: alt.Vehicle) {
    const itemArrayManager = useItemArrayManager();
    const document = Rebar.document.vehicle.useVehicle(vehicle);

    /**
     * Finds a similar item based on `id` or creates a new item and adds it to the player's inventory
     *
     * Saves to database
     *
     * @param {Item} item
     * @return
     */
    async function add(id: string, quantity: number, addOptions: AddOptions = {}) {
        const data = document.get();
        if (!data.items) {
            data.items = [];
        }

        const items = itemArrayManager.add(id, quantity, data.items, addOptions);
        if (!items) {
            return false;
        }

        await document.set('items', items);
        alt.emit('rebar:entityItemsUpdated', vehicle, items);
        return true;
    }

    /**
     * Remove an item by `id` and quantity
     *
     * Saves to database
     *
     * @param {string} id
     * @param {number} quantity
     * @return {Promise<boolean>}
     */
    async function remove(id: string, quantity: number): Promise<boolean> {
        const data = document.get();
        if (!data.items) {
            return false;
        }

        const initialQuantity = quantity;
        const items = itemArrayManager.remove(id, quantity, data.items);
        if (!items) {
            return false;
        }

        await document.set('items', items);
        alt.emit('rebar:entityItemsUpdated', vehicle, items);
        return true;
    }

    /**
     * Remove a quantity of items from a specific item stack based on `uid`
     *
     * @param {string} uid
     * @param {number} quantity
     * @returns {boolean}
     */
    async function removeQuantityFrom(uid: string, quantity: number) {
        const data = document.get();
        if (!data.items) {
            data.items = [];
        }

        const items = itemArrayManager.removeQuantityFrom(uid, quantity, data.items);
        if (!items) {
            return false;
        }

        await document.set('items', items);
        alt.emit('rebar:entityItemsUpdated', vehicle, items);
        return true;
    }

    /**
     * Get all items the player currently has available
     *
     * @return {Readonly<Item[]>}
     */
    function get(): Readonly<Item[]> {
        return (document.get().items as Readonly<Item[]>) ?? ([] as Readonly<Item[]>);
    }

    /**
     * Gets an item based on uid, returns `undefined` if not found
     *
     * @param {string} uid
     * @returns {Readonly<Item> | undefined}
     */
    function getAt(uid: string) {
        const items = get();
        const item = items.find((x) => x.uid === uid);
        return item ? (item as Readonly<Item>) : undefined;
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
     * Check if they have enough of an item
     *
     * Returns `true / false`
     *
     * @param {string} id
     * @param {number} quantity
     * @return
     */
    function has(id: string, quantity: number) {
        const data = document.get();
        if (!data.items) {
            return false;
        }

        return itemArrayManager.has(id, quantity, data.items);
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
        const data = document.get();
        if (!data.items) {
            return false;
        }

        const items = itemArrayManager.stack(uidToStackOn, uidToStack, data.items);
        if (!items) {
            return false;
        }

        await document.set('items', items);
        alt.emit('rebar:entityItemsUpdated', vehicle, items);
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
        const data = document.get();
        if (!data.items) {
            return false;
        }

        const items = itemArrayManager.split(uid, amountToSplit, data.items, options);
        if (!items) {
            return false;
        }

        await document.set('items', items);
        alt.emit('rebar:entityItemsUpdated', vehicle, items);
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
        const vehicleDocument = document.get();
        if (!vehicleDocument.items) {
            return false;
        }

        const items = itemArrayManager.update(uid, data, vehicleDocument.items);
        if (!items) {
            return false;
        }

        await document.set('items', items);
        alt.emit('rebar:entityItemsUpdated', vehicle, items);
        return true;
    }

    /**
     * Decays any decayable items in the item list by 1, and removes decayed items
     *
     * @return {Promise<void>}
     */
    async function invokeDecay(): Promise<void> {
        const data = document.get();
        if (!data.items) {
            return;
        }

        const items = itemArrayManager.invokeDecay(data.items);
        await document.set('items', items);
    }

    /**
     * Remove an item based on uid, returns `true` if removed
     *
     * @param {string} uid
     * @return
     */
    async function removeAt(uid: string) {
        const data = document.get();
        if (!data.items) {
            data.items = [];
        }

        const results = itemArrayManager.removeAt(uid, data.items);
        if (!results) {
            return false;
        }

        await document.set('items', results.items);
        alt.emit('rebar:entityItemsUpdated', vehicle, results.items);
        return true;
    }

    return {
        add,
        get,
        getAt,
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
