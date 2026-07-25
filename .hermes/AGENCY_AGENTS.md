# Agency Agents — CarryHub için Özel Agentlar

Bu dosya, agency-agents-router plugin'i ile kullanılabilecek CarryHub'a özel agent'ları tanımlar.

## Kullanım

Yeni bir session'da aşağıdaki tool'lar kullanılabilir:

1. **agency_agents_search**(`query`, `division?`, `limit?`) — İhtiyaca uygun agent bul
2. **agency_agents_inspect**(`slug`, `include_body?`) — Agent detayını gör
3. **agency_agents_load**(`slug`, `task?`) — Agent prompt'unu yükle
4. **agency_agents_delegate**(`slug`, `task`, `toolsets?`) — Agent'a görev devret

## CarryHub İçin Kritik Agent'lar

### Engineering (Yazılım Geliştirme)
| Agent | Slug | Kullanım |
|-------|------|----------|
| 🏗️ Backend Architect | `backend-architect` | Spring Boot, API, PostgreSQL mimarisi |
| 🗄️ Database Optimizer | `database-optimizer` | Supabase/Prisma sorgu optimizasyonu |
| 👁️ Code Reviewer | `code-reviewer` | Pull request inceleme |
| 🔗 API Platform Engineer | `api-platform-engineer` | REST/GraphQL API tasarımı |
| 🤖 AI Engineer | `ai-engineer` | AI/ML özellik entegrasyonu |
| 🔧 DevOps Automator | `devops-automator` | CI/CD, Docker, deployment |
| 📊 Data Engineer | `data-engineer` | Veri pipeline, ETL |

### Product & Design (Ürün & Tasarım)
| Agent | Slug | Kullanım |
|-------|------|----------|
| 📦 Product Manager | `product-manager` | MVP planlama, roadmap |
| 🎨 UI Designer | `ui-designer` | Arayüz tasarımı |
| 🧭 UX Architect | `ux-architect` | Kullanıcı deneyimi |

### Testing & Security (Test & Güvenlik)
| Agent | Slug | Kullanım |
|-------|------|----------|
| 🧪 QA Engineer | `qa-engineer` | Test senaryoları |
| 🛡️ Security Tester | `security-tester` | Güvenlik testi |
| ✅ Compliance Auditor | `compliance-auditor` | KVKK/uyumluluk |

### Strategy (Strateji)
| Agent | Slug | Kullanım |
|-------|------|----------|
| 🧠 Solution Architect | `solution-architect` | Sistem mimarisi kararları |
| 💰 FinOps Engineer | `finops-engineer` | Maliyet optimizasyonu |

## Örnek Kullanım

Bir backend API tasarımı için:

```
🔍 Search: agency_agents_search(query="spring boot rest api postgresql", division="engineering")
📋 Inspect: agency_agents_inspect(slug="backend-architect", include_body=true)
🎯 Delegate: agency_agents_delegate(slug="backend-architect", task="CarryHub için sevkiyat yönetimi API'sini tasarla")
```

Bir kod incelemesi için:

```
🎯 Delegate: agency_agents_delegate(slug="code-reviewer", task="app/actions/delivery.ts dosyasını güvenlik ve performans açısından incele", toolsets=["file","terminal"])
```
