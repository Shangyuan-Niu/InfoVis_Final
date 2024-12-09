// import * as d3 from 'd3';
// import { useEffect, useState, useMemo } from 'react';
// import Papa from 'papaparse';
// import '../styles/assignment5_styles.module.css'; // 导入 styles 文件夹下的 test.css


// export default function Home() {
//     const [teamTotalScores, setTeamTotalScores] = useState([]);
//     const [seasonData, setSeasonData] = useState([]);
//     const [selectedSeason, setSelectedSeason] = useState('');
//     const [selectedPlayer, setSelectedPlayer] = useState(null); // 用于存储选中的球员
//     const [tablePosition, setTablePosition] = useState({ left: 0, top: 0 }); // 表格的位置
//     const [topScores, setTopScores] = useState({ points: [], rebounds: [], assists: [] }); // 保存Top5的得分、篮板和助攻数据
//     const [selectedPlayer1, setSelectedPlayer1] = useState(null);
//     const [selectedPlayer2, setSelectedPlayer2] = useState(null);
//     const [comparisonData, setComparisonData] = useState(null);
//   useEffect(() => {
//     // 使用 fetch 获取 CSV 文件
//     fetch('/all_seasons.csv') // 这里是你的 CSV 文件路径
//       .then(response => response.text()) // 获取文件内容
//       .then(csvData => {
//         // 使用 PapaParse 解析 CSV 数据
//         Papa.parse(csvData, {
//           header: true, // 自动解析第一行作为字段名
//           skipEmptyLines: true, // 跳过空行
//           complete: (result) => {
//             const data = result.data;

//             // 获取所有不同的赛季
//             const seasons = [...new Set(data.map(player => player.season))];
//             setSeasonData(data); // 保存所有的原始数据
//             setSelectedSeason(seasons[0]); // 默认选择第一个赛季

//             // 初次加载时也根据第一个赛季显示数据
//             handleSeasonChange(seasons[0], data);
//           }
//         });
//       })
//       .catch(error => {
//         console.error('Error fetching the CSV file:', error);
//       });
//   }, []);

//   // 处理赛季选择变化
//   const handleSeasonChange = (season, data) => {
//     setSelectedSeason(season);

//     // 筛选出对应赛季的数据
//     const filteredData = data.filter(player => player.season === season);

//     // 按球队分组并计算每个球员的总得分
//     const teamScores = {};
//     const playerScores = {};

//     filteredData.forEach(player => {
//         const team = player.team_abbreviation;
//         const points = parseFloat(player.pts); // 平均得分
//         const rebounds = parseFloat(player.reb); // 篮板
//         const assists = parseFloat(player.ast); // 助攻
//         const gamesPlayed = parseInt(player.gp); // 场次
  
//       // 计算每个球员的总得分
//       const totalPoints = Math.round(points * gamesPlayed); // 四舍五入得分

//       // 存储每个球员的详细信息
//       playerScores[player.player_name] = {
//         playerName: player.player_name,
//         totalPoints: totalPoints,
//         pointsPerGame: points,
//         gamesPlayed: gamesPlayed,
//         team: team,
//         age: player.age,
//         height: player.player_height,
//         weight: player.player_weight,
//         college: player.college,
//         country: player.country,
//         draftYear: player.draft_year,
//         draftRound: player.draft_round,
//         draftNumber: player.draft_number,
//         netRating: player.net_rating,
//         offensiveRebPct: player.oreb_pct,
//         defensiveRebPct: player.dreb_pct,
//         usagePct: player.usg_pct,
//         tsPct: player.ts_pct,
//         assistPct: player.ast_pct,
//         season: player.season
//       };

//       // 按队伍分组球员
//       if (!teamScores[team]) {
//         teamScores[team] = [];
//       }

//       // 确保该球员未在此队伍中出现（防止重复）
//       if (!teamScores[team].some(p => p.player === player.player_name)) {
//         teamScores[team].push({ player: player.player_name, totalPoints });
//       }
//     });

//     // 计算每个队伍的总得分，并按得分排序
//     const teamTotalScores = Object.keys(teamScores).map(team => {
//       const totalScore = teamScores[team].reduce((acc, player) => acc + player.totalPoints, 0);
//       return {
//         team,
//         totalScore,
//         players: teamScores[team]
//       };
//     });

//     // 按照队伍总得分进行排序
//     teamTotalScores.sort((a, b) => b.totalScore - a.totalScore);

//     // 对每个球队的球员按得分排序
//     teamTotalScores.forEach(team => {
//       // 按得分排序
//       team.players.sort((a, b) => b.totalPoints - a.totalPoints);

//       // 为每个球员分配颜色
//       const colorScale = d3.scaleOrdinal(d3.schemeCategory10); // 使用 D3 的颜色方案

