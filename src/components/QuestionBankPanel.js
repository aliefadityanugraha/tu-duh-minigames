import React, { useState, useEffect } from 'react';
import {
  BookOpen, Plus, Search, Edit3, Trash2,
  ChevronRight, Check, X
} from 'lucide-react';

export default function QuestionBankPanel({ socket }) {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [filterSila, setFilterSila] = useState('all');
  const [mode, setMode] = useState('list');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [alertMsg, setAlertMsg] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const DEFAULT_IDS = new Set([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]);

  const [qText, setQText] = useState('');
  const [qSila, setQSila] = useState('1');
  const [qType, setQType] = useState('multiple_choice');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qAnswer, setQAnswer] = useState(0);
  const [qExplanation, setQExplanation] = useState('');

  useEffect(() => {
    if (!socket) return;
    socket.emit('get-questions');
    socket.on('questions-list', (list) => setQuestions(list));
    socket.on('questions-updated-alert', (msg) => {
      setAlertMsg(msg);
      setTimeout(() => setAlertMsg(''), 3000);
    });
    return () => {
      socket.off('questions-list');
      socket.off('questions-updated-alert');
    };
  }, [socket]);

  useEffect(() => {
    if (qType === 'true_false') {
      setQOptions(['Benar', 'Salah']);
      if (qAnswer > 1) setQAnswer(0);
    } else if (qType === 'multiple_choice' && qOptions.length === 2) {
      setQOptions(['', '', '', '']);
    }
  }, [qType]);

  const openAddMode = () => {
    setQText(''); setQSila('1'); setQType('multiple_choice');
    setQOptions(['', '', '', '']); setQAnswer(0); setQExplanation('');
    setMode('add');
  };

  const openEditMode = (q) => {
    setSelectedQuestion(q); setQText(q.question); setQSila(String(q.sila));
    setQType(q.type); setQOptions([...q.options]); setQAnswer(q.answer);
    setQExplanation(q.explanation || ''); setMode('edit');
  };

  const handleDelete = (id) => {
    if (window.confirm('Hapus soal ini dari Bank Soal room?')) {
      socket.emit('delete-question', { questionId: id });
    }
  };

  const handleReset = () => {
    socket.emit('reset-questions');
    setConfirmReset(false);
  };

  const handleOptionChange = (idx, val) => {
    const opts = [...qOptions]; opts[idx] = val; setQOptions(opts);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!qText.trim()) { alert('Pertanyaan tidak boleh kosong!'); return; }
    if (qOptions.some(opt => !opt.trim())) { alert('Semua opsi jawaban wajib diisi!'); return; }
    const payload = {
      sila: isNaN(qSila) ? qSila : parseInt(qSila),
      type: qType,
      question: qText.trim(),
      options: qOptions.map(opt => opt.trim()),
      answer: parseInt(qAnswer),
      explanation: qExplanation.trim()
    };
    if (mode === 'add') socket.emit('add-question', payload);
    else if (mode === 'edit') socket.emit('update-question', { id: selectedQuestion.id, ...payload });
    setMode('list');
  };

  const getSilaMeta = (sila) => {
    switch (String(sila)) {
      case '1': return { label: 'Sila 1 ⭐️', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
      case '2': return { label: 'Sila 2 🔗', color: 'text-red-700',   bg: 'bg-red-50',   border: 'border-red-200' };
      case '3': return { label: 'Sila 3 🌳', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
      case '4': return { label: 'Sila 4 🐃', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' };
      case '5': return { label: 'Sila 5 🌾', color: 'text-blue-700',  bg: 'bg-blue-50',  border: 'border-blue-200' };
      case 'sejarah': return { label: 'Sejarah 📜', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' };
      default: return { label: 'Umum 🇮🇩', color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' };
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(search.toLowerCase());
    const matchesSila = filterSila === 'all' || String(q.sila) === filterSila;
    return matchesSearch && matchesSila;
  });

  const inputClass = "w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-sm";
  const selectClass = "w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-sm cursor-pointer";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-flat overflow-hidden mb-4">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
            <BookOpen size={17} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">📝 Kelola Bank Soal</div>
            <div className="text-xs text-emerald-600 font-medium">{questions.length} soal tersedia</div>
          </div>
        </div>

        {mode === 'list' && (
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-700 text-xs font-semibold hover:bg-amber-100 transition"
            >
              🔄 Default
            </button>
            <button
              onClick={openAddMode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition active:scale-95"
            >
              <Plus size={13} /> Tambah
            </button>
          </div>
        )}
      </div>

      {/* Alert */}
      {alertMsg && (
        <div className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
          ✓ {alertMsg}
        </div>
      )}

      {/* Confirm reset */}
      {confirmReset && (
        <div className="mx-4 mt-3 p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-amber-800 font-medium flex-1">
            ⚠️ Semua soal kustom akan hilang dan diganti 20 soal Pancasila default. Lanjutkan?
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setConfirmReset(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition"
            >
              Ya, Reset
            </button>
          </div>
        </div>
      )}

      {/* LIST MODE */}
      {mode === 'list' && (
        <div className="p-4 space-y-3">
          {/* Search & filter */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[160px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari soal..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl py-2 pl-8 pr-3 text-slate-700 text-xs focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>
            <select
              value={filterSila}
              onChange={e => setFilterSila(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl py-2 px-3 text-slate-700 text-xs focus:outline-none focus:border-indigo-400 transition cursor-pointer"
            >
              <option value="all">📁 Semua</option>
              <option value="1">⭐️ Sila 1</option>
              <option value="2">🔗 Sila 2</option>
              <option value="3">🌳 Sila 3</option>
              <option value="4">🐃 Sila 4</option>
              <option value="5">🌾 Sila 5</option>
              <option value="sejarah">📜 Sejarah</option>
              <option value="umum">🇮🇩 Umum</option>
            </select>
          </div>

          {/* Question list */}
          <div className="max-h-[340px] overflow-y-auto space-y-2 pr-1">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs italic border-2 border-dashed border-slate-200 rounded-xl">
                🔍 Tidak ada soal yang cocok.
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const meta = getSilaMeta(q.sila);
                return (
                  <div
                    key={q.id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 hover:border-slate-300 transition space-y-2.5"
                  >
                    {/* Badges row */}
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${meta.color} ${meta.bg} ${meta.border}`}>
                          {meta.label}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600">
                          {q.type === 'multiple_choice' ? '📝 PG' : '⚖️ B-S'}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                          DEFAULT_IDS.has(q.id)
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'bg-purple-50 text-purple-600 border border-purple-200'
                        }`}>
                          {DEFAULT_IDS.has(q.id) ? 'Default' : 'Kustom'}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openEditMode(q)}
                          className="p-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-100 transition"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 bg-red-50 border border-red-200 rounded-lg text-red-500 hover:bg-red-100 transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Question text */}
                    <div className="text-sm font-medium text-slate-800 leading-snug">{q.question}</div>

                    {/* Options preview */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = oIdx === q.answer;
                        return (
                          <div
                            key={oIdx}
                            className={`text-[11px] px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                : 'bg-white border-slate-200 text-slate-500'
                            }`}
                          >
                            <span className="font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                            <span className="truncate">{opt}</span>
                            {isCorrect && <Check size={9} className="ml-auto flex-shrink-0 text-emerald-600" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ADD / EDIT MODE */}
      {(mode === 'add' || mode === 'edit') && (
        <form onSubmit={handleSave} className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <ChevronRight size={15} className={mode === 'add' ? 'text-emerald-600' : 'text-blue-600'} />
            {mode === 'add' ? 'Tambah Soal Baru' : `Edit Soal (ID: ${selectedQuestion?.id})`}
          </div>

          {/* Question text */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Pertanyaan</label>
            <textarea
              required rows={3} value={qText}
              onChange={e => setQText(e.target.value)}
              placeholder="Contoh: Bunyi Sila ketiga Pancasila adalah..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Category & type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Kategori</label>
              <select value={qSila} onChange={e => setQSila(e.target.value)} className={selectClass}>
                <option value="1">⭐️ Sila 1 (Ketuhanan)</option>
                <option value="2">🔗 Sila 2 (Kemanusiaan)</option>
                <option value="3">🌳 Sila 3 (Persatuan)</option>
                <option value="4">🐃 Sila 4 (Kerakyatan)</option>
                <option value="5">🌾 Sila 5 (Keadilan)</option>
                <option value="sejarah">📜 Sejarah</option>
                <option value="umum">🇮🇩 Umum</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Jenis</label>
              <select value={qType} onChange={e => setQType(e.target.value)} className={selectClass}>
                <option value="multiple_choice">📝 Pilihan Ganda</option>
                <option value="true_false">⚖️ Benar / Salah</option>
              </select>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Opsi & Kunci Jawaban
            </label>
            <div className="space-y-2">
              {qOptions.map((opt, oIdx) => (
                <div
                  key={oIdx}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                    qAnswer === oIdx ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200'
                  }`}
                >
                  <input
                    type="radio" name="qAnswer" checked={qAnswer === oIdx}
                    onChange={() => setQAnswer(oIdx)}
                    className="w-4 h-4 accent-emerald-600 cursor-pointer flex-shrink-0"
                  />
                  <span className={`text-xs font-bold w-5 flex-shrink-0 ${qAnswer === oIdx ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {String.fromCharCode(65 + oIdx)}
                  </span>
                  <input
                    type="text" required value={opt}
                    disabled={qType === 'true_false'}
                    onChange={e => handleOptionChange(oIdx, e.target.value)}
                    placeholder={`Opsi ${String.fromCharCode(65 + oIdx)}...`}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 disabled:text-slate-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Pembahasan (opsional)
            </label>
            <textarea
              rows={2} value={qExplanation}
              onChange={e => setQExplanation(e.target.value)}
              placeholder="Penjelasan edukatif setelah siswa menjawab..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button" onClick={() => setMode('list')}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition active:scale-95"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-[2] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition active:scale-95"
            >
              Simpan Soal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
