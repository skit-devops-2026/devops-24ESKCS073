# BILLBOOK Monitoring

## Components
- Prometheus collects metrics every 15 seconds.
- Nginx Prometheus Exporter exposes Nginx metrics.
- BILLBOOK is served by Nginx.

## Start monitoring
Run from the repository root:

    docker compose up -d --build

## Endpoints
- Prometheus targets: http://localhost:9090/targets
- Prometheus graph: http://localhost:9090/graph
- Exporter metrics: http://localhost:9113/metrics
- BILLBOOK health: http://localhost:8081/health

## Verification
Run:

    curl -s http://localhost:9090/api/v1/targets
    curl -s http://localhost:9113/metrics

Both Prometheus targets should report healthy status.