//       // 给每个球员分配不同的颜色
//       team.players.forEach((player, index) => {
//         // 每个球员都分配不同的颜色，不论得分是否相同
//         player.color = colorScale(index); // 使用球员的索引作为颜色的映射依据
//       });
//     });

//     // 更新状态以触发可视化
//     setTeamTotalScores(teamTotalScores);
//     const topPoints = filteredData.sort((a, b) => b.pts - a.pts).slice(0, 5);
//     const topRebounds = filteredData.sort((a, b) => b.reb - a.reb).slice(0, 5);
//     const topAssists = filteredData.sort((a, b) => b.ast - a.ast).slice(0, 5);

//     setTopScores({
//       points: topPoints,
//       rebounds: topRebounds,
//       assists: topAssists
//     });

//     // 可视化部分
//     const width = 700 * 1.8;  // 宽度增加1.3倍
//     const height = 600 * 1.3; // 高度增加1.3倍
//     const margin = { top: 20 * 1.3, right: 100 * 1.3, bottom: 40 * 1.3, left: 100 * 1.3 }; // 边距增加1.3倍

//     const maxBarHeight = height - margin.top - margin.bottom;
//     const maxScore = d3.max(teamTotalScores, d => d.totalScore);
//     const barHeight = maxBarHeight / teamTotalScores.length;

//     const xScale = d3.scaleLinear()
//       .domain([0, maxScore * 1.1])
//       .range([0, width - margin.left - margin.right]);

//     const svg = d3.select('#chart')
//       .attr('width', width)
//       .attr('height', height);

//     // 清空旧的图表
//     svg.selectAll("*").remove();

//     // 绘制条形图
//     const bars = svg.selectAll('.bar')
//       .data(teamTotalScores)
//       .enter()
//       .append('g')
//       .attr('transform', (d, i) => `translate(${margin.left}, ${margin.top + i * barHeight})`); // 确保从 margin.top 开始

//     bars.append('rect')
//       .attr('width', d => xScale(d.totalScore))
//       .attr('height', barHeight - 2)
//       .attr('fill', '#69b3a2');

//     bars.append('text')
//       .attr('x', d => xScale(d.totalScore) + 5)
//       .attr('y', barHeight / 2)
//       .attr('dy', '.35em')
//       .text(d => `${d.team}: ${d.totalScore.toFixed(0)}`) // 四舍五入总得分
//       .attr('font-size', '12px')
//       .attr('fill', 'black');

//       bars.each(function(d) {
//         let cumulativeWidth = 0; // 累加的宽度
//         const playerBars = d3.select(this).selectAll('.player-bar')
//           .data(d.players)
//           .enter()
//           .append('rect')
//           .attr('class', 'player-bar')
//           .attr('x', (player) => {
//             const width = xScale(player.totalPoints);
//             const currentX = cumulativeWidth;
//             cumulativeWidth += width;
//             return currentX;
//           })
//           .attr('y', 0)
//           .attr('width', (player) => xScale(player.totalPoints))
//           .attr('height', barHeight - 2)
//           .attr('fill', (player) => player.color);
      
//         // 获取前五名球员并绘制名字
//         const topPlayers = d.players.slice(0, 5);  // 获取得分前五的球员
      
//         let cumulativeX = 0;  // 记录当前绘制位置
//         topPlayers.forEach((player, index) => {
//           const playerBarWidth = xScale(player.totalPoints); // 获取球员的条形图宽度
      
//           // 计算字体大小（动态调整）
//           const fontSize = Math.max(8, Math.min(playerBarWidth / player.player.length, 12)); // 字体大小不会小于8px，不会大于12px
//           const playerNameX = cumulativeX + 5;  // 名字从每个条形图的起始位置开始
//           const playerNameY = barHeight / 2;  // 垂直居中
      
//           // 检查当前条形图宽度是否足够容纳名字
//           if (fontSize * player.player.length <= playerBarWidth) {
//             // 如果名字的空间足够，才绘制名字
//             d3.select(this).append('text')
//               .attr('x', playerNameX)  // 计算名字的起始位置
//               .attr('y', playerNameY)  // 垂直居中
//               .attr('dy', '.35em')  // 微调文本位置，确保它垂直居中
//               .text(player.player)  // 显示球员名字
//               .attr('font-size', fontSize + 'px')  // 动态调整字体大小
//               .attr('fill', 'white')  // 使用白色字体
//               .style('pointer-events', 'none');  // 确保不会干扰鼠标事件
//           }
//           // 如果名字不能显示，跳过此球员
//           cumulativeX += playerBarWidth;  // 更新累积的宽度
//         });


//       // 点击事件处理
//       d3.select(this).selectAll('.player-bar').on('click', function(event, player) {
//         const playerInfo = playerScores[player.player];
//         setSelectedPlayer(playerInfo); // 更新选中的球员
//         // 更新表格的位置
//         const chartBounds = svg.node().getBoundingClientRect();
//         const tableLeft = chartBounds.right + 15;
//         const tableTop = chartBounds.top + 500;
//         setTablePosition({ left: tableLeft, top: tableTop });
//       });



