// import * as d3 from 'd3';
// import { useEffect, useState, useRef } from 'react';
// import Papa from 'papaparse';

// export default function ScatterPlotWithHeightColor() {
//   const [seasonData, setSeasonData] = useState([]);
//   const [selectedSeason, setSelectedSeason] = useState('');
//   const tooltipRef = useRef(null); // 用于引用tooltip的div元素

//   useEffect(() => {
//     // 使用 fetch 获取 CSV 文件
//     fetch('/all_seasons.csv') 
//       .then(response => response.text())
//       .then(csvData => {
//         Papa.parse(csvData, {
//           header: true,
//           skipEmptyLines: true,
//           complete: (result) => {
//             const data = result.data.map(d => {
//               return {
//                 player_name: d.player_name,
//                 team_abbreviation: d.team_abbreviation,
//                 age: +d.age,
//                 player_height: +d.player_height,
//                 player_weight: +d.player_weight,
//                 college: d.college,
//                 country: d.country,
//                 draft_year: d.draft_year,
//                 draft_round: d.draft_round,
//                 draft_number: d.draft_number,
//                 gp: +d.gp,
//                 pts: +d.pts,
//                 reb: +d.reb,
//                 ast: +d.ast,
//                 net_rating: +d.net_rating,
//                 oreb_pct: +d.oreb_pct,
//                 dreb_pct: +d.dreb_pct,
//                 usg_pct: +d.usg_pct,
//                 ts_pct: +d.ts_pct,
//                 ast_pct: +d.ast_pct,
//                 season: d.season
//               };
//             });

//             setSeasonData(data);
//             // 默认选中第一个赛季
//             const seasons = [...new Set(data.map(player => player.season))];
//             setSelectedSeason(seasons[0]);
//           }
//         });
//       })
//       .catch(error => {
//         console.error('Error fetching the CSV file:', error);
//       });
//   }, []);

//   useEffect(() => {
//     if (!seasonData.length || !selectedSeason) return;
//     // 筛选出所选赛季的数据
//     const filteredData = seasonData.filter(d => d.season === selectedSeason);

//     // 1. 找出各项指标（PTS、AST、REB）排名前5的球员
//     const top5PTS = filteredData.slice().sort((a,b)=>b.pts - a.pts).slice(0,5);
//     const top5AST = filteredData.slice().sort((a,b)=>b.ast - a.ast).slice(0,5);
//     const top5REB = filteredData.slice().sort((a,b)=>b.reb - a.reb).slice(0,5);

//     // 2. 基于复合评分 (Score = a*PTS + b*AST + c*REB)
//     const a=1,n=1,c=1;
//     const withScore = filteredData.map(d=>{
//       return {
//         ...d,
//         score: a*d.pts + n*d.ast + c*d.reb
//       };
//     });
//     const top5Score = withScore.slice().sort((x,y)=>y.score - x.score).slice(0,5);

//     // 收集top球员名字
//     const topPlayersNames = {
//       pts: top5PTS.map(d=>d.player_name),
//       ast: top5AST.map(d=>d.player_name),
//       reb: top5REB.map(d=>d.player_name),
//       score: top5Score.map(d=>d.player_name)
//     };

//     console.log("得分前5名球员：", topPlayersNames.pts);
//     console.log("助攻前5名球员：", topPlayersNames.ast);
//     console.log("篮板前5名球员：", topPlayersNames.reb);
//     console.log("综合评分前5名球员：", topPlayersNames.score);

//     const width = 700;
//     const height = 600;
//     const margin = { top: 50, right: 50, bottom: 50, left: 50 };

//     const svg = d3.select('#scatterplot-height')
//       .attr('width', width)
//       .attr('height', height);

//     // 清空之前的绘图元素
//     svg.selectAll("*").remove();

//     // X轴：场均得分 pts
//     const xScale = d3.scaleLinear()
//       .domain([0, d3.max(filteredData, d => d.pts) || 10])
//       .range([margin.left, width - margin.right]);

//     // Y轴：场均助攻 ast
//     const yScale = d3.scaleLinear()
//       .domain([0, d3.max(filteredData, d => d.ast) || 10])
//       .range([height - margin.bottom, margin.top]);

//     // 氣泡大小：场均篮板 reb
//     const sizeScale = d3.scaleSqrt()
//       .domain([0, d3.max(filteredData, d => d.reb) || 10])
//       .range([0, 15]);

//     // 颜色比例：根据身高映射颜色
//     const heightExtent = d3.extent(filteredData, d => d.player_height);
//     const colorScale = d3.scaleSequential(d3.interpolateViridis)
//       .domain([heightExtent[0], heightExtent[1]]);

//     // 创建Tooltip的引用
//     const tooltip = d3.select(tooltipRef.current);

//     // 绘制散点 (circle)
//     const circles = svg.selectAll('circle')
//       .data(filteredData)
//       .enter()
//       .append('circle')
//       .attr('cx', d => xScale(d.pts))
//       .attr('cy', d => yScale(d.ast))
//       .attr('r', d => sizeScale(d.reb))
//       .attr('fill', d => colorScale(d.player_height))
//       .attr('opacity', 0.7)
//       .on('mouseover', function(event, d) {
//         // 显示tooltip
//         tooltip.style('visibility', 'visible')
//           .html(`
//             <div><strong>${d.player_name}</strong></div>
//             <div>Team: ${d.team_abbreviation}</div>
//             <div>PTS: ${d.pts}</div>
//             <div>AST: ${d.ast}</div>
//             <div>REB: ${d.reb}</div>
//           `);
//         d3.select(this).attr('stroke', '#333').attr('stroke-width', 2);
//       })
//       .on('mousemove', function(event, d) {
//         // 更新tooltip位置
//         tooltip.style('top', (event.pageY + 10) + 'px')
//                .style('left', (event.pageX + 10) + 'px');
//       })
//       .on('mouseout', function(event, d) {
//         // 隐藏tooltip
//         tooltip.style('visibility', 'hidden');
//         // 如果这个点是特殊的top5标记，还是保留原本高亮，否则恢复为无描边
//         const isTop = topPlayersNames.pts.includes(d.player_name) ||
//                       topPlayersNames.ast.includes(d.player_name) ||
//                       topPlayersNames.reb.includes(d.player_name) ||
//                       topPlayersNames.score.includes(d.player_name);
//         d3.select(this).attr('stroke', isTop ? 'red' : 'none').attr('stroke-width', isTop ? 2 : 0);
//       });

//     // 对 top5 的球员进行描边高亮（初始样式）
//     circles
//       .attr('stroke', d => {
//         if (topPlayersNames.pts.includes(d.player_name) ||
//             topPlayersNames.ast.includes(d.player_name) ||
//             topPlayersNames.reb.includes(d.player_name) ||
//             topPlayersNames.score.includes(d.player_name)) {
//           return 'red';
//         }
//         return 'none';
//       })
//       .attr('stroke-width', d => {
//         if (topPlayersNames.pts.includes(d.player_name) ||
//             topPlayersNames.ast.includes(d.player_name) ||
//             topPlayersNames.reb.includes(d.player_name) ||
//             topPlayersNames.score.includes(d.player_name)) {
//           return 2;
//         }
//         return 0;
//       });

//     const allTopPlayers = new Set([
//       ...topPlayersNames.pts,
//       ...topPlayersNames.ast,
//       ...topPlayersNames.reb,
//       ...topPlayersNames.score
//     ]);

