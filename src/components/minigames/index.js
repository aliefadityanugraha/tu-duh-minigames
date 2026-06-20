import HubungkanKebaikan from './HubungkanKebaikan';
import DekripsiPesan from './DekripsiPesan';
import UrutanMufakat from './UrutanMufakat';
import TimbanganKeadilan from './TimbanganKeadilan';

export { HubungkanKebaikan, DekripsiPesan, UrutanMufakat, TimbanganKeadilan };
export * from './MinigameShell';

export const MINIGAME_REGISTRY = {
  'hubungkan-kebaikan': {
    component: HubungkanKebaikan,
    sila: 2,
    label: 'Hubungkan Kebaikan',
  },
  'dekripsi-pesan': {
    component: DekripsiPesan,
    sila: 3,
    label: 'Susun Kata',
  },
  'urutan-mufakat': {
    component: UrutanMufakat,
    sila: 4,
    label: 'Urutan Mufakat',
  },
  'timbangan-keadilan': {
    component: TimbanganKeadilan,
    sila: 5,
    label: 'Timbangan Keadilan',
  },
};

export const MINIGAME_IDS = Object.keys(MINIGAME_REGISTRY);
