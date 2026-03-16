const _state = $state({ keyboardNav: false });

export const ui = {
  get keyboardNav() { return _state.keyboardNav; },
  set keyboardNav(val: boolean) {
    _state.keyboardNav = val;
    document.body.classList.toggle('keyboard-nav', val);
  },
};