//     // 为所有top球员添加名称标注
//     const highlightedPlayers = filteredData.filter(d => allTopPlayers.has(d.player_name));
//     svg.selectAll('.player-label')
//       .data(highlightedPlayers)
//       .enter()
//       .append('text')
//       .attr('x', d => xScale(d.pts) + 5)
//       .attr('y', d => yScale(d.ast) - 5)
//       .attr('font-size', '12px')
//       .attr('fill', 'red')
//       .style('stroke', 'white')
//       .style('stroke-width', 0.5)
//       .style('paint-order', 'stroke')
//       .text(d => d.player_name);

//     // 添加 X 轴
//     svg.append('g')
//       .attr('transform', `translate(0, ${height - margin.bottom})`)
//       .call(d3.axisBottom(xScale));

//     svg.append('text')
//       .attr('x', (width / 2))
//       .attr('y', height - 10)
//       .attr('text-anchor', 'middle')
//       .text('Points per Game');

//     // 添加 Y 轴
//     svg.append('g')
//       .attr('transform', `translate(${margin.left}, 0)`)
//       .call(d3.axisLeft(yScale));

//     svg.append('text')
//       .attr('transform', 'rotate(-90)')
//       .attr('x', -height / 2)
//       .attr('y', 20)
//       .attr('text-anchor', 'middle')
//       .text('Assists per Game');

//     // 添加气泡大小说明（篮板）
//     const legendValues = [2, 5, 10]; 
//     const legendX = width - margin.right - 50;
//     const legendY = margin.top + 20;

//     svg.selectAll('.legend-bubble')
//       .data(legendValues)
//       .enter()
//       .append('circle')
//       .attr('cx', legendX)
//       .attr('cy', (d, i) => legendY + i * 35)
//       .attr('r', d => sizeScale(d))
//       .attr('fill', 'steelblue')
//       .attr('opacity', 0.7);

//     svg.selectAll('.legend-text')
//       .data(legendValues)
//       .enter()
//       .append('text')
//       .attr('x', legendX + 20)
//       .attr('y', (d, i) => legendY + i * 35 + 5)
//       .text(d => `${d} Reb/G`);

//     svg.append('text')
//       .attr('x', legendX)
//       .attr('y', legendY - 15)
//       .attr('text-anchor', 'start')
//       .text('Bubble Size = Rebounds');

//     // 添加身高颜色渐变图例（线性渐变条形）
//     const gradientWidth = 20;
//     const gradientHeight = 100;
//     const gradientXPos = margin.left;
//     const gradientYPos = margin.top;

//     // 定义线性渐变
//     const defs = svg.append('defs');
//     const linearGradient = defs.append('linearGradient')
//       .attr('id', 'height-gradient')
//       .attr('x1', '0%')
//       .attr('y1', '100%')
//       .attr('x2', '0%')
//       .attr('y2', '0%'); 

//     linearGradient.append('stop')
//       .attr('offset', '0%')
//       .attr('stop-color', colorScale(heightExtent[0]));

//     linearGradient.append('stop')
//       .attr('offset', '100%')
//       .attr('stop-color', colorScale(heightExtent[1]));

//     // 绘制渐变矩形
//     svg.append('rect')
//       .attr('x', gradientXPos)
//       .attr('y', gradientYPos)
//       .attr('width', gradientWidth)
//       .attr('height', gradientHeight)
//       .style('fill', 'url(#height-gradient)');

//     // 渐变条的刻度
//     const heightScale = d3.scaleLinear()
//       .domain(heightExtent)
//       .range([gradientHeight + gradientYPos, gradientYPos]);

//     const axisRight = d3.axisRight(heightScale)
//       .ticks(5);

//     svg.append('g')
//       .attr('transform', `translate(${gradientXPos + gradientWidth},0)`)
//       .call(axisRight);

//     svg.append('text')
//       .attr('x', gradientXPos)
//       .attr('y', gradientYPos - 10)
//       .text('Height')
//       .attr('text-anchor', 'start');


//     // -------- 添加回归虚线 --------
//     // 对 filteredData 中的 pts, ast 进行简单线性回归
//     const ptsArray = filteredData.map(d => d.pts);
//     const astArray = filteredData.map(d => d.ast);

//     const meanX = d3.mean(ptsArray);
//     const meanY = d3.mean(astArray);

//     // 计算斜率 m 和截距 b
//     let numerator = 0;
//     let denominator = 0;
//     for (let i = 0; i < ptsArray.length; i++) {
//       numerator += (ptsArray[i] - meanX) * (astArray[i] - meanY);
//       denominator += (ptsArray[i] - meanX) ** 2;
//     }
//     const m = denominator === 0 ? 0 : numerator / denominator;
//     const b = meanY - m * meanX;

//     // 在 x 范围内绘制直线
//     const xMin = d3.min(ptsArray);
//     const xMax = d3.max(ptsArray);

//     // 计算对应的y值
//     const yMin = m * xMin + b;
//     const yMax = m * xMax + b;

//     // 创建一个用来画线的坐标对
//     const linePoints = [
//       [xScale(xMin), yScale(yMin)],
//       [xScale(xMax), yScale(yMax)]
//     ];

//     svg.append('line')
//       .attr('x1', linePoints[0][0])
//       .attr('y1', linePoints[0][1])
//       .attr('x2', linePoints[1][0])
//       .attr('y2', linePoints[1][1])
//       .attr('stroke', 'black')
//       .attr('stroke-width', 2)
//       .style('stroke-dasharray', ('4,4')) // 虚线样式

//     svg.append('text')
//       .attr('x', (xScale(xMax) + xScale(xMin))/2)
//       .attr('y', yScale(m*((xMin+xMax)/2)+b)-10)
//       .attr('text-anchor', 'middle')
//       .attr('font-size', '12px')
//       .text('Regression Line');

//   }, [seasonData, selectedSeason]);

//   const uniqueSeasons = [...new Set(seasonData.map(d => d.season))];

//   return (
//     <div style={{position:'relative'}}>
//       <h1>散点图（选择赛季，颜色映射球员身高 + 回归虚线）</h1>
//       <div>
//         <label>选择赛季：</label>
//         <select value={selectedSeason} onChange={(e) => setSelectedSeason(e.target.value)}>
//           {uniqueSeasons.map((season, index) => (
//             <option key={index} value={season}>{season}</option>
//           ))}
//         </select>
//       </div>
//       {/* tooltip div */}
//       <div 
//         ref={tooltipRef} 
//         style={{
//           position: 'absolute',
//           visibility: 'hidden',
//           backgroundColor: 'rgba(255,255,255,0.9)',
//           padding: '5px',
//           border: '1px solid #ccc',
//           borderRadius: '4px',
//           fontSize: '12px',
//           pointerEvents: 'none'
//         }}
//       ></div>
//       <svg id="scatterplot-height"></svg>
//     </div>
//   );
// }




// ==============================================================================================================================================





// 'use client'; // 如果使用Next.js 13 App Router, 确保加上此行在顶部

// import * as d3 from 'd3';
// import { useEffect, useState, useRef } from 'react';
// import Papa from 'papaparse';
// import 'bootstrap/dist/css/bootstrap.min.css'; 
// // import dynamic from 'next/dynamic';

