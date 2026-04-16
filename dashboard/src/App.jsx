// // import { useEffect, useState } from "react";
// // import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// // export default function App() {
// //   const [data, setData] = useState([]);

// //   useEffect(() => {
// //     fetch("http://localhost:8000/stats/today")
// //       .then(res => res.json())
// //       .then(json => {
// //         const cleaned = json.map(item => ({
// //           // MongoDB returns _id instead of url
// //           site: new URL(item._id).hostname.replace("www.", ""),
// //           minutes: Math.round(item.total)
// //         }));
// //         setData(cleaned);
// //       })
// //       .catch(err => console.log(err));
// //   }, []);

// //   return (
// //     <div style={{ padding: 24 }}>
// //       <h2>Today's Usage</h2>
// //       <ResponsiveContainer width="100%" height={300}>
// //         <BarChart data={data}>
// //           <XAxis dataKey="site" />
// //           <YAxis />
// //           <Tooltip />
// //           <Bar dataKey="minutes" fill="#378ADD" />
// //         </BarChart>
// //       </ResponsiveContainer>
// //     </div>
// //   );
// // }
// import { useEffect, useState } from "react";
// import { 
//   BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
//   PieChart, Pie
// } from "recharts";
// import { 
//   Activity, Cpu, Globe, RefreshCw, Zap, 
//   Clock, TerminalSquare, Target, Focus
// } from "lucide-react";

// // --- THE DEMO DICTIONARY ---
// const CATEGORY_MAP = {
//   "github.com": "Productive",
//   "leetcode.com": "Productive",
//   "stackoverflow.com": "Productive",
//   "localhost": "Productive",
//   "youtube.com": "Distracting",
//   "instagram.com": "Distracting",
//   "netflix.com": "Distracting",
//   "chatgpt.com": "Productive",
//   "gemini.google.com": "Productive",
//   "google.com": "Neutral",
//   "newtab": "Neutral"
// };

// // Colors linked to the categories
// const CATEGORY_COLORS = {
//   "Productive": "#10B981", // Emerald Green
//   "Distracting": "#F43F5E", // Rose Red
//   "Neutral": "#64748B"      // Slate Gray
// };

// export default function Dashboard() {
//   const [webData, setWebData] = useState([]);
//   const [processData, setProcessData] = useState([]);
//   const [categoryData, setCategoryData] = useState([]); // NEW: Replaced ramData
//   const [loading, setLoading] = useState(true);
  
//   const [totalWebTime, setTotalWebTime] = useState(0);
//   const [heavyProcess, setHeavyProcess] = useState("Analyzing...");
//   const [productivityScore, setProductivityScore] = useState(0);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       // 1. Fetch & Clean Web Data
//       const webRes = await fetch("http://localhost:8000/stats/today");
//       const webJson = await webRes.json();
      
//       let totalMins = 0;
//       let catTotals = { "Productive": 0, "Distracting": 0, "Neutral": 0 };

//       const cleanedWeb = webJson.map(item => {
//         let siteName = item._id;
//         try { siteName = new URL(item._id).hostname.replace("www.", ""); } 
//         catch (e) { siteName = item._id.replace("www.", ""); }
        
//         siteName = siteName.replace(/[-/]+$/, '').split('/')[0];
//         const mins = Math.max(1, Math.round(item.total / 60));
        
//         // Apply Hardcoded Category
//         const category = CATEGORY_MAP[siteName] || "Neutral";
        
//         totalMins += mins;
//         catTotals[category] += mins; // Add minutes to the specific category bucket
        
//         return { site: siteName, minutes: mins, category: category };
//       }).filter(item => item.site !== "");

//       cleanedWeb.sort((a, b) => b.minutes - a.minutes);
//       setWebData(cleanedWeb.slice(0, 6));
//       setTotalWebTime(totalMins);
      
//       // Calculate Overall Score
//       const score = totalMins > 0 ? Math.round((catTotals["Productive"] / totalMins) * 100) : 0;
//       setProductivityScore(score);

