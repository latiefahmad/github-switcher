# GitHub Profile Switcher

> Switch between multiple GitHub accounts (git config, SSH key, token, credentials) with one click in VSCode or Antigravity.

---

### Language / Bahasa
* 🌍 [English](#english)
* 🇮🇩 [Bahasa Indonesia](#bahasa-indonesia)

---

<a name="english"></a>
## 🌍 English

Easy-to-use extension to manage and switch between multiple GitHub identities within VSCode or Antigravity.

### ⚡ Features
- 🌟 **Inline Status Bar** — Shows active profile name and email directly in the status bar.
- 📋 **Rich Detail Popup** — Click the status bar to view active profile details and quick actions.
- ⚡ **Auto Gen SSH Key** — Automatically generate a secure `Ed25519` SSH key with one click.
- 🔗 **Convert to SSH** — Detects HTTPS remotes and offers one-click conversion to SSH to resolve multi-account credential conflicts.
- 🔑 **Secure Token Storage** — Stored safely in your OS keychain (via VSCode SecretStorage).
- 🔗 **Workspace Binding** — Bind profiles to specific folders/repos for automatic switching when opened.
- 🔀 **Owner Mismatch Detection** *(New in v1.9.4)* — Automatically detects when the remote repo owner belongs to a different profile and offers to correct the SSH URL instantly.
- 🧠 **Smart Active Profile Tracking** *(New in v1.9.5)* — Uses VS Code's workspace state to track the active profile per-workspace, so switching profiles is always in sync across the status bar, quick menu, and profile panel.
- 📤 **Export & Import** — Easily backup and migrate all profiles + encrypted tokens.
- 🎨 **Premium UI** — Glassmorphism UI panel design with responsive micro-interactions.

### 🚀 Installation
1. Download the latest VSIX file: [github-profile-switcher-1.9.5.vsix](https://github.com/latiefahmad/github-switcher/releases/download/v1.9.5/github-profile-switcher-1.9.5.vsix) (or visit [GitHub Releases](https://github.com/latiefahmad/github-switcher/releases)).
2. Open VSCode/Antigravity → go to Extensions (`Ctrl+Shift+X`).
3. Click the `···` menu at the top-right of the Extensions panel → select **Install from VSIX...**.
4. Choose the downloaded `github-profile-switcher-1.9.5.vsix` file.
5. Reload the IDE if prompted.

### 📖 How to Use
#### 1. Setup Profile & SSH Key
- Open the panel: `Ctrl+Shift+P` → **GitHub Switcher: Manage GitHub Profiles**.
- Click **+ Add Profile**.
- Under **SSH Private Key**, click **⚡ Auto Gen** to create a secure SSH key instantly.
- Click **📋 Copy & Go to GitHub** to copy your public key and register it in your GitHub SSH settings.
- Enter your Personal Access Token (PAT) with the `repo` scope.
- Save the profile.

#### 2. Switching Profiles (Daily Use)
- Click the active profile name in the **Status Bar** (bottom left).
- Select a different profile from the quick menu, or open **Manage Profiles** panel and click **Activate**.
- The extension instantly updates `git config`, SSH key, and credentials for the active workspace.
- Push/pull as usual — no logout required!

#### 3. Fixing Push/Pull Errors (Permission Denied)
If your repository remote uses HTTPS, multiple accounts can clash with Windows Credentials.
- Click the active profile name in the Status Bar.
- Under actions, select **Convert Remote to SSH**.
- The extension changes the remote URL automatically.

#### 4. Publishing a New Repository (First Time)
> ⚠️ The blue **"Publish Branch"** button in VS Code's Source Control panel uses VS Code's own GitHub account login — **not** the profile managed by this extension. To publish to a different account:
1. Create the repository manually at [github.com/new](https://github.com/new) while logged into the target account.
2. In the terminal, run:
   ```bash
   git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
   The extension will use the correct SSH key automatically. No login/logout needed!

#### 5. Migration (Export/Import)
- Click **📤 Export Profiles** to save your configurations.
- On a new machine, click **📥 Import Profiles** to load all accounts instantly.

---

<a name="bahasa-indonesia"></a>
## 🇮🇩 Bahasa Indonesia

Ekstensi sederhana untuk mengelola dan beralih di antara beberapa akun GitHub secara instan di VSCode atau Antigravity.

### ⚡ Fitur Utama
- 🌟 **Inline Status Bar** — Menampilkan profil aktif dan email langsung di status bar.
- 📋 **Rich Detail Popup** — Klik status bar untuk melihat detail profil dan menu aksi cepat.
- ⚡ **Auto Gen SSH Key** — Generate kunci SSH (`Ed25519`) instan langsung dari panel, lengkap dengan tombol copy key & link daftarkan ke GitHub.
- 🔗 **Convert to SSH** — Deteksi remote HTTPS dan tawarkan konversi sekali klik ke SSH untuk mengatasi masalah autentikasi multi-akun.
- 🔑 **Token Storage** — GitHub token disimpan terenkripsi di OS keychain (via VSCode SecretStorage).
- 🔗 **Workspace Binding** — Bind profil ke folder proyek tertentu, otomatis switch saat workspace dibuka.
- 🔀 **Deteksi Owner Mismatch** *(Baru di v1.9.4)* — Mendeteksi otomatis jika pemilik remote repo milik profil lain dan menawarkan koreksi URL SSH secara instan.
- 🧠 **Smart Active Profile Tracking** *(Baru di v1.9.5)* — Menggunakan workspace state VS Code untuk melacak profil aktif per-folder, sehingga status bar, menu cepat, dan panel profil selalu sinkron.
- 📤 **Export & Import** — Backup dan pindahkan semua profil + token rahasia antar IDE atau komputer.
- 🎨 **Premium UI** — Panel manajemen profil modern berbasis Glassmorphism dengan animasi micro-interaction.

### 🚀 Cara Install
1. Download file VSIX versi terbaru: [github-profile-switcher-1.9.5.vsix](https://github.com/latiefahmad/github-switcher/releases/download/v1.9.5/github-profile-switcher-1.9.5.vsix) (atau kunjungi halaman [GitHub Releases](https://github.com/latiefahmad/github-switcher/releases))
2. Buka VSCode / Antigravity → Extensions (`Ctrl+Shift+X`)
3. Klik tombol `···` (Menu) di kanan atas panel Extensions → pilih **Install from VSIX...**
4. Pilih file `github-profile-switcher-1.9.5.vsix` yang telah didownload.
5. Jalankan perintah `Developer: Reload Window` jika diperlukan.

### 📖 Cara Penggunaan
#### 1. Membuat Profil & SSH Key Baru
* Buka Panel Manager lewat Command Palette (`Ctrl+Shift+P` → **GitHub Switcher: Manage GitHub Profiles**).
* Klik **+ Add Profile**.
* Isi label, Git Name, Email, dan Username GitHub.
* Pada kolom **SSH Private Key**:
  * Klik tombol **⚡ Auto Gen** untuk membuat kunci SSH otomatis secara instan.
  * Klik **📋 Copy & Go to GitHub** untuk menyalin kunci publik dan membuka halaman setting SSH GitHub.
* Isi token PAT dengan scope `repo`.
* Klik **Save Profile**.

#### 2. Ganti Profil (Penggunaan Sehari-hari)
* Klik nama profil aktif di **Status Bar** (pojok kiri bawah).
* Pilih profil lain dari menu cepat, atau buka panel **Manage Profiles** dan klik **Activate**.
* Ekstensi otomatis mengubah `git config`, SSH key, dan credential di workspace aktif.
* Push/pull seperti biasa — **tidak perlu logout!**

#### 3. Mengatasi Error Push/Pull (Permission Denied)
Jika repositorimu menggunakan HTTPS, koneksi multi-akun sering mengalami bentrok credential di Windows.
* Klik status bar di bawah → pilih **Convert Remote to SSH** pada menu popup Actions.
* Ekstensi akan mengubah remote URL ke SSH secara otomatis.

#### 4. Publish Repo Baru (Pertama Kali)
> ⚠️ Tombol biru **"Publish Branch"** di panel Source Control VS Code menggunakan akun login internal VS Code — **bukan** profil yang dikelola ekstensi ini. Untuk publish ke akun yang berbeda:
1. Buat repositori baru secara manual di [github.com/new](https://github.com/new) sambil login ke akun tujuan.
2. Jalankan perintah berikut di terminal:
   ```bash
   git remote add origin git@github.com:USERNAME_KAMU/NAMA_REPO.git
   git push -u origin main
   ```
   Ekstensi akan otomatis menggunakan SSH key yang benar sesuai profil aktif. **Tidak perlu login/logout!**

> **Catatan:** Setelah repo sudah memiliki remote (sudah pernah dipublish), kamu cukup **switch profil → push** seperti biasa tanpa perlu login/logout sama sekali.

#### 5. Migrasi Profil ke IDE / Komputer Lain
* Di panel **Manage GitHub Profiles**, klik **📤 Export Profiles** untuk menyimpan file backup `.json`.
* Di IDE/komputer tujuan, klik **📥 Import Profiles** dan pilih file `.json` tersebut.

---

## 🛠️ Commands

| Command | Shortcut / Letak | Kegunaan |
|---|---|---|
| **Show Active Profile** | Klik Status Bar / Palette | Memunculkan popup detail info profil aktif & menu aksi |
| **Switch GitHub Profile** | `Ctrl+Shift+G, Ctrl+Shift+S` | Menu QuickPick cepat untuk ganti profil |
| **Manage GitHub Profiles** | `Ctrl+Shift+G, Ctrl+Shift+P` | Membuka Panel UI utama manajemen profil |
| **Convert Remote to SSH** | Status Bar Klik → Actions | Mengubah URL git remote HTTPS menjadi SSH |
| **Bind Current Workspace** | Command Palette | Mengunci folder proyek aktif ke profil tertentu |

---

## ⚙️ Settings

* `githubSwitcher.applyGlobally` (default: `false`): Jika `true`, setelan `git config` diterapkan secara global (`--global`), bukan lokal per-repositori.
* `githubSwitcher.showStatusBar` (default: `true`): Menampilkan status bar profil aktif di kiri bawah.
* `githubSwitcher.autoSwitchOnWorkspaceOpen` (default: `true`): Otomatis mengganti profil ketika membuka folder proyek yang telah di-bind.

---

## 📋 Changelog

### v1.9.5 — Smart Active Profile Tracking
- 🔧 **Fix:** Status bar, QuickPick menu, dan panel profil kini selalu sinkron saat ganti profil di workspace yang sudah ter-bind.
- 🧠 Menggunakan `workspaceState` VS Code untuk melacak profil aktif per-folder secara terpisah dari data binding otomatis.

### v1.9.4 — Owner Mismatch Detection
- 🔀 Deteksi otomatis ketika pemilik remote repo berbeda dengan profil aktif (misal remote milik `@latiefahmad` saat pakai profil `@ltfhmd`).
- ⚠️ Modal peringatan interaktif dengan opsi konversi SSH ke username yang tepat atau mempertahankan owner asli.

### v1.9.3 — Dynamic Workspace Resolution
- 🔧 **Fix:** Ekstensi kini mendeteksi folder proyek aktif berdasarkan file yang sedang diedit, bukan selalu folder pertama.
- 🔄 Status bar dan panel profil otomatis terupdate saat berpindah tab file di multi-root workspace.

### v1.9.x — SSH Integration in Profile Form
- Checkbox **Bind this workspace** dan **Convert to SSH** langsung di form tambah/edit profil.
- Modal warning saat remote masih HTTPS setelah switch profil.

---

## ☕ Support & Donation / Dukungan & Donasi

If this extension has helped you work faster and resolve authentication conflicts, consider buying me a coffee!
Jika ekstensi ini membantu mempermudah pekerjaanmu, dukung pengembangannya lewat:

<p align="left">
  <a href="https://saweria.co/latiefahmad" target="_blank">
    <img src="https://img.shields.io/badge/SAWERIA-DUKUNG%20SAYA-orange?style=for-the-badge&labelColor=555555&color=fa6400" alt="Saweria" />
  </a>
  &nbsp;&nbsp;
  <a href="https://trakteer.id/latiefahmad/tip" target="_blank">
    <img src="https://img.shields.io/badge/TRAKTEER-TRAKTIR%20KOPI-red?style=for-the-badge&logo=ko-fi&logoColor=white&labelColor=555555&color=cc1818" alt="Trakteer" />
  </a>
</p>

Thank you for your support! / Terima kasih banyak atas dukungannya!