// // 动态导入 Modal 和 Button，自 react-bootstrap 主入口获取命名导出，确保 ssr:false
// // const Modal = dynamic(() => import('react-bootstrap').then(mod => mod.Modal), { ssr: false });
// // const Button = dynamic(() => import('react-bootstrap').then(mod => mod.Button), { ssr: false });

// export default function ScatterPlotWithHeightColor() {
//   const [seasonData, setSeasonData] = useState([]);
//   const [selectedSeason, setSelectedSeason] = useState('');
//   const [selectedPlayer, setSelectedPlayer] = useState(null); 
//   const tooltipRef = useRef(null);

//   useEffect(() => {
//     fetch('/all_seasons.csv')
//       .then(response => response.text())
//       .then(csvData => {
//         Papa.parse(csvData, {
//           header: true,
//           skipEmptyLines: true,
//           complete: (result) => {
//             const data = result.data.map(d => ({
//               player_name: d.player_name,
//               team_abbreviation: d.team_abbreviation,
//               age: +d.age,
//               player_height: +d.player_height,
//               player_weight: +d.player_weight,
//               college: d.college,
//               country: d.country,
//               draft_year: d.draft_year,
//               draft_round: d.draft_round,
//               draft_number: d.draft_number,
//               gp: +d.gp,
//               pts: +d.pts,
//               reb: +d.reb,
//               ast: +d.ast,
//               net_rating: +d.net_rating,
//               oreb_pct: +d.oreb_pct,
//               dreb_pct: +d.dreb_pct,
//               usg_pct: +d.usg_pct,
//               ts_pct: +d.ts_pct,
//               ast_pct: d.ast_pct,
//               season: d.season
//             }));
//             setSeasonData(data);
//             const seasons = [...new Set(data.map(player => player.season))];
//             if (seasons.length > 0) {
//               setSelectedSeason(seasons[0]);
//             }
//           }
//         });
//       })
//       .catch(error => {
//         console.error('Error fetching the CSV file:', error);
//       });
//   }, []);

//   useEffect(() => {
//     if (!seasonData.length || !selectedSeason) return;

//     const filteredData = seasonData.filter(d => d.season === selectedSeason);

//     // Find top5
//     const top5PTS = filteredData.slice().sort((a,b)=>b.pts - a.pts).slice(0,5);
//     const top5AST = filteredData.slice().sort((a,b)=>b.ast - a.ast).slice(0,5);
//     const top5REB = filteredData.slice().sort((a,b)=>b.reb - a.reb).slice(0,5);

//     const a=1, n=1, c=1;
//     const withScore = filteredData.map(d=>({
//       ...d,
//       score: a*d.pts + n*d.ast + c*d.reb
//     }));
//     const top5Score = withScore.slice().sort((x,y)=>y.score - x.score).slice(0,5);

//     const topPlayersNames = {
//       pts: top5PTS.map(d=>d.player_name),
//       ast: top5AST.map(d=>d.player_name),
//       reb: top5REB.map(d=>d.player_name),
//       score: top5Score.map(d=>d.player_name)
//     };

//     const width = 700;
//     const height = 600;
//     const margin = { top: 50, right: 50, bottom: 50, left: 50 };

//     const svg = d3.select('#scatterplot-height')
//       .attr('viewBox', `0 0 ${width} ${height}`)
//       .attr('preserveAspectRatio', 'xMidYMid meet');

//     svg.selectAll("*").remove();

//     const xScale = d3.scaleLinear()
//       .domain([0, d3.max(filteredData, d => d.pts) || 10])
//       .range([margin.left, width - margin.right]);

//     const yScale = d3.scaleLinear()
//       .domain([0, d3.max(filteredData, d => d.ast) || 10])
//       .range([height - margin.bottom, margin.top]);

//     const sizeScale = d3.scaleSqrt()
//       .domain([0, d3.max(filteredData, d => d.reb) || 10])
//       .range([0, 15]);

//     const heightExtent = d3.extent(filteredData, d => d.player_height);
//     const colorScale = d3.scaleSequential(d3.interpolateViridis)
//       .domain([heightExtent[0], heightExtent[1]]);

//     const tooltip = d3.select(tooltipRef.current);

//     const circles = svg.selectAll('circle')
//       .data(filteredData)
//       .enter()
//       .append('circle')
//       .attr('cx', d => xScale(d.pts))
//       .attr('cy', d => yScale(d.ast))
//       .attr('r', d => sizeScale(d.reb))
//       .attr('fill', d => colorScale(d.player_height))
//       .attr('opacity', 0.7)
//       .on('mouseover', function(event, d) {
//         tooltip.style('visibility', 'visible')
//           .html(`
//             <div><strong>${d.player_name}</strong></div>
//             <div>Team: ${d.team_abbreviation}</div>
//             <div>PTS: ${d.pts}</div>
//             <div>AST: ${d.ast}</div>
//             <div>REB: ${d.reb}</div>
//           `);
//         d3.select(this).attr('stroke', '#333').attr('stroke-width', 2);
//       })
//       .on('mousemove', function(event) {
//         tooltip.style('top', (event.pageY + 10) + 'px')
//                .style('left', (event.pageX + 10) + 'px');
//       })
//       .on('mouseout', function(event, d) {
//         tooltip.style('visibility', 'hidden');
//         const isTop = topPlayersNames.pts.includes(d.player_name) ||
//                       topPlayersNames.ast.includes(d.player_name) ||
//                       topPlayersNames.reb.includes(d.player_name) ||
//                       topPlayersNames.score.includes(d.player_name);
//         d3.select(this).attr('stroke', isTop ? 'red' : 'none').attr('stroke-width', isTop ? 2 : 0);
//       })
//       .on('click', (event, d) => {
//         setSelectedPlayer(d);
//       });

//     circles
//       .attr('stroke', d => {
//         if (topPlayersNames.pts.includes(d.player_name) ||
//             topPlayersNames.ast.includes(d.player_name) ||
//             topPlayersNames.reb.includes(d.player_name) ||
//             topPlayersNames.score.includes(d.player_name)) {
//           return 'red';
//         }
//         return 'none';
//       })
//       .attr('stroke-width', d => {
//         if (topPlayersNames.pts.includes(d.player_name) ||
//             topPlayersNames.ast.includes(d.player_name) ||
//             topPlayersNames.reb.includes(d.player_name) ||
//             topPlayersNames.score.includes(d.player_name)) {
//           return 2;
//         }
//         return 0;
//       });

//     const allTopPlayers = new Set([
//       ...topPlayersNames.pts,
//       ...topPlayersNames.ast,
//       ...topPlayersNames.reb,
//       ...topPlayersNames.score
//     ]);

//     const highlightedPlayers = filteredData.filter(d => allTopPlayers.has(d.player_name));
//     svg.selectAll('.player-label')
//       .data(highlightedPlayers)
//       .enter()
//       .append('text')
//       .attr('x', d => xScale(d.pts) + 5)
//       .attr('y', d => yScale(d.ast) - 5)
//       .attr('font-size', '12px')
//       .attr('fill', 'red')
//       .style('stroke', 'white')
//       .style('stroke-width', 0.5)
//       .style('paint-order', 'stroke')
//       .text(d => d.player_name);

//     svg.append('g')
//       .attr('transform', `translate(0, ${height - margin.bottom})`)
//       .call(d3.axisBottom(xScale));

//     svg.append('text')
//       .attr('x', (width / 2))
//       .attr('y', height - 10)
//       .attr('text-anchor', 'middle')
//       .text('Points per Game');

