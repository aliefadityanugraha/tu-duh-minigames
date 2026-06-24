import HubungkanKebaikan from './HubungkanKebaikan';
import DekripsiPesan from './DekripsiPesan';
import UrutanMufakat from './UrutanMufakat';
import TimbanganKeadilan from './TimbanganKeadilan';
import TebakRumahIbadah from './TebakRumahIbadah';

export { HubungkanKebaikan, DekripsiPesan, UrutanMufakat, TimbanganKeadilan, TebakRumahIbadah };
export * from './MinigameShell';

export const MINIGAME_REGISTRY = {
  'tebak-ibadah': {
    component: TebakRumahIbadah,
    sila: 1,
    label: 'Tebak Rumah Ibadah',
  },
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
