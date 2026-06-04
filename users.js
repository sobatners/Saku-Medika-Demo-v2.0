// ============================================================
// users.js — Modul Manajemen Akun Saku Medika
// Data disimpan di localStorage (offline-ready, aman untuk GitHub Pages & APK)
// ============================================================

const SakuMedika = (function () {

  const STORAGE_KEY = 'sakumedika_users';
  const SESSION_KEY = 'sakumedika_session';

  // ── Ambil semua data user dari localStorage ──
  function _getUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  // ── Simpan data user ke localStorage ──
  function _saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  // ── Inisialisasi: cukup pastikan storage ada, tidak buat akun default ──
  function init() {
    // Tidak ada akun default — user pertama wajib membuat akunnya sendiri
  }

  // ── Cek apakah belum ada akun sama sekali (first-run) ──
  function isFirstRun() {
    return Object.keys(_getUsers()).length === 0;
  }

  // ── Login: kembalikan true jika berhasil ──
  function login(username, password) {
    if (!username || !password) return { ok: false, msg: 'Username dan password tidak boleh kosong.' };
    var users = _getUsers();
    var u = username.trim();
    var p = password.trim();
    if (!users[u]) return { ok: false, msg: 'Username tidak ditemukan.' };
    if (users[u].password !== p) return { ok: false, msg: 'Password salah.' };
    // Simpan sesi
    sessionStorage.setItem(SESSION_KEY, u);
    return { ok: true, username: u };
  }

  // ── Logout ──
  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  // ── Cek apakah sedang login ──
  function currentUser() {
    return sessionStorage.getItem(SESSION_KEY) || null;
  }

  // ── Daftar akun baru ──
  function register(username, password, confirmPassword) {
    var u = (username || '').trim();
    var p = (password || '').trim();
    var cp = (confirmPassword || '').trim();

    if (!u || !p) return { ok: false, msg: 'Username dan password tidak boleh kosong.' };
    if (u.length < 3) return { ok: false, msg: 'Username minimal 3 karakter.' };
    if (p.length < 6) return { ok: false, msg: 'Password minimal 6 karakter.' };
    if (p !== cp) return { ok: false, msg: 'Konfirmasi password tidak cocok.' };
    if (!/^[a-zA-Z0-9_]+$/.test(u)) return { ok: false, msg: 'Username hanya boleh huruf, angka, dan underscore (_).' };

    var users = _getUsers();
    if (users[u]) return { ok: false, msg: 'Username sudah digunakan, pilih username lain.' };

    users[u] = {
      password: p,
      createdAt: new Date().toISOString(),
      role: 'user'
    };
    _saveUsers(users);
    return { ok: true, msg: 'Akun berhasil dibuat! Silakan login.' };
  }

  // ── Ganti password (perlu password lama) ──
  function changePassword(username, oldPassword, newPassword, confirmNew) {
    var u = (username || '').trim();
    var op = (oldPassword || '').trim();
    var np = (newPassword || '').trim();
    var cp = (confirmNew || '').trim();

    if (!op || !np) return { ok: false, msg: 'Semua kolom wajib diisi.' };
    if (np.length < 6) return { ok: false, msg: 'Password baru minimal 6 karakter.' };
    if (np !== cp) return { ok: false, msg: 'Konfirmasi password baru tidak cocok.' };

    var users = _getUsers();
    if (!users[u]) return { ok: false, msg: 'User tidak ditemukan.' };
    if (users[u].password !== op) return { ok: false, msg: 'Password lama salah.' };

    users[u].password = np;
    _saveUsers(users);
    return { ok: true, msg: 'Password berhasil diubah!' };
  }

  // ── Ganti username (perlu password untuk konfirmasi) ──
  function changeUsername(oldUsername, password, newUsername) {
    var ou = (oldUsername || '').trim();
    var p = (password || '').trim();
    var nu = (newUsername || '').trim();

    if (!nu) return { ok: false, msg: 'Username baru tidak boleh kosong.' };
    if (nu.length < 3) return { ok: false, msg: 'Username baru minimal 3 karakter.' };
    if (!/^[a-zA-Z0-9_]+$/.test(nu)) return { ok: false, msg: 'Username hanya boleh huruf, angka, dan underscore (_).' };

    var users = _getUsers();
    if (!users[ou]) return { ok: false, msg: 'User tidak ditemukan.' };
    if (users[ou].password !== p) return { ok: false, msg: 'Password salah. Tidak dapat mengubah username.' };
    if (users[nu]) return { ok: false, msg: 'Username baru sudah digunakan.' };

    // Salin data ke username baru, hapus yang lama
    users[nu] = Object.assign({}, users[ou]);
    delete users[ou];
    _saveUsers(users);

    // Update sesi
    sessionStorage.setItem(SESSION_KEY, nu);
    return { ok: true, msg: 'Username berhasil diubah menjadi "' + nu + '"!' };
  }

  // ── Hapus akun sendiri (perlu password) ──
  function deleteAccount(username, password) {
    var u = (username || '').trim();
    var p = (password || '').trim();
    var users = _getUsers();
    if (!users[u]) return { ok: false, msg: 'User tidak ditemukan.' };
    if (users[u].password !== p) return { ok: false, msg: 'Password salah.' };
    if (users[u].role === 'admin' && Object.values(users).filter(x => x.role === 'admin').length === 1) {
      return { ok: false, msg: 'Tidak bisa menghapus satu-satunya akun admin.' };
    }
    delete users[u];
    _saveUsers(users);
    logout();
    return { ok: true, msg: 'Akun berhasil dihapus.' };
  }

  return { init, login, logout, currentUser, isFirstRun, register, changePassword, changeUsername, deleteAccount };

})();
