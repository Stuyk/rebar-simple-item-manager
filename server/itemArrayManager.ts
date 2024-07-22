import * as Utility from '@Shared/utility/index.js';

import { useItemManager } from './itemManager.js';

import { ItemIDs } from '../shared/ignoreItemIds.js';
import { AddOptions, Item } from '../shared/types.js';
import { ItemManagerConfig } from '../shared/config.js';

const itemManager = useItemManager();

/**
 * Check if the total weight of all items exceeds a maximum weight
 *
 * @param {number} maxWeight
 * @param {Item[]} items
 * @return
 */
function isWeightExceeded(items: Item[], maxWeight: number = ItemManagerConfig.weight.maxWeight) {
    let totalWeight = 0;
    for (let item of items) {
        totalWeight += item.quantity * item.weight;
    }

    return totalWeight > maxWeight;
}

export function useItemArrayManager() {
    let errorMessage = '';

    function getErrorMessage() {
        return errorMessage;
    }

    /**
     * Verify max slots, and max weight are not exceeded if enabled
     *
     * @param {Item[]} items
     * @param {AddOptions} [options={}]
     * @return
     */
    function verifyStackAndWeight(items: Item[], options: AddOptions = {}) {
        if (!options.maxSlots) {
            options.maxSlots = ItemManagerConfig.slots.maxSlots;
        }

        if (!options.maxWeight) {
            options.maxWeight = ItemManagerConfig.weight.maxWeight;
        }

        // Perform final check on slot count
        if ((ItemManagerConfig.slots.enabled && items.length >= options.maxSlots) || options.maxSlots <= 0) {
            errorMessage = 'Exceeded available slot count';
            return false;
        }

        // Perform final check on weight
        if (ItemManagerConfig.weight.enabled && isWeightExceeded(items, options.maxWeight)) {
            errorMessage = 'Exceeded available weight';
            return false;
        }

        return true;
    }

    /**
     * Adds any quantity of items based on id until
     *
     * @param {ItemIDs} id
     * @param {number} quantity
     * @param {Item[]} items
     * @param {AddOptions} [options={}]
     * @return
     */
    function add(id: ItemIDs, quantity: number, items: Item[], options: AddOptions = {}) {
        errorMessage = '';

        const baseItem = itemManager.getBaseItem(id);
        if (!baseItem) {
            errorMessage = 'Base item does not exist';
            return undefined;
        }

        // Break any bindings
        items = Utility.clone.arrayData(items);

        options.maxSlots = options.maxSlots || ItemManagerConfig.slots.maxSlots;
        options.maxWeight = options.maxWeight || ItemManagerConfig.weight.maxWeight;

        // Handle Item Stacking
        if (baseItem.maxStack <= 1) {
            const uid = Utility.uid.generate();
            const newItem: Item = { ...baseItem, quantity, uid };

            if (options.data) {
                newItem.data = options.data;
            }

            items.push(newItem);
            return verifyStackAndWeight(items, options) ? items : undefined;
        }

        // Find items with the exact id and add quantities of that item
        for (let i = 0; i < items.length; i++) {
            if (items[i].id !== id || items[i].quantity === baseItem.maxStack) {
                continue;
            }

            if (quantity <= 0) {
                break;
            }

            const availableSpace = baseItem.maxStack - items[i].quantity;
            const quantityToAdd = Math.min(availableSpace, quantity);

            items[i].quantity += quantityToAdd;
            quantity -= quantityToAdd;
        }

        // No more items to add
        if (quantity <= 0) {
            return verifyStackAndWeight(items, options) ? items : undefined;
        }

        // Continue adding items...
        while (quantity > 0) {
            const uid = Utility.uid.generate();
            const actualQuantity = Math.min(quantity, baseItem.maxStack);
            items.push({ ...baseItem, quantity: actualQuantity, uid });
            quantity -= actualQuantity;
        }

        return verifyStackAndWeight(items, options) ? items : undefined;
    }

    /**
     * Gets an item based on uid, returns `undefined` if not found
     *
     * @param {string} uid
     * @returns {Item | undefined}
     */
    function getByUid(uid: string, items: Readonly<Item[]>) {
        errorMessage = '';

        const item = items.find((x) => x.uid === uid);
        if (!item) {
            errorMessage = `Unable to get item by uid, item does not exist`;
        }

        return item ? (item as Readonly<Item>) : undefined;
    }

    /**
     * Gets any custom data that is attached to an item
     *
     * @template T
     * @param {string} uid
     * @return {(Readonly<T> | undefined)}
     */
    function getData<T = Object>(uid: string, items: Readonly<Item[]>): Readonly<T> | undefined {
        const item = getByUid(uid, items);
        if (!item) {
            // Error already defined
            return undefined;
        }

        return item.data as Readonly<T>;
    }

    /**
     * Remove items until all of them are removed.
     *
     * Returns `undefined` if unable to remove enough items.
     *
     * @param {ItemIDs} id
     * @param {number} quantity
     * @param {Item[]} items
     * @return
     */
    function remove(id: ItemIDs, quantity: number, items: Item[]) {
        errorMessage = '';

        // Verify the items array even has enough of the item outright
        if (!has(id, quantity, items)) {
            return undefined;
        }

        // Break any bindings
        items = Utility.clone.arrayData(items);

        // Find items with the exact id, and remove
        // Removes items from end of inventory, to beginning
        for (let i = items.length - 1; i >= 0; i--) {
            if (items[i].id !== id) {
                continue;
            }

            if (quantity <= 0) {
                break;
            }

            // Remove an entire stack if large enough
            if (quantity >= items[i].quantity) {
                quantity -= items[i].quantity;
                items.splice(i, 1);
                continue;
            }

            // Remove a portion of the stack
            items[i].quantity -= quantity;
            quantity = 0;
            break;
        }

        return items;
    }

    /**
     * Remove item with a specific uid
     *
     * Returns the modified items, and item removed
     *
     * @param {string} uid
     * @param {Item[]} items
     * @return
     */
    function removeAt(uid: string, items: Item[]) {
        errorMessage = '';

        items = Utility.clone.arrayData(items);
        const index = items.findIndex((x) => x.uid === uid);
        if (index <= -1) {
            errorMessage = 'Could not find item to remove';
            return undefined;
        }

        const item = items.splice(index, 1);
        return { items, item };
    }

    /**
     * Remove a quantity of an item based on `uid`
     *
     * @param {string} uid
     * @param {number} quantity
     * @param {Item[]} items
     * @return
     */
    function removeQuantityFrom(uid: string, quantity: number, items: Item[]) {
        errorMessage = '';

        items = Utility.clone.arrayData(items);
        const index = items.findIndex((x) => x.uid === uid);
        if (index <= -1) {
            errorMessage = 'Could not find item to remove';
            return undefined;
        }

        if (items[index].quantity < quantity) {
            errorMessage = 'Quantity provided does not match available item quantity';
            return undefined;
        }

        if (items[index].quantity === quantity) {
            items.splice(index, 1);
            return items;
        }

        items[index].quantity -= quantity;
        return items;
    }

    /**
     * Verify that an item array has enough of an item
     *
     * @param {ItemIDs} id
     * @param {number} quantity
     * @param {Item[]} items
     * @return
     */
    function has(id: ItemIDs, quantity: number, items: Item[]) {
        errorMessage = '';

        // Look through all items, and add their quantities together
        let totalQuantityFound = 0;
        for (let item of items) {
            if (item.id !== id) {
                continue;
            }

            totalQuantityFound += item.quantity;

            if (totalQuantityFound >= quantity) {
                return true;
            }
        }

        errorMessage = 'Not enough quantity of item';
        return false;
    }

    /**
     * Split an item stack
     *
     * @param {string} uid
     * @param {number} amountToSplit
     * @param {Item[]} items
     * @return
     */
    function split(uid: string, amountToSplit: number, items: Item[], options: Omit<AddOptions, 'data'>) {
        errorMessage = '';

        items = Utility.clone.arrayData(items);
        const index = items.findIndex((x) => x.uid === uid);
        if (index <= -1) {
            errorMessage = `Could not find given item in inventory during split`;
            return undefined;
        }

        const baseItem = itemManager.getBaseItem(items[index].id as ItemIDs);
        if (!baseItem) {
            errorMessage = 'Base item does not exist';
            return undefined;
        }

        if (items[index].quantity < amountToSplit || items[index].quantity === amountToSplit) {
            errorMessage = 'Item cannot be split';
            return undefined;
        }

        items[index].quantity -= amountToSplit;
        items.push({ ...Utility.clone.objectData(items[index]), quantity: amountToSplit });
        return verifyStackAndWeight(items, options) ? items : undefined;
    }

    /**
     * Stacks the items, if max stack is reached it will leave the remaining in the other stack
     *
     * @param {string} uidToStackOn
     * @param {string} uidToStack
     * @param {Item[]} items
     * @return
     */
    function stack(uidToStackOn: string, uidToStack: string, items: Item[]) {
        errorMessage = '';

        items = Utility.clone.arrayData(items);
        const stackableIndex = items.findIndex((x) => x.uid === uidToStackOn);
        const stackIndex = items.findIndex((x) => x.uid === uidToStack);

        if (stackIndex <= -1 || stackableIndex <= -1) {
            errorMessage = 'Could not find both items in inventory';
            return undefined;
        }

        // Verify both the same item
        if (items[stackableIndex].id !== items[stackIndex].id) {
            errorMessage = 'Both items were not the same, and cannot be stacked';
            return undefined;
        }

        // Verify max stack values
        const baseItem = itemManager.getBaseItem(items[stackIndex].id as ItemIDs);
        if (!baseItem || baseItem.maxStack <= 1) {
            errorMessage = 'Item cannot be stacked';
            return undefined;
        }

        // Calculate how much before stack is maxed out
        const diffToMax = items[stackableIndex].maxStack - items[stackableIndex].quantity;
        if (diffToMax <= 0) {
            errorMessage = 'Item is already at max stack';
            return undefined;
        }

        // If the stackIndex quantity is larger than the difference to max
        // Add the diffToMax, and subtract it from stackIndex
        // Otherwise, remove the other item and combine
        items[stackableIndex].quantity += diffToMax;
        if (items[stackIndex].quantity > diffToMax) {
            items[stackIndex].quantity -= diffToMax;
        } else {
            items.splice(stackIndex, 1);
        }

        return items;
    }

    /**
     * Modifies item object data and overwrites any values provided
     *
     * @param {string} uid
     * @param {Partial<Omit<Item, '_id'>>} data
     * @param {Item[]} items
     * @return
     */
    function update(uid: string, data: Partial<Omit<Item, '_id'>>, items: Item[]) {
        errorMessage = '';
        items = Utility.clone.arrayData(items);

        const index = items.findIndex((x) => x.uid === uid);
        if (index <= -1) {
            errorMessage = `Unable to get item by uid, item does not exist`;
            return undefined;
        }

        // Handle decay when set to zero
        if (typeof data.decay !== 'undefined' && data.decay <= 0) {
            items.slice(index, 1);
            return items;
        }

        items[index] = Object.assign(items[index], data);
        return items;
    }

    /**
     * Override the error message
     *
     * @param {string} message
     */
    function setErrorMessage(message: string) {
        errorMessage = message;
    }

    /**
     * Any items that can be decayed, decay by 1 hr.
     *
     * @param {Item[]} items
     * @return
     */
    function invokeDecay(items: Item[]) {
        items = Utility.clone.arrayData(items);
        for (let i = items.length - 1; i >= 0; i--) {
            if (typeof items[i].decay === 'undefined') {
                continue;
            }

            items[i].decay -= 1;

            if (items[i].decay <= 0) {
                items.slice(i, 1);
            }
        }

        return items;
    }

    return {
        add,
        getByUid,
        getData,
        getErrorMessage,
        has,
        invokeDecay,
        remove,
        removeAt,
        removeQuantityFrom,
        setErrorMessage,
        split,
        stack,
        update,
    };
}