//       // NEW: Format data for the Category Pie Chart (Percentages out of 100)
//       if (totalMins > 0) {
//         const pieFormat = Object.keys(catTotals)
//           .filter(key => catTotals[key] > 0) // Hide empty categories
//           .map(key => ({
//             name: key,
//             value: Math.round((catTotals[key] / totalMins) * 100) // Convert to %
//           }));
//         setCategoryData(pieFormat);
//       }

//       // 2. Fetch System Data
//       const procRes = await fetch("http://127.0.0.1:5000/processes");
//       const procJson = await procRes.json();
      
//       const sortedByMem = [...procJson].sort((a, b) => b.memory - a.memory);
//       setProcessData(sortedByMem.slice(0, 7)); 
      
//       if (sortedByMem.length > 0) setHeavyProcess(sortedByMem[0].name);
      
//     } catch (err) {
//       console.error("Fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(fetchData, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const formatTime = (totalMins) => {
//     const hours = Math.floor(totalMins / 60);
//     const mins = totalMins % 60;
//     return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
//   };

//   const WebTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       const badgeColor = 
//         data.category === "Productive" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : 
//         data.category === "Distracting" ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : 
//         "bg-slate-500/20 text-slate-400 border-slate-500/30";

//       return (
//         <div className="bg-[#0B1120] text-white p-3 rounded-xl shadow-2xl border border-indigo-500/30">
//           <div className="flex justify-between items-center gap-4">
//              <p className="text-sm font-semibold">{data.site}</p>
//              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
//                {data.category}
//              </span>
//           </div>
//           <p className="text-xs text-indigo-400 font-bold mt-2">{data.minutes} mins tracked</p>
//         </div>
//       );
//     }
//     return null;
//   };

//   // NEW: Category Tooltip for the Pie Chart
//   const CategoryTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       const color = CATEGORY_COLORS[data.name];
//       return (
//         <div className="bg-[#0B1120] text-white p-3 rounded-xl shadow-2xl border border-slate-700/50">
//           <p className="text-sm font-semibold flex items-center gap-2">
//             <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
//             {data.name}
//           </p>
//           <p className="text-xs font-bold mt-2" style={{ color: color }}>
//             {data.value}% of Web Time
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="min-h-screen bg-[#060913] font-sans text-slate-200 selection:bg-indigo-500/30 p-4 md:p-6 lg:p-8">
      
//       {/* HEADER */}
//       <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0F172A] p-6 rounded-2xl border border-slate-800 shadow-[0_0_40px_rgba(79,70,229,0.05)]">
//         <div className="flex items-center gap-4">
//           <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3.5 rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.3)]">
//             <Zap className="text-white" size={28} fill="currentColor" />
//           </div>
//           <div>
//             <h1 className="text-3xl font-black tracking-tight text-white">SPARK</h1>
//             <p className="text-xs font-bold text-indigo-400/80 uppercase tracking-widest mt-1">
//               Smart Productivity Analysis Kit
//             </p>
//           </div>
//         </div>
//         <button 
//           onClick={fetchData} 
//           className="flex items-center gap-2 px-5 py-2.5 bg-[#1E293B] border border-slate-700 hover:border-indigo-500 hover:bg-[#233147] text-slate-300 hover:text-indigo-300 rounded-full transition-all shadow-sm font-medium text-sm"
//         >
//           <RefreshCw size={16} className={loading ? "animate-spin text-indigo-400" : ""} />
//           Sync Telemetry
//         </button>
//       </header>

//       {/* KPI STRIP */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//         <div className="bg-[#0F172A] p-6 rounded-2xl border border-slate-800 flex items-center gap-5 relative overflow-hidden group">
//           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
//           <div className="p-4 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
//             <Clock size={26} />
//           </div>
//           <div className="z-10">
//             <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Web Time</p>
//             <h3 className="text-2xl font-bold text-white mt-1">{formatTime(totalWebTime)}</h3>
//           </div>
//         </div>

