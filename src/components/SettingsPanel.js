import React, { useState } from 'react';
import {
  Settings2, Timer, Swords, MessageSquare,
  Users, ListChecks, ChevronDown, ChevronUp,
  RotateCcw, Save, CheckCircle2, Info
} from 'lucide-react';
import { DEFAULT_SETTINGS } from '@shared/constants';

export default function SettingsPanel({ socket, currentSettings = {}, playerCount = 0 }) {
  const defaults = { ...DEFAULT_SETTINGS, minTaskDuration: 8 };
  const merged = { ...defaults, ...currentSettings };
  const [settings, setSettings] = useState(merged);
  const [isOpen, setIsOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const nonGuruCount = Math.max(0, playerCount - 1);
  const totalTasks = nonGuruCount * settings.tasksPerPlayer;
  const previewProvCount = settings.provokatorCount === 'auto'
    ? (nonGuruCount >= 6 ? 2 : 1)
    : Math.min(Number(settings.provokatorCount), Math.floor(nonGuruCount / 2));

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    if (socket) {
      socket.emit('update-settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleReset = () => {
    setSettings({ ...defaults });
    setSaved(false);
    if (socket) socket.emit('update-settings', { ...defaults });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-flat overflow-hidden mb-4">
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Settings2 size={17} className="text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-slate-800">⚙️ Pengaturan Game</div>
            <div className="text-xs text-slate-400">Konfigurasi durasi, tugas, dan peran</div>
          </div>
        </div>
        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
          {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {/* Collapsible body */}
      <div style={{
        maxHeight: isOpen ? '1200px' : '0px',
        opacity: isOpen ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease',
      }}>
        <div className="px-5 pb-5 border-t border-slate-100 space-y-5 pt-4">

          {/* Preview badges */}
          <div className="flex flex-wrap gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
            <PreviewBadge icon="👥" label="Siswa" value={nonGuruCount} color="text-blue-600" />
            <PreviewBadge icon="📋" label="Total Tugas" value={totalTasks} color="text-emerald-600" />
            <PreviewBadge icon="😈" label="Provokator" value={previewProvCount} color="text-red-600" />
          </div>

          {/* Sliders */}
          <div className="space-y-5">
            <SettingSlider
              icon={<ListChecks size={15} className="text-emerald-600" />}
              label="Tugas per Warga"
              description="Jumlah soal yang harus dijawab setiap Warga"
              value={settings.tasksPerPlayer}
              min={1} max={15} step={1} unit="soal"
              accentColor="#16A34A"
              onChange={v => handleChange('tasksPerPlayer', v)}
            />
            <SettingSlider
              icon={<ListChecks size={15} className="text-violet-600" />}
              label="Porsi Kuis vs Mini-Game"
              description={`${Math.round((settings.quizRatio ?? DEFAULT_SETTINGS.quizRatio) * 100)}% kuis, ${Math.round((1 - (settings.quizRatio ?? DEFAULT_SETTINGS.quizRatio)) * 100)}% mini-game`}
              value={Math.round((settings.quizRatio ?? DEFAULT_SETTINGS.quizRatio) * 100)}
              min={0} max={100} step={10} unit="% kuis"
              accentColor="#7C3AED"
              onChange={v => handleChange('quizRatio', v / 100)}
            />
            <SettingSlider
              icon={<Timer size={15} className="text-amber-600" />}
              label="Durasi Sabotase (Rescue)"
              description="Waktu Warga terpilih menyelesaikan soal rescue"
              value={settings.sabotageTimer}
              min={15} max={90} step={5} unit="detik"
              accentColor="#D97706"
              onChange={v => handleChange('sabotageTimer', v)}
            />
            <SettingSlider
              icon={<Swords size={15} className="text-red-600" />}
              label="Durasi Duel 1v1"
              description="Waktu adu cepat per soal duel"
              value={settings.duelTimer}
              min={10} max={60} step={5} unit="detik"
              accentColor="#DC2626"
              onChange={v => handleChange('duelTimer', v)}
            />
            <SettingSlider
              icon={<MessageSquare size={15} className="text-indigo-600" />}
              label="Durasi Debat Voting"
              description="Waktu musyawarah dan voting eliminasi"
              value={settings.debateTimer}
              min={30} max={180} step={15} unit="detik"
              accentColor="#4F46E5"
              onChange={v => handleChange('debateTimer', v)}
            />
            <SettingSlider
              icon={<MessageSquare size={15} className="text-cyan-600" />}
              label="Durasi Debat Topik"
              description="Waktu sesi debat topik bebas"
              value={settings.topicDebateTimer}
              min={60} max={300} step={30} unit="detik"
              accentColor="#0891B2"
              onChange={v => handleChange('topicDebateTimer', v)}
            />
            <SettingSlider
              icon={<Timer size={15} className="text-purple-600" />}
              label="Batas Waktu Game"
              description="Total durasi permainan (Provokator menang jika habis)"
              value={settings.gameTimer}
              min={60} max={1800} step={60} unit="detik"
              accentColor="#7C3AED"
              displayValue={_formatSeconds(settings.gameTimer)}
              onChange={v => handleChange('gameTimer', v)}
            />
          </div>

          <div className="h-px bg-slate-100" />

          {/* Provokator count */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users size={15} className="text-orange-500" />
              <div>
                <div className="text-sm font-semibold text-slate-700">Jumlah Provokator</div>
                <div className="text-xs text-slate-400">Berapa siswa yang menjadi Provokator</div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'auto', label: '🤖 Auto' },
                { value: '1', label: '1 Orang' },
                { value: '2', label: '2 Orang' },
                { value: '3', label: '3 Orang' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleChange('provokatorCount', opt.value)}
                  className={`px-3.5 py-2 rounded-lg border text-sm font-semibold transition-all ${
                    settings.provokatorCount === opt.value
                      ? 'bg-orange-50 border-orange-400 text-orange-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <Info size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Pengaturan hanya bisa diubah sebelum game dimulai. Semua perubahan langsung tersinkronisasi ke semua pemain.
            </p>
          </div>

          {/* Save / Reset */}
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={13} /> Reset
            </button>
            <button
              onClick={handleSave}
              className={`flex-[2] py-2.5 rounded-xl text-white text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                saved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {saved ? <><CheckCircle2 size={14} /> Tersimpan!</> : <><Save size={14} /> Simpan Pengaturan</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function _formatSeconds(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return sec === 0 ? `${m} mnt` : `${m}m ${sec}s`;
}

function SettingSlider({ icon, label, description, value, min, max, step, unit, accentColor, onChange, displayValue }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <div className="text-sm font-semibold text-slate-700">{label}</div>
            <div className="text-xs text-slate-400">{description}</div>
          </div>
        </div>
        <div
          className="px-2.5 py-1 rounded-lg border text-sm font-bold min-w-[56px] text-center flex-shrink-0"
          style={{ color: accentColor, borderColor: accentColor, background: `${accentColor}10` }}
        >
          {displayValue ?? value}<span className="text-[10px] font-normal ml-0.5">{displayValue ? '' : unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none outline-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${accentColor} ${pct}%, #E2E8F0 ${pct}%)`,
        }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-slate-400">{min} {unit}</span>
        <span className="text-[9px] text-slate-400">{max} {unit}</span>
      </div>
    </div>
  );
}

function PreviewBadge({ icon, label, value, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm">{icon}</span>
      <span className="text-xs text-slate-500">{label}:</span>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  );
}