//     });

//     // 添加X轴
//     svg.append('g')
//       .attr('transform', `translate(${margin.left}, ${height - margin.bottom})`)
//       .call(d3.axisBottom(xScale));

//     // 添加Y轴
//     svg.append('g')
//       .attr('transform', `translate(${margin.left}, ${margin.top})`)
//       .call(d3.axisLeft(d3.scaleBand().domain(teamTotalScores.map(d => d.team)).range([0, maxBarHeight])).tickSize(0));
//   };

//   const handlePlayer1Change = (e) => {
//     setSelectedPlayer1(e.target.value);
//   };

//   const handlePlayer2Change = (e) => {
//     setSelectedPlayer2(e.target.value);
//   };

//   useEffect(() => {
//     if (selectedPlayer1 && selectedPlayer2) {
//       const player1 = seasonData.find(player => player.player_name === selectedPlayer1 && player.season === selectedSeason);
//       const player2 = seasonData.find(player => player.player_name === selectedPlayer2 && player.season === selectedSeason);

//       if (player1 && player2) {
//         setComparisonData({
//           player1: {
//             name: player1.player_name,
//             points: player1.pts,
//             rebounds: player1.reb,
//             offensiveRebPct:player1.oreb_pct,
//             defensiveRebPct:player1.dreb_pct,
//             assists: player1.ast,
//             efficiency: player1.ts_pct,
//             netRating:player1.net_rating,
//             assistPct: player1.ast_pct
//           },
//           player2: {
//             name: player2.player_name,
//             points: player2.pts,
//             rebounds: player2.reb,
//             offensiveRebPct:player2.oreb_pct,
//             defensiveRebPct:player2.dreb_pct,
//             assists: player2.ast,
//             efficiency: player2.ts_pct,
//             netRating:player2.net_rating,
//             assistPct: player2.ast_pct
//           }
//         });
//       } else {
//         setComparisonData(null);
//       }
//     } else {
//       setComparisonData(null);
//     }
//   }, [selectedPlayer1, selectedPlayer2, selectedSeason, seasonData]);
//   const playerList = useMemo(() => {
//     // Step 1: Filter players for the current season
//     const currentSeasonPlayers = seasonData.filter(player => player.season === selectedSeason);
  
//     // Step 2: Sort players by points, assists, and rebounds
//     const sortedByPts = [...currentSeasonPlayers].sort((a, b) => b.pts - a.pts);
//     const sortedByAst = [...currentSeasonPlayers].sort((a, b) => b.ast - a.ast);
//     const sortedByReb = [...currentSeasonPlayers].sort((a, b) => b.reb - a.reb);
  
//     // Step 3: Take top 5 from each category
//     const top5Scorers = sortedByPts.slice(0, 5).map(player => player.player_name);
//     const top5AssistLeaders = sortedByAst.slice(0, 5).map(player => player.player_name);
//     const top5Rebounders = sortedByReb.slice(0, 5).map(player => player.player_name);
  
//     // Step 4: Combine into a Set to avoid duplicates
//     const combinedSet = new Set([...top5Scorers, ...top5AssistLeaders, ...top5Rebounders]);
  
//     // Step 5: Convert Set to array and sort alphabetically
//     const combinedList = Array.from(combinedSet).sort();
  
//     return combinedList;
//   }, [seasonData, selectedSeason]);
//     return (
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//         <div>
//           <h1>篮球队总得分展示</h1>
//           <select
//             value={selectedSeason}
//             onChange={(e) => handleSeasonChange(e.target.value, seasonData)}
//             style={{
//               position: 'absolute',
//               top: '10%',
//               left: '8%',
//               transform: 'translateX(-50%)',
//               zIndex: 10,
//             }}
//           >
//             {Array.from(new Set(seasonData.map(player => player.season))).map((season, index) => (
//               <option key={index} value={season}>{season}</option>
//             ))}
//           </select>
  
//           <svg id="chart"></svg>
//         </div>
  
