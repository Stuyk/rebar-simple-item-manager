import * as alt from 'alt-server';
import { Item } from '../shared/types.js';
import { useItemManager } from './itemManager.js';
import { ItemIDs } from '../shared/ignoreItemIds.js';

type ItemUseCallback = (player: alt.Player, uid: string) => void;

const callbacks: { [id: string]: ItemUseCallback[] } = {};

export function useItemUsageManager() {
    let errorMessage = '';

    function invoke(player: alt.Player, item: Item) {
        if (!callbacks[item.id]) {
            return false;
        }

        for (let cb of callbacks[item.id]) {
            cb(player, item.uid);
        }

        return true;
    }

    function on(id: string, callback: ItemUseCallback) {
        if (!callbacks[id]) {
            callbacks[id] = [];
        }

        callbacks[id].push(callback);
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
