export interface HTMLExportConfig {
  title: string;
  datasets: { name: string; data: Record<string, unknown>[] }[];
  charts: {
    type: string;
    title: string;
    datasetIndex: number;
    xField: string;
    yField: string;
    seriesField?: string;
  }[];
  maxDataSize?: number; // default 5MB
}

const MAX_DATA_SIZE = 5 * 1024 * 1024; // 5MB

export function buildStandaloneHTML(config: HTMLExportConfig): string {
  const maxSize = config.maxDataSize ?? MAX_DATA_SIZE;

  const chartSpecs = JSON.stringify(config.charts);
  const datasets: Record<string, unknown[]> = {};
  let totalSize = 0;

  for (const ds of config.datasets) {
    const json = JSON.stringify(ds.data);
    totalSize += json.length;
    if (totalSize > maxSize) {
      // truncate and warn
      datasets[ds.name] = ds.data.slice(0, Math.floor(ds.data.length * (maxSize / totalSize)));
    } else {
      datasets[ds.name] = ds.data;
    }
  }

  const datasetJSON = JSON.stringify(datasets);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHTML(config.title)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,sans-serif;background:#f8fafc;color:#1e293b;padding:16px}
h1{font-size:1.5rem;margin-bottom:16px}
.dashboard{display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:16px}
.chart-card{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:12px}
.chart-card h3{font-size:0.875rem;margin-bottom:8px}
.chart-box{width:100%;height:300px}
</style>
</head>
<body>
<h1>${escapeHTML(config.title)}</h1>
<div class="dashboard" id="dashboard"></div>
<script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
<script>
(function(){
var datasets=${datasetJSON};
var charts=${chartSpecs};
var container=document.getElementById('dashboard');
charts.forEach(function(c){
var card=document.createElement('div');
card.className='chart-card';
card.innerHTML='<h3>'+c.title+'</h3><div class="chart-box" id="chart-'+c.title.replace(/[^a-z0-9]/gi,'')+'"></div>';
container.appendChild(card);
var chartDiv=card.querySelector('.chart-box');
var chart=echarts.init(chartDiv);
var data=datasets[c.datasetIndex]||datasets[Object.keys(datasets)[0]]||[];
var xData=data.map(function(r){return r[c.xField]});
var yData=data.map(function(r){return Number(r[c.yField]||0)});
var option={tooltip:{trigger:'axis'},xAxis:{type:'category',data:xData},yAxis:{type:'value'},series:[{type:c.type==='area'?'line':c.type,data:yData,areaStyle:c.type==='area'?{}:undefined}]};
chart.setOption(option);
window.addEventListener('resize',function(){chart.resize()});
});
})();
</script>
</body>
</html>`;
}

function escapeHTML(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function downloadHTML(html: string, filename = 'dashboard.html'): void {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