//         <div>
//           {selectedPlayer && (
//             <div style={{ position: 'absolute', left: tablePosition.left, top: tablePosition.top }}>
//               <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '400px' }}>
//                 <thead>
//                   <tr>
//                     <th style={{ padding: '10px', border: '1px solid #ddd', background: '#f4f4f4', textAlign: 'left', fontWeight: 'bold', fontSize: '16px', textTransform: 'uppercase' }}>详细信息</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td>球员名字</td>
//                     <td>{selectedPlayer.playerName}</td>
//                   </tr>
//                   <tr>
//                   <td>球队</td>
//                   <td>{selectedPlayer.team}</td>
//                 </tr>
//                 <tr>
//                   <td>总得分</td>
//                   <td>{selectedPlayer.totalPoints}</td>
//                 </tr>
//                 <tr>
//                   <td>场次</td>
//                   <td>{selectedPlayer.gamesPlayed}</td>
//                 </tr>
//                 <tr>
//                   <td>每场得分</td>
//                   <td>{selectedPlayer.pointsPerGame}</td>
//                 </tr>
//                 <tr>
//                   <td>身高</td>
//                   <td>{selectedPlayer.height}</td>
//                 </tr>
//                 <tr>
//                   <td>体重</td>
//                   <td>{selectedPlayer.weight}</td>
//                 </tr>
//                 <tr>
//                   <td>年龄</td>
//                   <td>{selectedPlayer.age}</td>
//                 </tr>
//                 <tr>
//                   <td>大学</td>
//                   <td>{selectedPlayer.college}</td>
//                 </tr>
//                 <tr>
//                   <td>国家</td>
//                   <td>{selectedPlayer.country}</td>
//                 </tr>
//                 <tr>
//                   <td>选秀年份</td>
//                   <td>{selectedPlayer.draftYear}</td>
//                 </tr>
//               </tbody>
//             </table>
//             </div>
//           )}
  
//           <div style={{ marginTop: '50px', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
//             <div style={{ width: '30%' }}>
//               <h3>得分 Top 5</h3>
//               <ul>
//                 {topScores.points.map((player, index) => (
//                   <li 
//                     key={index} 
//                     className="ranking-item"
//                     onClick={() => handlePlayerClick(player)}
//                   >
//                     {player.player_name} ({player.team_abbreviation}): {player.pts}
//                   </li>
//                 ))}
//               </ul>
//             </div>
  
//             <div style={{ width: '30%' }}>
//               <h3>篮板 Top 5</h3>
//               <ul>
//                 {topScores.rebounds.map((player, index) => (
//                   <li 
//                     key={index} 
//                     className="ranking-item"
//                     onClick={() => handlePlayerClick(player)}
//                   >
//                     {player.player_name} ({player.team_abbreviation}): {player.reb}
//                   </li>
//                 ))}
//               </ul>
//             </div>
  
//             <div style={{ width: '30%' }}>
//               <h3>助攻 Top 5</h3>
//               <ul>
//                 {topScores.assists.map((player, index) => (
//                   <li 
//                     key={index} 
//                     className="ranking-item"
//                     onClick={() => handlePlayerClick(player)}
//                   >
//                     {player.player_name} ({player.team_abbreviation}): {player.ast}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
  
//           <div style={{ width: '70%', padding: '10px', marginTop: '-45px' }}> {/* 调整marginTop的值来控制移动的距离 */}
//           <h3 style={{ marginTop: '20px', marginBottom: '5px' }}>球员对比</h3>  {/* 减少h3标签的外边距 */}
//   <select
//     value={selectedPlayer1}
//     onChange={handlePlayer1Change}
//     style={{ marginRight: '10px' }}
//   >
//     <option value="">选择球员1</option>
//     {playerList.map((player, index) => (
//       <option key={index} value={player}>{player}</option>
//     ))}
//   </select>
  
//   <select
//     value={selectedPlayer2}
//     onChange={handlePlayer2Change}
//   >
//     <option value="">选择球员2</option>
//     {playerList.map((player, index) => (
//       <option key={index} value={player}>{player}</option>
//     ))}
//   </select>

