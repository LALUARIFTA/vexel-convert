    const STORAGE_KEY = 'vexelflow_workspace_state_v2';

    const DEFAULT_FILES = [
      {
        id: 'vf-101',
        name: 'Illustr_3485.jpg',
        sourceFormat: 'JPG',
        targetFormat: 'PDF',
        sizeMb: 3.5,
        status: 'Converted',
        scope: 'personal',
        inActiveQueue: true,
        updatedAt: '2026-11-13 20:45',
      },
      {
        id: 'vf-102',
        name: 'Illustr_3568.jpg',
        sourceFormat: 'JPG',
        targetFormat: 'PDF',
        sizeMb: 1.8,
        status: 'Converted',
        scope: 'personal',
        inActiveQueue: true,
        updatedAt: '2026-11-13 20:48',
      },
      {
        id: 'vf-103',
        name: 'Illustr_31276.jpg',
        sourceFormat: 'JPG',
        targetFormat: 'PDF',
        sizeMb: 2.4,
        status: 'Converting',
        scope: 'personal',
        inActiveQueue: true,
        updatedAt: '2026-11-13 21:10',
      },
      {
        id: 'vf-104',
        name: 'img2045.png',
        sourceFormat: 'PNG',
        targetFormat: 'SVG',
        sizeMb: 2.1,
        status: 'Converted',
        scope: 'shared-by-you',
        inActiveQueue: false,
        updatedAt: '2026-11-13 19:20',
      },
      {
        id: 'vf-105',
        name: 'icon24.svg',
        sourceFormat: 'SVG',
        targetFormat: 'PNG',
        sizeMb: 0.25,
        status: 'Converted',
        scope: 'shared-by-you',
        inActiveQueue: false,
        updatedAt: '2026-11-13 18:05',
      },
      {
        id: 'vf-106',
        name: 'article.doc',
        sourceFormat: 'DOC',
        targetFormat: 'XLS',
        sizeMb: 0.45,
        status: 'Converted',
        scope: 'shared-with-you',
        inActiveQueue: false,
        updatedAt: '2026-11-12 16:40',
      },
      {
        id: 'vf-107',
        name: 'present19.pdf',
        sourceFormat: 'PDF',
        targetFormat: 'JPG',
        sizeMb: 3.5,
        status: 'Converted',
        scope: 'shared-with-you',
        inActiveQueue: false,
        updatedAt: '2026-11-12 14:15',
      },
      {
        id: 'vf-108',
        name: 'photo1.jpg',
        sourceFormat: 'JPG',
        targetFormat: 'PDF',
        sizeMb: 7.8,
        status: 'Converted',
        scope: 'personal',
        inActiveQueue: false,
        updatedAt: '2026-11-11 11:30',
      },
    ];

    let appState = {
      route: 'home',
      converterSource: 'JPG',
      converterTarget: 'PDF',
      activeToolLabel: 'JPG to PDF',
      toolsAccordionOpen: true,
      quotaMax: 20,
      user: {
        name: 'Nadia Pratama',
        email: 'nadia.pratama@vexelflow.io',
      },
      files: [],
      selectedIds: [],
      sortField: 'updatedAt',
      sortDir: 'desc',
      currentPage: 1,
      rowsPerPage: 8,
    };

    let pendingDeleteIds = [];

    // Initialize State from localStorage
    function initState() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          appState = { ...appState, ...parsed, selectedIds: [] };
        } catch (e) {
          appState.files = structuredClone(DEFAULT_FILES);
        }
      } else {
        appState.files = structuredClone(DEFAULT_FILES);
      }
      persistState();
      renderAll();
    }

    function persistState() {
      const toSave = {
        converterSource: appState.converterSource,
        converterTarget: appState.converterTarget,
        activeToolLabel: appState.activeToolLabel,
        quotaMax: appState.quotaMax,
        user: appState.user,
        files: appState.files,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    }

    function resetDemoData() {
      appState.files = structuredClone(DEFAULT_FILES);
      appState.quotaMax = 20;
      appState.selectedIds = [];
      appState.currentPage = 1;
      persistState();
      renderAll();
      showToast('Data default workspace berhasil dipulihkan.', 'info');
    }

    // Sidebar Accordion Toggle for Converter Tools
    function toggleToolsAccordion() {
      appState.toolsAccordionOpen = !appState.toolsAccordionOpen;
      const list = document.getElementById('toolsSubmenuList');
      const chevron = document.getElementById('toolsAccordionChevron');
      const btn = document.getElementById('toolsAccordionBtn');

      if (appState.toolsAccordionOpen) {
        list.classList.remove('hidden');
        chevron.classList.add('rotate-180');
        btn.setAttribute('aria-expanded', 'true');
      } else {
        list.classList.add('hidden');
        chevron.classList.remove('rotate-180');
        btn.setAttribute('aria-expanded', 'false');
      }
    }

    function selectSidebarTool(src, tgt, label) {
      appState.converterSource = src;
      appState.converterTarget = tgt;
      appState.activeToolLabel = label;
      persistState();

      if (appState.route !== 'home') {
        navigateTo('home');
      } else {
        updateSidebarQuotaAndBadges();
        updateToolSubmenuHighlight();
        toggleMobileSidebar(false);
      }
      showToast(`Mode aktif: ${label} (${src} → ${tgt})`, 'info');
    }

    function updateToolSubmenuHighlight() {
      document.querySelectorAll('.tool-subitem').forEach((btn) => {
        const isMatch = btn.dataset.tool === appState.activeToolLabel;
        if (isMatch) {
          btn.classList.add('bg-brand-50/80', 'text-brand-600', 'font-semibold');
          btn.classList.remove('text-slate-500', 'font-medium');
        } else {
          btn.classList.remove('bg-brand-50/80', 'text-brand-600', 'font-semibold');
          btn.classList.add('text-slate-500', 'font-medium');
        }
      });
    }

    // Format Styling Helper
    function getFormatBadgeStyle(format) {
      const fmt = (format || 'JPG').toUpperCase();
      const map = {
        JPG: { bg: 'bg-brand-50', text: 'text-brand-600', border: 'border-brand-100' },
        PNG: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
        SVG: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
        DOC: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
        PDF: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
        XLS: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100' },
      };
      return map[fmt] || map.JPG;
    }

    function formatSizeDisplay(sizeMb) {
      if (sizeMb < 1) {
        return `${Math.round(sizeMb * 1024)} Kb`;
      }
      return `${Number(sizeMb).toFixed(1)} Mb`;
    }

    function renderFileIconBox(format) {
      const st = getFormatBadgeStyle(format);
      return `
        <div class="w-9 h-9 rounded-xl ${st.bg} ${st.text} border ${st.border} flex flex-col items-center justify-center shrink-0 select-none">
          <i data-lucide="file-text" class="w-3.5 h-3.5 mb-0.5"></i>
          <span class="text-[8px] font-extrabold tracking-tight leading-none">${format.toUpperCase()}</span>
        </div>
      `;
    }

    function renderStatusIndicator(status) {
      if (status === 'Converted') {
        return `
          <span class="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <i data-lucide="check" class="w-3.5 h-3.5"></i>
            <span>Converted</span>
          </span>
        `;
      }
      if (status === 'Converting') {
        return `
          <span class="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600">
            <i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i>
            <span>Converting...</span>
          </span>
        `;
      }
      if (status === 'Failed') {
        return `
          <span class="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600">
            <i data-lucide="alert-circle" class="w-3.5 h-3.5"></i>
            <span>Failed</span>
          </span>
        `;
      }
      return `
        <span class="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600">
          <i data-lucide="clock" class="w-3.5 h-3.5"></i>
          <span>Queued</span>
        </span>
      `;
    }

    // Master Render
    function renderAll() {
      updateNavigationUI();
      updateToolSubmenuHighlight();
      updateSidebarQuotaAndBadges();
      renderHomeQueue();
      renderHistoryRail();
      renderCrudTable();
      lucide.createIcons();
    }

    function updateSidebarQuotaAndBadges() {
      const total = appState.files.length;
      const sharedBy = appState.files.filter((f) => f.scope === 'shared-by-you').length;
      const sharedWith = appState.files.filter((f) => f.scope === 'shared-with-you').length;

      document.getElementById('navBadgeAll').textContent = total;
      document.getElementById('navBadgeSharedBy').textContent = sharedBy;
      document.getElementById('navBadgeSharedWith').textContent = sharedWith;

      document.getElementById('sidebarUserName').textContent = appState.user.name;
      document.getElementById('sidebarUserEmail').textContent = appState.user.email;

      document.getElementById('quotaUsedCount').textContent = total;
      document.getElementById('quotaMaxCount').textContent = appState.quotaMax;
      const pct = Math.min(100, Math.round((total / appState.quotaMax) * 100));
      document.getElementById('quotaProgressBar').style.width = `${pct}%`;

      document.getElementById('activeConverterTitle').textContent = `Convert ${appState.converterSource} to ${appState.converterTarget}`;
    }

    // Render Home Queue
    function renderHomeQueue() {
      const queueContainer = document.getElementById('homeQueueList');
      const queueFiles = appState.files.filter((f) => f.inActiveQueue);
      document.getElementById('homeQueueCount').textContent = queueFiles.length;

      if (queueFiles.length === 0) {
        queueContainer.innerHTML = `
          <div class="rounded-xl bg-slate-50 border border-slate-100 p-6 text-center text-xs text-slate-400">
            Belum ada file di antrean aktif. Unggah file atau klik <strong>+ Tambah Data</strong>.
          </div>
        `;
        return;
      }

      queueContainer.innerHTML = queueFiles
        .map(
          (file) => `
          <div class="group rounded-xl bg-slate-50/90 hover:bg-brand-50/45 border border-transparent hover:border-brand-100 px-3.5 py-2.5 flex items-center justify-between gap-3 transition-all">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              ${renderFileIconBox(file.sourceFormat)}
              <button onclick="openEditFileModal('${file.id}')" class="text-left font-medium text-xs sm:text-[13px] text-slate-800 hover:text-brand-600 truncate transition-colors" title="Klik untuk sunting file">
                ${escapeHtml(file.name)}
              </button>
            </div>

            <div class="hidden sm:flex items-center justify-center w-28 shrink-0">
              ${renderStatusIndicator(file.status)}
            </div>

            <div class="text-xs font-medium text-slate-400 w-16 text-right shrink-0">
              ${formatSizeDisplay(file.sizeMb)}
            </div>

            <div class="flex items-center gap-1 shrink-0">
              <button onclick="openEditFileModal('${file.id}')" title="Edit File" class="opacity-100 sm:opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-white transition-all">
                <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
              </button>
              <button onclick="requestDeleteFiles(['${file.id}'])" title="Hapus File" class="opacity-100 sm:opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-all">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
              <button onclick="downloadSingleFile('${file.id}')" title="Unduh Hasil Konversi" class="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-white transition-colors">
                <i data-lucide="download" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        `
        )
        .join('');
    }

    // Render Right Rail History List
    function renderHistoryRail() {
      const historyContainer = document.getElementById('historyRailList');
      const items = appState.files.slice(0, 8);

      historyContainer.innerHTML = items
        .map(
          (file) => `
          <div class="relative flex items-center justify-between gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition-colors group">
            <div class="flex items-center gap-3 min-w-0">
              ${renderFileIconBox(file.sourceFormat)}
              <div class="min-w-0">
                <p onclick="openEditFileModal('${file.id}')" class="text-xs font-semibold text-slate-800 hover:text-brand-600 truncate cursor-pointer">
                  ${escapeHtml(file.name)}
                </p>
                <p class="text-[11px] text-slate-400 mt-0.5">${formatSizeDisplay(file.sizeMb)}</p>
              </div>
            </div>

            <div class="relative">
              <button onclick="toggleDropdown('hist-menu-${file.id}')" aria-label="Menu File" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <i data-lucide="more-vertical" class="w-3.5 h-3.5"></i>
              </button>

              <div id="hist-menu-${file.id}" class="hidden absolute right-0 top-8 w-36 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1 z-30 text-xs">
                <button onclick="downloadSingleFile('${file.id}'); closeAllDropdowns();" class="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-brand-50 hover:text-brand-600 flex items-center gap-2">
                  <i data-lucide="download" class="w-3.5 h-3.5"></i> Unduh
                </button>
                <button onclick="openEditFileModal('${file.id}'); closeAllDropdowns();" class="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-brand-50 hover:text-brand-600 flex items-center gap-2">
                  <i data-lucide="pencil" class="w-3.5 h-3.5"></i> Edit
                </button>
                <button onclick="requestDeleteFiles(['${file.id}']); closeAllDropdowns();" class="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Hapus
                </button>
              </div>
            </div>
          </div>
        `
        )
        .join('');
    }

    // Full CRUD Table
    function getFilteredFiles() {
      const search = (document.getElementById('crudSearchInput')?.value || '').toLowerCase().trim();
      const fmtFilter = document.getElementById('crudFormatFilter')?.value || 'ALL';
      const statusFilter = document.getElementById('crudStatusFilter')?.value || 'ALL';

      return appState.files
        .filter((f) => {
          if (appState.route === 'shared-by-you' && f.scope !== 'shared-by-you') return false;
          if (appState.route === 'shared-with-you' && f.scope !== 'shared-with-you') return false;
          if (search && !f.name.toLowerCase().includes(search)) return false;
          if (fmtFilter !== 'ALL' && f.sourceFormat !== fmtFilter && f.targetFormat !== fmtFilter) return false;
          if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
          return true;
        })
        .sort((a, b) => {
          const dir = appState.sortDir === 'asc' ? 1 : -1;
          if (appState.sortField === 'sizeMb') return (a.sizeMb - b.sizeMb) * dir;
          return String(a[appState.sortField]).localeCompare(String(b[appState.sortField])) * dir;
        });
    }

    function renderCrudTable() {
      const tbody = document.getElementById('crudTableBody');
      if (!tbody) return;

      const filtered = getFilteredFiles();
      const totalFiltered = filtered.length;

      const convertedCount = filtered.filter((f) => f.status === 'Converted').length;
      const processingCount = filtered.filter((f) => f.status === 'Converting' || f.status === 'Queued').length;
      const totalMb = filtered.reduce((acc, f) => acc + Number(f.sizeMb || 0), 0);

      animateCountUp('kpiTotalFiles', totalFiltered);
      animateCountUp('kpiConvertedFiles', convertedCount);
      animateCountUp('kpiProcessingFiles', processingCount);
      document.getElementById('kpiTotalStorage').textContent = `${totalMb.toFixed(1)} MB`;

      const totalPages = Math.max(1, Math.ceil(totalFiltered / appState.rowsPerPage));
      if (appState.currentPage > totalPages) appState.currentPage = totalPages;

      const startIdx = (appState.currentPage - 1) * appState.rowsPerPage;
      const endIdx = Math.min(startIdx + appState.rowsPerPage, totalFiltered);
      const pageItems = filtered.slice(startIdx, endIdx);

      document.getElementById('pageRangeText').textContent = totalFiltered === 0 ? '0-0' : `${startIdx + 1}-${endIdx}`;
      document.getElementById('filteredTotalText').textContent = totalFiltered;

      if (pageItems.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="py-10 text-center text-slate-400">
              Tidak ada dokumen yang cocok dengan kriteria filter Anda.
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = pageItems
          .map((file) => {
            const isChecked = appState.selectedIds.includes(file.id);
            const scopeBadge =
              file.scope === 'shared-by-you'
                ? '<span class="px-2 py-0.5 rounded-md bg-brand-50 text-brand-600 font-medium">Shared by you</span>'
                : file.scope === 'shared-with-you'
                ? '<span class="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium">Shared with you</span>'
                : '<span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">Personal</span>';

            return `
              <tr class="hover:bg-brand-50/35 transition-colors ${isChecked ? 'bg-brand-50/60' : ''}">
                <td class="py-3 pl-3 pr-2">
                  <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleRowSelection('${file.id}', this.checked)" class="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                </td>
                <td class="py-3 px-3">
                  <div class="flex items-center gap-3">
                    ${renderFileIconBox(file.sourceFormat)}
                    <div>
                      <p class="font-semibold text-slate-800">${escapeHtml(file.name)}</p>
                      <p class="text-[11px] text-slate-400">${file.updatedAt}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-3 font-semibold text-slate-700">
                  ${file.sourceFormat} <span class="text-slate-400 mx-0.5">→</span> <span class="text-brand-600">${file.targetFormat}</span>
                </td>
                <td class="py-3 px-3">${renderStatusIndicator(file.status)}</td>
                <td class="py-3 px-3 font-medium text-slate-600">${formatSizeDisplay(file.sizeMb)}</td>
                <td class="py-3 px-3">${scopeBadge}</td>
                <td class="py-3 pl-3 pr-3 text-right">
                  <div class="inline-flex items-center gap-1">
                    <button onclick="downloadSingleFile('${file.id}')" title="Unduh" class="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50">
                      <i data-lucide="download" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="openEditFileModal('${file.id}')" title="Edit" class="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50">
                      <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="requestDeleteFiles(['${file.id}'])" title="Hapus" class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `;
          })
          .join('');
      }

      const pagContainer = document.getElementById('paginationControls');
      let pagHtml = `
        <button onclick="goToPage(${appState.currentPage - 1})" ${appState.currentPage === 1 ? 'disabled' : ''} class="px-2.5 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Prev</button>
      `;
      for (let p = 1; p <= totalPages; p++) {
        const activeCls = p === appState.currentPage ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50';
        pagHtml += `<button onclick="goToPage(${p})" class="w-7 h-7 rounded-lg border font-semibold ${activeCls}">${p}</button>`;
      }
      pagHtml += `
        <button onclick="goToPage(${appState.currentPage + 1})" ${appState.currentPage === totalPages ? 'disabled' : ''} class="px-2.5 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Next</button>
      `;
      pagContainer.innerHTML = pagHtml;

      updateBulkBarUI();
    }

    // SPA Navigation & Routing
    function navigateTo(route) {
      appState.route = route;
      appState.currentPage = 1;
      appState.selectedIds = [];
      toggleMobileSidebar(false);
      renderAll();
    }

    function updateNavigationUI() {
      document.querySelectorAll('.nav-item').forEach((btn) => {
        const isActive = btn.dataset.route === appState.route;
        if (isActive) {
          btn.className = 'nav-item w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-brand-50 text-brand-600 transition-all';
        } else {
          btn.className = 'nav-item w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all';
        }
      });

      document.querySelectorAll('.spa-view').forEach((v) => v.classList.add('hidden'));
      const subHeader = document.getElementById('subpageHeader');

      if (appState.route === 'home') {
        document.getElementById('view-home').classList.remove('hidden');
        subHeader.classList.add('hidden');
      } else if (['all-files', 'shared-by-you', 'shared-with-you'].includes(appState.route)) {
        document.getElementById('view-files').classList.remove('hidden');
        subHeader.classList.remove('hidden');
        subHeader.classList.add('flex');

        const titles = {
          'all-files': ['All Files & Conversion Repository', 'Kelola, filter, sunting, dan ekspor seluruh file hasil konversi Anda.'],
          'shared-by-you': ['Shared by You', 'Daftar dokumen yang telah Anda bagikan kepada kolaborator eksternal.'],
          'shared-with-you': ['Shared with You', 'Dokumen yang dibagikan tim kepada workspace Anda untuk dikonversi.'],
        };
        document.getElementById('breadcrumbCurrent').textContent = titles[appState.route][0];
        document.getElementById('filesViewHeading').textContent = titles[appState.route][0];
        document.getElementById('filesViewSubheading').textContent = titles[appState.route][1];
      } else if (appState.route === 'settings') {
        document.getElementById('view-settings').classList.remove('hidden');
        subHeader.classList.remove('hidden');
        subHeader.classList.add('flex');
        document.getElementById('breadcrumbCurrent').textContent = 'Settings';
      } else if (appState.route === 'support') {
        document.getElementById('view-support').classList.remove('hidden');
        subHeader.classList.remove('hidden');
        subHeader.classList.add('flex');
        document.getElementById('breadcrumbCurrent').textContent = 'Support Center';
      }
    }

    // CRUD Operations & Dropzone
    function openFileModal() {
      document.getElementById('fileModalTitle').textContent = 'Tambah File Konversi';
      document.getElementById('editFileId').value = '';
      document.getElementById('inputFileName').value = '';
      document.getElementById('inputSourceFormat').value = appState.converterSource;
      document.getElementById('inputTargetFormat').value = appState.converterTarget;
      document.getElementById('inputFileSize').value = '2.4';
      document.getElementById('inputFileStatus').value = 'Converted';
      document.getElementById('inputFileScope').value = appState.route.startsWith('shared') ? appState.route : 'personal';
      document.getElementById('inputInActiveQueue').checked = true;
      openModal('fileCrudModal');
    }

    function openEditFileModal(id) {
      const file = appState.files.find((f) => f.id === id);
      if (!file) return;

      document.getElementById('fileModalTitle').textContent = 'Edit Detail File';
      document.getElementById('editFileId').value = file.id;
      document.getElementById('inputFileName').value = file.name;
      document.getElementById('inputSourceFormat').value = file.sourceFormat;
      document.getElementById('inputTargetFormat').value = file.targetFormat;
      document.getElementById('inputFileSize').value = file.sizeMb;
      document.getElementById('inputFileStatus').value = file.status;
      document.getElementById('inputFileScope').value = file.scope;
      document.getElementById('inputInActiveQueue').checked = Boolean(file.inActiveQueue);
      openModal('fileCrudModal');
    }

    function handleFileFormSubmit(e) {
      e.preventDefault();
      const id = document.getElementById('editFileId').value;
      const name = document.getElementById('inputFileName').value.trim();
      const sourceFormat = document.getElementById('inputSourceFormat').value;
      const targetFormat = document.getElementById('inputTargetFormat').value;
      const sizeMb = parseFloat(document.getElementById('inputFileSize').value) || 1.0;
      const status = document.getElementById('inputFileStatus').value;
      const scope = document.getElementById('inputFileScope').value;
      const inActiveQueue = document.getElementById('inputInActiveQueue').checked;

      if (!name) return;

      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

      if (id) {
        const idx = appState.files.findIndex((f) => f.id === id);
        if (idx !== -1) {
          appState.files[idx] = {
            ...appState.files[idx],
            name,
            sourceFormat,
            targetFormat,
            sizeMb,
            status,
            scope,
            inActiveQueue,
            updatedAt: nowStr,
          };
          showToast(`Perubahan pada "${name}" berhasil disimpan.`, 'success');
        }
      } else {
        const newItem = {
          id: `vf-${Date.now()}`,
          name,
          sourceFormat,
          targetFormat,
          sizeMb,
          status,
          scope,
          inActiveQueue,
          updatedAt: nowStr,
        };
        appState.files.unshift(newItem);
        showToast(`"${name}" ditambahkan ke antrean konversi.`, 'success');

        if (status === 'Converting') {
          simulateConversionCompletion(newItem.id);
        }
      }

      persistState();
      closeModal('fileCrudModal');
      renderAll();
    }

    function requestDeleteFiles(ids) {
      pendingDeleteIds = ids;
      document.getElementById('deleteConfirmText').textContent =
        ids.length > 1
          ? `Anda akan menghapus ${ids.length} dokumen terpilih secara permanen.`
          : 'Dokumen ini akan dihapus secara permanen dari antrean aktif dan riwayat.';
      openModal('deleteConfirmModal');
    }

    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
      if (pendingDeleteIds.length === 0) return;
      appState.files = appState.files.filter((f) => !pendingDeleteIds.includes(f.id));
      appState.selectedIds = appState.selectedIds.filter((id) => !pendingDeleteIds.includes(id));
      persistState();
      closeModal('deleteConfirmModal');
      renderAll();
      showToast(`${pendingDeleteIds.length} dokumen berhasil dihapus.`, 'warning');
      pendingDeleteIds = [];
    });

    function handleDragOver(e) {
      e.preventDefault();
      document.getElementById('dropzoneArea').classList.add('dropzone-active');
    }

    function handleDragLeave(e) {
      e.preventDefault();
      document.getElementById('dropzoneArea').classList.remove('dropzone-active');
    }

    function handleFileDrop(e) {
      e.preventDefault();
      document.getElementById('dropzoneArea').classList.remove('dropzone-active');
      if (e.dataTransfer?.files?.length) {
        ingestUploadedFiles(e.dataTransfer.files);
      }
    }

    function handleNativeFileSelect(e) {
      if (e.target?.files?.length) {
        ingestUploadedFiles(e.target.files);
        e.target.value = '';
      }
    }

    function ingestUploadedFiles(fileList) {
      const allowed = ['JPG', 'PNG', 'SVG', 'DOC', 'PDF', 'XLS'];
      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

      Array.from(fileList).forEach((file, index) => {
        const extRaw = (file.name.split('.').pop() || 'JPG').toUpperCase();
        const ext = allowed.includes(extRaw) ? extRaw : 'JPG';
        const sizeMb = Math.max(0.2, +(file.size / (1024 * 1024)).toFixed(1));
        const newId = `vf-${Date.now()}-${index}`;

        appState.files.unshift({
          id: newId,
          name: file.name,
          sourceFormat: ext,
          targetFormat: appState.converterTarget,
          sizeMb,
          status: 'Converting',
          scope: 'personal',
          inActiveQueue: true,
          updatedAt: nowStr,
        });

        simulateConversionCompletion(newId);
      });

      persistState();
      renderAll();
      showToast(`${fileList.length} file diunggah dan sedang dikonversi...`, 'info');
    }

    function simulateConversionCompletion(fileId) {
      setTimeout(() => {
        const target = appState.files.find((f) => f.id === fileId);
        if (target && target.status === 'Converting') {
          target.status = 'Converted';
          persistState();
          renderAll();
          showToast(`Konversi "${target.name}" selesai!`, 'success');
        }
      }, 2200);
    }

    function completeAllConverting() {
      let updated = 0;
      appState.files.forEach((f) => {
        if (f.status !== 'Converted') {
          f.status = 'Converted';
          updated++;
        }
      });
      persistState();
      renderAll();
      showToast(updated > 0 ? `${updated} file selesai dikonversi.` : 'Semua file sudah berstatus Converted.', 'success');
    }

    function openAiModal() {
      openModal('aiStudioModal');
    }

    function runAiConversion(e) {
      e.preventDefault();
      const mode = document.getElementById('aiModeSelect').value;
      const rawName = document.getElementById('aiAssetName').value.trim() || 'ai_vector_output.svg';
      const isVector = mode === 'vectorize';

      const newItem = {
        id: `vf-ai-${Date.now()}`,
        name: rawName,
        sourceFormat: isVector ? 'PNG' : 'PDF',
        targetFormat: isVector ? 'SVG' : 'JPG',
        sizeMb: 1.6,
        status: 'Converted',
        scope: 'personal',
        inActiveQueue: true,
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };

      appState.files.unshift(newItem);
      persistState();
      closeModal('aiStudioModal');
      renderAll();
      showToast(`AI Studio selesai memproses "${rawName}".`, 'success');
    }

    function downloadSingleFile(id) {
      const file = appState.files.find((f) => f.id === id);
      if (!file) return;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const outName = `${baseName}.${file.targetFormat.toLowerCase()}`;
      triggerBlobDownload(outName, `VexelFlow Converted Artifact\nSource: ${file.name}\nTarget Format: ${file.targetFormat}\nSize: ${file.sizeMb} MB`);
      showToast(`Mengunduh ${outName}...`, 'success');
    }

    function downloadAllQueue() {
      const queue = appState.files.filter((f) => f.inActiveQueue);
      if (queue.length === 0) {
        showToast('Tidak ada file di antrean untuk diunduh.', 'warning');
        return;
      }
      const manifest = queue.map((f, i) => `${i + 1}. ${f.name} -> ${f.targetFormat} (${f.sizeMb} MB) [${f.status}]`).join('\n');
      triggerBlobDownload('VexelFlow_Batch_Bundle.txt', `VexelFlow Batch Export Manifest\n==============================\n${manifest}`);
      showToast(`Bundel ${queue.length} file berhasil diunduh.`, 'success');
    }

    function triggerBlobDownload(filename, content) {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    function handleCrudFilterChange() {
      appState.currentPage = 1;
      renderCrudTable();
      lucide.createIcons();
    }

    function toggleSort(field) {
      if (appState.sortField === field) {
        appState.sortDir = appState.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        appState.sortField = field;
        appState.sortDir = 'asc';
      }
      renderCrudTable();
      lucide.createIcons();
    }

    function goToPage(page) {
      appState.currentPage = Math.max(1, page);
      renderCrudTable();
      lucide.createIcons();
    }

    function changeRowsPerPage(val) {
      appState.rowsPerPage = Number(val) || 8;
      appState.currentPage = 1;
      renderCrudTable();
      lucide.createIcons();
    }

    function toggleRowSelection(id, checked) {
      if (checked && !appState.selectedIds.includes(id)) {
        appState.selectedIds.push(id);
      } else if (!checked) {
        appState.selectedIds = appState.selectedIds.filter((item) => item !== id);
      }
      updateBulkBarUI();
    }

    function toggleSelectAllRows(checked) {
      const visible = getFilteredFiles();
      appState.selectedIds = checked ? visible.map((f) => f.id) : [];
      renderCrudTable();
      lucide.createIcons();
    }

    function clearBulkSelection() {
      appState.selectedIds = [];
      const masterCb = document.getElementById('selectAllCheckbox');
      if (masterCb) masterCb.checked = false;
      renderCrudTable();
      lucide.createIcons();
    }

    function updateBulkBarUI() {
      const bar = document.getElementById('bulkActionBar');
      if (!bar) return;
      if (appState.selectedIds.length > 0) {
        bar.classList.remove('hidden');
        document.getElementById('selectedRowsCount').textContent = appState.selectedIds.length;
      } else {
        bar.classList.add('hidden');
      }
    }

    function confirmBulkDelete() {
      if (appState.selectedIds.length > 0) {
        requestDeleteFiles([...appState.selectedIds]);
      }
    }

    function switchSettingsTab(tab) {
      const isProfile = tab === 'profile';
      document.getElementById('settingsProfileForm').classList.toggle('hidden', !isProfile);
      document.getElementById('settingsEnginePanel').classList.toggle('hidden', isProfile);

      document.getElementById('stab-profile').className = isProfile
        ? 'settings-tab px-3.5 py-1.5 rounded-lg bg-white text-brand-600 shadow-xs'
        : 'settings-tab px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900';
      document.getElementById('stab-engine').className = !isProfile
        ? 'settings-tab px-3.5 py-1.5 rounded-lg bg-white text-brand-600 shadow-xs'
        : 'settings-tab px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900';
    }

    function saveSettings(e) {
      e.preventDefault();
      appState.user.name = document.getElementById('settingNameInput').value.trim() || appState.user.name;
      appState.user.email = document.getElementById('settingEmailInput').value.trim() || appState.user.email;
      persistState();
      updateSidebarQuotaAndBadges();
      showToast('Pengaturan workspace berhasil diperbarui.', 'success');
    }

    function submitSupportTicket(e) {
      e.preventDefault();
      document.getElementById('ticketSubject').value = '';
      document.getElementById('ticketMessage').value = '';
      showToast('Tiket bantuan terkirim! Nomor referensi #VX-8942.', 'success');
    }

    function openUpgradeModal() { openModal('upgradeModal'); }
    function openLogoutModal() { openModal('logoutModal'); }

    function activateProDemo() {
      appState.quotaMax = 100;
      persistState();
      updateSidebarQuotaAndBadges();
      closeModal('upgradeModal');
      showToast('Paket VexelFlow Pro aktif! Kuota ditingkatkan menjadi 100.', 'success');
    }

    function openModal(id) {
      document.getElementById(id).classList.add('open');
      lucide.createIcons();
    }

    function closeModal(id) {
      document.getElementById(id).classList.remove('open');
    }

    function toggleMobileSidebar(open) {
      const drawer = document.getElementById('sidebarDrawer');
      const overlay = document.getElementById('mobileOverlay');
      if (open) {
        drawer.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
      } else {
        drawer.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
      }
    }

    function toggleDropdown(id) {
      const el = document.getElementById(id);
      const wasHidden = el.classList.contains('hidden');
      closeAllDropdowns();
      if (wasHidden) el.classList.remove('hidden');
    }

    function closeAllDropdowns() {
      document.querySelectorAll('[id^="hist-menu-"], #workspaceDropdown').forEach((d) => d.classList.add('hidden'));
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('button')) {
        closeAllDropdowns();
      }
    });

    function animateCountUp(elementId, targetVal) {
      const el = document.getElementById(elementId);
      if (!el) return;
      const startVal = parseInt(el.textContent, 10) || 0;
      if (startVal === targetVal) {
        el.textContent = targetVal;
        return;
      }
      const duration = 350;
      const startTime = performance.now();
      function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(startVal + (targetVal - startVal) * eased);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function showToast(message, type = 'success') {
      const container = document.getElementById('toastContainer');
      const colors = {
        success: { border: 'border-emerald-200', iconBg: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500', icon: 'check-circle-2' },
        info: { border: 'border-brand-200', iconBg: 'bg-brand-50 text-brand-600', bar: 'bg-brand-600', icon: 'info' },
        warning: { border: 'border-amber-200', iconBg: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500', icon: 'alert-triangle' },
      };
      const cfg = colors[type] || colors.info;

      const toast = document.createElement('div');
      toast.className = `pointer-events-auto bg-white rounded-2xl shadow-xl border ${cfg.border} overflow-hidden transform translate-y-2 opacity-0 transition-all duration-300`;
      toast.innerHTML = `
        <div class="p-3.5 flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl ${cfg.iconBg} flex items-center justify-center shrink-0">
            <i data-lucide="${cfg.icon}" class="w-4 h-4"></i>
          </div>
          <p class="text-xs font-medium text-slate-800 leading-snug flex-1">${escapeHtml(message)}</p>
        </div>
        <div class="h-1 w-full bg-slate-100">
          <div class="h-full ${cfg.bar} toast-bar"></div>
        </div>
      `;

      container.appendChild(toast);
      lucide.createIcons();

      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      });

      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    window.addEventListener('DOMContentLoaded', initState);