//     svg.append('g')
//       .attr('transform', `translate(${margin.left}, 0)`)
//       .call(d3.axisLeft(yScale));

//     svg.append('text')
//       .attr('transform', 'rotate(-90)')
//       .attr('x', -height / 2)
//       .attr('y', 20)
//       .attr('text-anchor', 'middle')
//       .text('Assists per Game');

//     const legendValues = [2, 5, 10]; 
//     const legendX = width - margin.right - 50;
//     const legendY = margin.top + 20;

//     svg.selectAll('.legend-bubble')
//       .data(legendValues)
//       .enter()
//       .append('circle')
//       .attr('cx', legendX)
//       .attr('cy', (d, i) => legendY + i * 35)
//       .attr('r', d => sizeScale(d))
//       .attr('fill', 'steelblue')
//       .attr('opacity', 0.7);

//     svg.selectAll('.legend-text')
//       .data(legendValues)
//       .enter()
//       .append('text')
//       .attr('x', legendX + 20)
//       .attr('y', (d, i) => legendY + i * 35 + 5)
//       .text(d => `${d} Reb/G`);

//     svg.append('text')
//       .attr('x', legendX)
//       .attr('y', legendY - 15)
//       .attr('text-anchor', 'start')
//       .text('Bubble Size = Rebounds');

//     const gradientWidth = 20;
//     const gradientHeight = 100;
//     const gradientXPos = margin.left;
//     const gradientYPos = margin.top;

//     const defs = svg.append('defs');
//     const linearGradient = defs.append('linearGradient')
//       .attr('id', 'height-gradient')
//       .attr('x1', '0%')
//       .attr('y1', '100%')
//       .attr('x2', '0%')
//       .attr('y2', '0%'); 

//     linearGradient.append('stop')
//       .attr('offset', '0%')
//       .attr('stop-color', colorScale(heightExtent[0]));

//     linearGradient.append('stop')
//       .attr('offset', '100%')
//       .attr('stop-color', colorScale(heightExtent[1]));

//     svg.append('rect')
//       .attr('x', gradientXPos)
//       .attr('y', gradientYPos)
//       .attr('width', gradientWidth)
//       .attr('height', gradientHeight)
//       .style('fill', 'url(#height-gradient)');

//     const heightScale = d3.scaleLinear()
//       .domain(heightExtent)
//       .range([gradientHeight + gradientYPos, gradientYPos]);

//     const axisRight = d3.axisRight(heightScale)
//       .ticks(5);

//     svg.append('g')
//       .attr('transform', `translate(${gradientXPos + gradientWidth},0)`)
//       .call(axisRight);

//     svg.append('text')
//       .attr('x', gradientXPos)
//       .attr('y', gradientYPos - 10)
//       .attr('text-anchor', 'start')
//       .text('Height');

//     const ptsArray = filteredData.map(d => d.pts);
//     const astArray = filteredData.map(d => d.ast);

//     const meanX = d3.mean(ptsArray);
//     const meanY = d3.mean(astArray);

//     let numerator = 0;
//     let denominator = 0;
//     for (let i = 0; i < ptsArray.length; i++) {
//       numerator += (ptsArray[i] - meanX) * (astArray[i] - meanY);
//       denominator += (ptsArray[i] - meanX) ** 2;
//     }

//     const m = denominator === 0 ? 0 : numerator / denominator;
//     const b = meanY - m * meanX;

//     const xMin = d3.min(ptsArray);
//     const xMax = d3.max(ptsArray);
//     const yMin = m * xMin + b;
//     const yMax = m * xMax + b;

//     const linePoints = [
//       [xScale(xMin), yScale(yMin)],
//       [xScale(xMax), yScale(yMax)]
//     ];

//     svg.append('line')
//       .attr('x1', linePoints[0][0])
//       .attr('y1', linePoints[0][1])
//       .attr('x2', linePoints[1][0])
//       .attr('y2', linePoints[1][1])
//       .attr('stroke', 'black')
//       .attr('stroke-width', 2)
//       .style('stroke-dasharray', ('4,4'));

//     svg.append('text')
//       .attr('x', (xScale(xMax) + xScale(xMin))/2)
//       .attr('y', yScale(m*((xMin+xMax)/2)+b)-10)
//       .attr('text-anchor', 'middle')
//       .attr('font-size', '12px')
//       .text('Regression Line');

//   }, [seasonData, selectedSeason]);

//   const uniqueSeasons = [...new Set(seasonData.map(d => d.season))];

//   return (
//     <div className="container mt-4" style={{ position: 'relative' }}>
//       <div className="row">
//         <div className="col-md-12">
//           <h1 className="mb-4">Scatter Plot (Select Season, Color by Player Height + Regression Line)</h1>
//         </div>
//       </div>
//       <div className="row mb-3">
//         <div className="col-md-3">
//           <label htmlFor="seasonSelect" className="form-label">Select Season:</label>
//           <select 
//             id="seasonSelect" 
//             className="form-select" 
//             value={selectedSeason} 
//             onChange={(e) => setSelectedSeason(e.target.value)}
//           >
//             {uniqueSeasons.map((season, index) => (
//               <option key={index} value={season}>{season}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <div 
//         ref={tooltipRef} 
//         style={{
//           position: 'absolute',
//           visibility: 'hidden',
//           backgroundColor: 'rgba(255,255,255,0.9)',
//           padding: '5px',
//           border: '1px solid #ccc',
//           borderRadius: '4px',
//           fontSize: '12px',
//           pointerEvents: 'none'
//         }}
//       ></div>

//       <div className="row">
//         <div className="col-md-12">
//           <svg id="scatterplot-height" style={{ width: '100%', height: 'auto' }}></svg>
//         </div>
//       </div>

//       {Modal && Button && (
//         <Modal show={selectedPlayer !== null} onHide={() => setSelectedPlayer(null)}>
//           <Modal.Header closeButton>
//             <Modal.Title>Player Details</Modal.Title>
//           </Modal.Header>
//           {selectedPlayer && (
//             <Modal.Body>
//               <table className="table table-bordered table-sm">
//                 <tbody>
//                   <tr>
//                     <th>Name</th>
//                     <td>{selectedPlayer.player_name}</td>
//                   </tr>
//                   <tr>
//                     <th>Team</th>
//                     <td>{selectedPlayer.team_abbreviation}</td>
//                   </tr>
//                   <tr>
//                     <th>Points per Game (PTS)</th>
//                     <td>{selectedPlayer.pts}</td>
//                   </tr>
//                   <tr>
//                     <th>Assists per Game (AST)</th>
//                     <td>{selectedPlayer.ast}</td>
//                   </tr>
//                   <tr>
//                     <th>Rebounds per Game (REB)</th>
//                     <td>{selectedPlayer.reb}</td>
//                   </tr>
//                   <tr>
//                     <th>Height</th>
//                     <td>{selectedPlayer.player_height}</td>
//                   </tr>
//                   <tr>
//                     <th>Weight</th>
//                     <td>{selectedPlayer.player_weight}</td>
//                   </tr>
//                   <tr>
//                     <th>Age</th>
//                     <td>{selectedPlayer.age}</td>
//                   </tr>
//                   <tr>
//                     <th>College</th>
//                     <td>{selectedPlayer.college}</td>
//                   </tr>
//                   <tr>
//                     <th>Country</th>
//                     <td>{selectedPlayer.country}</td>
//                   </tr>
//                   <tr>
//                     <th>Draft Year</th>
//                     <td>{selectedPlayer.draft_year}</td>
//                   </tr>
//                   <tr>
//                     <th>Draft Round</th>
//                     <td>{selectedPlayer.draft_round}</td>
//                   </tr>
//                   <tr>
//                     <th>Draft Number</th>
//                     <td>{selectedPlayer.draft_number}</td>
//                   </tr>
//                   <tr>
//                     <th>Games Played</th>
//                     <td>{selectedPlayer.gp}</td>
//                   </tr>
//                   <tr>
//                     <th>Net Rating</th>
//                     <td>{selectedPlayer.net_rating}</td>
//                   </tr>
//                   <tr>
//                     <th>Offensive Rebound %</th>
//                     <td>{selectedPlayer.oreb_pct}</td>
//                   </tr>
//                   <tr>
//                     <th>Defensive Rebound %</th>
//                     <td>{selectedPlayer.dreb_pct}</td>
//                   </tr>
//                   <tr>
//                     <th>Usage %</th>
//                     <td>{selectedPlayer.usg_pct}</td>
//                   </tr>
//                   <tr>
//                     <th>True Shooting % (TS%)</th>
//                     <td>{selectedPlayer.ts_pct}</td>
//                   </tr>
//                   <tr>
//                     <th>Assist %</th>
//                     <td>{selectedPlayer.ast_pct}</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </Modal.Body>
//           )}
//           <Modal.Footer>
//             <Button variant="secondary" onClick={() => setSelectedPlayer(null)}>
//               Close
//             </Button>
//           </Modal.Footer>
//         </Modal>
//       )}
//     </div>
//   );
// }





