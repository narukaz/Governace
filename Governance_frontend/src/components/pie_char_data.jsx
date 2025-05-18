// // components/VoterPieChart.jsx
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useSelector } from "react-redux";

// // Utility to generate random colors
// const getRandomColor = () =>
//   `#${Math.floor(Math.random() * 16777215)
//     .toString(16)
//     .padStart(6, "0")}`;

// const VoterPieChart = ({ data }) => {
//   // Assign random color to each party
//   const { data, loading, error } = useSelector((state) => state.party);
//   const COLORS = data.map(() => getRandomColor());

//   return (
//     <Card className="w-full max-w-[600px] mx-auto shadow-md">
//       <CardHeader>
//         <CardTitle className="text-lg">Citizen Voting Breakdown</CardTitle>
//       </CardHeader>
//       <CardContent className="h-[400px]">
//         <ResponsiveContainer width="100%" height="100%">
//           <PieChart>
//             <Pie
//               data={data}
//               dataKey="votes"
//               nameKey="name"
//               cx="50%"
//               cy="50%"
//               outerRadius={120}
//               label
//             >
//               {data.map((_, index) => (
//                 <Cell key={`cell-${index}`} fill={COLORS[index]} />
//               ))}
//             </Pie>
//             <Tooltip />
//             <Legend verticalAlign="bottom" />
//           </PieChart>
//         </ResponsiveContainer>
//       </CardContent>
//     </Card>
//   );
// };

// export default VoterPieChart;
