const script = `
(function(){
  try {
    var appAreas = ['admin','teacher','learn','dashboard','account','streams','free-lesson','free-mock-test','level-test','trial-lesson'];
    var firstSegment = location.pathname.split('/')[2] || '';
    if (appAreas.indexOf(firstSegment) === -1) {
      document.documentElement.classList.add('light');
    } else {
      var saved = localStorage.getItem('theme');
      var light = saved ? saved === 'light' : window.matchMedia('(prefers-color-scheme: light)').matches;
      document.documentElement.classList.toggle('light', light);
    }
  } catch (e) {}
})();
`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