// ====================================================================================================================================


// import * as d3 from 'd3';
// import { useEffect, useState, useRef } from 'react';
// import Papa from 'papaparse';

// export default function ScatterPlotWithHeightColor() {
//   const [seasonData, setSeasonData] = useState([]);
//   const [selectedSeason, setSelectedSeason] = useState('');
//   const tooltipRef = useRef(null); // Reference to the tooltip div element

//   useEffect(() => {
//     // Fetch the CSV file
//     fetch('/all_seasons.csv')
//       .then(response => response.text())
//       .then(csvData => {
//         Papa.parse(csvData, {
//           header: true,
//           skipEmptyLines: true,
//           complete: (result) => {
//             const data = result.data.map(d => {
//               return {
//                 player_name: d.player_name,
//                 team_abbreviation: d.team_abbreviation,
//                 age: +d.age,
//                 player_height: +d.player_height,
//                 player_weight: +d.player_weight,
//                 college: d.college,
//                 country: d.country,
//                 draft_year: d.draft_year,
//                 draft_round: d.draft_round,
//                 draft_number: d.draft_number,
//                 gp: +d.gp,
//                 pts: +d.pts,
//                 reb: +d.reb,
//                 ast: +d.ast,
//                 net_rating: +d.net_rating,
//                 oreb_pct: +d.oreb_pct,
//                 dreb_pct: +d.dreb_pct,
//                 usg_pct: +d.usg_pct,
//                 ts_pct: +d.ts_pct,
//                 ast_pct: +d.ast_pct,
//                 season: d.season
//               };
//             });

//             setSeasonData(data);
//             // Select the first season by default
//             const seasons = [...new Set(data.map(player => player.season))];
//             setSelectedSeason(seasons[0]);
//           }
//         });
//       })
//       .catch(error => {
//         console.error('Error fetching the CSV file:', error);
//       });
//   }, []);

//   useEffect(() => {
//     if (!seasonData.length || !selectedSeason) return;
//     // Filter data for the selected season
//     const filteredData = seasonData.filter(d => d.season === selectedSeason);

//     // 1. Find the top 5 players in each metric (PTS, AST, REB)
//     const top5PTS = filteredData.slice().sort((a, b) => b.pts - a.pts).slice(0, 5);
//     const top5AST = filteredData.slice().sort((a, b) => b.ast - a.ast).slice(0, 5);
//     const top5REB = filteredData.slice().sort((a, b) => b.reb - a.reb).slice(0, 5);

//     // 2. Calculate composite scores (Score = a*PTS + n*AST + c*REB)
//     const a = 1, n = 1, c = 1;
//     const withScore = filteredData.map(d => {
//       return {
//         ...d,
//         score: a * d.pts + n * d.ast + c * d.reb
//       };
//     });
//     const top5Score = withScore.slice().sort((x, y) => y.score - x.score).slice(0, 5);

//     // Collect top player names
//     const topPlayersNames = {
//       pts: top5PTS.map(d => d.player_name),
//       ast: top5AST.map(d => d.player_name),
//       reb: top5REB.map(d => d.player_name),
//       score: top5Score.map(d => d.player_name)
//     };

//     console.log("Top 5 Scorers:", topPlayersNames.pts);
//     console.log("Top 5 Assisters:", topPlayersNames.ast);
//     console.log("Top 5 Rebounders:", topPlayersNames.reb);
//     console.log("Top 5 Composite Scores:", topPlayersNames.score);

//     const width = 700;
//     const height = 600;
//     const margin = { top: 50, right: 150, bottom: 50, left: 70 };

//     const svg = d3.select('#scatterplot-height')
//       .attr('width', width)
//       .attr('height', height);

//     // Clear previous drawings
//     svg.selectAll("*").remove();

//     // X-axis: Points per Game (PTS)
//     const xScale = d3.scaleLinear()
//       .domain([0, d3.max(filteredData, d => d.pts) || 10])
//       .range([margin.left, width - margin.right]);

//     // Y-axis: Assists per Game (AST)
//     const yScale = d3.scaleLinear()
//       .domain([0, d3.max(filteredData, d => d.ast) || 10])
//       .range([height - margin.bottom, margin.top]);

//     // Bubble size: Rebounds per Game (REB)
//     const sizeScale = d3.scaleSqrt()
//       .domain([0, d3.max(filteredData, d => d.reb) || 10])
//       .range([0, 15]);

//     // Color scale: Player height
//     const heightExtent = d3.extent(filteredData, d => d.player_height);
//     const colorScale = d3.scaleSequential(d3.interpolateViridis)
//       .domain([heightExtent[0], heightExtent[1]]);

//     // Tooltip reference
//     const tooltip = d3.select(tooltipRef.current);

//     // Draw scatter points (circles)
//     const circles = svg.selectAll('circle')
//       .data(filteredData)
//       .enter()
//       .append('circle')
//       .attr('cx', d => xScale(d.pts))
//       .attr('cy', d => yScale(d.ast))
//       .attr('r', d => sizeScale(d.reb))
//       .attr('fill', d => colorScale(d.player_height))
//       .attr('opacity', 0.7)
//       .on('mouseover', function(event, d) {
//         // Show tooltip
//         tooltip.style('visibility', 'visible')
//           .html(`
//             <div><strong>${d.player_name}</strong></div>
//             <div>Team: ${d.team_abbreviation}</div>
//             <div>PTS: ${d.pts}</div>
//             <div>AST: ${d.ast}</div>
//             <div>REB: ${d.reb}</div>
//           `);
//         d3.select(this).attr('stroke', '#333').attr('stroke-width', 2);
//       })
//       .on('mousemove', function(event, d) {
//         // Update tooltip position closer to the point
//         const tooltipWidth = 150; // Approximate width
//         const tooltipHeight = 80; // Approximate height
//         let left = event.pageX + 10;
//         let top = event.pageY + 10;

