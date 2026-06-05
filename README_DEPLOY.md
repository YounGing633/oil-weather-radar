# 油脂产区天气雷达 — 静态部署说明

> 版本: v1.0-f4 | 生成日期: 2026-06-04

## 网站概述

油脂产区天气雷达是一个纯静态网站，用于展示全球主要油脂作物产区的气象监测数据。网站基于 Leaflet.js 地图，支持国家/省州级 GeoJSON 边界下钻、作物切换、异常告警展示等功能。

**技术栈**: HTML + JavaScript + Leaflet.js + Chart.js，纯前端渲染，无需后端服务。

## 部署目标平台

本静态包可部署到以下任一平台:

- **GitHub Pages** — 推荐使用提供的 GitHub Actions 工作流模板
- **Netlify** — 直接拖拽 `weather_site_static/` 文件夹上传
- **Vercel** — 导入目录后自动部署
- **任意静态文件服务器** — Nginx / Apache / Caddy 等

## 目录结构

```
weather_site_static/
  index.html          首页入口
  app.js              前端逻辑
  data/
    countries.geo.json                 全球国家边界
    weather_latest.json               最新天气数据
    weather_forecast.json             16天预报
    weather_anomaly.json              气象异常
    alerts.json                       告警列表
    stage_impact_latest.json          生长阶段影响
    site_meta.json                    站点元数据
    country_crop_summary_v1.0d.json   国家作物汇总
    region_history_90d_v1.0d.json     区域90天历史
    region_forecast_summary_v1.0d.json 区域预报汇总
    water_stress_latest_v1.0e.json    水分胁迫最新
    water_stress_history_90d_v1.0e.json 水分胁迫历史
    admin1_geojson/                   省州级边界 (P1国家)
      indonesia_admin1.geojson
      malaysia_admin1.geojson
      united_states_admin1.geojson
      canada_admin1.geojson
      australia_admin1.geojson
    admin1_geojson_manifest_v1.0f2.json  Admin1 清单
    *_v0.8.1.json (别名文件)          向后兼容别名
```

## 本地预览

在 `weather_site_static/` 目录下执行:

```bash
# Python 3
python -m http.server 8090

# 然后打开浏览器访问:
# http://localhost:8090
```

> 注意: 不能直接双击 `index.html` 打开，浏览器安全策略会阻止 `fetch()` 加载本地 JSON 文件。必须通过 HTTP 服务器访问。

## CDN 依赖

以下库通过 CDN 加载，部署时需要确保网络可访问:

| 库 | CDN | 用途 |
|---|---|---|
| Leaflet 1.9.4 | unpkg.com | 地图渲染 |
| Chart.js 4.4.1 | cdn.jsdelivr.net | 图表渲染 |
| CartoDB Positron | {s}.basemaps.cartocdn.com | 地图瓦片 |

## 每日数据更新流程

网站数据由本地管线生成，更新步骤:

1. 在本地运行管线刷新脚本:
   ```powershell
   # 完整刷新（含远程数据拉取）
   .\06_weather_site_pipeline\run_weather_site_daily_refresh.ps1

   # 仅导出（跳过远程拉取，使用已有数据）
   .\06_weather_site_pipeline\run_weather_site_daily_refresh.ps1 -ExportOnly
   ```

2. 管线会自动将 11 个版本化 JSON + 6 个别名文件导出到 `07_weather_site_frontend/data/`

3. 将更新后的文件同步到部署目录:
   ```powershell
   # 复制数据文件到静态部署目录
   Copy-Item -Path "07_weather_site_frontend\data\*" -Destination "08_deploy\weather_site_static\data\" -Recurse -Force
   ```

4. 如果使用 Git 管理部署仓库:
   ```bash
   cd <deploy-repo>
   git add .
   git commit -m "data: update weather data $(date +%Y-%m-%d)"
   git push
   ```

## GitHub Pages 部署

项目已提供 GitHub Actions 工作流模板，位于:
```
08_deploy/github_pages_template/.github/workflows/deploy.yml
```

使用方式:

1. 创建一个新的 GitHub 仓库（如 `weather-site`）
2. 将 `weather_site_static/` 下所有文件复制到仓库根目录
3. 将 `deploy.yml` 复制到仓库的 `.github/workflows/` 目录
4. 推送到 GitHub，Actions 会自动构建并部署到 Pages

> 需要在仓库 Settings > Pages 中将 Source 设为 "GitHub Actions"

## Netlify 部署

1. 登录 https://app.netlify.com
2. 点击 "Add new site" > "Deploy manually"
3. 将 `weather_site_static/` 文件夹拖拽上传
4. 部署完成后会获得一个 `*.netlify.app` 域名

## Vercel 部署

1. 将 `weather_site_static/` 放入 Git 仓库
2. 在 https://vercel.com 导入仓库
3. Framework Preset 选择 "Other"
4. Root Directory 指向 `weather_site_static/`（如果不在仓库根目录）

## 安全说明

- 本静态包**不包含** DuckDB 数据库文件
- 本静态包**不包含** 原始气象数据或管线中间数据
- 本静态包**不包含** API 密钥或环境变量文件
- 本静态包**不包含** Python 管线脚本
- 所有数据均为已发布的 JSON 文件，仅包含展示所需字段

## 包体积说明

当前静态包总大小约 49 MB，其中:

- `admin1_geojson/` 约 39 MB（加拿大边界数据 27 MB 含海域边界，占大部分）
- 数据 JSON 约 10 MB
- 前端代码 (index.html + app.js) 约 42 KB

GitHub Pages 推荐仓库大小 < 100 MB，当前包在限制范围内。如需优化体积，可考虑对 GeoJSON 文件进行 topojson 压缩或使用 CDN 托管大文件。

## 部署前检查

运行提供的检查脚本验证部署包完整性:

```powershell
.\08_deploy\check_static_site.ps1
```

检查项包括: 必需文件存在性、数据文件完整性、排除文件验证等。

## 版本信息

| 组件 | 版本 |
|---|---|
| 前端 | v1.0-f4 |
| 数据 JSON | v0.8.1 (基础) + v1.0d/e (扩展) |
| Admin1 GeoJSON | v1.0-f2 (geoBoundaries simplified, ODbL 1.0) |
| 国家边界 | Natural Earth (public domain) |
