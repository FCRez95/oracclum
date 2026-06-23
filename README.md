# Oracclum

Oracclum was a campaign attribution and optimization platform for paid traffic teams running Taboola and Meta campaigns.

This repository is a sanitized portfolio reconstruction of production systems I built and operated as Oracclum's founder. Credentials, customer data, proprietary deployment values, and company-sensitive details have been removed or replaced. The code included here is different from the exact production code, but the architecture, service boundaries, and core engineering problems reflect the real system.

## Production Context

At peak commercial usage, the company reached:

- 15+ active client accounts using the platform at the same time commercially
- 50+ tracked campaigns
- 2.5M+ captured events per day
- 870K+ events per minute of ingestion capacity
- R$20M+ in tracked revenue

The client-account number reflects company traction at the time, not a platform concurrency limit.

The main engineering challenge was not only building a system that could ingest high-volume campaign events with low latency, process them asynchronously, and expose useful campaign intelligence. It was making that capability accessible to non-technical customers through an easy integration, so they could get the same attribution and optimization results as more technical teams without needing to build or maintain their own tracking infrastructure.

## System Overview

Oracclum was split into a client-facing application, high-throughput event ingestion APIs, and SQS-triggered workers.

```mermaid
flowchart LR
    subgraph Clients["Client Campaigns"]
        LP["Landing pages and funnels"]
        Meta["Meta campaigns"]
        Taboola["Taboola campaigns"]
    end

    subgraph Ingestion["Click Ingestion"]
        TaboolaAPI["services/tbl-ingestion-api"]
        MetaAPI["services/clicks-meta-api (historical)"]
    end

    subgraph Queues["AWS SQS"]
        TaboolaQueue["Taboola click queue"]
        MetaDBQueue["Meta click persistence queue"]
        MetaCAPIQueue["Meta CAPI queue"]
    end

    subgraph Workers["AWS Lambda Workers"]
        TaboolaWriter["lambdas/taboola-clicks-writer"]
        MetaWriter["lambdas/meta-clicks-writer"]
        MetaSender["lambdas/meta-clicks-sender"]
    end

    subgraph App["Main Application"]
        Front["app/front - Next.js"]
        Back["app/back - Node.js API"]
        DB[("MySQL / RDS")]
    end

    Taboola --> LP
    Meta --> LP
    LP --> TaboolaAPI
    LP --> MetaAPI

    TaboolaAPI --> TaboolaQueue
    MetaAPI --> MetaDBQueue
    MetaAPI --> MetaCAPIQueue

    TaboolaQueue --> TaboolaWriter
    MetaDBQueue --> MetaWriter
    MetaCAPIQueue --> MetaSender

    TaboolaWriter --> DB
    MetaWriter --> DB
    MetaSender --> MetaGraph["Meta Conversions API"]

    Front --> Back
    Back --> DB
    Back --> TaboolaExternal["Taboola API"]
    Back --> MetaExternal["Meta Marketing API"]
```

The current repository restores the Taboola ingestion boundary as
`services/tbl-ingestion-api`. The Meta ingestion service and Lambda workers are
still represented as historical system context until their source folders are
restored.

## How The Pieces Worked Together

The main app let customers connect ad-provider accounts, create campaigns, configure tracking, and review performance by campaign, site, ad, adset, and funnel step. The frontend used Next.js with server-side API routes acting as a BFF layer over the Node.js backend. The backend handled authentication, user/account management, campaign setup, provider integrations, and reporting queries.

The Clicks APIs were kept separate from the main backend because they served a different workload. Their job was to accept campaign events quickly, validate each `click_auth` token from an in-memory campaign map, enrich events with the internal campaign ID, and enqueue work to SQS. Events with the same click ID represented shards of the same click progression, so the APIs distributed them to the same worker during a short batching window. That worker could aggregate duplicate or partial events before dispatching to SQS, preserving the strongest observed signals and reducing queue writes without adding latency to the request path. In-memory campaign resolution avoided a database read on every click, and the batching model kept the ingestion path resilient during traffic spikes.

The Lambda workers consumed SQS batches and persisted click progress to MySQL. They deduplicated events by click ID and used upsert semantics so partial events could arrive in any order without losing stronger funnel progress. For example, a later event could fill missing ad or site metadata, while funnel step fields kept the greatest observed value.

For Meta campaigns, the ingestion API also fanned events out to a separate queue for Meta Conversions API delivery. Same-click events were aggregated only for the persistence queue; CAPI events were sent to their own SQS queue without that aggregation step. The sender Lambda loaded campaign pixel credentials from MySQL and dispatched validated events to Meta in parallel, while returning per-message failures to SQS so failed records could be retried.

## Event Flows

### Taboola Click Tracking

