(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ChipCompliance = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const POLICIES = [
    { id: 'ec-2023-10-17', date: '2023-10-17', issuer: '美国商务部 BIS', title: '先进计算与半导体制造设备出口管制新规', scope: '芯片/设备', level: 'high', summary: '扩展管制范围，涵盖 A100/H100 等先进 AI 芯片及制造设备，限制向中国等目的地出口。', impact: '直接限制 NVIDIA H100/A100 对华销售，推动国产替代与云租赁 workaround。' },
    { id: 'ec-2024-01-19', date: '2024-01-19', issuer: '美国商务部 BIS', title: 'AI 芯片最终用户与云服务出口管制更新', scope: '云/AI', level: 'high', summary: '针对 AI 模型权重与云算力服务的出口管制，限制通过云租赁绕过芯片管制。', impact: '云服务商需做最终用户尽职调查，模型权重出口受限。' },
    { id: 'ec-2025-01-13', date: '2025-01-13', issuer: '美国商务部 BIS', title: 'AI 扩散框架 (AI Diffusion Framework)', scope: '全球', level: 'high', summary: '将全球分为 Tier 1/2/3，限制 Tier 3 国家获取先进 AI 芯片与模型权重。', impact: 'Tier 3 国家（含中国）获取先进算力配额受限，Tier 2 需申请许可。' },
    { id: 'ec-2025-09', date: '2025-09-01', issuer: '美国商务部 BIS', title: 'B300/GB300 出口许可要求更新', scope: '芯片', level: 'medium', summary: '对 Blackwell 架构 B300/GB300 系列芯片实施出口许可要求。', impact: 'NVIDIA 最新 AI 芯片出口需逐案审查，交付周期延长。' },
    { id: 'eu-2025', date: '2025-03-15', issuer: '欧盟', title: '欧盟芯片法案 (European Chips Act) 补贴与供应链韧性', scope: '欧盟', level: 'medium', summary: '向欧盟半导体制造与设计提供补贴，降低对亚洲供应链依赖。', impact: '欧盟本土产能提升，但短期内仍依赖 TSMC。' },
    { id: 'cn-2024', date: '2024-12-03', issuer: '中国商务部', title: '对美出口管制反制措施（镓/锗/锑）', scope: '原材料', level: 'medium', summary: '对镓、锗、锑等关键矿产实施出口许可，反制美国芯片管制。', impact: '影响美国半导体制造原材料供应，推高全球成本。' },
    { id: 'jp-2024', date: '2024-07-23', issuer: '日本 METI', title: '先进半导体制造设备出口管制', scope: '设备', level: 'medium', summary: '限制 EUV/DUV 等先进光刻设备出口。', impact: 'ASML、Tokyo Electron 受限，影响中国先进制程产能。' },
    { id: 'nl-2024', date: '2024-09-06', issuer: '荷兰政府', title: 'ASML 高端 DUV 设备出口许可收紧', scope: '设备', level: 'medium', summary: '收紧 NXT:2000i 等高端 DUV 设备对华出口许可。', impact: '中国成熟制程以上产能扩张受限。' }
  ];
  const CHIPS = [
    { id: 'h100', name: 'NVIDIA H100', vendor: 'NVIDIA', arch: 'Hopper', perf: 989, tdp: 700, controlled: true, tier: 'high', desc: '旗舰 AI 训练/推理芯片，受出口管制' },
    { id: 'a100', name: 'NVIDIA A100', vendor: 'NVIDIA', arch: 'Ampere', perf: 312, tdp: 400, controlled: true, tier: 'high', desc: '上代旗舰，管制名单内' },
    { id: 'b300', name: 'NVIDIA B300', vendor: 'NVIDIA', arch: 'Blackwell', perf: 1440, tdp: 1000, controlled: true, tier: 'high', desc: '最新一代，出口许可要求' },
    { id: 'mi300x', name: 'AMD MI300X', vendor: 'AMD', arch: 'CDNA3', perf: 1307, tdp: 750, controlled: true, tier: 'high', desc: 'AMD 旗舰 AI 芯片，受管制' },
    { id: 'ascend910b', name: '华为昇腾 910B', vendor: 'Huawei', arch: 'Ascend', perf: 320, tdp: 310, controlled: false, tier: 'mid', desc: '国产替代主力，不受美国直接管制' },
    { id: 'tpu-v5', name: 'Google TPU v5', vendor: 'Google', arch: 'TPU', perf: 459, tdp: 300, controlled: true, tier: 'mid', desc: '云厂商自研，出口受限' },
    { id: 'gaudi3', name: 'Intel Gaudi 3', vendor: 'Intel', arch: 'Gaudi', perf: 1835, tdp: 600, controlled: true, tier: 'high', desc: 'Intel AI 加速器' },
    { id: 'cambricon', name: '寒武纪 MLU590', vendor: 'Cambricon', arch: 'MLU', perf: 256, tdp: 350, controlled: false, tier: 'mid', desc: '国产 AI 芯片' }
  ];
  const NODES = [
    { id: 'tsmc', name: '台积电 (TSMC)', type: '制造', country: '台湾', risk: 'high', desc: '全球先进制程 (>7nm) 主要代工厂，地缘政治风险高' },
    { id: 'samsung', name: '三星 (Samsung)', type: '制造', country: '韩国', risk: 'medium', desc: '先进制程备选，但产能有限' },
    { id: 'intel-foundry', name: 'Intel Foundry', type: '制造', country: '美国', risk: 'medium', desc: '美国本土先进制程，产能爬坡中' },
    { id: 'smic', name: '中芯国际 (SMIC)', type: '制造', country: '中国', risk: 'high', desc: '中国先进制程主力，受设备管制限制' },
    { id: 'asml', name: 'ASML', type: '设备', country: '荷兰', risk: 'high', desc: 'EUV/DUV 光刻机唯一供应商，出口管制核心' },
    { id: 'tokyo-electron', name: 'Tokyo Electron', type: '设备', country: '日本', risk: 'medium', desc: '刻蚀/薄膜设备供应商' },
    { id: 'applied-materials', name: 'Applied Materials', type: '设备', country: '美国', risk: 'medium', desc: '薄膜沉积/刻蚀设备' },
    { id: 'lam-research', name: 'Lam Research', type: '设备', country: '美国', risk: 'medium', desc: '刻蚀设备' },
    { id: 'sk-hynix', name: 'SK Hynix', type: '存储', country: '韩国', risk: 'medium', desc: 'HBM 高带宽内存主要供应商' },
    { id: 'micron', name: 'Micron', type: '存储', country: '美国', risk: 'low', desc: '美国本土存储供应商' },
    { id: 'nvidia', name: 'NVIDIA', type: '设计', country: '美国', risk: 'high', desc: 'GPU 架构设计，受出口管制' },
    { id: 'amd', name: 'AMD', type: '设计', country: '美国', risk: 'high', desc: 'GPU/CPU 设计' },
    { id: 'qualcomm', name: 'Qualcomm', type: '设计', country: '美国', risk: 'medium', desc: '移动/边缘 AI 芯片' }
  ];

  function riskLevel(score) {
    if (score >= 70) return '高';
    if (score >= 40) return '中';
    return '低';
  }

  function assessChip(chipId, destination, useCase) {
    const chip = CHIPS.find(c => c.id === chipId);
    if (!chip) return null;
    let score = 0;
    const factors = [];
    if (chip.controlled) { score += 40; factors.push('受出口管制芯片'); }
    if (chip.tier === 'high') { score += 20; factors.push('高性能层级'); }
    const restricted = ['中国', '俄罗斯', '伊朗', '朝鲜', '中国澳门'];
    if (restricted.includes(destination)) { score += 30; factors.push('受限目的地'); }
    if (useCase && /军事|defense|weapon/i.test(useCase)) { score += 20; factors.push('敏感最终用途'); }
    score = Math.min(100, score);
    const level = riskLevel(score);
    const compliance = level === '高' ? '需申请出口许可，大概率被拒' : level === '中' ? '需最终用户尽职调查，可能获许可' : '低风险，可直接出口';
    return { chip, destination, useCase, score, level, factors, compliance };
  }

  function assessSupplyChain(nodeIds) {
    const nodes = (nodeIds || []).map(id => NODES.find(n => n.id === id)).filter(Boolean);
    const highRisk = nodes.filter(n => n.risk === 'high').length;
    const score = Math.min(100, highRisk * 25 + nodes.length * 5);
    return { nodes, highRiskCount: highRisk, score, level: riskLevel(score), recommendations: highRisk > 0 ? ['建议建立备选供应商', '加强地缘政治监控', '考虑本地化产能'] : ['维持现状，定期复评'] };
  }

  function searchPolicies(q) {
    const ql = (q || '').toLowerCase();
    if (!ql) return POLICIES;
    return POLICIES.filter(p => p.title.toLowerCase().includes(ql) || p.issuer.toLowerCase().includes(ql) || p.summary.toLowerCase().includes(ql) || p.scope.toLowerCase().includes(ql));
  }

  function searchChips(q) {
    const ql = (q || '').toLowerCase();
    if (!ql) return CHIPS;
    return CHIPS.filter(c => c.name.toLowerCase().includes(ql) || c.vendor.toLowerCase().includes(ql) || c.desc.toLowerCase().includes(ql) || c.arch.toLowerCase().includes(ql));
  }

  function topPolicies(n) { return POLICIES.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, n || 5); }

  function buildReport(chipId, destination, useCase) {
    const a = assessChip(chipId, destination, useCase);
    if (!a) return null;
    const lines = [];
    lines.push(`# 芯片出口合规评估报告`);
    lines.push('');
    lines.push(`**芯片**：${a.chip.name} (${a.chip.vendor})`);
    lines.push(`**目的国**：${destination}`);
    lines.push(`**最终用途**：${useCase || '未指定'}`);
    lines.push(`**风险评分**：${a.score}/100`);
    lines.push(`**风险等级**：${a.level}`);
    lines.push(`**合规建议**：${a.compliance}`);
    lines.push('');
    lines.push(`## 风险因素`);
    a.factors.forEach(f => lines.push(`- ${f}`));
    lines.push('');
    lines.push(`## 相关管制政策`);
    POLICIES.filter(p => p.level === 'high').forEach(p => lines.push(`- ${p.date} ${p.issuer}：${p.title}`));
    lines.push('');
    lines.push(`## 供应链建议`);
    lines.push('- 建立多源供应策略，降低单一节点依赖');
    lines.push('- 定期复评出口管制清单更新');
    lines.push('- 与合规律师确认最终用户尽职调查要求');
    return lines.join('\n');
  }

  function compareChips(ids) {
    return (ids || []).map(id => CHIPS.find(c => c.id === id)).filter(Boolean).map(c => ({ chip: c, controlled: c.controlled, tier: c.tier }));
  }

  return {
    POLICIES, CHIPS, NODES, assessChip, assessSupplyChain, searchPolicies, searchChips, topPolicies, buildReport, compareChips, riskLevel
  };
});