// Runs before the first paint. The site is always light; learning and staff
// areas are light too unless the person chose dark (see design/layout/theme.ts).
const script = `
(function(){
  var root = document.documentElement;
  root.classList.add('js');
  var dark = false;
  try {
    var appAreas = ['learn','dashboard','account','streams','admin','teacher'];
    var firstSegment = location.pathname.split('/')[2] || '';
    dark = appAreas.indexOf(firstSegment) !== -1 && localStorage.getItem('theme') === 'dark';
  } catch (e) {}
  root.classList.toggle('light', !dark);
  if (dark) root.setAttribute('data-theme', 'dark');
})();
`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
