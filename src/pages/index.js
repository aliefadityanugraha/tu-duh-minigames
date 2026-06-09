import React from 'react';
import Head from 'next/head';
import { useSocket } from '../hooks/useSocket';
import LoginForm from '../components/lobby/LoginForm';
import WaitingRoom from '../components/lobby/WaitingRoom';

export default function Home() {
  const { socket, room, player, roleInfo, error, setError, loading, joinRoom } = useSocket();

  const handleSubmit = ({ name, roomCode, isGuru }) => {
    setError('');
    if (!name) { setError('Nama panggilan wajib diisi!'); return; }
    if (name.length < 2 || name.length > 12) { setError('Nama harus antara 2–12 karakter.'); return; }
    if (!isGuru && !roomCode) { setError('Kode room wajib diisi untuk siswa!'); return; }
    joinRoom(roomCode, name, isGuru);
  };

  // Saat WaitingRoom aktif: halaman penuh tanpa padding/centering
  if (room) {
    return (
      <>
        <Head>
          <title>TU-DUH! Pancasila - Ruang Tunggu</title>
          <meta name="description" content="Ruang tunggu game edukasi TU-DUH! Pancasila" />
        </Head>
        <WaitingRoom socket={socket} room={room} player={player} roleInfo={roleInfo} />
      </>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden stars-bg">
      <Head>
        <title>TU-DUH! Pancasila - Lobby</title>
        <meta name="description" content="Game edukasi multiplayer bertema nilai-nilai luhur Pancasila" />
      </Head>

      {/* Dekorasi mengambang */}
      <div className="absolute top-20 left-12 text-5xl opacity-10 select-none animate-float-soft-1 hidden md:block">🧑‍🚀</div>
      <div className="absolute bottom-24 left-20 text-4xl opacity-10 select-none animate-float-soft-2 hidden md:block">🚀</div>
      <div className="absolute top-32 right-16 text-5xl opacity-10 select-none animate-float-soft-2 hidden md:block">🏫</div>
      <div className="absolute bottom-20 right-24 text-4xl opacity-10 select-none animate-float-soft-1 hidden md:block">🇮🇩</div>

      <LoginForm onSubmit={handleSubmit} error={error} loading={loading} />
    </div>
  );
}

