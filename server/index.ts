import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { useTranslate } from '@Shared/translate.js';
import '../translate/index.js';

const Rebar = useRebar();
const api = Rebar.useApi();
const messenger = Rebar.messenger.useMessenger();

const { t } = useTranslate('en');

import { SYSTEM_EVENTS } from '../shared/events.js';

messenger.commands.register({
    name: '/noclip',
    desc: '/noclip',
    options: { accountPermissions: ['admin'] },
    callback: (player: alt.Player) => {
        const isNoClipping: boolean | null = player.getSyncedMeta('NoClipping') as boolean;
        const data = Rebar.document.character.useCharacter(player).get();
        if (typeof data === 'undefined') {
            return;
        }
    
        if (!isNoClipping && !data.isDead) {
            player.setSyncedMeta('NoClipping', true);
            messenger.message.send(player, { type: 'system', content: t('noclip.on') })
            player.visible = false;
            return;
        }
    
        if (data.isDead) {
            messenger.message.send(player, { type: 'warning', content: t('noclip.cannot.perform.died') });
            return;

        }
    
        player.spawn(player.pos.x, player.pos.y, player.pos.z, 0);
        player.setSyncedMeta('NoClipping', false);
        messenger.message.send(player, { type: 'system', content: t('noclip.off') })
        player.visible = true;
        player.health = 199; 
    },
});


function handleReset(player: alt.Player) {
    player.spawn(player.pos.x, player.pos.y, player.pos.z, 0);
}

function handleCamUpdate(player: alt.Player, pos: alt.Vector3) {
    player.spawn(pos.x, pos.y, pos.z);
}

alt.onClient(SYSTEM_EVENTS.NOCLIP_RESET, handleReset);
alt.onClient(SYSTEM_EVENTS.NOCLIP_UPDATE, handleCamUpdate);