//         // Prevent tooltip from going off the right edge
//         if (left + tooltipWidth > window.innerWidth) {
//           left = event.pageX - tooltipWidth - 10;
//         }

//         // Prevent tooltip from going off the bottom edge
//         if (top + tooltipHeight > window.innerHeight) {
//           top = event.pageY - tooltipHeight - 500;
//         }

//         tooltip.style('top', `${top}px`)
//                .style('left', `${left}px`);
//       })
//       .on('mouseout', function(event, d) {
//         // Hide tooltip
//         tooltip.style('visibility', 'hidden');
//         // Retain highlight for top players
//         const isTop = topPlayersNames.pts.includes(d.player_name) ||
//                       topPlayersNames.ast.includes(d.player_name) ||
//                       topPlayersNames.reb.includes(d.player_name) ||
//                       topPlayersNames.score.includes(d.player_name);
//         d3.select(this).attr('stroke', isTop ? 'red' : 'none').attr('stroke-width', isTop ? 2 : 0);
//       });

//     // Highlight top 5 players with red stroke
//     circles
//       .attr('stroke', d => {
//         if (topPlayersNames.pts.includes(d.player_name) ||
//             topPlayersNames.ast.includes(d.player_name) ||
//             topPlayersNames.reb.includes(d.player_name) ||
//             topPlayersNames.score.includes(d.player_name)) {
//           return 'red';
//         }
//         return 'none';
//       })
//       .attr('stroke-width', d => {
//         if (topPlayersNames.pts.includes(d.player_name) ||
//             topPlayersNames.ast.includes(d.player_name) ||
//             topPlayersNames.reb.includes(d.player_name) ||
//             topPlayersNames.score.includes(d.player_name)) {
//           return 2;
//         }
//         return 0;
//       });

//     const allTopPlayers = new Set([
//       ...topPlayersNames.pts,
//       ...topPlayersNames.ast,
//       ...topPlayersNames.reb,
//       ...topPlayersNames.score
//     ]);

//     // Add labels for top players
//     const highlightedPlayers = filteredData.filter(d => allTopPlayers.has(d.player_name));
//     svg.selectAll('.player-label')
//       .data(highlightedPlayers)
//       .enter()
//       .append('text')
//       .attr('x', d => xScale(d.pts) + 5)
//       .attr('y', d => yScale(d.ast) - 5)
//       .attr('font-size', '12px')
//       .attr('fill', 'red')
//       .style('stroke', 'white')
//       .style('stroke-width', 0.5)
//       .style('paint-order', 'stroke')
//       .text(d => d.player_name);

//     // Add X-axis
//     svg.append('g')
//       .attr('transform', `translate(0, ${height - margin.bottom})`)
//       .call(d3.axisBottom(xScale));

//     svg.append('text')
//       .attr('x', (width / 2))
//       .attr('y', height - 10)
//       .attr('text-anchor', 'middle')
//       .attr('font-size', '14px')
//       .attr('fill', 'black')
//       .text('Points per Game');

//     // Add Y-axis
//     svg.append('g')
//       .attr('transform', `translate(${margin.left}, 0)`)
//       .call(d3.axisLeft(yScale));

//     svg.append('text')
//       .attr('transform', 'rotate(-90)')
//       .attr('x', -height / 2)
//       .attr('y', 20)
//       .attr('text-anchor', 'middle')
//       .attr('font-size', '14px')
//       .attr('fill', 'black')
//       .text('Assists per Game');

//     // Add bubble size legend (Rebounds)
//     const legendValues = [2, 5, 10];
//     const legendX = width - margin.right + 30;
//     const legendY = margin.top + 20;

//     svg.selectAll('.legend-bubble')
//       .data(legendValues)
//       .enter()
//       .append('circle')
//       .attr('cx', legendX)
//       .attr('cy', (d, i) => legendY + i * 40)
//       .attr('r', d => sizeScale(d))
//       .attr('fill', 'steelblue')
//       .attr('opacity', 0.7);

//     svg.selectAll('.legend-text')
//       .data(legendValues)
//       .enter()
//       .append('text')
//       .attr('x', legendX + 25)
//       .attr('y', (d, i) => legendY + i * 40 + 5)
//       .attr('font-size', '12px')
//       .attr('fill', 'black')
//       .text(d => `${d} Reb/G`);

//     svg.append('text')
//       .attr('x', legendX)
//       .attr('y', legendY - 15)
//       .attr('text-anchor', 'start')
//       .attr('font-size', '14px')
//       .attr('fill', 'black')
//       .text('Bubble Size = Rebounds');

//     // Add height color gradient legend (moved to bottom right)
//     const gradientWidth = 20;
//     const gradientHeight = 100;
//     const gradientXPos = width - margin.right + 30;
//     const gradientYPos = height - margin.bottom - gradientHeight - 20;

//     // Define linear gradient
//     const defs = svg.append('defs');
//     const linearGradient = defs.append('linearGradient')
//       .attr('id', 'height-gradient')
//       .attr('x1', '0%')
//       .attr('y1', '100%')
//       .attr('x2', '0%')
//       .attr('y2', '0%');

//     linearGradient.append('stop')
//       .attr('offset', '0%')
//       .attr('stop-color', colorScale(heightExtent[0]));

//     linearGradient.append('stop')
//       .attr('offset', '100%')
//       .attr('stop-color', colorScale(heightExtent[1]));

//     // Draw gradient rectangle
//     svg.append('rect')
//       .attr('x', gradientXPos)
//       .attr('y', gradientYPos)
//       .attr('width', gradientWidth)
//       .attr('height', gradientHeight)
//       .style('fill', 'url(#height-gradient)');

//     // Add gradient scale
//     const heightScale = d3.scaleLinear()
//       .domain(heightExtent)
//       .range([gradientHeight + gradientYPos, gradientYPos]);

//     const axisRight = d3.axisRight(heightScale)
//       .ticks(5);

//     svg.append('g')
//       .attr('transform', `translate(${gradientXPos + gradientWidth},0)`)
//       .call(axisRight);

//     svg.append('text')
//       .attr('x', gradientXPos)
//       .attr('y', gradientYPos - 10)
//       .attr('text-anchor', 'start')
//       .attr('font-size', '14px')
//       .attr('fill', 'black')
//       .text('Height');

//     // -------- Add Regression Dashed Line --------
//     // Perform simple linear regression on pts and ast
//     const ptsArray = filteredData.map(d => d.pts);
//     const astArray = filteredData.map(d => d.ast);

//     const meanX = d3.mean(ptsArray);
//     const meanY = d3.mean(astArray);

//     // Calculate slope (m) and y-intercept (b_reg)
//     let numerator = 0;
//     let denominator = 0;
//     for (let i = 0; i < ptsArray.length; i++) {
//       numerator += (ptsArray[i] - meanX) * (astArray[i] - meanY);
//       denominator += (ptsArray[i] - meanX) ** 2;
//     }
//     const m = denominator === 0 ? 0 : numerator / denominator;
//     const b_reg = meanY - m * meanX;

//     // Draw regression line within x range
//     const xMin = d3.min(ptsArray);
//     const xMax = d3.max(ptsArray);

//     // Calculate corresponding y values
//     const yMin = m * xMin + b_reg;
//     const yMax = m * xMax + b_reg;

