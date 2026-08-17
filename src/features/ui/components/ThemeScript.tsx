const script = `
(function(){
  try {
    var saved = localStorage.getItem('theme');
    var light = saved ? saved === 'light' : window.matchMedia('(prefers-color-scheme: light)').matches;
    document.documentElement.classList.toggle('light', light);
  } catch (e) {}
})();
`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