```mermaid
sequenceDiagram
    participant Campaign as Client funnel
    participant API as tbl-ingestion-api
    participant SQS as AWS SQS
    participant Lambda as taboola-clicks-writer
    participant DB as MySQL
    participant App as Oracclum app

    Campaign->>API: POST /clicks with click_auth and funnel data
    API->>API: Resolve click_auth from in-memory map
    API->>API: Aggregate same-click events during batching window
    API->>SQS: Enqueue normalized click progression event
    API-->>Campaign: 202 Accepted
    SQS->>Lambda: Deliver batch
    Lambda->>Lambda: Deduplicate by click ID
    Lambda->>DB: Batch upsert into clicks_taboola
    App->>DB: Query campaign summaries and drilldowns
```

### Meta Click Tracking And CAPI Dispatch

```mermaid
sequenceDiagram
    participant Campaign as Client funnel
    participant API as clicks-meta-api
    participant DBQueue as Persistence SQS
    participant CAPIQueue as Meta CAPI SQS
    participant Writer as meta-clicks-writer
    participant Sender as meta-clicks-sender
    participant DB as MySQL
    participant Meta as Meta Conversions API

    Campaign->>API: POST /clicks with event_id, source URL, user agent, IP, funnel step
    API->>API: Resolve click_auth and validate Meta event shape
    API->>CAPIQueue: Enqueue raw conversion event
    API->>API: Aggregate same-click events for persistence during batching window
    API->>DBQueue: Enqueue aggregated persistence event
    API-->>Campaign: 202 Accepted
    DBQueue->>Writer: Deliver batch
    Writer->>DB: Batch upsert into clicks_meta
    CAPIQueue->>Sender: Deliver batch
    Sender->>DB: Load campaign pixel access
    Sender->>Meta: Send server-side event
```

## Funnel Semantics

Tracked events represented progressive funnel visibility rather than a single linear request. Each click was represented by a progression object that accumulated what Oracclum had observed about the visitor and their funnel movement. Incoming events filled that object's fields over time: campaign metadata, source and click identifiers, funnel-step state, checkout visibility, and eventually revenue when a purchase or revenue signal was available.

- `step_1`, `step_2`, and `step_3` represented intermediate milestones configured in the customer's funnel.
- `checkout` represented the checkout milestone.
- Each funnel step field could be `none`, `page_view`, or `view_content`, indicating how far the visitor progressed within that specific step.
- Revenue completed the click progression when Oracclum received a purchase or revenue signal for the click.

The click writers were designed around duplicate and partial event delivery. Instead of treating each event as a full replacement, the workers merged events by click ID and preserved the most advanced observed step state.

## Repository Layout

This monorepo is organized by runtime boundary. The current public portfolio
snapshot includes the main application frontend and backend, plus the first
restored ingestion service:

```text
app/
  front/                       Next.js client application and BFF routes
  back/                        Node.js backend API for auth, campaigns, integrations, and reporting

services/
  tbl-ingestion-api/            Go API for high-throughput Taboola click ingestion
```

The original production system also included additional ingestion services,
Lambda workers, and operations/product documentation. Those runtime boundaries
are described here for system context, but their source folders have not all
been restored into this repository snapshot yet:

```text
services/
  clicks-meta-api/             Go API for Meta click ingestion and CAPI queue fanout

lambdas/
  taboola-clicks-writer/       SQS-triggered Go worker that writes Taboola clicks to MySQL
  meta-clicks-writer/          SQS-triggered Go worker that writes Meta clicks to MySQL
  meta-clicks-sender/          SQS-triggered Go worker that sends Meta CAPI events

docs/
  architecture/                System diagrams and implementation notes
  operations/                  Deployment, scaling, observability, and incident notes
  product/                     Product behavior, funnels, and user workflows
```

## Engineering Highlights

- End-to-end product ownership across frontend, backend, infrastructure, deployment, integrations, and customer support.
- High-throughput Go ingestion services with in-memory campaign-token resolution to avoid per-event database reads.
- SQS-based buffering between ingestion and persistence to absorb burst traffic and isolate failures.
- Batch-oriented Lambda workers with deduplication and idempotent MySQL upserts.
- Separate Meta CAPI dispatch pipeline with per-message retry behavior.
- Full-stack client dashboard for campaign creation, provider setup, funnel analysis, and campaign optimization.
- Practical service boundaries between user-facing workflows and event-processing workloads.

## Documentation Roadmap

This top-level README explains the system at portfolio-review depth. The
included application and service folders each have their own README and
supporting docs. As additional runtime boundaries are moved into this
repository, they should receive their own documentation covering:

- Service purpose and ownership boundary
- Local setup
- Environment variables
- API contracts
- Data models
- Failure modes and retry behavior
- Tests
- Deployment notes

## Public Portfolio Note

This repository is intended to demonstrate production engineering judgment, written communication, and product ownership. It is not a turnkey open-source release of the original Oracclum platform.