//         <div className="bg-[#0F172A] p-6 rounded-2xl border border-slate-800 flex items-center gap-5 relative overflow-hidden group">
//           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
//           <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
//             <Target size={26} />
//           </div>
//           <div className="z-10">
//             <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Focus Score</p>
//             <h3 className="text-2xl font-bold text-white mt-1">{productivityScore}%</h3>
//           </div>
//         </div>

//         <div className="bg-[#0F172A] p-6 rounded-2xl border border-slate-800 flex items-center gap-5 relative overflow-hidden group">
//           <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
//           <div className="p-4 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
//             <TerminalSquare size={26} />
//           </div>
//           <div className="z-10">
//             <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Top Process</p>
//             <h3 className="text-2xl font-bold text-white mt-1 truncate max-w-[180px]">{heavyProcess}</h3>
//           </div>
//         </div>
//       </div>

//       {/* VISUALIZATIONS GRID */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
//         {/* 1. Bar Chart */}
//         <section className="lg:col-span-2 bg-[#0F172A] p-6 rounded-3xl border border-slate-800 flex flex-col">
//           <div className="flex items-center gap-3 mb-6">
//             <Globe className="text-blue-400" size={22} />
//             <h2 className="text-lg font-bold text-white">Browser Telemetry</h2>
//           </div>
//           <div className="flex-1 min-h-[300px]">
//             {webData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={webData} layout="vertical" margin={{ left: 10, right: 20 }}>
//                   <defs>
//                     <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
//                       <stop offset="0%" stopColor="#3B82F6" />
//                       <stop offset="100%" stopColor="#8B5CF6" />
//                     </linearGradient>
//                   </defs>
//                   <XAxis type="number" hide />
//                   <YAxis dataKey="site" type="category" width={100} tick={{fontSize: 12, fill: '#94A3B8'}} axisLine={false} tickLine={false} />
//                   <Tooltip content={<WebTooltip />} cursor={{fill: '#1E293B', radius: 8}} />
//                   <Bar dataKey="minutes" radius={[0, 6, 6, 0]} barSize={20}>
//                     {webData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={index === 0 ? 'url(#barGradient)' : '#475569'} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="flex items-center justify-center h-full text-slate-500 text-sm font-medium">Awaiting Data...</div>
//             )}
//           </div>
//         </section>

//         {/* 2. Donut Chart: Productivity Breakdown */}
//         <section className="bg-[#0F172A] p-6 rounded-3xl border border-slate-800 flex flex-col">
//           <div className="flex items-center gap-3 mb-2">
//             <Target className="text-emerald-400" size={22} />
//             <h2 className="text-lg font-bold text-white">Usage Breakdown</h2>
//           </div>
//           <p className="text-xs text-slate-400 mb-4">Web activity classified by intent</p>
//           <div className="flex-1 min-h-[250px] relative">
//             {categoryData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Tooltip content={<CategoryTooltip />} />
//                   <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
//                     {categoryData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name]} />
//                     ))}
//                   </Pie>
//                 </PieChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="flex items-center justify-center h-full text-slate-500 text-sm font-medium">Awaiting Data...</div>
//             )}
//             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//               <span className="text-sm font-bold text-slate-300">100%</span>
//             </div>
//           </div>
//         </section>

//         {/* 3. System Table */}
//         <section className="lg:col-span-3 bg-[#0F172A] p-6 rounded-3xl border border-slate-800">
//           <div className="flex justify-between items-center mb-6">
//             <div className="flex items-center gap-3">
//               <Activity className="text-indigo-400" size={22} />
//               <h2 className="text-lg font-bold text-white">Live System Operations</h2>
//             </div>
//             <span className="flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full">
//               <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span> Active
//             </span>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse min-w-[600px]">
//               <thead>
//                 <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
//                   <th className="py-4 px-4 font-semibold w-1/3">Application</th>
//                   <th className="py-4 px-4 font-semibold w-1/3">CPU Load</th>
//                   <th className="py-4 px-4 font-semibold w-1/3 text-right">Memory (MB)</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-800/50">
//                 {processData.map((proc, i) => (
//                   <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
//                     <td className="py-4 px-4 font-medium text-slate-300 text-sm flex items-center gap-3">
//                       <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-indigo-400 transition-colors"></span>
//                       {proc.name}
//                     </td>
                    
