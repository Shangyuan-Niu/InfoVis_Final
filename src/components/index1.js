import * as d3 from 'd3';
import { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';

export default function ScatterPlotWithHeightColor() {
  const [seasonData, setSeasonData] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const tooltipRef = useRef(null); // 用于引用tooltip的div元素

  useEffect(() => {
    // 使用 fetch 获取 CSV 文件
    fetch('/all_seasons.csv') 
      .then(response => response.text())
      .then(csvData => {
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const data = result.data.map(d => {
              return {
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
              };
            });

            setSeasonData(data);
            // 默认选中第一个赛季
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
    // 筛选出所选赛季的数据
    const filteredData = seasonData.filter(d => d.season === selectedSeason);

    // 1. 找出各项指标（PTS、AST、REB）排名前5的球员
    const top5PTS = filteredData.slice().sort((a,b)=>b.pts - a.pts).slice(0,5);
    const top5AST = filteredData.slice().sort((a,b)=>b.ast - a.ast).slice(0,5);
    const top5REB = filteredData.slice().sort((a,b)=>b.reb - a.reb).slice(0,5);

    // 2. 基于复合评分 (Score = a*PTS + b*AST + c*REB)
    const a=1,n=1,c=1;
    const withScore = filteredData.map(d=>{
      return {
        ...d,
        score: a*d.pts + n*d.ast + c*d.reb
      };
    });
    const top5Score = withScore.slice().sort((x,y)=>y.score - x.score).slice(0,5);

    // 收集top球员名字
    const topPlayersNames = {
      pts: top5PTS.map(d=>d.player_name),
      ast: top5AST.map(d=>d.player_name),
      reb: top5REB.map(d=>d.player_name),
      score: top5Score.map(d=>d.player_name)
    };

    console.log("得分前5名球员：", topPlayersNames.pts);
    console.log("助攻前5名球员：", topPlayersNames.ast);
    console.log("篮板前5名球员：", topPlayersNames.reb);
    console.log("综合评分前5名球员：", topPlayersNames.score);

    const width = 700;
    const height = 600;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };

    const svg = d3.select('#scatterplot-height')
      .attr('width', width)
      .attr('height', height);

    // 清空之前的绘图元素
    svg.selectAll("*").remove();

    // X轴：场均得分 pts
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.pts) || 10])
      .range([margin.left, width - margin.right]);

    // Y轴：场均助攻 ast
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.ast) || 10])
      .range([height - margin.bottom, margin.top]);

    // 氣泡大小：场均篮板 reb
    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(filteredData, d => d.reb) || 10])
      .range([0, 15]);

    // 颜色比例：根据身高映射颜色
    const heightExtent = d3.extent(filteredData, d => d.player_height);
    const colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain([heightExtent[0], heightExtent[1]]);

    // 创建Tooltip的引用
    const tooltip = d3.select(tooltipRef.current);

    // 绘制散点 (circle)
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
        // 显示tooltip
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
        // 更新tooltip位置
        tooltip.style('top', (event.pageY + 10) + 'px')
               .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function(event, d) {
        // 隐藏tooltip
        tooltip.style('visibility', 'hidden');
        // 如果这个点是特殊的top5标记，还是保留原本高亮，否则恢复为无描边
        const isTop = topPlayersNames.pts.includes(d.player_name) ||
                      topPlayersNames.ast.includes(d.player_name) ||
                      topPlayersNames.reb.includes(d.player_name) ||
                      topPlayersNames.score.includes(d.player_name);
        d3.select(this).attr('stroke', isTop ? 'red' : 'none').attr('stroke-width', isTop ? 2 : 0);
      });

    // 对 top5 的球员进行描边高亮（初始样式）
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

    // 为所有top球员添加名称标注
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

    // 添加 X 轴
    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    svg.append('text')
      .attr('x', (width / 2))
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .text('Points per Game');

    // 添加 Y 轴
    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale));

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .text('Assists per Game');

    // 添加气泡大小说明（篮板）
    const legendValues = [2, 5, 10]; 
    const legendX = width - margin.right - 50;
    const legendY = margin.top + 20;

    svg.selectAll('.legend-bubble')
      .data(legendValues)
      .enter()
      .append('circle')
      .attr('cx', legendX)
      .attr('cy', (d, i) => legendY + i * 35)
      .attr('r', d => sizeScale(d))
      .attr('fill', 'steelblue')
      .attr('opacity', 0.7);

    svg.selectAll('.legend-text')
      .data(legendValues)
      .enter()
      .append('text')
      .attr('x', legendX + 20)
      .attr('y', (d, i) => legendY + i * 35 + 5)
      .text(d => `${d} Reb/G`);

    svg.append('text')
      .attr('x', legendX)
      .attr('y', legendY - 15)
      .attr('text-anchor', 'start')
      .text('Bubble Size = Rebounds');

    // 添加身高颜色渐变图例（线性渐变条形）
    const gradientWidth = 20;
    const gradientHeight = 100;
    const gradientXPos = margin.left;
    const gradientYPos = margin.top;

    // 定义线性渐变
    const defs = svg.append('defs');
    const linearGradient = defs.append('linearGradient')
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

    // 绘制渐变矩形
    svg.append('rect')
      .attr('x', gradientXPos)
      .attr('y', gradientYPos)
      .attr('width', gradientWidth)
      .attr('height', gradientHeight)
      .style('fill', 'url(#height-gradient)');

    // 渐变条的刻度
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
      .text('Height')
      .attr('text-anchor', 'start');


    // -------- 添加回归虚线 --------
    // 对 filteredData 中的 pts, ast 进行简单线性回归
    const ptsArray = filteredData.map(d => d.pts);
    const astArray = filteredData.map(d => d.ast);

    const meanX = d3.mean(ptsArray);
    const meanY = d3.mean(astArray);

    // 计算斜率 m 和截距 b
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < ptsArray.length; i++) {
      numerator += (ptsArray[i] - meanX) * (astArray[i] - meanY);
      denominator += (ptsArray[i] - meanX) ** 2;
    }
    const m = denominator === 0 ? 0 : numerator / denominator;
    const b = meanY - m * meanX;

    // 在 x 范围内绘制直线
    const xMin = d3.min(ptsArray);
    const xMax = d3.max(ptsArray);

    // 计算对应的y值
    const yMin = m * xMin + b;
    const yMax = m * xMax + b;

    // 创建一个用来画线的坐标对
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
      .style('stroke-dasharray', ('4,4')) // 虚线样式

    svg.append('text')
      .attr('x', (xScale(xMax) + xScale(xMin))/2)
      .attr('y', yScale(m*((xMin+xMax)/2)+b)-10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text('Regression Line');

  }, [seasonData, selectedSeason]);

  const uniqueSeasons = [...new Set(seasonData.map(d => d.season))];

  return (
    <div style={{position:'relative'}}>
      <h1>散点图（选择赛季，颜色映射球员身高 + 回归虚线）</h1>
      <div>
        <label>选择赛季：</label>
        <select value={selectedSeason} onChange={(e) => setSelectedSeason(e.target.value)}>
          {uniqueSeasons.map((season, index) => (
            <option key={index} value={season}>{season}</option>
          ))}
        </select>
      </div>
      {/* tooltip div */}
      <div 
        ref={tooltipRef} 
        style={{
          position: 'absolute',
          visibility: 'hidden',
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: '5px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '12px',
          pointerEvents: 'none'
        }}
      ></div>
      <svg id="scatterplot-height"></svg>
    </div>
  );
}