//   {comparisonData && (
//   <div style={{ marginTop: '0px' }}>
//     <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '10000px' }}>
//       <thead>
//         <tr>
//           <th>统计</th>
//           <th>{comparisonData.player1.name}</th>
//           <th>{comparisonData.player2.name}</th>
//         </tr>
//       </thead>
//       <tbody>
//         <tr>
//           <td>得分</td>
//           <td style={{ textAlign: 'right' }}>{comparisonData.player1.points}</td>
//           <td style={{ textAlign: 'right' }}>{comparisonData.player2.points}</td>
//         </tr>
//         <tr>
//           <td>篮板</td>
//           <td style={{ textAlign: 'right' }}>{comparisonData.player1.rebounds}</td>
//           <td style={{ textAlign: 'right' }}>{comparisonData.player2.rebounds}</td>
//         </tr>
//         {/* <tr>
//           <td>offensiveRebPct</td>
//           <td style={{ textAlign: 'right' }}>{comparisonData.player1.offensiveRebPct}</td>
//           <td style={{ textAlign: 'right' }}>{comparisonData.player2.offensiveRebPct}</td>
//         </tr>
//         <tr>
//           <td>defensiveRebPct</td>
//           <td style={{ textAlign: 'right' }}>{comparisonData.player1.defensiveRebPct}</td>
//           <td style={{ textAlign: 'right' }}>{comparisonData.player2.defensiveRebPct}</td>
//         </tr> */}
//         <tr>
//           <td>助攻</td>
//           <td style={{ textAlign: 'right' }}>{comparisonData.player1.assists}</td>
//           <td style={{ textAlign: 'right' }}>{comparisonData.player2.assists}</td>
//         </tr>
//         <tr>
//           <td>助攻比</td>
//           <td style={{ textAlign: 'right' }}>{comparisonData.player1.assistPct != null ? (Math.round(comparisonData.player1.assistPct * 1000) / 1000) : ''}</td>
//           <td style={{ textAlign: 'right' }}>{comparisonData.player2.assistPct != null ? (Math.round(comparisonData.player2.assistPct * 1000) / 1000) : ''}</td>
//         </tr>
//         <tr>
//           <td>效率值 (TS%)</td>
//           <td style={{ textAlign: 'right' }}>{comparisonData.player1.efficiency!= null ? (Math.round(comparisonData.player1.efficiency * 1000) / 1000) : ''}</td>
//           <td style={{ textAlign: 'right' }}>{comparisonData.player2.efficiency!= null ? (Math.round(comparisonData.player2.efficiency * 1000) / 1000) : ''}</td>
//         </tr>
//         <tr>
//           <td>net_rating</td>
//           <td style={{ textAlign: 'right' }}>{comparisonData.player1.netRating}</td>
//           <td style={{ textAlign: 'right' }}>{comparisonData.player2.netRating}</td>
//         </tr>
//       </tbody>
//     </table>
//   </div>
// )}
//         </div>
//       </div>
//     </div>
//   );
// }