//                     <td className="py-4 px-4">
//                       <div className="flex items-center gap-3">
//                         <span className="text-slate-400 text-xs w-8">{proc.cpu}%</span>
//                         <div className="w-full bg-slate-800 rounded-full h-1.5 max-w-[150px]">
//                           <div 
//                             className={`h-1.5 rounded-full transition-all ${proc.cpu > 15 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-blue-500'}`} 
//                             style={{ width: `${Math.min(proc.cpu, 100)}%` }}
//                           ></div>
//                         </div>
//                       </div>
//                     </td>

//                     <td className="py-4 px-4 text-right">
//                       <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-800 text-indigo-300 border border-slate-700">
//                         {proc.memory} MB
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </section>

//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from "recharts";
import { 
  Activity, Cpu, Globe, RefreshCw, Zap, 
  Clock, TerminalSquare, Target, Monitor, Play
} from "lucide-react";

// --- THE DEMO DICTIONARY ---
const CATEGORY_MAP = {
  "github.com": "Productive", "leetcode.com": "Productive", "stackoverflow.com": "Productive",
  "localhost": "Productive", "youtube.com": "Distracting", "instagram.com": "Distracting",
  "netflix.com": "Distracting", "chatgpt.com": "Productive", "gemini.google.com": "Productive"
};

const CATEGORY_COLORS = { "Productive": "#10B981", "Distracting": "#F43F5E", "Neutral": "#64748B" };

