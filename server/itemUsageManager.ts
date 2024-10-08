import * as alt from 'alt-server';
import { useItemManager } from './itemManager.js';
import { Item } from '@Shared/types/items.js';

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
        const baseItem = itemManger.getBaseItem(item.id);
        if (!baseItem) {
            errorMessage = 'Base item for event usage does not exist';
            return false;
        }

        if (!baseItem.useEventName) {
            errorMessage = 'Base item does not have a usage callback';
            return false;
        }

        alt.emit(baseItem.useEventName, player, item);
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