//     // Coordinates for the regression line
//     const linePoints = [
//       [xScale(xMin), yScale(yMin)],
//       [xScale(xMax), yScale(yMax)]
//     ];

//     svg.append('line')
//       .attr('x1', linePoints[0][0])
//       .attr('y1', linePoints[0][1])
//       .attr('x2', linePoints[1][0])
//       .attr('y2', linePoints[1][1])
//       .attr('stroke', 'black')
//       .attr('stroke-width', 2)
//       .style('stroke-dasharray', ('4,4')); // Dashed line style

//     svg.append('text')
//       .attr('x', (xScale(xMax) + xScale(xMin)) / 2)
//       .attr('y', yScale(m * ((xMin + xMax) / 2) + b_reg) - 10)
//       .attr('text-anchor', 'middle')
//       .attr('font-size', '12px')
//       .attr('fill', 'black')
//       .text('');

//   }, [seasonData, selectedSeason]);

//   const uniqueSeasons = [...new Set(seasonData.map(d => d.season))];

//   return (
//     <div className="container my-5">
//       <div className="row mb-4">
//         <div className="col text-center">
//           <h1>Evaluate player impact from Points, Rebounds, Assists</h1>
//         </div>
//       </div>

//       <div className="row mb-4">
//         <div className="col-md-4 offset-md-4">
//           <div className="form-group">
//             <label htmlFor="seasonSelect" className="form-label">Select Season:</label>
//             <select
//               id="seasonSelect"
//               className="form-select"
//               value={selectedSeason}
//               onChange={(e) => setSelectedSeason(e.target.value)}
//             >
//               {uniqueSeasons.map((season, index) => (
//                 <option key={index} value={season}>{season}</option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       <div className="position-relative">
//         {/* Tooltip div */}
//         <div 
//           ref={tooltipRef} 
//           className="position-absolute"
//           style={{
//             visibility: 'hidden',
//             backgroundColor: 'rgba(255,255,255,0.9)',
//             padding: '10px',
//             border: '1px solid #ccc',
//             borderRadius: '4px',
//             fontSize: '12px',
//             pointerEvents: 'none',
//             boxShadow: '0px 0px 10px rgba(0,0,0,0.1)'
//           }}
//         ></div>
//         <div className="d-flex justify-content-center">
//           <svg id="scatterplot-height"></svg>
//         </div>
//       </div>
//     </div>
//   );
// }