export default function Dashboard() {
  const [webData, setWebData] = useState([]);
  const [processData, setProcessData] = useState([]);
  const [categoryData, setCategoryData] = useState([]); 
  const [currentDesktop, setCurrentDesktop] = useState({ name: "Idle", minutes: 0 }); 
  const [loading, setLoading] = useState(true);
  
  const [totalWebTime, setTotalWebTime] = useState(0);
  const [productivityScore, setProductivityScore] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Web Data from Node.js
      const webRes = await fetch("http://localhost:8000/stats/today");
      const webJson = await webRes.json();
      let totalMins = 0;
      let catTotals = { "Productive": 0, "Distracting": 0, "Neutral": 0 };

      const cleanedWeb = webJson.map(item => {
        let siteName = item._id;
        try { siteName = new URL(item._id).hostname.replace("www.", ""); } 
        catch (e) { siteName = item._id.replace("www.", ""); }
        siteName = siteName.replace(/[-/]+$/, '').split('/')[0];
        const mins = Math.max(1, Math.round(item.total / 60));
        const category = CATEGORY_MAP[siteName] || "Neutral";
        totalMins += mins;
        catTotals[category] += mins;
        return { site: siteName, minutes: mins, category: category };
      }).filter(i => i.site !== "");
      
      setWebData(cleanedWeb.sort((a, b) => b.minutes - a.minutes).slice(0, 6));
      setTotalWebTime(totalMins);
      setProductivityScore(totalMins > 0 ? Math.round((catTotals["Productive"] / totalMins) * 100) : 0);
      setCategoryData(Object.keys(catTotals).filter(k => catTotals[k] > 0).map(k => ({
        name: k, value: Math.round((catTotals[k] / totalMins) * 100)
      })));

      // 2. Fetch System Snapshot from Flask
      const procRes = await fetch("http://127.0.0.1:5000/processes");
      const procJson = await procRes.json();
      setProcessData(procJson.slice(0, 6));

      // 3. Fetch LIVE Desktop Session from Flask
      const deskRes = await fetch("http://127.0.0.1:5000/desktop/current");
      const deskJson = await deskRes.json();
      setCurrentDesktop(deskJson || { name: "Idle", minutes: 0 });
      
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // 5s refresh for "Live" feel
    return () => clearInterval(interval);
  }, []);

  const WebTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0B1120] text-white p-3 rounded-xl border border-indigo-500/30 shadow-2xl">
          <p className="text-sm font-semibold mb-1">{data.site}</p>
          <p className="text-xs text-indigo-400 font-bold">{data.minutes} mins tracked</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#060913] font-sans text-slate-200 selection:bg-indigo-500/30 p-4 md:p-8">
      
      {/* HEADER */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-center bg-[#0F172A] p-6 rounded-2xl border border-slate-800 shadow-xl shadow-indigo-500/5">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
            <Zap className="text-white" size={24} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">SPARK</h1>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Smart Productivity Analysis Kit</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-bold text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">Syncing Live</span>
           <button onClick={fetchData} className="p-2 bg-[#1E293B] border border-slate-700 rounded-full hover:border-indigo-500 transition-all">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LIVE DESKTOP SESSION */}
        <section className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 p-6 rounded-3xl border border-indigo-500/30 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Monitor size={14}/> Current Focus
            </h2>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-3xl font-bold text-white mb-1">{currentDesktop.name}</h3>
                <p className="text-sm text-indigo-200 font-medium flex items-center gap-2">
                  <Play size={12} fill="currentColor"/> Active for {currentDesktop.minutes} mins
                </p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-400 animate-spin"></div>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 opacity-10 text-white">
            <Monitor size={120} />
          </div>
        </section>

        {/* WEB TIME KPI */}
        <section className="bg-[#0F172A] p-6 rounded-3xl border border-slate-800 flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20"><Clock size={28}/></div>
          <div><p className="text-xs text-slate-500 font-bold uppercase">Total Web Time</p><h3 className="text-2xl font-bold text-white">{Math.floor(totalWebTime/60)}h {totalWebTime%60}m</h3></div>
        </section>

        {/* FOCUS SCORE KPI */}
        <section className="bg-[#0F172A] p-6 rounded-3xl border border-slate-800 flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Target size={28}/></div>
          <div><p className="text-xs text-slate-500 font-bold uppercase">Focus Score</p><h3 className="text-2xl font-bold text-white">{productivityScore}%</h3></div>
        </section>

        {/* BROWSER ACTIVITY (BAR CHART) */}
        <section className="lg:col-span-2 bg-[#0F172A] p-6 rounded-3xl border border-slate-800">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2"><Globe size={14}/> Browser Activity Insights</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={webData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="site" type="category" width={100} tick={{fill: '#94A3B8', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#1E293B'}} content={<WebTooltip />} />
                <Bar dataKey="minutes" radius={[0, 4, 4, 0]} barSize={18} fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* INTENT ANALYSIS (PIE CHART) */}
        <section className="bg-[#0F172A] p-6 rounded-3xl border border-slate-800 flex flex-col items-center">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 self-start">Usage Breakdown</h2>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                  {categoryData.map((entry, index) => <Cell key={index} fill={CATEGORY_COLORS[entry.name]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full mt-4 grid grid-cols-2 gap-2">
            {categoryData.map(c => (
              <div key={c.name} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-800">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor: CATEGORY_COLORS[c.name]}}></span>
                <span className="text-[10px] font-bold text-slate-300">{c.value}% {c.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SYSTEM LOAD TABLE */}
        <section className="lg:col-span-3 bg-[#0F172A] p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <Cpu className="text-indigo-400" size={20} />
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Active System Resources</h2>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                <th className="pb-4 px-4">Application</th>
                <th className="pb-4 px-4 text-center">CPU Load</th>
                <th className="pb-4 px-4 text-right">Memory (MB)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {processData.map((p, i) => (
                <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 px-4 text-sm font-bold text-slate-200">{p.name}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-[10px] font-mono text-slate-400 w-8">{p.cpu}%</span>
                      <div className="w-32 bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{width: `${Math.min(p.cpu, 100)}%`}}></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-xs text-indigo-400 font-bold">{p.memory} MB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </div>
    </div>
  );
}