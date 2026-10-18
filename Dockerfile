FROM nginx:alpine

ARG COMMIT_SHA=unknown
ENV COMMIT_SHA=${COMMIT_SHA}
ENV NGINX_ENVSUBST_FILTER=COMMIT_SHA

COPY index.html add-expense.html budget.html ledger.html insights.html shared.html /usr/share/nginx/html/

COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
