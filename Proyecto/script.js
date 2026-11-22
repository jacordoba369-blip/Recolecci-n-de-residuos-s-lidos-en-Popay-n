
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
          },
          colors: {
            brand: {
              dark: '#083D32',
              darker: '#052921',
              primary: '#0B6641',
              hover: '#095234',
              light: '#148F5C',
              mint: '#E8F2FC',
              teal: '#14A38B',
              gold: '#F5C443',
              amber: '#FAD776',
              blue: '#0D75C9'
            }
          }
        }
      }
    }
   //<!-- =========================================================
      // LÓGICA JAVASCRIPT Y DATOS GEORREFERENCIADOS DE POPAYÁN
    //   ========================================================= --
  
    // Base de datos de sectores georreferenciados en Popayán, Cauca (coordenadas reales)
    const SECTORS_DB = {
      'default': {
        id: 'default',
        name: 'Sector de consulta',
        hasInfo: true,
        isPendingValidation: true, // Estado idéntico al mockup 04
        days: 'Lunes, Miércoles y Viernes',
        hours: '06:00 a. m. - 10:00 a. m.',
        source: 'Serviaseo Popayán S.A. E.S.P.',
        updated: 'Noviembre 2026',
        center: [2.4419, -76.6063],
        zoom: 15,
        polygon: [
          [2.4445, -76.6095],
          [2.4452, -76.6042],
          [2.4412, -76.6025],
          [2.4388, -76.6075],
          [2.4415, -76.6108]
        ]
      },
      'centro': {
        id: 'centro',
        name: 'Centro Histórico',
        hasInfo: true,
        isPendingValidation: true, // Inicia en "Por confirmar" para coincidir con el mockup, con opción de alternar
        days: 'Lunes a Sábado (Diurno/Nocturno)',
        hours: '07:00 p. m. - 11:00 p. m.',
        source: 'Serviaseo Popayán S.A. E.S.P.',
        updated: '15 de noviembre de 2026',
        center: [2.4418, -76.6063],
        zoom: 16,
        polygon: [
          [2.4442, -76.6092],
          [2.4446, -76.6038],
          [2.4398, -76.6035],
          [2.4395, -76.6088]
        ]
      },
      'la-esmeralda': {
        id: 'la-esmeralda',
        name: 'La Esmeralda',
        hasInfo: true,
        isPendingValidation: false, // Muestra ejemplo con datos confirmados
        days: 'Martes, Jueves y Sábado',
        hours: '06:30 a. m. - 11:30 a. m.',
        source: 'Serviaseo Popayán S.A. E.S.P.',
        updated: '10 de noviembre de 2026',
        center: [2.4465, -76.6185],
        zoom: 16,
        polygon: [
          [2.4488, -76.6212],
          [2.4492, -76.6162],
          [2.4445, -76.6158],
          [2.4442, -76.6208]
        ]
      },
      'el-empedrado': {
        id: 'el-empedrado',
        name: 'El Empedrado',
        hasInfo: true,
        isPendingValidation: false,
        days: 'Lunes, Miércoles y Viernes',
        hours: '07:00 a. m. - 12:00 m.',
        source: 'Serviaseo Popayán S.A. E.S.P.',
        updated: '12 de noviembre de 2026',
        center: [2.4375, -76.6122],
        zoom: 16,
        polygon: [
          [2.4395, -76.6145],
          [2.4398, -76.6102],
          [2.4355, -76.6098],
          [2.4352, -76.6142]
        ]
      },
      'la-pamba': {
        id: 'la-pamba',
        name: 'La Pamba',
        hasInfo: true,
        isPendingValidation: true,
        days: 'Lunes, Miércoles y Viernes',
        hours: '06:00 p. m. - 10:00 p. m.',
        source: 'Pendiente de validar',
        updated: 'Pendiente de validar',
        center: [2.4415, -76.5995],
        zoom: 16,
        polygon: [
          [2.4435, -76.6018],
          [2.4438, -76.5972],
          [2.4395, -76.5968],
          [2.4392, -76.6015]
        ]
      },
      'sector-sin-datos': {
        id: 'sector-sin-datos',
        name: 'Vereda Santa Rosa',
        hasInfo: false,
        isPendingValidation: true,
        center: [2.4620, -76.5880],
        zoom: 15,
        polygon: [
          [2.4645, -76.5910],
          [2.4650, -76.5850],
          [2.4595, -76.5845],
          [2.4590, -76.5905]
        ]
      }
    };

    // Estado global de la aplicación
    let currentView = 'inicio';
    let selectedSectorKey = 'default';
    let customSearchTerm = '';
    let mapInstance = null;
    let currentPolygonLayer = null;
    let currentMarkerLayer = null;

    // Navegación principal entre las 5 interfaces
    function navigateTo(viewId) {
      currentView = viewId;

      // Ocultar todas las secciones
      document.querySelectorAll('.view-section').forEach(el => {
        el.classList.add('hidden');
      });

      // Mostrar la sección activa
      const targetSection = document.getElementById(`view-${viewId}`);
      if (targetSection) {
        targetSection.classList.remove('hidden');
      }

      // Actualizar estado visual de las píldoras superiores (01 - 05)
      document.querySelectorAll('.step-pill').forEach(pill => {
        const isCurrent = pill.getAttribute('data-step') === viewId;
        if (isCurrent) {
          pill.className = 'step-pill px-3 py-1 rounded-full text-xs font-bold transition-all bg-[#083D32] text-white shadow-sm';
        } else {
          pill.className = 'step-pill px-3 py-1 rounded-full text-xs font-semibold transition-all bg-slate-100 text-slate-600 hover:bg-slate-200';
        }
      });

      // Actualizar botones de navegación en el encabezado verde
      const navInicio = document.getElementById('nav-inicio');
      const navConsultar = document.getElementById('nav-consultar');

      if (viewId === 'inicio') {
        navInicio.className = 'nav-btn flex items-center gap-2 px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all bg-[#148F5C] text-white shadow-sm';
        navConsultar.className = 'nav-btn flex items-center gap-2 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium text-white/90 hover:bg-white/10 transition-all';
      } else {
        navInicio.className = 'nav-btn flex items-center gap-2 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium text-white/90 hover:bg-white/10 transition-all';
        navConsultar.className = 'nav-btn flex items-center gap-2 px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all bg-[#148F5C] text-white shadow-sm';
      }

      // Acciones específicas por pantalla
      if (viewId === 'mapa') {
        initOrUpdateMap();
      } else if (viewId === 'resultado') {
        renderResultView();
      } else if (viewId === 'sin-informacion') {
        renderNoInfoView();
      }
    }

    // Manejo de búsqueda desde la pantalla 01. Inicio
    function handleHeroSearch(e) {
      e.preventDefault();
      const inputVal = document.getElementById('hero-search-input').value.trim();
      const searchInput02 = document.getElementById('search-sector-input');
      
      if (inputVal) {
        searchInput02.value = inputVal;
        matchSectorByText(inputVal);
        navigateTo('mapa');
      } else {
        navigateTo('busqueda');
      }
    }

    // Seleccionar un sector desde las sugerencias o el mapa
    function selectSector(key, autoAdvance = false) {
      selectedSectorKey = key;
      customSearchTerm = '';
      const sector = SECTORS_DB[key] || SECTORS_DB['default'];

      // Sincronizar input de búsqueda y select del mapa
      const searchInput = document.getElementById('search-sector-input');
      if (searchInput && key !== 'default') {
        searchInput.value = sector.name;
      }
      const mapSelect = document.getElementById('map-quick-select');
      if (mapSelect) {
        mapSelect.value = key;
      }

      // Resaltar chip seleccionado en pantalla 02
      document.querySelectorAll('.sector-chip').forEach(chip => {
        chip.classList.remove('ring-2', 'ring-[#0B6641]', 'bg-emerald-50');
      });

      if (currentView === 'mapa') {
        initOrUpdateMap();
      }
      if (autoAdvance) {
        navigateTo('mapa');
      }
    }

    // Buscar coincidencia de texto escrito por el usuario
    function matchSectorByText(text) {
      const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (!normalized) {
        selectedSectorKey = 'default';
        customSearchTerm = '';
        return;
      }

      if (normalized.includes('centro')) {
        selectedSectorKey = 'centro';
        customSearchTerm = '';
      } else if (normalized.includes('esmeralda')) {
        selectedSectorKey = 'la-esmeralda';
        customSearchTerm = '';
      } else if (normalized.includes('empedrado')) {
        selectedSectorKey = 'el-empedrado';
        customSearchTerm = '';
      } else if (normalized.includes('pamba')) {
        selectedSectorKey = 'la-pamba';
        customSearchTerm = '';
      } else if (normalized.includes('santa rosa') || normalized.includes('sin datos') || normalized.includes('vereda')) {
        selectedSectorKey = 'sector-sin-datos';
        customSearchTerm = text;
      } else {
        // Sector personalizado no registrado en base verificada
        selectedSectorKey = 'custom-unknown';
        customSearchTerm = text;
      }
    }

    function filterSuggestions(val) {
      matchSectorByText(val);
    }

    function triggerSearchFromInput() {
      const val = document.getElementById('search-sector-input').value.trim();
      matchSectorByText(val);
      goToMapWithSelected();
    }

    function goToMapWithSelected() {
      const val = document.getElementById('search-sector-input').value.trim();
      if (val && selectedSectorKey === 'default') {
        matchSectorByText(val);
      }
      navigateTo('mapa');
    }

    // Inicializar o actualizar el mapa Leaflet con el polígono del sector en Popayán
    function initOrUpdateMap() {
      const sector = SECTORS_DB[selectedSectorKey] || {
        ...SECTORS_DB['default'],
        name: customSearchTerm || 'Sector de consulta',
        hasInfo: false
      };

      // Actualizar texto del panel derecho del mapa
      document.getElementById('map-sector-title').textContent = sector.name;

      setTimeout(() => {
        if (!mapInstance) {
          mapInstance = L.map('popayan-map', {
            center: sector.center,
            zoom: sector.zoom,
            zoomControl: false
          });

          // Capa base limpia estilo CartoDB Positron (idéntica a la estética clara del mockup)
          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 19
          }).addTo(mapInstance);
        } else {
          mapInstance.invalidateSize();
        }

        // Limpiar capas previas
        if (currentPolygonLayer) mapInstance.removeLayer(currentPolygonLayer);
        if (currentMarkerLayer) mapInstance.removeLayer(currentMarkerLayer);

        // Dibujar polígono georreferenciado color turquesa (#14A38B) como en el mockup
        currentPolygonLayer = L.polygon(sector.polygon, {
          color: '#0E8A75',
          weight: 2.5,
          fillColor: '#14A38B',
          fillOpacity: 0.32
        }).addTo(mapInstance);

        // Ícono de pin oscuro personalizado en el centro del polígono
        const customPinIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="width: 34px; height: 42px; transform: translate(-5px, -18px);">
              <svg viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 0C8.05887 0 0 8.05887 0 18C0 31.5 18 44 18 44C18 44 36 31.5 36 18C36 8.05887 27.9411 0 18 0Z" fill="#0B2E26"/>
                <circle cx="18" cy="17" r="6.5" fill="white"/>
              </svg>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 24]
        });

        currentMarkerLayer = L.marker(sector.center, { icon: customPinIcon }).addTo(mapInstance);

        // Centrar suavemente en el polígono
        mapInstance.fitBounds(currentPolygonLayer.getBounds(), { padding: [35, 35], maxZoom: 16 });
      }, 60);
    }

    function mapZoomIn() {
      if (mapInstance) mapInstance.zoomIn();
    }

    function mapZoomOut() {
      if (mapInstance) mapInstance.zoomOut();
    }

    function mapRecenter() {
      if (mapInstance && currentPolygonLayer) {
        mapInstance.fitBounds(currentPolygonLayer.getBounds(), { padding: [35, 35], maxZoom: 16 });
      }
    }

    // Decidir si ir a 04. Resultado o 05. Sin información desde el mapa
    function consultScheduleFromMap() {
      if (selectedSectorKey === 'sector-sin-datos' || selectedSectorKey === 'custom-unknown') {
        navigateTo('sin-informacion');
      } else {
        navigateTo('resultado');
      }
    }

    // Renderizar pantalla 04. Resultado
    function renderResultView() {
      const sector = SECTORS_DB[selectedSectorKey] || SECTORS_DB['default'];
      document.getElementById('result-sector-name').textContent = sector.name;

      const daysBadge = document.getElementById('result-days-badge');
      const hoursBadge = document.getElementById('result-hours-badge');
      const warningBanner = document.getElementById('result-warning-banner');
      const warningText = document.getElementById('result-warning-text');
      const sourceEl = document.getElementById('result-source');
      const updatedEl = document.getElementById('result-updated');

      if (sector.isPendingValidation) {
        // Estado exacto del mockup 04
        daysBadge.textContent = 'Por confirmar';
        daysBadge.className = 'inline-block bg-[#FAD776] text-[#1E293B] font-bold text-sm sm:text-base px-5 py-2 rounded-xl shadow-xs';
        
        hoursBadge.textContent = 'Por confirmar';
        hoursBadge.className = 'inline-block bg-[#FAD776] text-[#1E293B] font-bold text-sm sm:text-base px-5 py-2 rounded-xl shadow-xs';

        warningBanner.className = 'bg-[#FAD776] rounded-xl px-5 py-3 flex items-center justify-center gap-2.5 text-[#0F293A] font-bold text-sm sm:text-base shadow-xs';
        warningText.textContent = 'Información por verificar';

        sourceEl.textContent = 'Pendiente de validar';
        updatedEl.textContent = 'Pendiente de validar';
      } else {
        // Estado con horario verificado
        daysBadge.textContent = sector.days;
        daysBadge.className = 'inline-block bg-emerald-100 text-[#083D32] border border-emerald-300 font-bold text-sm sm:text-base px-4 py-2 rounded-xl shadow-xs';
        
        hoursBadge.textContent = sector.hours;
        hoursBadge.className = 'inline-block bg-emerald-100 text-[#083D32] border border-emerald-300 font-bold text-sm sm:text-base px-4 py-2 rounded-xl shadow-xs';

        warningBanner.className = 'bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 flex items-center justify-center gap-2.5 text-[#083D32] font-bold text-sm sm:text-base';
        warningText.textContent = 'Horario verificado con el operador de aseo';

        sourceEl.textContent = sector.source;
        updatedEl.textContent = sector.updated;
      }
    }

    // Botón para alternar entre "Por confirmar" (mockup) y datos verificados en vista 04
    function toggleDemoMode() {
      const sector = SECTORS_DB[selectedSectorKey] || SECTORS_DB['default'];
      sector.isPendingValidation = !sector.isPendingValidation;
      renderResultView();
    }

    // Renderizar pantalla 05. Sin información
    function renderNoInfoView() {
      const label = customSearchTerm || (SECTORS_DB[selectedSectorKey]?.name) || 'este sector';
      document.getElementById('no-info-sector-label').textContent = label === 'Sector de consulta' ? 'este sector' : label;
    }

    // Modal Acerca del sistema / Fuente oficial
    function toggleAboutModal(show) {
      const modal = document.getElementById('info-modal');
      document.getElementById('modal-title').textContent = 'Acerca del sistema';
      document.getElementById('modal-body').innerHTML = `
        <p>
          <strong>Recolección Popayán</strong> es una plataforma ciudadana georreferenciada diseñada para facilitar la consulta de días, franjas horarias y polígonos de cobertura de recolección de residuos sólidos en los diferentes barrios y sectores de Popayán, Cauca.
        </p>
        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
          <p class="font-bold text-slate-700">Módulos de la plataforma:</p>
          <ul class="list-disc list-inside space-y-1 text-slate-600">
            <li><strong>01. Inicio:</strong> Consulta directa por nombre de barrio o sector.</li>
            <li><strong>02. Búsqueda:</strong> Asistente con sugerencias de sectores urbanos.</li>
            <li><strong>03. Mapa:</strong> Georreferenciación interactiva en Popayán.</li>
            <li><strong>04. Resultado / 05. Sin información:</strong> Estado de horarios y validación oficial.</li>
          </ul>
        </div>
      `;
      if (show) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    }

    function openOfficialSourceModal() {
      const modal = document.getElementById('info-modal');
      document.getElementById('modal-title').textContent = 'Canales de Información Oficial';
      document.getElementById('modal-body').innerHTML = `
        <p>
          Para sectores rurales, nuevas urbanizaciones o zonas en actualización de microrrutas en <strong>Popayán</strong>, puedes validar directamente con las entidades oficiales:
        </p>
        <div class="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700">
          <div>
            <p class="font-bold text-[#083D32]">• Alcaldía Municipal de Popayán</p>
            <p class="text-slate-600">Secretaría de Desarrollo Agroambiental y Fomento Económico (DAFE) - Gestión Integral de Residuos Sólidos.</p>
          </div>
          <div>
            <p class="font-bold text-[#083D32]">• Operador de Aseo Urbano (Serviaseo Popayán)</p>
            <p class="text-slate-600">Línea de atención al usuario y consulta de frecuencias de barrido y recolección domiciliaria.</p>
          </div>
        </div>
      `;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    // Iniciar en la pantalla 01. Inicio al cargar
    window.addEventListener('DOMContentLoaded', () => {
      navigateTo('inicio');
    });
  