import * as d3 from 'd3';
import { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';

export default function ScatterPlotWithHeightColor() {
  const [seasonData, setSeasonData] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const tooltipRef = useRef(null); // Reference to the tooltip div element

  useEffect(() => {
    // Raw GitHub URL for the CSV file
    const url = 'https://raw.githubusercontent.com/Shangyuan-Niu/all_seasons/main/all_seasons.csv';

    // Fetch the CSV file from GitHub
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(csvData => {
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const data = result.data.map(d => ({
              player_name: d.player_name,
              team_abbreviation: d.team_abbreviation,
              age: +d.age,
              player_height: +d.player_height,
              player_weight: +d.player_weight,
              college: d.college,
              country: d.country,
              draft_year: d.draft_year,
              draft_round: d.draft_round,
              draft_number: d.draft_number,
              gp: +d.gp,
              pts: +d.pts,
              reb: +d.reb,
              ast: +d.ast,
              net_rating: +d.net_rating,
              oreb_pct: +d.oreb_pct,
              dreb_pct: +d.dreb_pct,
              usg_pct: +d.usg_pct,
              ts_pct: +d.ts_pct,
              ast_pct: +d.ast_pct,
              season: d.season
            }));

            setSeasonData(data);
            // Select the first season by default
            const seasons = [...new Set(data.map(player => player.season))];
            setSelectedSeason(seasons[0]);
          }
        });
      })
      .catch(error => {
        console.error('Error fetching the CSV file:', error);
      });
  }, []);

  useEffect(() => {
    if (!seasonData.length || !selectedSeason) return;
    // Filter data for the selected season
    const filteredData = seasonData.filter(d => d.season === selectedSeason);

    // 1. Find the top 5 players in each metric (PTS, AST, REB)
    const top5PTS = filteredData.slice().sort((a, b) => b.pts - a.pts).slice(0, 5);
    const top5AST = filteredData.slice().sort((a, b) => b.ast - a.ast).slice(0, 5);
    const top5REB = filteredData.slice().sort((a, b) => b.reb - a.reb).slice(0, 5);

    // 2. Calculate composite scores (Score = a*PTS + n*AST + c*REB)
    const a = 1, n = 1, c = 1;
    const withScore = filteredData.map(d => ({
      ...d,
      score: a * d.pts + n * d.ast + c * d.reb
    }));
    const top5Score = withScore.slice().sort((x, y) => y.score - x.score).slice(0, 5);

    // Collect top player names
    const topPlayersNames = {
      pts: top5PTS.map(d => d.player_name),
      ast: top5AST.map(d => d.player_name),
      reb: top5REB.map(d => d.player_name),
      score: top5Score.map(d => d.player_name)
    };

    console.log("Top 5 Scorers:", topPlayersNames.pts);
    console.log("Top 5 Assisters:", topPlayersNames.ast);
    console.log("Top 5 Rebounders:", topPlayersNames.reb);
    console.log("Top 5 Composite Scores:", topPlayersNames.score);

    const width = 700;
    const height = 600;
    const margin = { top: 50, right: 150, bottom: 50, left: 70 };

    const svg = d3.select('#scatterplot-height')
      .attr('width', width)
      .attr('height', height);

    // Clear previous drawings
    svg.selectAll("*").remove();

    // X-axis: Points per Game (PTS)
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.pts) || 10])
      .range([margin.left, width - margin.right]);

    // Y-axis: Assists per Game (AST)
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.ast) || 10])
      .range([height - margin.bottom, margin.top]);

    // Bubble size: Rebounds per Game (REB)
    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(filteredData, d => d.reb) || 10])
      .range([0, 15]);

    // Color scale: Player height
    const heightExtent = d3.extent(filteredData, d => d.player_height);
    const colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain([heightExtent[0], heightExtent[1]]);

    // Tooltip reference
    const tooltip = d3.select(tooltipRef.current);

    // Draw scatter points (circles)
    const circles = svg.selectAll('circle')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.pts))
      .attr('cy', d => yScale(d.ast))
      .attr('r', d => sizeScale(d.reb))
      .attr('fill', d => colorScale(d.player_height))
      .attr('opacity', 0.7)
      .on('mouseover', function(event, d) {
        // Show tooltip
        tooltip.style('visibility', 'visible')
          .html(`
            <div><strong>${d.player_name}</strong></div>
            <div>Team: ${d.team_abbreviation}</div>
            <div>PTS: ${d.pts}</div>
            <div>AST: ${d.ast}</div>
            <div>REB: ${d.reb}</div>
          `);
        d3.select(this).attr('stroke', '#333').attr('stroke-width', 2);
      })
      .on('mousemove', function(event, d) {
        // Update tooltip position closer to the point
        const tooltipWidth = 150; // Approximate width
        const tooltipHeight = 80; // Approximate height
        let left = event.pageX + 10;
        let top = event.pageY + 10;

        // Prevent tooltip from going off the right edge
        if (left + tooltipWidth > window.innerWidth) {
          left = event.pageX - tooltipWidth - 10;
        }

        // Prevent tooltip from going off the bottom edge
        if (top + tooltipHeight > window.innerHeight) {
          top = event.pageY - tooltipHeight - 400;
        }

        tooltip.style('top', `${top}px`)
               .style('left', `${left}px`);
      })
      .on('mouseout', function(event, d) {
        // Hide tooltip
        tooltip.style('visibility', 'hidden');
        // Retain highlight for top players
        const isTop = topPlayersNames.pts.includes(d.player_name) ||
                      topPlayersNames.ast.includes(d.player_name) ||
                      topPlayersNames.reb.includes(d.player_name) ||
                      topPlayersNames.score.includes(d.player_name);
        d3.select(this).attr('stroke', isTop ? 'red' : 'none').attr('stroke-width', isTop ? 2 : 0);
      });

    // Highlight top 5 players with red stroke
    circles
      .attr('stroke', d => {
        if (topPlayersNames.pts.includes(d.player_name) ||
            topPlayersNames.ast.includes(d.player_name) ||
            topPlayersNames.reb.includes(d.player_name) ||
            topPlayersNames.score.includes(d.player_name)) {
          return 'red';
        }
        return 'none';
      })
      .attr('stroke-width', d => {
        if (topPlayersNames.pts.includes(d.player_name) ||
            topPlayersNames.ast.includes(d.player_name) ||
            topPlayersNames.reb.includes(d.player_name) ||
            topPlayersNames.score.includes(d.player_name)) {
          return 2;
        }
        return 0;
      });

    const allTopPlayers = new Set([
      ...topPlayersNames.pts,
      ...topPlayersNames.ast,
      ...topPlayersNames.reb,
      ...topPlayersNames.score
    ]);

    // Add labels for top players
    const highlightedPlayers = filteredData.filter(d => allTopPlayers.has(d.player_name));
    svg.selectAll('.player-label')
      .data(highlightedPlayers)
      .enter()
      .append('text')
      .attr('x', d => xScale(d.pts) + 5)
      .attr('y', d => yScale(d.ast) - 5)
      .attr('font-size', '12px')
      .attr('fill', 'red')
      .style('stroke', 'white')
      .style('stroke-width', 0.5)
      .style('paint-order', 'stroke')
      .text(d => d.player_name);

    // Add X-axis
    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    svg.append('text')
      .attr('x', (width / 2))
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('fill', 'black')
      .text('Points per Game');

    // Add Y-axis
    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale));

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('fill', 'black')
      .text('Assists per Game');

    // Add bubble size legend (Rebounds)
    const legendValues = [2, 5, 10];
    const legendX = width - margin.right + 30;
    const legendY = margin.top + 20;

    svg.selectAll('.legend-bubble')
      .data(legendValues)
      .enter()
      .append('circle')
      .attr('cx', legendX)
      .attr('cy', (d, i) => legendY + i * 40)
      .attr('r', d => sizeScale(d))
      .attr('fill', 'steelblue')
      .attr('opacity', 0.7);

    svg.selectAll('.legend-text')
      .data(legendValues)
      .enter()
      .append('text')
      .attr('x', legendX + 25)
      .attr('y', (d, i) => legendY + i * 40 + 5)
      .attr('font-size', '12px')
      .attr('fill', 'black')
      .text(d => `${d} Reb/G`);

    svg.append('text')
      .attr('x', legendX)
      .attr('y', legendY - 15)
      .attr('text-anchor', 'start')
      .attr('font-size', '14px')
      .attr('fill', 'black')
      .text('Bubble Size = Rebounds');

    // Add height color gradient legend (moved to bottom right)
    const gradientWidth = 20;
    const gradientHeight = 100;
    const gradientXPos = width - margin.right + 30;
    const gradientYPos = height - margin.bottom - gradientHeight - 20;

    // Define linear gradient
    const defsGradient = svg.append('defs');
    const linearGradient = defsGradient.append('linearGradient')
      .attr('id', 'height-gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '0%');

    linearGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colorScale(heightExtent[0]));

    linearGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colorScale(heightExtent[1]));

    // Draw gradient rectangle
    svg.append('rect')
      .attr('x', gradientXPos)
      .attr('y', gradientYPos)
      .attr('width', gradientWidth)
      .attr('height', gradientHeight)
      .style('fill', 'url(#height-gradient)');

    // Add gradient scale
    const heightScale = d3.scaleLinear()
      .domain(heightExtent)
      .range([gradientHeight + gradientYPos, gradientYPos]);

    const axisRight = d3.axisRight(heightScale)
      .ticks(5);

    svg.append('g')
      .attr('transform', `translate(${gradientXPos + gradientWidth},0)`)
      .call(axisRight);

    svg.append('text')
      .attr('x', gradientXPos)
      .attr('y', gradientYPos - 10)
      .attr('text-anchor', 'start')
      .attr('font-size', '14px')
      .attr('fill', 'black')
      .text('Height');

    // -------- Add Regression Dashed Line --------
    // Perform simple linear regression on pts and ast
    const ptsArray = filteredData.map(d => d.pts);
    const astArray = filteredData.map(d => d.ast);

    const meanX = d3.mean(ptsArray);
    const meanY = d3.mean(astArray);

    // Calculate slope (m) and y-intercept (b_reg)
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < ptsArray.length; i++) {
      numerator += (ptsArray[i] - meanX) * (astArray[i] - meanY);
      denominator += (ptsArray[i] - meanX) ** 2;
    }
    const m = denominator === 0 ? 0 : numerator / denominator;
    const b_reg = meanY - m * meanX;

    // Draw regression line within x range
    const xMin = d3.min(ptsArray);
    const xMax = d3.max(ptsArray);

    // Calculate corresponding y values
    const yMin = m * xMin + b_reg;
    const yMax = m * xMax + b_reg;

    // Coordinates for the regression line
    const linePoints = [
      [xScale(xMin), yScale(yMin)],
      [xScale(xMax), yScale(yMax)]
    ];

    svg.append('line')
      .attr('x1', linePoints[0][0])
      .attr('y1', linePoints[0][1])
      .attr('x2', linePoints[1][0])
      .attr('y2', linePoints[1][1])
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .style('stroke-dasharray', ('4,4')); // Dashed line style

    svg.append('text')
      .attr('x', (xScale(xMax) + xScale(xMin)) / 2)
      .attr('y', yScale(m * ((xMin + xMax) / 2) + b_reg) - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', 'black')
      .text('Regression Line');

  }, [seasonData, selectedSeason]);

  const uniqueSeasons = [...new Set(seasonData.map(d => d.season))];

  return (
    <div className="container my-5">
      <div className="row mb-4">
        <div className="col text-center">
          <h1>Evaluate Player Impact from Points, Rebounds, Assists</h1>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4 offset-md-4">
          <div className="form-group">
            <label htmlFor="seasonSelect" className="form-label">Select Season:</label>
            <select
              id="seasonSelect"
              className="form-select"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
            >
              {uniqueSeasons.map((season, index) => (
                <option key={index} value={season}>{season}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="position-relative">
        {/* Tooltip div */}
        <div 
          ref={tooltipRef} 
          className="position-absolute"
          style={{
            visibility: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            boxShadow: '0px 0px 10px rgba(0,0,0,0.1)'
          }}
        ></div>
        <div className="d-flex justify-content-center">
          <svg id="scatterplot-height"></svg>
        </div>
      </div>
    </div>
  );
}
