import { useTranslate } from '@Shared/translate.js';
const { setBulk } = useTranslate();

setBulk({
    en: {
        'noclip.on': 'Noclip enabled',
        'noclip.off': 'Noclip disabled',
        'noclip.cannot.perform.died': 'Cannot perform while dead',
        'noclip.info': 'Left Shift (Sprint Speed) | Scroll (Change Sprint Speed)',
        'noclip.speed': 'Speed: ',
    },
    hu: {
        'noclip.on': 'Noclip bekapcsolva',
        'noclip.off': 'Noclip kikapcsolva',
        'noclip.cannot.perform.died': 'Meghalva nem teheted.',
        'noclip.info': 'Bal Shift (Gyors repülés) | Görgő (Sebesség változtatása)',
        'noclip.speed': 'Speed: ',
    }
});
