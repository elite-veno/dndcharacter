// Full-screen map mode. Phones (iPhone Safari has no Fullscreen API for pages) get a fixed overlay that hides the
// site header and footer and gives the whole screen to the map; the side panel becomes a bottom sheet.

export function focusController(pageEl, { onChange = () => {} } = {}) {
  let on = false;
  const set = (value) => {
    on = !!value;
    document.body.classList.toggle('map-focus', on);
    pageEl.classList.toggle('is-focus', on);
    if (!on) pageEl.classList.remove('side-open');
    onChange(on);
  };
  return {
    isOn: () => on,
    set,
    toggle: () => set(!on),
    toggleSide: () => pageEl.classList.toggle('side-open'),
    destroy: () => { if (on) { document.body.classList.remove('map-focus'); } },
  };
}

/** True on phone-sized screens. */
export const isSmallScreen = () => { try { return window.matchMedia('(max-width: 700px)').matches; } catch { return false; } };
