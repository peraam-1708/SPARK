import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/stats/today")
      .then(res => res.json())
      .then(json => {
        const cleaned = json.map(item => ({
          // MongoDB returns _id instead of url
          site: new URL(item._id).hostname.replace("www.", ""),
          minutes: Math.round(item.total / 60)
        }));
        setData(cleaned);
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Today's Usage</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="site" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="minutes" fill="#378ADD" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}