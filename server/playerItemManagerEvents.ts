import * as alt from 'alt-server';
import { Item } from '../shared/types.js';

type PlayerItemAddedCallback = (player: alt.Player, id: string, quantity: number) => void;
type PlayerItemRemovedCallback = (player: alt.Player, id: string, quantity: number) => void;
type PlayerItemsUpdatedCallback = (player: alt.Player, items: Item[]) => void;

const onItemAddedCallbacks: PlayerItemAddedCallback[] = [];
const onItemRemovedCallbacks: PlayerItemRemovedCallback[] = [];
const onItemsUpdatedCallbacks: PlayerItemsUpdatedCallback[] = [];

export function usePlayerItemManagerEventInvoker() {
    function invokeOnItemAdded(player: alt.Player, id: string, quantity: number) {
        for (let cb of onItemAddedCallbacks) {
            cb(player, id, quantity);
        }
    }

    function invokeOnItemRemoved(player: alt.Player, id: string, quantity: number) {
        for (let cb of onItemRemovedCallbacks) {
            cb(player, id, quantity);
        }
    }

    function invokeOnItemsUpdated(player: alt.Player, items: Item[]) {
        for (let cb of onItemsUpdatedCallbacks) {
            cb(player, items);
        }
    }

    return {
        invokeOnItemAdded,
        invokeOnItemRemoved,
        invokeOnItemsUpdated,
    };
}

export function usePlayerItemManagerEvents() {
    /**
     * Invokes a callback when the item that was added or quantity of item is added to a player
     *
     * @param {PlayerItemAddedCallback} cb
     */
    function onItemAdded(cb: PlayerItemAddedCallback) {
        onItemAddedCallbacks.push(cb);
    }

    /**
     * Invokes a callback when an item is removed or a quantity of item is removed from a player
     *
     * @param {PlayerItemRemovedCallback} cb
     */
    function onItemRemoved(cb: PlayerItemRemovedCallback) {
        onItemRemovedCallbacks.push(cb);
    }

    /**
     * Invokes a callback whenever player inventory is modified
     *
     * @param {PlayerItemsUpdatedCallback} cb
     */
    function onItemsUpdated(cb: PlayerItemsUpdatedCallback) {
        onItemsUpdatedCallbacks.push(cb);
    }

    return {
        onItemAdded,
        onItemRemoved,
        onItemsUpdated,
    };
}
