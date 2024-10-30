import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { usePlayerItemManager } from './playerItemManager.js';
import { useVehicleItemManager } from './vehicleItemManager.js';
import { useItemManager } from './itemManager.js';
import { RebarItems } from '@Shared/types/items.js';

const Rebar = useRebar();
const Service = Rebar.services.useServiceRegister();

Service.register('itemService', {
    async add(entity, id, quantity, data) {
        if (entity instanceof alt.Player) {
            return usePlayerItemManager(entity).add(id as keyof RebarItems, quantity, { data });
        }

        if (entity instanceof alt.Vehicle) {
            return useVehicleItemManager(entity).add(id as keyof RebarItems, quantity, { data });
        }

        return false;
    },
    async has(entity, id, quantity) {
        if (entity instanceof alt.Player) {
            return usePlayerItemManager(entity).has(id as keyof RebarItems, quantity);
        }

        if (entity instanceof alt.Vehicle) {
            return useVehicleItemManager(entity).has(id as keyof RebarItems, quantity);
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
            return usePlayerItemManager(entity).remove(id as keyof RebarItems, quantity);
        }

        if (entity instanceof alt.Vehicle) {
            return useVehicleItemManager(entity).remove(id as keyof RebarItems, quantity);
        }

        return false;
    },
    async use(entity, uid) {
        if (!(entity instanceof alt.Player)) {
            return false;
        }

        return usePlayerItemManager(entity).useOne(uid);
    },
    async itemCreate(data) {
        const itemManager = useItemManager();
        if (!itemManager.has(data.id)) {
            return;
        }

        await itemManager.create(data);
    },
    async itemRemove(id) {
        const itemManager = useItemManager();
        if (!itemManager.has(id.toString())) {
            return;
        }

        await itemManager.remove(id.toString());
    },
    async hasSpace(entity, item) {
        if (entity instanceof alt.Player) {
            return usePlayerItemManager(entity).add(item.id, item.quantity, { data: item.data }, true);
        }

        if (entity instanceof alt.Vehicle) {
            return useVehicleItemManager(entity).add(item.id, item.quantity, { data: item.data }, true);
        }

        return false;
    },
});
