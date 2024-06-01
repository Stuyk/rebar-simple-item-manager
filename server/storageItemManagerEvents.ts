import * as alt from 'alt-server';
import { Item } from '../shared/types.js';

type DocumentItemAddedCallback = (identifier: string, id: string, quantity: number) => void;
type DocumentItemRemovedCallback = (identifier: string, id: string, quantity: number) => void;
type DocumentItemsUpdatedCallback = (identifier: string, items: Item[]) => void;

const onItemAddedCallbacks: DocumentItemAddedCallback[] = [];
const onItemRemovedCallbacks: DocumentItemRemovedCallback[] = [];
const onItemsUpdatedCallbacks: DocumentItemsUpdatedCallback[] = [];

export function useStorageItemManagerInvoker() {
    function invokeOnItemAdded(identifier: string, id: string, quantity: number) {
        for (let cb of onItemAddedCallbacks) {
            cb(identifier, id, quantity);
        }
    }

    function invokeOnItemRemoved(identifier: string, id: string, quantity: number) {
        for (let cb of onItemRemovedCallbacks) {
            cb(identifier, id, quantity);
        }
    }

    function invokeOnItemsUpdated(identifier: string, items: Item[]) {
        for (let cb of onItemsUpdatedCallbacks) {
            cb(identifier, items);
        }
    }

    return {
        invokeOnItemAdded,
        invokeOnItemRemoved,
        invokeOnItemsUpdated,
    };
}

export function useStorageItemManagerEvents() {
    /**
     * Invokes a callback when the item that was added or quantity of item is added to a player
     *
     * @param {DocumentItemAddedCallback} cb
     */
    function onItemAdded(cb: DocumentItemAddedCallback) {
        onItemAddedCallbacks.push(cb);
    }

    /**
     * Invokes a callback when an item is removed or a quantity of item is removed from a player
     *
     * @param {DocumentItemRemovedCallback} cb
     */
    function onItemRemoved(cb: DocumentItemRemovedCallback) {
        onItemRemovedCallbacks.push(cb);
    }

    /**
     * Invokes a callback whenever player inventory is modified
     *
     * @param {DocumentItemsUpdatedCallback} cb
     */
    function onItemsUpdated(cb: DocumentItemsUpdatedCallback) {
        onItemsUpdatedCallbacks.push(cb);
    }

    return {
        onItemAdded,
        onItemRemoved,
        onItemsUpdated,
    };
}
