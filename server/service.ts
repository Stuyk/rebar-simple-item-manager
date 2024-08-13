import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { usePlayerItemManager } from './playerItemManager.js';
import { ItemIDs } from '../shared/ignoreItemIds.js';
import { useVehicleItemManager } from './vehicleItemManager.js';

const Rebar = useRebar();
const Service = Rebar.services.useServiceRegister();

Service.register('itemService', {
    async add(entity, id, quantity, data) {
        if (entity instanceof alt.Player) {
            return usePlayerItemManager(entity).add(id as ItemIDs, quantity, { data });
        }

        if (entity instanceof alt.Vehicle) {
            return useVehicleItemManager(entity).add(id as ItemIDs, quantity, { data });
        }

        return false;
    },
    async has(entity, id, quantity) {
        if (entity instanceof alt.Player) {
            return usePlayerItemManager(entity).has(id as ItemIDs, quantity);
        }

        if (entity instanceof alt.Vehicle) {
            return useVehicleItemManager(entity).has(id as ItemIDs, quantity);
        }

        return false;
    },
    async remove(entity, uid) {
        if (entity instanceof alt.Player) {
            return usePlayerItemManager(entity).removeAt(uid);
        }

        if (entity instanceof alt.Vehicle) {
            return useVehicleItemManager(entity).removeAt(uid);
        }

        return false;
    },
    async sub(entity, id, quantity) {
        if (entity instanceof alt.Player) {
            return usePlayerItemManager(entity).remove(id as ItemIDs, quantity);
        }

        if (entity instanceof alt.Vehicle) {
            return useVehicleItemManager(entity).remove(id as ItemIDs, quantity);
        }

        return false;
    },
    async use(entity, uid) {
        if (!(entity instanceof alt.Player)) {
            return false;
        }

        return usePlayerItemManager(entity).useOne(uid);
    },
});
