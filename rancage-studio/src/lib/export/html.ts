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

let echartsCache: string | null = null;

async function loadECharts(): Promise<string> {
  if (echartsCache) return echartsCache;
  try {
    const res = await fetch('/echarts.min.js');
    if (!res.ok) throw new Error(`Failed to load ECharts: ${res.status}`);
    echartsCache = await res.text();
    return echartsCache;
  } catch {
    return 'window.echarts={init:()=>({setOption:()=>{},resize:()=>{},dispose:()=>{}})}';
  }
}

function esc(s: string): string {
  const AMP = String.fromCharCode(38);
  const LT = String.fromCharCode(60);
  const GT = String.fromCharCode(62);
  const DQ = String.fromCharCode(34);
  return s
    .split(AMP).join(AMP + 'amp;')
    .split(LT).join(AMP + 'lt;')
    .split(GT).join(AMP + 'gt;')
    .split(DQ).join(AMP + 'quot;');
}

function safeJSON(data: unknown): string {
  return JSON.stringify(data).replace(/<\//g, '<\\/');
}

function escAttr(s: string): string {
  const AMP = String.fromCharCode(38);
  const LT = String.fromCharCode(60);
  return s.split(AMP).join(AMP + 'amp;').split(LT).join(AMP + 'lt;');
}

export async function buildStandaloneHTML(config: HTMLExportConfig): Promise<string> {
  const maxSize = config.maxDataSize ?? MAX_DATA_SIZE;

  const chartSpecs = safeJSON(config.charts);
  const datasets: Record<string, unknown[]> = {};
  let totalSize = 0;

  for (const ds of config.datasets) {
    const json = JSON.stringify(ds.data);
    totalSize += json.length;
    if (totalSize > maxSize) {
      datasets[ds.name] = ds.data.slice(0, Math.floor(ds.data.length * (maxSize / totalSize)));
    } else {
      datasets[ds.name] = ds.data;
    }
  }

  const datasetJSON = safeJSON(datasets);
  const echartsCode = await loadECharts();
  const title = esc(config.title);

  const parts: string[] = [];
  parts.push('<!DOCTYPE html>');
  parts.push('<html lang="en">');
  parts.push('<head>');
  parts.push('<meta charset="UTF-8">');
  parts.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
  parts.push('<title>' + title + '</title>');
  parts.push('<style>');
  parts.push('*{margin:0;padding:0;box-sizing:border-box}');
  parts.push('body{font-family:system-ui,sans-serif;background:#f8fafc;color:#1e293b;padding:16px}');
  parts.push('h1{font-size:1.5rem;margin-bottom:16px}');
  parts.push('.dashboard{display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:16px}');
  parts.push('.chart-card{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:12px}');
  parts.push('.chart-card h3{font-size:0.875rem;margin-bottom:8px}');
  parts.push('.chart-box{width:100%;height:300px}');
  parts.push('</style>');
  parts.push('</head>');
  parts.push('<body>');
  parts.push('<h1>' + title + '</h1>');
  parts.push('<div class="dashboard" id="dashboard"></div>');
  parts.push('<script>');
  parts.push(echartsCode);
  parts.push('</script>');
  parts.push('<script>');
  parts.push('(function(){');
  parts.push('var datasets=' + datasetJSON + ';');
  parts.push('var charts=' + chartSpecs + ';');
  parts.push("var container=document.getElementById('dashboard');");
  parts.push('charts.forEach(function(c){');
  parts.push("var card=document.createElement('div');");
  parts.push("card.className='chart-card';");
  parts.push("card.innerHTML='<h3>'+escTitle(c.title)+'</h3><div class=\"chart-box\" id=\"chart-'+c.title.replace(/[^a-z0-9]/gi,'')+'\"></div>';");
  parts.push('function escTitle(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}');
  parts.push('container.appendChild(card);');
  parts.push("var chartDiv=card.querySelector('.chart-box');");
  parts.push('var chart=echarts.init(chartDiv);');
  parts.push('var data=datasets[c.datasetIndex]||datasets[Object.keys(datasets)[0]]||[];');
  parts.push('var xData=data.map(function(r){return r[c.xField]});');
  parts.push('var yData=data.map(function(r){return Number(r[c.yField]||0)});');
  parts.push("var option={tooltip:{trigger:'axis'},xAxis:{type:'category',data:xData},yAxis:{type:'value'},series:[{type:c.type==='area'?'line':c.type,data:yData,areaStyle:c.type==='area'?{}:undefined}]};");
  parts.push('chart.setOption(option);');
  parts.push("window.addEventListener('resize',function(){chart.resize()});");
  parts.push('});');
  parts.push('})();');
  parts.push('</script>');
  parts.push('</body>');
  parts.push('</html>');
  return parts.join('\n');
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