let places = [];
let currentPeriod = 'all';
let filteredPlaces = [];
let chartInstance = null;
let galleryOrder = [];
let currentGalleryIndex = -1;
let pendingPlaceFocus = null;
let selectedStartPointId = null;
let selectedStartPointCoords = null;
let isSelectingStartPoint = false;
let loadPromise = null;
function getDataPath() {
  const pathname = window.location.pathname || '';
  const isPageContext = pathname.includes('/pages/') || pathname.includes('pages\\');
  return isPageContext ? '../../data/sites.json' : 'data/sites.json';
}
function loadPlacesData() {
  if (loadPromise) return loadPromise;
  const dataPath = getDataPath();
  loadPromise = (typeof axios !== 'undefined'
    ? axios.get(dataPath).then(response => {
        const data = response.data;
        if (Array.isArray(data) && data.length > 0) {
          places = data;
          return;
        }
          throw new Error('Данные в файле sites.json некорректны.');
      }).catch(() => loadPlacesDataFallback())
    : loadPlacesDataFallback()
  ).finally(() => {
    if (!Array.isArray(places) || places.length === 0) {
      loadPromise = null;
  }
  });
  return loadPromise;
}
function loadPlacesDataFallback() {
  const dataPath = getDataPath();
  return fetch(dataPath)
    .then(resp => {
      if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
      return resp.json();
    })
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        places = data;
        return Promise.resolve();
      } else {
        throw new Error('Данные в файле sites.json некорректны.');
      }
    })
    .catch(err => {
      const errorMsg = err.message || 'Неизвестная ошибка';
      const isCorsError = errorMsg.includes('CORS') || errorMsg.includes('Failed to fetch');
      const is404Error = errorMsg.includes('404') || errorMsg.includes('status: 404');
      let userMessage = 'Не удалось загрузить данные о наследиях. ';
      if (isCorsError || window.location.protocol === 'file:') {
        userMessage += 'Для корректной работы сайта необходимо запустить его через локальный сервер.';
      } else if (is404Error) {
        userMessage += 'Файл data/sites.json не найден.';
      } else {
        userMessage += `Ошибка: ${errorMsg}`;
      }
      if (typeof window.showError === 'function') {
        window.showError(userMessage);
      }
      return Promise.reject(new Error(userMessage));
    });
}
function normalizeImagePath(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  let isPageContext = false;
  try {
    const pathname = window.location.pathname || '';
    const href = window.location.href || '';
    const pathSegments = pathname.split('/').filter(s => s);
    isPageContext = pathname.includes('/pages/') || 
                    pathname.includes('pages\\') || 
                    href.includes('/pages/') || 
                    href.includes('pages\\') ||
                    (pathSegments.length > 1 && pathSegments[pathSegments.length - 2] === 'pages');
  } catch (e) {
    isPageContext = false;
  }
  const basePath = isPageContext ? '../../' : '';
  if (path.startsWith('/images/')) {
    return basePath + path.substring(1);
  }
  if (path.startsWith('image/')) {
    if (path.includes('logo.png')) {
      return basePath + 'images/interface/logo.png';
    }
    return basePath + path.replace('image/', 'images/content/historical/');
  }
  if (path.startsWith('assets/img/') || path.startsWith('../assets/img/')) {
    if (path.includes('logo.png')) {
      return basePath + 'images/interface/logo.png';
    }
    return basePath + path.replace(/^\.?\//, '');
  }
  if (path.startsWith('images/')) {
    return basePath + path;
  }
  if (path.startsWith('img/')) {
    return basePath + path.replace('img/', 'images/');
  }
  return basePath + path;
}
export const appState = {
  get places() { return places; },
  set places(val) { places = val; },
  get currentPeriod() { return currentPeriod; },
  set currentPeriod(val) { currentPeriod = val; },
  get filteredPlaces() { return filteredPlaces; },
  set filteredPlaces(val) { filteredPlaces = val; },
  get chartInstance() { return chartInstance; },
  set chartInstance(val) { chartInstance = val; },
  get galleryOrder() { return galleryOrder; },
  set galleryOrder(val) { galleryOrder = val; },
  get currentGalleryIndex() { return currentGalleryIndex; },
  set currentGalleryIndex(val) { currentGalleryIndex = val; },
  get pendingPlaceFocus() { return pendingPlaceFocus; },
  set pendingPlaceFocus(val) { pendingPlaceFocus = val; },
  get selectedStartPointId() { return selectedStartPointId; },
  set selectedStartPointId(val) { selectedStartPointId = val; },
  get selectedStartPointCoords() { return selectedStartPointCoords; },
  set selectedStartPointCoords(val) { selectedStartPointCoords = val; },
  get isSelectingStartPoint() { return isSelectingStartPoint; },
  set isSelectingStartPoint(val) { isSelectingStartPoint = val; }
};
export { loadPlacesData, normalizeImagePath };
