import * as alt from 'alt-server';
import { Item } from '../shared/types.js';
import { useItemManager } from './itemManager.js';
import { ItemIDs } from '../shared/ignoreItemIds.js';

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
            return false;
        }

        alt.emit(baseItem.useEventName, player, item.uid);
        return true;
    }

    function getErrorMessage() {
        return errorMessage;
    }

    return {
        getErrorMessage,
        invoke,
    };
}