import * as d3 from 'd3';
import { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import '../styles/assignment5_styles.module.css'; // Your custom styles

export default function Home() {
    const [teamTotalScores, setTeamTotalScores] = useState([]);
    const [seasonData, setSeasonData] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState(null); // Store selected player
    const [topScores, setTopScores] = useState({ points: [], rebounds: [], assists: [] }); // Top 5 scores, rebounds, assists
    const [selectedPlayer1, setSelectedPlayer1] = useState(null);
    const [selectedPlayer2, setSelectedPlayer2] = useState(null);
    const [comparisonData, setComparisonData] = useState(null);

    useEffect(() => {
        // Fetch CSV file
        fetch('/all_seasons.csv') // Path to your CSV file
            .then(response => response.text()) // Get file content
            .then(csvData => {
                // Parse CSV data with PapaParse
                Papa.parse(csvData, {
                    header: true, // Use first row as headers
                    skipEmptyLines: true, // Skip empty lines
                    complete: (result) => {
                        const data = result.data;

                        // Get all unique seasons
                        const seasons = [...new Set(data.map(player => player.season))];
                        setSeasonData(data); // Save all raw data
                        setSelectedSeason(seasons[0]); // Default to first season

                        // Load data for the first season
                        handleSeasonChange(seasons[0], data);
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching the CSV file:', error);
            });
    }, []);

    // Handle season selection change
    const handleSeasonChange = (season, data) => {
        setSelectedSeason(season);

        // Filter data for selected season
        const filteredData = data.filter(player => player.season === season);

        // Group by team and calculate total scores
        const teamScores = {};
        const playerScores = {};

        filteredData.forEach(player => {
            const team = player.team_abbreviation;
            const points = parseFloat(player.pts); // Points per game
            const rebounds = parseFloat(player.reb); // Rebounds
            const assists = parseFloat(player.ast); // Assists
            const gamesPlayed = parseInt(player.gp); // Games played

            // Calculate total points
            const totalPoints = Math.round(points * gamesPlayed); // Rounded total points

            // Store player details
            playerScores[player.player_name] = {
                playerName: player.player_name,
                totalPoints: totalPoints,
                pointsPerGame: points,
                gamesPlayed: gamesPlayed,
                team: team,
                age: player.age,
                height: player.player_height,
                weight: player.player_weight,
                college: player.college,
                country: player.country,
                draftYear: player.draft_year,
                draftRound: player.draft_round,
                draftNumber: player.draft_number,
                netRating: player.net_rating,
                offensiveRebPct: player.oreb_pct,
                defensiveRebPct: player.dreb_pct,
                usagePct: player.usg_pct,
                tsPct: player.ts_pct,
                assistPct: player.ast_pct,
                season: player.season
            };

            // Group players by team
            if (!teamScores[team]) {
                teamScores[team] = [];
            }

            // Ensure player is not duplicated in team
            if (!teamScores[team].some(p => p.player === player.player_name)) {
                teamScores[team].push({ player: player.player_name, totalPoints });
            }
        });

        // Calculate total scores for each team
        const teamTotalScoresData = Object.keys(teamScores).map(team => {
            const totalScore = teamScores[team].reduce((acc, player) => acc + player.totalPoints, 0);
            return {
                team,
                totalScore,
                players: teamScores[team]
            };
        });

        // Sort teams by total score descending
        teamTotalScoresData.sort((a, b) => b.totalScore - a.totalScore);

        // Sort players within each team by total points descending and assign colors
        teamTotalScoresData.forEach(team => {
            // Sort players by total points descending
            team.players.sort((a, b) => b.totalPoints - a.totalPoints);

            // Assign colors using D3's category10 scale
            const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

            team.players.forEach((player, index) => {
                player.color = colorScale(index); // Assign color based on index
            });
        });

        // Update state to trigger visualization
        setTeamTotalScores(teamTotalScoresData);
        const topPoints = filteredData.sort((a, b) => b.pts - a.pts).slice(0, 5);
        const topRebounds = filteredData.sort((a, b) => b.reb - a.reb).slice(0, 5);
        const topAssists = filteredData.sort((a, b) => b.ast - a.ast).slice(0, 5);

        setTopScores({
            points: topPoints,
            rebounds: topRebounds,
            assists: topAssists
        });

        // Visualization part
        // Remove previous chart
        d3.select('#chart').selectAll("*").remove();

        const width = 1260;  // Set desired width
        const height = 780; // Set desired height
        const margin = { top: 26, right: 130, bottom: 52, left: 130 }; // Margins

        const maxBarHeight = height - margin.top - margin.bottom;
        const maxScore = d3.max(teamTotalScoresData, d => d.totalScore);
        const barHeight = maxBarHeight / teamTotalScoresData.length;

        const xScale = d3.scaleLinear()
            .domain([0, maxScore * 1.1])
            .range([0, width - margin.left - margin.right]);

        const svg = d3.select('#chart')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        // Create group for bars
        const bars = svg.selectAll('.bar')
            .data(teamTotalScoresData)
            .enter()
            .append('g')
            .attr('transform', (d, i) => `translate(${margin.left}, ${margin.top + i * barHeight})`);

        // Append main bar
        bars.append('rect')
            .attr('width', d => xScale(d.totalScore))
            .attr('height', barHeight - 2)
            .attr('fill', '#69b3a2');

        // Append team label
        bars.append('text')
            .attr('x', d => xScale(d.totalScore) + 5)
            .attr('y', barHeight / 2)
            .attr('dy', '.35em')
            .text(d => `${d.team}: ${d.totalScore}`)
            .attr('font-size', '12px')
            .attr('fill', 'black');

        // Append player bars
        bars.each(function(d) {
            let cumulativeWidth = 0; // Cumulative width for stacking

            d3.select(this).selectAll('.player-bar')
                .data(d.players)
                .enter()
                .append('rect')
                .attr('class', 'player-bar')
                .attr('x', player => {
                    const currentX = cumulativeWidth;
                    cumulativeWidth += xScale(player.totalPoints);
                    return currentX;
                })
                .attr('y', 0)
                .attr('width', player => xScale(player.totalPoints))
                .attr('height', barHeight - 2)
                .attr('fill', player => player.color)
                .on('click', function(event, player) {
                    event.stopPropagation(); // Prevent container click
                    const playerInfo = playerScores[player.player];
                    setSelectedPlayer(playerInfo); // Set selected player
                });

            // Append player names for top 5 players
            const topPlayers = d.players.slice(0, 5);

            let cumulativeX = 0;
            topPlayers.forEach(player => {
                const playerBarWidth = xScale(player.totalPoints);

                // Calculate font size dynamically
                const fontSize = Math.max(8, Math.min(playerBarWidth / player.player.length, 12));
                const playerNameX = cumulativeX + 5;
                const playerNameY = barHeight / 2;

                // Check if there's enough space to display the name
                if (fontSize * player.player.length <= playerBarWidth) {
                    d3.select(this).append('text')
                        .attr('x', playerNameX)
                        .attr('y', playerNameY)
                        .attr('dy', '.35em')
                        .text(player.player)
                        .attr('font-size', `${fontSize}px`)
                        .attr('fill', 'white')
                        .style('pointer-events', 'none'); // Ensure text doesn't interfere with mouse events
                }

                cumulativeX += playerBarWidth;
            });
        });

        // Add X-axis
        svg.append('g')
            .attr('transform', `translate(${margin.left}, ${height - margin.bottom})`)
            .call(d3.axisBottom(xScale));

        // Add Y-axis
        svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)
            .call(d3.axisLeft(d3.scaleBand().domain(teamTotalScoresData.map(d => d.team)).range([0, maxBarHeight])).tickSize(0));
    };

    const handlePlayer1Change = (e) => {
        setSelectedPlayer1(e.target.value);
    };

    const handlePlayer2Change = (e) => {
        setSelectedPlayer2(e.target.value);
    };

    useEffect(() => {
        if (selectedPlayer1 && selectedPlayer2) {
            const player1 = seasonData.find(player => player.player_name === selectedPlayer1 && player.season === selectedSeason);
            const player2 = seasonData.find(player => player.player_name === selectedPlayer2 && player.season === selectedSeason);

            if (player1 && player2) {
                setComparisonData({
                    player1: {
                        name: player1.player_name,
                        points: player1.pts,
                        rebounds: player1.reb,
                        offensiveRebPct: player1.oreb_pct,
                        defensiveRebPct: player1.dreb_pct,
                        assists: player1.ast,
                        efficiency: player1.ts_pct,
                        netRating: player1.net_rating,
                        assistPct: player1.ast_pct
                    },
                    player2: {
                        name: player2.player_name,
                        points: player2.pts,
                        rebounds: player2.reb,
                        offensiveRebPct: player2.oreb_pct,
                        defensiveRebPct: player2.dreb_pct,
                        assists: player2.ast,
                        efficiency: player2.ts_pct,
                        netRating: player2.net_rating,
                        assistPct: player2.ast_pct
                    }
                });
            } else {
                setComparisonData(null);
            }
        } else {
            setComparisonData(null);
        }
    }, [selectedPlayer1, selectedPlayer2, selectedSeason, seasonData]);

    const playerList = useMemo(() => {
        // Step 1: Filter players for the current season
        const currentSeasonPlayers = seasonData.filter(player => player.season === selectedSeason);

        // Step 2: Sort players by points, assists, and rebounds
        const sortedByPts = [...currentSeasonPlayers].sort((a, b) => b.pts - a.pts);
        const sortedByAst = [...currentSeasonPlayers].sort((a, b) => b.ast - a.ast);
        const sortedByReb = [...currentSeasonPlayers].sort((a, b) => b.reb - a.reb);

        // Step 3: Take top 5 from each category
        const top5Scorers = sortedByPts.slice(0, 5).map(player => player.player_name);
        const top5AssistLeaders = sortedByAst.slice(0, 5).map(player => player.player_name);
        const top5Rebounders = sortedByReb.slice(0, 5).map(player => player.player_name);

        // Step 4: Combine into a Set to avoid duplicates
        const combinedSet = new Set([...top5Scorers, ...top5AssistLeaders, ...top5Rebounders]);

        // Step 5: Convert Set to array and sort alphabetically
        const combinedList = Array.from(combinedSet).sort();

        return combinedList;
    }, [seasonData, selectedSeason]);

    // Handle player click
    const handlePlayerClick = (player) => {
        const playerInfo = seasonData.find(p => p.player_name === player.player_name && p.season === selectedSeason);
        if (playerInfo) {
            setSelectedPlayer(playerInfo);
        }
    };

    // Handle clicking outside to hide detailed info
    const handleOverlayClick = () => {
        setSelectedPlayer(null);
    };

    return (
        <div className="container mt-4" style={{ position: 'relative' }}>
            <div className="row">
                {/* Left section: Title, Season selection, and Chart */}
                <div className="col-md-12">
                    <h1 className="mb-4">Basketball Team Total Scores</h1>
                    <div className="mb-3">
                        <label htmlFor="seasonSelect" className="form-label">Select Season</label>
                        <select
                            id="seasonSelect"
                            value={selectedSeason}
                            onChange={(e) => handleSeasonChange(e.target.value, seasonData)}
                            className="form-select"
                        >
                            {Array.from(new Set(seasonData.map(player => player.season))).map((season, index) => (
                                <option key={index} value={season}>{season}</option>
                            ))}
                        </select>
                    </div>
                    {/* Responsive SVG using viewBox and preserveAspectRatio */}
                    <div style={{ width: '100%', height: 'auto' }}>
                        <svg id="chart" style={{ width: '100%', height: '100%' }} viewBox="0 0 1260 780" preserveAspectRatio="xMidYMid meet"></svg>
                    </div>
                </div>
            </div>

            {/* Top 5 Rankings */}
            <div className="row mt-5">
                <div className="col-md-4">
                    <h3>Top 5 Scorers</h3>
                    <ul className="list-group">
                        {topScores.points.map((player, index) => (
                            <li 
                                key={index} 
                                className="list-group-item d-flex justify-content-between align-items-center ranking-item"
                                onClick={() => handlePlayerClick(player)}
                                style={{ cursor: 'pointer' }}
                            >
                                {player.player_name} ({player.team_abbreviation})
                                <span className="badge bg-primary rounded-pill">{player.pts}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="col-md-4">
                    <h3>Top 5 Rebounders</h3>
                    <ul className="list-group">
                        {topScores.rebounds.map((player, index) => (
                            <li 
                                key={index} 
                                className="list-group-item d-flex justify-content-between align-items-center ranking-item"
                                onClick={() => handlePlayerClick(player)}
                                style={{ cursor: 'pointer' }}
                            >
                                {player.player_name} ({player.team_abbreviation})
                                <span className="badge bg-success rounded-pill">{player.reb}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="col-md-4">
                    <h3>Top 5 Assists</h3>
                    <ul className="list-group">
                        {topScores.assists.map((player, index) => (
                            <li 
                                key={index} 
                                className="list-group-item d-flex justify-content-between align-items-center ranking-item"
                                onClick={() => handlePlayerClick(player)}
                                style={{ cursor: 'pointer' }}
                            >
                                {player.player_name} ({player.team_abbreviation})
                                <span className="badge bg-warning text-dark rounded-pill">{player.ast}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Player Comparison */}
            <div className="row mt-5">
                <div className="col-md-12">
                    <h3>Player Comparison</h3>
                    <div className="d-flex mb-3">
                        <select
                            value={selectedPlayer1}
                            onChange={handlePlayer1Change}
                            className="form-select me-2"
                        >
                            <option value="">Select Player 1</option>
                            {playerList.map((player, index) => (
                                <option key={index} value={player}>{player}</option>
                            ))}
                        </select>
                        
                        <select
                            value={selectedPlayer2}
                            onChange={handlePlayer2Change}
                            className="form-select"
                        >
                            <option value="">Select Player 2</option>
                            {playerList.map((player, index) => (
                                <option key={index} value={player}>{player}</option>
                            ))}
                        </select>
                    </div>

                    {comparisonData && (
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Statistic</th>
                                        <th>{comparisonData.player1.name}</th>
                                        <th>{comparisonData.player2.name}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Points</td>
                                        <td className="text-end">{comparisonData.player1.points}</td>
                                        <td className="text-end">{comparisonData.player2.points}</td>
                                    </tr>
                                    <tr>
                                        <td>Rebounds</td>
                                        <td className="text-end">{comparisonData.player1.rebounds}</td>
                                        <td className="text-end">{comparisonData.player2.rebounds}</td>
                                    </tr>
                                    <tr>
                                        <td>Assists</td>
                                        <td className="text-end">{comparisonData.player1.assists}</td>
                                        <td className="text-end">{comparisonData.player2.assists}</td>
                                    </tr>
                                    <tr>
                                        <td>Assist Percentage</td>
                                        <td className="text-end">{comparisonData.player1.assistPct != null ? (Math.round(comparisonData.player1.assistPct * 1000) / 1000) : ''}</td>
                                        <td className="text-end">{comparisonData.player2.assistPct != null ? (Math.round(comparisonData.player2.assistPct * 1000) / 1000) : ''}</td>
                                    </tr>
                                    <tr>
                                        <td>Efficiency (TS%)</td>
                                        <td className="text-end">{comparisonData.player1.efficiency != null ? (Math.round(comparisonData.player1.efficiency * 1000) / 1000) : ''}</td>
                                        <td className="text-end">{comparisonData.player2.efficiency != null ? (Math.round(comparisonData.player2.efficiency * 1000) / 1000) : ''}</td>
                                    </tr>
                                    <tr>
                                        <td>Net Rating</td>
                                        <td className="text-end">{comparisonData.player1.netRating}</td>
                                        <td className="text-end">{comparisonData.player2.netRating}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay for detailed information */}
            {selectedPlayer && (
                <div 
                    className="overlay" 
                    onClick={handleOverlayClick}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}
                >
                    <div 
                        className="card" 
                        style={{ width: '300px' }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the card
                    >
                        <div className="card-header bg-primary text-white">
                            Player Details
                        </div>
                        <div className="card-body">
                            <table className="table table-bordered table-sm">
                                <tbody>
                                    <tr>
                                        <th>Name</th>
                                        <td>{selectedPlayer.playerName}</td>
                                    </tr>
                                    <tr>
                                        <th>Team</th>
                                        <td>{selectedPlayer.team}</td>
                                    </tr>
                                    <tr>
                                        <th>Total Points</th>
                                        <td>{selectedPlayer.totalPoints}</td>
                                    </tr>
                                    <tr>
                                        <th>Games Played</th>
                                        <td>{selectedPlayer.gamesPlayed}</td>
                                    </tr>
                                    <tr>
                                        <th>Points Per Game</th>
                                        <td>{selectedPlayer.pointsPerGame}</td>
                                    </tr>
                                    <tr>
                                        <th>Height</th>
                                        <td>{selectedPlayer.height}</td>
                                    </tr>
                                    <tr>
                                        <th>Weight</th>
                                        <td>{selectedPlayer.weight}</td>
                                    </tr>
                                    <tr>
                                        <th>Age</th>
                                        <td>{selectedPlayer.age}</td>
                                    </tr>
                                    <tr>
                                        <th>College</th>
                                        <td>{selectedPlayer.college}</td>
                                    </tr>
                                    <tr>
                                        <th>Country</th>
                                        <td>{selectedPlayer.country}</td>
                                    </tr>
                                    <tr>
                                        <th>Draft Year</th>
                                        <td>{selectedPlayer.draftYear}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

