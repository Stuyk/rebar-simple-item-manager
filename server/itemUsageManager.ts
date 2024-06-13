import * as alt from 'alt-server';
import { Item } from '../shared/types.js';
import { useItemManager } from './itemManager.js';
import { ItemIDs } from '../shared/ignoreItemIds.js';

type ItemUseCallback = (player: alt.Player, uid: string) => void;

const callbacks: { [id: string]: ItemUseCallback[] } = {};
const itemManger = useItemManager();

export function useItemUsageManager() {
    let errorMessage = '';

    /**
     * Invoke an event for the given item
     *
     * @param {alt.Player} player
     * @param {Item} item
     * @return
     */
    function invoke(player: alt.Player, item: Item) {
        const baseItem = itemManger.getBaseItem(item.id as ItemIDs);
        if (!baseItem) {
            errorMessage = 'Base item for event usage does not exist';
            return false;
        }

        if (!baseItem.useEventName) {
            errorMessage = 'Base item does not have a usage callback';
        }

        if (!callbacks[baseItem.useEventName]) {
            errorMessage = 'Item does not have any registered usage callbacks';
            return false;
        }

        if (typeof item.durability !== 'undefined' && item.durability <= 0) {
            errorMessage = 'Item is broken';
            return false;
        }

        for (let cb of callbacks[baseItem.useEventName]) {
            cb(player, item.uid);
        }

        return true;
    }

    /**
     * Listen for callbacks when a matching `useEventName` is invoked for a given item
     *
     * @param {string} useEventName
     * @param {ItemUseCallback} callback
     */
    function on(useEventName: string, callback: ItemUseCallback) {
        if (!callbacks[useEventName]) {
            callbacks[useEventName] = [];
        }

        callbacks[useEventName].push(callback);
    }

    function getErrorMessage() {
        return errorMessage;
    }

    return {
        getErrorMessage,
        on,
        invoke,
    };
}
