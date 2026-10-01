const script = `
(function(){
  try {
    var root = document.documentElement;
    root.classList.add('js');
    var appAreas = ['admin','teacher','learn','dashboard','account','streams'];
    var firstSegment = location.pathname.split('/')[2] || '';
    if (appAreas.indexOf(firstSegment) === -1) {
      document.documentElement.classList.add('light');
    } else {
      var saved = localStorage.getItem('theme');
      var light = saved ? saved === 'light' : window.matchMedia('(prefers-color-scheme: light)').matches;
      document.documentElement.classList.toggle('light', light);
      if (!light) root.setAttribute('data-theme', 'dark');
    }
  } catch (e) {}
})();
`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
