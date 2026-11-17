# AI 芯片/算力出口合规与供应链风险预警平台 (Chip Export Compliance)

基于 X 热搜 Top 10 推文深度分析（英伟达高层风波、 chips 出口新规、DeepSeek 算力短缺、沃什 AI 预警）开发的 MVP。

## 功能
- 📜 **政策库**：8 条主要芯片/算力出口管制政策（BIS、欧盟、中国、日本、荷兰）
- 🔍 **芯片评估**：8 款主流 AI 芯片出口合规评估（风险评分、合规建议）
- 🏭 **供应链风险**：13 个供应链节点风险评估与建议
- 🔥 **热门政策**：按日期排序的政策榜
- 📝 **报告生成**：一键生成芯片出口合规评估报告
- 📌 **追踪记录**：本地/服务器记录评估快照

## 技术栈
- Node.js + Express
- 前端：纯 HTML/CSS/JS（无框架）
- 数据：本地 JSON 文件（Node 模式）/ localStorage（静态 Pages 模式）

## 运行
```bash
npm install
npm start
# 访问 http://localhost:3000
```

## 部署
推送到 GitHub 仓库 `wcl13311733120-create/devbot-chip-export-compliance`，启用 GitHub Pages。
