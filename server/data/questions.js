// Bank Soal Pancasila — sumber data statis, di-clone saat room dibuat
const PANCASILA_QUESTIONS = [
  // ── Sila ke-1 ──
  {
    id: 1, sila: 1, type: 'multiple_choice',
    question: 'Menghormati serta bekerja sama antara pemeluk agama dan penganut kepercayaan yang berbeda-beda merupakan perwujudan dari sila ke...',
    options: ['Satu (Ketuhanan Yang Maha Esa)', 'Dua (Kemanusiaan yang Adil dan Beradab)', 'Tiga (Persatuan Indonesia)', 'Lima (Keadilan Sosial Bagi Seluruh Rakyat Indonesia)'],
    answer: 0,
    explanation: 'Sila ke-1 menekankan toleransi, penghormatan, dan kerja sama antarpemeluk agama demi terciptanya kerukunan hidup.'
  },
  {
    id: 2, sila: 1, type: 'true_false',
    question: 'Memaksakan suatu agama atau kepercayaan kepada orang lain merupakan tindakan yang sejalan dengan nilai Pancasila Sila Pertama.',
    options: ['Benar', 'Salah'], answer: 1,
    explanation: 'Memaksakan kehendak beragama bertentangan dengan prinsip kebebasan beragama yang dijamin oleh Sila Pertama.'
  },
  {
    id: 3, sila: 1, type: 'multiple_choice',
    question: 'Contoh nyata penerapan Sila Pertama Pancasila dalam kehidupan bersekolah sehari-hari adalah...',
    options: ['Memilih ketua kelas berdasarkan kesamaan suku', 'Mendoakan teman yang sedang sakit menurut keyakinan masing-masing', 'Kerja bakti membersihkan lingkungan sekolah tanpa pamrih', 'Menggalang dana untuk korban bencana alam'],
    answer: 1,
    explanation: 'Menghormati tata cara ibadah dan keyakinan masing-masing di sekolah adalah bentuk nyata toleransi beragama sila pertama.'
  },
  // ── Sila ke-2 ──
  {
    id: 4, sila: 2, type: 'multiple_choice',
    question: 'Mengakui persamaan derajat, persamaan hak, dan kewajiban asasi setiap manusia tanpa membeda-bedakan suku, keturunan, agama, jenis kelamin, dan kedudukan sosial adalah pengamalan sila...',
    options: ['Kesatu', 'Kedua', 'Ketiga', 'Keempat'], answer: 1,
    explanation: 'Sila Kedua (Kemanusiaan yang Adil dan Beradab) berfokus pada pemuliaan nilai kemanusiaan, persamaan derajat, dan tenggang rasa.'
  },
  {
    id: 5, sila: 2, type: 'true_false',
    question: 'Menjaga sopan santun, tidak melakukan perundungan (bullying) di sekolah maupun media sosial adalah bentuk pengamalan Sila Kedua.',
    options: ['Benar', 'Salah'], answer: 0,
    explanation: 'Menghargai harkat manusia dengan tidak merundung orang lain adalah cerminan adab kemanusiaan yang luhur (Sila Kedua).'
  },
  {
    id: 6, sila: 2, type: 'multiple_choice',
    question: 'Lambang rantai emas berlatar merah pada perisai Garuda Pancasila mewakili sila kedua. Mata rantai bulat dan persegi melambangkan...',
    options: ['Kekuatan militer dan pertahanan negara yang tangguh', 'Hubungan timbal balik antara pria (persegi) dan wanita (bulat) yang saling terikat', 'Kesuburan tanah air Indonesia dari Sabang sampai Merauke', 'Keanekaragaman budaya daerah yang bersatu padu'],
    answer: 1,
    explanation: 'Mata rantai berbentuk segi empat melambangkan laki-laki, sedangkan lingkaran melambangkan perempuan, keduanya saling mendukung secara adil dan sejajar.'
  },
  // ── Sila ke-3 ──
  {
    id: 7, sila: 3, type: 'multiple_choice',
    question: 'Sikap rela berkorban untuk kepentingan bangsa dan negara di atas kepentingan pribadi atau golongan merupakan bentuk pengamalan sila...',
    options: ['Kedua', 'Ketiga', 'Keempat', 'Kelima'], answer: 1,
    explanation: 'Sila Ketiga (Persatuan Indonesia) menuntut keutamaan kepentingan bersama, rasa cinta tanah air, dan kesediaan berkorban bagi NKRI.'
  },
  {
    id: 8, sila: 3, type: 'true_false',
    question: 'Mengembangkan rasa kebanggaan berkebangsaan dan bertanah air Indonesia melalui pemakaian produk lokal seperti Batik adalah contoh pengamalan Sila Ketiga.',
    options: ['Benar', 'Salah'], answer: 0,
    explanation: 'Mencintai dan mendukung industri dalam negeri memperkuat persatuan ekonomi dan kebanggaan nasional.'
  },
  {
    id: 9, sila: 3, type: 'multiple_choice',
    question: 'Berikut ini sikap yang dapat merusak sendi-sendi Persatuan Indonesia (Sila Ketiga) di era digital adalah...',
    options: ['Menyebarkan informasi hoaks bernuansa SARA yang memecah belah warga', 'Mengikuti upacara bendera secara khidmat', 'Mempelajari tarian tradisional daerah lain di Indonesia', 'Menerjemahkan lagu daerah ke dalam bahasa asing untuk promosi wisata'],
    answer: 0,
    explanation: 'Hoaks SARA merusak integrasi sosial dan kerukunan nasional, melanggar komitmen sila Persatuan Indonesia.'
  },
  // ── Sila ke-4 ──
  {
    id: 10, sila: 4, type: 'multiple_choice',
    question: 'Sebagai warga negara dan warga masyarakat, setiap manusia Indonesia mempunyai kedudukan, hak, dan kewajiban yang sama. Hal ini berarti tidak boleh...',
    options: ['Menghormati keputusan rapat kelompok', 'Memaksakan kehendak kita kepada orang lain', 'Mengutamakan musyawarah untuk mufakat', 'Melakukan voting jika terjadi jalan buntu'],
    answer: 1,
    explanation: 'Sila Keempat melarang pemaksaan kehendak pribadi karena keputusan harus diambil secara demokratis melalui permusyawaratan.'
  },
  {
    id: 11, sila: 4, type: 'true_false',
    question: 'Dalam musyawarah untuk mufakat, jika pendapat kita tidak diterima, kita berhak menolak melaksanakan keputusan bersama tersebut.',
    options: ['Benar', 'Salah'], answer: 1,
    explanation: 'Kita harus beriktikad baik dan bertanggung jawab dalam menerima serta melaksanakan hasil keputusan musyawarah bersama.'
  },
  {
    id: 12, sila: 4, type: 'multiple_choice',
    question: 'Siapakah tokoh yang mengusulkan nama "Pancasila" pada sidang BPUPKI tanggal 1 Juni 1945?',
    options: ['Drs. Mohammad Hatta', 'Mr. Mohammad Yamin', 'Ir. Soekarno', 'Prof. Dr. Soepomo'],
    answer: 2,
    explanation: 'Ir. Soekarno menyampaikan pidato tentang dasar negara Indonesia merdeka dan mengusulkan nama Pancasila pada 1 Juni 1945.'
  },
  // ── Sila ke-5 ──
  {
    id: 13, sila: 5, type: 'multiple_choice',
    question: 'Mengembangkan sikap adil terhadap sesama, menjaga keseimbangan antara hak dan kewajiban, serta menghormati hak orang lain adalah butir Pancasila sila...',
    options: ['Kedua', 'Ketiga', 'Keempat', 'Kelima'], answer: 3,
    explanation: 'Sila Kelima (Keadilan Sosial Bagi Seluruh Rakyat Indonesia) mencakup keadilan sosial, hak-kewajiban yang seimbang, dan menghormati hak orang lain.'
  },
  {
    id: 14, sila: 5, type: 'true_false',
    question: 'Bergaya hidup mewah, bersikap boros, dan suka pamer kekayaan di media sosial tidak bertentangan dengan nilai-nilai Sila Kelima Pancasila.',
    options: ['Benar', 'Salah'], answer: 1,
    explanation: 'Sila Kelima melarang perbuatan pemborosan, gaya hidup mewah, dan hal-hal yang merugikan kepentingan umum.'
  },
  {
    id: 15, sila: 5, type: 'multiple_choice',
    question: 'Padi dan kapas pada lambang Sila Kelima melambangkan...',
    options: ['Kejayaan maritim dan kekayaan rempah-rempah', 'Sandang (kapas) dan pangan (padi) sebagai kebutuhan pokok kemakmuran rakyat', 'Kerukunan beragama dan toleransi berkeyakinan', 'Gotong royong dan kesenian nasional'],
    answer: 1,
    explanation: 'Padi dan Kapas menyimbolkan kebutuhan dasar berupa pangan dan sandang bagi seluruh rakyat secara merata tanpa kesenjangan.'
  },
  // ── Sejarah ──
  {
    id: 16, sila: 'sejarah', type: 'multiple_choice',
    question: 'Sidang BPUPKI pertama dilaksanakan pada tanggal 29 Mei - 1 Juni 1945 bertujuan untuk merumuskan...',
    options: ['UUD 1945', 'Teks Proklamasi Kemerdekaan', 'Dasar Negara Indonesia Merdeka', 'Struktur Kementerian Negara'],
    answer: 2,
    explanation: 'Sidang pertama BPUPKI secara khusus membahas mengenai dasar filsafat negara Indonesia merdeka.'
  },
  {
    id: 17, sila: 'sejarah', type: 'multiple_choice',
    question: 'Dokumen bersejarah hasil kerja Panitia Sembilan pada tanggal 22 Juni 1945 dinamakan...',
    options: ['Piagam Jakarta (Jakarta Charter)', 'Dekrit Presiden', 'Pancasila Sakti', 'Trisakti Soekarno'],
    answer: 0,
    explanation: 'Piagam Jakarta dirumuskan oleh Panitia Sembilan dan memuat rancangan pembukaan UUD serta rumusan Pancasila pertama kali secara tertulis.'
  },
  {
    id: 18, sila: 'sejarah', type: 'true_false',
    question: 'Hari Kesaktian Pancasila diperingati setiap tanggal 1 Oktober untuk mengenang keberhasilan mempertahankan ideologi Pancasila dari ancaman kudeta.',
    options: ['Benar', 'Salah'], answer: 0,
    explanation: 'Hari Kesaktian Pancasila diperingati 1 Oktober, berbeda dengan Hari Lahir Pancasila yang diperingati setiap 1 Juni.'
  },
  {
    id: 19, sila: 'sejarah', type: 'multiple_choice',
    question: 'Dalam Piagam Jakarta sila pertama berbunyi "Ketuhanan dengan kewajiban menjalankan syariat Islam bagi pemeluk-pemeluknya". Kalimat tersebut kemudian diubah pada sidang PPKI 18 Agustus 1945 menjadi...',
    options: ['Ketuhanan Yang Maha Esa', 'Ketuhanan Yang Berkeadilan dan Beradab', 'Kemanusiaan Yang Adil dan Beradab', 'Ketuhanan Berdasarkan Kemanusiaan Yang Luhur'],
    answer: 0,
    explanation: 'Perubahan dilakukan demi menjaga persatuan Indonesia yang majemuk atas usulan tokoh-tokoh dari Indonesia bagian timur.'
  },
  // ── Umum ──
  {
    id: 20, sila: 'umum', type: 'multiple_choice',
    question: 'Sikap toleran, mau mendengarkan, serta mengapresiasi kebudayaan daerah lain adalah penerapan dari integrasi sila ke...',
    options: ['Sila 1 dan Sila 2', 'Sila 2 dan Sila 3', 'Sila 3 dan Sila 4', 'Sila 4 dan Sila 5'],
    answer: 1,
    explanation: 'Mengapresiasi kebudayaan daerah lain memadukan nilai kemanusiaan (Sila 2) dan semangat persatuan bangsa (Sila 3).'
  }
];

module.exports = { PANCASILA_QUESTIONS };
